import test from 'node:test';
import assert from 'node:assert'
import PausingTransform from 'pausing-transform';


export default function testRenderFunction(renderFunction) {
	test("webhandle render behavior", async (t) => {

		await t.test('simple returned content', async (t) => {
			let result = await renderFunction('template1')
			assert.equal(result, 'template1undefined', 'Result content should match expected.')
			result = await renderFunction('template1', 'hello')
			assert.equal(result, 'template1"hello"', 'Result content should match expected.')
		})
		await t.test('callback only', async (t) => {
			let pr = new Promise(async (resolve, reject) => {
				let responseCount = 0
				let callbackResponse
				let returnResponse
				
				function evaluateResponses() {
					let correct = 'template1"hello"'
					if(callbackResponse === correct && returnResponse === correct) {
						resolve()
					}
					else {
						reject("Correct content was not returned both places.")
					}
				}
				
				returnResponse = await renderFunction('template1', 'hello', (err, content) => {
					responseCount++
					callbackResponse = content
					if(responseCount === 2) {
						evaluateResponses()
					}
				})
				responseCount++
				if(responseCount === 2) {
					evaluateResponses()
				}
			})
			return pr
		})
		await t.test('callback without data', async (t) => {
			let pr = new Promise(async (resolve, reject) => {
				let responseCount = 0
				let callbackResponse
				let returnResponse
				
				function evaluateResponses() {
					let correct = 'template1undefined'
					if(callbackResponse === correct && returnResponse === correct) {
						resolve()
					}
					else {
						reject("Correct content was not returned both places.")
					}
				}
				
				returnResponse = await renderFunction('template1', (err, content) => {
					responseCount++
					callbackResponse = content
					if(responseCount === 2) {
						evaluateResponses()
					}
				})
				responseCount++
				if(responseCount === 2) {
					evaluateResponses()
				}
			})
			return pr
		})
		await t.test('callback and destination', async (t) => {
			let pr = new Promise(async (resolve, reject) => {
				let responseCount = 0
				let callbackResponse
				let returnResponse
				let destination = new PausingTransform()
				
				function evaluateResponses() {
					let correct = 'template1"hello"'
					if(!callbackResponse && !returnResponse && destination.pausedData === correct) {
						resolve()
					}
					else {
						reject("Correct content was returned when it should have been written to the stream.")
					}
				}
				
				returnResponse = await renderFunction('template1', 'hello', (err, content) => {
					responseCount++
					callbackResponse = content
					if(responseCount === 2) {
						evaluateResponses()
					}
				}, destination)
				responseCount++
				if(responseCount === 2) {
					evaluateResponses()
				}
			})
			return pr
		})
		await t.test('destination only', async (t) => {
			let pr = new Promise(async (resolve, reject) => {
				let correct = 'template1"hello"'
				let destination = new PausingTransform()
				let returnResponse = await renderFunction('template1', 'hello', destination)
				
				if(!returnResponse && destination.pausedData === correct) {
					resolve()
				}
				else {
					reject("Correct content was returned when it should have been written to the stream.")
				}
				
			})
			return pr
		})
		await t.test('destination with null callback', async (t) => {
			let pr = new Promise(async (resolve, reject) => {
				let correct = 'template1"hello"'
				let destination = new PausingTransform()
				let returnResponse = await renderFunction('template1', 'hello', null, destination)
				
				if(!returnResponse && destination.pausedData === correct) {
					resolve()
				}
				else {
					reject("Correct content was returned when it should have been written to the stream.")
				}
				
			})
			return pr
		})
		await t.test('destination with no data', async (t) => {
			let pr = new Promise(async (resolve, reject) => {
				let correct = 'template1undefined'
				let destination = new PausingTransform()
				let returnResponse = await renderFunction('template1', destination)
				
				if(!returnResponse && destination.pausedData === correct) {
					resolve()
				}
				else {
					reject("Correct content was returned when it should have been written to the stream.")
				}
				
			})
			return pr
		})
	})

}
