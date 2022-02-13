const { obj } = require("./module1.js");
const module2 = require("./module2.js");

obj.name = "jane";
obj.age += 30;

console.log(obj);
console.log(module2);
