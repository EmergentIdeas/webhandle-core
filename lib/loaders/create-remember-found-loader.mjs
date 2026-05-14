
/**
 * Wraps a loader with a loader that remembers if the wrapped loader chooses
 * to pass undefined. Basically, if the loader does find what's asked for, that's
 * remembered and recorded so that just this loader can be asked next time.
 * 
 * This can be useful for loaders which can have content added to them.
 *  * @param {function} loader
 */
export default function createRememberFoundLoader(loader) {
	let foundKeys = new Set()

	let wrapperLoader = function(name, callback) {
		loader(name, (data) => {
			if(data !== undefined) {
				foundKeys.add(name)
			}
			if(callback) {
				callback(data)
			}
		})
	}

	wrapperLoader.foundKeys = foundKeys
	wrapperLoader.loader = loader
	
	wrapperLoader.getStatus = function(key) {
		if(foundKeys.has(key)) {
			return true
		}
		if(loader.getStatus) {
			return loader.getStatus(key)
		}
		return undefined
	}

	wrapperLoader.getValue = function(key) {
		if(loader.getValue) {
			return loader.getValue(key)
		}
		return undefined
	}
	
	return wrapperLoader
}
