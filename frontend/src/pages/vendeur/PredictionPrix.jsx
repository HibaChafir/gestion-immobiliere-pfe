import { useState } from 'react';
import axios from "../../api/axios";

const initForm = {
    surface:   '',
    nb_pieces: '',
    type_bien: 'vente',
    adresse:   '',
};

export default function PredictionPrix() {
    const [form, setForm]       = useState(initForm);
    const [result, setResult]   = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handlePredict = () => {
        if (!form.surface || !form.nb_pieces) {
            setError('Veuillez remplir la surface et le nombre de pièces.');
            return;
        }
        setError('');
        setLoading(true);
        setResult(null);

        axios.post('http://localhost:8000/api/biens/predict', form)
            .then(res => setResult(res.data))
            .catch(err => {
                const msg = err.response?.data?.error
                    || err.response?.data?.message
                    || 'Erreur lors de la prédiction.';
                setError(msg);
            })
            .finally(() => setLoading(false));
    };

    return (
        <div style={{ padding: '30px', background: '#f4f6f9', minHeight: '100vh' }}>
            <h1 style={{ color: '#333', marginBottom: '8px' }}>🤖 Prédiction de Prix</h1>
            <p style={{ color: '#888', marginBottom: '30px', fontSize: '14px' }}>
                Estimation basée sur les prix du marché immobilier marocain réel 🇲🇦
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>

                {/* ── Formulaire ── */}
                <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <h2 style={{ margin: '0 0 20px', color: '#333', fontSize: '16px' }}>📋 Caractéristiques du bien</h2>

                    {error && (
                        <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '8px', marginBottom: '18px', fontSize: '13px' }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        {/* Type */}
                        <div>
                            <label style={labelStyle}>Type de bien</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {['vente', 'location'].map(t => (
                                    <button key={t} onClick={() => setForm({ ...form, type_bien: t })}
                                        style={{ flex: 1, padding: '10px', borderRadius: '8px', border: `2px solid ${form.type_bien === t ? '#007bff' : '#ddd'}`, background: form.type_bien === t ? '#e8f0fd' : 'white', color: form.type_bien === t ? '#1a56db' : '#555', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>
                                        {t === 'vente' ? '🏷️ Vente' : '🔑 Location'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Surface */}
                        <div>
                            <label style={labelStyle}>Surface (m²)</label>
                            <input type="number" name="surface" value={form.surface}
                                onChange={handleChange} placeholder="Ex: 120"
                                style={inputStyle} min="1" />
                        </div>

                        {/* Pièces */}
                        <div>
                            <label style={labelStyle}>Nombre de pièces</label>
                            <input type="number" name="nb_pieces" value={form.nb_pieces}
                                onChange={handleChange} placeholder="Ex: 4"
                                style={inputStyle} min="1" />
                        </div>

                        {/* Adresse */}
                        <div>
                            <label style={labelStyle}>
                                Ville / Quartier
                                <span style={{ color: '#1a56db', fontSize: '11px', fontWeight: 'normal', marginLeft: '8px' }}>
                                    (Rabat, Agdal, Casablanca, Marrakech...)
                                </span>
                            </label>
                            <input type="text" name="adresse" value={form.adresse}
                                onChange={handleChange} placeholder="Ex: Agdal, Rabat"
                                style={inputStyle} />
                        </div>

                        <button onClick={handlePredict} disabled={loading}
                            style={{ padding: '14px', background: loading ? '#aaa' : '#007bff', color: 'white', border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '700', fontSize: '15px', marginTop: '4px' }}>
                            {loading ? '⏳ Calcul en cours...' : '🔮 Estimer le prix'}
                        </button>
                    </div>
                </div>

                {/* ── Résultat ── */}
                <div>
                    {!result && !loading && (
                        <div style={{ background: 'white', borderRadius: '12px', padding: '40px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', textAlign: 'center', color: '#aaa' }}>
                            <div style={{ fontSize: '60px', marginBottom: '15px' }}>🏠</div>
                            <p style={{ fontSize: '15px' }}>Remplissez le formulaire et cliquez sur <strong>Estimer le prix</strong></p>
                        </div>
                    )}

                    {result && (
                        <>
                            {/* Ville détectée */}
                            <div style={{ background: 'white', borderRadius: '12px', padding: '14px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '13px', color: '#555' }}>
                                    📍 Marché détecté : <strong>{result.ville_detectee}</strong>
                                </span>
                                <span style={{ fontSize: '13px', color: '#1a56db', fontWeight: '600' }}>
                                    {Number(result.prix_m2).toLocaleString()} MAD/m²
                                </span>
                            </div>

                            {/* Prix estimé */}
                            <div style={{ background: 'linear-gradient(135deg, #1a56db, #0ea5e9)', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 15px rgba(26,86,219,0.3)', color: 'white', marginBottom: '16px', textAlign: 'center' }}>
                                <div style={{ fontSize: '13px', opacity: 0.85, marginBottom: '8px' }}>PRIX ESTIMÉ</div>
                                <div style={{ fontSize: '38px', fontWeight: '800', marginBottom: '6px' }}>
                                    {Number(result.prix_predit).toLocaleString()} MAD
                                </div>
                                <div style={{ fontSize: '13px', opacity: 0.8 }}>
                                    Fourchette : {Number(result.prix_min).toLocaleString()} — {Number(result.prix_max).toLocaleString()} MAD
                                </div>
                            </div>

                            {/* Qualité */}
                            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '16px' }}>
                                <h3 style={{ margin: '0 0 12px', fontSize: '14px', color: '#555' }}>📊 Fiabilité de l'estimation</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div style={{ flex: 1, background: '#f0f0f0', borderRadius: '10px', height: '12px', overflow: 'hidden' }}>
                                        <div style={{ width: `${result.r2_score}%`, background: '#28a745', height: '100%', borderRadius: '10px' }} />
                                    </div>
                                    <span style={{ fontWeight: '700', color: '#28a745', minWidth: '45px' }}>
                                        {result.r2_score}%
                                    </span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#888', marginTop: '6px' }}>
                                    Basé sur {result.nb_biens_utilises} villes/quartiers du marché marocain
                                </div>
                            </div>

                            {/* Stats marché */}
                            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                                <h3 style={{ margin: '0 0 15px', fontSize: '14px', color: '#555' }}>📈 Marché national (pour {form.surface} m²)</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    {[
                                        { label: 'Prix moyen',  value: result.marche.prix_moyen,  color: '#007bff' },
                                        { label: 'Prix médian', value: result.marche.prix_median, color: '#6f42c1' },
                                        { label: 'Prix min',    value: result.marche.prix_min,    color: '#28a745' },
                                        { label: 'Prix max',    value: result.marche.prix_max,    color: '#dc3545' },
                                    ].map(({ label, value, color }) => (
                                        <div key={label} style={{ background: '#f8f9fa', borderRadius: '8px', padding: '12px', borderLeft: `3px solid ${color}` }}>
                                            <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>{label}</div>
                                            <div style={{ fontWeight: '700', color, fontSize: '14px' }}>
                                                {Number(value).toLocaleString()} MAD
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#555', marginBottom: '6px' };
const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' };