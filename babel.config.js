module.exports = require('@babel/register')({
    "presets": [
        "@babel/preset-env",
        "@babel/preset-typescript"
    ],
    "plugins": [
        "add-module-exports"
    ],
    extensions: ['.ts', '.tsx', '.js', '.jsx']
});