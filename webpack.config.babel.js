import path from 'path';
import fs from 'fs';
import webpack from 'webpack';

const isProduction = !!(process.env.NODE_ENV === 'production');

export default {
  devtool: '#inline-source-map',
  entry: {
    public: './src/client/service/main.js',
    'private/admin': './src/client/admin/main.js',
  },
  output: {
    path: path.join(__dirname, 'resource'),
    filename: '[name]/bundle-[hash].js',
    // chunkFilename: '[chunkhash].bundle.js'
  },
  resolve: {
    root: [
      path.resolve('./src/client/node_modules'),
    ],
  },
  module: {
    loaders: [{
      test: path.resolve('./src/client/node_modules', 'tinymce/tinymce'),
      loaders: ['imports?this=>window'],
    }, {
      test: /\.js$/,
      exclude: /(node_modules|vendor)/,
      loader: 'babel',
      query: { presets: ['es2015'] },
    }],
  },
  plugins: (() => {
    const plugins = [];

    if (isProduction) {
      plugins.push(
        new webpack.optimize.UglifyJsPlugin({
          sourceMap: false,
          compress: { warnings: false },
          output: { comments: false },
        }));
    }

    plugins.push(function () {
      this.plugin('done', (stats) => {
        fs.writeFileSync(
          path.join(__dirname, 'manifest.json'),
          JSON.stringify(stats.toJson().assetsByChunkName));
      });
    });

    return plugins;
  })(),
};
