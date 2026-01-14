import test from 'node:test';
import assert from 'node:assert'
import getRequestedLanguages from '../lib/accept-language-parser.mjs';

test("accept language parser", async (t) => {
	await t.test('languages', async (t) => {
		let languages = getRequestedLanguages('en-US,en;q=0.9')
		assert.equal(languages[0], 'en-us', "Incorrect language code.")
		assert.equal(languages[1], 'en', "Incorrect language code.")
		
		languages = getRequestedLanguages('da, en-GB;q=0.8, en;q=0.7')
		assert.equal(languages[0], 'da', "Incorrect language code.")
		assert.equal(languages[1], 'en-gb', "Incorrect language code.")
		assert.equal(languages[2], 'en', "Incorrect language code.")

		languages = getRequestedLanguages('')
		assert.equal(languages.length, 0, 'Array should be empty.')

		languages = getRequestedLanguages()
		assert.equal(languages.length, 0, 'Array should be empty.')
	})
})