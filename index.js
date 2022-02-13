const { obj } = require("./module1.js");
const module2 = require("./module2.js");

obj.name = "jane";
obj.age += 20;

console.log(obj);
console.log(module2);
