const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = options => {
  return {
    mode: "production",
    entry: './index.js',
    output: {
      filename: 'bundle.js',
    },
    node: {
      fs: 'empty'
    },
    resolve: {
      // Add `.ts` and `.tsx` as a resolvable extension.
      extensions: [".ts", ".tsx", ".js"]
    },
    watchOptions: {
      poll: true,
      ignored: ["node_modules", "build", "dist"]
    },
    plugins: [new MonacoWebpackPlugin()],
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            "style-loader", // creates style nodes from JS strings
            "css-loader", // translates CSS into CommonJS
            "sass-loader" // compiles Sass to CSS, using Node Sass by default
          ]
        },
        { test: /\.tsx?$/, loader: "ts-loader" },
        {
          test: /.js$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true,
              },
            },
          ],
        },
        {
          test: /.jsx$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true,
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: [
            { loader: "style-loader" },
            { loader: "css-loader" }
          ]
        }

      ],
    },
  }
}