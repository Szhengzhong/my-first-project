const { resolve } = require("path");

module.exports = {
    outputDir: resolve(__dirname, "./interface"),

    configureWebpack: {
        performance: {
            hints: false,
        },
        optimization: {
            runtimeChunk: "single",
            splitChunks: {
                chunks: "all",
                maxInitialRequests: Infinity,
                minSize: 0,
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name(module) {
                            const name = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

                            return `mod.${name.replace("@", "-")}`;
                        },
                    },
                },
            },
        },
    },
};
