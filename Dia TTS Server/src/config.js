"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
var dotenv_1 = require("dotenv");
var path_1 = require("path");
var package_json_1 = require("../package.json");
dotenv_1.default.config();
exports.config = {
    appName: package_json_1.default.name,
    appVersion: package_json_1.default.version,
    logLevel: process.env.LOG_LEVEL || 'info',
    certFileName: process.env.CERT_FILE_NAME || 'certificate.crt',
    certPrivateKeyFileName: process.env.CERT_PRIVATE_KEY_FILE_NAME || 'private.pem',
    clientServerPort: 8003, // Порт для Dia-TTS-Server
    serverFilePath: path_1.default.join(__dirname, './server.js'),
};
