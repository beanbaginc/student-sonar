const webpack = require('webpack');
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');
const zlib = require('zlib');


module.exports = {
    mode: (process.env.NODE_ENV === 'production' ? 'production' : 'development'),
    entry: path.join(__dirname, 'lib', 'frontend', 'main.js'),
    output: {
        path: path.join(__dirname, 'build', 'scripts'),
        filename: 'bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.mjs$/,
                include: /node_modules/,
                type: 'javascript/auto',
            },
            {
                test: /\.js(x*)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    cacheDirectory: 'babel-cache',
                    presets: ['@babel/preset-react', '@babel/preset-env'],
                    plugins: [
                        ['@babel/plugin-proposal-decorators', { "legacy": true }],
                        'dedent'
                    ],
                },
            },
            {
                test: /\.(scss|css)$/,
                use: ['style-loader','css-loader', 'sass-loader'],
            },
            {
                test: /\.less$/,
                use: ['style-loader','css-loader', 'less-loader'],
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
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
        }),
        new webpack.IgnorePlugin({
            resourceRegExp: /^\.\/locale$/,
            contextRegExp: /moment$/,
        }),
        new CompressionPlugin({
            filename: "[path][base].br",
            algorithm: "brotliCompress",
            test: /\.(js|css|html|svg)$/,
            compressionOptions: {
                params: {
                  [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
                },
            },
            threshold: 10240,
            minRatio: 0.8,
            deleteOriginalAssets: false,
        })
    ],
    resolve: {
        extensions: ['.js', '.jsx'],
    },
};
