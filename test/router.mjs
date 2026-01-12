import test from 'node:test';
import assert from 'node:assert'
import createRouter from '../lib/router.mjs'

import Webhandle from '../webhandle.mjs';


test("basic router tests", async (t) => {

	await t.test('an empty router', async (t) => {
		let pr = new Promise((resolve, reject) => {
			let router = createRouter()
			let nextCalled = false
			setTimeout(() => {
				reject()
			}, 20)
			router(null, null, () => {
				nextCalled = true
				resolve()
			})
		})
		return pr
	})

	await t.test('sub router with continuation', async (t) => {
		let pr = new Promise((resolve, reject) => {
			let topRouter = createRouter()
			let topNextCalled = false
			let subNextCalled = false

			topRouter.use((req, res, next) => {
				subNextCalled = true
				next()
			})
			topRouter(null, null, () => {
				topNextCalled = true
			})

			setTimeout(() => {
				if (topNextCalled && subNextCalled) {
					return resolve()
				}
				reject()
			}, 20)
		})
		return pr
	})

	await t.test('sub router with no continuation', async (t) => {
		let pr = new Promise((resolve, reject) => {
			let topRouter = createRouter()
			let topNextCalled = false
			let subNextCalled = false

			topRouter.use((req, res, next) => {
				subNextCalled = true
			})
			topRouter(null, null, () => {
				topNextCalled = true
			})

			setTimeout(() => {
				if (topNextCalled == false && subNextCalled) {
					return resolve()
				}
				reject()
			}, 20)
		})
		return pr
	})
})

test("webhandle router tests", async (t) => {
	await t.test('default router fallthrough', async (t) => {
		let pr = new Promise(async (resolve, reject) => {
			let webhandle = new Webhandle()
			await webhandle.init()

			let topNextCalled = false
			let primaryCalled = false
			// prevent errors caused by incomplete request and response ojects
			webhandle.routers.preParmParse.subRouters = []

			webhandle.routers.primary.use((req, res, next) => {
				primaryCalled = true
				next()
			})
			
			webhandle.handleRequest(undefined, undefined, () => {
				topNextCalled = true
			})

			setTimeout(() => {
				if (topNextCalled && primaryCalled) {
					return resolve()
				}
				else {
					reject()

				}
			}, 20)
		})
		return pr
	})

	await t.test('default router with interruption', async (t) => {
		let pr = new Promise(async (resolve, reject) => {
			/**
			 * @type {Webhandle}
			 */
			let webhandle = new Webhandle()
			await webhandle.init()

			let topNextCalled = false
			let primaryCalled = false
			// prevent errors caused by incomplete request and response ojects
			webhandle.routers.preParmParse.subRouters = []

			webhandle.routers.primary.use((req, res, next) => {
				primaryCalled = true
			})

			webhandle.handleRequest(null, null, () => {
				topNextCalled = true
			})

			setTimeout(() => {
				if (topNextCalled == false && primaryCalled) {
					return resolve()
				}
				reject()
			}, 20)
		})
		return pr
	})

	await t.test('properties test', async (t) => {
		let webhandle = new Webhandle()
		let webhandle2 = new Webhandle()
		webhandle.app = 'bar'
		webhandle2.app = 'foo'

		assert.notEqual(webhandle.app, webhandle2.app)
	})

	await t.test('catching errors', async (t) => {
		let pr = new Promise((resolve, reject) => {
			let topRouter = createRouter()
			let topNextCalled = false
			let subNextCalled = false
			let errorThrown = false
			let thirdCalled = false
			let errorCaught = false
			let fourthCalled = false

			topRouter.use((req, res, next) => {
				subNextCalled = true
				next()
			})
			topRouter.use((req, res, next) => {
				errorThrown = true
				next(new Error('test'))
			})
			topRouter.use((req, res, next) => {
				thirdCalled = true
				next()
			})
			topRouter.use((err, req, res, next) => {
				errorCaught = true
				next()
			})
			topRouter.use((req, res, next) => {
				fourthCalled = true
				next()
			})

			topRouter(null, null, () => {
				topNextCalled = true
			})

			setTimeout(() => {
				if (topNextCalled && subNextCalled && errorThrown && !thirdCalled && errorCaught && fourthCalled) {
					return resolve()
				}
				reject()
			}, 20)
		})
		return pr
	})

	await t.test('ignoring error routers', async (t) => {
		let pr = new Promise((resolve, reject) => {
			let topRouter = createRouter()
			let topNextCalled = false
			let subNextCalled = false
			let errorCaught = false
			let thirdCalled = false

			topRouter.use((req, res, next) => {
				subNextCalled = true
				next()
			})
			topRouter.use((err, req, res, next) => {
				errorCaught = true
				next()
			})
			topRouter.use((req, res, next) => {
				thirdCalled = true
				next()
			})

			topRouter(null, null, () => {
				topNextCalled = true
			})

			setTimeout(() => {
				if (topNextCalled && subNextCalled && !errorCaught && thirdCalled) {
					return resolve()
				}
				reject()
			}, 20)
		})
		return pr
	})

})