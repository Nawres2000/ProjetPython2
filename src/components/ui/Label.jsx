export default function Label({ text }) {
  return (
    <div style={{
      fontSize: 12,
      color: "#888",
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      fontWeight: 600,
    }}>
      {text}
    </div>
  );
}