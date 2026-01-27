/**
 * Creates a loader like the file loader but will attempt to add '.tri' and
 * '.html' to the end of the name when looking for files. Additionally, this
 * loader converts the buffer to a string before the callback.
 * @param {FileSink} sink 
 * @returns The returned loader has a member `sink` which determines which sink will be used.
 */
export default function createTripartiteFileLoader(sink) {
	let loader = function loader(name, callback) {
		try {
			loader.sink.read(name + '.tri', (err, buffer) => {
				if (!err && buffer) {
					if (callback) {
						return callback(buffer.toString())
					}
				}
				loader.sink.read(name + '.html', (err, buffer) => {
					if (!err && buffer) {
						if (callback) {
							return callback(buffer.toString())
						}
					}
					else if (callback) {
						callback(undefined)
					}

				})
			})
		}
		catch (e) {
			if (callback) {
				callback(undefined)
			}
		}
	}
	loader.sink = sink
	return loader
}