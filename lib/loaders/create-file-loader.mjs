
export default function createFileSinkLoader(sink) {
	return function loader(path, callback) {
		try {
			sink.read(path, (err, buffer) => {
				if (!err && buffer) {
					if (callback) {
						return callback(buffer)
					}
				}
				else if (callback) {
					callback(undefined)
				}
			})
		}
		catch (e) {
			if (callback) {
				callback(undefined)
			}
		}
	}
}