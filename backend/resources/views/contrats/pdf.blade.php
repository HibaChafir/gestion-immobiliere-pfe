<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Contrat #{{ str_pad($contrat->id_contrat, 5, '0', STR_PAD_LEFT) }}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Georgia', serif;
      font-size: 13px;
      color: #0f1e35;
      padding: 50px;
      background: white;
    }

    /* ── Header ── */
    .header {
      text-align: center;
      margin-bottom: 36px;
      padding-bottom: 24px;
      border-bottom: 2px solid #c8a96e;
      position: relative;
    }
    .header-brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin-bottom: 16px;
    }
    .header-brand-icon {
      width: 40px; height: 40px;
      border-radius: 10px;
      background: #0f1e35;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid rgba(200,169,110,0.3);
    }
    .header-brand-name {
      font-size: 22px;
      font-weight: 700;
      color: #0f1e35;
      letter-spacing: 3px;
      text-transform: uppercase;
    }
    .header-brand-sub {
      font-size: 8px;
      color: rgba(200,169,110,0.8);
      letter-spacing: 4px;
      text-transform: uppercase;
      font-family: Arial, sans-serif;
      display: block;
      margin-top: 2px;
    }
    .header h1 {
      font-size: 13px;
      color: #9ca3af;
      letter-spacing: 4px;
      text-transform: uppercase;
      font-family: Arial, sans-serif;
      font-weight: 400;
    }
    .header-line {
      width: 40px;
      height: 1px;
      background: #c8a96e;
      margin: 12px auto;
    }

    /* ── Ref bar ── */
    .ref-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0f1e35;
      border-radius: 10px;
      padding: 14px 22px;
      margin-bottom: 30px;
    }
    .ref-bar span {
      font-family: Arial, sans-serif;
      font-size: 10px;
      color: rgba(200,169,110,0.7);
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .ref-bar strong {
      color: white;
      font-size: 12px;
    }

    /* ── Statut badge ── */
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 99px;
      font-family: Arial, sans-serif;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .badge-signe_complet { background: rgba(5,150,105,0.1);  color: #065f46; border: 1px solid rgba(5,150,105,0.25); }
    .badge-signe_vendeur { background: rgba(180,83,9,0.08);  color: #b45309; border: 1px solid rgba(180,83,9,0.2);   }
    .badge-en_attente    { background: rgba(109,40,217,0.08); color: #6d28d9; border: 1px solid rgba(109,40,217,0.2);}
    .badge-signe         { background: rgba(200,169,110,0.1); color: #c8a96e; border: 1px solid rgba(200,169,110,0.3);}

    /* ── Section ── */
    .section {
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 9px;
      color: #c8a96e;
      letter-spacing: 3px;
      text-transform: uppercase;
      font-family: Arial, sans-serif;
      border-left: 2px solid #c8a96e;
      padding-left: 10px;
      margin-bottom: 12px;
      font-weight: 700;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    table td {
      padding: 10px 14px;
      border: 1px solid rgba(200,169,110,0.12);
      font-family: Arial, sans-serif;
      font-size: 12px;
      color: #0f1e35;
    }
    table td:first-child {
      font-weight: 700;
      background: #fdfcfa;
      width: 32%;
      color: #9ca3af;
      font-size: 9px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .montant-row td:last-child {
      font-size: 16px;
      font-weight: 700;
      color: #065f46;
      font-family: 'Georgia', serif;
    }

    /* ── Signatures ── */
    .sig-row {
      display: flex;
      gap: 20px;
      margin-top: 8px;
    }
    .sig-box {
      flex: 1;
      border: 1px solid rgba(200,169,110,0.2);
      border-radius: 10px;
      padding: 20px;
      text-align: center;
      background: #fdfcfa;
    }
    .sig-box h3 {
      font-size: 9px;
      color: #9ca3af;
      margin-bottom: 14px;
      font-family: Arial, sans-serif;
      letter-spacing: 2px;
      text-transform: uppercase;
      font-weight: 700;
    }
    .sig-box img {
      width: 200px;
      height: 70px;
      object-fit: contain;
    }
    .sig-empty {
      color: #c4bfb8;
      font-size: 12px;
      padding: 24px 0;
      font-family: Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .sig-dot {
      width: 5px; height: 5px;
      border-radius: 50%;
      background: #e5e7eb;
      display: inline-block;
    }

    /* ── Footer ── */
    .footer {
      margin-top: 50px;
      background: #0f1e35;
      border-radius: 10px;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .footer-brand {
      font-size: 13px;
      font-weight: 700;
      color: rgba(200,169,110,0.8);
      letter-spacing: 2px;
      text-transform: uppercase;
    }
    .footer-text {
      font-size: 10px;
      color: rgba(255,255,255,0.25);
      font-family: Arial, sans-serif;
      letter-spacing: 0.5px;
      text-align: right;
    }

    @media print {
      body { padding: 24px; }
      .footer { break-inside: avoid; }
    }
  </style>
</head>
<body>

  <!-- ══ HEADER ══ -->
  <div class="header">
    <div class="header-brand">
      <div class="header-brand-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8a96e" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </div>
      <div>
        <span class="header-brand-name">ImmoExpert</span>
        <span class="header-brand-sub">Maroc</span>
      </div>
    </div>
    <div class="header-line"></div>
    <h1>Contrat Immobilier Officiel</h1>
  </div>

  <!-- ══ REF BAR ══ -->
  <div class="ref-bar">
    <span>Référence : <strong>#{{ str_pad($contrat->id_contrat, 5, '0', STR_PAD_LEFT) }}</strong></span>
    <span>Date : <strong>{{ \Carbon\Carbon::parse($contrat->date_contrat)->format('d M Y') }}</strong></span>
    <span>Statut :
      @php
        $labels = [
          'signe_complet' => 'Signé complet',
          'signe_vendeur' => 'Signé vendeur',
          'en_attente'    => 'En attente',
          'signe'         => 'Signé',
        ];
      @endphp
      <span class="badge badge-{{ $contrat->statut }}">
        {{ $labels[$contrat->statut] ?? $contrat->statut }}
      </span>
    </span>
  </div>

  <!-- ══ BIEN ══ -->
  <div class="section">
    <div class="section-title">Bien Immobilier</div>
    <table>
      <tr><td>Titre</td><td>{{ $contrat->bien->titre ?? '—' }}</td></tr>
      <tr><td>Type</td><td>{{ ucfirst($contrat->bien->type_bien ?? '—') }}</td></tr>
      <tr><td>Surface</td><td>{{ $contrat->bien->surface ?? '—' }} m²</td></tr>
      <tr><td>Pièces</td><td>{{ $contrat->bien->nb_pieces ?? '—' }}</td></tr>
      <tr><td>Adresse</td><td>{{ $contrat->bien->adresse ?? '—' }}</td></tr>
      <tr class="montant-row"><td>Montant</td><td>{{ number_format($contrat->montant, 0, ',', ' ') }} MAD</td></tr>
    </table>
  </div>

  <!-- ══ VENDEUR ══ -->
  <div class="section">
    <div class="section-title">Vendeur / Propriétaire</div>
    <table>
      <tr><td>Nom complet</td><td>{{ $contrat->vendeur->prenom ?? '' }} {{ $contrat->vendeur->nom ?? '—' }}</td></tr>
      <tr><td>Email</td><td>{{ $contrat->vendeur->email ?? '—' }}</td></tr>
      <tr><td>Téléphone</td><td>{{ $contrat->vendeur->telephone ?? '—' }}</td></tr>
    </table>
  </div>

  <!-- ══ ACHETEUR ══ -->
  <div class="section">
    <div class="section-title">Acheteur / Locataire</div>
    <table>
      <tr><td>Nom complet</td><td>{{ $contrat->acheteur->prenom ?? '' }} {{ $contrat->acheteur->nom ?? '—' }}</td></tr>
      <tr><td>Email</td><td>{{ $contrat->acheteur->email ?? '—' }}</td></tr>
      <tr><td>Téléphone</td><td>{{ $contrat->acheteur->telephone ?? '—' }}</td></tr>
    </table>
  </div>

  <!-- ══ SIGNATURES ══ -->
  <div class="section">
    <div class="section-title">Signatures Électroniques</div>
    <div class="sig-row">
      <div class="sig-box">
        <h3>Signature Vendeur</h3>
        @if($contrat->signature_vendeur)
          <img src="{{ $contrat->signature_vendeur }}" alt="Signature vendeur" />
        @else
          <div class="sig-empty">
            <span class="sig-dot"></span>
            Non signé
          </div>
        @endif
      </div>
      <div class="sig-box">
        <h3>Signature Acheteur</h3>
        @if($contrat->signature_acheteur)
          <img src="{{ $contrat->signature_acheteur }}" alt="Signature acheteur" />
        @else
          <div class="sig-empty">
            <span class="sig-dot"></span>
            Non signé
          </div>
        @endif
      </div>
    </div>
  </div>

  <!-- ══ FOOTER ══ -->
  <div class="footer">
    <span class="footer-brand">ImmoExpert</span>
    <div class="footer-text">
      Généré le {{ now()->format('d M Y') }} à {{ now()->format('H:i') }}<br>
      Document officiel — ImmoExpert © 2026
    </div>
  </div>

</body>
</html>