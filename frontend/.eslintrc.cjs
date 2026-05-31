module.exports = {
    root: true,
    env: {
        browser: true,
        es2020: true,
    },
    parser: "@typescript-eslint/parser",
    plugins: ["react", "react-hooks", "@typescript-eslint"],
    extends: [
        "eslint:recommended",
        "plugin:react/recommended",
        "plugin:react-hooks/recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    settings: {
        react: {
            version: "detect",
        },
    },
    ignorePatterns: ["dist", "node_modules"],
    rules: {
        "react/react-in-jsx-scope": "off",
    },
};
