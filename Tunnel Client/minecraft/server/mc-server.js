const mcServer = require("flying-squid");
const settings = require("./settings.json");
const pino = require("pino");
const path = require("path");

const logger = pino().child({ class: "mcServer" });

settings.worldFolder = path.resolve(__dirname, "..", "dist/world");

module.exports = mcServer.createMCServer(settings);

process.on("unhandledRejection", (err) => {
  logger.error(err.stack);
});

process.on("uncaughtException", (err) => {
  logger.error(err.stack);
});
