import isStream from "./is-stream.mjs"
import filterLog from "filter-log"
import PausingTransform from 'pausing-transform'

let log = filterLog('webhandle', { component: 'response filter' })

export default function createResponseFilters(webhandle) {
	function requestFiltersRouter(req, res, next) {

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
				let transform = new PausingTransform(filter)
				transform.run()
				responseFilters.push(transform)
			}

		}

		res.oldRender = res.render

		res.render = function (name, data, callback) {
			try {
				let streams = [...responseFilters]
				let lastStream
				let firstStream
				
				// Figure out where this content is going. If we have a callback, it means the caller
				// expects a string, so we'll create a destination stream.
				if(callback) {
					firstStream = lastStream = new PausingTransform()
				}	
				else {
					// Otherwise we can write directly to res stream
					firstStream = lastStream = res
				}

				// Pipe all the streams, one to another
				while (streams.length > 0) {
					let back = streams.pop()
					back.pipe(lastStream)
					lastStream = back
				}

				// Figure out what data we want to use. The passed data, or the response locals
				data = data || res.locals
				

				return webhandle.render(name, data, (err, content) => {
					if(callback) {
						if(lastStream instanceof PausingTransform) {
							lastStream.run()
						}
						else {
							// We don't really want to end() the stream, which would make sense
							// except that we may need to reuse these transformers
							lastStream.uncork()
						}
						
						// If we have a callback that means we'll need to unpipe all these streams
						// because we may have to use them again.
						let streams = [...responseFilters]
						let last = firstStream
						
						while (streams.length > 0) {
							let back = streams.pop()
							back.unpipe(last)
							last = back
						}
						
						callback(err, firstStream.pausedData)
					}
					else {
						// If we're writing to the response, then we need to call end so the request finishes
						lastStream.end()
					}

				}, lastStream)
			}
			catch (e) {
				log.error({
					err: e,
					error: e.message,
					line: e.lineNumber,
					col: e.columnNumber,
					stack: e.stack
				})
				if(callback) {
					callback(e)
				}
			}


		}

		next()
	}

	return requestFiltersRouter
}