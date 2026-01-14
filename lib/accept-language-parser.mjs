/**
 * Parses the http accept-languages header to determine which lanagues are requested.
 * @param {string} acceptLanguageHeader 
 * @returns An array of language-region codes. Will always be an array, but maybe empty.
 * All codes will be lower case.
 */
export default function getRequestedLanguages(acceptLanguageHeader) {

	let langHeader = acceptLanguageHeader
	if(langHeader) {
		let languages = langHeader.split(',')
		.map(lang => {
			return lang.split(';')[0]
		})
		.map(lang => lang.toLowerCase())
		.map(lang => lang.trim())
		.filter(lang => !lang.includes('..'))
		.filter(lang => !lang.includes('!'))
		.filter(lang => !lang.includes('/'))
		.filter(lang => !lang.includes('__'))
		
		return languages
	}
	else {
		return []
	}
}