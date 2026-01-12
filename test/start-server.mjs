import Webhandle from "../webhandle.mjs";
import listenOnHttpServer from "../lib/listen-on-http-server.mjs";
import filog from 'filter-log'

let log = filog('test')

let webhandle = new Webhandle()
await webhandle.init()




webhandle.routers.primary.use((req, res, next) => {
	for(let i = 0; i < 100; i++) {
		// console.log('tick')
		// log.info('tick')
	}
	// console.timeEnd('request processing')
	res.end('hello there')
})
listenOnHttpServer(webhandle)