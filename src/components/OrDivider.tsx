const OrDivider = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        margin: "1.25rem 0",
        width: "100%",
      }}
    >
      <div
        style={{
          flex: 1,
          height: "1px",
          background: "linear-gradient(to right, transparent, #d1d5db, #d1d5db)",
        }}
      />
      <span
        style={{
          margin: "0 1rem",
          fontSize: "0.8rem",
          color: "#9ca3af",
          fontWeight: "500",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Or
      </span>
      <div
        style={{
          flex: 1,
          height: "1px",
          background: "linear-gradient(to left, transparent, #d1d5db, #d1d5db)",
        }}
      />
    </div>
  );
};

export default OrDivider;
