let vrscMatcher = /^\/vrsc\/\d+(\/.*$)/
let tenYearsSec = 10 * 365 * 24 * 60 * 60

import filterLog from "filter-log"
let log = filterLog('webhandle', {component: 'long expiration middleware'})

/**
 * Creates middleware that adds long expiration headers for any URL that starts with /vrsc/<some number>
 * @param {*} webhandle 
 * @returns A middleware function
 */
export default function createLongExpirationMiddleware(webhandle) {
	function expirationMiddleware(req, res, next) {
		try {
			if(!res.locals.vrsc && webhandle.development) {
				res.locals.vrsc = ''
			}
			else {
				res.locals.vrsc = '/vrsc/' + webhandle.resourceVersion
			}
			
			res.locals.developmentMode = webhandle.development ? true : false
			
			let m = req.url.match(vrscMatcher)
			if(m) {
				req.url = m[1]
				let cannonicalUrl = req.protocol + '://' + req.hostname + req.url
				res.set('Link', '<' + cannonicalUrl + '>; rel="canonical"')
				res.set('Expires', get10Years().toUTCString())
				res.set('Cache-Control', 'public, max-age=157680000, must-revalidate')
			}
		}
		catch(e) {
			log.error({
				msg: 'Could not configure long expiration'
				, err: e
			})
		}
		next()
	}
	
	return expirationMiddleware
}

function get10Years() {
	let d = new Date()
	d.setTime(d.getTime() + (tenYearsSec * 1000))
	return d
}