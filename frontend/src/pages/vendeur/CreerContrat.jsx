import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../../api/axios";

// ── jsPDF (chargé dynamiquement depuis CDN) ───────────────────────────────────
const loadJsPDF = () =>
  new Promise((resolve) => {
    if (window.jspdf) return resolve(window.jspdf.jsPDF);
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = () => resolve(window.jspdf.jsPDF);
    document.head.appendChild(s);
  });

const fmt = (n) =>
  new Intl.NumberFormat("fr-MA", {
    style: "currency", currency: "MAD", maximumFractionDigits: 0,
  }).format(n || 0);

const STEPS = [
  { num: 1, label: "Bien",      icon: "🏠" },
  { num: 2, label: "Parties",   icon: "👥" },
  { num: 3, label: "Contrat",   icon: "📋" },
  { num: 4, label: "Résumé",    icon: "✅" },
  { num: 5, label: "Signature", icon: "✍️" },
];

function StepBar({ current }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 40 }}>
      {STEPS.map((s, i) => {
        const done = s.num < current, active = s.num === current;
        return (
          <div key={s.num} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 42, height: 42, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 15, transition: "all .2s",
                background: done ? "#4F46E5" : active ? "#fff" : "#F1F5F9",
                color: done ? "#fff" : active ? "#4F46E5" : "#CBD5E1",
                border: done || active ? "2.5px solid #4F46E5" : "2px solid #E2E8F0",
                boxShadow: active ? "0 0 0 5px rgba(79,70,229,.15)" : "none",
              }}>
                {done ? "✓" : s.icon}
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, whiteSpace: "nowrap", color: active ? "#4F46E5" : done ? "#64748B" : "#CBD5E1" }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 2.5, margin: "0 8px", marginBottom: 22, background: done ? "#4F46E5" : "#E2E8F0", borderRadius: 2, transition: "background .3s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Avatar({ nom, prenom, size = 38 }) {
  const txt = `${prenom?.[0] ?? ""}${nom?.[0] ?? ""}`.toUpperCase();
  const palette = ["#4F46E5","#0891B2","#059669","#D97706","#7C3AED","#DC2626"];
  const c = palette[((nom?.charCodeAt(0) || 0) + (prenom?.charCodeAt(0) || 0)) % palette.length];
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: c, flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontWeight: 800, fontSize: size * .35 }}>
      {txt}
    </div>
  );
}

function SignatureCanvas({ onSigned, onClear, signed }) {
  const canvasRef = useRef(null);
  const drawing   = useRef(false);
  const lastPos   = useRef(null);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const startDraw = (e) => { e.preventDefault(); drawing.current = true; lastPos.current = getPos(e, canvasRef.current); };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext("2d");
    const pos    = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1E3A5F"; ctx.lineWidth = 2.5;
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = (e) => {
    e.preventDefault();
    if (!drawing.current) return;
    drawing.current = false;
    onSigned(canvasRef.current.toDataURL("image/png"));
  };

  const handleClear = () => {
    canvasRef.current.getContext("2d").clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    onClear();
  };

  return (
    <div>
      <div style={{ border: `2px dashed ${signed ? "#4F46E5" : "#CBD5E1"}`, borderRadius: 16, overflow: "hidden", background: "#F8FAFF", position: "relative", transition: "border-color .2s" }}>
        {!signed && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 28, opacity: .3 }}>✍️</span>
            <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600 }}>Signez ici avec votre souris ou doigt</span>
          </div>
        )}
        <canvas ref={canvasRef} width={480} height={160}
          style={{ display: "block", width: "100%", height: 160, cursor: "crosshair", touchAction: "none" }}
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <button onClick={handleClear} style={{ background: "none", border: "1.5px solid #E2E8F0", borderRadius: 9, padding: "7px 16px", color: "#64748B", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>🗑️ Effacer</button>
        {signed && <span style={{ fontSize: 12, color: "#059669", fontWeight: 700 }}>✅ Signature capturée</span>}
      </div>
    </div>
  );
}

function BienCard({ bien, selected, onSelect }) {
  const img = bien.images?.[0]?.url_image;
  return (
    <div onClick={() => onSelect(bien)} style={{
      borderRadius: 16, overflow: "hidden", cursor: "pointer", background: "#fff",
      border: `2px solid ${selected ? "#4F46E5" : "#E2E8F0"}`,
      boxShadow: selected ? "0 0 0 4px rgba(79,70,229,.13)" : "0 2px 8px rgba(15,23,42,.05)",
      transform: selected ? "translateY(-2px)" : "none", transition: "all .18s",
    }}>
      <div style={{ height: 130, background: "#F1F5F9", position: "relative", overflow: "hidden" }}>
        {img
          ? <img src={`http://127.0.0.1:8000/storage/${img}`} alt={bien.titre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 40, color: "#CBD5E1" }}>🏠</div>
        }
        <span style={{ position: "absolute", top: 8, left: 8, background: bien.type_bien === "vente" ? "#4F46E5" : "#059669", color: "#fff", borderRadius: 8, padding: "2px 10px", fontSize: 10, fontWeight: 800 }}>
          {bien.type_bien === "vente" ? "VENTE" : "LOCATION"}
        </span>
        {selected && (
          <div style={{ position: "absolute", top: 8, right: 8, background: "#4F46E5", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 12 }}>✓</div>
        )}
      </div>
      <div style={{ padding: "10px 13px 13px" }}>
        <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bien.titre}</p>
        <p style={{ margin: "0 0 5px", fontSize: 11, color: "#64748B" }}>{bien.surface}m² · {bien.nb_pieces} pièces</p>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#4F46E5" }}>{fmt(bien.prix)}</p>
      </div>
    </div>
  );
}

function UserCard({ user, selected, onSelect }) {
  const palette = ["#4F46E5","#0891B2","#059669","#D97706","#7C3AED","#DC2626"];
  const c = palette[((user.nom?.charCodeAt(0) || 0) + (user.prenom?.charCodeAt(0) || 0)) % palette.length];
  return (
    <div onClick={() => onSelect(user)} style={{
      borderRadius: 13, padding: "13px 15px", cursor: "pointer", display: "flex", alignItems: "center", gap: 11,
      border: `2px solid ${selected ? c : "#E2E8F0"}`, background: selected ? `${c}09` : "#fff",
      boxShadow: selected ? `0 0 0 3px ${c}20` : "none", transition: "all .15s",
    }}>
      <Avatar nom={user.nom} prenom={user.prenom} size={38} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ margin: "0 0 1px", fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{user.prenom} {user.nom}</p>
        <p style={{ margin: 0, fontSize: 11, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
        {user.telephone && <p style={{ margin: "1px 0 0", fontSize: 11, color: "#CBD5E1" }}>{user.telephone}</p>}
      </div>
      {selected && <span style={{ color: c, fontWeight: 800, fontSize: 20, flexShrink: 0 }}>✓</span>}
    </div>
  );
}

const inp = (err) => ({
  width: "100%", padding: "11px 14px", borderRadius: 11,
  border: `1.5px solid ${err ? "#FECACA" : "#E2E8F0"}`,
  fontSize: 13, color: "#0F172A", background: err ? "#FEF2F2" : "#F8FAFF",
  boxSizing: "border-box", fontFamily: "inherit", outline: "none",
});

// ── Génération PDF avec jsPDF ─────────────────────────────────────────────────
async function generateContratPDF({ contrat, bien, vendeur, acheteur, montant, dateContrat, signatureData }) {
  const JsPDF = await loadJsPDF();
  const doc   = new JsPDF({ unit: "mm", format: "a4" });

  const W = 210, mar = 20;
  let y = mar;

  const line = (x1, y1, x2, y2, color = "#E2E8F0") => {
    doc.setDrawColor(color);
    doc.line(x1, y1, x2, y2);
  };

  // ── En-tête ──────────────────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20); doc.setFont("helvetica", "bold");
  doc.text("CONTRAT IMMOBILIER", mar, 18);
  doc.setFontSize(10); doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text(`N° ${String(contrat?.id_contrat || "").padStart(5, "0")}  ·  ${bien?.titre || ""}`, mar, 28);
  doc.text(`Plateforme Gestion Immobilière`, W - mar, 18, { align: "right" });
  doc.text(`Généré le ${new Date().toLocaleDateString("fr-FR")}`, W - mar, 28, { align: "right" });
  y = 52;

  // ── Statut badge ──────────────────────────────────────────────────────────
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(mar, y - 6, 60, 12, 3, 3, "F");
  doc.setTextColor(5, 150, 105);
  doc.setFontSize(9); doc.setFont("helvetica", "bold");
  doc.text("✓  CONTRAT ENREGISTRÉ", mar + 4, y + 2);
  y += 16;

  // ── Séparateur ────────────────────────────────────────────────────────────
  line(mar, y, W - mar, y);
  y += 8;

  // ── Section : Bien Immobilier ─────────────────────────────────────────────
  doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(79, 70, 229);
  doc.text("🏠  BIEN IMMOBILIER", mar, y); y += 7;

  doc.setFillColor(248, 250, 255);
  doc.roundedRect(mar, y, W - mar * 2, 28, 4, 4, "F");
  doc.setTextColor(15, 23, 42); doc.setFontSize(13); doc.setFont("helvetica", "bold");
  doc.text(bien?.titre || "—", mar + 4, y + 8);
  doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 116, 139);
  doc.text(`Surface : ${bien?.surface || "—"} m²   ·   Pièces : ${bien?.nb_pieces || "—"}   ·   Type : ${bien?.type_bien === "vente" ? "Vente" : "Location"}`, mar + 4, y + 16);
  doc.text(`Adresse : ${bien?.adresse || "Non précisée"}`, mar + 4, y + 22);
  y += 36;

  // ── Section : Parties ─────────────────────────────────────────────────────
  doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(79, 70, 229);
  doc.text("👥  PARTIES DU CONTRAT", mar, y); y += 7;

  const colW = (W - mar * 2 - 8) / 2;

  // Vendeur box
  doc.setFillColor(248, 250, 255);
  doc.roundedRect(mar, y, colW, 30, 4, 4, "F");
  doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139);
  doc.text("VENDEUR / PROPRIÉTAIRE", mar + 4, y + 6);
  doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
  doc.text(`${vendeur?.prenom || ""} ${vendeur?.nom || ""}`, mar + 4, y + 14);
  doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 116, 139);
  doc.text(vendeur?.email || "—", mar + 4, y + 20);
  doc.text(vendeur?.telephone || "", mar + 4, y + 26);

  // Acheteur box
  const col2x = mar + colW + 8;
  doc.setFillColor(248, 250, 255);
  doc.roundedRect(col2x, y, colW, 30, 4, 4, "F");
  doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139);
  doc.text("ACHETEUR / LOCATAIRE", col2x + 4, y + 6);
  doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(15, 23, 42);
  doc.text(`${acheteur?.prenom || ""} ${acheteur?.nom || ""}`, col2x + 4, y + 14);
  doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 116, 139);
  doc.text(acheteur?.email || "—", col2x + 4, y + 20);
  doc.text(acheteur?.telephone || "", col2x + 4, y + 26);
  y += 38;

  // ── Section : Détails financiers ──────────────────────────────────────────
  doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(79, 70, 229);
  doc.text("💰  DÉTAILS FINANCIERS", mar, y); y += 7;

  doc.setFillColor(240, 253, 244);
  doc.roundedRect(mar, y, W - mar * 2, 20, 4, 4, "F");
  doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 116, 139);
  doc.text("Montant total :", mar + 4, y + 8);
  doc.setFontSize(16); doc.setFont("helvetica", "bold"); doc.setTextColor(5, 78, 59);
  doc.text(fmt(montant), mar + 36, y + 14);
  doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 116, 139);
  doc.text(`Date du contrat : ${new Date(dateContrat).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}`, W - mar - 4, y + 8, { align: "right" });
  y += 28;

  // ── Section : Clauses ─────────────────────────────────────────────────────
  doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(79, 70, 229);
  doc.text("📋  CONDITIONS GÉNÉRALES", mar, y); y += 7;

  doc.setFontSize(8.5); doc.setFont("helvetica", "normal"); doc.setTextColor(71, 85, 105);
  const clauses = [
    "1. Le vendeur garantit être le seul propriétaire du bien et avoir le droit de le vendre ou louer.",
    "2. L'acheteur/locataire reconnaît avoir visité le bien et l'accepter en l'état.",
    "3. Le paiement du montant convenu sera effectué selon les modalités agréées entre les parties.",
    "4. Tout litige sera soumis à la juridiction compétente du ressort du lieu du bien.",
    "5. Le présent contrat est régi par la législation marocaine en vigueur.",
  ];
  clauses.forEach((cl) => {
    const lines = doc.splitTextToSize(cl, W - mar * 2 - 4);
    doc.text(lines, mar + 2, y);
    y += lines.length * 5 + 2;
  });
  y += 4;

  // ── Section : Signatures ──────────────────────────────────────────────────
  line(mar, y, W - mar, y);
  y += 8;
  doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(79, 70, 229);
  doc.text("✍️  SIGNATURES", mar, y); y += 8;

  // Vendeur signature
  doc.setFillColor(248, 250, 255);
  doc.roundedRect(mar, y, colW, 38, 4, 4, "F");
  doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139);
  doc.text("Signature du vendeur", mar + 4, y + 6);
  if (signatureData) {
    try { doc.addImage(signatureData, "PNG", mar + 4, y + 9, colW - 8, 22); } catch {}
  }
  doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(5, 150, 105);
  doc.text("✓ Signé électroniquement", mar + 4, y + 33);

  // Acheteur signature
  doc.setFillColor(255, 251, 235);
  doc.roundedRect(col2x, y, colW, 38, 4, 4, "F");
  doc.setFontSize(8); doc.setFont("helvetica", "bold"); doc.setTextColor(100, 116, 139);
  doc.text("Signature de l'acheteur", col2x + 4, y + 6);
  doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(217, 119, 6);
  doc.text("⏳ En attente de signature", col2x + 4, y + 22);
  y += 46;

  // ── Pied de page ──────────────────────────────────────────────────────────
  doc.setFillColor(241, 245, 249);
  doc.rect(0, 282, W, 15, "F");
  doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(148, 163, 184);
  doc.text("Ce document a été généré automatiquement par la Plateforme de Gestion Immobilière.", mar, 290);
  doc.text(`Page 1/1  ·  Contrat N° ${String(contrat?.id_contrat || "").padStart(5, "0")}`, W - mar, 290, { align: "right" });

  return doc;
}

export default function CreerContrat() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [step, setStep]       = useState(1);
  const [biens, setBiens]     = useState([]);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState("");

  const [bienSel, setBienSel]         = useState(null);
  const [vendeurSel, setVendeurSel]   = useState(null);
  const [acheteurSel, setAcheteurSel] = useState(null);

  const [montant, setMontant]         = useState("");
  const [dateContrat, setDateContrat] = useState(new Date().toISOString().slice(0, 10));
  const [pdfFile, setPdfFile]         = useState(null);

  const [sBien, setSBien] = useState("");
  const [sV, setSV]       = useState("");
  const [sA, setSA]       = useState("");

  const [submitting, setSubmitting]       = useState(false);
  const [signing, setSigning]             = useState(false);
  const [errors, setErrors]               = useState({});
  const [success, setSuccess]             = useState(null);
  const [signatureData, setSignatureData] = useState(null);
  const [signErr, setSignErr]             = useState("");
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get("/contrats/form-data")
      .then(({ data }) => {
        setBiens(Array.isArray(data?.biens) ? data.biens : []);
        setUsers(Array.isArray(data?.utilisateurs) ? data.utilisateurs
               : Array.isArray(data?.users) ? data.users : []);
        if (location.state?.bien) {
          const b = location.state.bien;
          setBienSel(b);
          setMontant(String(b.prix || ""));
          if (b.vendeur) setVendeurSel(b.vendeur);
        }
        if (location.state?.acheteur) setAcheteurSel(location.state.acheteur);
        if (location.state?.bien && location.state?.acheteur) setStep(3);
      })
      .catch(() => setLoadErr("Impossible de charger les données depuis l'API."))
      .finally(() => setLoading(false));
  }, []);

  const pickBien = (b) => {
    setBienSel(b);
    setMontant(String(b.prix || ""));
    if (b.vendeur) setVendeurSel(b.vendeur);
  };

  const canNext = () => {
    if (step === 1) return !!bienSel;
    if (step === 2) return !!vendeurSel && !!acheteurSel && vendeurSel.id_user !== acheteurSel.id_user;
    if (step === 3) return !!montant && parseFloat(montant) > 0 && !!dateContrat;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true); setErrors({});
    try {
      const fd = new FormData();
      fd.append("id_bien",      bienSel.id_bien);
      fd.append("id_vendeur",   vendeurSel.id_user);
      fd.append("id_acheteur",  acheteurSel.id_user);
      fd.append("montant",      montant);
      fd.append("date_contrat", dateContrat);
      fd.append("statut",       "en_attente");
      if (pdfFile) fd.append("fichier_pdf", pdfFile);

      const { data } = await axios.post("/contrats", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(data);
      setStep(5);
    } catch (err) {
      const e = err.response?.data?.errors || {};
      if (err.response?.data?.message) e.global = err.response.data.message;
      setErrors(e);
    } finally { setSubmitting(false); }
  };

  const handleSign = async () => {
    if (!signatureData) { setSignErr("Veuillez signer avant de continuer."); return; }
    setSigning(true); setSignErr("");
    try {
      await axios.put(`/contrats/${success.id_contrat}/signer`, {
        role:      "vendeur",
        signature: signatureData,
      });
      setStep(6);
    } catch {
      setSignErr("Erreur lors de l'enregistrement de la signature.");
    } finally { setSigning(false); }
  };

  const handleDownloadPDF = async () => {
    setPdfGenerating(true);
    try {
      const doc = await generateContratPDF({
        contrat:       success,
        bien:          bienSel,
        vendeur:       vendeurSel,
        acheteur:      acheteurSel,
        montant,
        dateContrat,
        signatureData,
      });
      doc.save(`contrat-${String(success?.id_contrat || "").padStart(5, "0")}.pdf`);
    } catch (e) {
      console.error("PDF error:", e);
    } finally { setPdfGenerating(false); }
  };

  const reset = () => {
    setStep(1); setBienSel(null); setVendeurSel(null);
    setAcheteurSel(null); setMontant(""); setPdfFile(null);
    setSuccess(null); setErrors({}); setSignatureData(null); setSignErr("");
  };

  const fBiens = (biens ?? []).filter((b) => b?.titre?.toLowerCase().includes(sBien.toLowerCase()));
  const fVend  = (users ?? []).filter((u) =>
    `${u?.nom ?? ""} ${u?.prenom ?? ""} ${u?.email ?? ""}`.toLowerCase().includes(sV.toLowerCase()));
  const fAchet = (users ?? []).filter((u) =>
    `${u?.nom ?? ""} ${u?.prenom ?? ""} ${u?.email ?? ""}`.toLowerCase().includes(sA.toLowerCase()) &&
    (!vendeurSel || u.id_user !== vendeurSel.id_user));

  const SearchBox = ({ val, set, ph }) => (
    <div style={{ position: "relative", marginBottom: 14 }}>
      <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>🔍</span>
      <input value={val} onChange={(e) => set(e.target.value)} placeholder={ph}
        style={{ ...inp(false), paddingLeft: 34 }} />
    </div>
  );

  const BtnNext = ({ label = "Suivant →", onClick = () => setStep(s => s + 1), disabled = !canNext(), color = "#4F46E5" }) => (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "12px 28px", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 14,
      background: disabled ? "#E2E8F0" : `linear-gradient(135deg, ${color}, #0891B2)`,
      color: disabled ? "#94A3B8" : "#fff",
      cursor: disabled ? "not-allowed" : "pointer",
      boxShadow: disabled ? "none" : `0 4px 18px ${color}44`,
    }}>{label}</button>
  );

  const BtnPrev = () => (
    <button onClick={() => setStep(s => s - 1)} style={{
      padding: "12px 22px", borderRadius: 12, border: "1.5px solid #E2E8F0",
      background: "transparent", color: "#64748B", fontWeight: 700, fontSize: 14, cursor: "pointer",
    }}>← Précédent</button>
  );

  const NavRow = ({ showPrev = true, nextLabel, nextClick, nextDisabled, nextColor }) => (
    <div style={{ display: "flex", justifyContent: showPrev ? "space-between" : "flex-end",
      marginTop: 28, paddingTop: 22, borderTop: "1px solid #F1F5F9" }}>
      {showPrev && <BtnPrev />}
      <BtnNext label={nextLabel} onClick={nextClick} disabled={nextDisabled} color={nextColor} />
    </div>
  );

  // ── Ligne de résumé ───────────────────────────────────────────────────────
  const ResumeRow = ({ icon, label, value, highlight }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
      borderBottom: "1px solid #F1F5F9" }}>
      <span style={{ fontSize: 18, width: 28, textAlign: "center" }}>{icon}</span>
      <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, width: 110, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: highlight ? 16 : 13, fontWeight: highlight ? 800 : 600,
        color: highlight ? "#059669" : "#0F172A", flex: 1 }}>{value}</span>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(145deg,#F0F4FF,#E8F4FD)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes up  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pop { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:scale(1)} }
        input:focus,select:focus { border-color:#4F46E5 !important; box-shadow:0 0 0 3px rgba(79,70,229,.12) !important; outline:none; }
        ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:4px; }
      `}</style>

      <div style={{ maxWidth: 980, margin: "0 auto", padding: "40px 24px" }}>

        <div style={{ marginBottom: 32, animation: "up .3s ease" }}>
          <button onClick={() => navigate("/vendeur/contrats")} style={{
            background: "none", border: "none", color: "#64748B", cursor: "pointer",
            fontSize: 13, fontWeight: 600, padding: 0, marginBottom: 12 }}>
            ← Retour aux contrats
          </button>
          <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 800, color: "#4F46E5", letterSpacing: ".14em" }}>NOUVEAU</p>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, color: "#0F172A", letterSpacing: "-.02em" }}>Créer un contrat</h1>
        </div>

        {loadErr && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 14,
            padding: "16px 20px", color: "#DC2626", marginBottom: 24, fontWeight: 600 }}>
            ⚠️ {loadErr}
          </div>
        )}

        <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 8px 40px rgba(15,23,42,.12)", padding: "40px 44px", animation: "pop .3s ease" }}>

          {step <= 5 && <StepBar current={step} />}

          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#94A3B8" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
              <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>Chargement…</p>
            </div>

          ) : step === 1 ? (
            /* ── ÉTAPE 1 : Bien ── */
            <div style={{ animation: "up .25s ease" }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 19, fontWeight: 800, color: "#0F172A" }}>Choisir le bien immobilier</h2>
              <p style={{ margin: "0 0 20px", fontSize: 13, color: "#64748B" }}>Sélectionnez le bien concerné par ce contrat.</p>
              <SearchBox val={sBien} set={setSBien} ph="Rechercher par titre…" />
              {fBiens.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8" }}>
                  <div style={{ fontSize: 36 }}>🏚️</div><p style={{ margin: "8px 0 0" }}>Aucun bien disponible</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 14, maxHeight: 420, overflowY: "auto" }}>
                  {fBiens.map((b) => <BienCard key={b.id_bien} bien={b} selected={bienSel?.id_bien === b.id_bien} onSelect={pickBien} />)}
                </div>
              )}
              <NavRow showPrev={false} />
            </div>

          ) : step === 2 ? (
            /* ── ÉTAPE 2 : Parties ── */
            <div style={{ animation: "up .25s ease" }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 19, fontWeight: 800, color: "#0F172A" }}>Parties du contrat</h2>
              <p style={{ margin: "0 0 22px", fontSize: 13, color: "#64748B" }}>Sélectionnez le vendeur et l'acheteur.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
                <div>
                  <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 800, color: "#4F46E5", letterSpacing: ".07em" }}>👤 VENDEUR</p>
                  <SearchBox val={sV} set={setSV} ph="Rechercher un vendeur…" />
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 360, overflowY: "auto" }}>
                    {fVend.map((u) => <UserCard key={u.id_user} user={u} selected={vendeurSel?.id_user === u.id_user} onSelect={setVendeurSel} />)}
                  </div>
                </div>
                <div>
                  <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 800, color: "#059669", letterSpacing: ".07em" }}>🤝 ACHETEUR</p>
                  <SearchBox val={sA} set={setSA} ph="Rechercher un acheteur…" />
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 360, overflowY: "auto" }}>
                    {fAchet.map((u) => <UserCard key={u.id_user} user={u} selected={acheteurSel?.id_user === u.id_user} onSelect={setAcheteurSel} />)}
                  </div>
                </div>
              </div>
              {vendeurSel && acheteurSel && vendeurSel.id_user === acheteurSel.id_user && (
                <div style={{ marginTop: 14, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", color: "#DC2626", fontSize: 13, fontWeight: 600 }}>
                  ⚠️ Le vendeur et l'acheteur ne peuvent pas être la même personne.
                </div>
              )}
              <NavRow />
            </div>

          ) : step === 3 ? (
            /* ── ÉTAPE 3 : Infos contrat ── */
            <div style={{ animation: "up .25s ease" }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 19, fontWeight: 800, color: "#0F172A" }}>Informations du contrat</h2>
              <p style={{ margin: "0 0 22px", fontSize: 13, color: "#64748B" }}>Renseignez le montant et la date.</p>

              {/* Mini récap bien + parties */}
              <div style={{ background: "#F8FAFF", borderRadius: 14, padding: "14px 18px", marginBottom: 26, border: "1px solid #E2E8F0", display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 58, height: 58, borderRadius: 12, overflow: "hidden", background: "#E2E8F0", flexShrink: 0 }}>
                  {bienSel?.images?.[0]?.url_image
                    ? <img src={`http://127.0.0.1:8000/storage/${bienSel.images[0].url_image}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: 24 }}>🏠</div>
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 2px", fontSize: 15, fontWeight: 800, color: "#0F172A" }}>{bienSel?.titre}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#64748B" }}>{bienSel?.surface}m² · {bienSel?.nb_pieces} pièces</p>
                </div>
                <div style={{ borderLeft: "1px solid #E2E8F0", paddingLeft: 16, display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <Avatar nom={vendeurSel?.nom} prenom={vendeurSel?.prenom} size={24} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#1E293B" }}>{vendeurSel?.prenom} {vendeurSel?.nom}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <Avatar nom={acheteurSel?.nom} prenom={acheteurSel?.prenom} size={24} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#1E293B" }}>{acheteurSel?.prenom} {acheteurSel?.nom}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 7 }}>💰 Montant (MAD) *</label>
                  <input type="number" min="1" value={montant} onChange={(e) => setMontant(e.target.value)}
                    placeholder="Ex: 850000" style={inp(errors.montant)} />
                  {errors.montant && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#DC2626" }}>{errors.montant[0]}</p>}
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 7 }}>📅 Date du contrat *</label>
                  <input type="date" value={dateContrat} onChange={(e) => setDateContrat(e.target.value)} style={inp(errors.date_contrat)} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 7 }}>📄 Fichier PDF (optionnel)</label>
                  <input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files[0])}
                    style={{ ...inp(false), padding: "9px 14px", cursor: "pointer" }} />
                  {pdfFile && <p style={{ margin: "4px 0 0", fontSize: 11, color: "#059669", fontWeight: 600 }}>✓ {pdfFile.name}</p>}
                </div>
              </div>

              {errors.global && (
                <div style={{ marginTop: 18, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 16px", color: "#DC2626", fontWeight: 600 }}>
                  ⚠️ {errors.global}
                </div>
              )}
              <NavRow nextLabel="Voir le résumé →" nextClick={() => setStep(4)} />
            </div>

          ) : step === 4 ? (
            /* ── ÉTAPE 4 : RÉSUMÉ SIMPLIFIÉ ── */
            <div style={{ animation: "up .25s ease" }}>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#4F46E5,#0891B2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 12px" }}>✅</div>
                <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: "#0F172A" }}>Résumé du contrat</h2>
                <p style={{ margin: 0, fontSize: 13, color: "#64748B" }}>Vérifiez les informations avant de créer le contrat.</p>
              </div>

              <div style={{ background: "#F8FAFF", borderRadius: 18, border: "1.5px solid #E2E8F0", overflow: "hidden", marginBottom: 22 }}>
                <ResumeRow icon="🏠" label="Bien"      value={bienSel?.titre} />
                <ResumeRow icon="📐" label="Surface"   value={`${bienSel?.surface} m² · ${bienSel?.nb_pieces} pièces`} />
                <ResumeRow icon="🏷️" label="Type"      value={bienSel?.type_bien === "vente" ? "Vente" : "Location"} />
                <ResumeRow icon="👤" label="Vendeur"   value={`${vendeurSel?.prenom} ${vendeurSel?.nom}`} />
                <ResumeRow icon="🤝" label="Acheteur"  value={`${acheteurSel?.prenom} ${acheteurSel?.nom}`} />
                <ResumeRow icon="💰" label="Montant"   value={fmt(montant)} highlight />
                <ResumeRow icon="📅" label="Date"      value={new Date(dateContrat).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })} />
                <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 18, width: 28, textAlign: "center" }}>📄</span>
                  <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, width: 110, flexShrink: 0 }}>PDF joint</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: pdfFile ? "#059669" : "#94A3B8" }}>
                    {pdfFile ? `✓ ${pdfFile.name}` : "Aucun — sera généré automatiquement"}
                  </span>
                </div>
              </div>

              <div style={{ background: "#EEF2FF", border: "1px solid #A5B4FC", borderRadius: 12, padding: "12px 18px", marginBottom: 4, display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 20 }}>💡</span>
                <p style={{ margin: 0, fontSize: 12, color: "#3730A3" }}>
                  Un PDF du contrat sera <strong>généré et téléchargeable</strong> une fois le contrat signé.
                </p>
              </div>

              <NavRow
                nextLabel={submitting ? "⏳ Création…" : "✓ Créer le contrat"}
                nextClick={handleSubmit}
                nextDisabled={submitting}
                nextColor="#059669"
              />
            </div>

          ) : step === 5 ? (
            /* ── ÉTAPE 5 : Signature vendeur ── */
            <div style={{ animation: "up .25s ease" }}>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#4F46E5,#0891B2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 14px", boxShadow: "0 8px 24px rgba(79,70,229,.3)" }}>✍️</div>
                <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 800, color: "#0F172A" }}>Signature du vendeur</h2>
                <p style={{ margin: 0, fontSize: 13, color: "#64748B" }}>
                  Contrat <strong style={{ color: "#4F46E5" }}>N° {String(success?.id_contrat || "").padStart(5, "0")}</strong> créé avec succès — signez pour le valider
                </p>
              </div>

              {/* Mini récap */}
              <div style={{ background: "#F8FAFF", borderRadius: 14, border: "1px solid #E2E8F0", padding: "14px 20px", marginBottom: 24, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 22 }}>🏠</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{bienSel?.titre}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#64748B" }}>{fmt(montant)}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <Avatar nom={vendeurSel?.nom} prenom={vendeurSel?.prenom} size={28} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#0F172A" }}>{vendeurSel?.prenom} {vendeurSel?.nom}</span>
                </div>
                <span style={{ color: "#CBD5E1" }}>→</span>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <Avatar nom={acheteurSel?.nom} prenom={acheteurSel?.prenom} size={28} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#0F172A" }}>{acheteurSel?.prenom} {acheteurSel?.nom}</span>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <span style={{ background: "#FFF7ED", color: "#D97706", border: "1px solid #FCD34D", borderRadius: 8, padding: "4px 12px", fontSize: 11, fontWeight: 700 }}>⏳ En attente de signature</span>
                </div>
              </div>

              {/* Canvas signature */}
              <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #E2E8F0", padding: "22px 24px", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <Avatar nom={vendeurSel?.nom} prenom={vendeurSel?.prenom} size={36} />
                  <div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#0F172A" }}>{vendeurSel?.prenom} {vendeurSel?.nom}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#94A3B8" }}>Signature électronique du vendeur</p>
                  </div>
                </div>
                <SignatureCanvas onSigned={setSignatureData} onClear={() => setSignatureData(null)} signed={!!signatureData} />
              </div>

              <div style={{ background: "#F0FDF4", borderRadius: 13, border: "1px solid #BBF7D0", padding: "12px 18px", marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 20 }}>ℹ️</span>
                <p style={{ margin: 0, fontSize: 12, color: "#166534", lineHeight: 1.5 }}>
                  Après votre signature, <strong>{acheteurSel?.prenom} {acheteurSel?.nom}</strong> devra signer dans son espace pour finaliser le contrat.
                </p>
              </div>

              {signErr && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", color: "#DC2626", fontSize: 13, fontWeight: 600, marginBottom: 16 }}>⚠️ {signErr}</div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid #F1F5F9" }}>
                <button onClick={() => navigate("/vendeur/contrats")} style={{ padding: "12px 22px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "transparent", color: "#64748B", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                  Signer plus tard
                </button>
                <button onClick={handleSign} disabled={!signatureData || signing} style={{
                  padding: "12px 28px", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 14,
                  background: !signatureData || signing ? "#E2E8F0" : "linear-gradient(135deg,#4F46E5,#0891B2)",
                  color: !signatureData || signing ? "#94A3B8" : "#fff",
                  cursor: !signatureData || signing ? "not-allowed" : "pointer",
                  boxShadow: !signatureData || signing ? "none" : "0 4px 18px rgba(79,70,229,.35)",
                }}>
                  {signing ? "⏳ Enregistrement…" : "✍️ Valider ma signature"}
                </button>
              </div>
            </div>

          ) : step === 6 ? (
            /* ── ÉTAPE 6 : Succès + téléchargement PDF ── */
            <div style={{ textAlign: "center", padding: "24px 0 12px", animation: "pop .3s ease" }}>
              <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
              <h2 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 800, color: "#0F172A" }}>Contrat signé !</h2>
              <p style={{ color: "#64748B", marginBottom: 6, fontSize: 15 }}>
                Contrat <strong style={{ color: "#4F46E5" }}>N° {String(success?.id_contrat || "").padStart(5, "0")}</strong> enregistré et signé par le vendeur.
              </p>
              <p style={{ color: "#94A3B8", fontSize: 13, marginBottom: 28 }}>{bienSel?.titre} · {fmt(montant)}</p>

              {/* Statut signatures */}
              <div style={{ display: "inline-flex", gap: 16, background: "#F8FAFF", borderRadius: 14, border: "1px solid #E2E8F0", padding: "14px 24px", marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#059669", display: "inline-block" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Vendeur ✅</span>
                </div>
                <div style={{ width: 1, background: "#E2E8F0" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B", display: "inline-block" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#64748B" }}>Acheteur ⏳</span>
                </div>
              </div>

              {/* Bouton télécharger PDF */}
              <div style={{ background: "#F0FDF4", border: "1.5px solid #6EE7B7", borderRadius: 18, padding: "20px 28px", marginBottom: 28, display: "inline-block", minWidth: 340 }}>
                <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 800, color: "#065F46" }}>📄 Contrat disponible en PDF</p>
                <p style={{ margin: "0 0 16px", fontSize: 12, color: "#059669" }}>Téléchargez une copie du contrat avec votre signature.</p>
                <button onClick={handleDownloadPDF} disabled={pdfGenerating} style={{
                  padding: "13px 32px", borderRadius: 13, border: "none", fontWeight: 700, fontSize: 14,
                  background: pdfGenerating ? "#E2E8F0" : "linear-gradient(135deg,#059669,#0891B2)",
                  color: pdfGenerating ? "#94A3B8" : "#fff", cursor: pdfGenerating ? "not-allowed" : "pointer",
                  boxShadow: pdfGenerating ? "none" : "0 4px 18px rgba(5,150,105,.35)",
                  display: "flex", alignItems: "center", gap: 8, margin: "0 auto",
                }}>
                  {pdfGenerating ? "⏳ Génération…" : "⬇️ Télécharger le PDF"}
                </button>
              </div>

              <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
                <button onClick={reset} style={{ padding: "13px 24px", borderRadius: 12, border: "1.5px solid #E2E8F0", background: "#fff", color: "#64748B", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                  + Nouveau contrat
                </button>
                <button onClick={() => navigate("/vendeur/contrats")} style={{ padding: "13px 28px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#4F46E5,#0891B2)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: "0 4px 18px rgba(79,70,229,.3)" }}>
                  Voir tous les contrats →
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}