/**
 * Returns true if the passed value is a stream based on type and the
 * existance of a `pipe` function.
 * @param {any} obj 
 * @returns 
 */
export default function isStream(obj) {
	return obj !== null
		&& typeof obj === 'object'
		&& typeof obj.pipe === 'function';
}