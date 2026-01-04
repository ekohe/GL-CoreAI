<img src="https://raw.githubusercontent.com/ekohe/GL-CoreAI/refs/heads/main/src/assets/icons/logo-brand.png">

# GL CoreAI

**GL CoreAI** AI-powered GitLab assistant that summarizes issues and merge requests using OpenAI, Claude, or DeepSeek. Quickly understand complex issues without reading long comment histories.

---

The AI architecture includes a custom Chrome extension that summarizes GitLab issues.

This simplifies onboarding by providing detailed summaries of complex issues, allowing users to quickly understand an issue without navigating long histories.

---

### Features

- AI Summarize of GitLab Issues
- Code Review on MR Requests

### API intergrations

- OpenAI API (`/v1/chat/completions`)
- DeepSeek API (`/v1/chat/completions`)
- Claude API (`/v1/messages`)
- GitLab API (`/projects`, `/issues`)

### Requirements

- Generate an `API Key` from OpenAI
- Generate an `API Key` from [DeepSeek](https://platform.deepseek.com/api_keys) (Chinese user-friendly)
- Generate an `API Key` from [Claude](https://console.anthropic.com/keys) (Anthropic)

### Project Structure

```
➜  gitlab-ai-summarizer git:(main) ✗ tree src -d -L 4 -I "node_modules|dist"
src
├── assets
│   ├── icons
│   ├── images
│   └── styles
│       └── bulma-extra
├── background
├── components
├── containers
│   ├── app
│   │   └── GitLab
│   ├── popup
│   └── settings
│       └── Settings
├── contentscript
├── contexts
├── resources
│   └── _locales
│       ├── en
│       ├── fr
│       └── zh_CN
└── utils
    ├── llms
    ├── policies
    └── prompts
```

### Generate a new package to use

#### Step 1: Build new packages using the latest code

```
yarn run build
```

#### Step 2: Load the `dist` folder for local installation

- chrome://extensions/

#### Step 3: Configure your API key

- [GL CoreAI Settings](chrome-extension://bhaajobichfdfpccebngpkggnicjbkgh/packs/static/settings.html)

#### Step 4: Generate the release package

```
yarn run build:zip
```

### Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/ekohe/GL-CoreAI. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected.

To see all contributors from https://github.com/ekohe/GL-CoreAI/graphs/contributors

### Contribution

- [Encore Shao](https://github.com/encoreshao)

### License

GL CoreAI is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
