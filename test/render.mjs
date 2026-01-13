import test from 'node:test';
import assert from 'node:assert'
import PausingTransform from 'pausing-transform';
import createResponseFilters from '../lib/create-response-filters.mjs';
import Webhandle from '../webhandle.mjs';

import dumbRender from "./util/dumb-render.mjs";
import wait from "./util/wait.mjs"

import testRenderFunction from "./cases/webhandle-render-contract-tests.mjs";

testRenderFunction(dumbRender)


let webhandle = new Webhandle()
await webhandle.init()
let middleware = createResponseFilters(webhandle)
function setupResponse() {
	let res = new PausingTransform()
	res.locals = {}
	middleware(null, res, () => {})
	res.internalRender = dumbRender
	return res
}

test("response render behavior", async (t) => {

	await t.test('check filters and repeat executions', async (t) => {
		let res = setupResponse()
		res.render('template1')
		assert.equal(res.pausedData, 'template1{}', 'Result content should match expected.')
		
		
		res = setupResponse()
		res.addFilter((input) => input.toUpperCase())
		res.render('template1')
		assert.equal(res.pausedData, 'TEMPLATE1{}', 'Result content should match expected.')

		res = setupResponse()
		res.addFilter((input) => input.toUpperCase())
		res.addFilter((input) => input + '.')
		res.render('template1')
		assert.equal(res.pausedData, 'TEMPLATE1{}.', 'Result content should match expected.')
		
		res = setupResponse()
		res.addFilter((input) => input.toUpperCase())
		res.addFilter((input) => input + '.')
		
		let result
		res.render('template1', {}, (err, data) => {
			result = data
		})
		await wait(30)
		assert.equal(result, 'TEMPLATE1{}.', 'Result content should match expected.')

		res.render('template1', {}, (err, data) => {
			result = data
		})

		await wait(30)
		assert.equal(result, 'TEMPLATE1{}.', 'Result content should match expected.')

		assert.equal(res.pausedData, '', 'Result content should match expected.')

	})
	await t.test('check filters and repeat executions', async (t) => {
		let res = setupResponse()
		res.render('template1', 'hello')
		assert.equal(res.pausedData, 'template1"hello"', 'Result content should match expected.')
	})
	await t.test('flexible render arguments', async (t) => {
		let res = setupResponse()
		res.render('template1', 'hello')
		assert.equal(res.pausedData, 'template1"hello"', 'Result content should match expected.')

		let result
		res = setupResponse()
		res.render('template1', 'hello', (err, data) => {
			result = data
		})
		assert.equal(result, 'template1"hello"', 'Result content should match expected.')

		res = setupResponse()
		res.render('template1', (err, data) => {
			result = data
		})
		assert.equal(result, 'template1{}', 'Result content should match expected.')
	})
})