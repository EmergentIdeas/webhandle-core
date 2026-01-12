import FileSink from 'file-sink'

export default function createCachingLoaderFactory(loader, fileCache) {
	let factoryFileCache = fileCache
	let factory = function(fileCache) {
		if(fileCache === undefined) {
			// if the file cache is undefined (not null), we'll know they didn't pass
			// a file cache and we should use whatever was declared for the factory
			fileCache = factoryFileCache
		}

		let cachingLoader = function(name, callback) {
			if(fileCache && name in fileCache) {
				return callback(fileCache[name])
			}
			loader(name).then((fileData) => {
				if(fileCache) {
					fileCache[name] = fileData
				}
				callback(fileData)
			})
		}
		cachingLoader.loader = loader
		cachingLoader.cache = fileCache
		
		return cachingLoader
	}
	factory.cache = fileCache
	return factory
}
