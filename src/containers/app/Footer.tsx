import { AiBOT } from "../../utils/common";

const Footer = () => {
  return (
    <footer
      style={{
        padding: "1rem 0.5rem",
        textAlign: "center",
        flexShrink: 0,
      }}
      className="dom-bg-color"
    >
      <p
        style={{
          fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
          color: "#6b7280",
          margin: 0,
        }}
      >
        <strong style={{ color: "#374151" }}>
          {AiBOT.name} was made by {AiBOT.authorName}.
        </strong>{" "}
        <span style={{ color: "#9ca3af" }}>v{AiBOT?.version}</span>
      </p>
    </footer>
  );
};

export default Footer;
