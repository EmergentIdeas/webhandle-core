import isStream from "./is-stream.mjs"
import filterLog from "filter-log"
import PausingTransform from 'pausing-transform'

let log = filterLog('webhandle', { component: 'response filter' })

export default function createResponseFilters(webhandle) {
	function responseFiltersRouter(req, res, next) {

		let responseFilters = []
		res.responseFilters = responseFilters

		/**
		 * Adds a filter to the rendered output.
		 * @param {stream|function} filter A stream or function will transforms the rendered content into different rendered content.
		 */
		res.addFilter = function (filter) {
			if (isStream(filter)) {
				responseFilters.push(filter)
			}
			else if (typeof filter === 'function') {
				// We want to set any transform we create to run so it wouldn't buffer the output but would not
				// want to do this to a stream somebody gave us.
				let transform = new PausingTransform(filter)
				transform.run()
				responseFilters.push(transform)
			}
		}

		res.oldRender = res.render

		res.connectFilters = function (tailStream) {
			let streams = [...responseFilters]
			let lastStream

			// Figure out where this content is going. If we have a callback, it means the caller
			// expects a string, so we'll create a destination stream.
			lastStream = tailStream

			// Pipe all the streams, one to another
			while (streams.length > 0) {
				let back = streams.pop()

				// We don't want to automatically set these to run if one of them requires buffering.

				back.pipe(lastStream)
				lastStream = back
			}

			return lastStream
		}
		res.disconnectFilters = function () {
			// If we have a callback that means we'll need to unpipe all these streams
			// because we may have to use them again.
			responseFilters.forEach(stream => {
				stream.unpipe()

				if (stream instanceof PausingTransform) {
					// let's make sure they'll pass data. Unpiping them automatically pauses them.
					// This MIGHT be a problem at some point if they use render with a callback
					// and then try to render to the response, in that one of the stream may not
					// buffer all the output before operating on it.
					stream.run()
				}
				stream.resume()
			})
		}

		res.internalRender = function (name, data, callback, destination) {
			return webhandle.render(name, data, callback, destination)
		}

		res.render = function (name, data, callback) {
			if (typeof data === 'function') {
				callback = data
				data = undefined
			}

			try {
				let tailStream = !!callback ? new PausingTransform() : this
				let headStream = this.connectFilters(tailStream)

				// Figure out what data we want to use. The passed data, or the response locals
				data = data || res.locals


				return res.internalRender(name, data, (err, content) => {
					if (callback) {
						if (headStream instanceof PausingTransform) {
							headStream.run()
						}
						// We don't really want to end() the stream, which would make sense
						// except that we may need to reuse these transformers
						headStream.uncork()

						// If we have a callback that means we'll need to unpipe all these streams
						// because we may have to use them again.
						res.disconnectFilters()

						callback(err, tailStream.pausedData)
					}
					else {
						// If we're writing to the response, then we need to call end so the request finishes
						headStream.end()
					}

				}, headStream)
			}
			catch (e) {
				log.error({
					err: e,
					error: e.message,
					line: e.lineNumber,
					col: e.columnNumber,
					stack: e.stack
				})
				if (callback) {
					callback(e)
				}
			}


		}

		next()
	}

	return responseFiltersRouter
}