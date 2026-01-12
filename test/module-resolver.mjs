import test from 'node:test';
import module from "node:module"

module.registerHooks({
	resolve: (specifier, context, nextResolve) => {
		console.log(specifier)
		return null
	}
})
import assert from 'node:assert'
// import webhandle from "webhandle"

// import webhandle from "webhandle"
test("module resolver tests", async (t) => {

	await t.test('in package resolver', async (t) => {
		// console.log(webhandle)
	})
})