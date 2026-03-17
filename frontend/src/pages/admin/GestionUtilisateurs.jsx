import { useState, useEffect } from 'react';
import axios from "../../api/axios";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const ROLE_CONFIG = {
  admin:    { color: "#991b1b", bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.2)"   },
  vendeur:  { color: "#0f1e35", bg: "rgba(15,30,53,0.08)",    border: "rgba(15,30,53,0.2)"    },
  acheteur: { color: "#065f46", bg: "rgba(5,150,105,0.08)",   border: "rgba(5,150,105,0.25)"  },
};

function RoleBadge({ libelle }) {
  const c = ROLE_CONFIG[libelle] || { color: "#9ca3af", bg: "rgba(156,163,175,0.1)", border: "rgba(156,163,175,0.2)" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 12px", borderRadius: 99, fontSize: 10, fontWeight: 700, fontFamily: "'DM Sans',sans-serif", letterSpacing: "0.8px", color: c.color, background: c.bg, border: `1px solid ${c.border}`, textTransform: "capitalize" }}>
      {libelle || "—"}
    </span>
  );
}

function Avatar({ nom, prenom, size = 34 }) {
  const txt = `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase();
  const role = ""; // could be passed as prop
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: "#0f1e35", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#c8a96e", fontFamily: "'DM Sans',sans-serif", fontWeight: 700, fontSize: size * 0.35, border: "1px solid rgba(200,169,110,0.3)" }}>
      {txt}
    </div>
  );
}

const emptyForm = { nom: '', prenom: '', email: '', mot_de_passe: '', telephone: '', id_role: '' };

export default function GestionUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [roles, setRoles]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [editUser, setEditUser]         = useState(null);
  const [form, setForm]                 = useState(emptyForm);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');
  const [search, setSearch]             = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = () => {
    Promise.all([
      axios.get('http://localhost:8000/api/utilisateur'),
      axios.get('http://localhost:8000/api/roles'),
    ]).then(([usersRes, rolesRes]) => {
      setUtilisateurs(usersRes.data);
      setRoles(rolesRes.data);
    }).finally(() => setLoading(false));
  };

  const openAdd = () => { setEditUser(null); setForm(emptyForm); setError(''); setShowModal(true); };
  const openEdit = (user) => {
    setEditUser(user);
    setForm({ nom: user.nom, prenom: user.prenom, email: user.email, mot_de_passe: '', telephone: user.telephone || '', id_role: user.id_role });
    setError(''); setShowModal(true);
  };

  const showMsg = (msg, isErr = false) => {
    isErr ? setError(msg) : setSuccess(msg);
    setTimeout(() => { setSuccess(''); setError(''); }, 3000);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    axios.delete(`http://localhost:8000/api/utilisateur/${id}`)
      .then(() => { showMsg('Utilisateur supprimé !'); fetchData(); });
  };

  const handleSubmit = () => {
    setError('');
    const url    = editUser ? `http://localhost:8000/api/utilisateur/${editUser.id_user}` : 'http://localhost:8000/api/utilisateur';
    const method = editUser ? 'put' : 'post';
    axios[method](url, form)
      .then(() => { showMsg(editUser ? 'Utilisateur modifié !' : 'Utilisateur ajouté !'); setShowModal(false); fetchData(); })
      .catch(err => {
        const errors = err.response?.data?.errors;
        setError(errors ? Object.values(errors).flat().join(' | ') : 'Une erreur est survenue.');
      });
  };

  const filtered = utilisateurs.filter(u => {
    const q = search.toLowerCase();
    return (
      u.nom.toLowerCase().includes(q) || u.prenom.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) || (u.telephone || '').toLowerCase().includes(q) ||
      (u.role?.libelle || '').toLowerCase().includes(q)
    );
  });

  const inp = (field, placeholder, type = "text") => ({
    type, placeholder, value: form[field],
    onChange: e => setForm({ ...form, [field]: e.target.value }),
    style: {
      width: "100%", padding: "11px 16px", borderRadius: 12,
      border: "1px solid rgba(200,169,110,0.25)", fontSize: 13,
      color: "#0f1e35", background: "#fdfcfa", fontFamily: "'DM Sans',sans-serif",
      boxSizing: "border-box", outline: "none", transition: "border-color .2s",
    },
    onFocus: e => e.target.style.borderColor = "#c8a96e",
    onBlur:  e => e.target.style.borderColor = "rgba(200,169,110,0.25)",
  });

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');`}</style>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", border: "1px solid rgba(200,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
        </div>
        <p style={{ fontFamily: "'DM Sans',sans-serif", color: "#9ca3af", fontSize: 13, margin: 0, fontWeight: 600 }}>Chargement des utilisateurs...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8f7f4", fontFamily: "'Cormorant Garamond',serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pop    { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .rh:hover { background: #faf8f4 !important; }
        .rh { transition: background .12s; }
        input:focus, select:focus { border-color: #c8a96e !important; outline: none; }
      `}</style>

      {/* ── HERO ── */}
      <div style={{ position: "relative", height: 200, overflow: "hidden", borderRadius: "0 0 40px 40px" }}>
        <img
          src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1600&q=90"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(8,16,34,0.95) 0%, rgba(8,16,34,0.6) 55%, rgba(8,16,34,0.15) 100%)" }} />
        <div style={{ position: "absolute", left: 72, top: "15%", bottom: "15%", width: 1, background: "linear-gradient(to bottom, transparent, #c8a96e, transparent)" }} />
        <div style={{ position: "relative", zIndex: 2, height: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 110px" }}>
          <div>
            <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "4px", color: "#c8a96e", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
              Administration
            </span>
            <h1 style={{ color: "white", fontSize: 36, fontWeight: 700, lineHeight: 1.1, margin: "0 0 8px" }}>
              Gestion des Utilisateurs
            </h1>
            <p style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.5)", fontSize: 13, margin: 0 }}>
              Gérez les comptes, rôles et accès de la plateforme
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={fetchData}
              style={{ padding: "12px 20px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(200,169,110,0.3)", color: "rgba(255,255,255,0.7)", borderRadius: 14, fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all .2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#c8a96e"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(200,169,110,0.3)"}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
              Actualiser
            </button>
            <button
              onClick={openAdd}
              style={{ padding: "12px 22px", background: "#c8a96e", border: "none", color: "#0f1e35", borderRadius: 14, fontFamily: "'DM Sans',sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "1px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all .2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#d4ba82"}
              onMouseLeave={e => e.currentTarget.style.background = "#c8a96e"}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Ajouter
            </button>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 70, background: "linear-gradient(to top, #f8f7f4, transparent)" }} />
      </div>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "36px 60px 80px" }} className="fade-up">

        {/* ── Notifications ── */}
        {success && (
          <div style={{ background: "white", border: "1px solid rgba(5,150,105,0.2)", borderLeft: "3px solid #065f46", borderRadius: 14, padding: "14px 20px", marginBottom: 20, color: "#065f46", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            {success}
          </div>
        )}
        {error && !showModal && (
          <div style={{ background: "white", border: "1px solid rgba(239,68,68,0.2)", borderLeft: "3px solid #ef4444", borderRadius: 14, padding: "14px 20px", marginBottom: 20, color: "#991b1b", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {/* ── Stats ── */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${roles.length + 1}, 1fr)`, gap: 14, marginBottom: 20 }}>
          {roles.map(role => {
            const count = utilisateurs.filter(u => u.id_role === role.id_role).length;
            const c = ROLE_CONFIG[role.libelle] || { color: "#9ca3af", bg: "#f8f7f4", border: "rgba(156,163,175,0.2)" };
            return (
              <div key={role.id_role} style={{ background: "white", padding: "20px 22px", borderRadius: 20, border: "1px solid rgba(200,169,110,0.12)", borderTop: `3px solid ${c.color}`, boxShadow: "0 2px 16px rgba(10,20,40,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af" }}>{role.libelle}s</span>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f8f7f4", border: "1px solid rgba(200,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 34, fontWeight: 700, color: c.color, lineHeight: 1 }}>{count}</div>
              </div>
            );
          })}
          <div style={{ background: "white", padding: "20px 22px", borderRadius: 20, border: "1px solid rgba(200,169,110,0.12)", borderTop: "3px solid #c8a96e", boxShadow: "0 2px 16px rgba(10,20,40,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af" }}>Total</span>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f8f7f4", border: "1px solid rgba(200,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 34, fontWeight: 700, color: "#c8a96e", lineHeight: 1 }}>{utilisateurs.length}</div>
          </div>
        </div>

        {/* ── Table ── */}
        <div style={{ background: "white", borderRadius: 24, overflow: "hidden", border: "1px solid rgba(200,169,110,0.12)", boxShadow: "0 2px 16px rgba(10,20,40,0.05)" }}>

          {/* Search */}
          <div style={{ padding: "20px 28px", borderBottom: "1px solid rgba(200,169,110,0.08)" }}>
            <div style={{ position: "relative" }}>
              <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#c8a96e" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                placeholder="Rechercher par nom, prénom, email, téléphone, rôle..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: "100%", padding: "11px 14px 11px 38px", border: "1px solid rgba(200,169,110,0.25)", borderRadius: 12, fontSize: 13, color: "#0f1e35", background: "#fdfcfa", fontFamily: "'DM Sans',sans-serif", transition: "all .2s" }}
              />
            </div>
          </div>

          {/* Header */}
          <div style={{ background: "#0f1e35", padding: "13px 28px", display: "grid", gridTemplateColumns: "55px 200px 200px 140px 120px 120px 140px" }}>
            {["#", "Utilisateur", "Email", "Téléphone", "Inscription", "Rôle", "Actions"].map(h => (
              <div key={h} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "rgba(200,169,110,0.7)" }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", border: "1px solid rgba(200,169,110,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </div>
              <p style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: "#0f1e35", margin: "0 0 4px" }}>Aucun utilisateur trouvé</p>
              <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#9ca3af", margin: 0 }}>Modifiez votre recherche ou ajoutez un nouvel utilisateur</p>
            </div>
          ) : (
            filtered.map((user, i) => (
              <div key={user.id_user} className="rh" style={{ display: "grid", gridTemplateColumns: "55px 200px 200px 140px 120px 120px 140px", padding: "13px 28px", alignItems: "center", borderBottom: i < filtered.length - 1 ? "1px solid rgba(200,169,110,0.07)" : "none" }}>

                {/* # */}
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#c4bfb8", fontWeight: 700 }}>
                  #{String(user.id_user).padStart(4, "0")}
                </div>

                {/* Utilisateur */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar nom={user.nom} prenom={user.prenom} />
                  <div>
                    <p style={{ fontFamily: "'Cormorant Garamond',serif", margin: 0, fontSize: 14, fontWeight: 700, color: "#0f1e35" }}>{user.prenom} {user.nom}</p>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <a href={`mailto:${user.email}`} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#c8a96e", textDecoration: "none", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                    {user.email}
                  </a>
                </div>

                {/* Téléphone */}
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#6b7280" }}>
                  {user.telephone || <span style={{ color: "#c4bfb8" }}>—</span>}
                </div>

                {/* Date inscription */}
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 11, color: "#6b7280" }}>
                  {fmtDate(user.date_inscription)}
                </div>

                {/* Rôle */}
                <div><RoleBadge libelle={user.role?.libelle} /></div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 7 }}>
                  <button
                    onClick={() => openEdit(user)}
                    style={{ padding: "6px 12px", borderRadius: 99, background: "rgba(200,169,110,0.1)", border: "1px solid rgba(200,169,110,0.3)", color: "#c8a96e", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 4, transition: "all .2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#0f1e35"; e.currentTarget.style.borderColor = "#c8a96e"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(200,169,110,0.1)"; e.currentTarget.style.borderColor = "rgba(200,169,110,0.3)"; }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(user.id_user)}
                    style={{ padding: "6px 12px", borderRadius: 99, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#991b1b", fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, cursor: "pointer", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: 4, transition: "all .2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#991b1b"; e.currentTarget.style.color = "white"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(239,68,68,0.07)"; e.currentTarget.style.color = "#991b1b"; }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                    Supprimer
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

        <p style={{ fontFamily: "'DM Sans',sans-serif", textAlign: "right", marginTop: 10, fontSize: 11, color: "#9ca3af" }}>
          {filtered.length} utilisateur{filtered.length !== 1 ? "s" : ""}{filtered.length !== utilisateurs.length ? ` sur ${utilisateurs.length}` : ""}
        </p>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: "#070f1e", padding: "24px 80px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: "white", letterSpacing: "2px" }}>ImmoExpert</span>
        <span style={{ fontFamily: "'DM Sans',sans-serif", color: "rgba(255,255,255,0.2)", fontSize: 11 }}>© 2026 — Administration</span>
      </div>

      {/* ── MODAL ── */}
      {showModal && (
        <div onClick={() => setShowModal(false)} style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(8,16,34,0.78)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 28, width: "100%", maxWidth: 480, boxShadow: "0 40px 100px rgba(10,20,40,0.4)", overflow: "hidden", animation: "pop .22s cubic-bezier(.34,1.3,.64,1)" }}>

            {/* Modal Header */}
            <div style={{ background: "#0f1e35", padding: "26px 30px", position: "relative" }}>
              <div style={{ position: "absolute", left: 30, top: "15%", bottom: "15%", width: 1, background: "linear-gradient(to bottom, transparent, #c8a96e, transparent)" }} />
              <div style={{ paddingLeft: 20 }}>
                <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "3px", color: "#c8a96e", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  {editUser ? "Modification" : "Création"}
                </span>
                <h2 style={{ fontFamily: "'Cormorant Garamond',serif", margin: 0, fontSize: 22, fontWeight: 700, color: "white" }}>
                  {editUser ? `${editUser.prenom} ${editUser.nom}` : "Nouvel utilisateur"}
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.1)", border: "none", borderRadius: "50%", color: "white", width: 32, height: 32, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>

            <div style={{ padding: "24px 28px" }}>
              {error && (
                <div style={{ background: "#fef2f2", border: "1px solid rgba(239,68,68,0.2)", borderLeft: "3px solid #ef4444", borderRadius: 12, padding: "12px 16px", marginBottom: 18, color: "#991b1b", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 600 }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af", marginBottom: 6 }}>Prénom</label>
                    <input {...inp("prenom", "Prénom")} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: "block", fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af", marginBottom: 6 }}>Nom</label>
                    <input {...inp("nom", "Nom")} />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af", marginBottom: 6 }}>Email</label>
                  <input {...inp("email", "Email", "email")} />
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af", marginBottom: 6 }}>
                    {editUser ? "Nouveau mot de passe (laisser vide)" : "Mot de passe"}
                  </label>
                  <input {...inp("mot_de_passe", editUser ? "Laisser vide pour ne pas modifier" : "Mot de passe", "password")} />
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af", marginBottom: 6 }}>Téléphone</label>
                  <input {...inp("telephone", "Téléphone")} />
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: "'DM Sans',sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af", marginBottom: 6 }}>Rôle</label>
                  <select
                    value={form.id_role}
                    onChange={e => setForm({ ...form, id_role: e.target.value })}
                    style={{ width: "100%", padding: "11px 16px", borderRadius: 12, border: "1px solid rgba(200,169,110,0.25)", fontSize: 13, color: "#0f1e35", background: "#fdfcfa", fontFamily: "'DM Sans',sans-serif", boxSizing: "border-box", outline: "none", cursor: "pointer" }}
                  >
                    <option value="">— Choisir un rôle —</option>
                    {roles.map(role => (
                      <option key={role.id_role} value={role.id_role}>{role.libelle}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 24 }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ padding: "11px 24px", borderRadius: 12, border: "1px solid rgba(200,169,110,0.25)", background: "white", color: "#9ca3af", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.5px", transition: "all .2s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "#c8a96e"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(200,169,110,0.25)"}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  style={{ padding: "11px 32px", borderRadius: 12, border: "none", background: "#0f1e35", color: "#c8a96e", fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "1px", textTransform: "uppercase", boxShadow: "0 4px 20px rgba(15,30,53,0.3)", display: "flex", alignItems: "center", gap: 8, transition: "all .2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#1a2d4d"}
                  onMouseLeave={e => e.currentTarget.style.background = "#0f1e35"}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {editUser ? "Enregistrer" : "Créer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}