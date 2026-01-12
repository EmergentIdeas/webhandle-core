/**
 * A Router of the express style which can have child routers.
 * 
 * In no way is this intended to substitute for something like express. However, I also want
 * it possible to use a webhandle instance without express if web request handling
 * is not important or if simplicity is key. This is the most minimal impelemention 
 * placeholder.
 * @returns a Router of the express style which can have child routers.
 */
export default function createRouter() {
	let router = (req, res, next) => {
		let processor = new RouteProcessor(router.subRouters)
		processor.routerName = router.routerName
		processor.handle(req, res, next)
	}

	router.subRouters = []
	router.use = function(router) {
		this.subRouters.push(router)
	}

	return router
}

export class RouteProcessor {
	constructor(subRouters) {
		this.subRouters = [...subRouters].reverse()
	}
	handle(req, res, next) {
		if(this.subRouters.length > 0) {
			try {
				let route = this.subRouters.pop()
				if(this.err) {
					if(route.length === 4) {
						let err = this.err
						delete this.err
						route(err, req, res, (err) => {
							if(err) {
								this.err = err
							}
							return this.handle(req, res, next)
						})
					}
					else {
						return this.handle(req, res, next)
					}
				}
				else {
					if(route.length === 4) {
						return this.handle(req, res, next)
					}
					else {
						route(req, res, (err) => {
							if(err) {
								this.err = err
							}
							this.handle(req, res, next)
						})
					}

				}
			}
			catch(e) {
				this.err = e
				this.handle(req, res, next)
			}
		}
		else {
			if(next) {
				if(this.err) {
					next(this.err)

				}
				else {
					next()
				}
			}
		}
	}
}