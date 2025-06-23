"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServerConfig = void 0;
var path_1 = require("path");
var config_1 = require("./config");
var env_utils_1 = require("./env-utils");
var serverConfig;
var getServerConfig = function () {
    if (!serverConfig) {
        serverConfig = {
            privateKeyFilePath: path_1.default.join(__dirname, config_1.config.certPrivateKeyFileName),
            certificateFilePath: path_1.default.join(__dirname, config_1.config.certFileName),
            port: Number.parseInt((0, env_utils_1.getEnvValueOrFail)('HTTPS_PORT')),
            tlsKey: (0, env_utils_1.getEnvValueOrFail)('TLS_KEY'),
            tlsCert: (0, env_utils_1.getEnvValueOrFail)('TLS_CERT'),
            diaServerPath: path_1.default.join(__dirname, '../dia-tts-server'),
        };
    }
    return serverConfig;
};
exports.getServerConfig = getServerConfig;
