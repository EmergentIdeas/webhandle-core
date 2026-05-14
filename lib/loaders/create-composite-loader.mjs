/**
 * Takes one or more arguments which are loaders and returns a single loader which
 * will ask all the passed loaders for a value, returning the first non-undefined
 * value. "First" is a little less than exact since loaders may need asynchronous calls
 * to find their values.
 * @param  {...function} loaders 
 * @returns The loader returned has a member `loaders` holding the loaders that will
 * be run.
 */
export default function createCompositeLoader(...loaders) {
	let loader = function(name, callback) {
		let loaderTotal
		let loaderCount = 0
		let replied = false
		
		function handle(data) {
			loaderCount++
			if(replied) {
				return
			}
			if(data !== undefined) {
				replied = true
				if(callback) {
					callback(data)
				}
				// If there was a callback, we told them about the data. 
				// we can stop processing
				return
			}
			if(!replied) {
				if(loaderCount >= loaderTotal || loaderCount >= loaders.length) {
					// Somebody shouldn't be adding/removing loaders, but if they are,
					// we want to be sure we return something, even though that something
					// will be wrong.
					
					// Either way, we didn't get told about data in time, so we'll call the 
					// callback now if there is one
					if(callback) {
						callback(undefined)
					}
				}
			}
		}

		// Let's see if we can find loaders known to have access to the resource
		let candidates = []
		for(let ld of loaders) {
			if(ld.getStatus && ld.getStatus(name)) {
				candidates.push(ld)
			}
		}
		
		if(candidates.length > 0) {
			// Do we have a known value?
			for(let ld of candidates) {
				if(ld.getValue) {
					let value = ld.getValue(name)
					if(value !== undefined) {
						if(callback) {
							callback(value)
						}
						return
					}
				}
			}
			
			// Okay, no known value, but can we still try load the template
		}
		else {
			// Well, okay, we didn't have any loader who claims to have that template.
			// Let's eliminate anybody who claims they definitely don't have that 
			// template before we run

			candidates.length = 0
			// Let's find candidates where we're not sure that no resource is available
			for(let ld of loaders) {
				if(!ld.getStatus) {
					candidates.push(ld)
				}
				else if(ld.getStatus(name) !== false) {
					candidates.push(ld)
				}
			}
		}
		
		loaderTotal = candidates.length
		loaderCount = 0
		if(loaderTotal === 0) {
			if(callback) {
				callback(undefined)
			}
		}
		else {
			candidates.forEach(loader => loader(name, handle))
		}
	}
	loader.loaders = loaders
	
	loader.getStatus = function(key) {
		let statusLoaders = loaders.filter(ld => !!ld.getStatus)
		if(statusLoaders.find(ld => ld.getStatus(key))) {
			return true
		}
		
		if(statusLoaders.length === loaders.length) {
			// If the number of status loaders is the same as the number of total
			// loaders, and all of the loaders return false, then we can assume
			// we can't find it in loaders.
			if(statusLoaders.every(ld => ld.getStatus(key) === false)) {
				return false
			}
		}
		
		// Either we have loaders who don't expose their status or some that have
		// undefined as their status, so we'll say we don't know.
		return undefined
	}
	
	loader.getValue = function(key) {
		let statusLoaders = loaders.filter(ld => !!ld.getStatus && !!ld.getValue)
		for(let ld of statusLoaders) {
			if(ld.getStatus(key) === true) {
				let value = ld.getValue(key)
				if(value !== undefined) {
					return value
				}
			}
		}
		return undefined
	}
	
	return loader
}