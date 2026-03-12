import { useState, useEffect } from 'react'
import axiosInstance from '../api/axios'
import { useNavigate } from 'react-router-dom'

function Home() {
  const [biens, setBiens]       = useState([])
  const [favoris, setFavoris]   = useState({}) // { id_bien: id_favori }
  const [loadingFav, setLoadingFav] = useState({})
  const navigate = useNavigate()

  const user  = JSON.parse(localStorage.getItem("user") || "{}")
  const token = localStorage.getItem("token")
  const isClient = token && user?.id_role === 3

  useEffect(() => {
    axiosInstance.get('/biens')
      .then(res => setBiens(res.data))
      .catch(err => console.error(err))
  }, [])

  // Charger les favoris de l'acheteur
  useEffect(() => {
    if (!isClient) return
    axiosInstance.get('/favoris')
      .then(res => {
        const map = {}
        res.data.forEach(f => {
          if (f.id_user === user.id_user) map[f.id_bien] = f.id_favori
        })
        setFavoris(map)
      })
      .catch(() => {})
  }, [isClient])

  const toggleFavori = async (e, id_bien) => {
    e.stopPropagation()
    if (!isClient) { navigate("/login"); return }
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

  const fmt = (n) => Number(n).toLocaleString('fr-MA') + ' DH'

  return (
    <div style={{ background: '#f3f4f6', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes heartPop { 0%{transform:scale(1)} 50%{transform:scale(1.4)} 100%{transform:scale(1)} }
        .card-bien { transition: transform 0.2s, box-shadow 0.2s; }
        .card-bien:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.13) !important; }
        .heart-btn { transition: all 0.15s; }
        .heart-btn:hover { transform: scale(1.15); }
      `}</style>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
        color: 'white', padding: '80px 40px', textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '36px', marginBottom: '16px', fontWeight: 800 }}>
          Trouvez votre bien immobilier idéal
        </h1>
        <p style={{ fontSize: '18px', marginBottom: '30px', opacity: 0.9 }}>
          Achetez ou louez parmi nos annonces disponibles
        </p>
        <button onClick={() => navigate('/biens')} style={{
          background: '#ef4444', color: 'white', border: 'none',
          padding: '14px 36px', borderRadius: '8px',
          fontSize: '16px', cursor: 'pointer', fontWeight: '700'
        }}>
          Voir les biens
        </button>
      </div>

      {/* Biens récents */}
      <div style={{ padding: '40px' }}>
        <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>
          Biens récents
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {biens.map(bien => {
            const isFav = !!favoris[bien.id_bien]
            const isLoading = loadingFav[bien.id_bien]
            return (
              <div key={bien.id_bien} className="card-bien"
                onClick={() => navigate(`/biens/${bien.id_bien}`)}
                style={{
                  background: 'white', borderRadius: '16px',
                  overflow: 'hidden', cursor: 'pointer',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                }}>

                {/* Image */}
                <div style={{ position: 'relative' }}>
                  <img
                    src={bien.images?.[0]?.url_image
                      ? `http://127.0.0.1:8000/storage/${bien.images[0].url_image}`
                      : 'https://via.placeholder.com/400x200?text=Pas+d+image'}
                    alt={bien.titre}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                  <span style={{
                    position: 'absolute', top: '10px', left: '10px',
                    background: '#2563eb', color: 'white',
                    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'
                  }}>
                    {bien.type_bien === 'vente' ? 'À vendre' : 'À louer'}
                  </span>
                  <span style={{
                    position: 'absolute', top: '10px', right: '50px',
                    background: bien.statut === 'disponible' ? '#16a34a' : '#ef4444',
                    color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'
                  }}>
                    {bien.statut}
                  </span>

                </div>

                {/* Infos */}
                <div style={{ padding: '16px' }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                    {bien.titre}
                  </h3>
                  <p style={{ margin: '4px 0', color: '#6b7280', fontSize: '14px' }}>
                    📐 {bien.surface} m² &nbsp;|&nbsp; 🛏 {bien.nb_pieces} pièces
                  </p>
                  <p style={{ margin: '8px 0 0', color: '#2563eb', fontWeight: 'bold', fontSize: '18px' }}>
                    {fmt(bien.prix)}
                  </p>
                  {/* Cœur en bas */}
                  <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
                    <button
                      className="heart-btn"
                      onClick={(e) => toggleFavori(e, bien.id_bien)}
                      disabled={isLoading}
                      title={isFav ? "Retirer des favoris" : "Ajouter aux favoris"}
                      style={{
                        width: 38, height: 38, borderRadius: "50%", border: `1.5px solid ${isFav ? "#ef4444" : "#e2e8f0"}`,
                        background: isFav ? "#fff0f0" : "#f8faff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, cursor: "pointer",
                        animation: isFav ? "heartPop 0.3s ease" : "none",
                      }}>
                      {isLoading ? "⏳" : isFav ? "❤️" : "🤍"}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Home