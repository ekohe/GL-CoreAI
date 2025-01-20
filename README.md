<img src="https://raw.githubusercontent.com/ekohe/GL-CoreAI/refs/heads/main/src/assets/icons/logo-brand.png">

# GL CoreAI

**GL CoreAI** is a Chrome Extension that uses OpenAI/DeepSeek and GitLab API to summarize a GitLab issue from the issue's URL.

---

The AI architecture includes a custom Chrome extension that summarizes GitLab issues.

This simplifies onboarding by providing detailed summaries of complex issues, allowing users to quickly understand an issue without navigating long histories.

---

### Features

- AI Summarize of GitLab Issues (done)
- Code Suggestions in Merge Requests (coming soon)

### API intergrations

- OpenAI API (`/v1/chat/completions`)
- DeepSeek API (`/v1/chat/completions`)
- GitLab API (`/projects`, `/issues`)

### Requirements

- Generate an `API Key` from OpenAI
- Generate an `API Key` from [DeepSeek](https://platform.deepseek.com/api_keys) (Chinese user-friendly)

### Project Structure

```
➜  gitlab-ai-summarizer git:(main) ✗ tree src
src
├── assets
│   ├── icons
│   │   ├── brand.png
│   │   ├── icon128.png
│   │   ├── icon16.png
│   │   ├── icon19.png
│   │   ├── icon32.png
│   │   ├── icon38.png
│   │   ├── icon48.png
│   │   ├── logo-brand.png
│   │   ├── logo.png
│   │   └── logo.svg
│   ├── images
│   │   └── settings.png
│   └── styles
│       ├── bulma-extra
│       │   ├── switch.min.css
│       │   ├── timeline.min.css
│       │   └── tooltip.min.css
│       ├── index.css
│       ├── inject.css
│       └── settings.css
├── background
│   ├── contextMenu.ts
│   └── index.ts
├── components
│   ├── ForgetPassword.tsx
│   ├── FormattedText.tsx
│   ├── GoogleAuthentication.tsx
│   ├── OrDivider.tsx
│   ├── SignIn.tsx
│   └── SignUp.tsx
├── containers
│   ├── app
│   │   ├── AiSummarizer.tsx
│   │   ├── AppIndex.tsx
│   │   ├── Footer.tsx
│   │   ├── GitLab.tsx
│   │   └── Header.tsx
│   └── settings
│       ├── AppSettings.tsx
│       ├── Index.tsx
│       └── Settings.tsx
├── contentscript
│   └── inject.ts
├── contexts
│   └── FormContext.tsx
├── index.tsx
├── react-app-env.d.ts
├── reportWebVitals.ts
├── resources
│   ├── _locales
│   │   ├── en
│   │   ├── fr
│   │   └── zh_CN
│   └── manifest.json
├── setupTests.ts
├── type.d.ts
└── utils
    ├── common.ts
    ├── constants.ts
    ├── enhanceStringPrototype.ts
    ├── extView.ts
    ├── gitlab.ts
    ├── index.ts
    ├── llms
    │   ├── deepSeek.ts
    │   ├── index.ts
    │   ├── ollama.ts
    │   └── openAi.ts
    ├── policies
    │   ├── index.ts
    │   └── task.ts
    ├── prompts
    │   ├── index.ts
    │   ├── mergeRequest.ts
    │   └── task.ts
    └── tools.ts

22 directories, 57 files
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

### Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/ekohe/GL-CoreAI. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected.

To see all contributors from https://github.com/ekohe/GL-CoreAI/graphs/contributors

### Contribution

- [Encore Shao](https://github.com/encoreshao)

### License

GL CoreAI is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
