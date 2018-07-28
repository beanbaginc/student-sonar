const webpack = require('webpack');
const path = require('path');


module.exports = {
    mode: 'production',
    entry: path.join(__dirname, 'lib', 'frontend', 'main.js'),
    output: {
        path: path.join(__dirname, 'build', 'scripts'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.js(x*)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    cacheDirectory: 'babel-cache',
                    presets: ['react', 'env'],
                    plugins: ['transform-class-properties', 'dedent'],
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
    devtool: 'source-map',
    plugins: [
        new webpack.ProvidePlugin({
            'jQuery': 'jquery',
            '$': 'jquery',
            'window.jQuery': 'jquery',
            'window.$': 'jquery',
        }),
    ],
    resolve: {
        extensions: ['.js', '.jsx'],
    },
};
