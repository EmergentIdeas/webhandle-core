
/**
 * Wraps a loader with a loader that remembers if the wrapped loader chooses
 * to pass undefined. Basically, if the loader can find what's asked for, that's
 * remember and the inner loader isn't asked again.
 * 
 * This can be useful for loaders which somewhat expensive to run but which
 * contain a fixed set of content, as would be the case if you were serving
 * files from a library. 
 * @param {function} loader
 */
export default function createRememberPassingLoader(loader) {
	let keys = new Set()

	let wrapperLoader = function(name, callback) {
		if(keys.has(name)) {
			if(callback) {
				callback(undefined)
			}
			return
		}
		
		loader(name, (data) => {
			if(data === undefined) {
				keys.add(name)	
			}
			if(callback) {
				callback(data)
			}
		})
	}

	wrapperLoader.keys = keys
	wrapperLoader.loader = loader
	
	return wrapperLoader
}
