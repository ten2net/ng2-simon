// Based on: https://github.com/angular/angular-cli/blob/10266706e9370f2ba3617eb51d3aabb70b3b919a/packages/angular-cli/models/webpack-build-node.ts
// by: devCrossNet (https://github.com/devCrossNet)

const webpack = require('webpack');
const path = require('path');

function getWebpackNodeConfig(projectRoot, environment, appConfig) {
  const checkNodeImport = function (context, request, cb) {
    if (!path.isAbsolute(request) && request.charAt(0) !== '.') {
      cb(null, 'commonjs ' + request);
      return;
    }
    cb();
  };
  const appRoot = path.resolve(projectRoot, appConfig.root);
  const iotMain = path.resolve(appRoot, appConfig.iotMain);
  const entryName = path.basename(iotMain).replace('.ts', '');

  let entry = {};
  entry[entryName] = [iotMain];

  return {
    devtool: 'inline-source-map',
    resolve: {
      extensions: ['.ts', '.js']
    },
    context: path.resolve(__dirname, './'),
    output: {
      path: path.resolve(projectRoot, appConfig.outDir),
      filename: '[name].bundle.js',
      libraryTarget: 'commonjs2'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          enforce: 'pre',
          loader: 'source-map-loader',
          exclude: [
            path.resolve(projectRoot, 'node_modules'),
          ]
        },
        {
          test: /\.ts$/,
          loaders: [
            {
              loader: 'awesome-typescript-loader',
              query: {
                useForkChecker: true,
                tsconfig: path.resolve(appRoot, appConfig.tsconfig)
              }
            },
            {
              loader: 'angular2-template-loader'
            }
          ],
          exclude: [/\.(spec|e2e)\.ts$/]
        },
        { test: /\.json$/, loader: 'json-loader' },
        { test: /\.css$/, loaders: ['raw-loader', 'postcss-loader'] },
        { test: /\.styl$/, loaders: ['raw-loader', 'postcss-loader', 'stylus-loader'] },
        { test: /\.less$/, loaders: ['raw-loader', 'postcss-loader', 'less-loader'] },
        { test: /\.scss$/, loaders: ['raw-loader', 'postcss-loader', 'sass-loader'] },
        { test: /\.(jpg|png|gif)$/, loader: 'url-loader?limit=128000' },
        { test: /\.html$/, loader: 'raw-loader' }
      ]
    },
    plugins: [
      new webpack.NormalModuleReplacementPlugin(
        // This plugin is responsible for swapping the environment files.
        // Since it takes a RegExp as first parameter, we need to escape the path.
        // See https://webpack.github.io/docs/list-of-plugins.html#normalmodulereplacementplugin
        new RegExp(path.resolve(appRoot, appConfig.environments['source'])
          .replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')),
        path.resolve(appRoot, appConfig.environments[environment])
      ),
    ],
    entry: entry,
    target: 'node',
    externals: checkNodeImport,
    node: {
      global: true,
      __dirname: false,
      __filename: true,
      process: true,
      Buffer: true
    }
  };
}

var appConfig = require('./angular-cli.json').apps[0];
module.exports = getWebpackNodeConfig('.', 'iot', appConfig);
