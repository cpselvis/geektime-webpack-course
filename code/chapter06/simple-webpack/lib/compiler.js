
const fs = require('fs');
const path = require('path');
const { getAST, getDependencis, transform } = require('./parser');


module.exports = class Compiler {
    constructor(options) {
        const { entry, output } = options;
        this.entry = entry;
        this.output = output;
        this.modules = [];
    }

    run() {
        const entryModule = this.buildModule(this.entry, true);
        this.modules.push(entryModule);
        for(let i = 0; i < this.modules.length; i++) {
            const _module = this.modules[i];
            _module.dependencies.forEach((dependency) => {
                this.modules.push(this.buildModule(dependency));
            });
        }
        this.emitFiles();
    }

    buildModule(filename, isEntry) {
        let ast;
        if (isEntry) {
            ast = getAST(filename);
        } else {
            let absolutePath = path.join(process.cwd(), './src', filename);
            ast = getAST(absolutePath);
        }

        return {
          filename,
          dependencies: getDependencis(ast),
          transformCode: transform(ast)
        };
    }

    emitFiles() {
        const outputPath = path.join(this.output.path, this.output.filename);
        let modules = '';
        this.modules.map((_module) => {
            modules += `'${ _module.filename }': function (require, module, exports) { ${ _module.transformCode } },`
        });

        const bundle = `
            (function(modules) {
                function require(fileName) {
                    const fn = modules[fileName];

                    const module = { exports : {} };

                    fn(require, module, module.exports);

                    return module.exports;
                }

                require('${this.entry}');
            })({${modules}})
        `;

        if(!fs.existsSync(this.output.path)) {
          fs.mkdirSync(this.output.path)
        };

        fs.writeFileSync(outputPath, bundle, 'utf-8');
    }
};
