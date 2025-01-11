const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/main.js',
    output: {
        filename: 'script.user.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'production', // Use production mode for optimized output
    devtool: false, // Disable source maps for cleaner output
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html', // Path to your index.html file
            filename: 'index.html', // Output filename in the dist folder
            inject: false, // Prevent Webpack from injecting scripts into the HTML
        }),
        {
            apply: (compiler) => {
                compiler.hooks.emit.tapAsync('AddMetadata', (compilation, callback) => {
                    // Load metadata content from src/metadata.js
                    const metadataPath = path.resolve(__dirname, 'src/metadata.js');
                    const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
                    
                    // Extract metadata string from the file
                    const metadata = metadataContent.match(/`([^`]*)`/s)[1];

                    const output = compilation.assets['script.user.js'];
                    const content = metadata + '\n\n' + output.source();
                    compilation.assets['script.user.js'] = {
                        source: () => content,
                        size: () => content.length,
                    };
                    callback();
                });
            },
        },
    ],
};
