
/**
 * Wraps a router with a router that remembers if the wrapped router chooses
 * too call next instead of fulfilling the request. On subsequent requests of
 * the same path this router will just call next() instead of invoking the
 * underlying router.
 * 
 * This can be useful for routers which somewhat expensive to run but which
 * contain a fixed set of content, as would be the case if you were serving
 * files from a library. 
 * @param {function} router 
 * @param {function} [urlHash] Takes a request as the argument and returns
 * a string which represents what this request is asking for. By default,
 * this will be the path of the request.
 */
export default function createRememberPassingRouter(router, urlHash) {
	let keys = new Set()
	urlHash = urlHash || pathHash

	let wrapper = function(req, res, next) {
		let key = urlHash(req)
		if(keys.has(key)) {
			return next()
		}
		
		router(req, res, () => {
			keys.add(key)	
			next()
		})
	}
	wrapper.keys = keys
	
	return wrapper
}

function pathHash(req) {
	if(!req) {
		return null
	}
	return req.path
}
