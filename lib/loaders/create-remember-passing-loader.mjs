
/**
 * Wraps a loader with a loader that remembers if the wrapped loader chooses
 * to pass undefined. Basically, if the loader can find what's asked for, that's
 * remembered and the inner loader isn't asked again.
 * 
 * This can be useful for loaders which somewhat expensive to run but which
 * contain a fixed set of content, as would be the case if you were serving
 * files from a library. 
 * @param {function} loader
 */
export default function createRememberPassingLoader(loader) {
	let missedKeys = new Set()
	let foundKeys = new Set()

	let wrapperLoader = function(name, callback) {
		if(missedKeys.has(name)) {
			if(callback) {
				callback(undefined)
			}
			return
		}
		
		loader(name, (data) => {
			if(data === undefined) {
				missedKeys.add(name)	
			}
			else {
				foundKeys.add(name)
			}
			if(callback) {
				callback(data)
			}
		})
	}

	wrapperLoader.keys = missedKeys
	wrapperLoader.foundKeys = foundKeys
	wrapperLoader.loader = loader
	
	wrapperLoader.getStatus = function(key) {
		if(missedKeys.has(key)) {
			return false
		}
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
