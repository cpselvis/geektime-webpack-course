const fs = require('fs');
const path = require('path');

const getContent = (matched, reg, resourcePath) => {
    const result = matched.match(reg);
    const relativePath = result && result[1];
    const absolutePath = path.join(path.dirname(resourcePath), relativePath);
    return fs.readFileSync(absolutePath, 'utf-8');
};

module.exports = function(content) {
  const htmlReg = /<link.*?href=".*?\__inline">/gmi;
  const jsReg = /<script.*?src=".*?\?__inline".*?>.*?<\/script>/gmi;

  content = content.replace(jsReg, (matched) => {
    const jsContent = getContent(matched, /src="(.*)\?__inline/, this.resourcePath);
    return `<script type="text/javascript">${jsContent}</script>`;
  }).replace(htmlReg, (matched) => {
    const htmlContent = getContent(matched, /href="(.*)\?__inline/, this.resourcePath);
    return htmlContent;
  });

  return `module.exports = ${JSON.stringify(content)}`;
}