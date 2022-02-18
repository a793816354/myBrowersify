const { extname, basename, join, dirname } = require("path");
const { execSync } = require("child_process");
const fs = require("fs");
const { getFilePath } = require("../utils/index.js");

const scriptFormat = (path, code, pathIndexMap, codeSplicing) => {
  return code
    .trim()
    .replace(/require/g, "_require")
    .replace(/_require\(['\"](.*)['\"]\)/g, function (matched, $1) {
      const filePath = /^\w+$/g.test($1) ? $1 : join(dirname(path), $1);
      if (codeSplicing) codeSplicing(filePath);

      return `_require(${pathIndexMap[getFilePath(filePath)]})`;
    })
    .replace(/;$/, "");
};

const loaderMap = {
  js(path, pathIndexMap, codeSplicing) {
    const code = scriptFormat(
      path,
      fs.readFileSync(path, "utf-8"),
      pathIndexMap,
      codeSplicing
    );

    return `
        const module = {exports:{}};
        let {exports} = module;
        ${code}
        return module.exports
    `;
  },
  css(path) {
    const cssCode = fs.readFileSync(path, "utf-8");
    return `
        try {
          const style = document.createElement("style");
          const css = document.createTextNode(\`${cssCode}\`);
          style.appendChild(css);
          document.head.appendChild(style);
        } catch(e) {}
      `;
  },
  ts(path, pathIndexMap, codeSplicing) {
    const filePath = `./test/temp_${basename(path, ".ts")}.js`;
    try {
      execSync(`tsc ${path} --outFile ${filePath}`);
    } catch (error) {}

    const code = scriptFormat(
      path,
      fs.readFileSync(getFilePath(filePath), "utf-8"),
      pathIndexMap,
      codeSplicing
    );

    fs.unlinkSync(getFilePath(filePath));
    return `
        const module = {exports:{}};
        let {exports} = module;
        ${code}
        return module.exports
    `;
  },
};

const useLoader = function (path, pathIndexMap, codeSplicing) {
  const ext = extname(path).replace(/^\./, "");
  const loader = loaderMap[ext];
  if (!loader) throw new Error(`不支持 ${loader} 文件类型`);
  return loader(path, pathIndexMap, codeSplicing);
};

module.exports = {
  useLoader,
};
