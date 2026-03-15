import { useState, useEffect, useRef } from 'react'
import axiosInstance from '../api/axios'
import { useNavigate } from 'react-router-dom'

const HERO_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=90',
    titre: 'Trouvez la maison de vos rêves',
    sous: 'Des milliers de biens disponibles au Maroc',
  },
  {
    url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=90',
    titre: 'Villas & Résidences de standing',
    sous: 'Les plus belles propriétés sélectionnées pour vous',
  },
  {
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=90',
    titre: "Investissez dans l'immobilier",
    sous: 'Des opportunités uniques dans tout le Maroc',
  },
  {
    url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600&q=90',
    titre: 'Appartements modernes & lumineux',
    sous: 'Casablanca, Rabat, Marrakech et plus encore',
  },
]

const STATS = [
  {
    svg: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:36,height:36}}>
        <path d="M20 4L4 16v20h10V24h12v12h10V16L20 4z" stroke="#c8a96e" strokeWidth="2" strokeLinejoin="round" fill="rgba(200,169,110,0.1)"/>
        <rect x="16" y="24" width="8" height="12" rx="1" stroke="#c8a96e" strokeWidth="1.5" fill="rgba(200,169,110,0.2)"/>
      </svg>
    ),
    value: '10 000+', label: 'Biens disponibles'
  },
  {
    svg: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:36,height:36}}>
        <circle cx="20" cy="20" r="14" stroke="#c8a96e" strokeWidth="2" fill="none"/>
        <ellipse cx="20" cy="20" rx="5" ry="14" stroke="#c8a96e" strokeWidth="1.5" fill="none"/>
        <line x1="6" y1="20" x2="34" y2="20" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    value: '20+', label: 'Villes couvertes'
  },
  {
    svg: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:36,height:36}}>
        <circle cx="15" cy="13" r="5.5" stroke="#c8a96e" strokeWidth="2" fill="rgba(200,169,110,0.1)"/>
        <circle cx="25" cy="15" r="4.5" stroke="#c8a96e" strokeWidth="1.5" fill="rgba(200,169,110,0.08)"/>
        <path d="M4 33c0-5.523 4.925-9 11-9s11 3.477 11 9" stroke="#c8a96e" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <path d="M27 23.5c3 .8 7 3 7 8" stroke="#c8a96e" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      </svg>
    ),
    value: '50 000+', label: 'Clients satisfaits'
  },
  {
    svg: (
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:36,height:36}}>
        <path d="M20 6l3.5 7.1 7.8 1.14-5.65 5.5 1.33 7.76L20 23.6l-7.02 3.9 1.33-7.76L8.7 14.24l7.8-1.14z" stroke="#c8a96e" strokeWidth="2" strokeLinejoin="round" fill="rgba(200,169,110,0.2)"/>
      </svg>
    ),
    value: '4.9/5', label: 'Note moyenne'
  },
]

// ── Images originales compatibles ─────────────────────────────────────────────
const SERVICES = [
  {
    img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=90',
    titre: 'Vente',
    desc: 'Achetez votre bien idéal parmi notre sélection exclusive de propriétés premium.',
    num: '01'
  },
  {
    img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=90',
    titre: 'Location',
    desc: 'Trouvez rapidement un logement adapté à vos besoins et votre budget.',
    num: '02'
  },
  {
    img: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=90',
    titre: 'Estimation',
    desc: 'Estimez précisément la valeur marchande de votre bien immobilier.',
    num: '03'
  },
  {
    img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=90',
    titre: 'Gestion',
    desc: 'Confiez-nous la gestion locative de votre patrimoine immobilier.',
    num: '04'
  },
]

function Home() {
  const [biens, setBiens]           = useState([])
  const [favoris, setFavoris]       = useState({})
  const [loadingFav, setLoadingFav] = useState({})
  const [slide, setSlide]           = useState(0)
  const [animating, setAnimating]   = useState(false)
  const biensRef                    = useRef(null)
  const navigate                    = useNavigate()

  const user      = JSON.parse(localStorage.getItem('user') || '{}')
  const token     = localStorage.getItem('token')
  const isClient  = token && user?.id_role === 3
  // ✅ Cœur visible seulement pour visiteur (pas connecté) ou client (id_role=3)
  const showHeart = !token || isClient

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true)
      setTimeout(() => {
        setSlide(s => (s + 1) % HERO_SLIDES.length)
        setAnimating(false)
      }, 600)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    axiosInstance.get('/biens').then(res => setBiens(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!isClient) return
    axiosInstance.get('/favoris').then(res => {
      const map = {}
      res.data.forEach(f => { if (f.id_user === user.id_user) map[f.id_bien] = f.id_favori })
      setFavoris(map)
    }).catch(() => {})
  }, [isClient])

  const toggleFavori = async (e, id_bien) => {
    e.stopPropagation()
    if (!token) { navigate('/login'); return }
    if (!isClient) return
    setLoadingFav(p => ({ ...p, [id_bien]: true }))
    try {
      if (favoris[id_bien]) {
        await axiosInstance.delete(`/favoris/${favoris[id_bien]}`)
        setFavoris(p => { const n = { ...p }; delete n[id_bien]; return n })
      } else {
        const { data } = await axiosInstance.post('/favoris', { id_bien, id_user: user.id_user })
        setFavoris(p => ({ ...p, [id_bien]: data.id_favori }))
      }
    } catch {}
    setLoadingFav(p => ({ ...p, [id_bien]: false }))
  }

  // ✅ Scroll doux vers la section biens
  const scrollToBiens = () => {
    biensRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const fmt     = n => Number(n).toLocaleString('fr-MA') + ' DH'
  const current = HERO_SLIDES[slide]

  return (
    <div style={{ background: '#f8f7f4', minHeight: '100vh', fontFamily: "'Cormorant Garamond', serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }

        .hero-img { transition: opacity 0.6s ease, transform 0.6s ease; }
        .hero-img.fade { opacity: 0; transform: scale(1.03); }

        .dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.4); cursor: pointer; transition: all 0.3s; border: none; }
        .dot.active { background: white; width: 28px; border-radius: 4px; }

        .btn-primary { background: #c8a96e; color: white; border: none; padding: 16px 40px; border-radius: 4px; font-size: 15px; font-weight: 600; cursor: pointer; letter-spacing: 1px; font-family: 'DM Sans', sans-serif; transition: background 0.2s, transform 0.2s; text-transform: uppercase; }
        .btn-primary:hover { background: #b8955a; transform: translateY(-2px); }

        .heart-btn { transition: transform 0.15s; border: none; cursor: pointer; }
        .heart-btn:hover { transform: scale(1.2); }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.7s ease forwards; }
        .delay-1 { animation-delay: 0.1s; opacity: 0; }
        .delay-2 { animation-delay: 0.25s; opacity: 0; }
        .delay-3 { animation-delay: 0.4s; opacity: 0; }

        /* ── Services ── */
        .svc { position: relative; height: 360px; overflow: hidden; cursor: pointer; }
        .svc img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s ease; filter: brightness(0.8); }
        .svc .svc-ov { position: absolute; inset: 0; background: linear-gradient(to top, rgba(5,10,25,0.9) 0%, rgba(5,10,25,0.25) 60%, rgba(5,10,25,0.05) 100%); transition: background 0.4s; }
        .svc .svc-line { width: 32px; height: 2px; background: #c8a96e; margin-bottom: 12px; transition: width 0.4s ease; }
        .svc .svc-desc { opacity: 0; transform: translateY(10px); transition: opacity 0.4s, transform 0.4s; font-family: 'DM Sans', sans-serif; color: rgba(255,255,255,0.8); font-size: 13px; line-height: 1.7; margin: 0; }
        .svc:hover img { transform: scale(1.08); filter: brightness(0.7); }
        .svc:hover .svc-ov { background: linear-gradient(to top, rgba(5,10,25,0.95) 0%, rgba(5,10,25,0.5) 60%, rgba(5,10,25,0.15) 100%); }
        .svc:hover .svc-line { width: 52px; }
        .svc:hover .svc-desc { opacity: 1; transform: translateY(0); }
        .svc-border { position: absolute; inset: 0; border: 1px solid transparent; transition: border-color 0.4s; pointer-events: none; z-index: 3; }
        .svc:hover .svc-border { border-color: rgba(200,169,110,0.5); }

        /* ── Bien Cards — coins biseautés (coupés en diagonale) ── */
        .bien-card-new {
          background: white;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          position: relative;
          clip-path: polygon(
            20px 0%, calc(100% - 20px) 0%,
            100% 20px, 100% calc(100% - 20px),
            calc(100% - 20px) 100%, 20px 100%,
            0% calc(100% - 20px), 0% 20px
          );
        }
        .bien-card-new:hover {
          transform: translateY(-10px);
          box-shadow: 0 28px 56px rgba(0,0,0,0.15);
        }
        .bien-card-new:hover .bien-img-new { transform: scale(1.07); }
        .bien-img-new { width: 100%; height: 100%; object-fit: cover; transition: transform 0.55s ease; }

        /* Ligne dorée au bas au hover — trick via outline car clip-path coupe */
        .bien-card-new::before {
          content: '';
          position: absolute;
          inset: 0;
          border: 2px solid transparent;
          clip-path: polygon(
            20px 0%, calc(100% - 20px) 0%,
            100% 20px, 100% calc(100% - 20px),
            calc(100% - 20px) 100%, 20px 100%,
            0% calc(100% - 20px), 0% 20px
          );
          transition: border-color 0.3s;
          pointer-events: none;
          z-index: 10;
        }
        .bien-card-new:hover::before { border-color: #c8a96e; }

        .voir-btn { font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #c8a96e; cursor: pointer; background: none; border: none; padding: 0; transition: letter-spacing 0.25s; display:flex; align-items:center; gap:4px; }
        .voir-btn:hover { letter-spacing: 3px; }

        /* Stats */
        .stat-item { text-align: center; padding: 28px 20px; position: relative; }
        .stat-item::after { content:''; position:absolute; right:0; top:25%; bottom:25%; width:1px; background:rgba(200,169,110,0.2); }
        .stat-item:last-child::after { display:none; }
      `}</style>

      {/* ════════════════════ HERO ════════════════════ */}
      <div style={{ position: 'relative', height: '92vh', overflow: 'hidden' }}>
        <img className={`hero-img${animating ? ' fade' : ''}`} src={current.url} alt="hero"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,20,40,0.85) 0%, rgba(10,20,40,0.5) 60%, rgba(10,20,40,0.15) 100%)' }} />
        <div style={{ position: 'absolute', left: '60px', top: '20%', bottom: '20%', width: '1px', background: 'rgba(200,169,110,0.4)' }} />

        <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 100px' }}>
          <div className="fade-up delay-1">
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: '700', letterSpacing: '4px', color: '#c8a96e', textTransform: 'uppercase', display: 'block', marginBottom: '18px' }}>
              🏠 ImmoExpert Maroc
            </span>
          </div>
          <h1 className="fade-up delay-2" style={{ color: 'white', fontSize: 'clamp(34px, 5vw, 64px)', fontWeight: '700', lineHeight: '1.1', margin: '0 0 18px', maxWidth: '620px' }}>
            {current.titre}
          </h1>
          <p className="fade-up delay-3" style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.72)', fontSize: '17px', margin: '0 0 38px', maxWidth: '480px', lineHeight: '1.65' }}>
            {current.sous}
          </p>
          <div className="fade-up delay-3">
            {/* ✅ Scroll vers biens — pas de navigation */}
            <button className="btn-primary" onClick={scrollToBiens}>Voir les biens</button>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '38px', left: '100px', display: 'flex', gap: '8px', zIndex: 3 }}>
          {HERO_SLIDES.map((_, i) => (
            <button key={i} className={`dot${i === slide ? ' active' : ''}`} onClick={() => setSlide(i)} />
          ))}
        </div>
        <div style={{ position: 'absolute', bottom: '38px', right: '60px', fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.45)', fontSize: '13px', zIndex: 3 }}>
          <span style={{ color: 'white', fontWeight: '700', fontSize: '17px' }}>0{slide + 1}</span>
          {' / 0'}{HERO_SLIDES.length}
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px', background: 'linear-gradient(to top, #f8f7f4, transparent)' }} />
      </div>

      {/* ════════════════════ STATS ════════════════════ */}
      <div style={{ background: '#0f1e35', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
        {STATS.map(({ svg, value, label }) => (
          <div key={label} className="stat-item">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>{svg}</div>
            <div style={{ color: '#c8a96e', fontSize: '28px', fontWeight: '700', lineHeight: 1, fontFamily: "'Cormorant Garamond', serif" }}>{value}</div>
            <div style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '5px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ✅ Espace visible entre stats et services */}
      <div style={{ height: '60px', background: 'linear-gradient(to bottom, #0f1e35, #0a1428)' }} />

      {/* ════════════════════ SERVICES ════════════════════ */}
      <div style={{ background: '#0a1428', padding: '0 80px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '44px' }}>
          <div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: '700', letterSpacing: '4px', color: '#c8a96e', textTransform: 'uppercase' }}>Ce que nous faisons</span>
            <h2 style={{ fontSize: '40px', color: 'white', margin: '10px 0 0', fontWeight: '700' }}>Nos services</h2>
          </div>
          <div style={{ width: '60px', height: '2px', background: 'linear-gradient(90deg,#c8a96e,transparent)' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '3px' }}>
          {SERVICES.map(({ img, titre, desc, num }) => (
            <div key={titre} className="svc">
              <img src={img} alt={titre} />
              <div className="svc-ov" />
              <div className="svc-border" />
              <div style={{ position: 'absolute', inset: 0, padding: '28px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 2 }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '52px', fontWeight: '800', color: 'rgba(200,169,110,0.1)', position: 'absolute', top: '14px', right: '18px', lineHeight: 1 }}>{num}</div>
                <div className="svc-line" />
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", color: 'white', fontSize: '24px', fontWeight: '700', margin: '0 0 10px' }}>{titre}</h3>
                <p className="svc-desc">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════ BIENS RÉCENTS ════════════════════ */}
      <div ref={biensRef} style={{ padding: '80px 80px 90px', background: '#f8f7f4' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '52px' }}>
          <div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: '700', letterSpacing: '4px', color: '#c8a96e', textTransform: 'uppercase' }}>Sélection du moment</span>
            <h2 style={{ fontSize: '42px', color: '#0f1e35', margin: '10px 0 0', fontWeight: '700' }}>Biens récents</h2>
          </div>
          <button onClick={() => navigate('/biens')}
            style={{ fontFamily: "'DM Sans', sans-serif", background: 'none', border: '1px solid #0f1e35', color: '#0f1e35', padding: '12px 28px', borderRadius: '2px', cursor: 'pointer', fontSize: '11px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', transition: 'all 0.25s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#0f1e35'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#0f1e35' }}>
            Voir tout →
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
          {biens.slice(0, 6).map(bien => {
            const isFav      = !!favoris[bien.id_bien]
            const isLoading  = loadingFav[bien.id_bien]
            const rawUrl     = bien.images?.[0]?.url_image || ''
            const imgSrc     = rawUrl.startsWith('http')
              ? rawUrl
              : rawUrl
                ? `http://127.0.0.1:8000/storage/${rawUrl}`
                : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80'
            const isBienVente = bien.type_bien === 'vente'

            return (
              <div key={bien.id_bien} className="bien-card-new" onClick={() => navigate(`/biens/${bien.id_bien}`)}>

                {/* ── Image ── */}
                <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                  <img className="bien-img-new" src={imgSrc} alt={bien.titre}
                    onError={e => e.target.src='https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80'} />

                  <div style={{ position:'absolute',inset:0,background:'linear-gradient(to top, rgba(10,20,40,0.78) 0%, transparent 55%)' }} />

                  {/* Type */}
                  <div style={{ position:'absolute',top:0,left:0, background: isBienVente ? '#0f1e35' : '#c8a96e', color:'white', padding:'7px 15px', fontFamily:"'DM Sans',sans-serif", fontSize:'10px', fontWeight:'700', letterSpacing:'1.5px', textTransform:'uppercase' }}>
                    {isBienVente ? 'À vendre' : 'À louer'}
                  </div>

                  {/* Statut — décalé si cœur visible */}
                  <div style={{ position:'absolute', top:0, right: showHeart ? '44px' : '0', background: bien.statut==='disponible' ? 'rgba(5,150,105,0.95)' : 'rgba(185,28,28,0.95)', color:'white', padding:'7px 12px', fontFamily:"'DM Sans',sans-serif", fontSize:'10px', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase' }}>
                    {bien.statut}
                  </div>

                  {/* ✅ Cœur — caché pour vendeur et admin */}
                  {showHeart && (
                    <button className="heart-btn"
                      onClick={e => toggleFavori(e, bien.id_bien)}
                      disabled={isLoading}
                      style={{ position:'absolute',top:'8px',right:'8px',width:'32px',height:'32px',borderRadius:'50%',background:'rgba(255,255,255,0.95)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',boxShadow:'0 2px 10px rgba(0,0,0,0.2)' }}>
                      {isLoading ? '⏳' : isFav ? '❤️' : '🤍'}
                    </button>
                  )}

                  {/* Prix */}
                  <div style={{ position:'absolute',bottom:'12px',left:'16px' }}>
                    <span style={{ fontFamily:"'Cormorant Garamond',serif",fontWeight:'700',color:'white',fontSize:'22px',textShadow:'0 2px 8px rgba(0,0,0,0.4)' }}>
                      {fmt(bien.prix)}
                    </span>
                    {!isBienVente && <span style={{ fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,0.7)',fontSize:'11px',marginLeft:'4px' }}>/mois</span>}
                  </div>
                </div>

                {/* ── Contenu ── */}
                <div style={{ padding:'18px 20px 20px' }}>
                  <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:'19px',fontWeight:'700',color:'#0f1e35',margin:'0 0 5px',lineHeight:'1.3' }}>
                    {bien.titre}
                  </h3>
                  {bien.adresse && (
                    <p style={{ fontFamily:"'DM Sans',sans-serif",color:'#9ca3af',fontSize:'12px',margin:'0 0 12px' }}>
                      <span style={{color:'#c8a96e'}}>📍</span> {bien.adresse}
                    </p>
                  )}

                  {/* Specs */}
                  <div style={{ display:'flex',marginBottom:'16px',borderTop:'1px solid #f0ede8',borderBottom:'1px solid #f0ede8',padding:'11px 0' }}>
                    {[
                      { icon:'📐', val:`${bien.surface} m²`, label:'Surface' },
                      { icon:'🚪', val:`${bien.nb_pieces}`, label:'Pièces' },
                      { icon:'🏷️', val: isBienVente ? 'Vente' : 'Location', label:'Type' },
                    ].map(({ icon, val, label }, idx) => (
                      <div key={label} style={{ flex:1, textAlign:'center', borderRight: idx<2 ? '1px solid #f0ede8' : 'none', padding:'0 6px' }}>
                        <div style={{ fontSize:'15px', marginBottom:'2px' }}>{icon}</div>
                        <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:'12px',fontWeight:'700',color:'#0f1e35' }}>{val}</div>
                        <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:'9px',color:'#9ca3af',letterSpacing:'0.5px',textTransform:'uppercase',marginTop:'1px' }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Vendeur + CTA */}
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
                    <div style={{ display:'flex',alignItems:'center',gap:'8px' }}>
                      <div style={{ width:'28px',height:'28px',borderRadius:'50%',background:'linear-gradient(135deg,#0f1e35,#2563eb)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',color:'white',fontWeight:'700',fontFamily:"'DM Sans',sans-serif",flexShrink:0 }}>
                        {bien.vendeur?.prenom?.[0] || 'V'}
                      </div>
                      <div>
                        <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:'11px',fontWeight:'600',color:'#374151' }}>
                          {bien.vendeur ? `${bien.vendeur.prenom} ${bien.vendeur.nom}` : 'Vendeur'}
                        </div>
                        <div style={{ fontFamily:"'DM Sans',sans-serif",fontSize:'10px',color:'#9ca3af' }}>Propriétaire</div>
                      </div>
                    </div>
                    <button className="voir-btn">Voir <span style={{fontSize:'13px'}}>→</span></button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ════════════════════ CTA BANNER ════════════════════ */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '90px 80px', textAlign: 'center' }}>
        <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80" alt="cta"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,16,34,0.85)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ width:'40px',height:'2px',background:'#c8a96e',margin:'0 auto 20px' }} />
          <span style={{ fontFamily:"'DM Sans',sans-serif",fontSize:'11px',fontWeight:'700',letterSpacing:'4px',color:'#c8a96e',textTransform:'uppercase' }}>
            Rejoignez notre plateforme
          </span>
          <h2 style={{ color:'white',fontSize:'48px',margin:'16px 0 18px',fontWeight:'700',lineHeight:1.15 }}>
            Confiez-nous votre projet
          </h2>
          <p style={{ fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,0.65)',fontSize:'16px',maxWidth:'500px',margin:'0 auto 40px',lineHeight:'1.75' }}>
            Notre équipe d'experts vous accompagne de l'estimation à la signature du contrat.
          </p>
          <button className="btn-primary" onClick={() => navigate('/register')}>
            S'inscrire gratuitement
          </button>
        </div>
      </div>

      {/* ════════════════════ FOOTER ════════════════════ */}
      {/* ✅ Footer minimaliste — copyright seul, centré */}
      <div style={{ background: '#070f1e', padding: '30px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize:'18px',fontWeight:'700',color:'white',fontFamily:"'Cormorant Garamond',serif",letterSpacing:'2px' }}>
          🏠 ImmoExpert
        </span>
        <div style={{ width:'28px',height:'1px',background:'rgba(200,169,110,0.4)' }} />
        <span style={{ fontFamily:"'DM Sans',sans-serif",color:'rgba(255,255,255,0.25)',fontSize:'12px',letterSpacing:'0.5px',textAlign:'center' }}>
          © 2026 ImmoExpert — Tous droits réservés
        </span>
      </div>

    </div>
  )
}

export default Home