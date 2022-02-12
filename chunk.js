
        // 自执行函数，避免全局污染
        (function(){
            const moduleCache = []
            const _require = function(index){
                // 第一次引用该模块则执行，后续从缓存中取
                if(!moduleCache[index]) moduleCache[index] = formatModuleFuncCache[index]()
                return moduleCache[index]
            }

            //数组收集，省去了json序列化的过程，从而省去转码的过程
            const formatModuleFuncCache = [
    function(){
      const module = {exports:{}};
      let {exports} = module;
      const obj = {
  name: "obj",
  age: 30,
};
module.exports = {
  obj,
}
      return module.exports
    }
  ,
    function(){
      const module = {exports:{}};
      let {exports} = module;
      const { obj } = _require(0);

obj.name = "jane";

module.exports = {
  obj,
}
      return module.exports
    }
  ,
    function(){
      const module = {exports:{}};
      let {exports} = module;
      const { obj } = _require(1);

obj.name = "jane";
obj.age += 30;

console.log(obj)
      return module.exports
    }
  ]

            //执行入口文件代码
            formatModuleFuncCache[2]()
        })()
    