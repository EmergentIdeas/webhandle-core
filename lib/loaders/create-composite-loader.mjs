/**
 * Takes one or more arguments which are loaders and returns a single loader which
 * will ask all the passed loaders for a value, returning the first non-undefined
 * value. "First" is a little less than exact since loaders may need asynchronous calls
 * to find their values.
 * @param  {...function} loaders 
 * @returns The loader returned has a member `loaders` holding the loaders that will
 * be run.
 */
export default function createCompositeLoader(...loaders) {
	let loader = function(name, callback) {
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
		loader.loaders.forEach(loader => loader(name, handle))
	}
	loader.loaders = loaders
	return loader
}