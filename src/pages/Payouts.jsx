import { useState } from "react";
import { deleteDocument } from "../firebase";
import { TableCard, Th, Td, TopBar, Badge, fmt, delBtn } from "../components/UI";

export default function Payouts({ t, payouts, members, groups, setModal }) {
  const [search, setSearch] = useState("");
  const filtered = payouts.filter(p => {
    const m = members.find(x => x.id === p.memberId);
    return m?.name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <TopBar search={search} setSearch={setSearch} t={t}
              onAdd={() => setModal({ type: "payout", data: null })} canAdd addLabel={t.recordPayout} />
      <TableCard>
        <thead>
          <tr>{[t.member, t.group, t.round, t.amount, t.date, t.status, t.notes, t.actions].map(h => <Th key={h}>{h}</Th>)}</tr>
        </thead>
        <tbody>
          {filtered.length === 0
            ? <tr><td colSpan={8} style={{ textAlign: "center", color: "#aaa", padding: 24 }}>{t.noData}</td></tr>
            : filtered.map(p => {
                const m = members.find(x => x.id === p.memberId);
                const g = groups.find(x => x.id === p.groupId);
                return (
                  <tr key={p.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <Td>{m?.name || p.memberId}</Td>
                    <Td>{g?.name || p.groupId}</Td>
                    <Td>{p.round}</Td>
                    <Td>Rs. {fmt(p.amount)}</Td>
                    <Td>{p.date}</Td>
                    <Td><Badge text={p.status === "paidOut" ? t.paidOut : t.pending} color={p.status === "paidOut" ? "#1565c0" : "#e65100"} /></Td>
                    <Td>{p.notes || "—"}</Td>
                    <Td>
                      <button style={delBtn} onClick={() => { if(window.confirm("Delete?")) deleteDocument("payouts", p.id); }}>
                        {t.del}
                      </button>
                    </Td>
                  </tr>
                );
              })
          }
        </tbody>
      </TableCard>
    </div>
  );
}
