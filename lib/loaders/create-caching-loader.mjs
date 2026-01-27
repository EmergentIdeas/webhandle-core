
/**
 * Takes a loader and an object to be used as a key value cache and returns
 * a new loader which will remember any result given by the passed loader.
 * This includes `undefined` indicating that the loader had no value to
 * present.
 * @param {function} loader 
 * @param {object} cache 
 * @returns The returned loader has members `loader` for the original/internal loader
 * and `cache` for the cache object being used
 */
export default function createCachingLoader(loader, cache) {
	let cachingLoader = function (name, callback) {
		if (cachingLoader.cache && name in cachingLoader.cache) {
			return callback(cachingLoader.cache[name])
		}
		loader(name, (data) => {
			if (cachingLoader.cache) {
				cachingLoader.cache[name] = data
			}
			callback(data)
		})
	}
	cachingLoader.loader = loader
	cachingLoader.cache = cache

	return cachingLoader
}