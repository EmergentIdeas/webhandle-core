import isStream from "../../lib/is-stream.mjs"

/**
 * A renderer which performs according to contract
 * @param {*} templateName 
 * @param {*} data 
 * @param {*} callback 
 * @param {*} destination 
 * @returns 
 */
export default async function dumbRender(templateName, data, callback, destination) {
	
	if(typeof data === 'function') {
		callback = data
		data = undefined
	}
	else if(isStream(data)) {
		destination = data
		data = callback = undefined
	}
	else {
		if(isStream(callback)) {
			destination = callback
			callback = undefined
		}
	}

	let content = templateName + JSON.stringify(data)
	
	if(destination) {
		destination.write(content)
		if(callback) {
			try {
				callback()
			}
			catch(e) {
			}
			return
		}
		else {
			return
		}
	}
	else if(callback) {
		try {
			callback(null, content)
		}
		catch(e) {
		}
	}

	return content
}