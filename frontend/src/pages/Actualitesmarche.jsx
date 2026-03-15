import { useState, useEffect } from 'react';

const CATEGORIES = [
    { key: 'prix',        label: 'Prix',             color: '#2563eb', bg: '#eff6ff' },
    { key: 'tendances',   label: 'Tendances',         color: '#7c3aed', bg: '#f5f3ff' },
    { key: 'villes',      label: 'Villes',            color: '#059669', bg: '#ecfdf5' },
    { key: 'financement', label: 'Financement',       color: '#d97706', bg: '#fffbeb' },
    { key: 'lois',        label: 'Lois & Fiscalité',  color: '#dc2626', bg: '#fef2f2' },
];

const PAR_CATEGORIE = {
    prix: [
        { id: 1, categorie: 'prix', ville: 'Casablanca', impact: 'positif', titre: 'Les prix à Casablanca atteignent un nouveau record en 2025', resume: 'Le marché casablancais affiche une hausse soutenue. Le quartier Anfa dépasse désormais les 22 000 MAD/m², porté par une forte demande des expatriés et investisseurs étrangers.', detail: 'Le marché immobilier de Casablanca continue sa progression en 2025. Le quartier Anfa, considéré comme le secteur le plus prisé de la métropole, franchit le seuil symbolique des 22 000 MAD/m² pour les appartements haut de gamme. Cette hausse est principalement portée par une demande soutenue des expatriés marocains de retour au pays et des investisseurs étrangers attirés par la stabilité économique du Royaume.\n\nLes quartiers périphériques comme Sidi Maarouf et Bouskoura voient également leurs prix progresser de 8 à 12% sur un an, offrant des alternatives à des prix plus accessibles entre 11 000 et 14 000 MAD/m².\n\nSelon les agents immobiliers locaux, la demande dépasse largement l\'offre disponible, ce qui maintient une pression haussière sur les prix à court terme.', chiffre_cle: '22 000 MAD/m²', photo: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=85' },
        { id: 2, categorie: 'prix', ville: 'Rabat', impact: 'positif', titre: 'Rabat Agdal : la valeur refuge des investisseurs', resume: 'Le quartier Agdal consolide sa position avec des prix stables entre 17 000 et 20 000 MAD/m². La proximité des institutions gouvernementales maintient une demande constante.', detail: 'Le quartier Agdal de Rabat s\'affirme comme la valeur refuge par excellence du marché immobilier de la capitale. Sa proximité avec les ministères, les ambassades et les grandes écoles en fait un secteur où la demande ne faiblit jamais, même en période de ralentissement économique.\n\nLes prix se stabilisent entre 17 000 et 20 000 MAD/m² pour les appartements neufs, avec des pointes à 22 000 MAD/m² pour les résidences de standing avec vue sur les avenues principales. Les maisons individuelles dans le secteur atteignent facilement 3 à 5 millions MAD.\n\nLes investisseurs institutionnels et les fonctionnaires de haut rang constituent le principal vivier d\'acheteurs, garantissant une liquidité permanente sur ce marché.', chiffre_cle: '18 500 MAD/m²', photo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=85' },
        { id: 3, categorie: 'prix', ville: 'Marrakech', impact: 'positif', titre: 'Marrakech : le tourisme booste l\'immobilier de luxe', resume: 'La Palmeraie enregistre des transactions record avec des villas dépassant 5 millions MAD. La demande touristique internationale maintient les prix élevés.', detail: 'Marrakech confirme son statut de destination immobilière internationale avec des transactions record enregistrées en 2025. La Palmeraie, quartier mythique de la ville ocre, voit ses villas s\'arracher à des prix dépassant souvent 5 millions MAD, portées par une clientèle européenne et du Golfe cherchant des résidences secondaires ou des investissements locatifs touristiques.\n\nLe quartier Gueliz, cœur moderne de la ville, enregistre des prix entre 14 000 et 18 000 MAD/m² pour les appartements, tandis que le secteur Hivernage oscille entre 16 000 et 20 000 MAD/m².\n\nLa forte activité touristique génère des rendements locatifs attractifs de 6 à 9% par an pour les biens bien situés, ce qui attire de nombreux investisseurs cherchant un complément de revenus.', chiffre_cle: '+8.3%', photo: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=85' },
        { id: 4, categorie: 'prix', ville: 'Salé', impact: 'neutre', titre: 'Salé : alternative abordable face à la hausse rabatie', resume: 'Face à la flambée des prix à Rabat, Salé attire les primo-accédants avec des prix entre 7 500 et 9 500 MAD/m², soit 40% moins cher que la capitale.', detail: 'La ville de Salé, située en face de Rabat de l\'autre côté du Bouregreg, s\'impose comme l\'alternative naturelle pour les ménages exclus du marché rabati par les prix élevés. Les primo-accédants et les jeunes familles y trouvent des appartements à des tarifs 40% inférieurs à ceux pratiqués dans la capitale.\n\nLes prix oscillent entre 7 500 et 9 500 MAD/m² selon les quartiers, avec des pics à 10 000 MAD/m² dans les nouvelles résidences bien équipées de Sala Al Jadida. La connexion par tramway avec Rabat renforce l\'attractivité de la ville pour les actifs travaillant dans la capitale.\n\nLes projets de développement urbain en cours, notamment le long des berges du Bouregreg, devraient continuer à valoriser le patrimoine immobilier salétain dans les années à venir.', chiffre_cle: '8 500 MAD/m²', photo: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=85' },
        { id: 5, categorie: 'prix', ville: 'Agadir', impact: 'neutre', titre: 'Agadir : stabilité des prix malgré la pression touristique', resume: 'Le marché agadiri affiche une relative stabilité avec des prix entre 9 000 et 13 000 MAD/m². Le bord de mer reste le segment le plus dynamique.', detail: 'Agadir, capitale du Souss et première station balnéaire du Maroc, maintient une stabilité remarquable de ses prix immobiliers malgré une pression touristique croissante. Les appartements en front de mer, très prisés par les retraités européens et les investisseurs locatifs, se négocient entre 11 000 et 15 000 MAD/m².\n\nLes quartiers résidentiels comme Hay Mohammadi et les nouvelles extensions proposent des logements entre 8 000 et 11 000 MAD/m², accessibles aux ménages marocains à revenus intermédiaires.\n\nLe secteur hôtelier en pleine expansion crée indirectement une demande pour les logements du personnel, soutenant les prix des petits appartements dans les quartiers populaires. Les projets de marina et de développement balnéaire programmés à l\'horizon 2027 devraient relancer la dynamique haussière.', chiffre_cle: '11 000 MAD/m²', photo: 'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=85' },
    ],
    tendances: [
        { id: 6, categorie: 'tendances', ville: 'Maroc', impact: 'positif', titre: 'L\'immobilier vert s\'impose dans les nouvelles constructions', resume: 'Les promoteurs marocains intègrent les normes HQE et LEED. Les bâtiments certifiés bénéficient d\'une prime de 10 à 15% sur le marché.', detail: 'La construction durable prend une place croissante dans le paysage immobilier marocain. De plus en plus de promoteurs intègrent les certifications environnementales HQE (Haute Qualité Environnementale) et LEED dans leurs projets, répondant à une demande croissante des entreprises multinationales et des particuliers sensibles aux enjeux écologiques.\n\nLes bâtiments certifiés bénéficient d\'une prime de valeur de 10 à 15% sur le marché par rapport aux constructions conventionnelles. Cette tendance est particulièrement marquée dans le segment de l\'immobilier de bureaux à Casablanca Finance City et dans les résidences haut de gamme.\n\nLe gouvernement marocain accompagne cette transition via des incitations fiscales pour les constructions respectant les normes d\'efficacité énergétique, dans le cadre de la Stratégie Nationale de Développement Durable.', chiffre_cle: '+12% prime verte', photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=85' },
        { id: 7, categorie: 'tendances', ville: 'Casablanca', impact: 'positif', titre: 'Le coworking révolutionne l\'immobilier de bureau', resume: 'Casablanca et Rabat comptent plus de 150 espaces de coworking. Cette tendance transforme la demande en immobilier tertiaire avec des baux plus flexibles.', detail: 'La révolution du travail hybride post-pandémie a profondément transformé le marché de l\'immobilier de bureau au Maroc. Casablanca et Rabat comptent désormais plus de 150 espaces de coworking actifs, un chiffre en multiplication par 5 depuis 2019.\n\nCette tendance pousse les propriétaires de bureaux traditionnels à repenser leurs offres, proposant des baux plus courts (de 3 à 12 mois), des espaces modulables et des services intégrés. Les immeubles de bureaux anciens non rénovés voient leur taux de vacance augmenter, tandis que les espaces modernes et flexibles affichent complet.\n\nLes grandes entreprises réduisent leur surface de bureaux fixes de 20 à 30% en moyenne, préférant combiner quelques postes fixes avec des abonnements coworking pour leurs équipes en télétravail partiel.', chiffre_cle: '150+ espaces', photo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=85' },
        { id: 8, categorie: 'tendances', ville: 'Maroc', impact: 'positif', titre: 'Digitalisation : les transactions immobilières en ligne explosent', resume: 'Plus de 35% des recherches immobilières se font via des plateformes digitales. Les visites virtuelles 3D réduisent le délai de vente de 30%.', detail: 'La transformation digitale du secteur immobilier marocain s\'accélère. Les plateformes comme Mubawab, Avito Immobilier et Sarouty captent désormais plus de 35% des recherches immobilières au Maroc, contre moins de 15% en 2020.\n\nL\'adoption des visites virtuelles 3D représente un tournant majeur : les biens proposant ce service se vendent en moyenne 30% plus rapidement que ceux avec de simples photos. Les promoteurs immobiliers investissent massivement dans ces technologies pour toucher les acheteurs MRE à l\'étranger sans déplacement.\n\nLa signature électronique des compromis de vente, bien qu\'encore en phase d\'expérimentation au Maroc, pourrait révolutionner le processus transactionnel dans les prochaines années. Plusieurs études de notaires ont commencé à tester ces solutions en partenariat avec des fintech marocaines.', chiffre_cle: '35% en ligne', photo: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=85' },
        { id: 9, categorie: 'tendances', ville: 'Maroc', impact: 'neutre', titre: 'Les Marocains du monde : premier investisseur étranger', resume: 'Les MRE représentent 45% des investissements immobiliers étrangers. Casablanca, Rabat et Marrakech restent leurs destinations privilégiées.', detail: 'Les Marocains Résidant à l\'Étranger (MRE) constituent de loin la première source d\'investissement immobilier étranger au Maroc, représentant 45% du total des acquisitions par des non-résidents. Leurs transferts de fonds, dépassant les 100 milliards MAD par an, alimentent significativement le marché immobilier national.\n\nCasablanca reste la destination privilégiée avec 38% des acquisitions MRE, suivie de Rabat (22%) et Marrakech (18%). Les MRE établis en France, Espagne et Italie préfèrent les appartements de standing dans les quartiers résidentiels, avec un budget moyen de 800 000 MAD.\n\nLes périodes estivales voient une accélération des transactions, les MRE profitant de leurs séjours au Maroc pour concrétiser leurs projets immobiliers. Les agences immobilières ont développé des services spécifiques pour accompagner cette clientèle à distance.', chiffre_cle: '45% des MRE', photo: 'https://images.unsplash.com/photo-1464082354059-27db6ce50048?w=800&q=85' },
        { id: 10, categorie: 'tendances', ville: 'Casablanca', impact: 'positif', titre: 'Anfa Park : le nouveau pôle résidentiel premium', resume: 'Le projet Anfa Park transforme l\'ancienne piste de course en éco-quartier mixte avec 10 000 logements et 50 ha d\'espaces verts.', detail: 'Le projet Anfa Park représente l\'une des plus grandes opérations d\'urbanisme de l\'histoire récente de Casablanca. Sur le site de l\'ancienne piste de course hippique, un éco-quartier mixte de 400 hectares est en cours de développement, avec un investissement global estimé à 10 milliards MAD.\n\nLe programme prévoit la construction de 10 000 logements répartis entre résidences haut de gamme, appartements intermédiaires et logements sociaux, dans un esprit de mixité sociale. 50 hectares d\'espaces verts, un parc central, des équipements sportifs et culturels complètent l\'offre.\n\nLes premières livraisons sont attendues pour 2026, avec des prix de lancement entre 15 000 et 25 000 MAD/m² selon les typologies. Le projet intègre des normes environnementales strictes incluant panneaux solaires, récupération des eaux pluviales et mobilité douce.', chiffre_cle: '10 Mds MAD', photo: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&q=85' },
    ],
    villes: [
        { id: 11, categorie: 'villes', ville: 'Fès', impact: 'positif', titre: 'Fès : la médina UNESCO attire les riads de luxe', resume: 'La restauration des riads de la médina génère un marché de niche très porteur. Les prix des riads rénovés atteignent 2 à 5 millions MAD.', detail: 'La médina de Fès, classée au patrimoine mondial de l\'UNESCO, connaît un renouveau immobilier spectaculaire porté par la mode des riads de luxe. Ces maisons traditionnelles à patio central, une fois restaurées aux normes contemporaines tout en préservant leur cachet authentique, atteignent des prix de 2 à 5 millions MAD selon leur superficie et leurs finitions.\n\nDes acheteurs européens, séduits par l\'authenticité de la médina et par des prix encore accessibles comparés aux riads marrakchis, investissent massivement dans la rénovation de ces biens historiques. Les rendements locatifs via des plateformes comme Airbnb peuvent atteindre 8 à 12% annuels pour les riads bien placés.\n\nLa Fondation de Fès et l\'Agence pour la Dédensification et la Réhabilitation de la Médina de Fès (ADER-Fès) accompagnent ces projets en veillant au respect du patrimoine architectural. Un riad entièrement rénové avec 4 chambres peut générer jusqu\'à 150 000 MAD de revenus locatifs annuels.', chiffre_cle: '5 M MAD', photo: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800&q=85' },
        { id: 12, categorie: 'villes', ville: 'Kénitra', impact: 'positif', titre: 'Kénitra : la ville industrielle devient attractive', resume: 'La zone industrielle PSA Peugeot a transformé Kénitra. Les prix résidentiels ont progressé de 20% en 3 ans avec une forte demande pour les appartements neufs.', detail: 'L\'implantation de l\'usine PSA Peugeot Citroën (désormais Stellantis) à Kénitra a radicalement transformé le profil économique et immobilier de la ville. En attirant des milliers d\'emplois directs et indirects, l\'usine a créé une demande immobilière sans précédent pour la cité du Gharb.\n\nLes prix résidentiels ont progressé de 20% en 3 ans, portés par les cadres et ingénieurs de l\'industrie automobile qui cherchent des logements de qualité. Les appartements neufs dans les résidences fermées se négocient entre 9 000 et 12 000 MAD/m², contre 7 000 à 8 000 MAD/m² il y a 3 ans.\n\nLes promoteurs immobiliers ont rapidement répondu à cette demande en lançant plusieurs projets de résidences sécurisées avec piscine et espaces verts. La ville bénéficie également de sa proximité avec Rabat (45 minutes en train) et de son accès à l\'autoroute, renforçant son attractivité résidentielle.', chiffre_cle: '+20% en 3 ans', photo: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=85' },
        { id: 13, categorie: 'villes', ville: 'Témara', impact: 'positif', titre: 'Témara : extension naturelle de Rabat à prix abordable', resume: 'Témara bénéficie du débordement de Rabat et attire fonctionnaires et enseignants. Les prix entre 7 000 et 9 000 MAD/m² en font une alternative sérieuse.', detail: 'Témara, ville satellite de Rabat dont elle est distante de seulement 12 km, bénéficie du débordement naturel de la capitale. Avec des prix immobiliers 40 à 50% inférieurs à ceux de Rabat, elle attire en masse les fonctionnaires, enseignants et employés du secteur privé qui travaillent dans la capitale mais ne peuvent se permettre d\'y habiter.\n\nLes quartiers résidentiels de Témara proposent des appartements entre 7 000 et 9 000 MAD/m², avec des pointes à 10 000 MAD/m² dans les nouvelles résidences proches de l\'axe Rabat-Casablanca. Les villas individuelles, encore accessibles dans certains lotissements, constituent une alternative attractive pour les familles.\n\nLe développement des transports en commun, notamment le projet d\'extension du tramway vers Témara, devrait encore renforcer l\'attractivité de la ville et exercer une pression haussière sur ses prix dans les prochaines années.', chiffre_cle: '8 000 MAD/m²', photo: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=85' },
        { id: 14, categorie: 'villes', ville: 'Tanger', impact: 'positif', titre: 'Tanger : hub stratégique entre l\'Europe et l\'Afrique', resume: 'Tanger attire des investissements massifs grâce à sa position géographique. Les zones résidentielles près du port enregistrent une hausse de 12% par an.', detail: 'Tanger vit une renaissance économique et immobilière sans précédent, portée par sa position géographique stratégique aux portes de l\'Europe et par les investissements massifs réalisés dans ses infrastructures. Le port Tanger Med, premier port d\'Afrique, génère une activité économique considérable qui se répercute directement sur le marché immobilier.\n\nLes prix résidentiels dans les quartiers proches des zones industrielles et du port progressent de 12% par an, soutenus par une demande des cadres des entreprises installées dans les zones franches. Le quartier résidentiel de Malabata, avec sa vue sur le détroit de Gibraltar, affiche des prix entre 12 000 et 16 000 MAD/m².\n\nLa ville attire également des retraités européens séduits par son climat méditerranéen, son coût de vie modéré et sa vie culturelle riche. Ce phénomène crée une demande supplémentaire pour les appartements en bord de mer et les villas avec vue sur le détroit.', chiffre_cle: '+12%/an', photo: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&q=85' },
        { id: 15, categorie: 'villes', ville: 'Meknès', impact: 'neutre', titre: 'Meknès : le marché viticole soutient l\'immobilier rural', resume: 'La région de Meknès connaît un regain d\'intérêt pour les propriétés rurales. Les domaines viticoles attirent des investisseurs nationaux et européens.', detail: 'Meknès, ville impériale au riche patrimoine historique, voit son marché immobilier soutenu par une demande croissante pour les propriétés rurales et agricoles de sa région. Les domaines viticoles du Moyen Atlas, réputés pour produire certains des meilleurs vins marocains, attirent des investisseurs nationaux et européens cherchant un cadre de vie alternatif alliant agriculture et tourisme.\n\nLes prix de l\'immobilier urbain restent relativement modérés à Meknès, avec des appartements entre 7 000 et 10 000 MAD/m² selon les quartiers. Les maisons traditionnelles de la médina, moins touristiques que celles de Fès ou Marrakech, représentent des opportunités d\'investissement à des prix encore accessibles.\n\nLe développement de l\'agrotourisme dans la région crée de nouvelles opportunités pour la rénovation et la valorisation de fermes et de domaines agricoles en gîtes et maisons d\'hôtes haut de gamme.', chiffre_cle: '8 500 MAD/m²', photo: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=85' },
    ],
    financement: [
        { id: 16, categorie: 'financement', ville: 'Maroc', impact: 'positif', titre: 'Bank Al-Maghrib maintient ses taux directeurs favorables', resume: 'Bank Al-Maghrib a maintenu son taux directeur à 2.75%, favorisant des taux hypothécaires compétitifs entre 4.5% et 5.5% pour les ménages.', detail: 'Bank Al-Maghrib a maintenu son taux directeur à 2.75% lors de ses derniers conseils de politique monétaire, une décision qui favorise le maintien de conditions de financement avantageuses pour les ménages souhaitant accéder à la propriété. Cette stabilité monétaire contraste avec la hausse des taux observée dans la zone euro et aux États-Unis.\n\nLes banques marocaines répercutent positivement cette politique en proposant des taux hypothécaires variables entre 4.5% et 5.5% selon les profils des emprunteurs. Pour un crédit de 500 000 MAD sur 20 ans, la mensualité oscille entre 3 100 et 3 400 MAD, un niveau encore accessible pour les ménages à revenus moyens.\n\nLes banques publiques comme le CIH et la Banque Populaire proposent régulièrement des offres promotionnelles avec des taux préférentiels pour certaines catégories de clientèle, notamment les fonctionnaires et les salariés du secteur formel.', chiffre_cle: 'Taux: 4.5-5.5%', photo: 'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=800&q=85' },
        { id: 17, categorie: 'financement', ville: 'Maroc', impact: 'positif', titre: 'Fogarim : extension aux jeunes entrepreneurs', resume: 'Le Fonds de Garantie Fogarim élargit son périmètre aux moins de 35 ans, facilitant l\'accès aux crédits immobiliers sans apport initial.', detail: 'Le Fonds de Garantie pour les revenus irréguliers et modestes (Fogarim) élargit significativement son périmètre d\'intervention en 2025 en intégrant les jeunes entrepreneurs de moins de 35 ans dans ses bénéficiaires. Ce dispositif, géré par la Caisse Centrale de Garantie (CCG), permet d\'obtenir un crédit immobilier sans apport initial, l\'État se portant garant auprès des banques.\n\nConcrètement, un jeune entrepreneur dont les revenus sont difficiles à justifier formellement peut désormais accéder à un crédit allant jusqu\'à 800 000 MAD pour l\'acquisition d\'un logement principal. Le taux de garantie de l\'État couvre 70% du montant du crédit, réduisant considérablement le risque pour les banques partenaires.\n\nDepuis son lancement, le programme Fogarim a permis à plus de 50 000 ménages à revenus modestes et irréguliers d\'accéder à la propriété, avec un taux de sinistralité inférieur aux projections initiales.', chiffre_cle: 'Apport: 0%', photo: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=85' },
        { id: 18, categorie: 'financement', ville: 'Maroc', impact: 'positif', titre: 'Crédit immobilier : les banques assouplissent leurs conditions', resume: 'Les banques marocaines ont revu la durée maximale des crédits à 30 ans. Le taux d\'endettement autorisé passe de 33% à 40% du revenu.', detail: 'Dans un contexte de hausse des prix immobiliers, les principales banques marocaines ont décidé d\'assouplir leurs conditions d\'octroi de crédits immobiliers pour maintenir l\'accès à la propriété pour la classe moyenne. Deux mesures importantes ont été prises simultanément.\n\nPremièrement, la durée maximale des crédits a été portée à 30 ans (contre 25 ans auparavant) pour les primo-accédants de moins de 40 ans. Cette mesure réduit mécaniquement les mensualités mais augmente le coût total du crédit sur la durée.\n\nDeuxièmement, le taux d\'endettement maximum autorisé passe de 33% à 40% du revenu mensuel net, permettant à davantage de ménages d\'être éligibles à un financement. Bank Al-Maghrib surveille néanmoins de près cette évolution pour prévenir un endettement excessif des ménages marocains.', chiffre_cle: '30 ans max', photo: 'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=800&q=85' },
        { id: 19, categorie: 'financement', ville: 'Maroc', impact: 'neutre', titre: 'Finance islamique : la Mourabaha gagne du terrain', resume: 'Les produits de financement halal représentent 8% des crédits immobiliers au Maroc. Umnia Bank enregistre une croissance de 25% de son portefeuille.', detail: 'La finance participative islamique continue sa progression au Maroc, avec les produits de financement immobilier halal représentant désormais 8% du total des crédits immobiliers accordés dans le royaume. Ce chiffre, encore modeste, est en croissance constante depuis l\'autorisation des banques participatives en 2017.\n\nUmnia Bank et BTI Bank, les deux établissements pionniers de la finance islamique au Maroc, enregistrent des croissances annuelles de 25% de leurs portefeuilles de crédits immobiliers Mourabaha. Le principe de la Mourabaha immobilière est simple : la banque achète le bien et le revend à l\'acheteur à un prix majoré, payable en mensualités, sans intérêts au sens conventionnel.\n\nLa demande provient principalement de ménages soucieux de respecter les principes islamiques dans leurs transactions financières. Le coût final d\'une Mourabaha reste comparable à celui d\'un crédit conventionnel, ce qui lève progressivement les réticences des potentiels clients.', chiffre_cle: '8% du marché', photo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=85' },
    ],
    lois: [
        { id: 20, categorie: 'lois', ville: 'Maroc', impact: 'positif', titre: 'Réforme fiscale : réduction des droits d\'enregistrement', resume: 'Le gouvernement a réduit les droits d\'enregistrement de 4% à 3% pour les primo-accédants, stimulant les transactions immobilières.', detail: 'Dans le cadre de la réforme fiscale progressive engagée par le gouvernement marocain, les droits d\'enregistrement applicables aux transactions immobilières pour les primo-accédants ont été réduits de 4% à 3% du prix de vente. Cette mesure, entrée en vigueur suite à la loi de finances, vise à faciliter l\'accès à la propriété pour les ménages qui acquièrent leur première résidence principale.\n\nConcrètement, pour l\'achat d\'un appartement à 600 000 MAD, l\'économie réalisée est de 6 000 MAD, ce qui peut représenter une aide significative pour les primo-accédants disposant d\'un budget serré. Les notaires ont enregistré une hausse de 15% des transactions dans les semaines suivant l\'entrée en vigueur de la mesure.\n\nLe gouvernement étudie également la possibilité d\'exonérer totalement de droits d\'enregistrement les logements sociaux de moins de 250 000 MAD, une mesure qui pourrait bénéficier à plusieurs centaines de milliers de ménages à revenus modestes.', chiffre_cle: '3% (vs 4%)', photo: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=85' },
        { id: 21, categorie: 'lois', ville: 'Maroc', impact: 'positif', titre: 'Nouvelle loi copropriété : protection renforcée des acquéreurs', resume: 'La loi 18-00 a été révisée. Les garanties d\'achèvement obligatoires et les pénalités de retard renforcent la confiance des acheteurs sur plan.', detail: 'La révision de la loi 18-00 sur la copropriété représente une avancée majeure pour la protection des acquéreurs immobiliers au Maroc. Les scandales de promoteurs ayant encaissé les acomptes des acheteurs sans livrer les logements promis ont motivé ce renforcement du cadre légal.\n\nLes principales nouveautés incluent : l\'obligation pour tout promoteur de souscrire une garantie d\'achèvement auprès d\'un établissement bancaire avant de commercialiser des logements sur plan, des pénalités de retard de livraison portées à 1% du prix de vente par mois de retard, et un plafonnement des acomptes à 30% du prix avant obtention du permis de construire.\n\nCes mesures, longtemps réclamées par les associations de consommateurs, devraient restaurer la confiance des acheteurs dans l\'immobilier sur plan et relancer ce segment important du marché. Les professionnels sérieux du secteur voient dans cette loi une opportunité de se démarquer des opérateurs peu scrupuleux.', chiffre_cle: 'Loi 18-00', photo: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=85' },
        { id: 22, categorie: 'lois', ville: 'Maroc', impact: 'neutre', titre: 'Lutte contre le blanchiment : traçabilité imposée', resume: 'Les nouvelles règles CNRP imposent la déclaration des transactions dépassant 300 000 MAD. Les notaires doivent vérifier l\'origine des fonds.', detail: 'Le Maroc renforce son arsenal légal contre le blanchiment de capitaux dans le secteur immobilier, conformément aux recommandations du Groupe d\'Action Financière (GAFI). Les nouvelles règles de la Chambre Nationale des Notaires du Royaume (CNRR) imposent des obligations de vigilance renforcées pour toutes les transactions immobilières dépassant 300 000 MAD.\n\nConcrètement, les notaires doivent désormais vérifier systématiquement l\'origine des fonds pour les transactions importantes, conserver les justificatifs pendant 10 ans et déclarer toute transaction suspecte à l\'Unité de Traitement du Renseignement Financier (UTRF). Les agents immobiliers sont soumis aux mêmes obligations pour les transactions qu\'ils accompagnent.\n\nCes mesures pourraient ralentir certaines transactions complexes mais visent à assainir un marché immobilier où une part non négligeable des transactions se faisait jusqu\'à présent en espèces, échappant à tout contrôle fiscal et réglementaire.', chiffre_cle: '+300 000 MAD', photo: 'https://images.unsplash.com/photo-1575505586569-646b2ca898fc?w=800&q=85' },
        { id: 23, categorie: 'lois', ville: 'Maroc', impact: 'positif', titre: 'Logement social 250 000 DH reconduit jusqu\'en 2026', resume: 'L\'État a prolongé le programme de logement social. Plus de 120 000 ménages en ont bénéficié avec une TVA réduite à 10%.', detail: 'Le programme de logement social à 250 000 dirhams, pierre angulaire de la politique du logement au Maroc depuis 2010, a été reconduit jusqu\'en 2026 par le gouvernement. Ce dispositif permet aux ménages à revenus modestes d\'accéder à la propriété grâce à une TVA réduite à 10% (contre 20% pour les logements standards) et des aides directes de l\'État aux promoteurs.\n\nDepuis son lancement, plus de 120 000 logements ont été livrés dans ce cadre, bénéficiant à autant de ménages qui n\'auraient jamais pu accéder à la propriété sans ce soutien public. Les unités sont généralement des appartements de 2 à 3 pièces d\'une superficie de 50 à 80 m², situés dans des zones périurbaines.\n\nLe programme fait face à des critiques concernant la qualité de certaines constructions et l\'éloignement des sites par rapport aux bassins d\'emploi. Le gouvernement travaille à une révision du dispositif pour 2027, avec des critères de qualité renforcés et une meilleure intégration urbaine des nouveaux ensembles.', chiffre_cle: '250 000 DH', photo: 'https://images.unsplash.com/photo-1459767129954-1b1c1f9b9ace?w=800&q=85' },
    ],
};

function getAllArticles() {
    return Object.values(PAR_CATEGORIE).flat();
}

function getActualitesDuJour() {
    const now  = new Date();
    const seed = now.getHours();
    const result = [];
    Object.values(PAR_CATEGORIE).forEach(liste => {
        const start = seed % liste.length;
        result.push(liste[start]);
        result.push(liste[(start + 1) % liste.length]);
    });
    return result;
}

const impactBadge = {
    positif: { label: '↑ Hausse',  bg: '#dcfce7', color: '#166534' },
    negatif: { label: '↓ Baisse',  bg: '#fee2e2', color: '#991b1b' },
    neutre:  { label: '→ Stable',  bg: '#fef9c3', color: '#854d0e' },
};

// ── Modal détail article ───────────────────────────────────────────────────────
function ModalArticle({ article, onClose }) {
    if (!article) return null;
    const cat   = CATEGORIES.find(c => c.key === article.categorie);
    const badge = impactBadge[article.impact];

    useEffect(() => {
        const handleKey = e => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    return (
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}>
            <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '16px', maxWidth: '750px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>

                {/* Photo header */}
                <div style={{ position: 'relative', height: '280px' }}>
                    <img src={article.photo} alt={article.titre} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display = 'none'} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />

                    {/* Bouton fermer */}
                    <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>✕</button>

                    {/* Badges sur photo */}
                    <div style={{ position: 'absolute', bottom: '15px', left: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {cat && <span style={{ background: cat.color, color: 'white', padding: '5px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '700', fontFamily: 'sans-serif' }}>{cat.label}</span>}
                        <span style={{ background: badge?.bg, color: badge?.color, padding: '5px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: '700', fontFamily: 'sans-serif' }}>{badge?.label}</span>
                    </div>
                </div>

                {/* Contenu */}
                <div style={{ padding: '30px' }}>

                    {/* Titre */}
                    <h2 style={{ margin: '0 0 12px', fontSize: '22px', color: '#0f172a', lineHeight: '1.35', fontFamily: 'Georgia, serif', fontWeight: '700' }}>
                        {article.titre}
                    </h2>

                    {/* Meta */}
                    <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13px', color: '#64748b', fontFamily: 'sans-serif' }}>📍 {article.ville}</span>
                        <span style={{ fontSize: '13px', color: '#64748b', fontFamily: 'sans-serif' }}>🗂️ {cat?.label}</span>
                    </div>

                    {/* Chiffre clé */}
                    <div style={{ background: cat ? cat.bg : '#f1f5f9', border: `1px solid ${cat ? cat.color + '30' : '#e2e8f0'}`, borderRadius: '10px', padding: '16px 20px', marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div>
                            <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'sans-serif', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Chiffre clé</div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: cat?.color || '#2563eb', fontFamily: 'sans-serif' }}>{article.chiffre_cle}</div>
                        </div>
                    </div>

                    {/* Résumé */}
                    <div style={{ marginBottom: '18px' }}>
                        <h3 style={{ margin: '0 0 8px', fontSize: '14px', color: '#94a3b8', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Résumé</h3>
                        <p style={{ margin: 0, fontSize: '15px', color: '#374151', lineHeight: '1.7', fontFamily: 'Georgia, serif', fontWeight: '500' }}>
                            {article.resume}
                        </p>
                    </div>

                    {/* Détail complet */}
                    <div>
                        <h3 style={{ margin: '0 0 8px', fontSize: '14px', color: '#94a3b8', fontFamily: 'sans-serif', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '600' }}>Analyse complète</h3>
                        {article.detail.split('\n\n').map((para, i) => (
                            <p key={i} style={{ margin: '0 0 14px', fontSize: '14px', color: '#4b5563', lineHeight: '1.8', fontFamily: 'sans-serif' }}>
                                {para}
                            </p>
                        ))}
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'sans-serif' }}>
                            📊 Données basées sur le marché marocain 2024-2025
                        </span>
                        <button onClick={onClose} style={{ padding: '8px 20px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: 'sans-serif', fontWeight: '600', fontSize: '13px' }}>
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Page principale ────────────────────────────────────────────────────────────
export default function ActualitesMarche() {
    const [actualites, setActualites]         = useState([]);
    const [lastUpdate, setLastUpdate]         = useState(null);
    const [activeCategory, setActiveCategory] = useState('tous');
    const [featured, setFeatured]             = useState(null);
    const [modalArticle, setModalArticle]     = useState(null);

    const charger = () => {
        const data = getActualitesDuJour();
        setActualites(data);
        setFeatured(data[0]);
        setLastUpdate(new Date());
    };

    useEffect(() => {
        charger();
        const interval = setInterval(charger, 60 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    const filtered = activeCategory === 'tous'
        ? actualites
        : actualites.filter(a => a.categorie === activeCategory);

    const dateStr = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div style={{ background: '#f8f9fb', minHeight: '100vh', fontFamily: "'Georgia', serif" }}>

            {/* Modal */}
            {modalArticle && <ModalArticle article={modalArticle} onClose={() => setModalArticle(null)} />}

            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', padding: '35px 40px 30px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '400px', height: '100%', background: 'radial-gradient(circle at 70% 50%, rgba(37,99,235,0.3) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span style={{ background: '#2563eb', color: 'white', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', letterSpacing: '1px', fontFamily: 'sans-serif' }}>🇲🇦 MAROC IMMO</span>
                            {lastUpdate && <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontFamily: 'sans-serif' }}>Mis à jour à {lastUpdate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>}
                        </div>
                        <h1 style={{ margin: 0, color: 'white', fontSize: '28px', fontWeight: '700' }}>Actualités du Marché Immobilier</h1>
                        <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.55)', fontSize: '14px', fontFamily: 'sans-serif', textTransform: 'capitalize' }}>{dateStr}</p>
                    </div>
                    <button onClick={charger} style={{ padding: '10px 22px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', cursor: 'pointer', fontFamily: 'sans-serif', fontWeight: '600', fontSize: '13px' }}>
                        🔄 Actualiser
                    </button>
                </div>
            </div>

            <div style={{ padding: '30px 40px' }}>

                {/* Article vedette */}
                {featured && (
                    <div onClick={() => setModalArticle(featured)}
                        style={{ marginBottom: '35px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'white', cursor: 'pointer', transition: 'transform 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ position: 'relative', minHeight: '260px' }}>
                            <img src={featured.photo} alt={featured.titre} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => e.target.style.display = 'none'} />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.3), transparent)' }} />
                        </div>
                        <div style={{ padding: '35px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '14px' }}>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ background: '#0f172a', color: 'white', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', fontFamily: 'sans-serif' }}>À LA UNE</span>
                                {(() => { const cat = CATEGORIES.find(c => c.key === featured.categorie); return cat ? <span style={{ background: cat.bg, color: cat.color, padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: '600', fontFamily: 'sans-serif' }}>{cat.label}</span> : null; })()}
                            </div>
                            <h2 style={{ margin: 0, fontSize: '22px', color: '#0f172a', lineHeight: '1.35', fontWeight: '700' }}>{featured.titre}</h2>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '14px', lineHeight: '1.7', fontFamily: 'sans-serif' }}>{featured.resume}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span style={{ fontSize: '28px', fontWeight: '800', color: '#2563eb', fontFamily: 'sans-serif' }}>{featured.chiffre_cle}</span>
                                <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', fontFamily: 'sans-serif', background: impactBadge[featured.impact]?.bg, color: impactBadge[featured.impact]?.color }}>{impactBadge[featured.impact]?.label}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'sans-serif' }}>📍 {featured.ville}</span>
                                <span style={{ fontSize: '12px', color: '#2563eb', fontFamily: 'sans-serif', fontWeight: '600' }}>→ Cliquer pour lire l'analyse complète</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filtres */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '25px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontFamily: 'sans-serif', marginRight: '4px' }}>Filtrer :</span>
                    {[{ key: 'tous', label: 'Tous', color: '#0f172a' }, ...CATEGORIES].map(cat => (
                        <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
                            style={{ padding: '7px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontFamily: 'sans-serif', fontWeight: '600', fontSize: '13px', background: activeCategory === cat.key ? cat.color : '#f1f5f9', color: activeCategory === cat.key ? 'white' : '#475569', transition: 'all 0.15s' }}>
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Grille */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '22px' }}>
                    {filtered.map((actu) => {
                        const cat   = CATEGORIES.find(c => c.key === actu.categorie);
                        const badge = impactBadge[actu.impact];
                        return (
                            <article key={actu.id} onClick={() => setModalArticle(actu)}
                                style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.07)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.07)'; }}>
                                <div style={{ position: 'relative', height: '180px', overflow: 'hidden', background: cat?.bg || '#f1f5f9' }}>
                                    <img src={actu.photo} alt={actu.titre} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                                        onError={e => e.target.style.display = 'none'}
                                        onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                                        onMouseLeave={e => e.target.style.transform = 'scale(1)'} />
                                    <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                                        <span style={{ background: cat?.color || '#6b7280', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', fontFamily: 'sans-serif' }}>{cat?.label}</span>
                                    </div>
                                    <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', color: 'white', padding: '5px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '800', fontFamily: 'sans-serif' }}>{actu.chiffre_cle}</div>
                                </div>
                                <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', lineHeight: '1.4', fontWeight: '700' }}>{actu.titre}</h3>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.6', fontFamily: 'sans-serif', flex: 1 }}>{actu.resume.length > 110 ? actu.resume.slice(0, 110) + '...' : actu.resume}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                                        <span style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'sans-serif' }}>📍 {actu.ville}</span>
                                        <span style={{ fontSize: '12px', color: '#2563eb', fontFamily: 'sans-serif', fontWeight: '600' }}>Lire →</span>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>

                <p style={{ textAlign: 'center', marginTop: '35px', fontSize: '12px', color: '#cbd5e1', fontFamily: 'sans-serif' }}>
                    📊 Cliquer sur un article pour lire l'analyse complète · Rotation automatique toutes les heures
                </p>
            </div>
        </div>
    );
}