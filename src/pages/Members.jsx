import { useState } from "react";
import { deleteDocument } from "../firebase";
import { TableCard, Th, Td, TopBar, editBtn, delBtn } from "../components/UI";

export default function Members({ t, members, setModal, user }) {
  const [search, setSearch] = useState("");
  const filtered = members.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) || m.phone?.includes(search)
  );

  return (
    <div>
      <TopBar search={search} setSearch={setSearch} t={t}
              onAdd={() => setModal({ type: "member", data: null })} canAdd addLabel={t.addMember} />
      <TableCard>
        <thead>
          <tr>{[t.name, t.phone, t.nic, t.address, t.email, t.joinedDate, t.actions].map(h => <Th key={h}>{h}</Th>)}</tr>
        </thead>
        <tbody>
          {filtered.length === 0
            ? <tr><td colSpan={7} style={{ textAlign: "center", color: "#aaa", padding: 24 }}>{t.noData}</td></tr>
            : filtered.map(m => (
                <tr key={m.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <Td>{m.name}</Td>
                  <Td>{m.phone}</Td>
                  <Td>{m.nic}</Td>
                  <Td>{m.address}</Td>
                  <Td>{m.email}</Td>
                  <Td>{m.joined}</Td>
                  <Td>
                    <button style={editBtn} onClick={() => setModal({ type: "member", data: m })}>{t.edit}</button>
                    {user?.role === "admin" && (
                      <button style={delBtn} onClick={() => { if(window.confirm("Delete?")) deleteDocument("members", m.id); }}>
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
