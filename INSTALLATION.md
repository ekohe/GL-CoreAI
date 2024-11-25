# Chrome Extension with React

A step-by-step guide to creating a Chrome extension using React.

- react + typescript
- webpacker
- [bulma](https://bulma.io/documentation/)
- [Bulma Toast](https://rfoel.github.io/bulma-toast/)
- [Fontawesome](https://fontawesome.com/search?o=r&m=free)

## Steps

### step 1: Create React App

> npx create-react-app gitlab-ai-summarizer --template typescript

### step 2: Add Webpack

> npm install --save-dev webpack webpack-cli copy-webpack-plugin css-loader ts-loader html-webpack-plugin html-webpack-injector ts-node

#### update the Webpack configuration

By default, the create-react-app template does not provide a Webpack configuration file, so we need to create one. Create a new file called `webpack.config.js` in the root directory of your project, and add the following code:

```json
const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const HTMLWebpackInjector = require('html-webpack-injector');
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: {
        index: "./src/index.tsx"
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
                    "style-loader",
                    "css-loader"
                ]
            },
            {
                exclude: /node_modules/,
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
        ],
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: "public/*.json", to: "[name][ext]" },
                { from: "public/*.ico", to: "[name][ext]" },
                { from: "public/*.png", to: "./icons/[name][ext]" },
            ],
        }),
        new HTMLWebpackPlugin({
            template: "./public/settings.html",
            chunks: ["settings"]
        }),
        new HTMLWebpackInjector(),
    ],
    resolve: {
        extensions: [".tsx", ".ts", ".js", "*.png"],
    },
    output: {
        path: path.join(__dirname, "dist"),
        filename: "[name].js",
        clean: true,
    },
};
```

Now that we have configured webpack, Update your `package.json` file to include the following scripts:

```json
  "scripts": {
    "build": "webpack --config webpack.config.js",
    "watch": "webpack -w --config webpack.config.js"
  }
```

These scripts will allow you to build your extension using the npm `run build` command, or to run Webpack in watch mode using the npm `run watch` command.

#### step 3: Add the Manifest file

A manifest file is used to define the metadata and permissions for a Chrome extension. Create a new file called `manifest.json` in the root directory of your project and add the following code:

```json
{
  "manifest_version": 3,
  "short_name": "GitLab AI",
  "name": "GitLab AISummarize",
  "version": "0.0.1",
  "description": " uses OpenAI and GitLab API to summarize a GitLab issue from the issue's URL.",
  "options_page": "settings.html",
  "background": {
    "service_worker": "background.js"
  },
  "author": {
    "name": "Encore Shao",
    "email": "encore@ekohe.com"
  },
  "homepage_url": "https://ekohe.com",
  "permissions": ["storage", "activeTab", "tabs", "scripting"],
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self'; worker-src 'self';"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["contentScript.js"],
      "run_at": "document_end"
    }
  ],
  "host_permissions": ["https://api.openai.com/*"]
}
```

#### step 4: Build the App

Finally, run the npm run build command in your terminal to build your extension: When script will finish → new /dist folder will be created at the root of our app:

#### step 5: Load the extension

To load your extension into Chrome, open Chrome and navigate to the Extensions page by typing `chrome://extensions` into the address bar. Then, click the "Load unpacked" button and select the dist directory in your project.

---

### Let's go

```
npm run start
```

and visit `http://localhost:3000`
