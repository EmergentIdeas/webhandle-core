import getRequestedLanguages from '../lib/accept-language-parser.mjs';

export default function acceptLanguageMiddleware(req, res, next) {
	let langHeader
	if(req) {
		if(req.query) {
			langHeader = req.query['Accept-Language']
		}
		if(!langHeader && req.get) {
			langHeader = req.get('Accept-Language')
		}

		if(langHeader) {
			req.requestedLanguages = getRequestedLanguages(langHeader)
		}
		else {
			req.requestedLanguages = []
		}
	}
	next()
}