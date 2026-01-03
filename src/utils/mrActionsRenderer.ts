import { MRActionType } from "./constants";

// Types for different action responses
interface SummarizeResponse {
  title: string;
  overview: string;
  key_changes: Array<{
    file: string;
    type: "added" | "modified" | "deleted" | "refactored";
    summary: string;
  }>;
  impact_areas: Array<{
    area: string;
    impact: string;
    risk_level: "low" | "medium" | "high";
  }>;
  dependencies: string;
  testing_notes: string;
}

interface SpotIssueItem {
  file: string;
  line: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  category: string;
  issue: string;
  current: string;
  suggested: string;
  why: string;
}

interface DraftNotesResponse {
  version_bump: "patch" | "minor" | "major";
  summary: string;
  sections: {
    features: string[];
    improvements: string[];
    bug_fixes: string[];
    breaking_changes: string[];
    technical_notes: string[];
  };
  migration_notes: string | null;
  contributors: string;
}

export class MRActionsRenderer {
  private static getTypeConfig(type: string) {
    const configs: Record<string, { color: string; icon: string }> = {
      added: { color: "#28a745", icon: "➕" },
      modified: { color: "#0366d6", icon: "📝" },
      deleted: { color: "#dc3545", icon: "🗑️" },
      refactored: { color: "#6f42c1", icon: "♻️" },
    };
    return configs[type] || configs.modified;
  }

  private static getRiskConfig(risk: string) {
    const configs: Record<string, { color: string; bg: string; icon: string }> = {
      low: { color: "#28a745", bg: "#dcffe4", icon: "🟢" },
      medium: { color: "#fd7e14", bg: "#fff3cd", icon: "🟡" },
      high: { color: "#dc3545", bg: "#f8d7da", icon: "🔴" },
    };
    return configs[risk] || configs.medium;
  }

  private static getSeverityConfig(severity: string) {
    const configs: Record<string, { color: string; icon: string; priority: number }> = {
      Critical: { color: "#dc3545", icon: "🔴", priority: 4 },
      High: { color: "#fd7e14", icon: "🟠", priority: 3 },
      Medium: { color: "#ffc107", icon: "🟡", priority: 2 },
      Low: { color: "#28a745", icon: "🟢", priority: 1 },
    };
    return configs[severity] || configs.Medium;
  }

  private static getVersionBumpConfig(bump: string) {
    const configs: Record<string, { color: string; bg: string; icon: string; label: string }> = {
      patch: { color: "#28a745", bg: "#dcffe4", icon: "🩹", label: "Patch" },
      minor: { color: "#0366d6", bg: "#cce5ff", icon: "✨", label: "Minor" },
      major: { color: "#dc3545", bg: "#f8d7da", icon: "🚀", label: "Major" },
    };
    return configs[bump] || configs.patch;
  }

  // Helper to create a copy button
  private static createCopyButton(textToCopy: string, buttonText: string = "📋 Copy to Clipboard"): HTMLElement {
    const copySection = document.createElement("div");
    copySection.style.cssText = `
      padding: 16px;
      background: #f8f9fa;
      border-top: 1px solid #e1e5e9;
      display: flex;
      justify-content: center;
    `;

    const copyButton = document.createElement("button");
    copyButton.innerHTML = buttonText;
    copyButton.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    `;

    copyButton.addEventListener("mouseenter", () => {
      copyButton.style.transform = "translateY(-2px)";
      copyButton.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
    });

    copyButton.addEventListener("mouseleave", () => {
      copyButton.style.transform = "translateY(0)";
      copyButton.style.boxShadow = "0 2px 8px rgba(102, 126, 234, 0.3)";
    });

    copyButton.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(textToCopy);
        copyButton.innerHTML = "✅ Copied!";
        copyButton.style.background = "linear-gradient(135deg, #28a745 0%, #20c997 100%)";
        setTimeout(() => {
          copyButton.innerHTML = buttonText;
          copyButton.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
        }, 2000);
      } catch (err) {
        copyButton.innerHTML = "❌ Failed to copy";
        setTimeout(() => {
          copyButton.innerHTML = buttonText;
        }, 2000);
      }
    });

    copySection.appendChild(copyButton);
    return copySection;
  }

  // Format summarize response for copying
  private static formatSummarizeForCopy(data: SummarizeResponse): string {
    let text = `# PR Summary\n\n`;
    text += `**${data.title}**\n\n`;
    text += `## Overview\n${data.overview}\n\n`;

    if (data.key_changes && data.key_changes.length > 0) {
      text += `## Key Changes\n`;
      data.key_changes.forEach((change) => {
        text += `- **${change.file}** [${change.type}]: ${change.summary}\n`;
      });
      text += `\n`;
    }

    if (data.impact_areas && data.impact_areas.length > 0) {
      text += `## Impact Areas\n`;
      data.impact_areas.forEach((area) => {
        text += `- **${area.area}** (${area.risk_level} risk): ${area.impact}\n`;
      });
      text += `\n`;
    }

    if (data.dependencies) {
      text += `## Dependencies\n${data.dependencies}\n\n`;
    }

    if (data.testing_notes) {
      text += `## Testing Notes\n${data.testing_notes}\n`;
    }

    return text.trim();
  }

  // Format spot issues response for copying
  private static formatSpotIssuesForCopy(data: SpotIssueItem[]): string {
    if (!data || data.length === 0) {
      return "# Code Review Results\n\nNo issues found.";
    }

    let text = `# Code Review Results\n\n`;
    text += `Found ${data.length} issue(s)\n\n`;

    data.forEach((item, i) => {
      text += `## ${i + 1}. [${item.severity}] ${item.category}\n`;
      text += `**File:** ${item.file}:${item.line}\n`;
      text += `**Issue:** ${item.issue}\n`;
      text += `**Current:** ${item.current}\n`;
      text += `**Suggested:** ${item.suggested}\n`;
      text += `**Why:** ${item.why}\n\n`;
    });

    return text.trim();
  }

  // Format draft notes response for copying
  private static formatDraftNotesForCopy(data: DraftNotesResponse): string {
    const bumpConfig = this.getVersionBumpConfig(data.version_bump);
    let text = `# Release Notes (${bumpConfig.label} Release)\n\n`;
    text += `${data.summary}\n\n`;

    if (data.sections.features && data.sections.features.length > 0) {
      text += `## ✨ Features\n`;
      data.sections.features.forEach((f) => {
        text += `- ${f}\n`;
      });
      text += `\n`;
    }

    if (data.sections.improvements && data.sections.improvements.length > 0) {
      text += `## 🔧 Improvements\n`;
      data.sections.improvements.forEach((i) => {
        text += `- ${i}\n`;
      });
      text += `\n`;
    }

    if (data.sections.bug_fixes && data.sections.bug_fixes.length > 0) {
      text += `## 🐛 Bug Fixes\n`;
      data.sections.bug_fixes.forEach((b) => {
        text += `- ${b}\n`;
      });
      text += `\n`;
    }

    if (data.sections.breaking_changes && data.sections.breaking_changes.length > 0) {
      text += `## ⚠️ Breaking Changes\n`;
      data.sections.breaking_changes.forEach((b) => {
        text += `- ${b}\n`;
      });
      text += `\n`;
    }

    if (data.sections.technical_notes && data.sections.technical_notes.length > 0) {
      text += `## 📝 Technical Notes\n`;
      data.sections.technical_notes.forEach((t) => {
        text += `- ${t}\n`;
      });
      text += `\n`;
    }

    if (data.migration_notes) {
      text += `## 🔄 Migration Notes\n${data.migration_notes}\n\n`;
    }

    if (data.contributors) {
      text += `## 👥 Contributors\n${data.contributors}\n`;
    }

    return text.trim();
  }

  private static createStyles(): void {
    if (document.querySelector("style[data-mr-actions-renderer]")) {
      return;
    }

    const style = document.createElement("style");
    style.setAttribute("data-mr-actions-renderer", "true");
    style.textContent = `
      .mr-action-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        max-width: 100%;
        margin: 20px 0;
      }

      .mr-action-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 20px;
        border-radius: 8px 8px 0 0;
        margin-bottom: 0;
      }

      .mr-action-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .mr-action-subtitle {
        margin: 4px 0 0 0;
        font-size: 14px;
        opacity: 0.9;
      }

      .mr-section {
        border: 1px solid #e1e5e9;
        background: white;
        margin-bottom: 16px;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        overflow: hidden;
      }

      .mr-section-header {
        padding: 12px 16px;
        background: #f6f8fa;
        border-bottom: 1px solid #e1e5e9;
        font-weight: 600;
        font-size: 14px;
        color: #24292e;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .mr-section-content {
        padding: 16px;
      }

      .mr-item {
        padding: 12px 16px;
        border-bottom: 1px solid #f1f3f4;
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .mr-item:last-child {
        border-bottom: none;
      }

      .mr-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 12px;
        white-space: nowrap;
      }

      .mr-text-muted {
        color: #6a737d;
        font-size: 13px;
      }

      .mr-loading {
        background: white;
        border: 1px solid #e1e5e9;
        border-radius: 8px;
        padding: 32px;
        text-align: center;
        margin: 20px 0;
      }

      .mr-loading-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #667eea;
        border-radius: 50%;
        animation: mrSpin 1s linear infinite;
        margin: 0 auto 16px;
      }

      @keyframes mrSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .mr-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .mr-list-item {
        padding: 10px 16px;
        border-bottom: 1px solid #f1f3f4;
        font-size: 14px;
        line-height: 1.5;
        display: flex;
        align-items: flex-start;
        gap: 10px;
      }

      .mr-list-item:last-child {
        border-bottom: none;
      }

      .mr-list-item::before {
        content: "•";
        color: #667eea;
        font-weight: bold;
      }

      .mr-version-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 14px;
        font-weight: 600;
        padding: 6px 12px;
        border-radius: 16px;
      }

      .mr-notes-section {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 16px;
        margin-top: 12px;
      }

      .mr-notes-title {
        font-weight: 600;
        font-size: 14px;
        color: #24292e;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .mr-notes-content {
        font-size: 14px;
        color: #586069;
        line-height: 1.5;
      }
    `;

    document.head.appendChild(style);
  }

  public static showLoadingState(container: HTMLElement, actionType: MRActionType): void {
    container.innerHTML = "";
    this.createStyles();

    const messages: Record<MRActionType, string> = {
      summarize: "Analyzing PR changes and generating summary...",
      spot_issues: "Scanning code for potential issues and improvements...",
      draft_notes: "Creating release notes from your changes...",
    };

    const loadingDiv = document.createElement("div");
    loadingDiv.className = "mr-loading";
    loadingDiv.innerHTML = `
      <div class="mr-loading-spinner"></div>
      <p style="margin: 0; color: #586069; font-size: 14px;">${messages[actionType]}</p>
    `;

    container.appendChild(loadingDiv);
  }

  public static showProgressState(container: HTMLElement, progress: string): void {
    container.innerHTML = "";
    this.createStyles();

    const progressDiv = document.createElement("div");
    progressDiv.className = "mr-loading";
    progressDiv.innerHTML = `
      <div class="mr-loading-spinner"></div>
      <p style="margin: 0; color: #586069; font-size: 14px;">Receiving analysis... (${progress.length} characters)</p>
    `;

    container.appendChild(progressDiv);
  }

  public static showErrorState(container: HTMLElement, error: string, rawResponse?: string): void {
    container.innerHTML = "";
    this.createStyles();

    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = `
      background: #ffeaa7;
      border: 1px solid #fdcb6e;
      border-radius: 8px;
      padding: 16px;
      margin: 20px 0;
    `;

    let content = `
      <h4 style="color: #d63031; font-weight: 600; margin: 0 0 8px 0;">⚠️ Analysis Failed</h4>
      <p style="color: #2d3436; margin: 0; line-height: 1.5;">${error}</p>
    `;

    if (rawResponse) {
      content += `
        <details style="margin-top: 12px;">
          <summary style="cursor: pointer; font-weight: 600; color: #2d3436;">View Raw Response</summary>
          <pre style="
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 12px;
            margin-top: 8px;
            font-family: monospace;
            font-size: 12px;
            max-height: 200px;
            overflow-y: auto;
            white-space: pre-wrap;
          ">${rawResponse.length > 1500 ? rawResponse.substring(0, 1500) + "...[truncated]" : rawResponse}</pre>
        </details>
      `;
    }

    errorDiv.innerHTML = content;
    container.appendChild(errorDiv);
  }

  public static render(container: HTMLElement, data: string, actionType: MRActionType): void {
    container.innerHTML = "";
    this.createStyles();

    try {
      // Clean the JSON response
      let cleanedData = data.trim();
      if (cleanedData.startsWith("```json")) {
        cleanedData = cleanedData.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleanedData.startsWith("```")) {
        cleanedData = cleanedData.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const parsed = JSON.parse(cleanedData);

      switch (actionType) {
        case "summarize":
          this.renderSummarize(container, parsed as SummarizeResponse);
          break;
        case "spot_issues":
          this.renderSpotIssues(container, parsed as SpotIssueItem[]);
          break;
        case "draft_notes":
          this.renderDraftNotes(container, parsed as DraftNotesResponse);
          break;
      }
    } catch (error: any) {
      console.error("Failed to parse response:", error);
      this.showErrorState(container, `Failed to parse AI response: ${error.message}`, data);
    }
  }

  private static renderSummarize(container: HTMLElement, data: SummarizeResponse): void {
    const mainDiv = document.createElement("div");
    mainDiv.className = "mr-action-container";

    // Header
    mainDiv.innerHTML = `
      <div class="mr-action-header">
        <h3 class="mr-action-title">📋 PR Summary</h3>
        <p class="mr-action-subtitle">${data.title}</p>
      </div>
    `;

    // Overview Section
    const overviewSection = document.createElement("div");
    overviewSection.className = "mr-section";
    overviewSection.innerHTML = `
      <div class="mr-section-header">📝 Overview</div>
      <div class="mr-section-content">
        <p style="margin: 0; line-height: 1.6; color: #24292e;">${data.overview}</p>
      </div>
    `;
    mainDiv.appendChild(overviewSection);

    // Key Changes Section
    if (data.key_changes && data.key_changes.length > 0) {
      const changesSection = document.createElement("div");
      changesSection.className = "mr-section";
      changesSection.innerHTML = `<div class="mr-section-header">📁 Key Changes (${data.key_changes.length} files)</div>`;

      const changesContent = document.createElement("div");
      data.key_changes.forEach((change) => {
        const config = this.getTypeConfig(change.type);
        const item = document.createElement("div");
        item.className = "mr-item";
        item.innerHTML = `
          <span class="mr-badge" style="background: ${config.color}20; color: ${config.color};">
            ${config.icon} ${change.type}
          </span>
          <div style="flex: 1;">
            <div style="font-weight: 600; color: #0366d6; font-size: 13px; margin-bottom: 4px;">
              ${change.file}
            </div>
            <div style="font-size: 14px; color: #586069; line-height: 1.4;">
              ${change.summary}
            </div>
          </div>
        `;
        changesContent.appendChild(item);
      });
      changesSection.appendChild(changesContent);
      mainDiv.appendChild(changesSection);
    }

    // Impact Areas Section
    if (data.impact_areas && data.impact_areas.length > 0) {
      const impactSection = document.createElement("div");
      impactSection.className = "mr-section";
      impactSection.innerHTML = `<div class="mr-section-header">⚡ Impact Areas</div>`;

      const impactContent = document.createElement("div");
      data.impact_areas.forEach((area) => {
        const config = this.getRiskConfig(area.risk_level);
        const item = document.createElement("div");
        item.className = "mr-item";
        item.innerHTML = `
          <span class="mr-badge" style="background: ${config.bg}; color: ${config.color};">
            ${config.icon} ${area.risk_level.toUpperCase()}
          </span>
          <div style="flex: 1;">
            <div style="font-weight: 600; color: #24292e; font-size: 14px; margin-bottom: 4px;">
              ${area.area}
            </div>
            <div style="font-size: 14px; color: #586069; line-height: 1.4;">
              ${area.impact}
            </div>
          </div>
        `;
        impactContent.appendChild(item);
      });
      impactSection.appendChild(impactContent);
      mainDiv.appendChild(impactSection);
    }

    // Dependencies & Testing Notes
    if (data.dependencies || data.testing_notes) {
      const notesSection = document.createElement("div");
      notesSection.className = "mr-section";
      notesSection.innerHTML = `<div class="mr-section-header">📌 Notes</div>`;

      let notesContent = '<div class="mr-section-content">';
      if (data.dependencies) {
        notesContent += `
          <div class="mr-notes-section" style="margin-top: 0;">
            <div class="mr-notes-title">📦 Dependencies</div>
            <div class="mr-notes-content">${data.dependencies}</div>
          </div>
        `;
      }
      if (data.testing_notes) {
        notesContent += `
          <div class="mr-notes-section">
            <div class="mr-notes-title">🧪 Testing Notes</div>
            <div class="mr-notes-content">${data.testing_notes}</div>
          </div>
        `;
      }
      notesContent += "</div>";
      notesSection.innerHTML += notesContent;
      mainDiv.appendChild(notesSection);
    }

    // Add copy button
    const copyText = this.formatSummarizeForCopy(data);
    mainDiv.appendChild(this.createCopyButton(copyText));

    container.appendChild(mainDiv);
  }

  private static renderSpotIssues(container: HTMLElement, data: SpotIssueItem[]): void {
    const mainDiv = document.createElement("div");
    mainDiv.className = "mr-action-container";

    if (!Array.isArray(data) || data.length === 0) {
      mainDiv.innerHTML = `
        <div class="mr-action-header" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">
          <h3 class="mr-action-title">✅ No Issues Found</h3>
          <p class="mr-action-subtitle">Your code looks good! No potential issues detected.</p>
        </div>
      `;
      container.appendChild(mainDiv);
      return;
    }

    // Sort by severity
    data.sort((a, b) => {
      return this.getSeverityConfig(b.severity).priority - this.getSeverityConfig(a.severity).priority;
    });

    // Count by severity
    const counts = data.reduce((acc: Record<string, number>, item) => {
      acc[item.severity] = (acc[item.severity] || 0) + 1;
      return acc;
    }, {});

    // Header with counts
    mainDiv.innerHTML = `
      <div class="mr-action-header">
        <h3 class="mr-action-title">🔍 Issues Found (${data.length})</h3>
        <p class="mr-action-subtitle">
          ${Object.entries(counts).map(([sev, count]) => `${this.getSeverityConfig(sev).icon} ${count} ${sev}`).join(" • ")}
        </p>
      </div>
    `;

    // Render each issue
    data.forEach((item, index) => {
      const config = this.getSeverityConfig(item.severity);
      const issueSection = document.createElement("div");
      issueSection.className = "mr-section";
      issueSection.style.borderLeft = `4px solid ${config.color}`;

      issueSection.innerHTML = `
        <div class="mr-section-header" style="background: ${config.color}10;">
          <span class="mr-badge" style="background: ${config.color}; color: white;">
            ${config.icon} ${item.severity}
          </span>
          <span style="flex: 1; margin-left: 8px;">
            <span style="font-weight: 600;">${item.category || "Issue"}</span>
            <span style="color: #6a737d; font-weight: normal;"> • ${item.file}:${item.line}</span>
          </span>
          <span style="color: #6a737d; font-size: 12px;">#${index + 1}</span>
        </div>
        <div class="mr-section-content">
          <p style="margin: 0 0 16px 0; line-height: 1.5; color: #24292e;">${item.issue}</p>

          ${item.current ? `
            <div style="margin-bottom: 12px;">
              <div style="font-size: 12px; font-weight: 600; color: #d73a49; margin-bottom: 6px;">🔍 Current Code:</div>
              <pre style="
                background: #ffeef0;
                border: 1px solid #fdaeb7;
                border-left: 4px solid #d73a49;
                border-radius: 6px;
                padding: 12px;
                font-family: monospace;
                font-size: 13px;
                margin: 0;
                overflow-x: auto;
                white-space: pre-wrap;
              ">${item.current}</pre>
            </div>
          ` : ""}

          ${item.suggested ? `
            <div style="margin-bottom: 12px;">
              <div style="font-size: 12px; font-weight: 600; color: #28a745; margin-bottom: 6px;">✅ Suggested Fix:</div>
              <pre style="
                background: #f0fff4;
                border: 1px solid #34d058;
                border-left: 4px solid #28a745;
                border-radius: 6px;
                padding: 12px;
                font-family: monospace;
                font-size: 13px;
                margin: 0;
                overflow-x: auto;
                white-space: pre-wrap;
              ">${item.suggested}</pre>
            </div>
          ` : ""}

          ${item.why ? `
            <div style="background: #f8f9fa; border-radius: 6px; padding: 12px; margin-top: 12px;">
              <div style="display: flex; align-items: flex-start; gap: 8px;">
                <span style="color: #0366d6;">💡</span>
                <div>
                  <strong style="font-size: 12px; color: #24292e;">Why this matters:</strong>
                  <p style="margin: 4px 0 0 0; font-size: 14px; color: #586069; line-height: 1.4;">${item.why}</p>
                </div>
              </div>
            </div>
          ` : ""}
        </div>
      `;

      mainDiv.appendChild(issueSection);
    });

    // Add copy button
    const copyText = this.formatSpotIssuesForCopy(data);
    mainDiv.appendChild(this.createCopyButton(copyText));

    container.appendChild(mainDiv);
  }

  private static renderDraftNotes(container: HTMLElement, data: DraftNotesResponse): void {
    const mainDiv = document.createElement("div");
    mainDiv.className = "mr-action-container";

    const versionConfig = this.getVersionBumpConfig(data.version_bump);

    // Header
    mainDiv.innerHTML = `
      <div class="mr-action-header">
        <h3 class="mr-action-title">📝 Release Notes</h3>
        <p class="mr-action-subtitle">${data.summary}</p>
      </div>
    `;

    // Version bump badge
    const versionSection = document.createElement("div");
    versionSection.className = "mr-section";
    versionSection.innerHTML = `
      <div class="mr-section-content" style="display: flex; align-items: center; gap: 16px;">
        <span class="mr-version-badge" style="background: ${versionConfig.bg}; color: ${versionConfig.color};">
          ${versionConfig.icon} ${versionConfig.label} Release
        </span>
        <span style="color: #6a737d; font-size: 14px;">
          Suggested version bump based on changes
        </span>
      </div>
    `;
    mainDiv.appendChild(versionSection);

    // Sections mapping
    const sectionConfigs = [
      { key: "features", title: "✨ New Features", icon: "✨", color: "#0366d6" },
      { key: "improvements", title: "🚀 Improvements", icon: "🚀", color: "#6f42c1" },
      { key: "bug_fixes", title: "🐛 Bug Fixes", icon: "🐛", color: "#28a745" },
      { key: "breaking_changes", title: "⚠️ Breaking Changes", icon: "⚠️", color: "#dc3545" },
      { key: "technical_notes", title: "🔧 Technical Notes", icon: "🔧", color: "#6a737d" },
    ];

    sectionConfigs.forEach(({ key, title, color }) => {
      const items = data.sections[key as keyof typeof data.sections];
      if (items && items.length > 0) {
        const section = document.createElement("div");
        section.className = "mr-section";
        section.style.borderLeft = `4px solid ${color}`;
        section.innerHTML = `
          <div class="mr-section-header">${title}</div>
          <ul class="mr-list">
            ${items.map((item) => `<li class="mr-list-item">${item}</li>`).join("")}
          </ul>
        `;
        mainDiv.appendChild(section);
      }
    });

    // Migration notes
    if (data.migration_notes) {
      const migrationSection = document.createElement("div");
      migrationSection.className = "mr-section";
      migrationSection.style.borderLeft = "4px solid #fd7e14";
      migrationSection.innerHTML = `
        <div class="mr-section-header">📋 Migration Notes</div>
        <div class="mr-section-content">
          <p style="margin: 0; line-height: 1.6; color: #24292e;">${data.migration_notes}</p>
        </div>
      `;
      mainDiv.appendChild(migrationSection);
    }

    // Contributors
    if (data.contributors) {
      const contribSection = document.createElement("div");
      contribSection.className = "mr-section";
      contribSection.innerHTML = `
        <div class="mr-section-header">👥 Contributors</div>
        <div class="mr-section-content">
          <p style="margin: 0; color: #586069;">${data.contributors}</p>
        </div>
      `;
      mainDiv.appendChild(contribSection);
    }

    // Add copy button
    const copyText = this.formatDraftNotesForCopy(data);
    mainDiv.appendChild(this.createCopyButton(copyText));

    container.appendChild(mainDiv);
  }

  public static isCompleteJSON(jsonString: string): boolean {
    let trimmed = jsonString.trim();

    if (trimmed.startsWith("```json")) {
      trimmed = trimmed.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (trimmed.startsWith("```")) {
      trimmed = trimmed.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    if (!trimmed.startsWith("[") && !trimmed.startsWith("{")) return false;

    try {
      const openBrackets = (trimmed.match(/\[/g) || []).length;
      const closeBrackets = (trimmed.match(/\]/g) || []).length;
      const openBraces = (trimmed.match(/\{/g) || []).length;
      const closeBraces = (trimmed.match(/\}/g) || []).length;

      if (
        openBrackets === closeBrackets &&
        openBraces === closeBraces &&
        (trimmed.endsWith("]") || trimmed.endsWith("}"))
      ) {
        JSON.parse(trimmed);
        return true;
      }
    } catch (e) {
      return false;
    }

    return false;
  }
}

