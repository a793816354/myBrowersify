const fs = require("fs");
const { resolve } = require("path");
const { useLoader } = require("./loader.js");

let moduleFuncCache = [];
let curIndex = 0;

//记录path和数组对应资源数组位置
let pathIndexMap = {};
const codeSplicing = (path, force = false) => {
  // 获取绝对路径
  const wholePath = resolve(path);
  if (pathIndexMap[wholePath] !== undefined && !force) return;

  moduleFuncCache.push(`
    function(){
      ${useLoader(wholePath, codeSplicing, pathIndexMap)}
    }
  `);
  pathIndexMap[wholePath] = curIndex++;
};



//主函数,传入文件路径，返回最终打包完成的代码块
const browserify = (path, changeFilePath = '') => {
  // 读取moduleFuncCache缓存
  try {
    const cache = JSON.parse(fs.readFileSync("./src/moduleFuncCache.js", 'utf-8'))
    console.log(cache);
    Object.entries(cache.pathIndexMap).forEach(([key, value]) => { pathIndexMap[key] = value })
    cache.moduleFuncCache.forEach((item, index) => moduleFuncCache[index] = item)
  } catch (error) { }

  const pathIndex = pathIndexMap[resolve(changeFilePath)]
  if (changeFilePath && pathIndex !== undefined && moduleFuncCache.length) {
    const temp = moduleFuncCache.slice()
    moduleFuncCache.length = 0
    codeSplicing(changeFilePath, true);
    console.log('moduleFuncCachedsadsadsa');
    console.log(changeFilePath);
    console.log(moduleFuncCache);
    const [newModule] = moduleFuncCache

    temp.forEach((item, index) => moduleFuncCache[index] = item)
    moduleFuncCache[pathIndex] = newModule
  } else {
    console.log(456);
    // 为每个require的模块拼接代码，为其提供module实例，并返回module.exports
    codeSplicing(path);
  }

  // 缓存当前moduleFuncCache
  fs.writeFileSync("./src/moduleFuncCache.js", JSON.stringify({
    pathIndexMap,
    moduleFuncCache
  }))

  // 阻止代码，使其能解析代码cache对象，并依照引入顺序来执行代码块
  return getCode();
};

const getCode = () => {
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

// 执行命令行传入打包源文件 node ./browserify.js index.js，此时path即index.js

const [path, changeFilePath] = process.argv.splice(2);
// 写目标文件;
try {
  fs.mkdirSync("./dist");
} catch (error) { }
fs.writeFileSync("./dist/chunk.js", browserify(path, changeFilePath));
