
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

The routers themselves are available from `webhandle.routers`. 
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

### Loaders

Webhandle relies on 'loaders'. A loader has the signature:

```js
function(name, callback) 
```
where the callback has the signature:
```js
function(data) 
```

`data` could be any type, depending on what the loaders are loading. `name` must be a string. If the
loader can not find information for the `name`, the callback is called with `undefined`. The callback
MUST be called.

Loaders exist for things like cached information or templates, situations in which the information
may come from multiple places, but the caller has no real way to handle errors, nor do they really care,
except to handle gracefully whatever it means not to have a resource available. If it was a file resource,
that may indicate a 404 response. If it's a missing template, maybe an error in the log and a continuation
to the next part of the template.

There are some included loaders in the `lib/loaders` directory getting the members from objects and the file
system. Additionally, there are loaders provide caching functionality and combining multiple loaders into a
single loader. There is also a loader createor which takes a normal callback loader and creates one
which will accept a callback and return a promise which resolves to the `data` value passed to the callback.

Loaders are callback based, instead of async/promise based, by default because there can be a huge performance
difference in these strategies. In the case where all requested resources are cached already, the callbacks
can finish in the same tick. Since loaders may be called hundreds or thousands of times per request, the
extra ticks add up.



### Languages

The Accept-Languages header is parsed to determine the set of requested languages. On the request, the member
`requestedLanguages` is set, which is an array of lower case strings for the requested languages in preference
order. It may be empty but will not be null. 