import getRequestedLanguages from '../lib/accept-language-parser.mjs';

export default function acceptLanguageMiddleware(req, res, next) {
	let langHeader = req.query['Accept-Language'] || req.get('Accept-Language')
	req.requestedLanguages = getRequestedLanguages(langHeader)
	next()
}