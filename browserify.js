const fs = require("fs");
const { resolve } = require("path");

const moduleFuncCache = [];
let curIndex = 0;

//记录path和数组对应资源数组位置
const pathIndexMap = {};
const codeSplicing = (path) => {
  // 获取绝对路径
  const wholePath = resolve(path);

  if (pathIndexMap[wholePath] !== undefined) return;

  const text = fs
    .readFileSync(wholePath, "utf-8")
    .trim()
    .replace(/require/g, "_require")
    .replace(/_require\(['\"](.*)['\"]\)/g, function (matched, $1) {
      codeSplicing($1);
      return `_require(${pathIndexMap[resolve($1)]})`;
    })
    .replace(/;$/, "");

  moduleFuncCache.push(`
    function(){
      const module = {exports:{}};
      let {exports} = module;
      ${text}
      return module.exports
    }
  `);
  pathIndexMap[wholePath] = curIndex++;
};

const getCode = () => {
  // eval方式转函数
  return `
        // 自执行函数，避免全局污染
        (function(){
            const moduleCache = []
            const _require = function(index){
                // 第一次引用该模块则执行，后续从缓存中取
                if(!moduleCache[index]) moduleCache[index] = formatModuleFuncCache[index]()
                return moduleCache[index]
            }

            //数组收集，省去了json序列化的过程，从而省去转码的过程
            const formatModuleFuncCache = [${moduleFuncCache}]

            //执行入口文件代码
            formatModuleFuncCache[${moduleFuncCache.length - 1}]()
        })()
    `;
};

//主函数,传入文件路径，返回最终打包完成的代码块
const browserify = (path) => {
  // 为每个require的模块拼接代码，为其提供module实例，并返回module.exports
  codeSplicing(path);

  // 阻止代码，使其能解析代码cache对象，并依照引入顺序来执行代码块
  return getCode();
};

// 执行命令行传入打包源文件 node ./browserify.js index.js，此时path即index.js
const [path] = process.argv.splice(2);
// 写目标文件;
fs.writeFileSync("./chunk.js", browserify(path));
