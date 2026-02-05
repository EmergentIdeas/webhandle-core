import filog from 'filter-log'
import FileSink from 'file-sink'
import createRouter from './lib/router.mjs'
import EventEmitter from 'events'
import createLongExpirationMiddleware from './lib/create-long-expiration-middleware.mjs'
import createResponseFilters from './lib/create-response-filters.mjs'
import acceptLanguageMiddleware from './lib/accept-language-middleware.mjs'
import path from "node:path"
import createFileSinkLoader from './lib/loaders/create-file-loader.mjs'
import createPrefixRemovingLoader from './lib/loaders/create-prefix-removing-loader.mjs'
import createRememberPassingLoader from './lib/loaders/create-remember-passing-loader.mjs'

/**
 * Webhandle root object.
 * @class
 */
export default class Webhandle {
	/**
	 * @type {Object} 
	 * @description Probably the express app
	 */
	app;

	config;
	/**
	 * @type {string[]]}
	 * @description An array of strings which are absolute paths to folders which contain views
	 */
	views;
	staticLoaders;
	staticPaths;
	staticServers;
	sinks;
	services;
	componentManagers;
	routers;
	projectRoot;
	resourceVersion;
	events;
	deferredInitializers;
	defaultLogLevel;
	defaultLogFilter;
	defaultLogStream;


	constructor(options) {
		Object.assign(this, options)

		this.setIfUnset('app', null)
		
		this.setIfUnset('config', {})

		this.setIfUnset('views', [])

		/* functions which load templates */
		this.setIfUnset('staticLoaders', [])

		/* a list of directories which contain static files to server */
		this.setIfUnset('staticPaths', [])

		/* the servers of files */
		this.setIfUnset('staticServers', [])

		/* FileSink objects which allow access to static resources */
		this.setIfUnset('sinks', {})

		/* services created to access and process data */
		this.setIfUnset('services', {})

		/* components by name which have added functionality */
		this.setIfUnset('componentManagers', {})

		/* handlers for user requests */
		this.setIfUnset('routers', this.createRouters())

		/* the absolute path of the project */
		this.setIfUnset('projectRoot', '.')

		/* an id to identify this instance */
		this.setIfUnset('id', '' + (new Date().getTime()))

		/* a counter let you know when caches should be invalidated */
		this.setIfUnset('resourceVersion', new Date().getTime())

		/* event emitters for communications between decoupled components */
		this.setIfUnset('events', {
			global: new EventEmitter()
		})

		/* code to be run after the profile setup is complete but before the environment
		 * is ready. This would be things like database connection and setup, acquiring 
		 * licenses, registering existance, ect.
		 */
		this.setIfUnset('deferredInitializers', [])



		// send all messages at info or above to std out (unless otherwise defined in the options)
		this.setIfUnset('defaultLogLevel', filog.levels.INFO)
		this.setIfUnset('defaultLogFilter',
			(entry) => {
				return entry.level && entry.level >= this.defaultLogLevel
			}
		)
		this.setIfUnset('defaultLogStream', process.stdout)

		filog.defineProcessor('standard', {}, this.defaultLogStream, (entry) => {
			return this.defaultLogFilter(entry)
		})
		
		this.log = filog('webhandle', {component: 'root'})

		if (!this.sinks.project) {
			this.sinks.project = new FileSink(this.projectRoot)
		}

		if(!this.config.development) {
			this.config.development = false
		}
		this.development = this.config.development

	}
	
	/**
	 * Add all the middleware and load the config data (if any)
	 * @param {object} options 
	 */
	async init(options = {}) {
		if(!this.initialized) {

			if(process.env.webhandleConfigFile || this.webhandleConfigFile || this.config.webhandleConfigFile || options.webhandleConfigFile) {
				let fileName =  options.webhandleConfigFile || this.webhandleConfigFile || this.config.webhandleConfigFile || process.env.webhandleConfigFile
				try {

					let data = await this.sinks.project.read(fileName)
					if(data) {
						this.config = Object.assign(this.config, JSON.parse(data))
						this.configFileName = fileName
					}
				}
				catch(e) {
					this.log.error({
						msg: `Could not load config file ${fileName}`
						, error: e
					})
				}
			}

			
			if(!this.config.development) {
				this.config.development = false
			}
			if(process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'development') {
				this.config.development = true
			}
			
			this.development = this.config.development

			if (!this.compositeRouter) {
				this.compositeRouter = this.createCompositeRouter()
			}
			
			// add long expiration headers for any URL that starts with /vrsc/<some number>
			this.routers.preParmParse.use(createLongExpirationMiddleware(this))
			
			// sets up the ability to add post processing to response rendering
			this.routers.preParmParse.use(createResponseFilters(this))

			// parse the Accept-Languages header to determine what languages the user desires
			this.routers.preStatic.use(acceptLanguageMiddleware)
			
			this.initialized = true
		}
	}

	/**
	 * Adds a template directory. This is a no-op until extended by other code.
	 * @param {string} path 
	 * @param {object} options
	 * @param {boolean} options.immutable True if contents of the directory won't changed. If unspecified,
	 * assumed true in production and false in development.
	 */
	addTemplateDir(path, { immutable } = {}) {
	}

	/**
	 * Serves static files from the path specified. In the base webhandle, all that happens is
	 * that loader is created and added to `staticLoaders`. When extended by express, a static
	 * server is created and added to a router.
	 * @param {string} path 
	 * @param {object} [options] Options
	 * @param {string} [options.urlPrefix] Even though the folder structure at that location 
	 * doesn't have the prefix folders, any request for those resources must.
	 * @param {string} [options.fixedSetOfFiles] If true, it will be assumed that the resources are at a
	 * fixed, known set of URLs. That is, if a url can't be found the first time it's searched for
	 * it won't be found subsequent times either. This let's us optimize server files from libraries
	 * or otherwise unchanging sets. This is assumed true if `development` is not true.
	 */
	addStaticDir(path,  {urlPrefix, fixedSetOfFiles} = {}) {
		if(fixedSetOfFiles === undefined || fixedSetOfFiles === null) {
			// If we're not in development mode and we're not told, then
			// assume this is some dependency with a fixed set of files.
			fixedSetOfFiles = !this.development
		}
		
		path = this.getAbsolutePathFromProjectRelative(path)

		let info = {urlPrefix, fixedSetOfFiles, path}
		this.staticPaths.push(info)
		
		let loader = new createFileSinkLoader(new FileSink(path))
		if(urlPrefix) {
			loader = createPrefixRemovingLoader(loader, urlPrefix)
		}
		if(fixedSetOfFiles) {
			loader = createRememberPassingLoader(loader)
		}
	
		info.loader = loader
		this.staticLoaders.push(loader)
		
		return info
	}
	
	/**
	 * Renders data based on templates 
	 * @param {string} templateName The name of the template to render
	 * @param {object:string} [data] The data processed by the template
	 * @param {function(err, content)} [callback] If supplied, the callback will receive the content of template rendered 
	 * @param {stream} [destination] If supplied, the rendered template will be written to the output stream 
	 * @returns A promise which resolves to the rendered template content if no destination wtream is specified
	 */
	async render(templateName, data, callback, destination) {
		
		
	}

	getAbsolutePathFromProjectRelative(projectRelative) {
		if(projectRelative.startsWith('/')) {
			return projectRelative
		}
		let resolvedRoot = path.resolve(this.projectRoot)
		let absPath = path.join(resolvedRoot, projectRelative)
		return absPath
	}

	async handleRequest(req = {}, res = {}, next) {
		return this.compositeRouter(req, res, next)
	}

	createCompositeRouter() {
		let composite = this.createAppRouter()

		// Set up routes where we're doing redirects or rewrites of the url before we
		// really start processing the request
		composite.use(this.routers.preParmParse)

		// Setup basic housekeeping where we parse the body, handle file uploads, etc and get those
		// into the request object
		composite.use(this.routers.requestParse)

		// We've got a request ready now. The normal first thing to do is to see if there's
		// any static resources which match our URL. However, sometimes will want to preempt 
		// access to that static content, modify the url based on language or location, or do
		// some other task which needs to be done before the static file servers get a crack.
		composite.use(this.routers.preStatic)
		

		// At this point we've investigated and changed anything which needs to be changed.
		// This is a good place to do a specific type of logging because all parameters are
		// available, gross security was passed in preStatic, and we are about to attempt
		// to fullfill a request as it currently exists.
		composite.use(this.routers.preFullfill)

		// Sometimes you have resources that look like static files, but are actually generated
		// dynamically, or fetched from s3 before being cached locally, or built upon request
		// or something where some of the time they really will be fullfille by sever the file
		// but sometimes something else needs to happen first.
		composite.use(this.routers.syntheticStatic)

		// Set up a handler which will will call all the static severs
		// This will use the static servers for each request, so later
		// additions of static severs will always be called as well
		composite.use(this.routers.staticServers)

		// Add the primary router. This is for all the normal application code and for any
		// code which would like to populate data for rendering onto a templated paged which
		// matches the request url
		composite.use(this.routers.primary)

		composite.use(this.routers.pageServer)

		composite.use(this.routers.postPages)

		// a last chance to handle things when nothing else has
		composite.use(this.routers.notFound)


		/*
		 * There's a bit of a dance here. We want to define a router which has all the error
		 * handlers and will get to process them no matter where in our previous stack of routers the 
		 * error was thrown. However, while requests will trickle down the tree of routers and
		 * handlers, errors will not.
		 * 
		 * So, what we've got to is place an error handler on the app/top-level router. We handle
		 * that error by setting it in the response. The request continues to walk through the router
		 * tree. Problem is, now it's a request, not an error.
		 * 
		 * To get the error handlers involved we have to rethrow that error once we're in a sub-router
		 * that contains the error handlers.
		 */

		// capture an error and turn it back into a request
		let errorCapture = function (err, req, res, next) {
			if (err) {
				res.rethrowError = err
			}
			next()
		}

		// the app level error handler which catches the error from all the previous levels
		composite.use(errorCapture)

		composite.use(this.routers.errorHandlers)

		// okay, but maybe the error handlers threw errors or didn't handle them.
		// once last chance in cleanup, so we'll do another error capture
		composite.use(errorCapture)

		composite.use(this.routers.cleanup)


		// Set up the re-thrower for the error handler and cleanup routers.
		let rethrower = function (req, res, next) {
			if (res.rethrowError) {
				next(res.rethrowError)
			}
			else {
				next()
			}
		}

		this.routers.errorHandlers.use(rethrower)
		this.routers.cleanup.use(rethrower)



		return composite
	}

	createRouter() {
		return createRouter()
	}
	createAppRouter() {
		return createRouter()
	}

	createRouters() {
		let routers = {
			preParmParse: this.createRouter()
			, requestParse: this.createRouter()
			, preStatic: this.createRouter()
			, preFullfill: this.createRouter()
			, syntheticStatic: this.createRouter()
			, staticServers: this.createRouter()
			, primary: this.createRouter()
			, pageServer: this.createRouter()
			, postPages: this.createRouter()
			, notFound: this.createRouter()
			, errorHandlers: this.createRouter()
			, cleanup: this.createRouter()
		}
		
		for(let key of Object.keys(routers)) {
			routers[key].routerName = key
		}
		
		return routers
	}

	setIfUnset(attr, value) {
		if (!this[attr]) {
			this[attr] = value
		}
	}

}