
export default function createCompositeLoader(...loaders) {
	return function(name, callback) {
		let loaderTotal = loaders.length
		let loaderCount = 0
		let replied = false
		function handle(data) {
			loaderCount++
			if(replied) {
				return
			}
			if(data !== undefined) {
				replied = true
				if(callback) {
					callback(data)
				}
				// If there was a callback, we told them about the data. Their way though
				// we can stop processing
				return
			}
			if(!replied) {
				if(loaderCount >= loaderTotal || loaderCount >= loaders.length) {
					// Somebody shouldn't be adding/removing loaders, but if they are,
					// we want to be sure we return something, even though that something
					// will be wrong.
					
					// Either way, we didn't get told about data in time, so we'll let the 
					// callback now if there is one
					if(callback) {
						callback(undefined)
					}
				}
			}
		}
		loaders.forEach(loader => loader(name, handle))
	}
}