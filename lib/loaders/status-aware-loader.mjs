
export default {
	/**
	 * Returns true if the loader is know to at least potentially have access to this resource, false if
	 * thought not to have access, undefined if unknown.
	 * @param {string} key 
	 * @returns 
	 */
	getStatus(key) {
		return undefined
	},
	/**
	 * Returns the value of the resource if it has been loaded and cached, otherwise undefined.
	 * Returning undefined does NOT mean that the loader can't load the resource, just that it
	 * doesn't have a cached copy available.
	 * @param {string} key 
	 * @returns 
	 */
	getValue(key) {
		return undefined
	}
}