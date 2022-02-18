const { obj } = require("./module1.js");
const module2 = require("./module2.js");
const { weather } = require("./module3.ts");
require("../asserts/css/color.css");

obj.name = "jane";
obj.age += 30;

console.log(obj);
console.log(module2);
console.log(weather);
