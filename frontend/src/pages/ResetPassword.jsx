import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import axios from '../api/axios'

export default function ResetPassword() {
  const [searchParams]          = useSearchParams()
  const navigate                = useNavigate()
  const token                   = searchParams.get('token')
  const emailFromUrl             = searchParams.get('email') || ''

  const [form, setForm]         = useState({ email: emailFromUrl, mot_de_passe: '', confirmation: '' })
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState('')
  const [errors, setErrors]     = useState({})
  const [showPwd, setShowPwd]   = useState(false)
  const [showPwd2, setShowPwd2] = useState(false)

  const handleChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.email.trim()) e.email = 'Email obligatoire'
    if (!form.mot_de_passe || form.mot_de_passe.length < 6) e.mot_de_passe = 'Minimum 6 caractères'
    if (form.mot_de_passe !== form.confirmation) e.confirmation = 'Les mots de passe ne correspondent pas'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true); setError('')
    try {
      // ✅ Route corrigée + champs corrects
      await axios.post('/reset-password-token', {
        token,
        mot_de_passe: form.mot_de_passe,
        confirmation: form.confirmation,
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Lien invalide ou expiré.')
    } finally { setLoading(false) }
  }

  const EyeIcon = ({ show }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {show
        ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
      }
    </svg>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4', fontFamily: "'Cormorant Garamond',serif", display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        .rp-input { width:100%; padding:13px 16px; border:1px solid rgba(200,169,110,0.25); font-family:'DM Sans',sans-serif; font-size:14px; color:#0f1e35; background:#fdfcfa; outline:none; transition:border-color .2s; }
        .rp-input:focus { border-color:#c8a96e; }
        .rp-input::placeholder { color:#c4bfb8; }
        .rp-input.err { border-color:rgba(220,38,38,0.4); background:#fff8f8; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp .4s ease forwards; }
        .pwd-wrap { position:relative; }
        .pwd-wrap .eye-btn { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#9ca3af; padding:0; display:flex; align-items:center; }
        .pwd-wrap .eye-btn:hover { color:#c8a96e; }
      `}</style>

      {/* Hero */}
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=90" alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg,rgba(8,16,34,0.95) 0%,rgba(8,16,34,0.6) 55%,rgba(8,16,34,0.15) 100%)' }} />
        <div style={{ position: 'absolute', left: '72px', top: '15%', bottom: '15%', width: '1px', background: 'linear-gradient(to bottom,transparent,#c8a96e,transparent)' }} />
        <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 110px' }}>
          <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '4px', color: '#c8a96e', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
            ImmoExpert
          </span>
          <h1 style={{ color: 'white', fontSize: 34, fontWeight: 700, lineHeight: 1.1, margin: 0 }}>
            Nouveau mot de passe
          </h1>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, background: 'linear-gradient(to top,#f8f7f4,transparent)' }} />
      </div>

      {/* Formulaire */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div className="fade-up" style={{ width: '100%', maxWidth: '460px' }}>

          {!token ? (
            <div style={{ background: 'white', border: '1px solid rgba(220,38,38,0.2)', padding: '32px 36px', textAlign: 'center' }}>
              <p style={{ fontFamily: "'DM Sans',sans-serif", color: '#991b1b', fontSize: 14, margin: '0 0 16px' }}>
                Lien invalide ou expiré.
              </p>
              <Link to="/forgot-password" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: '#c8a96e', textDecoration: 'none', fontWeight: 600 }}>
                Demander un nouveau lien →
              </Link>
            </div>

          ) : success ? (
            <div style={{ background: 'white', border: '1px solid rgba(200,169,110,0.15)', boxShadow: '0 4px 32px rgba(10,20,40,0.07)', padding: '48px 36px', textAlign: 'center' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', border: '1px solid rgba(200,169,110,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#0f1e35', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </div>
              <div style={{ width: 28, height: 1, background: '#c8a96e', margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f1e35', margin: '0 0 10px' }}>Mot de passe mis à jour</h2>
              <p style={{ fontFamily: "'DM Sans',sans-serif", color: '#9ca3af', fontSize: 13, margin: '0 0 8px' }}>
                Redirection automatique vers la connexion...
              </p>
              <p style={{ fontFamily: "'DM Sans',sans-serif", color: '#c4bfb8', fontSize: 12, margin: 0 }}>
                Ou cliquez <Link to="/login" style={{ color: '#c8a96e', textDecoration: 'none', fontWeight: 600 }}>ici</Link>
              </p>
            </div>

          ) : (
            <div style={{ background: 'white', border: '1px solid rgba(200,169,110,0.15)', boxShadow: '0 4px 32px rgba(10,20,40,0.07)' }}>
              <div style={{ padding: '32px 36px 24px', borderBottom: '1px solid rgba(200,169,110,0.1)' }}>
                <div style={{ width: 28, height: 2, background: '#c8a96e', marginBottom: 10 }} />
                <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f1e35', margin: '0 0 6px' }}>Choisir un nouveau mot de passe</h2>
                <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 13, color: '#9ca3af', margin: 0 }}>
                  Minimum 6 caractères
                </p>
              </div>

              <div style={{ padding: '28px 36px 32px', display: 'flex', flexDirection: 'column', gap: 18 }}>

                {error && (
                  <div style={{ background: '#fef2f2', border: '1px solid rgba(220,38,38,0.2)', padding: '12px 16px', color: '#991b1b', fontFamily: "'DM Sans',sans-serif", fontSize: 13 }}>
                    {error}
                  </div>
                )}

                {/* Nouveau mot de passe */}
                <div>
                  <label style={{ display: 'block', fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>
                    Nouveau mot de passe *
                  </label>
                  <div className="pwd-wrap">
                    <input
                      className={`rp-input${errors.mot_de_passe ? ' err' : ''}`}
                      type={showPwd ? 'text' : 'password'}
                      name="mot_de_passe"
                      value={form.mot_de_passe}
                      onChange={handleChange}
                      placeholder="Minimum 6 caractères"
                      style={{ paddingRight: 44 }}
                    />
                    <button className="eye-btn" onClick={() => setShowPwd(p => !p)}>
                      <EyeIcon show={showPwd} />
                    </button>
                  </div>
                  {errors.mot_de_passe && <span style={{ fontFamily: "'DM Sans',sans-serif", color: '#dc2626', fontSize: 11, marginTop: 4, display: 'block' }}>{errors.mot_de_passe}</span>}

                  {/* Barre de force */}
                  {form.mot_de_passe && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ height: 4, background: '#f0ede8', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 99, transition: 'width .3s, background .3s',
                          width: form.mot_de_passe.length >= 12 ? '100%' : form.mot_de_passe.length >= 8 ? '60%' : '30%',
                          background: form.mot_de_passe.length >= 12 ? '#065f46' : form.mot_de_passe.length >= 8 ? '#c8a96e' : '#dc2626',
                        }} />
                      </div>
                      <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: form.mot_de_passe.length >= 12 ? '#065f46' : form.mot_de_passe.length >= 8 ? '#c8a96e' : '#dc2626', marginTop: 4, display: 'block' }}>
                        {form.mot_de_passe.length >= 12 ? 'Fort' : form.mot_de_passe.length >= 8 ? 'Moyen' : 'Faible'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Confirmation */}
                <div>
                  <label style={{ display: 'block', fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>
                    Confirmer le mot de passe *
                  </label>
                  <div className="pwd-wrap">
                    <input
                      className={`rp-input${errors.confirmation ? ' err' : ''}`}
                      type={showPwd2 ? 'text' : 'password'}
                      name="confirmation"
                      value={form.confirmation}
                      onChange={handleChange}
                      placeholder="Répétez le mot de passe"
                      style={{ paddingRight: 44 }}
                    />
                    <button className="eye-btn" onClick={() => setShowPwd2(p => !p)}>
                      <EyeIcon show={showPwd2} />
                    </button>
                  </div>
                  {errors.confirmation && <span style={{ fontFamily: "'DM Sans',sans-serif", color: '#dc2626', fontSize: 11, marginTop: 4, display: 'block' }}>{errors.confirmation}</span>}
                  {form.confirmation && form.mot_de_passe === form.confirmation && (
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 10, color: '#065f46', marginTop: 4, display: 'block' }}>
                      Les mots de passe correspondent ✓
                    </span>
                  )}
                </div>

                <button
                  onClick={handleSubmit} disabled={loading}
                  style={{ width: '100%', padding: '14px', background: loading ? '#d4c4a8' : '#c8a96e', color: 'white', border: 'none', fontFamily: "'DM Sans',sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background .2s' }}
                  onMouseEnter={e => !loading && (e.currentTarget.style.background='#b8955a')}
                  onMouseLeave={e => !loading && (e.currentTarget.style.background='#c8a96e')}>
                  {loading ? 'Mise à jour...' : 'Enregistrer le mot de passe'}
                </button>

                <div style={{ textAlign: 'center' }}>
                  <Link to="/login" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: '#c8a96e', textDecoration: 'none', fontWeight: 600 }}>
                    ← Retour à la connexion
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#070f1e', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: 'white', letterSpacing: '2px' }}>ImmoExpert</span>
        <span style={{ fontFamily: "'DM Sans',sans-serif", color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>© 2026</span>
      </div>
    </div>
  )
}