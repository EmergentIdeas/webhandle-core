
export default function createTripartiteFileLoader(sink) {
	let loader = function loader(name, callback) {
		try {
			sink.read(name + '.tri', (err, buffer) => {
				if (!err && buffer) {
					if (callback) {
						return callback(buffer.toString())
					}
				}
				sink.read(name + '.html', (err, buffer) => {
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