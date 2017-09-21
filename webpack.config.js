// path.resolve provides absolute path which is required
// in output.path and module.loaders inclusions
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry:  './src/index.js',

  output: {
    path: path.resolve(__dirname),
    filename: 'bundle.js',
    publicPath: '/'
  },

  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.s[ac]ss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                modules: true,
                sourceMap: true,
                importLoaders: 1,
                localIdentName: '[name]__[local]--[hash:base64:5]',
                camelCase: true
              }
            },
            'sass-loader'
          ]
        })
      },
      {
        test: /\.(jpe?g|png|svg)$/i,
        use: [
          'file-loader',
          {
            loader: 'image-webpack-loader',
            options: {
              optipng: {
                optimizationLevel: 7
              },
              pngquant: {
                quality: '65-90',
                speed: 4
              },
              mozjpeg: {
                progressive: true,
                quality: 80
              }
            }
          }
        ]
      }
    ]
  },

  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      src: path.resolve(__dirname, 'src'),
      assets: path.resolve(__dirname, 'assets')
    }
  },

  devtool: 'cheap-module-eval-source-map',

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html'
    }),
    new ExtractTextPlugin('style.css'),
    new webpack.NamedModulesPlugin()
  ],

  devServer: {
    historyApiFallback: true,
    inline: true,
    open: true,
    openPage: ''
  }
};
