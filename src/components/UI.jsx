export const fmt = (n) => Number(n || 0).toLocaleString("en-LK");
export const today = () => new Date().toISOString().split("T")[0];

export const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  border: "1px solid #ddd", fontSize: 14, boxSizing: "border-box", outline: "none",
};
export const btnStyle = {
  padding: "10px 20px", borderRadius: 8, border: "none",
  background: "#1a237e", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 700,
};
export const editBtn = { ...btnStyle, background: "#1565c0", padding: "5px 12px", marginRight: 6, fontSize: 12 };
export const delBtn  = { ...btnStyle, background: "#e53935", padding: "5px 12px", fontSize: 12 };

export function Card({ title, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      {title && <h4 style={{ margin: "0 0 12px", color: "#1a237e", fontSize: 14 }}>{title}</h4>}
      {children}
    </div>
  );
}

export function TableCard({ children }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>{children}</table>
    </div>
  );
}

export function Th({ children }) {
  return <th style={{ padding: "12px 16px", background: "#1a237e", color: "#fff", textAlign: "left", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{children}</th>;
}

export function Td({ children }) {
  return <td style={{ padding: "10px 16px", fontSize: 13, color: "#333" }}>{children}</td>;
}

export function Badge({ text, color }) {
  return <span style={{ background: color + "22", color, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{text}</span>;
}

export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "#555", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

export function TopBar({ search, setSearch, t, onAdd, canAdd, addLabel }) {
  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
      <input placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)}
             style={{ ...inputStyle, flex: 1, margin: 0 }} />
      {canAdd && (
        <button style={btnStyle} onClick={onAdd}>+ {addLabel || t.addMember}</button>
      )}
    </div>
  );
}

export function Spinner({ t }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, color: "#888" }}>
      <div style={{ fontSize: 32, marginRight: 12, animation: "spin 1s linear infinite" }}>⏳</div>
      <span>{t?.loading || "Loading..."}</span>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}
