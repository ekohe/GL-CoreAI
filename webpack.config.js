/* eslint-disable no-undef */
/* eslint-disable no-template-curly-in-string */
const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const HTMLWebpackInjector = require('html-webpack-injector');
const CopyWebpackPlugin = require("copy-webpack-plugin");
// const CompressionPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

// helpers
const srcPath = (pathname = "") => path.resolve(__dirname, `src/${pathname}`)
const distPath = (pathname = "") => path.resolve(__dirname, `dist/${pathname}`)
const publicPath = (pathname = "") => path.resolve(__dirname, `public/${pathname}`)

const extPlugins = [
    // new CompressionPlugin({
    //   test: /\.js$|\.css$|\.html$|\.(png|svg|jpg|gif)$/,
    //   algorithm: 'gzip',
    //   threshold: 10240,
    //   minRatio: 0.8
    // }),
    new CopyWebpackPlugin({
        patterns: [
            {
                from: srcPath("resources/manifest.json"),
                to: distPath("manifest.json"),
            },
            {
                from: publicPath("*.ico"),
                to: distPath("static"),
            },
            {
                from: srcPath("assets/icons"),
                to: distPath("static/icons"),
            },
        ],
    }),
    new HTMLWebpackPlugin({
        template: publicPath("index.html"),
        filename: "static/index.html",
        chunks: ["index"]
    }),
    new HTMLWebpackPlugin({
        template: publicPath("settings.html"),
        filename: "static/settings.html",
        chunks: ["settings"]
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].css", // Outputs CSS files to the css/ folder
      chunkFilename: "css/[name].chunk.css", // Outputs CSS chunks to the css/ folder
    }),
    new HTMLWebpackInjector(),
]

module.exports = {
    optimization: {
        minimize: true, // Enable minification
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                compress: {
                    drop_console: true, // Optionally remove console logs
                },
                },
                parallel: true, // Enable multi-process parallel running
            }),
        ],
    },
    entry: {
        index: srcPath("/index.tsx"),
        settings: srcPath("/containers/settings/Index.tsx"),
        background: srcPath("/background/index.ts"),
        // contentscript: "./src/contentscript/index.ts",
        inject: srcPath("/contentscript/inject.ts"),
    },
    mode: "production",
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: /\.tsx?$/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            compilerOptions: { noEmit: false },
                        }
                    }
                ],
            },
            {
                exclude: /node_modules/,
                test: /\.css$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                ]
            },
            {
                exclude: /node_modules/,
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
        ],
    },
    plugins: extPlugins,
    resolve: {
        extensions: [".tsx", ".ts", ".js", "*.png"],
    },
    output: {
        filename: "js/[name].js",
        chunkFilename: "js/[name].chunk.js",
        path: distPath("packs"),
        publicPath: "/packs/"
    },
};
