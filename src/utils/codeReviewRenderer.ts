interface CodeReviewItem {
  file: string;
  line: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  issue: string;
  current: string;
  suggested: string;
  why: string;
}

export class CodeReviewRenderer {
  private static getSeverityConfig(severity: string) {
    const configs: Record<string, {
      color: string;
      icon: string;
      priority: number;
    }> = {
      Critical: { color: '#dc3545', icon: '🔴', priority: 4 },
      High: { color: '#fd7e14', icon: '🟠', priority: 3 },
      Medium: { color: '#ffc107', icon: '🟡', priority: 2 },
      Low: { color: '#28a745', icon: '🟢', priority: 1 }
    };
    return configs[severity] || configs.Medium;
  }

  private static createStyles(): HTMLStyleElement {
    if (document.querySelector('style[data-code-review-v2]')) {
      return document.querySelector('style[data-code-review-v2]') as HTMLStyleElement;
    }

    const style = document.createElement('style');
    style.setAttribute('data-code-review-v2', 'true');
    style.textContent = `
      .code-review-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        max-width: 100%;
        margin: 20px 0;
      }

      .review-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 20px;
        border-radius: 8px 8px 0 0;
        margin-bottom: 0;
      }

      .review-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .review-subtitle {
        margin: 4px 0 0 0;
        font-size: 14px;
        opacity: 0.9;
      }

      .review-item {
        border: 1px solid #e1e5e9;
        background: white;
        margin-bottom: 20px;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        transition: all 0.2s ease;
        overflow: hidden;
      }

      .review-item:hover {
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateY(-1px);
      }

      .review-item:last-child {
        margin-bottom: 0;
      }

      .item-header {
        padding: 16px 20px 12px;
        border-bottom: 1px solid #f1f3f4;
        background: #fafbfc;
      }

      .severity-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 12px;
        background: rgba(255,255,255,0.9);
        margin-right: 12px;
      }

      .line-info {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        color: #6a737d;
        background: #f1f3f4;
        padding: 2px 8px;
        border-radius: 4px;
      }

      .item-title {
        margin: 8px 0 0 0;
        font-size: 16px;
        font-weight: 600;
        color: #24292e;
      }

      .item-description {
        margin: 8px 0 0 0;
        font-size: 14px;
        color: #586069;
        line-height: 1.5;
      }

      .code-section {
        margin: 16px 20px;
      }

      .code-label {
        font-size: 12px;
        font-weight: 600;
        color: #6a737d;
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .code-block {
        background: #f6f8fa;
        border: 1px solid #e1e5e9;
        border-radius: 6px;
        padding: 12px;
        font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.45;
        color: #24292e;
        overflow-x: auto;
        margin-bottom: 12px;
        white-space: pre-wrap;
      }

      .code-suggested {
        background: #f0fff4;
        border-color: #34d058;
      }

      .reason-section {
        background: #f8f9fa;
        padding: 12px 20px;
        border-top: 1px solid #e1e5e9;
        font-size: 14px;
        color: #586069;
        line-height: 1.5;
      }

      .apply-section {
        padding: 12px 20px;
        border-top: 1px solid #e1e5e9;
        background: #fafbfc;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .apply-btn {
        background: #28a745;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: background-color 0.2s ease;
      }

      .apply-btn:hover {
        background: #22863a;
      }

      .apply-btn:disabled {
        background: #94d3a2;
        cursor: not-allowed;
      }

      .apply-info {
        font-size: 12px;
        color: #6a737d;
      }

      .loading-state {
        background: white;
        border: 1px solid #e1e5e9;
        border-radius: 8px;
        padding: 24px;
        text-align: center;
        margin: 20px 0;
      }

      .loading-spinner {
        width: 24px;
        height: 24px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #0366d6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 12px;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .loading-text {
        color: #586069;
        font-size: 14px;
        margin: 0;
      }

      .error-state {
        background: #ffeaa7;
        border: 1px solid #fdcb6e;
        border-radius: 8px;
        padding: 16px;
        margin: 20px 0;
      }

      .error-title {
        color: #d63031;
        font-weight: 600;
        margin: 0 0 8px 0;
      }

      .error-message {
        color: #2d3436;
        margin: 0;
        line-height: 1.5;
      }
    `;

    document.head.appendChild(style);
    return style;
  }

  public static showLoadingState(container: HTMLElement): void {
    container.innerHTML = '';
    this.createStyles();

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-state';
    loadingDiv.innerHTML = `
      <div class="loading-spinner"></div>
      <p class="loading-text">AI is analyzing your code changes...</p>
    `;

    container.appendChild(loadingDiv);
  }

  public static showProgressiveState(container: HTMLElement, progress: string): void {
    container.innerHTML = '';
    this.createStyles();

    const progressDiv = document.createElement('div');
    progressDiv.className = 'loading-state';
    progressDiv.innerHTML = `
      <div class="loading-spinner"></div>
      <p class="loading-text">Receiving analysis results... (${progress.length} characters)</p>
    `;

    container.appendChild(progressDiv);
  }

  public static showErrorState(container: HTMLElement, error: string, rawResponse?: string): void {
    container.innerHTML = '';
    this.createStyles();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-state';

    let errorContent = `
      <h4 class="error-title">⚠️ Analysis Failed</h4>
      <p class="error-message">Unable to parse AI response. The enhanced prompt should resolve this issue.</p>
      <div style="
        background: #e8f5e8;
        border-left: 4px solid #4caf50;
        padding: 12px;
        margin: 12px 0;
        border-radius: 4px;
      ">
        <h5 style="margin: 0 0 8px 0; color: #2e7d32; font-size: 14px;">🔧 Recent Improvements Made</h5>
        <ul style="margin: 0; padding-left: 18px; color: #2e7d32; font-size: 13px;">
          <li>Completely rewrote the AI prompt with detailed Git diff parsing instructions</li>
          <li>Added strict JSON format requirements and validation rules</li>
          <li>Implemented multi-level JSON repair system (basic → advanced → fallback)</li>
          <li>Enhanced file path extraction and line number calculation guidance</li>
          <li>Added specific examples of expected diff format parsing</li>
        </ul>
      </div>
    `;

    if (rawResponse) {
      errorContent += `
        <details style="margin-top: 12px;">
          <summary style="cursor: pointer; font-weight: 600; color: #2d3436;">🔍 View Raw AI Response</summary>
          <pre style="
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 12px;
            margin-top: 8px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 12px;
            max-height: 300px;
            overflow-y: auto;
            white-space: pre-wrap;
          ">${rawResponse.length > 2000 ? rawResponse.substring(0, 2000) + '...[truncated]' : rawResponse}</pre>
        </details>

        <details style="margin-top: 8px;">
          <summary style="cursor: pointer; font-weight: 600; color: #2d3436;">📄 Expected Diff Format</summary>
          <div style="
            background: #f0f4f8;
            border: 1px solid #cbd5e0;
            border-radius: 4px;
            padding: 12px;
            margin-top: 8px;
            font-size: 12px;
            color: #2d3748;
          ">
            <strong>Git Diff Structure:</strong><br/>
            <code style="background: #e2e8f0; padding: 2px 4px; border-radius: 2px;">diff --git a/path/file.ext b/path/file.ext</code><br/>
            <code style="background: #e2e8f0; padding: 2px 4px; border-radius: 2px;">@@ -76,3 +79,5 @@ class ClassName</code><br/>
            <code style="background: #ffe6e6; padding: 2px 4px; border-radius: 2px;">-deleted line</code><br/>
            <code style="background: #e6ffe6; padding: 2px 4px; border-radius: 2px;">+added line</code><br/>
            <br/>
            <strong>Expected JSON Output:</strong><br/>
            <code style="background: #e2e8f0; padding: 2px 4px; border-radius: 2px;">{"file": "path/file.ext", "line": "81", "severity": "High", ...}</code>
          </div>
        </details>
      `;
    }

    errorDiv.innerHTML = errorContent;
    container.appendChild(errorDiv);
  }

  public static renderCodeReview(container: HTMLElement, reviewData: string): void {
    container.innerHTML = '';
    this.createStyles();

    try {
      // Parse and clean the JSON response
      let cleanedData = reviewData.trim();
      if (cleanedData.startsWith('```json')) {
        cleanedData = cleanedData.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedData.startsWith('```')) {
        cleanedData = cleanedData.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      let parsedData;

      try {
        // First attempt: parse as-is
        parsedData = JSON.parse(cleanedData);
      } catch (firstError: any) {
        // Second attempt: try basic JSON repair
        try {
          const repairedData = this.basicJSONRepair(cleanedData);
          parsedData = JSON.parse(repairedData);
        } catch (secondError: any) {
          // Third attempt: try advanced repair for the specific user issues
          try {
            const advancedRepairedData = this.advancedJSONRepair(cleanedData);
            parsedData = JSON.parse(advancedRepairedData);
          } catch (thirdError: any) {
            throw new Error(`JSON parsing failed after all repair attempts. Original: ${firstError.message}. Basic repair: ${secondError.message}. Advanced repair: ${thirdError.message}`);
          }
        }
      }
      let reviewItems: CodeReviewItem[];

      // Handle both old and new JSON formats
      if (Array.isArray(parsedData)) {
        // Convert old format to new format if needed
        reviewItems = parsedData.map((item: any) => {
          // Check if it's already in new simplified format
          if (item.file && item.issue && item.current && item.suggested && item.why) {
            return item as CodeReviewItem;
          }

          // Convert from various old formats to new format
          return {
            file: item.file || item.file_path || item.path || 'unknown',
            line: item.line || item.line_number || '0',
            severity: item.severity?.trim() || 'Medium',
            issue: item.issue || item.title || item.description || item.category || 'Code improvement needed',
            current: item.current || item.current_code || item.code_snippet || '',
            suggested: item.suggested || item.suggested_code || item.fixed_code || '',
            why: item.why || item.reason || item.recommendation || 'Improves code quality'
          } as CodeReviewItem;
        }).filter(item => item.current && item.suggested); // Filter out items without code
      } else {
        throw new Error('Response is not an array');
      }

      if (!Array.isArray(reviewItems) || reviewItems.length === 0) {
        container.innerHTML = `
          <div class="code-review-container">
            <div class="review-header">
              <h3 class="review-title">✅ Code Review Complete</h3>
              <p class="review-subtitle">No issues found that need improvement</p>
            </div>
          </div>
        `;
        return;
      }

      // Sort by severity priority
      reviewItems.sort((a, b) => {
        const configA = this.getSeverityConfig(a.severity);
        const configB = this.getSeverityConfig(b.severity);
        return configB.priority - configA.priority;
      });

      // Store review data globally for GitLab integration
      if (window.setReviewData) {
        window.setReviewData(reviewItems);
      }

      // Create main container
      const reviewContainer = document.createElement('div');
      reviewContainer.className = 'code-review-container';

      // Header
      const header = document.createElement('div');
      header.className = 'review-header';
      header.innerHTML = `
        <h3 class="review-title">📋 Code Review Results</h3>
        <p class="review-subtitle">Found ${reviewItems.length} improvement suggestions - each item is analyzed separately below</p>
      `;
      reviewContainer.appendChild(header);

      // Render each review item with separators
      reviewItems.forEach((item, index) => {
        // Add a separator for better visual distinction (except for first item)
        if (index > 0) {
          const separator = document.createElement('div');
          separator.style.cssText = `
            height: 1px;
            background: linear-gradient(to right, transparent, #e1e5e9, transparent);
            margin: 24px 0;
            position: relative;
          `;
          separator.innerHTML = `
            <div style="
              position: absolute;
              left: 50%;
              top: -8px;
              transform: translateX(-50%);
              background: white;
              padding: 0 12px;
              font-size: 12px;
              color: #6a737d;
              font-weight: 600;
            ">ISSUE ${index + 1}</div>
          `;
          reviewContainer.appendChild(separator);
        }

        const itemElement = this.createReviewItem(item, index);
        reviewContainer.appendChild(itemElement);
      });

      container.appendChild(reviewContainer);

    } catch (error: any) {
      console.error('Failed to parse review data:', error);
      console.error('Raw response data:', reviewData);
      this.showErrorState(container, error.message, reviewData);
    }
  }

  private static createReviewItem(item: CodeReviewItem, index: number): HTMLElement {
    const config = this.getSeverityConfig(item.severity);

    const itemDiv = document.createElement('div');
    itemDiv.className = 'review-item';

    // File path header - Show which file this is about
    const fileHeader = document.createElement('div');
    fileHeader.style.cssText = `
      background: linear-gradient(135deg, #f6f8fa 0%, #e1e5e9 100%);
      border-bottom: 1px solid #e1e5e9;
      padding: 12px 16px;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, monospace;
      font-size: 13px;
      color: #586069;
      border-radius: 8px 8px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    fileHeader.innerHTML = `
      <div>
        📄 <strong style="color: #0366d6;">${item.file}</strong> • Line ${item.line}
      </div>
      <div style="
        background: #0366d6;
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
      ">#${index + 1}</div>
    `;
    itemDiv.appendChild(fileHeader);

    // Header with severity and issue description - Text Display
    const headerDiv = document.createElement('div');
    headerDiv.className = 'item-header';
    headerDiv.innerHTML = `
      <div style="margin-bottom: 12px;">
        <span class="severity-badge" style="color: ${config.color}; border: 1px solid ${config.color};">
          ${config.icon} ${item.severity}
        </span>
      </div>
      <div style="background: #fafbfc; padding: 12px; border-radius: 6px; border-left: 4px solid ${config.color};">
        <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #24292e;">
          <strong>Issue:</strong> ${item.issue}
        </p>
      </div>
    `;
    itemDiv.appendChild(headerDiv);

    // Code sections - Only for current and suggested code
    if (item.current || item.suggested) {
      const codeSection = document.createElement('div');
      codeSection.className = 'code-section';

      if (item.current && item.current.trim()) {
        // Current code section
        const currentLabel = document.createElement('div');
        currentLabel.className = 'code-label';
        currentLabel.innerHTML = `🔍 <strong>Current Code:</strong>`;
        currentLabel.style.cssText = `
          margin: 16px 0 8px 0;
          color: #d73a49;
          font-weight: 600;
        `;
        codeSection.appendChild(currentLabel);

        const currentCode = document.createElement('pre');
        currentCode.className = 'code-block';
        currentCode.style.cssText += `
          border-left: 4px solid #d73a49;
          background: #ffeef0;
          border: 1px solid #fdaeb7;
          position: relative;
        `;
        currentCode.textContent = item.current.trim();
        codeSection.appendChild(currentCode);
      }

      if (item.suggested && item.suggested.trim()) {
        // Suggested code section
        const suggestedLabel = document.createElement('div');
        suggestedLabel.className = 'code-label';
        suggestedLabel.innerHTML = `✅ <strong>Suggested Fix:</strong>`;
        suggestedLabel.style.cssText = `
          margin: 16px 0 8px 0;
          color: #28a745;
          font-weight: 600;
        `;
        codeSection.appendChild(suggestedLabel);

        const suggestedCode = document.createElement('pre');
        suggestedCode.className = 'code-block code-suggested';
        suggestedCode.style.cssText += `
          border-left: 4px solid #28a745;
          background: #f0fff4;
          border: 1px solid #34d058;
        `;
        suggestedCode.textContent = item.suggested.trim();
        codeSection.appendChild(suggestedCode);
      }

      itemDiv.appendChild(codeSection);
    }

    // Why section - Text explanation
    if (item.why && item.why.trim()) {
      const whySection = document.createElement('div');
      whySection.className = 'reason-section';
      whySection.style.cssText += `
        background: #f8f9fa;
        border-top: 1px solid #e1e5e9;
        margin: 16px 0 0 0;
      `;
      whySection.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 8px; padding: 12px 16px;">
          <span style="color: #0366d6; font-size: 16px; margin-top: 2px;">💡</span>
          <div>
            <strong style="color: #24292e; font-size: 14px;">Why this matters:</strong>
            <p style="margin: 4px 0 0 0; line-height: 1.5; color: #586069; font-size: 14px;">${item.why}</p>
          </div>
        </div>
      `;
      itemDiv.appendChild(whySection);
    }

    // Apply section (GitLab API integration)
    const applySection = document.createElement('div');
    applySection.className = 'apply-section';
    applySection.innerHTML = `
      <span class="apply-info" style="font-size: 12px;">📍 ${item.file}:${item.line}</span>
      <button class="apply-btn" onclick="window.applyCodeSuggestion?.(${index}, '${item.line}')">
        🚀 Apply to GitLab
      </button>
    `;
    itemDiv.appendChild(applySection);

    return itemDiv;
  }

  private static basicJSONRepair(jsonString: string): string {
    let repaired = jsonString.trim();

    // Remove any non-JSON text before the array/object
    const jsonStart = Math.min(
      repaired.indexOf('[') === -1 ? Infinity : repaired.indexOf('['),
      repaired.indexOf('{') === -1 ? Infinity : repaired.indexOf('{')
    );
    if (jsonStart !== Infinity && jsonStart > 0) {
      repaired = repaired.substring(jsonStart);
    }

    // Remove markdown code blocks first
    repaired = repaired.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

    // Fix common JSON syntax errors step by step

    // 1. Fix the specific issues from the user's example
    // Fix missing space in "skip_before_actionverify_authenticity_token"
    repaired = repaired.replace(/skip_before_actionverify_authenticity_token/g, 'skip_before_action :verify_authenticity_token');

    // Fix broken field names like "file "ApplicationController""
    repaired = repaired.replace(/"file\s+"([^"]+)"/g, '"file": "$1"');

    // Fix broken string concatenation where "current" field runs into "suggested"
    repaired = repaired.replace(/"current"\s*:\s*"([^"]*?)"\s*([^,\}]+)\s*"suggested"/g, '"current": "$1", "suggested"');

    // Fix missing commas between fields
    repaired = repaired.replace(/"\s*"([a-zA-Z_]+)"\s*:/g, '", "$1":');

    // 2. Fix missing quotes around property names
    repaired = repaired.replace(/([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '"$1":');
    repaired = repaired.replace(/""([a-zA-Z_][a-zA-Z0-9_]*)""\s*:/g, '"$1":');

    // 3. Fix completely malformed patterns like "": "", "title "something"
    repaired = repaired.replace(/""\s*:\s*""\s*,?\s*"([^"]+)"/g, '"issue": "$1"');
    repaired = repaired.replace(/""\s*:\s*""/g, '');

    // 4. Fix specific patterns (severity: "", etc.)
    repaired = repaired.replace(/"severity"\s*:\s*""\s*,/g, '"severity": "Medium",');
    repaired = repaired.replace(/"line"\s*:\s*""\s*,/g, '"line": "0",');

    // 5. Fix broken string values that span multiple properties
    repaired = repaired.replace(/"([^"]*?)"\s*([^",\[\{\]\}]+)\s*"([a-zA-Z_]+)":/g, '"$1 $2", "$3":');

    // 6. Fix unquoted string values (but preserve numbers/booleans)
    repaired = repaired.replace(/:\s*([^",\[\{\]\}\s][^",\[\{\]\}]*?)(?=\s*[,\]\}])/g, (match, value) => {
      const trimmed = value.trim();
      if (/^(true|false|null|\d+(\.\d+)?)$/i.test(trimmed)) {
        return `: ${trimmed}`;
      }
      return `: "${trimmed}"`;
    });

    // 7. Clean up multiple consecutive commas and empty objects
    repaired = repaired.replace(/,+/g, ',');
    repaired = repaired.replace(/\{\s*,/g, '{');
    repaired = repaired.replace(/,\s*\}/g, '}');
    repaired = repaired.replace(/\[\s*,/g, '[');
    repaired = repaired.replace(/,\s*\]/g, ']');

    // 8. Remove trailing commas
    repaired = repaired.replace(/,(\s*[\]\}])/g, '$1');

    // 9. Fix smart quotes to regular quotes
    repaired = repaired.replace(/[""]/g, '"').replace(/['']/g, "'");

    // 10. Remove completely empty properties
    repaired = repaired.replace(/,?\s*"[^"]*"\s*:\s*""\s*,?/g, '');
    repaired = repaired.replace(/,\s*,/g, ',');

    return repaired;
  }

  private static advancedJSONRepair(jsonString: string): string {
    let repaired = jsonString.trim();

    // Remove any non-JSON text before the array
    repaired = repaired.replace(/^[^[{]*/, '');
    repaired = repaired.replace(/[^}\]]*$/, '');

    // Remove markdown code blocks
    repaired = repaired.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

    // Extract just the JSON array/object
    const jsonStart = Math.min(
      repaired.indexOf('[') === -1 ? Infinity : repaired.indexOf('['),
      repaired.indexOf('{') === -1 ? Infinity : repaired.indexOf('{')
    );
    if (jsonStart !== Infinity && jsonStart > 0) {
      repaired = repaired.substring(jsonStart);
    }

    // Handle the specific issues from the user's example and new prompt requirements

    // 1. Fix field separation issues - when properties run into each other
    repaired = repaired.replace(/"([^"]*?)"\s*"([a-zA-Z_]+)"\s*:/g, '"$1", "$2":');

    // 2. Fix missing commas between objects in array
    repaired = repaired.replace(/}\s*{/g, '}, {');

    // 3. Fix file path extraction issues - ensure proper quoting
    repaired = repaired.replace(/"file"\s*:\s*([^",\[\{\}\]]+)(?=\s*[,}])/g, '"file": "$1"');

    // 4. Fix line number formatting - ensure they're strings
    repaired = repaired.replace(/"line"\s*:\s*(\d+)(?=\s*[,}])/g, '"line": "$1"');

    // 5. Fix severity values - ensure proper casing
    repaired = repaired.replace(/"severity"\s*:\s*"(critical|high|medium|low)"/gi, (match, severity) => {
      const properCase = severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase();
      return `"severity": "${properCase}"`;
    });

    // 6. Fix embedded quotes in code strings
    repaired = repaired.replace(/"(current|suggested)"\s*:\s*"([^"]*?)\\?"([^"]*?)"/g, '"$1": "$2\\"$3"');

    // 7. Fix broken string concatenations where fields run together
    repaired = repaired.replace(/"current"\s*:\s*"([^"]*?)"\s*([^",\[\{\]\}]+)\s*"suggested"/g, '"current": "$1 $2", "suggested"');

    // 8. Fix unquoted property names
    repaired = repaired.replace(/([{,]\s*)([a-zA-Z_]\w*)\s*:/g, '$1"$2":');

    // 9. Fix broken string values that need proper quoting
    repaired = repaired.replace(/:\s*([^",\[\{\]}\s][^",\[\{\]]*?)(?=\s*[,\]}])/g, (match, value) => {
      const trimmed = value.trim();
      // Don't quote numbers, booleans, null
      if (/^(true|false|null|\d+(\.\d+)?)$/i.test(trimmed)) {
        return `: ${trimmed}`;
      }
      // Quote everything else and escape internal quotes
      const escaped = trimmed.replace(/"/g, '\\"');
      return `: "${escaped}"`;
    });

    // 10. Clean up spacing and punctuation
    repaired = repaired.replace(/\s*,\s*/g, ', ');
    repaired = repaired.replace(/\s*:\s*/g, ': ');

    // 11. Remove trailing commas
    repaired = repaired.replace(/,(\s*[}\]])/g, '$1');

    // 12. Fix doubled commas and clean up empty properties
    repaired = repaired.replace(/,,+/g, ',');
    repaired = repaired.replace(/{\s*,/, '{');
    repaired = repaired.replace(/,\s*}/, '}');
    repaired = repaired.replace(/\[\s*,/, '[');
    repaired = repaired.replace(/,\s*\]/, ']');

    // 13. Fix smart quotes
    repaired = repaired.replace(/[""]/g, '"').replace(/['']/g, "'");

    // 14. Ensure the response starts and ends with array brackets
    if (!repaired.startsWith('[')) {
      repaired = '[' + repaired;
    }
    if (!repaired.endsWith(']')) {
      repaired = repaired + ']';
    }

    return repaired;
  }

  public static isCompleteJSON(jsonString: string): boolean {
    let trimmed = jsonString.trim();

    // Clean up markdown formatting first
    if (trimmed.startsWith('```json')) {
      trimmed = trimmed.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (trimmed.startsWith('```')) {
      trimmed = trimmed.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    if (!trimmed.startsWith('[') && !trimmed.startsWith('{')) return false;

    try {
      const openBrackets = (trimmed.match(/\[/g) || []).length;
      const closeBrackets = (trimmed.match(/\]/g) || []).length;
      const openBraces = (trimmed.match(/\{/g) || []).length;
      const closeBraces = (trimmed.match(/\}/g) || []).length;

      // Check if brackets are balanced and it ends properly
      if (openBrackets === closeBrackets && openBraces === closeBraces &&
          (trimmed.endsWith(']') || trimmed.endsWith('}'))) {

        // Try to parse it
        const parsed = JSON.parse(trimmed);

        // If it's an array, check if it has at least one complete item
        if (Array.isArray(parsed) && parsed.length > 0) {
          const firstItem = parsed[0];
          // Check if the first item has essential fields (new or old format)
          const hasNewFormat = firstItem.file && firstItem.current && firstItem.suggested;
          const hasOldFormat = (firstItem.severity || firstItem.category) &&
                              (firstItem.line || firstItem.line_number) &&
                              (firstItem.current_code || firstItem.code_snippet);
          return hasNewFormat || hasOldFormat;
        }

        return true;
      }
    } catch (e) {
      return false;
    }

    return false;
  }
}

// Global function for GitLab API integration (to be implemented)
declare global {
  interface Window {
    applyCodeSuggestion?: (index: number, line: string) => void;
  }
}
