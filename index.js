const { obj } = require("./module1.js");

obj.name = "jane";
obj.age += 20;

console.log(obj); //{ name: 'jane', age: 30 }
