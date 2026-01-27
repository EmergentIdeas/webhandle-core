
/**
 * Creates a loader based on a File Sink (or object following the sink pattern)
 * which loads files where the `name` is a path relative to the root of the sink.
 * Values from this loader are Buffer objects.
 * @param {FileSink} sink The source of file data
 * @returns 
 */
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