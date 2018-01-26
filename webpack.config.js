const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: path.join(__dirname, 'lib', 'frontend', 'main.js'),
    output: {
        path: path.join(__dirname, 'build', 'scripts'),
        filename: 'bundle.js',
    },
    module: {
        loaders: [
            {
                test: /\.js(x*)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    cacheDirectory: 'babel-cache',
                    presets: ['env'],
                },
            },
            {
                test: /\.(s*)css$/,
                loaders: ['style-loader','css-loader', 'sass-loader'],
            },
            {
                test: /\.less$/,
                loaders: ['style-loader','css-loader', 'less-loader'],
            },
            {
                test: /\.(ttf|eot|woff|woff2)$/,
                loader: 'file-loader',
                options: {
                    name: 'fonts/[name].[ext]',
                },
            },
            {
                test: /\.(png|gif|svg)$/,
                loader: 'url-loader',
                options: {
                    name: 'images/[name].[ext]',
                },
            },
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        }),
        new webpack.ProvidePlugin({
            'jQuery': 'jquery',
            '$': 'jquery',
            'window.jQuery': 'jquery',
            'window.$': 'jquery',
        }),
        new webpack.optimize.OccurrenceOrderPlugin(),
    ],
};
