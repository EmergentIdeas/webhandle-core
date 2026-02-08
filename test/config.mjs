import test from 'node:test';
import assert from 'node:assert'

import Webhandle from '../webhandle.mjs';

import FileSink from 'file-sink'

let tmp = new FileSink('/tmp')


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

	await t.test('update config', async (t) => {
		let wh = new Webhandle({
			projectRoot: '/tmp'
		})
		await wh.init()
		wh.configFileName = 'conf.json'
		
		await tmp.write('conf.json', JSON.stringify({one: 1}))
		await wh.updateStoredConfiguration(function(conf) {
			conf.two = 2
			return conf
		})
		
		let data = (await tmp.read('conf.json')).toString()
		let dataObj = JSON.parse(data)
		assert.equal(dataObj.two, 2, "Config should have value two")
	})
})
