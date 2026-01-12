/**
 * Animated welcome screen displayed when user is not on a supported GitLab page
 * Features brand logo, description, and smooth animations
 */
import { useEffect, useState } from "react";
import brandLogo from "../../../assets/icons/logo-brand.png";

const NotOnGitLabPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [particlesReady, setParticlesReady] = useState(false);

  useEffect(() => {
    // Trigger entrance animations
    const timer1 = setTimeout(() => setIsVisible(true), 100);
    const timer2 = setTimeout(() => setParticlesReady(true), 600);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
        textAlign: "center",
        minHeight: "calc(100vh - 180px)",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(rgb(250 251 255 / 0%) 0%, rgb(225 233 254) 50%, rgb(255 255 255 / 0%) 100%)",
      }}
    >
      {/* Animated background particles */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
            50% { transform: translateY(-20px) rotate(180deg); opacity: 1; }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 1; }
          }
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes breathe {
            0%, 100% { box-shadow: 0 0 30px rgba(0, 255, 128, 0.2), 0 0 60px rgba(255, 0, 255, 0.1); }
            50% { box-shadow: 0 0 50px rgba(0, 255, 128, 0.3), 0 0 100px rgba(255, 0, 255, 0.2); }
          }
          @keyframes orbit {
            from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
            to { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
          }
          @keyframes gradientFlow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>

      {/* Floating particles */}
      {particlesReady && (
        <>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: `${8 + i * 4}px`,
                height: `${8 + i * 4}px`,
                borderRadius: "50%",
                background: `linear-gradient(135deg,
                  ${i % 3 === 0 ? "#ff00ff" : i % 3 === 1 ? "#00ff88" : "#ffff00"} 0%,
                  ${i % 3 === 0 ? "#ff0066" : i % 3 === 1 ? "#00ffff" : "#ff00ff"} 100%)`,
                top: `${15 + i * 12}%`,
                left: `${10 + (i * 15) % 80}%`,
                animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
                filter: "blur(1px)",
                opacity: 0.6,
              }}
            />
          ))}
        </>
      )}

      {/* Orbiting elements around logo */}
      <div
        style={{
          position: "relative",
          marginBottom: "32px",
        }}
      >
        {/* Orbit ring */}
        <div
          style={{
            position: "absolute",
            width: "240px",
            height: "240px",
            borderRadius: "50%",
            border: "1px dashed rgba(102, 126, 234, 0.2)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            opacity: isVisible ? 1 : 0,
            transition: "opacity 1s ease-out 0.5s",
          }}
        />

        {/* Orbiting dot 1 */}
        {particlesReady && (
          <div
            style={{
              position: "absolute",
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #ff00ff 0%, #ff0066 100%)",
              top: "50%",
              left: "50%",
              marginLeft: "-6px",
              marginTop: "-6px",
              animation: "orbit 8s linear infinite",
              boxShadow: "0 0 15px rgba(255, 0, 255, 0.5)",
            }}
          />
        )}

        {/* Orbiting dot 2 */}
        {particlesReady && (
          <div
            style={{
              position: "absolute",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #00ff88 0%, #00ffff 100%)",
              top: "50%",
              left: "50%",
              marginLeft: "-4px",
              marginTop: "-4px",
              animation: "orbit 12s linear infinite reverse",
              boxShadow: "0 0 12px rgba(0, 255, 136, 0.5)",
            }}
          />
        )}

        {/* Logo container with glow effect */}
        <div
          style={{
            width: "140px",
            height: "140px",
            borderRadius: "28px",
            background: "linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 20px 60px rgba(102, 126, 234, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.8)",
            position: "relative",
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "scale(1)" : "scale(0.8)",
            transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
            animation: particlesReady ? "breathe 4s ease-in-out infinite" : "none",
          }}
        >
          <img
            src={brandLogo}
            alt="GL CoreAI"
            style={{
              width: "100px",
              height: "auto",
              objectFit: "contain",
            }}
          />
        </div>
      </div>

      {/* App Name with gradient */}
      <h1
        style={{
          fontSize: "2rem",
          fontWeight: "800",
          margin: "0 0 8px 0",
          lineHeight: "1.2",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #ff0066 100%)",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: isVisible ? "gradientFlow 4s ease infinite" : "none",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s ease-out 0.2s",
        }}
      >
        GL CoreAI
      </h1>

      {/* Tagline */}
      <p
        style={{
          fontSize: "0.95rem",
          color: "#64748b",
          margin: "0 0 24px 0",
          lineHeight: "1.6",
          maxWidth: "320px",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s ease-out 0.3s",
        }}
      >
        AI-powered GitLab assistant that summarizes issues and MRs for quick understanding.
      </p>

      {/* Feature pills */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          justifyContent: "center",
          marginBottom: "28px",
          maxWidth: "340px",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s ease-out 0.4s",
        }}
      >
        {[
          { icon: "⚡", text: "Quick Summaries" },
          { icon: "🔍", text: "Code Reviews" },
          { icon: "💬", text: "AI Chat" },
        ].map((feature, i) => (
          <div
            key={i}
            style={{
              padding: "8px 16px",
              borderRadius: "20px",
              background: "white",
              border: "1px solid #e2e8f0",
              fontSize: "0.8rem",
              color: "#475569",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
          >
            <span>{feature.icon}</span>
            <span>{feature.text}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div
        style={{
          width: "60px",
          height: "3px",
          borderRadius: "2px",
          background: "linear-gradient(90deg, #00ff88, #ff00ff, #ffff00)",
          backgroundSize: "200% 100%",
          animation: isVisible ? "shimmer 3s linear infinite" : "none",
          marginBottom: "24px",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.6s ease-out 0.5s",
        }}
      />

      {/* Navigation hint */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "20px 24px",
          width: "100%",
          maxWidth: "320px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
          border: "1px solid #f1f5f9",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "translateY(0)" : "translateY(20px)",
          transition: "all 0.6s ease-out 0.6s",
        }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            fontWeight: "600",
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            margin: "0 0 16px 0",
          }}
        >
          Navigate to GitLab
        </p>

        {/* Issue Page */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "14px",
            background: "linear-gradient(135deg, #f0fff4 0%, #f0f9ff 100%)",
            borderRadius: "12px",
            marginBottom: "10px",
            border: "1px solid #e0f2fe",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(17, 153, 142, 0.3)",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontSize: "0.9rem",
                fontWeight: "600",
                color: "#1e293b",
                marginBottom: "2px",
              }}
            >
              Issues
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
              gitlab.com/.../issues/123
            </div>
          </div>
        </div>

        {/* Merge Request Page */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "14px",
            background: "linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%)",
            borderRadius: "12px",
            border: "1px solid #ede9fe",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18" cy="18" r="3" />
              <circle cx="6" cy="6" r="3" />
              <path d="M6 21V9a9 9 0 0 0 9 9" />
            </svg>
          </div>
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontSize: "0.9rem",
                fontWeight: "600",
                color: "#1e293b",
                marginBottom: "2px",
              }}
            >
              Merge Requests
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
              gitlab.com/.../-/merge_requests/456
            </div>
          </div>
        </div>
      </div>

      {/* GitLab compatibility note */}
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: "#94a3b8",
          fontSize: "0.75rem",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.6s ease-out 0.7s",
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.42.42 0 0 1 4.82 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.49h8.1l2.44-7.51A.42.42 0 0 1 18.6 2a.43.43 0 0 1 .58 0 .42.42 0 0 1 .11.18l2.44 7.51L23 13.45a.84.84 0 0 1-.35.94z" />
        </svg>
        <span>Works with any GitLab instance</span>
      </div>
    </div>
  );
};

export default NotOnGitLabPage;
