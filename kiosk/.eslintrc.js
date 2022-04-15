module.exports = {
    root: true,
    env: { node: true },
    extends: [
        "plugin:vue/essential",
        "@vue/airbnb",
        "@vue/typescript/recommended",
    ],
    parser: "vue-eslint-parser",
    parserOptions: { parser: "@typescript-eslint/parser", ecmaVersion: 2020 },
    rules: {
        quotes: ["error", "double"],
        "comma-dangle": ["error", "always-multiline"],
        indent: [
            "error",
            4,
            { SwitchCase: 1 },
        ],
        "max-len": ["error", { code: 220 }],
        "vue/script-indent": [
            "error",
            4,
            { baseIndent: 1, switchCase: 1 },
        ],
        "vue/html-indent": [
            "error",
            4,
            { attribute: 1, baseIndent: 1 },
        ],
        "@typescript-eslint/quotes": ["error", "double"],
        "@typescript-eslint/indent": ["error", 4],
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "spaced-comment": "off",
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-plusplus": "off",
    },
    overrides: [
        {
            files: ["*.vue"],
            rules: {
                indent: "off",
                "quote-props": "off",
                "import/no-cycle": "off",
                "@typescript-eslint/indent": "off",
                "import/no-extraneous-dependencies": "off",
            },
        },
        {
            files: ["*.ts"],
            rules: {
                "@typescript-eslint/explicit-module-boundary-types": ["error"],
            },
        },
        {
            files: ["vue.config.js"],
            rules: {
                "@typescript-eslint/no-var-requires": "off",
            },
        },
        {
            files: ["*.html"],
            rules: {
                "vue/comment-directive": "off",
            },
        },
        {
            files: ["src/scanner.ts"],
            rules: {
                "no-await-in-loop": "off",
                "class-methods-use-this": "off",
            },
        },
        {
            files: ["bin/*"],
            rules: {
                "import/no-extraneous-dependencies": "off",
                "@typescript-eslint/no-var-requires": "off",
            },
        },
    ],
};
