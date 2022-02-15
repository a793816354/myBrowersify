const chokidar = require('chokidar');
const { execSync } = require("child_process");

// One-liner for current directory
const watcher = chokidar.watch('.', {
    persistent: true,
    ignored: ['./dist/chunk.js', './test/temp *.js', '.git', '.history', 'node_modules'],
    ignoreInitial: false,
    followSymlinks: true,
    cwd: '.',
    disableGlobbing: false,

    usePolling: false,
    interval: 100,
    binaryInterval: 300,
    alwaysStat: false,
    depth: 99,
    awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100
    },

    ignorePermissionErrors: false,
    atomic: true
})

watcher.on('change', path => {
    execSync(`node ./src/browserify.js ./test/index.js ${path}`)
})
    .on('unlink', path => {
        execSync(`node ./src/browserify.js ./test/index.js`)
    });