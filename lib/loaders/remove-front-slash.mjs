
export default function removeFrontSlash(value) {
	while(value.startsWith('/')) {
		value = value.substring(1)
	}
	return value
}