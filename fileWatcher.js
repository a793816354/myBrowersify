const chokidar = require("chokidar");
const { execSync } = require("child_process");
const WebSocket = require("ws");

const ws = new WebSocket("ws://localhost:8080");
ws.on("open", function open() {
  ws.send(JSON.stringify({ type: "refresh", data: "testttttt" }));
});

// One-liner for current directory
const watcher = chokidar.watch(".", {
  persistent: true,
  ignored: [
    "./dist/chunk.js",
    "./test/temp *.js",
    ".git",
    ".history",
    "node_modules",
    "./src/moduleFuncCache.js",
    "log.conf",
  ],
  ignoreInitial: false,
  followSymlinks: true,
  cwd: ".",
  disableGlobbing: false,

  usePolling: false,
  interval: 100,
  binaryInterval: 300,
  alwaysStat: false,
  depth: 99,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100,
  },

  ignorePermissionErrors: false,
  atomic: true,
});

watcher
  .on("change", (path) => {
    console.log(`更改文件${path}`);
    ws.send(JSON.stringify({ type: "refresh", data: path }));
    try {
      execSync(`node ./src/browserify.js ./test/index.js ${path}`);
    } catch (error) {
      console.log(err.message);
    }
  })
  .on("unlink", (path) => {
    execSync(`node ./src/browserify.js ./test/index.js`);
  });
