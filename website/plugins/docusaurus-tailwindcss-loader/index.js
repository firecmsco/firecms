module.exports = function (context, options) {
    console.log("postcss-tailwindcss-loader");
    return {
        name: "postcss-tailwindcss-loader",
        configurePostCss(postcssOptions) {
            console.log("postcss configurePostCss")
            const postcss = require("postcss-import");
            const tailwindcss = require("tailwindcss");
            const postcssenv = require("postcss-preset-env");
            const newOptions = {
                ident: "postcss",
                plugins: [
                    postcss,
                    tailwindcss,
                    postcssenv({
                        autoprefixer: {
                            flexbox: "no-2009"
                        },
                        stage: 4
                    })
                ]
            };
            return {
                ...postcssOptions,
                ...newOptions
            };
        }
    };
};

