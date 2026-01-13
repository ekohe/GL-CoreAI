/**
 * Shared Renderer Utilities
 *
 * Common utilities used by both IssueActionsRenderer and MRActionsRenderer
 * for JSON repair, markdown formatting, and other shared functionality.
 */

// =============================================================================
// JSON REPAIR UTILITIES
// =============================================================================

/**
 * Escape control characters inside JSON string values
 * This handles unescaped newlines, tabs, and other control characters
 */
const escapeControlCharsInStrings = (jsonString: string): string => {
  const result: string[] = [];
  let inString = false;
  let i = 0;

  while (i < jsonString.length) {
    const char = jsonString[i];

    if (inString) {
      if (char === '\\' && i + 1 < jsonString.length) {
        // Already escaped - keep as-is
        result.push(char);
        result.push(jsonString[i + 1]);
        i += 2;
        continue;
      }
      if (char === '"') {
        // End of string
        result.push(char);
        inString = false;
        i++;
        continue;
      }
      // Check for control characters that need escaping
      const charCode = char.charCodeAt(0);
      if (charCode < 32) {
        // Control character - escape it
        if (char === '\n') {
          result.push('\\n');
        } else if (char === '\r') {
          result.push('\\r');
        } else if (char === '\t') {
          result.push('\\t');
        } else if (char === '\b') {
          result.push('\\b');
        } else if (char === '\f') {
          result.push('\\f');
        } else {
          // Other control chars - use unicode escape
          result.push('\\u' + charCode.toString(16).padStart(4, '0'));
        }
      } else {
        result.push(char);
      }
    } else {
      if (char === '"') {
        inString = true;
      }
      result.push(char);
    }
    i++;
  }

  return result.join('');
};

/**
 * Fix unquoted string values in JSON by scanning character by character
 */
const fixUnquotedValues = (jsonString: string): string => {
  const result: string[] = [];
  let i = 0;

  while (i < jsonString.length) {
    // Look for ": " pattern followed by an unquoted value
    if (i > 0 && jsonString[i] === ':') {
      result.push(jsonString[i]);
      i++;

      // Skip whitespace after colon
      while (i < jsonString.length && /\s/.test(jsonString[i])) {
        result.push(jsonString[i]);
        i++;
      }

      if (i >= jsonString.length) break;

      const char = jsonString[i];

      // Check if value is already properly formatted
      if (char === '"' || char === '{' || char === '[' || char === '-' || /\d/.test(char)) {
        // Already valid - continue normally
        continue;
      }

      // Check for boolean/null literals
      const remaining = jsonString.substring(i);
      if (remaining.startsWith('true') || remaining.startsWith('false') || remaining.startsWith('null')) {
        // Valid literal - continue normally
        continue;
      }

      // This is an unquoted string value - find where it ends
      if (/[A-Za-z]/.test(char)) {
        const valueStart = i;
        let valueEnd = i;
        let depth = 0;

        // Scan to find the end of the value
        while (i < jsonString.length) {
          const c = jsonString[i];

          if (c === '{' || c === '[') {
            depth++;
          } else if (c === '}' || c === ']') {
            if (depth === 0) {
              valueEnd = i;
              break;
            }
            depth--;
          } else if (c === ',' && depth === 0) {
            // Check if this is a value separator (followed by a key or closing bracket)
            let j = i + 1;
            while (j < jsonString.length && /\s/.test(jsonString[j])) j++;
            if (j < jsonString.length && (jsonString[j] === '"' || jsonString[j] === '}' || jsonString[j] === ']')) {
              valueEnd = i;
              break;
            }
          }

          i++;
        }

        if (valueEnd === valueStart) {
          valueEnd = i; // Take everything to the end
        }

        // Extract and quote the value
        const unquotedValue = jsonString.substring(valueStart, valueEnd).trim();
        const escapedValue = unquotedValue
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t');
        result.push('"' + escapedValue + '"');
        continue;
      }
    }

    result.push(jsonString[i]);
    i++;
  }

  return result.join('');
};

/**
 * Find if we're inside an unclosed string at the end of JSON
 * Returns the position where the unclosed string starts, or -1 if no unclosed string
 */
const findUnclosedStringPosition = (jsonString: string): number => {
  let inString = false;
  let stringStart = -1;
  let i = 0;

  while (i < jsonString.length) {
    const char = jsonString[i];

    if (inString) {
      if (char === '\\' && i + 1 < jsonString.length) {
        // Skip escaped character
        i += 2;
        continue;
      }
      if (char === '"') {
        inString = false;
        stringStart = -1;
      }
    } else {
      if (char === '"') {
        inString = true;
        stringStart = i;
      }
    }
    i++;
  }

  return inString ? stringStart : -1;
};

/**
 * Attempt to repair common JSON issues from AI responses
 * Handles: unquoted string values, trailing commas, incomplete JSON, truncated strings
 */
export const repairJSON = (jsonString: string): string => {
  let repaired = jsonString;

  // Remove markdown code fences if present
  if (repaired.startsWith("```json")) {
    repaired = repaired.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (repaired.startsWith("```")) {
    repaired = repaired.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  repaired = repaired.trim();

  // Try parsing first - if it works, return as-is
  try {
    JSON.parse(repaired);
    return repaired;
  } catch (initialError) {
    console.log("Initial JSON parse failed, attempting repair...", initialError);
  }

  // Escape control characters inside strings (unescaped newlines, tabs, etc.)
  repaired = escapeControlCharsInStrings(repaired);

  // Try parsing after control char escape
  try {
    JSON.parse(repaired);
    return repaired;
  } catch (e) {
    console.log("Still invalid after escaping control chars, continuing repair...");
  }

  // More robust fix for unquoted string values
  repaired = fixUnquotedValues(repaired);

  // Fix trailing commas before } or ]
  repaired = repaired.replace(/,(\s*[}\]])/g, "$1");

  // Fix single quotes to double quotes for keys and values
  repaired = repaired.replace(/'([^']+)'(\s*:)/g, '"$1"$2');
  repaired = repaired.replace(/:\s*'([^']*)'/g, ': "$1"');

  // Check for truncated/unclosed strings
  const unclosedStringPos = findUnclosedStringPosition(repaired);
  if (unclosedStringPos !== -1) {
    // We have an unclosed string - close it
    // First, remove any trailing incomplete escape sequences
    if (repaired.endsWith('\\')) {
      repaired = repaired.slice(0, -1);
    }
    // Add closing quote
    repaired += '"';
  }

  // Handle truncated JSON - try to close open brackets/braces
  // Count brackets/braces properly, excluding those inside strings
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  for (let i = 0; i < repaired.length; i++) {
    const char = repaired[i];
    if (inString) {
      if (char === '\\' && i + 1 < repaired.length) {
        i++; // Skip escaped character
        continue;
      }
      if (char === '"') {
        inString = false;
      }
    } else {
      if (char === '"') {
        inString = true;
      } else if (char === '{') {
        openBraces++;
      } else if (char === '}') {
        openBraces--;
      } else if (char === '[') {
        openBrackets++;
      } else if (char === ']') {
        openBrackets--;
      }
    }
  }

  // Remove trailing comma before adding closing brackets/braces
  repaired = repaired.replace(/,\s*$/, '');

  // Add missing closing brackets and braces
  for (let i = 0; i < openBrackets; i++) {
    repaired += "]";
  }
  for (let i = 0; i < openBraces; i++) {
    repaired += "}";
  }

  // Try to parse again after repairs
  try {
    JSON.parse(repaired);
    return repaired;
  } catch (error) {
    console.log("JSON still invalid after basic repair, trying aggressive repair...", error);
  }

  // Aggressive repair: try to truncate to last valid point
  // Find the last complete object or array item
  const lastValidPoints = [
    repaired.lastIndexOf('},'),
    repaired.lastIndexOf('}]'),
    repaired.lastIndexOf('"}'),
    repaired.lastIndexOf('"]'),
    repaired.lastIndexOf('",'),
  ].filter(p => p !== -1);

  if (lastValidPoints.length > 0) {
    const lastValid = Math.max(...lastValidPoints);
    let truncated = repaired.substring(0, lastValid + 1);

    // Recount and close
    openBraces = 0;
    openBrackets = 0;
    inString = false;
    for (let i = 0; i < truncated.length; i++) {
      const char = truncated[i];
      if (inString) {
        if (char === '\\' && i + 1 < truncated.length) {
          i++;
          continue;
        }
        if (char === '"') {
          inString = false;
        }
      } else {
        if (char === '"') {
          inString = true;
        } else if (char === '{') {
          openBraces++;
        } else if (char === '}') {
          openBraces--;
        } else if (char === '[') {
          openBrackets++;
        } else if (char === ']') {
          openBrackets--;
        }
      }
    }

    // Remove trailing comma
    truncated = truncated.replace(/,\s*$/, '');

    for (let i = 0; i < openBrackets; i++) {
      truncated += "]";
    }
    for (let i = 0; i < openBraces; i++) {
      truncated += "}";
    }

    try {
      JSON.parse(truncated);
      console.log("Aggressive repair succeeded by truncating to last valid point");
      return truncated;
    } catch (e) {
      console.log("Aggressive repair also failed", e);
    }
  }

  return repaired;
};

/**
 * Check if a JSON string is complete and valid
 */
export const isCompleteJSON = (jsonString: string): boolean => {
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
      // Try parsing with repair first
      const repaired = repairJSON(trimmed);
      JSON.parse(repaired);
      return true;
    }
  } catch (e) {
    return false;
  }

  return false;
};

// =============================================================================
// MARKDOWN FORMATTING UTILITIES
// =============================================================================

/**
 * Convert markdown bold (**text**) to HTML bold (<strong>text</strong>)
 * This handles names and other emphasized text from AI responses
 */
export const formatMarkdownBold = (text: string): string => {
  if (!text) return text;
  // Convert **text** to <strong>text</strong>
  return text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
};

/**
 * Convert markdown bold (**text**) to Slack bold (*text*)
 * Slack uses single asterisks for bold formatting
 */
export const formatMarkdownBoldForSlack = (text: string): string => {
  if (!text) return text;
  // Convert **text** to *text*
  return text.replace(/\*\*([^*]+)\*\*/g, '*$1*');
};
