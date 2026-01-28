import filog from 'filter-log'
import http from 'node:http'

let log = filog('webhandle', {component: 'http server'})


export default function listenOnHttpServer(webhandle) {

	/**
	 * Get port from environment and store in Express.
	 */

	let port = normalizePort(webhandle.config.port || process.env.PORT || '3000')
	try {
		if(webhandle.app) {
			webhandle.app.set('port', port);
		}
	}
	catch(e) {}

	/**
	 * Create HTTP server.
	 */

	let server = http.createServer((req, res) => {
		return webhandle.handleRequest(req, res)
	})

	webhandle.server = server

	/**
	 * Event listener for HTTP server "listening" event.
	 */
	function onListening() {
		var addr = server.address();
		var bind = typeof addr === 'string' ?
			'pipe ' + addr :
			'port ' + addr.port;
		log.info('Listening on ' + bind);
	}

	/**
	 * Event listener for HTTP server "error" event.
	 */

	function onError(error) {
		if (error.syscall !== 'listen') {
			throw error;
		}

		var bind = typeof port === 'string' ?
			'Pipe ' + port :
			'Port ' + port;

		// handle specific listen errors with friendly messages
		switch (error.code) {
			case 'EACCES':
				console.error(bind + ' requires elevated privileges');
				process.exit(1);
				break;
			case 'EADDRINUSE':
				console.error(bind + ' is already in use');
				process.exit(1);
				break;
			default:
				throw error;
		}
	}

	/**
	 * Listen on provided port, on all network interfaces.
	 */
	server.listen(port);
	server.on('error', onError);
	server.on('listening', onListening);
}

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
	var port = parseInt(val, 10);

	if (isNaN(port)) {
		// named pipe
		return val;
	}

	if (port >= 0) {
		// port number
		return port;
	}

	return false;
}
