const { extname, resolve, dirname, basename } = require("path");
const { execSync } = require("child_process");
const fs = require("fs");

const scriptFormat = (path, code, pathIndexMap, codeSplicing) => {
  return code
    .trim()
    .replace(/require/g, "_require")
    .replace(/_require\(['\"](.*)['\"]\)/g, function (matched, $1) {
      const filePath = resolve(dirname(path), $1);
      if (codeSplicing) codeSplicing(filePath);

      return `_require(${pathIndexMap[resolve(filePath)]})`;
    })
    .replace(/;$/, "");
};

const loaderMap = {
  js(path, pathIndexMap, codeSplicing) {
    const code = scriptFormat(
      path,
      fs.readFileSync(path, "utf-8"),
      pathIndexMap,
      codeSplicing,
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
    } catch (error) { }

    const code = scriptFormat(
      path,
      fs.readFileSync(resolve(filePath), "utf-8"),
      pathIndexMap,
      codeSplicing,
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

const useLoader = function (path, pathIndexMap, codeSplicing) {
  const ext = extname(path).replace(/^\./, "");
  const loader = loaderMap[ext];
  if (!loader) throw new Error(`不支持 ${loader} 文件类型`);
  return loader(path, pathIndexMap, codeSplicing);
};

module.exports = {
  useLoader,
};
