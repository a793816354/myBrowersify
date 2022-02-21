const arr = [{ name: 'ccc' }, { age: 10 }]
const obj = arr.reduce(Object.assign, {})
console.log(obj);