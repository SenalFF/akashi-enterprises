import { useState, useRef } from "react";
import { addDocument, deleteDocument } from "../firebase";
import { fmt, today, Card, TableCard, Th, Td, Badge, Field, inputStyle, btnStyle, delBtn, editBtn } from "../components/UI";

let billCounter = 1000;
const nextBill = () => { billCounter++; return `AE-${billCounter}`; };

export default function Bills({ t, bills, groups }) {
  const [view,     setView]     = useState("list");
  const [billType, setBillType] = useState("");
  const [current,  setCurrent]  = useState(null);
  const [saving,   setSaving]   = useState(false);
  const printRef = useRef();

  const startNew = (type) => {
    const base = { billNo: nextBill(), date: today(), customerName: "", phone: "", address: "" };
    if (type === "item")    setCurrent({ ...base, type: "item",    items: [{ name: "", qty: 1, price: 0 }] });
    if (type === "seettu")  setCurrent({ ...base, type: "seettu",  groupName: "", round: 1, amount: 0 });
    if (type === "monthly") setCurrent({ ...base, type: "monthly", forMonth: "", amount: 0, notes: "" });
    setBillType(type);
    setView("form");
  };

  const saveBill = async (bill) => {
    setSaving(true);
    try {
      await addDocument("bills", bill);
      setCurrent(bill);
      setView("preview");
    } catch(e) { alert("Save error: " + e.message); }
    setSaving(false);
  };

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Bill #${current?.billNo}</title><style>
      *{box-sizing:border-box} body{font-family:'Segoe UI',sans-serif;margin:0;padding:20px;color:#000}
      .bill{max-width:580px;margin:auto;border:2px solid #1a237e;border-radius:8px;padding:24px}
      h1{color:#1a237e;margin:0;font-size:20px}
      table{width:100%;border-collapse:collapse;margin:12px 0;font-size:13px}
      th{background:#1a237e;color:#fff;padding:8px 10px;text-align:left}
      td{padding:7px 10px;border-bottom:1px solid #eee}
      .footer{text-align:center;margin-top:20px;font-size:12px;color:#888;border-top:1px dashed #ccc;padding-top:12px}
      @media print{body{padding:0}}
    </style></head><body>${content}</body></html>`);
    w.document.close();
    setTimeout(() => { w.focus(); w.print(); w.close(); }, 400);
  };

  if (view === "form")    return <BillForm    t={t} bill={current} billType={billType} groups={groups} onSave={saveBill} onBack={() => setView("list")} saving={saving} />;
  if (view === "preview") return <BillPreview t={t} bill={current} printRef={printRef} onPrint={handlePrint} onBack={() => setView("list")} onNew={() => setView("list")} />;

  return (
    <div>
      {/* Type selector */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { type: "item",    icon: "🛒", label: t.itemBill,    color: "#1565c0" },
          { type: "seettu",  icon: "🔄", label: t.seettuBill,  color: "#2e7d32" },
          { type: "monthly", icon: "📅", label: t.monthlyBill, color: "#e65100" },
        ].map(b => (
          <button key={b.type} onClick={() => startNew(b.type)} style={{
            padding: "24px 16px", borderRadius: 12, border: `2px solid ${b.color}`,
            background: "#fff", cursor: "pointer", textAlign: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>{b.icon}</div>
            <div style={{ fontWeight: 700, color: b.color, fontSize: 15 }}>{b.label}</div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>+ {t.createBill}</div>
          </button>
        ))}
      </div>

      {/* History */}
      <Card title={`📋 ${t.billHistory}`}>
        {bills.length === 0
          ? <p style={{ color: "#aaa", fontSize: 13, textAlign: "center", padding: "24px 0" }}>{t.noData}</p>
          : <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr>{[t.billNo, t.name, t.phone, t.date, t.billType, t.actions].map(h => <Th key={h}>{h}</Th>)}</tr></thead>
              <tbody>
                {[...bills].reverse().map(b => (
                  <tr key={b.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <Td>#{b.billNo}</Td>
                    <Td>{b.customerName}</Td>
                    <Td>{b.phone}</Td>
                    <Td>{b.date}</Td>
                    <Td>
                      <Badge
                        text={b.type === "item" ? t.itemBill : b.type === "seettu" ? t.seettuBill : t.monthlyBill}
                        color={b.type === "item" ? "#1565c0" : b.type === "seettu" ? "#2e7d32" : "#e65100"} />
                    </Td>
                    <Td>
                      <button style={editBtn} onClick={() => { setCurrent(b); setView("preview"); }}>{t.viewBill}</button>
                      <button style={delBtn}  onClick={() => { if(window.confirm("Delete?")) deleteDocument("bills", b.id); }}>{t.del}</button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
        }
      </Card>
    </div>
  );
}

// ── Bill Form ──────────────────────────────────────────────────────────────────
function BillForm({ t, bill, billType, groups, onSave, onBack, saving }) {
  const [form, setForm] = useState(bill);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setItem = (i, k, v) => setForm(f => { const items = [...f.items]; items[i] = { ...items[i], [k]: v }; return { ...f, items }; });
  const addItem = () => setForm(f => ({ ...f, items: [...f.items, { name: "", qty: 1, price: 0 }] }));
  const remItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  const subtotal = form.items?.reduce((s, it) => s + Number(it.qty) * Number(it.price), 0) || 0;
  const canSave  = form.customerName && form.phone && form.address;

  const typeColor = billType === "item" ? "#1565c0" : billType === "seettu" ? "#2e7d32" : "#e65100";
  const typeLabel = billType === "item" ? t.itemBill : billType === "seettu" ? t.seettuBill : t.monthlyBill;

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button style={{ ...btnStyle, background: "#888" }} onClick={onBack}>← {t.cancel}</button>
        <h3 style={{ margin: 0, color: typeColor }}>{typeLabel}</h3>
      </div>
      <div style={{ background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 4 }}>
          <Field label={t.billNo}><input style={inputStyle} value={form.billNo} onChange={e => set("billNo", e.target.value)} /></Field>
          <Field label={t.date}>  <input style={inputStyle} type="date" value={form.date} onChange={e => set("date", e.target.value)} /></Field>
          <Field label={t.name}>  <input style={inputStyle} value={form.customerName} onChange={e => set("customerName", e.target.value)} /></Field>
          <Field label={t.phone}> <input style={inputStyle} value={form.phone} onChange={e => set("phone", e.target.value)} /></Field>
        </div>
        <Field label={t.address}><input style={inputStyle} value={form.address} onChange={e => set("address", e.target.value)} /></Field>

        <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid #eee" }} />

        {/* Item bill */}
        {billType === "item" && (
          <div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 12 }}>
              <thead><tr>
                <Th>{t.itemName}</Th><Th style={{ width: 70 }}>{t.qty}</Th>
                <Th style={{ width: 110 }}>{t.price}</Th><Th style={{ width: 120 }}>{t.total}</Th>
                <Th style={{ width: 40 }}></Th>
              </tr></thead>
              <tbody>
                {form.items.map((it, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "6px 4px" }}><input style={{ ...inputStyle, padding: "6px 8px" }} value={it.name}  onChange={e => setItem(i, "name",  e.target.value)} /></td>
                    <td style={{ padding: "6px 4px" }}><input style={{ ...inputStyle, padding: "6px 8px" }} type="number" min="1" value={it.qty}   onChange={e => setItem(i, "qty",   e.target.value)} /></td>
                    <td style={{ padding: "6px 4px" }}><input style={{ ...inputStyle, padding: "6px 8px" }} type="number" min="0" value={it.price} onChange={e => setItem(i, "price", e.target.value)} /></td>
                    <td style={{ padding: "6px 10px", fontWeight: 700, color: "#1a237e" }}>Rs. {fmt(Number(it.qty) * Number(it.price))}</td>
                    <td style={{ padding: "6px 4px" }}>
                      {form.items.length > 1 && <button onClick={() => remItem(i)} style={{ ...btnStyle, background: "#e53935", padding: "4px 8px", fontSize: 12 }}>✕</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button style={{ ...btnStyle, background: "#2e7d32", marginBottom: 12 }} onClick={addItem}>+ {t.addItem}</button>
            <div style={{ textAlign: "right", fontSize: 16, fontWeight: 700, color: "#1a237e" }}>
              {t.grandTotal}: Rs. {fmt(subtotal)}
            </div>
          </div>
        )}

        {/* Seettu bill */}
        {billType === "seettu" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label={t.seettuGroup}>
              <select style={inputStyle} value={form.groupName} onChange={e => set("groupName", e.target.value)}>
                <option value="">-- {t.selectGroup} --</option>
                {groups.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
              </select>
            </Field>
            <Field label={t.seettuRound}> <input style={inputStyle} type="number" min="1" value={form.round}  onChange={e => set("round",  e.target.value)} /></Field>
            <Field label={t.seettuAmount}><input style={inputStyle} type="number" min="0" value={form.amount} onChange={e => set("amount", e.target.value)} /></Field>
          </div>
        )}

        {/* Monthly bill */}
        {billType === "monthly" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label={t.monthlyFor}>    <input style={inputStyle} type="month" value={form.forMonth} onChange={e => set("forMonth", e.target.value)} /></Field>
            <Field label={t.monthlyAmount}> <input style={inputStyle} type="number" min="0" value={form.amount} onChange={e => set("amount", e.target.value)} /></Field>
            <Field label={t.notes}>         <input style={inputStyle} value={form.notes || ""} onChange={e => set("notes", e.target.value)} /></Field>
          </div>
        )}

        <div style={{ marginTop: 24, textAlign: "right" }}>
          <button style={{ ...btnStyle, background: typeColor, opacity: (canSave && !saving) ? 1 : 0.5 }}
                  onClick={() => canSave && !saving && onSave(form)}>
            {saving ? t.saving : `${t.save} & ${t.printBill} →`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Bill Preview ───────────────────────────────────────────────────────────────
function BillPreview({ t, bill, printRef, onPrint, onBack, onNew }) {
  const subtotal  = bill.items?.reduce((s, it) => s + Number(it.qty) * Number(it.price), 0) || 0;
  const typeLabel = bill.type === "item" ? t.itemBill : bill.type === "seettu" ? t.seettuBill : t.monthlyBill;
  const typeColor = bill.type === "item" ? "#1565c0" : bill.type === "seettu" ? "#2e7d32" : "#e65100";

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <button style={{ ...btnStyle, background: "#888" }} onClick={onBack}>← {t.bills}</button>
        <button style={{ ...btnStyle, background: "#2e7d32" }} onClick={onPrint}>🖨️ {t.printBill}</button>
        <button style={btnStyle} onClick={onNew}>+ {t.newBill}</button>
      </div>

      <div ref={printRef}>
        <div style={{ border: `2px solid ${typeColor}`, borderRadius: 12, padding: 28, background: "#fff", boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <h1 style={{ margin: 0, color: "#1a237e", fontSize: 22, fontWeight: 800 }}>💼 {t.appName}</h1>
              <p  style={{ margin: "2px 0 0", color: "#888", fontSize: 12 }}>{t.tagline}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ background: typeColor, color: "#fff", borderRadius: 6, padding: "4px 14px", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{typeLabel}</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>#{bill.billNo}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{bill.date}</div>
            </div>
          </div>
          <hr style={{ border: "none", borderTop: `1px dashed ${typeColor}`, margin: "0 0 16px" }} />

          {/* Customer */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20, fontSize: 13 }}>
            <div><span style={{ color: "#888" }}>{t.name}:</span> <strong>{bill.customerName}</strong></div>
            <div><span style={{ color: "#888" }}>{t.phone}:</span> <strong>{bill.phone}</strong></div>
            <div style={{ gridColumn: "1/-1" }}><span style={{ color: "#888" }}>{t.address}:</span> <strong>{bill.address}</strong></div>
          </div>
          <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "0 0 16px" }} />

          {/* Item bill body */}
          {bill.type === "item" && <>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 12 }}>
              <thead><tr>{[t.itemName, t.qty, t.price, t.total].map(h => (
                <th key={h} style={{ background: typeColor, color: "#fff", padding: "8px 10px", textAlign: "left", fontSize: 12 }}>{h}</th>
              ))}</tr></thead>
              <tbody>{bill.items.map((it, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fafafa" : "#fff" }}>
                  <td style={{ padding: "8px 10px" }}>{it.name}</td>
                  <td style={{ padding: "8px 10px" }}>{it.qty}</td>
                  <td style={{ padding: "8px 10px" }}>Rs. {fmt(it.price)}</td>
                  <td style={{ padding: "8px 10px", fontWeight: 700 }}>Rs. {fmt(Number(it.qty) * Number(it.price))}</td>
                </tr>
              ))}</tbody>
            </table>
            <div style={{ textAlign: "right", fontSize: 16, fontWeight: 800, color: typeColor }}>{t.grandTotal}: Rs. {fmt(subtotal)}</div>
          </>}

          {/* Seettu bill body */}
          {bill.type === "seettu" && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <tbody>{[[t.seettuGroup, bill.groupName],[t.seettuRound, bill.round],[t.seettuAmount, `Rs. ${fmt(bill.amount)}`]].map(([l,v]) => (
                <tr key={l} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={{ padding: "10px", color: "#888", width: "40%" }}>{l}</td>
                  <td style={{ padding: "10px", fontWeight: 700, fontSize: 15 }}>{v}</td>
                </tr>
              ))}</tbody>
            </table>
          )}

          {/* Monthly bill body */}
          {bill.type === "monthly" && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <tbody>{[[t.monthlyFor, bill.forMonth],[t.monthlyAmount, `Rs. ${fmt(bill.amount)}`],...(bill.notes?[[t.notes,bill.notes]]:[])]
                .map(([l,v]) => (
                  <tr key={l} style={{ borderBottom: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "10px", color: "#888", width: "40%" }}>{l}</td>
                    <td style={{ padding: "10px", fontWeight: 700, fontSize: 15 }}>{v}</td>
                  </tr>
              ))}</tbody>
            </table>
          )}

          {/* Footer */}
          <div style={{ marginTop: 24, textAlign: "center", borderTop: "1px dashed #ddd", paddingTop: 14, fontSize: 12, color: "#888" }}>
            <p style={{ margin: 0, fontWeight: 700, color: typeColor }}>{t.thankyou}</p>
            <p style={{ margin: "4px 0 0" }}>{t.appName} · {t.receivedBy}: _______________</p>
          </div>
        </div>
      </div>
    </div>
  );
}
