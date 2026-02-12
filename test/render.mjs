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
	// Make sure we don't flush away the output.
	res._flush = function(callback) {
		if(callback) {
			callback()
		}
	}
	return res
}

test("response render behavior", async (t) => {

	await t.test('check filters and repeat executions', async (t) => {
		let res = setupResponse()
		res.render('template1')
		assert.equal(res.pausedData, 'template1{}', 'Result content should match expected. 1')
		
		
		res = setupResponse()
		res.addFilter((input) => input.toUpperCase())
		res.render('template1')
		assert.equal(res.pausedData, 'TEMPLATE1{}', 'Result content should match expected. 2')

		res = setupResponse()
		res.addFilter((input) => input.toUpperCase())
		res.addFilter((input) => input + '.')
		res.render('template1')
		assert.equal(res.pausedData, 'TEMPLATE1{}.', 'Result content should match expected. 3')
		
		res = setupResponse()
		res.addFilter((input) => input.toUpperCase())
		res.addFilter((input) => input + '.')
		
		let result
		res.render('template1', {}, (err, data) => {
			result = data
		})
		assert.equal(result, 'TEMPLATE1{}.', 'Result content should match expected. 4')

		res.render('template1', {}, (err, data) => {
			result = data
		})

		assert.equal(result, 'TEMPLATE1{}.', 'Result content should match expected. 5')

		assert.equal(res.pausedData, '', 'Result content should match expected. 6')

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
