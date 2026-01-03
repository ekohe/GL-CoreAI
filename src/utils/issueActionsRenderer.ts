import { IssueActionType } from "./constants";

// Types for different action responses
interface SummarizeIssueResponse {
  title: string;
  overview: string;
  current_status: {
    state: "open" | "in_progress" | "blocked" | "resolved";
    progress_summary: string;
    last_activity: string;
  };
  key_points: Array<{
    type: "requirement" | "decision" | "question" | "concern" | "update";
    summary: string;
  }>;
  stakeholders: {
    author: string;
    assignee: string;
    participants: string[];
  };
  next_steps: string[];
  open_questions: string[];
}

interface BlockerItem {
  type: "technical" | "dependency" | "resource" | "decision" | "external";
  severity: "Critical" | "High" | "Medium" | "Low";
  description: string;
  mentioned_by: string;
  suggested_resolution: string;
}

interface AnalyzeBlockersResponse {
  risk_level: "low" | "medium" | "high" | "critical";
  summary: string;
  blockers: BlockerItem[];
  dependencies: Array<{
    type: string;
    description: string;
    status: string;
    impact: string;
  }>;
  risks: Array<{
    category: string;
    probability: string;
    impact: string;
    description: string;
    mitigation: string;
  }>;
  recommendations: Array<{
    priority: string;
    action: string;
  }>;
}

interface DraftUpdateResponse {
  update_type: "progress" | "blocker" | "completion" | "escalation";
  headline: string;
  status_indicator: "on_track" | "at_risk" | "blocked" | "completed";
  summary: string;
  progress: {
    completed: string[];
    in_progress: string[];
    pending: string[];
  };
  highlights: string[];
  concerns: string[];
  next_milestone: {
    description: string;
    target_date: string;
  };
  action_items: Array<{
    owner: string;
    action: string;
    due: string;
  }>;
  stakeholder_message: string;
}

export class IssueActionsRenderer {
  // Helper to create action buttons section (copy + add to comment)
  private static createActionButtons(textToCopy: string, copyButtonText: string = "📋 Copy to Clipboard"): HTMLElement {
    const actionsSection = document.createElement("div");
    actionsSection.style.cssText = `
      padding: 16px;
      background: #f8f9fa;
      border-top: 1px solid #e1e5e9;
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    `;

    // Copy button
    const copyButton = this.createSingleButton(
      copyButtonText,
      "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      "0 2px 8px rgba(17, 153, 142, 0.3)",
      async () => {
        try {
          await navigator.clipboard.writeText(textToCopy);
          return { success: true };
        } catch (err) {
          return { success: false };
        }
      },
      "✅ Copied!",
      "❌ Failed to copy"
    );

    // Add to Comment button
    const addToCommentButton = this.createSingleButton(
      "💬 Add to Comment",
      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      "0 2px 8px rgba(102, 126, 234, 0.3)",
      async () => {
        return await this.insertIntoCommentBox(textToCopy);
      },
      "✅ Added!",
      "❌ Failed to add"
    );

    actionsSection.appendChild(copyButton);
    actionsSection.appendChild(addToCommentButton);
    return actionsSection;
  }

  // Helper to create a single styled button
  private static createSingleButton(
    buttonText: string,
    bgGradient: string,
    boxShadow: string,
    onClick: () => Promise<{ success: boolean; error?: string }>,
    successText: string,
    failureText: string
  ): HTMLButtonElement {
    const button = document.createElement("button");
    button.innerHTML = buttonText;
    button.style.cssText = `
      background: ${bgGradient};
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
      box-shadow: ${boxShadow};
    `;

    const originalBg = bgGradient;
    const originalShadow = boxShadow;
    const hoverShadow = boxShadow.replace("0 2px 8px", "0 4px 12px").replace("0.3)", "0.4)");

    button.addEventListener("mouseenter", () => {
      button.style.transform = "translateY(-2px)";
      button.style.boxShadow = hoverShadow;
    });

    button.addEventListener("mouseleave", () => {
      button.style.transform = "translateY(0)";
      button.style.boxShadow = originalShadow;
    });

    button.addEventListener("click", async () => {
      const result = await onClick();
      if (result.success) {
        button.innerHTML = successText;
        button.style.background = "linear-gradient(135deg, #28a745 0%, #20c997 100%)";
      } else {
        button.innerHTML = result.error ? `❌ ${result.error}` : failureText;
        button.style.background = "linear-gradient(135deg, #dc3545 0%, #c82333 100%)";
      }
      setTimeout(() => {
        button.innerHTML = buttonText;
        button.style.background = originalBg;
      }, 2000);
    });

    return button;
  }

  // Helper to send message to content script to insert text into comment box
  private static async insertIntoCommentBox(text: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0]?.id) {
        return { success: false, error: "No active tab found" };
      }

      // Send message to content script
      const response = await chrome.tabs.sendMessage(tabs[0].id, {
        action: "insertIntoCommentBox",
        text: text,
      });

      return response || { success: false, error: "No response from page" };
    } catch (error: any) {
      console.error("Error sending message to content script:", error);
      return {
        success: false,
        error: "Could not communicate with GitLab page"
      };
    }
  }

  // Helper to create a copy button (legacy - for backward compatibility)
  private static createCopyButton(textToCopy: string, buttonText: string = "📋 Copy to Clipboard"): HTMLElement {
    return this.createActionButtons(textToCopy, buttonText);
  }

  // Format summarize response for copying
  private static formatSummarizeForCopy(data: SummarizeIssueResponse): string {
    let text = `# Issue Summary\n\n`;
    text += `**${data.title}**\n\n`;
    text += `## Status: ${data.current_status?.state || "Unknown"}\n`;
    text += `${data.current_status?.progress_summary || ""}\n\n`;
    text += `## Overview\n${data.overview}\n\n`;

    if (data.key_points && data.key_points.length > 0) {
      text += `## Key Points\n`;
      data.key_points.forEach((point) => {
        text += `- [${point.type}] ${point.summary}\n`;
      });
      text += `\n`;
    }

    if (data.next_steps && data.next_steps.length > 0) {
      text += `## Next Steps\n`;
      data.next_steps.forEach((step) => {
        text += `- ${step}\n`;
      });
      text += `\n`;
    }

    if (data.open_questions && data.open_questions.length > 0) {
      text += `## Open Questions\n`;
      data.open_questions.forEach((q) => {
        text += `- ${q}\n`;
      });
    }

    return text.trim();
  }

  // Format blockers response for copying
  private static formatBlockersForCopy(data: AnalyzeBlockersResponse): string {
    let text = `# Blocker Analysis\n\n`;
    text += `**Risk Level: ${data.risk_level.toUpperCase()}**\n\n`;
    text += `${data.summary}\n\n`;

    if (data.blockers && data.blockers.length > 0) {
      text += `## Blockers (${data.blockers.length})\n`;
      data.blockers.forEach((blocker, i) => {
        text += `\n### ${i + 1}. [${blocker.severity}] ${blocker.type}\n`;
        text += `${blocker.description}\n`;
        if (blocker.suggested_resolution) {
          text += `**Suggested Resolution:** ${blocker.suggested_resolution}\n`;
        }
      });
      text += `\n`;
    }

    if (data.risks && data.risks.length > 0) {
      text += `## Risks\n`;
      data.risks.forEach((risk) => {
        text += `- **${risk.category}** (Probability: ${risk.probability}, Impact: ${risk.impact})\n`;
        text += `  ${risk.description}\n`;
        if (risk.mitigation) {
          text += `  Mitigation: ${risk.mitigation}\n`;
        }
      });
      text += `\n`;
    }

    if (data.recommendations && data.recommendations.length > 0) {
      text += `## Recommendations\n`;
      data.recommendations.forEach((rec) => {
        text += `- [${rec.priority}] ${rec.action}\n`;
      });
    }

    return text.trim();
  }

  // Format draft update response for copying
  private static formatDraftUpdateForCopy(data: DraftUpdateResponse): string {
    let text = `# Status Update\n\n`;
    text += `**${data.headline}**\n\n`;
    text += `Status: ${data.status_indicator.replace("_", " ").toUpperCase()}\n\n`;
    text += `## Summary\n${data.summary}\n\n`;

    if (data.progress) {
      text += `## Progress\n`;
      if (data.progress.completed && data.progress.completed.length > 0) {
        text += `\n### ✅ Completed\n`;
        data.progress.completed.forEach((item) => {
          text += `- ${item}\n`;
        });
      }
      if (data.progress.in_progress && data.progress.in_progress.length > 0) {
        text += `\n### 🔄 In Progress\n`;
        data.progress.in_progress.forEach((item) => {
          text += `- ${item}\n`;
        });
      }
      if (data.progress.pending && data.progress.pending.length > 0) {
        text += `\n### ⏳ Pending\n`;
        data.progress.pending.forEach((item) => {
          text += `- ${item}\n`;
        });
      }
      text += `\n`;
    }

    if (data.concerns && data.concerns.length > 0) {
      text += `## Concerns\n`;
      data.concerns.forEach((c) => {
        text += `- ${c}\n`;
      });
      text += `\n`;
    }

    if (data.action_items && data.action_items.length > 0) {
      text += `## Action Items\n`;
      data.action_items.forEach((item) => {
        text += `- **${item.owner}** (${item.due}): ${item.action}\n`;
      });
      text += `\n`;
    }

    if (data.stakeholder_message) {
      text += `## Stakeholder Message\n${data.stakeholder_message}\n`;
    }

    return text.trim();
  }

  private static getStatusConfig(status: string) {
    const configs: Record<string, { color: string; bg: string; icon: string; label: string }> = {
      open: { color: "#0366d6", bg: "#cce5ff", icon: "🔵", label: "Open" },
      in_progress: { color: "#fd7e14", bg: "#fff3cd", icon: "🟡", label: "In Progress" },
      blocked: { color: "#dc3545", bg: "#f8d7da", icon: "🔴", label: "Blocked" },
      resolved: { color: "#28a745", bg: "#dcffe4", icon: "🟢", label: "Resolved" },
      on_track: { color: "#28a745", bg: "#dcffe4", icon: "✅", label: "On Track" },
      at_risk: { color: "#fd7e14", bg: "#fff3cd", icon: "⚠️", label: "At Risk" },
      completed: { color: "#28a745", bg: "#dcffe4", icon: "🎉", label: "Completed" },
    };
    return configs[status] || configs.open;
  }

  private static getRiskConfig(risk: string) {
    const configs: Record<string, { color: string; bg: string; icon: string }> = {
      low: { color: "#28a745", bg: "#dcffe4", icon: "🟢" },
      medium: { color: "#fd7e14", bg: "#fff3cd", icon: "🟡" },
      high: { color: "#dc3545", bg: "#f8d7da", icon: "🟠" },
      critical: { color: "#721c24", bg: "#f5c6cb", icon: "🔴" },
    };
    return configs[risk] || configs.medium;
  }

  private static getSeverityConfig(severity: string) {
    const configs: Record<string, { color: string; icon: string }> = {
      Critical: { color: "#dc3545", icon: "🔴" },
      High: { color: "#fd7e14", icon: "🟠" },
      Medium: { color: "#ffc107", icon: "🟡" },
      Low: { color: "#28a745", icon: "🟢" },
    };
    return configs[severity] || configs.Medium;
  }

  private static getTypeConfig(type: string) {
    const configs: Record<string, { color: string; icon: string }> = {
      requirement: { color: "#0366d6", icon: "📋" },
      decision: { color: "#28a745", icon: "✅" },
      question: { color: "#fd7e14", icon: "❓" },
      concern: { color: "#dc3545", icon: "⚠️" },
      update: { color: "#6f42c1", icon: "📝" },
      technical: { color: "#6f42c1", icon: "🔧" },
      dependency: { color: "#0366d6", icon: "🔗" },
      resource: { color: "#fd7e14", icon: "👥" },
      external: { color: "#6a737d", icon: "🌐" },
    };
    return configs[type] || { color: "#6a737d", icon: "📌" };
  }

  private static createStyles(): void {
    if (document.querySelector("style[data-issue-actions-renderer]")) {
      return;
    }

    const style = document.createElement("style");
    style.setAttribute("data-issue-actions-renderer", "true");
    style.textContent = `
      .issue-action-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        max-width: 100%;
        margin: 20px 0;
      }

      .issue-action-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 20px;
        border-radius: 8px 8px 0 0;
        margin-bottom: 0;
      }

      .issue-action-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .issue-action-subtitle {
        margin: 4px 0 0 0;
        font-size: 14px;
        opacity: 0.9;
      }

      .issue-section {
        border: 1px solid #e1e5e9;
        background: white;
        margin-bottom: 16px;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        overflow: hidden;
      }

      .issue-section-header {
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

      .issue-section-content {
        padding: 16px;
      }

      .issue-item {
        padding: 12px 16px;
        border-bottom: 1px solid #f1f3f4;
        display: flex;
        align-items: flex-start;
        gap: 12px;
      }

      .issue-item:last-child {
        border-bottom: none;
      }

      .issue-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 12px;
        white-space: nowrap;
      }

      .issue-list {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .issue-list-item {
        padding: 10px 16px;
        border-bottom: 1px solid #f1f3f4;
        font-size: 14px;
        line-height: 1.5;
        display: flex;
        align-items: flex-start;
        gap: 10px;
      }

      .issue-list-item:last-child {
        border-bottom: none;
      }

      .issue-loading {
        background: white;
        border: 1px solid #e1e5e9;
        border-radius: 8px;
        padding: 32px;
        text-align: center;
        margin: 20px 0;
      }

      .issue-loading-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid #f3f3f3;
        border-top: 3px solid #667eea;
        border-radius: 50%;
        animation: issueSpin 1s linear infinite;
        margin: 0 auto 16px;
      }

      @keyframes issueSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .stakeholder-message {
        background: linear-gradient(135deg, #f6f8fa 0%, #e1e5e9 100%);
        border-radius: 8px;
        padding: 16px;
        border-left: 4px solid #667eea;
        font-style: italic;
        line-height: 1.6;
        color: #24292e;
      }

      .action-item-card {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 8px;
        border-left: 4px solid #667eea;
      }
    `;

    document.head.appendChild(style);
  }

  public static showLoadingState(container: HTMLElement, actionType: IssueActionType): void {
    container.innerHTML = "";
    this.createStyles();

    const messages: Record<IssueActionType, string> = {
      summarize: "Analyzing issue details and discussions...",
      analyze_blockers: "Identifying blockers, risks, and dependencies...",
      draft_update: "Drafting status update for stakeholders...",
    };

    const loadingDiv = document.createElement("div");
    loadingDiv.className = "issue-loading";
    loadingDiv.innerHTML = `
      <div class="issue-loading-spinner"></div>
      <p style="margin: 0; color: #586069; font-size: 14px;">${messages[actionType]}</p>
    `;

    container.appendChild(loadingDiv);
  }

  public static showProgressState(container: HTMLElement, progress: string): void {
    container.innerHTML = "";
    this.createStyles();

    const progressDiv = document.createElement("div");
    progressDiv.className = "issue-loading";
    progressDiv.innerHTML = `
      <div class="issue-loading-spinner"></div>
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

  public static render(container: HTMLElement, data: string, actionType: IssueActionType): void {
    container.innerHTML = "";
    this.createStyles();

    try {
      let cleanedData = data.trim();
      if (cleanedData.startsWith("```json")) {
        cleanedData = cleanedData.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleanedData.startsWith("```")) {
        cleanedData = cleanedData.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const parsed = JSON.parse(cleanedData);

      switch (actionType) {
        case "summarize":
          this.renderSummarize(container, parsed as SummarizeIssueResponse);
          break;
        case "analyze_blockers":
          this.renderAnalyzeBlockers(container, parsed as AnalyzeBlockersResponse);
          break;
        case "draft_update":
          this.renderDraftUpdate(container, parsed as DraftUpdateResponse);
          break;
      }
    } catch (error: any) {
      console.error("Failed to parse response:", error);
      this.showErrorState(container, `Failed to parse AI response: ${error.message}`, data);
    }
  }

  private static renderSummarize(container: HTMLElement, data: SummarizeIssueResponse): void {
    const mainDiv = document.createElement("div");
    mainDiv.className = "issue-action-container";

    const statusConfig = this.getStatusConfig(data.current_status?.state || "open");

    // Header
    mainDiv.innerHTML = `
      <div class="issue-action-header">
        <h3 class="issue-action-title">📋 Issue Summary</h3>
        <p class="issue-action-subtitle">${data.title}</p>
      </div>
    `;

    // Status Section
    const statusSection = document.createElement("div");
    statusSection.className = "issue-section";
    statusSection.innerHTML = `
      <div class="issue-section-content" style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
        <span class="issue-badge" style="background: ${statusConfig.bg}; color: ${statusConfig.color}; font-size: 14px; padding: 6px 12px;">
          ${statusConfig.icon} ${statusConfig.label}
        </span>
        <span style="color: #586069; font-size: 14px; flex: 1;">
          ${data.current_status?.progress_summary || "No progress summary available"}
        </span>
      </div>
    `;
    mainDiv.appendChild(statusSection);

    // Overview Section
    const overviewSection = document.createElement("div");
    overviewSection.className = "issue-section";
    overviewSection.innerHTML = `
      <div class="issue-section-header">📝 Overview</div>
      <div class="issue-section-content">
        <p style="margin: 0; line-height: 1.6; color: #24292e;">${data.overview}</p>
      </div>
    `;
    mainDiv.appendChild(overviewSection);

    // Key Points Section
    if (data.key_points && data.key_points.length > 0) {
      const keyPointsSection = document.createElement("div");
      keyPointsSection.className = "issue-section";
      keyPointsSection.innerHTML = `<div class="issue-section-header">💡 Key Points</div>`;

      const pointsContent = document.createElement("div");
      data.key_points.forEach((point) => {
        const config = this.getTypeConfig(point.type);
        const item = document.createElement("div");
        item.className = "issue-item";
        item.innerHTML = `
          <span class="issue-badge" style="background: ${config.color}20; color: ${config.color};">
            ${config.icon} ${point.type}
          </span>
          <div style="flex: 1; font-size: 14px; color: #24292e; line-height: 1.5;">
            ${point.summary}
          </div>
        `;
        pointsContent.appendChild(item);
      });
      keyPointsSection.appendChild(pointsContent);
      mainDiv.appendChild(keyPointsSection);
    }

    // Next Steps Section
    if (data.next_steps && data.next_steps.length > 0) {
      const nextStepsSection = document.createElement("div");
      nextStepsSection.className = "issue-section";
      nextStepsSection.innerHTML = `
        <div class="issue-section-header">🎯 Next Steps</div>
        <ul class="issue-list">
          ${data.next_steps.map((step) => `<li class="issue-list-item">▶️ ${step}</li>`).join("")}
        </ul>
      `;
      mainDiv.appendChild(nextStepsSection);
    }

    // Open Questions Section
    if (data.open_questions && data.open_questions.length > 0) {
      const questionsSection = document.createElement("div");
      questionsSection.className = "issue-section";
      questionsSection.style.borderLeft = "4px solid #fd7e14";
      questionsSection.innerHTML = `
        <div class="issue-section-header">❓ Open Questions</div>
        <ul class="issue-list">
          ${data.open_questions.map((q) => `<li class="issue-list-item">• ${q}</li>`).join("")}
        </ul>
      `;
      mainDiv.appendChild(questionsSection);
    }

    // Add copy button
    const copyText = this.formatSummarizeForCopy(data);
    mainDiv.appendChild(this.createCopyButton(copyText));

    container.appendChild(mainDiv);
  }

  private static renderAnalyzeBlockers(container: HTMLElement, data: AnalyzeBlockersResponse): void {
    const mainDiv = document.createElement("div");
    mainDiv.className = "issue-action-container";

    const riskConfig = this.getRiskConfig(data.risk_level);

    // Header
    mainDiv.innerHTML = `
      <div class="issue-action-header">
        <h3 class="issue-action-title">🔍 Blocker Analysis</h3>
        <p class="issue-action-subtitle">${data.summary}</p>
      </div>
    `;

    // Risk Level Badge
    const riskSection = document.createElement("div");
    riskSection.className = "issue-section";
    riskSection.innerHTML = `
      <div class="issue-section-content" style="display: flex; align-items: center; gap: 16px;">
        <span class="issue-badge" style="background: ${riskConfig.bg}; color: ${riskConfig.color}; font-size: 14px; padding: 8px 16px;">
          ${riskConfig.icon} Risk Level: ${data.risk_level.toUpperCase()}
        </span>
      </div>
    `;
    mainDiv.appendChild(riskSection);

    // Blockers Section
    if (data.blockers && data.blockers.length > 0) {
      const blockersSection = document.createElement("div");
      blockersSection.className = "issue-section";
      blockersSection.style.borderLeft = "4px solid #dc3545";
      blockersSection.innerHTML = `<div class="issue-section-header">🚫 Blockers (${data.blockers.length})</div>`;

      const blockersContent = document.createElement("div");
      data.blockers.forEach((blocker) => {
        const sevConfig = this.getSeverityConfig(blocker.severity);
        const typeConfig = this.getTypeConfig(blocker.type);
        const item = document.createElement("div");
        item.className = "issue-item";
        item.style.flexDirection = "column";
        item.style.gap = "8px";
        item.innerHTML = `
          <div style="display: flex; gap: 8px; align-items: center;">
            <span class="issue-badge" style="background: ${sevConfig.color}20; color: ${sevConfig.color};">
              ${sevConfig.icon} ${blocker.severity}
            </span>
            <span class="issue-badge" style="background: ${typeConfig.color}20; color: ${typeConfig.color};">
              ${typeConfig.icon} ${blocker.type}
            </span>
            ${blocker.mentioned_by ? `<span style="color: #6a737d; font-size: 12px;">by ${blocker.mentioned_by}</span>` : ""}
          </div>
          <div style="font-size: 14px; color: #24292e; line-height: 1.5;">${blocker.description}</div>
          ${blocker.suggested_resolution ? `
            <div style="background: #f0fff4; border-radius: 6px; padding: 10px; font-size: 13px; color: #22863a;">
              💡 <strong>Suggested Resolution:</strong> ${blocker.suggested_resolution}
            </div>
          ` : ""}
        `;
        blockersContent.appendChild(item);
      });
      blockersSection.appendChild(blockersContent);
      mainDiv.appendChild(blockersSection);
    } else {
      const noBlockersSection = document.createElement("div");
      noBlockersSection.className = "issue-section";
      noBlockersSection.style.borderLeft = "4px solid #28a745";
      noBlockersSection.innerHTML = `
        <div class="issue-section-header" style="background: #dcffe4;">✅ No Blockers Identified</div>
        <div class="issue-section-content">
          <p style="margin: 0; color: #22863a;">No explicit blockers were found in the issue or discussions.</p>
        </div>
      `;
      mainDiv.appendChild(noBlockersSection);
    }

    // Risks Section
    if (data.risks && data.risks.length > 0) {
      const risksSection = document.createElement("div");
      risksSection.className = "issue-section";
      risksSection.innerHTML = `<div class="issue-section-header">⚠️ Risks</div>`;

      const risksContent = document.createElement("div");
      data.risks.forEach((risk) => {
        const item = document.createElement("div");
        item.className = "issue-item";
        item.style.flexDirection = "column";
        item.style.gap = "8px";
        item.innerHTML = `
          <div style="display: flex; gap: 8px; align-items: center;">
            <span style="font-weight: 600; color: #24292e;">${risk.category}</span>
            <span style="color: #6a737d; font-size: 12px;">
              Probability: ${risk.probability} | Impact: ${risk.impact}
            </span>
          </div>
          <div style="font-size: 14px; color: #586069; line-height: 1.5;">${risk.description}</div>
          ${risk.mitigation ? `
            <div style="font-size: 13px; color: #0366d6;">
              🛡️ <strong>Mitigation:</strong> ${risk.mitigation}
            </div>
          ` : ""}
        `;
        risksContent.appendChild(item);
      });
      risksSection.appendChild(risksContent);
      mainDiv.appendChild(risksSection);
    }

    // Recommendations Section
    if (data.recommendations && data.recommendations.length > 0) {
      const recsSection = document.createElement("div");
      recsSection.className = "issue-section";
      recsSection.style.borderLeft = "4px solid #0366d6";
      recsSection.innerHTML = `
        <div class="issue-section-header">💡 Recommendations</div>
        <ul class="issue-list">
          ${data.recommendations.map((rec) => `
            <li class="issue-list-item">
              <span class="issue-badge" style="background: #cce5ff; color: #0366d6; font-size: 11px;">
                ${rec.priority}
              </span>
              <span style="flex: 1;">${rec.action}</span>
            </li>
          `).join("")}
        </ul>
      `;
      mainDiv.appendChild(recsSection);
    }

    // Add copy button
    const copyText = this.formatBlockersForCopy(data);
    mainDiv.appendChild(this.createCopyButton(copyText));

    container.appendChild(mainDiv);
  }

  private static renderDraftUpdate(container: HTMLElement, data: DraftUpdateResponse): void {
    const mainDiv = document.createElement("div");
    mainDiv.className = "issue-action-container";

    const statusConfig = this.getStatusConfig(data.status_indicator);

    // Header
    mainDiv.innerHTML = `
      <div class="issue-action-header">
        <h3 class="issue-action-title">📊 Status Update</h3>
        <p class="issue-action-subtitle">${data.headline}</p>
      </div>
    `;

    // Status & Summary Section
    const statusSection = document.createElement("div");
    statusSection.className = "issue-section";
    statusSection.innerHTML = `
      <div class="issue-section-content">
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px; flex-wrap: wrap;">
          <span class="issue-badge" style="background: ${statusConfig.bg}; color: ${statusConfig.color}; font-size: 14px; padding: 8px 16px;">
            ${statusConfig.icon} ${statusConfig.label}
          </span>
          <span class="issue-badge" style="background: #f0f4f8; color: #586069; font-size: 12px;">
            ${data.update_type} update
          </span>
        </div>
        <p style="margin: 0; line-height: 1.6; color: #24292e; font-size: 15px;">${data.summary}</p>
      </div>
    `;
    mainDiv.appendChild(statusSection);

    // Progress Section
    if (data.progress) {
      const progressSection = document.createElement("div");
      progressSection.className = "issue-section";
      progressSection.innerHTML = `<div class="issue-section-header">📈 Progress</div>`;

      let progressContent = '<div class="issue-section-content">';

      if (data.progress.completed && data.progress.completed.length > 0) {
        progressContent += `
          <div style="margin-bottom: 16px;">
            <div style="font-weight: 600; color: #28a745; margin-bottom: 8px; font-size: 13px;">✅ Completed</div>
            <ul style="margin: 0; padding-left: 20px; color: #24292e;">
              ${data.progress.completed.map((item) => `<li style="margin-bottom: 4px;">${item}</li>`).join("")}
            </ul>
          </div>
        `;
      }

      if (data.progress.in_progress && data.progress.in_progress.length > 0) {
        progressContent += `
          <div style="margin-bottom: 16px;">
            <div style="font-weight: 600; color: #fd7e14; margin-bottom: 8px; font-size: 13px;">🔄 In Progress</div>
            <ul style="margin: 0; padding-left: 20px; color: #24292e;">
              ${data.progress.in_progress.map((item) => `<li style="margin-bottom: 4px;">${item}</li>`).join("")}
            </ul>
          </div>
        `;
      }

      if (data.progress.pending && data.progress.pending.length > 0) {
        progressContent += `
          <div>
            <div style="font-weight: 600; color: #6a737d; margin-bottom: 8px; font-size: 13px;">⏳ Pending</div>
            <ul style="margin: 0; padding-left: 20px; color: #586069;">
              ${data.progress.pending.map((item) => `<li style="margin-bottom: 4px;">${item}</li>`).join("")}
            </ul>
          </div>
        `;
      }

      progressContent += "</div>";
      progressSection.innerHTML += progressContent;
      mainDiv.appendChild(progressSection);
    }

    // Concerns Section
    if (data.concerns && data.concerns.length > 0) {
      const concernsSection = document.createElement("div");
      concernsSection.className = "issue-section";
      concernsSection.style.borderLeft = "4px solid #fd7e14";
      concernsSection.innerHTML = `
        <div class="issue-section-header">⚠️ Concerns</div>
        <ul class="issue-list">
          ${data.concerns.map((c) => `<li class="issue-list-item">• ${c}</li>`).join("")}
        </ul>
      `;
      mainDiv.appendChild(concernsSection);
    }

    // Action Items Section
    if (data.action_items && data.action_items.length > 0) {
      const actionsSection = document.createElement("div");
      actionsSection.className = "issue-section";
      actionsSection.innerHTML = `<div class="issue-section-header">📋 Action Items</div>`;

      let actionsContent = '<div class="issue-section-content">';
      data.action_items.forEach((item) => {
        actionsContent += `
          <div class="action-item-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-weight: 600; color: #24292e;">${item.owner}</span>
              <span style="font-size: 12px; color: #6a737d;">${item.due}</span>
            </div>
            <div style="font-size: 14px; color: #586069;">${item.action}</div>
          </div>
        `;
      });
      actionsContent += "</div>";
      actionsSection.innerHTML += actionsContent;
      mainDiv.appendChild(actionsSection);
    }

    // Stakeholder Message Section
    if (data.stakeholder_message) {
      const messageSection = document.createElement("div");
      messageSection.className = "issue-section";
      messageSection.innerHTML = `
        <div class="issue-section-header">📨 Stakeholder Message</div>
        <div class="issue-section-content">
          <div class="stakeholder-message">${data.stakeholder_message}</div>
        </div>
      `;

      // Add copy button for stakeholder message
      const msgCopyBtn = document.createElement("button");
      msgCopyBtn.innerHTML = "📋 Copy Message";
      msgCopyBtn.style.cssText = `
        margin-top: 12px;
        background: #667eea;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 13px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
      `;
      msgCopyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(data.stakeholder_message!);
          msgCopyBtn.innerHTML = "✅ Copied!";
          setTimeout(() => {
            msgCopyBtn.innerHTML = "📋 Copy Message";
          }, 2000);
        } catch {
          msgCopyBtn.innerHTML = "❌ Failed to copy";
          setTimeout(() => {
            msgCopyBtn.innerHTML = "📋 Copy Message";
          }, 2000);
        }
      });
      messageSection.querySelector(".issue-section-content")?.appendChild(msgCopyBtn);
      mainDiv.appendChild(messageSection);
    }

    // Add copy button for full update
    const copyText = this.formatDraftUpdateForCopy(data);
    mainDiv.appendChild(this.createCopyButton(copyText, "📋 Copy Full Update"));

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

