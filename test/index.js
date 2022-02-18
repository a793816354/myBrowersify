const { obj } = require("./module1.js");
const module2 = require("./module2.js");
const { weather } = require("./module3.ts");
require("../asserts/css/color.css");

const moment = require("moment");

// const func = () => {
//   document.body.innerText = `now time: ${moment().format(
//     "YYYY-MM-DD HH:mm:ss"
//   )}`;
// };
// setInterval(func, 100);

obj.name = "jane";
obj.age += 10;
// document.write(obj.age);
console.log(obj);
console.log(module2);
console.log(weather);
