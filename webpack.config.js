const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
    //Set source directory as context
    context: path.join(__dirname, 'src'),
    //Build Mode
    mode: 'development',
    //Entry JS file
    entry: './app/app.js',
    //Build Directory
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'js/app.build.js',
    },
    //Development Server
    devServer: {
        //Serve from static dir
        static: path.resolve(__dirname, 'src/static'),
        //Port
        port: 5000,
        //Open default browser
        open: true
    },
    plugins: [
        new CopyPlugin({ patterns: [{ from: 'static' }] }),
    ],
}