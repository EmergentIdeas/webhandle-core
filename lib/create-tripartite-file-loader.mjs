
export default function createTripartiteFileLoader(sink) {
	return async function loader(name) {
		let buffer
		try {
			buffer = await sink.read(name + '.tri')
		}
		catch(e) {
			try {
				buffer = await sink.read(name + '.html')
			}
			catch(e) {}
		}
		let fileData = buffer ? buffer.toString() : null
		return fileData
	}
}