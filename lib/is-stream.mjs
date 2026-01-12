export default function isStream(obj) {
	return obj !== null
		&& typeof obj === 'object'
		&& typeof obj.pipe === 'function';
}