import test from 'node:test';
import assert from 'node:assert'
import FileSink from 'file-sink'
import createTripartiteFileLoader from '../lib/create-tripartite-file-loader.mjs';
import createCachingLoaderFactory from '../lib/create-caching-loader-factory.mjs';


let testdir = 'test' + (new Date().getTime())
let testpath = '/tmp/' + testdir
let fsTmp = new FileSink('/tmp')
fsTmp.mkdir(testdir)

let fsTest = new FileSink(testpath)
let fileLoader = createTripartiteFileLoader(fsTest)

let factory = createCachingLoaderFactory(fileLoader)
let loader = factory()

test("test file loader", async (t) => {

	await t.test('setup', async (t) => {
		await fsTest.write('one.tri', 'abc')
		await fsTest.write('one.html', 'def')
		await fsTest.mkdir('two')
		await fsTest.write('two/three.tri', 'ghi')
		await fsTmp.write('four.tri', 'no')
	})
	await t.test('tri template', async (t) => {
		let pr = new Promise((resolve, reject) => {
			loader('one', (fileData) => {
				try {
					assert.equal('abc', fileData)
				}
				catch(e) {
					return reject(e)
				}
				resolve()
			})
			
		})
		return pr
	})
	await t.test('revealed template', async (t) => {
		let pr = new Promise(async (resolve, reject) => {
			await fsTest.rm('one.tri')
			loader('one', (template) => {
				try {
					assert.equal('def', template)
				}
				catch(e) {
					return reject(e)
				}
				resolve()
			})
		})
		return pr
	})
	await t.test('tri template in subdirectory', async (t) => {
		let pr = new Promise(async (resolve, reject) => {
			loader('two/three', (template) => {
				try {
					assert.equal('ghi', template)
				}
				catch(e) {
					return reject(e)
				}
				resolve()
			})
		})
		return pr
	})
	await t.test('illegal location', async (t) => {
		let pr = new Promise(async (resolve, reject) => {
			loader('two/../../one', (template) => {
				try {
					assert(!template)
				}
				catch(e) {
					return reject(e)
				}
				resolve()
			})
		})
		return pr
	})
	await t.test('illegal location 2', async (t) => {
		let pr = new Promise(async (resolve, reject) => {
			loader('~/one', (template) => {
				try {
					assert(!template)
				}
				catch(e) {
					return reject(e)
				}
				resolve()
			})
		})
		return pr
	})
	await t.test('immutable setup', async (t) => {
		let pr = new Promise(async (resolve, reject) => {
			loader = factory({})
			resolve()
		})
		return pr
	})
	await t.test('tri template from immutable', async (t) => {
		let pr = new Promise(async (resolve, reject) => {
			loader('one', (template) => {
				try {
					assert.equal('def', template)
				}
				catch(e) {
					return reject(e)
				}
				resolve()
			})
		})
		return pr
	})
	await t.test('tri template from immutable, file deleted', async (t) => {
		let pr = new Promise(async (resolve, reject) => {
			await fsTest.rm('one.html')
			loader('one', (template) => {
				try {
					assert.equal('def', template)
				}
				catch(e) {
					return reject(e)
				}
				resolve()
			})
		})
		return pr
	})
	
	// cleanup
	await fsTmp.rm(testdir)
	await fsTmp.rm('four.tri')
	
})
