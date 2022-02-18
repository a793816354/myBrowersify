const fs = require("fs");
const { useLoader } = require("./loader.js");
const { registerPlugin, execHook } = require("./plugin");
const { getFilePath, log } = require("../utils/index.js");
const { resolve } = require("path");

//注册插件
registerPlugin();

execHook("beforeRun");
//开始初始化参数
let moduleFuncCache = [];
let curIndex = 0;

let pathIndexMap = {}; //记录path和数组对应资源数组位置
let requireCountMap = {};
const codeSplicing = (path) => {
  // 获取绝对路径
  const wholePath = getFilePath(path);
  log(wholePath);
  if (!requireCountMap[wholePath]) requireCountMap[wholePath] = 0;
  requireCountMap[wholePath]++;

  if (pathIndexMap[wholePath] !== undefined) return;

  moduleFuncCache.push(`
    function(){
      ${useLoader(wholePath, pathIndexMap, codeSplicing)}
    }
  `);
  pathIndexMap[wholePath] = curIndex++;
};

const singleCodeSplicing = (path) => {
  // 获取绝对路径
  const wholePath = getFilePath(path);

  return `
    function(){
      ${useLoader(wholePath, pathIndexMap)}
    }
`;
};

const generateFile = () => {
  //分包
  // 1.准备工作包
  // 2.主体内容包
  // 3.共通依赖包(被引用3次以上)
  // 4.执行代码包
  const distPath = "./dist";
  console.log(requireCountMap);

  const mainModule = moduleFuncCache.slice();
  const commonModule = moduleFuncCache.slice();
  Object.entries(requireCountMap).forEach(([path, count]) => {
    const curIndex = pathIndexMap[path];
    if (count > 2) {
      mainModule[curIndex] = undefined;
    } else {
      commonModule[curIndex] = undefined;
    }
  });

  const prepareCode = `
    const moduleCache = []
    const _require = function(index){
      // 第一次引用该模块则执行，后续从缓存中取
      if(!moduleCache[index]) moduleCache[index] = formatModuleFuncCache[index]()
      return moduleCache[index]
    }
  `;
  fs.writeFileSync(resolve(distPath, "prepareCode.js"), prepareCode);
  const mainCode = `
    //数组收集，省去了json序列化的过程，从而省去转码的过程
    const formatModuleFuncCache = [${mainModule}]
  `;
  fs.writeFileSync(resolve(distPath, "mainCode.js"), mainCode);
  const commonCode = `
    //数组收集，省去了json序列化的过程，从而省去转码的过程
    [${commonModule}].forEach((item,index)=>{
      if(item) formatModuleFuncCache[index] = item
    })
  `;
  fs.writeFileSync(resolve(distPath, "commonModule.js"), commonCode);
  const execCode = `
    //执行入口文件代码
    formatModuleFuncCache[${moduleFuncCache.length - 1}]()
  `;
  fs.writeFileSync(resolve(distPath, "execCode.js"), execCode);
};

//主函数,传入文件路径，返回最终打包完成的代码块
const browserify = (path, changeFilePath = "") => {
  execHook("run");
  // 读取moduleFuncCache缓存
  try {
    const cache = JSON.parse(
      fs.readFileSync("./src/moduleFuncCache.js", "utf-8")
    );
    pathIndexMap = cache.pathIndexMap;
    requireCountMap = cache.requireCountMap;
    moduleFuncCache = cache.moduleFuncCache;
  } catch (error) {}

  const pathIndex = pathIndexMap[getFilePath(changeFilePath)];
  if (changeFilePath && pathIndex !== undefined && moduleFuncCache.length) {
    moduleFuncCache[pathIndex] = singleCodeSplicing(changeFilePath);
  } else {
    console.log(456);
    // 为每个require的模块拼接代码，为其提供module实例，并返回module.exports
    codeSplicing(path);
  }

  // 缓存当前moduleFuncCache
  fs.writeFileSync(
    "./src/moduleFuncCache.js",
    JSON.stringify({
      pathIndexMap,
      requireCountMap,
      moduleFuncCache,
    })
  );

  // 阻止代码，使其能解析代码cache对象，并依照引入顺序来执行代码块
  execHook("beforeCompile");
  // 生成文件
  generateFile();
  execHook("compile");
};

// 执行命令行传入打包源文件 node ./browserify.js index.js，此时path即index.js
const [path, changeFilePath] = process.argv.splice(2);
execHook("make");
// 写目标文件;
try {
  fs.mkdirSync("./dist");
} catch (error) {}
browserify(path, changeFilePath);
execHook("seal");
