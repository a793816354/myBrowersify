const fs = require('fs')
const path = require('path')

class ConsoleLogOnBuildPlugin {
    apply(compiler) {
        compiler.run.tap('ConsoleLogOnBuildPlugin', (compilation) => {
            console.log('mini-webpack 构建正在启动！');
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

// 事件周期埋点
const execHook = (hook) => {
    Object.values(ctx[hook].pluginMap).forEach(pluginFunc => {
        pluginFunc()
    })
}

module.exports = {
    registerPlugin,
    execHook
}