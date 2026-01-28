import removeFrontSlash from "./remove-front-slash.mjs"

/**
 * Takes a loader and a prefix. If the name contains the prefix, the prefix is removed
 * before it is passed to the internal loader. If the name does not start with the prefix,
 * undefined is passed to the callback.
 * @param {function} loader 
 * @param {object} urlPrefix
 * @returns The returned loader has members `loader` for the original/internal loader
 * and `urlPrefix` for the prefix being used
 */
export default function createPrefixRemovingLoader(loader, urlPrefix) {
	let prefixLoader = function (name, callback) {
		let modName = removeFrontSlash(name)
		let modPrefix = removeFrontSlash(prefixLoader.urlPrefix)

		
		if(modName.startsWith(modPrefix)) {
			modName = modName.substring(modPrefix.length)
			modName = removeFrontSlash(modName)
			prefixLoader.loader(modName, callback)
		}
		else {
			if(callback) {
				callback(undefined)
			}
		}
	}
	prefixLoader.loader = loader
	prefixLoader.urlPrefix = urlPrefix

	return prefixLoader
}