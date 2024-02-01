"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var node_fs_1 = require("node:fs");
var Bootstrap5Generator = /** @class */ (function () {
    function Bootstrap5Generator(props) {
        this.cache = props === null || props === void 0 ? void 0 : props.cache;
        node_fs_1.default.readdir(__dirname, function (err, files) {
            files.forEach(function (file) {
                console.log(file);
            });
        });
    }
    Bootstrap5Generator.prototype.generateCSS = function (variables) {
        return "";
    };
    Bootstrap5Generator.prototype.getCSS = function (variables) {
        var _a, _b;
        var cachedCSS = (_a = this.cache) === null || _a === void 0 ? void 0 : _a.getCachedCCS(variables);
        if (cachedCSS)
            return cachedCSS;
        var generatedCSS = this.generateCSS(variables);
        (_b = this.cache) === null || _b === void 0 ? void 0 : _b.setCachedCSS(generatedCSS);
        return generatedCSS;
    };
    return Bootstrap5Generator;
}());
exports.default = Bootstrap5Generator;
