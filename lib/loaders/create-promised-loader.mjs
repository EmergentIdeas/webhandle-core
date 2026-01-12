export default function createPromisedLoader(loader) {
	return async function(name, callback) {
		let pr = new Promise((resolve, reject) => {
			loader(name, (data) => {
				resolve(data)
				if(callback) {
					callback(data)
				}
			})

		})
		return pr
	}
}