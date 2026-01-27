/**
 * Takes a loader as input and returns a loader which also returns a promise
 * which will resolve to the loaded value.
 * 
 * The reason why loaders are not async by default is that in many cases loaders
 * can callback instantly which avoid the need to wait until next tick to run the
 * code. This is MUCH faster.
 * @param {function} loader 
 * @returns The returned loader has a member `loader` which is the inner loader.
 */
export default function createPromisedLoader(loader) {
	let wrappingLoader = async function(name, callback) {
		let pr = new Promise((resolve, reject) => {
			wrappingLoader.loader(name, (data) => {
				resolve(data)
				if(callback) {
					callback(data)
				}
			})

		})
		return pr
	}
	wrappingLoader.loader = loader
	return wrappingLoader
}