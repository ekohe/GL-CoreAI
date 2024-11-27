# Gitlab AISummarize

The AI architecture includes a custom Chrome extension that summarizes GitLab issues.

This simplifies onboarding by providing detailed summaries of complex issues, allowing users to quickly understand an issue without navigating long histories.

**Gitlab AISummarize** is a Chrome Extension that uses OpenAI and GitLab API to summarize a GitLab issue from the issue's URL.

### API intergrations

- OpenAI
- GitLab

### Requirements

- Generate an GitLab `Access Token` from https://gitlab.ekohe.com/-/user_settings/personal_access_tokens
- Generate an `API Key` from OpenAI

### Project Structure

```
➜  gitlab-ai-summarizer git:(main) ✗ tree src
src
├── assets
│   ├── icons
│   │   ├── icon128.png
│   │   ├── icon16.png
│   │   ├── icon32.png
│   │   ├── icon48.png
│   │   └── logo.png
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
    ├── extView.ts
    ├── gitlab.ts
    ├── index.ts
    ├── llm.ts
    ├── policies
    │   ├── index.ts
    │   └── task.ts
    ├── prompts
    │   ├── index.ts
    │   └── task.ts
    └── tools.ts
```

### Before you begin: pls configure your API key

- [GitLab AISummarize Settings](chrome-extension://ehdeggpkeghpiibnhkgnbpjkghghdpoe/packs/static/settings.html)

### Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/ekohe/gitlab-ai-summarizer. This project is intended to be a safe, welcoming space for collaboration, and contributors are expected.

To see all contributors from https://github.com/ekohe/gitlab-ai-summarizer/graphs/contributors

### Contribution

- [Encore Shao](https://github.com/encoreshao)

### License

Gitlab AISummarize is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
