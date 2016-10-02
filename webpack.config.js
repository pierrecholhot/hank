module.exports = {
  entry: "./app/scripts/index.js",
  output: {
    path: __dirname,
    filename: "./public/bundle.js"
  },
  module: {
    loaders: [{
      test: /\.css$/,
      loader: "style-loader!css-loader!postcss-loader"
    }, {
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel',
      query: {
        presets: ['es2015']
      }
    }]
  },
  postcss: function (webpack) {
    return [
      require("postcss-cssnext")(),
    ]
  }
};
