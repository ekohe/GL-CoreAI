import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
  suggestedPrompts?: string[];
  placeholder?: string;
}

/**
 * Chat input component for issue follow-up conversations
 */
export const ChatInput = ({
  onSubmit,
  isLoading,
  suggestedPrompts = [],
  placeholder = "Ask a follow-up question...",
}: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = () => {
    if (message.trim() && !isLoading) {
      onSubmit(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    if (!isLoading) {
      onSubmit(prompt);
    }
  };

  return (
    <div
      style={{
        marginTop: "20px",
        background: "white",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        overflow: "hidden",
      }}
    >
      {/* Suggested Prompts */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #f1f5f9",
          background: "#fafbfc",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#64748b"
            strokeWidth="2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "500" }}>
            Quick prompts
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          {suggestedPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handleSuggestedPrompt(prompt)}
              disabled={isLoading}
              style={{
                background: isLoading ? "#e2e8f0" : "white",
                border: "1px solid #e2e8f0",
                borderRadius: "16px",
                padding: "6px 12px",
                fontSize: "0.75rem",
                color: isLoading ? "#94a3b8" : "#475569",
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                opacity: isLoading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = "#f1f5f9";
                  e.currentTarget.style.borderColor = "#11998e";
                  e.currentTarget.style.color = "#11998e";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.borderColor = "#e2e8f0";
                  e.currentTarget.style.color = "#475569";
                }
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "12px",
          padding: "12px 16px",
        }}
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
          style={{
            flex: 1,
            resize: "none",
            border: "none",
            outline: "none",
            fontSize: "0.9rem",
            lineHeight: "1.5",
            color: "#1e293b",
            background: "transparent",
            fontFamily: "inherit",
            minHeight: "24px",
            maxHeight: "120px",
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={!message.trim() || isLoading}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            border: "none",
            background:
              message.trim() && !isLoading
                ? "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
                : "#e2e8f0",
            cursor: message.trim() && !isLoading ? "pointer" : "not-allowed",
            transition: "all 0.2s ease",
            boxShadow:
              message.trim() && !isLoading
                ? "0 2px 8px rgba(17, 153, 142, 0.3)"
                : "none",
          }}
        >
          {isLoading ? (
            <div
              style={{
                width: "16px",
                height: "16px",
                border: "2px solid #94a3b8",
                borderTop: "2px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={message.trim() ? "white" : "#94a3b8"}
              strokeWidth="2"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </div>

      {/* Helper text */}
      <div
        style={{
          padding: "8px 16px 12px",
          borderTop: "1px solid #f1f5f9",
          background: "#fafbfc",
        }}
      >
        <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
          Press <kbd style={{ background: "#e2e8f0", padding: "2px 6px", borderRadius: "4px", fontFamily: "monospace" }}>Enter</kbd> to send, <kbd style={{ background: "#e2e8f0", padding: "2px 6px", borderRadius: "4px", fontFamily: "monospace" }}>Shift+Enter</kbd> for new line
        </span>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ChatInput;

