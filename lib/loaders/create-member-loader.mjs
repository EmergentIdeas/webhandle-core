import removeFrontSlash from "./remove-front-slash.mjs"

/**
 * Creates a loader function which calls back with the value of a member of `dataSource`
 * if `dataSource` has a member matching `name`
 * @param {object} dataSource 
 * @returns The loader returned has a member `dataSource` specifying the object to use.
 */
export default function createMemberLoader(dataSource) {
	let loader = function loader(name, callback) {
		try {
			let value = undefined
			if(name in loader.dataSource) {
				value = loader.dataSource[name]
			}
			else {
				name = removeFrontSlash(name)
				if(name in loader.dataSource) {
					value = loader.dataSource[name]
				}
			}

			if(callback) {
				callback(value)
			}
		}
		catch (e) {
			if (callback) {
				callback(undefined)
			}
		}
	}
	loader.dataSource = dataSource
	return loader
}