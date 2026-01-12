
export default function createMemberLoader(dataSource) {
	return function loader(name, callback) {
		try {
			let value = undefined
			if(name in dataSource) {
				value = dataSource[name]
			}
			if(callback) {
				callback(value)
			}
		}
		catch (e) {
			if (callback) {
				callback(undefined)
			}
		}
	}
}