const {
  override,
  addWebpackResolve,
} = require('customize-cra');
const path = require('path');

module.exports = override(
  addWebpackResolve({
    alias: { '@': path.resolve(__dirname, 'src') },
  }),
);
