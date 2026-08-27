import { fmt, Card, Badge } from "../components/UI";

export default function Dashboard({ t, members, groups, payments, payouts, bills }) {
  const thisMonth = new Date().getMonth();
  const collected = payments
    .filter(p => p.status === "paid" && p.date && new Date(p.date).getMonth() === thisMonth)
    .reduce((s, p) => s + Number(p.amount || 0), 0);
  const pendingCount = payouts.filter(p => p.status === "pending").length;

  const stats = [
    { label: t.totalGroups,        value: groups.length,          icon: "🔄", color: "#1565c0" },
    { label: t.totalMembers2,      value: members.length,         icon: "👥", color: "#2e7d32" },
    { label: t.thisMonthCollected, value: `Rs. ${fmt(collected)}`,icon: "💰", color: "#e65100" },
    { label: t.pendingPayouts,     value: pendingCount,           icon: "🏆", color: "#6a1b9a" },
  ];

  return (
    <div>
      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: "#fff", borderRadius: 12, padding: "20px 24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)", borderLeft: `4px solid ${s.color}`,
          }}>
            <div style={{ fontSize: 28 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color, marginTop: 8 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Recent payments */}
        <Card title={`📋 ${t.recentPayments}`}>
          {payments.length === 0
            ? <p style={{ color: "#aaa", fontSize: 13 }}>{t.noData}</p>
            : [...payments].slice(-6).reverse().map(p => {
                const m = members.find(x => x.id === p.memberId);
                const g = groups.find(x => x.id === p.groupId);
                return (
                  <div key={p.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0", fontSize: 13 }}>
                    <span>👤 {m?.name || "?"} · {g?.name || "?"}</span>
                    <span style={{ color: "#2e7d32", fontWeight: 600 }}>Rs. {fmt(p.amount)}</span>
                  </div>
                );
              })
          }
        </Card>

        {/* Recent bills */}
        <Card title={`🧾 ${t.billHistory}`}>
          {bills.length === 0
            ? <p style={{ color: "#aaa", fontSize: 13 }}>{t.noData}</p>
            : [...bills].slice(-6).reverse().map(b => (
                <div key={b.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #f0f0f0", fontSize: 13 }}>
                  <span>#{b.billNo} · {b.customerName}</span>
                  <Badge
                    text={b.type === "item" ? t.itemBill : b.type === "seettu" ? t.seettuBill : t.monthlyBill}
                    color={b.type === "item" ? "#1565c0" : b.type === "seettu" ? "#2e7d32" : "#e65100"} />
                </div>
              ))
          }
        </Card>
      </div>
    </div>
  );
}
