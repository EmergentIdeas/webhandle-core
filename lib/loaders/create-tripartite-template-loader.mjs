
export default function createTripartiteFileLoader(sink) {
	return function loader(name, callback) {
		try {
			sink.read(name + '.tri', (err, buffer) => {
				if (!err && buffer) {
					if (callback) {
						return callback(buffer)
					}
				}
				sink.read(name + '.html', (err, buffer) => {
					if (!err && buffer) {
						if (callback) {
							return callback(buffer)
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
}