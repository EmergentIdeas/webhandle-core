import test from 'node:test';
import assert from 'node:assert'
import FileSink from 'file-sink'
import createTripartiteTemplateLoader from '../lib/loaders/create-tripartite-template-loader.mjs'
import createFileSinkLoader from '../lib/loaders/create-file-loader.mjs'
import createCachingLoader from '../lib/loaders/create-caching-loader.mjs'
import createMemberLoader from '../lib/loaders/create-member-loader.mjs';
import createPromisedLoader from '../lib/loaders/create-promised-loader.mjs';
import createCompositeLoader from '../lib/loaders/create-composite-loader.mjs';


let testdir = 'test' + (new Date().getTime())
let testpath = '/tmp/' + testdir
let fsTmp = new FileSink('/tmp')
await fsTmp.mkdir(testdir)

let fsTest = new FileSink(testpath)
let templateLoader = createTripartiteTemplateLoader(fsTest)
let fileLoader = createFileSinkLoader(fsTest)
let dataSource = {}
let memberLoader = createMemberLoader(dataSource)

test("test file loader", async (t) => {
	await t.test('setup', async (t) => {
		await fsTest.write('one.tri', 'abc')
		await fsTest.write('one.html', 'def')
		await fsTest.write('four.txt', 'jkl')
		await fsTest.mkdir('two')
		await fsTest.write('two/three.tri', 'ghi')
	})
	await t.test('tri template', async (t) => {
		let pr = new Promise((resolve, reject) => {
			templateLoader('one', (data) => {
				try {
					assert.equal(data, 'abc', 'Template content did not match.')
					resolve()
				}
				catch (e) {
					reject(e)
				}
			})
		})
		return pr
	})

	await t.test('revealed template', async (t) => {
		let pr = new Promise(async (resolve, reject) => {
			await fsTest.rm('one.tri')
			templateLoader('one', (template) => {
				try {
					assert.equal(template, 'def', 'Template contents did not match.')
				}
				catch (e) {
					return reject(e)
				}
				resolve()
			})
		})
		return pr
	})

	await t.test('tri template in subdirectory', async (t) => {
		let pr = new Promise(async (resolve, reject) => {
			templateLoader('two/three', (template) => {
				try {
					assert.equal(template, 'ghi', 'Template contents did not match.')
					resolve()
				}
				catch (e) {
					return reject(e)
				}
			})
		})
		return pr
	})
	await t.test('illegal location', async (t) => {
		let pr = new Promise(async (resolve, reject) => {
			templateLoader('two/../../one', (template) => {
				try {
					assert(!template)
					resolve()
				}
				catch (e) {
					return reject(e)
				}
			})
		})
		return pr
	})
	await t.test('illegal location 2', async (t) => {
		let pr = new Promise(async (resolve, reject) => {
			templateLoader('~/one', (template) => {
				try {
					assert(!template)
					resolve()
				}
				catch (e) {
					return reject(e)
				}
			})
		})
		return pr
	})

	await t.test('file but not tri template', async (t) => {
		let pr = new Promise((resolve, reject) => {
			templateLoader('four', (data) => {
				try {
					assert(!data)
					resolve()
				}
				catch (e) {
					reject(e)
				}
			})
		})
		return pr
	})

	await t.test('file from file loader', async (t) => {
		let pr = new Promise((resolve, reject) => {
			fileLoader('four.txt', (data) => {
				try {
					assert.equal(data, 'jkl', 'Template contents did not match.')
					resolve()
				}
				catch (e) {
					reject(e)
				}
			})
		})
		return pr
	})

	await t.test('file does not exist', async (t) => {
		let pr = new Promise((resolve, reject) => {
			fileLoader('four2.txt', (data) => {
				try {
					assert(data === undefined, 'The result should be undefined.')
					resolve()
				}
				catch (e) {
					reject(e)
				}
			})
		})
		return pr
	})

	let cachingLoader = createCachingLoader(fileLoader, {})

	await t.test('file does not exist', async (t) => {
		let pr = new Promise((resolve, reject) => {
			cachingLoader('four2.txt', (data) => {
				try {
					assert(data === undefined, 'The result should be undefined.')
					resolve()
				}
				catch (e) {
					reject(e)
				}
			})
		})
		return pr
	})
	await t.test('repeat with cached result', async (t) => {
		let pr = new Promise((resolve, reject) => {
			cachingLoader('four2.txt', (data) => {
				try {
					assert(data === undefined, 'The result should be undefined.')
					resolve()
				}
				catch (e) {
					reject(e)
				}
			})
		})
		return pr
	})
	await t.test('file exists', async (t) => {
		let pr = new Promise((resolve, reject) => {
			cachingLoader('four.txt', (data) => {
				try {
					assert.equal(data, 'jkl', 'Template contents did not match.')
					resolve()
				}
				catch (e) {
					reject(e)
				}
			})
		})
		return pr
	})

	await t.test('cached file exists', async (t) => {
		await fsTest.rm('four.txt')
		let pr = new Promise((resolve, reject) => {
			cachingLoader('four.txt', (data) => {
				try {
					assert.equal(data, 'jkl', 'Template contents did not match.')
					resolve()
				}
				catch (e) {
					reject(e)
				}
			})
		})
		return pr
	})
	await t.test('check to make sure the file is gone', async (t) => {
		let pr = new Promise((resolve, reject) => {
			fileLoader('four.txt', (data) => {
				try {
					assert(!data, 'The file should not have data.')
					resolve()
				}
				catch (e) {
					reject(e)
				}
			})
		})
		return pr
	})

	await t.test('member loader', async (t) => {
		let pr = new Promise((resolve, reject) => {
			memberLoader('one', (data) => {
				try {
					assert(!data, 'The member should not have data.')
					resolve()
				}
				catch (e) {
					reject(e)
				}
			})
		})
		return pr
	})

	await t.test('member loader', async (t) => {
		dataSource.msg = 'hi'
		let pr = new Promise((resolve, reject) => {
			memberLoader('msg', (data) => {
				try {
					assert.equal(data, 'hi', 'Member contents did not match.')
					resolve()
				}
				catch (e) {
					reject(e)
				}
			})
		})
		return pr
	})

	let promisedLoader = createPromisedLoader(memberLoader)

	await t.test('promised loader callback', async (t) => {
		let pr = new Promise((resolve, reject) => {
			promisedLoader('msg', (data) => {
				try {
					assert.equal(data, 'hi', 'Member contents did not match.')
					resolve()
				}
				catch (e) {
					reject(e)
				}
			})
		})
		return pr
	})
	await t.test('promised loader await', async (t) => {
		let data = await promisedLoader('msg')
		assert.equal(data, 'hi', 'Member contents did not match.')
	})
	
	let secondMemberLoader = createMemberLoader({
		to: 'Dan'
	})

	let compositeLoader = createCompositeLoader(memberLoader, secondMemberLoader)

	await t.test('composite loader', async (t) => {
		let pr = new Promise((resolve, reject) => {
			compositeLoader('msg', (data) => {
				try {
					assert.equal(data, 'hi', 'Member contents did not match.')
					resolve()
				}
				catch (e) {
					reject(e)
				}
			})
		})
		return pr
	})
	await t.test('composite loader, second loader', async (t) => {
		let pr = new Promise((resolve, reject) => {
			compositeLoader('to', (data) => {
				try {
					assert.equal(data, 'Dan', 'Member contents did not match.')
					resolve()
				}
				catch (e) {
					reject(e)
				}
			})
		})
		return pr
	})

	compositeLoader = createCompositeLoader(fileLoader, memberLoader, secondMemberLoader)

	await t.test('composite loader, first member', async (t) => {
		let pr = new Promise((resolve, reject) => {
			compositeLoader('msg', (data) => {
				try {
					assert.equal(data, 'hi', 'Member contents did not match.')
					resolve()
				}
				catch (e) {
					reject(e)
				}
			})
		})
		return pr
	})
	await t.test('composite loader, second member', async (t) => {
		let pr = new Promise((resolve, reject) => {
			compositeLoader('to', (data) => {
				try {
					assert.equal(data, 'Dan', 'Member contents did not match.')
					resolve()
				}
				catch (e) {
					reject(e)
				}
			})
		})
		return pr
	})

	await t.test('composite loader, file loader', async (t) => {
		let pr = new Promise((resolve, reject) => {
			compositeLoader('one.html', (data) => {
				try {
					assert.equal(data, 'def', 'File contents did not match.')
					resolve()
				}
				catch (e) {
					reject(e)
				}
			})
		})
		return pr
	})

	await t.test('composite loader, non-existant key', async (t) => {
		let pr = new Promise((resolve, reject) => {
			compositeLoader('does/not/exist', (data) => {
				try {
					assert(data === undefined, 'The data should be undefined.')
					resolve()
				}
				catch (e) {
					reject(e)
				}
			})
		})
		return pr
	})

	await fsTmp.rm(testdir)
})