const { extname, resolve, dirname, basename } = require("path");
const { execSync } = require("child_process");
const fs = require("fs");

const scriptFormat = (path, code, codeSplicing, pathIndexMap) => {
  return code
    .trim()
    .replace(/require/g, "_require")
    .replace(/_require\(['\"](.*)['\"]\)/g, function (matched, $1) {
      const filePath = resolve(dirname(path), $1);
      codeSplicing(filePath);

      return `_require(${pathIndexMap[resolve(filePath)]})`;
    })
    .replace(/;$/, "");
};

const loaderMap = {
  js(path, codeSplicing, pathIndexMap) {
    const code = scriptFormat(
      path,
      fs.readFileSync(path, "utf-8"),
      codeSplicing,
      pathIndexMap
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
          style.innerText = \`${cssCode}\`
          document.head.appendChild(style)
        } catch(e) {}
      `;
  },
  ts(path, codeSplicing, pathIndexMap) {
    const filePath = `./test/temp_${basename(path, ".ts")}.js`;
    try {
      execSync(`tsc ${path} --outFile ${filePath}`);
    } catch (error) { }

    const code = scriptFormat(
      path,
      fs.readFileSync(resolve(filePath), "utf-8"),
      codeSplicing,
      pathIndexMap
    );

    fs.unlinkSync(resolve(filePath));
    return `
        const module = {exports:{}};
        let {exports} = module;
        ${code}
        return module.exports
    `;
  },
};

const useLoader = function (path, codeSplicing, pathIndexMap) {
  const ext = extname(path).replace(/^\./, "");
  const loader = loaderMap[ext];
  if (!loader) throw new Error(`不支持 ${loader} 文件类型`);
  return loader(path, codeSplicing, pathIndexMap);
};

module.exports = {
  useLoader,
};
