'use strict';

var path = require('path');
var webpack = require('webpack');
var isProduction = !!(process.env.NODE_ENV === 'production');

module.exports = {
  devtool: '#inline-source-map',
  entry: {
    public: './front/service/main.js',
    'private/admin': './front/admin/main.js'
  },
  output: {
    path: path.join(__dirname, ''),
    filename: '[name]/bundle-[hash].js'
    // chunkFilename: '[chunkhash].bundle.js'
  },
  resolve: {
    root: [
      path.resolve('./public/vendor')
    ],
    alias: {
      tinymce: 'tinymce/tinymce.min.js'
    }
  },
  plugins: (function () {
    var plugins = [];

    if (isProduction) {
      plugins.push(
        new webpack.optimize.UglifyJsPlugin({
          sourceMap: false,
          compress: { warnings: false },
          output: { comments: false }
        }));
    }

    plugins.push(
      function () {
        this.plugin('done', function (stats) {
          require('fs').writeFileSync(
            path.join(__dirname, 'manifest.json'),
            JSON.stringify(stats.toJson().assetsByChunkName));
        });
      });

    return plugins;
  }())
};
