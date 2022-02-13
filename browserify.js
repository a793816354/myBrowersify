const fs = require("fs");
const { resolve } = require("path");

const moduleFuncCache = {};
const codeSplicing = (path) => {
  /** 调整代码块，使其执行到require时执行我们新定义的_require
   *  获取其引用文件中的require，同样转化为_require执行，如index引入module1，module1引入module2，此时应该递归将三个文件都执行一遍
   *  以绝对路径为key，提供了module环境的代码块为value，收集所有文件代码，放到moduleFuncCache对象中，注意：编码是为了处理中文
   */
  const text = fs
    .readFileSync(path, "utf-8")
    .trim()
    .replace("require", "_require")
    .replace(/_require\(['\"](.*)['\"]\)/g, function (matched, $1) {
      codeSplicing(resolve($1));
      return `_require("${encodeURIComponent(resolve($1))}")`;
    })
    .replace(/;$/, "");

  /**
   *  eval碰到内层引用比如module2的text中的中文会失败，所以需要转码
   *  可以通过eval或者new Function将代码块在目标文件中转回js 函数
   */

  moduleFuncCache[encodeURIComponent(path)] = encodeURIComponent(`
        const module = {exports:{}};
        let {exports} = module;
        ${text}
        return module.exports
      `);
};

const getCode = (entry) => {
  // eval方式转函数
  return `
        // 自执行函数，避免全局污染
        (function(){
            const moduleCache = {}

            const _require = function(path){
                // 第一次引用该模块则执行，后续从缓存中取
                if(!moduleCache[path]) moduleCache[path] = formatModuleFuncCache[path]()
                return moduleCache[path]
            }
            
            //从json转化回对象
            const moduleFuncCache = JSON.parse('${JSON.stringify(
              moduleFuncCache
            )}')

            //转码代码块，并将类型转化成函数
            const formatModuleFuncCache = Object.entries(moduleFuncCache)
                .map(([key, value]) => {
                    return { [key]: (function(){
                                const code = decodeURIComponent(value)
                
                                eval(\` var tempFunc = function(){ \$\{code\} } \`)
                                return tempFunc
                                })()
                            };
                })
                .reduce((pre, now) => Object.assign(pre, now), {})
                
            //执行入口文件代码
            formatModuleFuncCache['${encodeURIComponent(entry)}']()
        })()
    `;
};

//主函数,传入文件路径，返回最终打包完成的代码块
const browserify = (path) => {
  // 获取绝对路径
  const wholePath = resolve(path);

  // 为每个require的模块拼接代码，为其提供module实例，并返回module.exports
  codeSplicing(wholePath);

  // 阻止代码，使其能解析代码cache对象，并依照引入顺序来执行代码块
  return getCode(wholePath);
};

// 执行命令行传入打包源文件 node ./browserify.js index.js，此时path即index.js
const [path] = process.argv.splice(2);
// 写目标文件;
fs.writeFileSync("./chunk.js", browserify(path));
