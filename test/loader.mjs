import test from 'node:test';
import assert from 'node:assert'
import FileSink from 'file-sink'
import createTripartiteTemplateLoader from '../lib/loaders/create-tripartite-template-loader.mjs'
import createFileSinkLoader from '../lib/loaders/create-file-loader.mjs'
import createCachingLoader from '../lib/loaders/create-caching-loader.mjs'
import createMemberLoader from '../lib/loaders/create-member-loader.mjs';
import createPromisedLoader from '../lib/loaders/create-promised-loader.mjs';
import createCompositeLoader from '../lib/loaders/create-composite-loader.mjs';
import createPrefixRemovingLoader from '../lib/loaders/create-prefix-removing-loader.mjs';
import createRememberPassingLoader from '../lib/loaders/create-remember-passing-loader.mjs';
import createRememberFoundLoader from '../lib/loaders/create-remember-found-loader.mjs';


let testdir = 'test' + (new Date().getTime())
let testpath = '/tmp/' + testdir
let fsTmp = new FileSink('/tmp')
await fsTmp.mkdir(testdir)

let fsTest = new FileSink(testpath)
let templateLoader = createTripartiteTemplateLoader(fsTest)
let fileLoader = createFileSinkLoader(fsTest)
let dataSource = {}
let memberLoader = createMemberLoader(dataSource)
let prefixLoader = createPrefixRemovingLoader(templateLoader, '/a/b/')
let rememberPassingLoader = createRememberPassingLoader(templateLoader)

test("test file loader", async (t) => {
	await t.test('remember passing loader', async (t) => {
		let pr = new Promise((resolve, reject) => {
			rememberPassingLoader('one', (data) => {
				try {
					assert(data === undefined, 'No data should have been found.')
					resolve()
				}
				catch (e) {
					reject(e)
				}
			})
		})
		return pr
	})

	await t.test('setup', async (t) => {
		await fsTest.write('one.tri', 'abc')
		await fsTest.write('one.html', 'def')
		await fsTest.write('four.txt', 'jkl')
		await fsTest.mkdir('two')
		await fsTest.write('two/three.tri', 'ghi')
	})
	await t.test('prefix removing loader, no value', async (t) => {
		let pr = new Promise((resolve, reject) => {
			prefixLoader('one', (data) => {
				try {
					assert(data === undefined, 'No data should have been found.')
					resolve()
				}
				catch (e) {
					reject(e)
				}
			})
		})
		return pr
	})
	
	await t.test('prefix removing loader', async (t) => {
		let pr = new Promise((resolve, reject) => {
			prefixLoader('/a/b/one', (data) => {
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
	await t.test('prefix removing loader without slash', async (t) => {
		let pr = new Promise((resolve, reject) => {
			prefixLoader('a/b/one', (data) => {
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
	
	
	prefixLoader = createPrefixRemovingLoader(templateLoader, '/a/b')
	await t.test('prefix removing loader', async (t) => {
		let pr = new Promise((resolve, reject) => {
			prefixLoader('/a/b/one', (data) => {
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
	await t.test('prefix removing loader without slash', async (t) => {
		let pr = new Promise((resolve, reject) => {
			prefixLoader('a/b/one', (data) => {
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

	prefixLoader = createPrefixRemovingLoader(templateLoader, 'a/b')
	await t.test('prefix removing loader', async (t) => {
		let pr = new Promise((resolve, reject) => {
			prefixLoader('/a/b/one', (data) => {
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
	await t.test('prefix removing loader without slash', async (t) => {
		let pr = new Promise((resolve, reject) => {
			prefixLoader('a/b/one', (data) => {
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
	
	
	prefixLoader = createPrefixRemovingLoader(templateLoader, 'a/b/')
	await t.test('prefix removing loader', async (t) => {
		let pr = new Promise((resolve, reject) => {
			prefixLoader('/a/b/one', (data) => {
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
	await t.test('prefix removing loader without slash', async (t) => {
		let pr = new Promise((resolve, reject) => {
			prefixLoader('a/b/one', (data) => {
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

	await t.test('remember passing loader', async (t) => {
		let pr = new Promise((resolve, reject) => {
			rememberPassingLoader('one', (data) => {
				try {
					assert(data === undefined, 'No data should have been found.')
					resolve()
				}
				catch (e) {
					reject(e)
				}
			})
		})
		return pr
	})
	await t.test('remember passing loader status', async (t) => {
		assert.equal(rememberPassingLoader.getStatus('one'), false, 'Status should be false.')
		assert.equal(rememberPassingLoader.getStatus('abc2'), undefined, 'Status should be undefined.')
	})
	rememberPassingLoader = createRememberPassingLoader(templateLoader)
	await t.test('remember passing loader', async (t) => {
		let pr = new Promise((resolve, reject) => {
			rememberPassingLoader('one', (data) => {
				try {
					assert.equal(data, 'abc', 'Template content did not match.')
					assert.equal(rememberPassingLoader.getStatus('one'), true, 'Status should be true.')
					resolve()
				}
				catch (e) {
					reject(e)
				}
			})
		})
		return pr
	})
	
	await t.test('remember found loader', async (t) => {
		let memberLoader = createMemberLoader({a: 1, b: 2})
		let foundLoader = createRememberFoundLoader(memberLoader)
		assert.equal(foundLoader.getStatus('a'), true, 'Status should be true.')
		foundLoader('a')
		assert.equal(foundLoader.getStatus('a'), true, 'Status should be true.')
		foundLoader('c')
		assert.equal(foundLoader.getStatus('c'), false, 'Status should be false.')

		assert.equal(foundLoader.getValue('a'), 1, 'Value should be 1.')
		assert.equal(foundLoader.getValue('c'), undefined, 'Value should be undefined.')

		memberLoader = function(name, callback) {
			if(name === 'a') {
				return callback(1)
			}
			if(name === 'b') {
				return callback(1)
			}
			callback(undefined)
		}
		foundLoader = createRememberFoundLoader(memberLoader)
		assert.equal(foundLoader.getStatus('a'), undefined, 'Status should be undefined.')
		foundLoader('a')
		assert.equal(foundLoader.getStatus('a'), true, 'Status should be true.')
		foundLoader('c')
		assert.equal(foundLoader.getStatus('c'), undefined, 'Status should be undefined.')

		assert.equal(foundLoader.getValue('a'), undefined, 'Value should be undefined.')
		assert.equal(foundLoader.getValue('c'), undefined, 'Value should be undefined.')
	})

	await t.test('composite loader status behavior', async (t) => {
		let memberLoader = function(name, callback) {
			if(name === 'a') {
				return callback(1)
			}
			if(name === 'b') {
				return callback(2)
			}
			callback(undefined)
		}
		let compositeLoader = createCompositeLoader(memberLoader)
		assert.equal(compositeLoader.getStatus('a'), undefined, 'Status should be undefined.')
		compositeLoader('a')
		assert.equal(compositeLoader.getStatus('a'), undefined, 'Status should be undefined.')
		compositeLoader('c')
		assert.equal(compositeLoader.getStatus('c'), undefined, 'Status should be undefined.')
		assert.equal(compositeLoader.getValue('a'), undefined, 'Value should be undefined.')
		assert.equal(compositeLoader.getValue('c'), undefined, 'Value should be undefined.')

		let trueMember = createMemberLoader({a: 3})
		compositeLoader = createCompositeLoader(memberLoader, trueMember)
		assert.equal(compositeLoader.getStatus('a'), true, 'Status should be true.')
		compositeLoader('a')
		assert.equal(compositeLoader.getStatus('a'), true, 'Status should be true.')
		compositeLoader('c')
		assert.equal(compositeLoader.getStatus('c'), undefined, 'Status should be undefined.')
		assert.equal(trueMember.getStatus('c'), false, 'Status should be false.')
		

		let bValue 
		assert.equal(compositeLoader.getValue('a'), 3, 'Value should be 3.')
		assert.equal(compositeLoader.getValue('b'), undefined, 'Value should be undefined.')
		assert.equal(compositeLoader.getValue('c'), undefined, 'Value should be undefined.')
		compositeLoader('b', (val) => {
			bValue = val
		})
		assert.equal(compositeLoader.getValue('b'), undefined, 'Value should be undefined.')
		assert.equal(bValue, 2, 'Value should be two.')

		memberLoader = function(name, callback) {
			if(name === 'a') {
				return callback(1)
			}
			if(name === 'b') {
				return callback(2)
			}
			if(name === 'd') {
				return callback(4)
			}
			callback(undefined)
		}
		memberLoader.getStatus = function(name) {
			if(name === 'a') {
				return false
			}
			if(name === 'b') {
				return true
			}
			return undefined
		}
		
		compositeLoader = createCompositeLoader(memberLoader, trueMember)
		bValue = undefined
		compositeLoader('b', (val) => {
			bValue = val
		})
		assert.equal(compositeLoader.getValue('b'), undefined, 'Value should be undefined.')
		assert.equal(bValue, 2, 'Value should be two.')
		
		let dValue
		compositeLoader('d', (val) => {
			dValue = val
		})
		assert.equal(compositeLoader.getValue('b'), undefined, 'Value should be undefined.')
		assert.equal(dValue, 4, 'Value should be 4.')
		
		dValue = undefined
		delete memberLoader.getStatus
		compositeLoader('d', (val) => {
			dValue = val
		})
		assert.equal(compositeLoader.getValue('b'), undefined, 'Value should be undefined.')
		assert.equal(dValue, 4, 'Value should be 4.')
		
		let eValueCallback
		compositeLoader = createCompositeLoader()
		compositeLoader('e', (val) => {
			eValueCallback = true
		})
		assert.equal(eValueCallback, true, 'Callback should have set true')

		
	})

	await t.test('tri template', async (t) => {
		let pr = new Promise((resolve, reject) => {
			templateLoader('/one', (data) => {
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
	await t.test('status aware cached loader', async (t) => {
		let key = 'four.txt'
		assert.equal(cachingLoader.getStatus(key), true, 'Template status should be found.')
		assert.equal(cachingLoader.getValue(key), 'jkl', 'Template contents did not match.')
		
		let subLoader = createCachingLoader(cachingLoader, {})
		assert.equal(subLoader.getStatus(key), true, 'Template status should be found.')
		assert.equal(subLoader.getValue(key), 'jkl', 'Template contents did not match.')
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

	await t.test('member loader', async (t) => {
		dataSource.msg = 'hi'
		let pr = new Promise((resolve, reject) => {
			memberLoader('/msg', (data) => {
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
	
	await t.test('composite loader status', async (t) => {
		assert.equal(compositeLoader.getStatus('to'), true, 'Status should be true.')
		assert.equal(compositeLoader.getStatus('to2'), false, 'Status should be false.')

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