const webpack = require('webpack');
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');


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
                test: /\.js(x*)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    cacheDirectory: 'babel-cache',
                    presets: ['react', 'env'],
                    plugins: ['transform-class-properties', 'transform-decorators-legacy', 'dedent'],
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
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
        }),
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new CompressionPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: /\.js$|\.css$|\.html$/,
            threshold: 10240,
            minRatio: 0.8,
        })
    ],
    resolve: {
        extensions: ['.js', '.jsx'],
    },
};
