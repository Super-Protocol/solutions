"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnvValueOrFail = void 0;
var getEnvValueOrFail = function (key) {
    var value = process.env[key];
    if (!value) {
        throw new Error("Environment variable ".concat(key, " is required but not set"));
    }
    return value;
};
exports.getEnvValueOrFail = getEnvValueOrFail;
