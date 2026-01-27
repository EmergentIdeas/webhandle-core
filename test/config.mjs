import test from 'node:test';
import assert from 'node:assert'

import Webhandle from '../webhandle.mjs';



test("config tests", async (t) => {

	await t.test('no specification', async (t) => {
		let wh = new Webhandle()
		await wh.init()
		
		assert(wh.development === false, "Development should be false")
	})

	await t.test('on create options', async (t) => {
		let wh = new Webhandle({
			config: {
				development: true
			}
		})
		await wh.init()
		
		assert(wh.development === true, "Development should be true")
	})

	await t.test('on process option', async (t) => {
		process.env.NODE_ENV = 'development'
		let wh = new Webhandle()
		await wh.init()
		
		assert(wh.development === true, "Development should be true")
		delete process.env.NODE_ENV
	})
})
