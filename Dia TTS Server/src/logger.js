"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootLogger = void 0;
var pino_1 = require("pino");
exports.rootLogger = (0, pino_1.default)({
    level: process.env.LOG_LEVEL || 'info',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
        },
    },
});
