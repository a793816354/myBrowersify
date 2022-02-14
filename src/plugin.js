const fs = require('fs')
const path = require('path')
const moment = require("moment")

class ConsoleLogOnBuildPlugin {
    apply(compiler) {
        const start = Date.now()

        compiler.run.tap('ConsoleLogOnBuildPlugin', (compilation) => {
            console.log(`${moment(start).format("YYYY-MM-DD HH:mm:ss")}: mini-webpack 构建正在启动！`);
        });

        compiler.seal.tap('ConsoleLogOnBuildPlugin', (compilation) => {
            console.log(`${moment().format("YYYY-MM-DD HH:mm:ss")}: mini-webpack 构建完成！`);
            console.log(`构建时长: ${Date.now() - start}`);
        });
    }
}

const pluginList = [
    new ConsoleLogOnBuildPlugin()
]

// -------------------------------------------------------------------

const ctx = {
    beforeRun: {
        pluginMap: {},
        tap(pluginName, callback) {
            this.pluginMap[pluginName] = callback
        },
    },
    run: {
        pluginMap: {},
        tap(pluginName, callback) {
            this.pluginMap[pluginName] = callback
        },
    },
    beforeCompile: {
        pluginMap: {},
        tap(pluginName, callback) {
            this.pluginMap[pluginName] = callback
        },
    },
    compile: {
        pluginMap: {},
        tap(pluginName, callback) {
            this.pluginMap[pluginName] = callback
        },
    },
    make: {
        pluginMap: {},
        tap(pluginName, callback) {
            this.pluginMap[pluginName] = callback
        },
    },
    seal: {
        pluginMap: {},
        tap(pluginName, callback) {
            this.pluginMap[pluginName] = callback
        },
    },
}

const registerPlugin = () => {
    pluginList.forEach(plugin => {
        plugin.apply(ctx)
    })
}

// 生命周期事件埋点
const execHook = (hook) => {
    //批量执行该此生命周期注册的函数列表
    Object.values(ctx[hook].pluginMap).forEach(pluginFunc => {
        pluginFunc()
    })
}

module.exports = {
    registerPlugin,
    execHook
}