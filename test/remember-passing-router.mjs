
import test from 'node:test';
import assert from 'node:assert';
import createRememberPassingRouter from '../lib/remember-passing-router.mjs';

test("remember-passing-router", async (t) => {
	await t.test('passing router', async (t) => {
		let innerCall = false

		function router(req, res, next) {
			innerCall = true
			if(req.path.startsWith('a')) {
				next()
			}
		}
		let passing = createRememberPassingRouter(router)
		let req = {
			path: 'apple'
		}
		
		let called = false
		passing(req, null, () => {called = true})
		assert.equal(called, true, "Call didn't happen")
		assert.equal(innerCall, true, "Call didn't happen")

		req.path = 'banana'
		called = false
		innerCall = false
		passing(req, null, () => {called = true})
		assert.equal(called, false, "Call happened")
		assert.equal(innerCall, true, "Call didn't happen")
		
		req.path = 'apple'
		called = false
		innerCall = false
		passing(req, null, () => {called = true})
		assert.equal(called, true, "Call didn't happen")
		assert.equal(innerCall, false, "Call happened")
	})
})