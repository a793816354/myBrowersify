// const resolve = require("enhanced-resolve");
const fs = require("fs");
const { resolve, join, dirname } = require("path");

const log = (data) => {
  try {
    fs.writeFileSync("./log.conf", JSON.stringify(data));
  } catch (error) {
    fs.writeFileSync("./log.conf", data);
  }
};

const getFilePath = (path) => {
  if (/^\w+$/g.test(path)) {
    const initPath = join(__dirname, "../", "node_modules", path);
    if (
      fs.existsSync(initPath) &&
      fs.existsSync(join(initPath, "package.json"))
    ) {
      const { main } = JSON.parse(
        fs.readFileSync(join(initPath, "package.json"))
      );

      if (fs.existsSync(initPath)) return join(initPath, main);
    } else {
      let curPath = initPath;
      const isRoot = /[A-Z]\:\\/.test(curPath);
      while (!isRoot && !fs.existsSync(`${curPath}.js`)) {
        curPath = join(curPath, "../");
      }

      return curPath;
    }
  }
  // 绝对路径, 相对路径
  return resolve(path);
};

module.exports = {
  getFilePath,
  log,
};
