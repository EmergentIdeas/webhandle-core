
## Creating a webhandle and get it listening to network traffic
```js
import Webhandle from "@webhandle/core/webhandle.mjs";
import listenOnHttpServer from "@webhandle/core/lib/listen-on-http-server.mjs";

let webhandle = new Webhandle()
await webhandle.init()
await listenOnHttpServer(webhandle)
```

## Features

### Routing
Express routing is infinitely flexible. Most projects have an understandable, more
constrained request lifecyle though. Webhandle plans that flexibility by adding a 
router for each point in the request lifecycle.

The routers themselves are available from `webhandle).routers`. 
The child routers, in the order they are called are:

* preParmParse: a chance to process the request before the body parser, url parser, cookie parser, etc.
* requestParse: converts the raw http info into more usable objects on the request
* preStatic: after the request is processed before static file resources are served
* preFullfill: the last step before an attempt to fullfill the request is made. A good point for logging.
* staticServers: serves file content
* primary: router for normal request handling
* pageServer: renders templates in the pages folder
* postPages: last chance if no pages are matched
* errorHandlers: not normal routers, but a set run on an error
* cleanup: "routers" for after the content has been served

### Versioned Files

Sometimes you want a browser to cache a file pretty much forever. If the file changes though,
you also need to signal to the browser that it needs to update the file. A frequent response
is to version files. Webhandle does course grain versioning.

Any URL which starts with `/vrsc/<some sequence of digits>` will have the headers set to tell the
browser to cache the file for 10 years. The url is then rewritten internally so that the request is
fullfilled as if that prefix wasn't there.

So, if the user requests `/vrsc/12344124/img/cat.jpg`, the request is fullfilled with `/img/cat.jpg`.

If you had to hard code that prefix this wouldn't be helpful. However, each webhandle instance has
a member `resourceVersion` which is set to the timestamp of its creation. Additionally,
```js
res.locals.vrsc = '/vrsc/' + webhandle.resourceVersion
```
is run to set the prefix as part of the response locals. However, if 
```js
process.env.NODE_ENV != 'development'
```
then `res.locals.vrsc` is set to the empty string.

To force clients to get updated files, the instances `resourceVersion` number can be changed or the
app can be reloaded.

### Response Rendering Postprocessing Filters

After the templates render the response content, there's an opportunity to change the output text.
Filters are added on a per response basis.

To register a new filter, call
```js
res.addFilter((html) => html.toUpperCase())
```
You can pass either a function or a transform stream.


This will be used when 
```js
res.render('some/template')
```
is called.

The main use case for this is to rewrite the html forms to set their current values. This is incredibly
useful because it allows you to render the html for forms without using special components or markup.

This is done like:
```js
import formValueInjector from 'form-value-injector'
res.addFilter(html => {
	return formValueInjector(html, myDataObject)
})
```

This works regardless of what templating engine is used.



