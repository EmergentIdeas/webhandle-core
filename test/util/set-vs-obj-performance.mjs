function rand(max) {
	let r = Math.random()
	return Math.floor(r * max)
}
function keyForNumber(num) {
	return 'ialdfjas;lkfjas;flkjasfkafj;lkasjfl;kasjfl;kjajsdflkjas;lkfjaslk;jflk;asjflkasjflkjaslkfjaslkfjkaljflkajsf;lkasjf;alsf' + num
}

let set = new Set()
let obj = {}

let setSize = 1000000

for(let i = 0; i < setSize; i++) {
	let key = keyForNumber(i)
	set.add(key)
	obj[key] = true
}


let iterations = 100
let checkLocations = []
for(let i = 0; i < iterations; i++) {
	checkLocations[i] = keyForNumber(rand(setSize))
}


console.time('obj')
for(let i = 0; i < iterations; i++) {
	let isTrue = (checkLocations[i] in obj) === true
}
console.timeEnd('obj')

console.time('set')
for(let i = 0; i < iterations; i++) {
	let isTrue = set.has(checkLocations[i]) === true
}
console.timeEnd('set')
