import { logoutUser } from "../firebase";

export default function Sidebar({ page, setPage, t, user, lang, setLang }) {
  const navItems = [
    { key: "dashboard", icon: "📊", label: t.dashboard },
    { key: "members",   icon: "👥", label: t.members   },
    { key: "groups",    icon: "🔄", label: t.groups    },
    { key: "payments",  icon: "💰", label: t.payments  },
    { key: "payouts",   icon: "🏆", label: t.payouts   },
    { key: "bills",     icon: "🧾", label: t.bills     },
    ...(user?.role === "admin" ? [{ key: "users", icon: "🔐", label: t.adminPanel }] : []),
  ];

  return (
    <div style={{
      position: "fixed", left: 0, top: 0, bottom: 0, width: 220,
      background: "#1a237e", color: "#fff", display: "flex",
      flexDirection: "column", zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: "24px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ fontSize: 28, marginBottom: 4 }}>💼</div>
        <div style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.3 }}>{t.appName}</div>
        <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{t.tagline}</div>
        <div style={{ marginTop: 8, display: "inline-block", background: "#43a047", borderRadius: 10,
                      padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>
          🔴 {t.synced}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "12px 0", overflowY: "auto" }}>
        {navItems.map(item => (
          <button key={item.key} onClick={() => setPage(item.key)} style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%",
            padding: "12px 20px",
            background: page === item.key ? "rgba(255,255,255,0.15)" : "transparent",
            border: "none", color: "#fff", cursor: "pointer", fontSize: 14, textAlign: "left",
            borderLeft: page === item.key ? "3px solid #64b5f6" : "3px solid transparent",
          }}>
            <span>{item.icon}</span><span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
          👤 {user?.name || user?.email}{" "}
          <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: "1px 6px", fontSize: 10 }}>
            {user?.role}
          </span>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
          {["en", "si"].map(l => (
            <button key={l} onClick={() => setLang(l)} style={{
              flex: 1, padding: "3px 0", borderRadius: 10, border: "none",
              background: lang === l ? "#64b5f6" : "rgba(255,255,255,0.1)",
              color: "#fff", cursor: "pointer", fontSize: 11,
            }}>
              {l === "en" ? "EN" : "SI"}
            </button>
          ))}
        </div>
        <button onClick={logoutUser} style={{
          padding: "8px 0", borderRadius: 8, border: "none",
          background: "rgba(255,255,255,0.15)", color: "#fff",
          cursor: "pointer", fontSize: 13, width: "100%", fontWeight: 700,
        }}>
          {t.logout}
        </button>
      </div>
    </div>
  );
}
