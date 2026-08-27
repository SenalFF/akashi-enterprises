import { useState } from "react";
import { addDocument, updateDocument } from "../firebase";
import { inputStyle, btnStyle, Field } from "./UI";
import { today } from "./UI";

export default function Modal({ modal, setModal, t, members, groups }) {
  const close = () => setModal(null);
  const [form, setForm] = useState(modal.data || {});
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const { id, createdAt, ...data } = form;

      if (modal.type === "member") {
        if (modal.data?.id) await updateDocument("members", modal.data.id, data);
        else await addDocument("members", { ...data, joined: today() });
      }
      if (modal.type === "group") {
        if (modal.data?.id) await updateDocument("groups", modal.data.id, data);
        else await addDocument("groups", { ...data, memberIds: [] });
      }
      if (modal.type === "payment") {
        await addDocument("payments", {
          ...data, status: "paid",
          amount: Number(data.amount),
          round: Number(data.round),
        });
      }
      if (modal.type === "payout") {
        await addDocument("payouts", {
          ...data, status: "paidOut",
          amount: Number(data.amount),
          round: Number(data.round),
        });
      }
      close();
    } catch (e) {
      alert("Error saving: " + e.message);
    }
    setSaving(false);
  };

  const titles = {
    member: t.addMember, group: t.addGroup,
    payment: t.recordPayment, payout: t.recordPayout,
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 32, width: 440,
        maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        <h3 style={{ margin: "0 0 20px", color: "#1a237e" }}>{titles[modal.type]}</h3>

        {modal.type === "member" && <>
          <Field label={t.name}>    <input style={inputStyle} value={form.name    || ""} onChange={e => set("name",    e.target.value)} /></Field>
          <Field label={t.phone}>   <input style={inputStyle} value={form.phone   || ""} onChange={e => set("phone",   e.target.value)} /></Field>
          <Field label={t.nic}>     <input style={inputStyle} value={form.nic     || ""} onChange={e => set("nic",     e.target.value)} /></Field>
          <Field label={t.email}>   <input style={inputStyle} value={form.email   || ""} onChange={e => set("email",   e.target.value)} /></Field>
          <Field label={t.address}> <input style={inputStyle} value={form.address || ""} onChange={e => set("address", e.target.value)} /></Field>
        </>}

        {modal.type === "group" && <>
          <Field label={t.groupName}>
            <input style={inputStyle} value={form.name || ""} onChange={e => set("name", e.target.value)} />
          </Field>
          <Field label={t.amount}>
            <input style={inputStyle} type="number" value={form.amount || ""} onChange={e => set("amount", e.target.value)} />
          </Field>
          <Field label={t.totalMembers}>
            <input style={inputStyle} type="number" value={form.totalMembers || ""} onChange={e => set("totalMembers", e.target.value)} />
          </Field>
          <Field label={t.startDate}>
            <input style={inputStyle} type="date" value={form.startDate || ""} onChange={e => set("startDate", e.target.value)} />
          </Field>
          <Field label={t.status}>
            <select style={inputStyle} value={form.status || "active"} onChange={e => set("status", e.target.value)}>
              <option value="active">{t.active}</option>
              <option value="completed">{t.completed}</option>
            </select>
          </Field>
        </>}

        {(modal.type === "payment" || modal.type === "payout") && <>
          <Field label={t.member}>
            <select style={inputStyle} value={form.memberId || ""} onChange={e => set("memberId", e.target.value)}>
              <option value="">-- {t.selectMember} --</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </Field>
          <Field label={t.group}>
            <select style={inputStyle} value={form.groupId || ""} onChange={e => set("groupId", e.target.value)}>
              <option value="">-- {t.selectGroup} --</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </Field>
          <Field label={t.round}>  <input style={inputStyle} type="number" value={form.round  || ""} onChange={e => set("round",  e.target.value)} /></Field>
          <Field label={t.amount}> <input style={inputStyle} type="number" value={form.amount || ""} onChange={e => set("amount", e.target.value)} /></Field>
          <Field label={t.date}>   <input style={inputStyle} type="date"   value={form.date   || ""} onChange={e => set("date",   e.target.value)} /></Field>
          <Field label={t.notes}>  <input style={inputStyle}               value={form.notes  || ""} onChange={e => set("notes",  e.target.value)} /></Field>
        </>}

        <div style={{ display: "flex", gap: 10, marginTop: 24, justifyContent: "flex-end" }}>
          <button style={{ ...btnStyle, background: "#888" }} onClick={close}>{t.cancel}</button>
          <button style={{ ...btnStyle, opacity: saving ? 0.6 : 1 }} onClick={handleSave} disabled={saving}>
            {saving ? t.saving : t.save}
          </button>
        </div>
      </div>
    </div>
  );
}
