var path = require('path');
var webpack = require('gulp-webpack');

module.exports = {
    entry: "./src/js/main.js",
    output: {
        path: "/build/js/",
        filename: "bundle.js"
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    cacheDirectory: true,
                    presets: ['es2015']
                }
            }
        ]
    }    
};