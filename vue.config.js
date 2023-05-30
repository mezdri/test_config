module.exports = {
  publicPath: process.env.BASE_URL,
  productionSourceMap: true,
  configureWebpack: config => {
    config.devtool = 'source-map';
    if (process.env.NODE_ENV === 'development') {
      config.devtool = 'eval-source-map';

      config.output.devtoolModuleFilenameTemplate = info =>
        info.resourcePath.match(/\.vue$/) &&
        !info.identifier.match(/type=script/)
          ? `webpack-generated:///${info.resourcePath}?${info.hash}`
          : `webpack-src:///${info.resourcePath}`;

      config.output.devtoolFallbackModuleFilenameTemplate =
        'webpack:///[resource-path]?[hash]';
    }
  },
};
