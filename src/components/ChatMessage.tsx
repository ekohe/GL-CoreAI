import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  content: string;
  role: "user" | "assistant";
  isStreaming?: boolean;
}

/**
 * Chat message component with proper markdown rendering
 */
export const ChatMessage = ({ content, role, isStreaming }: ChatMessageProps) => {

  if (role === "user") {
    return (
      <div className="chat-message-container">
        <div className="chat-user-message">{content}</div>
      </div>
    );
  }

  return (
    <div className="chat-message-container">
      <div className="chat-assistant-message">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Custom code block rendering
            code({ node, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const isInline = !match && !className;

              if (isInline) {
                return (
                  <code className="chat-inline-code" {...props}>
                    {children}
                  </code>
                );
              }

              return (
                <pre className="chat-code-block">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              );
            },
            // Custom link rendering
            a({ node, children, href, ...props }) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chat-link"
                  {...props}
                >
                  {children}
                </a>
              );
            },
            // Custom paragraph rendering
            p({ node, children, ...props }) {
              return (
                <p className="chat-paragraph" {...props}>
                  {children}
                </p>
              );
            },
            // Custom heading rendering
            h1({ node, children, ...props }) {
              return <h1 className="chat-heading" {...props}>{children}</h1>;
            },
            h2({ node, children, ...props }) {
              return <h2 className="chat-heading" {...props}>{children}</h2>;
            },
            h3({ node, children, ...props }) {
              return <h3 className="chat-heading" {...props}>{children}</h3>;
            },
            h4({ node, children, ...props }) {
              return <h4 className="chat-heading" {...props}>{children}</h4>;
            },
            // Custom list rendering
            ul({ node, children, ...props }) {
              return <ul className="chat-list" {...props}>{children}</ul>;
            },
            ol({ node, children, ...props }) {
              return <ol className="chat-list chat-list-ordered" {...props}>{children}</ol>;
            },
            li({ node, children, ...props }) {
              return <li className="chat-list-item" {...props}>{children}</li>;
            },
            // Custom blockquote rendering
            blockquote({ node, children, ...props }) {
              return (
                <blockquote className="chat-blockquote" {...props}>
                  {children}
                </blockquote>
              );
            },
            // Custom table rendering
            table({ node, children, ...props }) {
              return (
                <div className="chat-table-wrapper">
                  <table className="chat-table" {...props}>
                    {children}
                  </table>
                </div>
              );
            },
            // Horizontal rule
            hr({ node, ...props }) {
              return <hr className="chat-hr" {...props} />;
            },
          }}
        >
          {content}
        </ReactMarkdown>
        {isStreaming && (
          <span className="chat-streaming-cursor">▌</span>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;

