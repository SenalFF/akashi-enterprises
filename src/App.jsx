import { useState, useEffect } from "react";
import { onAuth, loginUser, listenCollection, db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import T from "./lang/translations";
import Sidebar    from "./components/Sidebar";
import Modal      from "./components/Modal";
import { Spinner, inputStyle, btnStyle } from "./components/UI";
import Dashboard  from "./pages/Dashboard";
import Members    from "./pages/Members";
import Groups     from "./pages/Groups";
import Payments   from "./pages/Payments";
import Payouts    from "./pages/Payouts";
import Bills      from "./pages/Bills";

export default function App() {
  const [lang,       setLang]       = useState("en");
  const t = T[lang];

  // Auth
  const [authUser,   setAuthUser]   = useState(undefined); // undefined = checking
  const [userProfile,setUserProfile]= useState(null);
  const [loginForm,  setLoginForm]  = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loggingIn,  setLoggingIn]  = useState(false);

  // Data
  const [members,  setMembers]  = useState([]);
  const [groups,   setGroups]   = useState([]);
  const [payments, setPayments] = useState([]);
  const [payouts,  setPayouts]  = useState([]);
  const [bills,    setBills]    = useState([]);
  const [loading,  setLoading]  = useState(true);

  // UI
  const [page,     setPage]     = useState("dashboard");
  const [modal,    setModal]    = useState(null);

  // ── Watch auth state ─────────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuth(async (fbUser) => {
      setAuthUser(fbUser);
      if (fbUser) {
        // Load user profile from Firestore
        const snap = await getDoc(doc(db, "users", fbUser.uid));
        if (snap.exists()) {
          setUserProfile({ uid: fbUser.uid, email: fbUser.email, ...snap.data() });
        } else {
          // First time: create profile as admin
          const profile = { name: fbUser.email, role: "admin" };
          await setDoc(doc(db, "users", fbUser.uid), profile);
          setUserProfile({ uid: fbUser.uid, email: fbUser.email, ...profile });
        }
      } else {
        setUserProfile(null);
      }
    });
    return unsub;
  }, []);

  // ── Subscribe to Firestore collections when logged in ────────────────────────
  useEffect(() => {
    if (!authUser) { setLoading(false); return; }
    setLoading(true);
    const unsubs = [
      listenCollection("members",  setMembers),
      listenCollection("groups",   setGroups),
      listenCollection("payments", setPayments),
      listenCollection("payouts",  setPayouts),
      listenCollection("bills",    setBills),
    ];
    setLoading(false);
    return () => unsubs.forEach(u => u());
  }, [authUser]);

  // ── Login ────────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    setLoggingIn(true);
    setLoginError("");
    try {
      await loginUser(loginForm.email, loginForm.password);
    } catch (e) {
      setLoginError(t.wrongLogin);
    }
    setLoggingIn(false);
  };

  // ── Still checking auth ──────────────────────────────────────────────────────
  if (authUser === undefined) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f4f8" }}>
        <Spinner t={t} />
      </div>
    );
  }

  // ── Not logged in ────────────────────────────────────────────────────────────
  if (!authUser) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
                    background: "linear-gradient(135deg,#1a237e 0%,#283593 50%,#1565c0 100%)" }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 40, width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>💼</div>
            <h1 style={{ margin: 0, color: "#1a237e", fontSize: 22, fontWeight: 800 }}>{t.appName}</h1>
            <p  style={{ margin: "4px 0 0", color: "#666", fontSize: 13 }}>{t.tagline}</p>
            <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 8 }}>
              {["en", "si"].map(l => (
                <button key={l} onClick={() => setLang(l)} style={{
                  padding: "4px 14px", borderRadius: 20, border: "1px solid #1a237e",
                  background: lang === l ? "#1a237e" : "#fff",
                  color: lang === l ? "#fff" : "#1a237e",
                  cursor: "pointer", fontSize: 12, fontWeight: 600,
                }}>
                  {l === "en" ? "English" : "සිංහල"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#555", display: "block", marginBottom: 4 }}>{t.username}</label>
            <input type="email" placeholder="admin@akashi.com" value={loginForm.email}
                   onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
                   style={inputStyle} />
          </div>
          <div style={{ marginBottom: 4 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#555", display: "block", marginBottom: 4 }}>{t.password}</label>
            <input type="password" placeholder="••••••••" value={loginForm.password}
                   onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                   onKeyDown={e => e.key === "Enter" && handleLogin()}
                   style={inputStyle} />
          </div>
          {loginError && <p style={{ color: "#e53935", fontSize: 13, margin: "8px 0 0" }}>{loginError}</p>}
          <button onClick={handleLogin} disabled={loggingIn}
                  style={{ ...btnStyle, width: "100%", marginTop: 20, background: "#1a237e", opacity: loggingIn ? 0.7 : 1 }}>
            {loggingIn ? "..." : t.login}
          </button>
          <p style={{ textAlign: "center", color: "#aaa", fontSize: 11, marginTop: 16, lineHeight: 1.6 }}>
            {t.emailHint}
          </p>
        </div>
      </div>
    );
  }

  // ── Logged in ────────────────────────────────────────────────────────────────
  const user = userProfile;
  const pageIcons  = { dashboard:"📊", members:"👥", groups:"🔄", payments:"💰", payouts:"🏆", bills:"🧾", users:"🔐" };
  const pageLabels = { dashboard:t.dashboard, members:t.members, groups:t.groups,
                       payments:t.payments, payouts:t.payouts, bills:t.bills, users:t.adminPanel };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f8", fontFamily: "'Segoe UI',sans-serif" }}>
      <Sidebar page={page} setPage={setPage} t={t} user={user} lang={lang} setLang={setLang} />

      <div style={{ marginLeft: 220, padding: "24px", minHeight: "100vh" }}>
        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: 0, color: "#1a237e", fontSize: 24, fontWeight: 800 }}>
            {pageIcons[page]} {pageLabels[page]}
          </h2>
          <p style={{ margin: "4px 0 0", color: "#888", fontSize: 13 }}>
            {new Date().toLocaleDateString("en-LK", { weekday:"long", year:"numeric", month:"long", day:"numeric" })}
          </p>
        </div>

        {loading ? <Spinner t={t} /> : <>
          {page === "dashboard" && <Dashboard t={t} members={members} groups={groups} payments={payments} payouts={payouts} bills={bills} />}
          {page === "members"   && <Members   t={t} members={members} setModal={setModal} user={user} />}
          {page === "groups"    && <Groups    t={t} groups={groups}   setModal={setModal} user={user} />}
          {page === "payments"  && <Payments  t={t} payments={payments} members={members} groups={groups} setModal={setModal} />}
          {page === "payouts"   && <Payouts   t={t} payouts={payouts}   members={members} groups={groups} setModal={setModal} />}
          {page === "bills"     && <Bills     t={t} bills={bills} groups={groups} />}
        </>}
      </div>

      {modal && (
        <Modal modal={modal} setModal={setModal} t={t} members={members} groups={groups} />
      )}
    </div>
  );
}
