
        // 自执行函数，避免全局污染
        (function(){
            const moduleCache = {}

            const _require = function(path){
                // 第一次引用该模块则执行，后续从缓存中取
                if(!moduleCache[path]) moduleCache[path] = formatModuleFuncCache[path]()
                return moduleCache[path]
            }
            
            //从json转化回对象
            const moduleFuncCache = JSON.parse('{"F%3A%5C%E9%9D%A2%E8%AF%95%E9%A2%98%5Cnodejs%E5%AD%A6%E4%B9%A0%5C%E6%A8%A1%E5%9D%97%5CmyBrowersify.js%5Cmodule2.js":"%0A%20%20%20%20%20%20%20%20const%20module%20%3D%20%7Bexports%3A%7B%7D%7D%3B%0A%20%20%20%20%20%20%20%20let%20%7Bexports%7D%20%3D%20module%3B%0A%20%20%20%20%20%20%20%20const%20obj%20%3D%20%7B%0D%0A%20%20name%3A%20%22obj%22%2C%0D%0A%20%20age%3A%2010%2C%0D%0A%7D%3B%0D%0Amodule.exports%20%3D%20%7B%0D%0A%20%20obj%2C%0D%0A%7D%0A%20%20%20%20%20%20%20%20return%20module.exports%0A%20%20%20%20%20%20","F%3A%5C%E9%9D%A2%E8%AF%95%E9%A2%98%5Cnodejs%E5%AD%A6%E4%B9%A0%5C%E6%A8%A1%E5%9D%97%5CmyBrowersify.js%5Cmodule1.js":"%0A%20%20%20%20%20%20%20%20const%20module%20%3D%20%7Bexports%3A%7B%7D%7D%3B%0A%20%20%20%20%20%20%20%20let%20%7Bexports%7D%20%3D%20module%3B%0A%20%20%20%20%20%20%20%20const%20%7B%20obj%20%7D%20%3D%20_require(%22F%253A%255C%25E9%259D%25A2%25E8%25AF%2595%25E9%25A2%2598%255Cnodejs%25E5%25AD%25A6%25E4%25B9%25A0%255C%25E6%25A8%25A1%25E5%259D%2597%255CmyBrowersify.js%255Cmodule2.js%22)%3B%0D%0A%0D%0Aobj.name%20%3D%20%22jane%22%3B%0D%0A%0D%0Amodule.exports%20%3D%20%7B%0D%0A%20%20obj%2C%0D%0A%7D%0A%20%20%20%20%20%20%20%20return%20module.exports%0A%20%20%20%20%20%20","F%3A%5C%E9%9D%A2%E8%AF%95%E9%A2%98%5Cnodejs%E5%AD%A6%E4%B9%A0%5C%E6%A8%A1%E5%9D%97%5CmyBrowersify.js%5Cindex.js":"%0A%20%20%20%20%20%20%20%20const%20module%20%3D%20%7Bexports%3A%7B%7D%7D%3B%0A%20%20%20%20%20%20%20%20let%20%7Bexports%7D%20%3D%20module%3B%0A%20%20%20%20%20%20%20%20const%20%7B%20obj%20%7D%20%3D%20_require(%22F%253A%255C%25E9%259D%25A2%25E8%25AF%2595%25E9%25A2%2598%255Cnodejs%25E5%25AD%25A6%25E4%25B9%25A0%255C%25E6%25A8%25A1%25E5%259D%2597%255CmyBrowersify.js%255Cmodule1.js%22)%3B%0D%0Aconst%20module2%20%3D%20_require(%22F%253A%255C%25E9%259D%25A2%25E8%25AF%2595%25E9%25A2%2598%255Cnodejs%25E5%25AD%25A6%25E4%25B9%25A0%255C%25E6%25A8%25A1%25E5%259D%2597%255CmyBrowersify.js%255Cmodule2.js%22)%3B%0D%0A%0D%0Aobj.name%20%3D%20%22jane%22%3B%0D%0Aobj.age%20%2B%3D%2020%3B%0D%0A%0D%0Aconsole.log(obj)%3B%0D%0Aconsole.log(module2)%0A%20%20%20%20%20%20%20%20return%20module.exports%0A%20%20%20%20%20%20"}')

            //转码代码块，并将类型转化成函数
            const formatModuleFuncCache = Object.entries(moduleFuncCache)
                .map(([key, value]) => {
                    return { [key]: (function(){
                                const code = decodeURIComponent(value)
                
                                eval(` var tempFunc = function(){ ${code} } `)
                                return tempFunc
                                })()
                            };
                })
                .reduce((pre, now) => Object.assign(pre, now), {})
                
            //执行入口文件代码
            formatModuleFuncCache['F%3A%5C%E9%9D%A2%E8%AF%95%E9%A2%98%5Cnodejs%E5%AD%A6%E4%B9%A0%5C%E6%A8%A1%E5%9D%97%5CmyBrowersify.js%5Cindex.js']()
        })()
    