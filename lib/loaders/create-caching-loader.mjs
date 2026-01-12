
export default function createCachingLoader(loader, cache) {
	let cachingLoader = function (name, callback) {
		if (cache && name in cache) {
			return callback(cache[name])
		}
		loader(name, (data) => {
			if (cache) {
				cache[name] = data
			}
			callback(data)
		})
	}
	cachingLoader.loader = loader
	cachingLoader.cache = cache

	return cachingLoader
}