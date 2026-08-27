import { useState } from "react";
import { deleteDocument } from "../firebase";
import { TableCard, Th, Td, TopBar, Badge, fmt, editBtn, delBtn } from "../components/UI";

export default function Groups({ t, groups, setModal, user }) {
  const [search, setSearch] = useState("");
  const filtered = groups.filter(g => g.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <TopBar search={search} setSearch={setSearch} t={t}
              onAdd={() => setModal({ type: "group", data: null })}
              canAdd={user?.role === "admin"} addLabel={t.addGroup} />
      <TableCard>
        <thead>
          <tr>{[t.groupName, t.amount, t.totalMembers, t.startDate, t.status, t.actions].map(h => <Th key={h}>{h}</Th>)}</tr>
        </thead>
        <tbody>
          {filtered.length === 0
            ? <tr><td colSpan={6} style={{ textAlign: "center", color: "#aaa", padding: 24 }}>{t.noData}</td></tr>
            : filtered.map(g => (
                <tr key={g.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <Td>{g.name}</Td>
                  <Td>Rs. {fmt(g.amount)}</Td>
                  <Td>{g.totalMembers}</Td>
                  <Td>{g.startDate}</Td>
                  <Td>
                    <Badge text={g.status === "active" ? t.active : t.completed}
                           color={g.status === "active" ? "#2e7d32" : "#888"} />
                  </Td>
                  <Td>
                    <button style={editBtn} onClick={() => setModal({ type: "group", data: g })}>{t.edit}</button>
                    {user?.role === "admin" && (
                      <button style={delBtn} onClick={() => { if(window.confirm("Delete?")) deleteDocument("groups", g.id); }}>
                        {t.del}
                      </button>
                    )}
                  </Td>
                </tr>
              ))
          }
        </tbody>
      </TableCard>
    </div>
  );
}
