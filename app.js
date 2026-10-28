/* ============================================================
   Compta+ v6.0 — Firebase + Tableau de bord + Graphes + État de l'avoir
   ============================================================ */

const state = {
  user: null, company: null, transactions: [], theme: 'jour',
  view: 'dashboard', stmtTab: 'bilan', exercice: null,
  ready: false, currentUid: null, charts: {}
};

let txUnsub = null, profileUnsub = null;

/* ============================================================
   PLAN COMPTABLE HAÏTIEN — 5 CLASSES
   ============================================================ */
const PLAN_COMPTABLE = {
  '10': 'Caisse',
  '101': 'Caisse Siège Social', '102': 'Caisse Succursale A', '103': 'Caisse Succursale B', '109': 'Petite Caisse',
  '11': 'Banque',
  '111': 'Banque Haïti', '1111': 'Banque Siège Social', '1112': 'Banque Succursale A', '1113': 'Banque Succursale B',
  '112': 'Banque étrangère', '1121': 'Banque Pays A', '1122': 'Banque Pays B',
  '12': 'Placements temporaires',
  '121': 'Actions (court terme)', '122': 'Obligations (court terme)', '123': 'Bons du Trésor',
  '124': 'Certificats de dépôts', '125': 'Autres valeurs mobilières',
  '13': 'Créances à court terme',
  '131': 'Clients', '1311': 'Clients à Haïti', '1312': 'Clients à l\'étranger',
  '132': 'Effets à recevoir', '133': 'Fournisseur débiteur',
  '1331': 'Fournisseurs – Avances commandes', '1332': 'Fournisseurs – Créances emballages',
  '1333': 'Rabais, remises et escomptes à recevoir',
  '134': 'Comptes courants', '139': 'Provisions pour mauvaises créances',
  '14': 'Avance au personnel', '141': 'Avance aux employés', '142': 'Avance aux dirigeants',
  '15': 'Stocks',
  '150': 'Stock de marchandises', '151': 'Marchandises A', '152': 'Marchandises B',
  '153': 'Stock de produits finis', '154': 'Stock de produits en cours', '155': 'Matières premières',
  '156': 'Fournitures',
  '1561': 'Combustibles', '1562': 'Produits d\'entretien', '1563': 'Fournitures ateliers',
  '1564': 'Fournitures de magasin', '1565': 'Fournitures de bureau',
  '157': 'Emballages', '158': 'Déchets et rebuts', '159': 'Marchandises en transit',
  '16': 'Débiteurs divers',
  '161': 'Créances sur cessions d\'immobilisations', '162': 'Créances sur cessions valeurs mobilières',
  '163': 'Autres comptes débiteurs', '164': 'Garantie droits de douane', '165': 'Garantie droits consulaires',
  '166': 'Réclamation à recevoir', '167': 'Avance à régulariser', '168': 'T.C.A. à récupérer',
  '17': 'Frais payés d\'avance',
  '171': 'Assurance payée d\'avance', '172': 'Loyer payé d\'avance', '173': 'Impôts fonciers',
  '174': 'Impôts forfaitaires', '175': 'Patente et autres taxes payées d\'avance',
  '18': 'Immobilisations',
  '181': 'Titres de participation', '182': 'Dépôts et cautionnement', '183': 'Terrains',
  '184': 'Immeubles', '185': 'Équipements',
  '1851': 'Machine et outillage industriel', '1852': 'Machine et outillage agricole',
  '1853': 'Équipement d\'emballage', '1854': 'Matériel de transport',
  '186': 'Matériels de bureau',
  '187': 'Immobilisations incorporelles',
  '1871': 'Frais d\'établissement', '1872': 'Brevets d\'invention', '1873': 'Frais de recherche et développement',
  '1874': 'Concessions, marques, licences', '1875': 'Achalandage',
  '188': 'Autres valeurs actives', '1881': 'Constructions en cours', '1882': 'Immobilisations animales',
  '19': 'Amortissements accumulés',
  '191': 'Amortissement – Immeubles', '192': 'Amortissement – Équipements',
  '193': 'Amortissement – Matériels de bureau', '194': 'Amortissement – Autres valeurs',

  '20': 'Impôts et taxes à payer', '200': 'Découvert bancaire',
  '201': 'Impôts sur le bénéfice à payer', '202': 'Impôts fonciers à payer',
  '203': 'Taxe sur dividende à payer', '204': 'Taxe sur action à payer',
  '205': 'T.C.A. à payer', '206': 'Taxes et obligations sur salaire',
  '2061': 'IRI', '2062': 'Solidarité', '2063': 'TLE', '2064': 'CAU',
  '2065': 'Taxe d\'apprentissage', '2066': 'ONA',
  '21': 'Fournisseurs et comptes rattachés',
  '210': 'Fournisseurs d\'approvisionnements', '2100': 'Fournisseurs locaux',
  '2101': 'Fournisseurs étrangers', '2103': 'Retenues de garantie',
  '211': 'Fournisseurs d\'immobilisations',
  '212': 'Clients créditeurs',
  '2121': 'Clients – Avances et acomptes reçus', '2122': 'Clients – Dettes emballages consignés',
  '2123': 'Rabais, remises et escomptes à accorder',
  '213': 'Main d\'œuvre à payer', '214': 'Salaire à payer', '215': 'Boni à payer', '216': 'Congé à payer',
  '22': 'Prêts à payer',
  '220': 'Prêts court terme en gourdes', '221': 'Prêts court terme en devises',
  '23': 'Dettes à long terme',
  '230': 'Dettes LT en gourdes', '231': 'Dettes LT en devises',
  '232': 'Obligations à payer', '233': 'Hypothèques à payer', '234': 'Indemnités de retraite',
  '235': 'Actionnaires compte de prêts',
  '28': 'Diverses charges à payer',
  '281': 'Dividendes à payer', '2811': 'Dividendes actions ordinaires', '2812': 'Dividendes actions privilégiées',
  '282': 'Intérêts à payer', '283': 'Revenus reportés (non gagnés)',

  '30': 'Capital',
  '301': 'Capital individuel (EI)', '302': 'Capital social (ENC)',
  '303': 'Capital – Actions privilégiées', '304': 'Capital – Actions ordinaires',
  '305': 'Surplus d\'apport', '306': 'Surplus – Terrain reçu à titre gratuit',
  '35': 'Compte de l\'Exploitant',
  '350': 'Opérations courantes', '351': 'Rémunérations', '352': 'Impôts personnels',
  '36': 'Bénéfices non répartis',
  '360': 'Bénéfices non répartis (créditeur)', '361': 'Bénéfices non répartis (débiteur)',
  '37': 'Réserves',
  '370': 'Réserves statutaires', '371': 'Réserve légale', '372': 'Réserves réglementées',
  '39': 'Sommaire des revenus et dépenses',
  '390': 'Bénéfice net de l\'exercice', '391': 'Perte nette de l\'exercice',

  '40': 'Ventes de marchandises',
  '400': 'Vente de marchandises', '401': 'Marchandises A', '402': 'Marchandises B',
  '406': 'Vente d\'emballages récupérables', '409': 'Rendus, rabais, remises accordés',
  '41': 'Production vendue et prestations de services',
  '410': 'Prestation de services', '411': 'Production vendue',
  '4111': 'Vente à crédit', '4112': 'Vente à l\'étranger',
  '412': 'Divers', '4120': 'Revenus de services (personnel)', '4121': 'Locations diverses', '4129': 'Autres',
  '416': 'Ventes d\'emballages récupérables', '419': 'Rabais, remises et escomptes accordés',
  '42': 'Autres revenus',
  '420': 'Revenus financiers', '4201': 'Revenus de participation', '4203': 'Revenus valeurs mobilières',
  '4205': 'Gains de change', '42051': 'Sur opérations courantes', '42052': 'Sur opérations en capital',
  '4207': 'Autres revenus financiers',
  '421': 'Autres revenus', '4210': 'Redevances concessions, brevets, licences', '4211': 'Quote part opérations communes',
  '43': 'Revenus extraordinaires',
  '431': 'Revenus extra. gestion', '434': 'Revenus extra. exercices antérieurs',
  '435': 'Revenus des cessions d\'actifs', '4351': 'Immobilisations corporelles',
  '4352': 'Immobilisations incorporelles', '4355': 'Immobilisations financières', '4358': 'Autres éléments d\'actif',
  '437': 'Autres revenus extra. en capital',

  '50': 'Achats de stocks',
  '501': 'Achats d\'approvisionnements', '502': 'Achats d\'autres approvisionnements',
  '5021': 'Matières consommables', '5025': 'Emballages',
  '50251': 'Emballages perdus', '50252': 'Emballages récupérables non identifiables', '50253': 'Emballages à usage mixte',
  '507': 'Achats de marchandises', '5071': 'Marchandises A', '5072': 'Marchandises B',
  '508': 'Frais accessoires d\'achat', '509': 'Rabais, remises et escomptes obtenus',
  '51': 'Marchandises vendues', '510': 'Marchandises', '511': 'Produits finis', '516': 'Emballages récupérables vendus',
  '52': 'Frais de vente',
  '520': 'Salaires vendeurs', '521': 'Publicité et promotion', '522': 'Livraison', '523': 'Entretien',
  '524': 'Amortissement (frais de vente)', '525': 'Loyer – Services des ventes',
  '53': 'Frais d\'administration',
  '530': 'Salaires administrateurs', '5301': 'Siège social', '5302': 'Succursale A', '5303': 'Succursale B',
  '531': 'Impôts et taxes divers', '532': 'Amortissement', '533': 'Assurances',
  '536': 'Fournitures de bureau utilisées',
  '537': 'Autres frais d\'administration', '5371': 'Téléphone', '5372': 'Électricité', '5373': 'Loyer',
  '538': 'Frais divers',
  '54': 'Autres frais',
  '541': 'Frais financiers', '5410': 'Intérêts', '5415': 'Pertes de change',
  '542': 'Autres frais', '5421': 'Redevances concessions', '5422': 'Quote part opérations communes',
  '55': 'Impôts sur le revenu', '551': 'Revenu ordinaire', '552': 'Revenu extraordinaire',
  '56': 'Pertes extraordinaires',
  '561': 'Pertes extra. gestion', '564': 'Pertes extra. exercices antérieurs',
  '565': 'Pertes des cessions d\'actifs', '5651': 'Immobilisations corporelles',
  '5652': 'Immobilisations incorporelles', '5655': 'Immobilisations financières', '5658': 'Autres éléments d\'actif',
  '567': 'Autres pertes extra. en capital',
  '59': 'Comptabilité analytique',
  '590': 'Coûts directs', '591': 'Coûts indirects', '592': 'Coût des produits manufacturés', '593': 'Coût des produits vendus'
};

function getAssocAccounts() {
  const out = {};
  const associates = state.company?.associates || [];
  associates.forEach((assoc, i) => { out[String(310 + i)] = 'Capital associé - ' + assoc.name; });
  return out;
}
function allAccounts() { return { ...PLAN_COMPTABLE, ...getAssocAccounts() }; }

const TX_TYPES = {
  vente_caisse:   { label: 'Vente de service — Espèces',   icon: '💵', entries: [{acc:'101',side:'D'},{acc:'410',side:'C'}] },
  vente_banque:   { label: 'Vente de service — Banque',    icon: '🏦', entries: [{acc:'1111',side:'D'},{acc:'410',side:'C'}] },
  vente_credit:   { label: 'Vente de service — À crédit',  icon: '📄', entries: [{acc:'1311',side:'D'},{acc:'410',side:'C'}] },
  encaissement:   { label: 'Encaissement client',          icon: '📥', entries: [{acc:'1111',side:'D'},{acc:'1311',side:'C'}] },
  achat_caisse:   { label: 'Achat fourniture — Espèces',   icon: '📦', entries: [{acc:'1565',side:'D'},{acc:'101',side:'C'}] },
  achat_banque:   { label: 'Achat fourniture — Banque',    icon: '📦', entries: [{acc:'1565',side:'D'},{acc:'1111',side:'C'}] },
  achat_credit:   { label: 'Achat fourniture — À crédit',  icon: '📦', entries: [{acc:'1565',side:'D'},{acc:'2100',side:'C'}] },
  paiement_fourn: { label: 'Paiement fournisseur',         icon: '📤', entries: [{acc:'2100',side:'D'},{acc:'1111',side:'C'}] },
  salaire:        { label: 'Paiement salaire',             icon: '👥', entries: [{acc:'530',side:'D'},{acc:'101',side:'C'}] },
  loyer:          { label: 'Loyer',                        icon: '🏠', entries: [{acc:'5373',side:'D'},{acc:'101',side:'C'}] },
  electricite:    { label: 'Électricité',                  icon: '💡', entries: [{acc:'5372',side:'D'},{acc:'101',side:'C'}] },
  telephone:      { label: 'Téléphone / Internet',         icon: '📞', entries: [{acc:'5371',side:'D'},{acc:'101',side:'C'}] },
  apport:         { label: 'Apport en capital',            icon: '💎', entries: [{acc:'1111',side:'D'},{acc:'CAP',side:'C'}] },
  retrait:        { label: "Retrait de l'exploitant",      icon: '🏧', entries: [{acc:'350',side:'D'},{acc:'1111',side:'C'}] },
  emprunt:        { label: 'Emprunt reçu',                 icon: '🏛️', entries: [{acc:'1111',side:'D'},{acc:'220',side:'C'}] },
  remb_emprunt:   { label: 'Remboursement emprunt',        icon: '🏛️', entries: [{acc:'220',side:'D'},{acc:'1111',side:'C'}] },
  immo_bureau:    { label: 'Acquisition matériel bureau',  icon: '🖥️', entries: [{acc:'186',side:'D'},{acc:'1111',side:'C'}] },
  immo_transport: { label: 'Acquisition matériel transport', icon: '🚗', entries: [{acc:'1854',side:'D'},{acc:'1111',side:'C'}] }
};

function entriesFor(tx) {
  const all = allAccounts();
  if (tx.mode === 'custom' && tx.debitAcc && tx.creditAcc) {
    return [
      { acc: tx.debitAcc,  label: all[tx.debitAcc]  || tx.debitAcc,  side: 'D' },
      { acc: tx.creditAcc, label: all[tx.creditAcc] || tx.creditAcc, side: 'C' }
    ];
  }
  const t = TX_TYPES[tx.type];
  if (!t) return [];
  return t.entries.map(e => {
    let acc = e.acc;
    if (acc === 'CAP') acc = state.company?.type === 'EI' ? '301' : '302';
    return { acc, label: all[acc] || acc, side: e.side };
  });
}

function txFlow(tx) {
  const entries = entriesFor(tx);
  const isTreso = a => /^1[012]/.test(a);
  const hasD = entries.some(e => e.side === 'D' && isTreso(e.acc));
  const hasC = entries.some(e => e.side === 'C' && isTreso(e.acc));
  if (hasD && !hasC) return 'in';
  if (hasC && !hasD) return 'out';
  if (entries.some(e => e.side === 'C' && /^4/.test(e.acc))) return 'in';
  return 'out';
}

const fmtN = n => new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);
const todayISO = () => new Date().toISOString().slice(0, 10);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const MOIS_FR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
function formatDateLongue(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${parseInt(d)} ${MOIS_FR[parseInt(m) - 1]} ${y}`;
}

function getExercices() {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth();
  const startYear = m >= 9 ? y : y - 1;
  const list = [];
  for (let i = -1; i <= 1; i++) {
    const s = startYear + i;
    list.push({ label: `${s}-${s+1}`, start: `${s}-10-01`, end: `${s+1}-09-30` });
  }
  return list;
}
function currentExercice() {
  const ex = getExercices(), t = todayISO();
  return ex.find(e => t >= e.start && t <= e.end) || ex[1];
}
function filterTxByExercice(txs, ex) {
  if (!ex) return txs;
  return txs.filter(t => t.date >= ex.start && t.date <= ex.end);
}
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}
function formatDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

/* Bloque le menu contextuel Google sur tout sauf les inputs */
document.addEventListener('contextmenu', e => {
  if (!e.target.matches('input, textarea, select, [contenteditable="true"]')) {
    e.preventDefault();
  }
});
document.addEventListener('selectstart', e => {
  if (!e.target.matches('input, textarea, select, [contenteditable="true"]')) {
    e.preventDefault();
  }
});

/* ============================================================
   CALCULS COMPTABLES
   ============================================================ */
function computeBalances(txs) {
  const b = {};
  txs.forEach(tx => {
    entriesFor(tx).forEach(e => {
      if (!b[e.acc]) b[e.acc] = { label: e.label, debit: 0, credit: 0 };
      if (e.side === 'D') b[e.acc].debit += tx.amount;
      else b[e.acc].credit += tx.amount;
    });
  });
  return b;
}

function groupTotal(bal, prefixes, mode = 'debit-credit') {
  let total = 0; const items = [];
  Object.keys(bal).sort().forEach(acc => {
    if (prefixes.some(p => acc === p || acc.startsWith(p))) {
      const s = mode === 'debit-credit' ? bal[acc].debit - bal[acc].credit : bal[acc].credit - bal[acc].debit;
      if (Math.abs(s) > 0.005) { items.push({ acc, label: bal[acc].label, solde: s }); total += s; }
    }
  });
  return { items, total };
}

function computeBilan(bal) {
  const tresorerie = groupTotal(bal, ['10', '11', '12']);
  const creances   = groupTotal(bal, ['13', '14', '16', '17']);
  const stocks     = groupTotal(bal, ['15']);
  const immo       = groupTotal(bal, ['18']);
  const amort      = groupTotal(bal, ['19']);
  const totalActif = tresorerie.total + creances.total + stocks.total + immo.total + amort.total;

  const capital  = groupTotal(bal, ['30', '31'], 'credit-debit');
  const reserves = groupTotal(bal, ['37'], 'credit-debit');
  const report   = groupTotal(bal, ['36'], 'credit-debit');
  const expl     = groupTotal(bal, ['35'], 'credit-debit');
  const dettesLT = groupTotal(bal, ['23'], 'credit-debit');
  const impots   = groupTotal(bal, ['20'], 'credit-debit');
  const fourn    = groupTotal(bal, ['21'], 'credit-debit');
  const prets    = groupTotal(bal, ['22'], 'credit-debit');
  const divCh    = groupTotal(bal, ['28'], 'credit-debit');

  const r = computeResultat(bal);
  const totalCapitaux = capital.total + reserves.total + report.total + expl.total + r.resultat;
  const totalDettes   = dettesLT.total + impots.total + fourn.total + prets.total + divCh.total;

  return {
    actif: { tresorerie, creances, stocks, immo, amort, totalActif },
    passif: { capital, reserves, report, expl, dettesLT, impots, fourn, prets, divCh,
              resultat: r.resultat, totalCapitaux, totalDettes,
              totalPassif: totalCapitaux + totalDettes }
  };
}

function computeResultat(bal) {
  const ventes   = groupTotal(bal, ['40'], 'credit-debit');
  const services = groupTotal(bal, ['41'], 'credit-debit');
  const autres   = groupTotal(bal, ['42'], 'credit-debit');
  const extra    = groupTotal(bal, ['43'], 'credit-debit');
  const achats   = groupTotal(bal, ['50'], 'debit-credit');
  const msesVend = groupTotal(bal, ['51'], 'debit-credit');
  const fraisV   = groupTotal(bal, ['52'], 'debit-credit');
  const fraisA   = groupTotal(bal, ['53'], 'debit-credit');
  const autresF  = groupTotal(bal, ['54'], 'debit-credit');
  const impots   = groupTotal(bal, ['55'], 'debit-credit');
  const pertes   = groupTotal(bal, ['56'], 'debit-credit');
  const analyt   = groupTotal(bal, ['59'], 'debit-credit');

  const totalProduits = ventes.total + services.total + autres.total + extra.total;
  const totalCharges  = achats.total + msesVend.total + fraisV.total + fraisA.total
                      + autresF.total + impots.total + pertes.total + analyt.total;

  return { ventes, services, autres, extra, achats, msesVend, fraisV, fraisA, autresF, impots, pertes, analyt,
           totalProduits, totalCharges, resultat: totalProduits - totalCharges };
}

/* État de l'avoir (Statement of Changes in Equity) */
function computeAvoir(bal, txs) {
  // Apports en capital (crédit sur comptes 30x ou 301/302/303/304 + 310-399)
  let capitalDebit = 0, capitalCredit = 0;
  Object.keys(bal).forEach(acc => {
    if (/^3[0-9]/.test(acc) && !/^35/.test(acc)) {
      // 30x, 31x, 32x, ..., 39x (sauf 35 = exploitant)
      capitalDebit  += bal[acc].debit;
      capitalCredit += bal[acc].credit;
    }
  });
  const capitalNet = capitalCredit - capitalDebit;

  // Retraits exploitant (compte 350, 351, 352 débiteurs)
  const retraits = groupTotal(bal, ['35'], 'debit-credit').total;

  // Résultat
  const r = computeResultat(bal);

  // Réserves (37x)
  const reserves = groupTotal(bal, ['37'], 'credit-debit').total;

  // Bénéfices non répartis (36x)
  const report = groupTotal(bal, ['36'], 'credit-debit').total;

  const totalAvoir = capitalNet + reserves + report + r.resultat - retraits;

  return { capitalNet, reserves, report, resultat: r.resultat, retraits, totalAvoir };
}

/* ============================================================
   FIREBASE — AUTHENTIFICATION
   ============================================================ */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.getElementById('login-form').classList.toggle('hidden', tab !== 'login');
    document.getElementById('signup-form').classList.toggle('hidden', tab !== 'signup');
  });
});

document.getElementById('signup-form').addEventListener('submit', async e => {
  e.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim().toLowerCase();
  const pass = document.getElementById('signup-pass').value;
  const err = document.getElementById('signup-error');
  const btn = e.target.querySelector('button[type="submit"]');
  err.textContent = '';

  if (!name || !email || !pass) { err.textContent = 'Tous les champs sont requis.'; return; }
  if (pass.length < 6) { err.textContent = 'Mot de passe : 6 caractères min.'; return; }

  btn.disabled = true; btn.textContent = 'Création…';
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, pass);
    await db.collection('users').doc(cred.user.uid).set({
      name, email, theme: 'jour', company: null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (ex) {
    err.textContent = firebaseErrorMessage(ex);
    btn.disabled = false; btn.textContent = 'Créer mon compte';
  }
});

document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass = document.getElementById('login-pass').value;
  const err = document.getElementById('login-error');
  const btn = e.target.querySelector('button[type="submit"]');
  err.textContent = '';

  btn.disabled = true; btn.textContent = 'Connexion…';
  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch (ex) {
    err.textContent = firebaseErrorMessage(ex);
    btn.disabled = false; btn.textContent = 'Se connecter';
  }
});

function firebaseErrorMessage(ex) {
  const codes = {
    'auth/email-already-in-use': 'Cet email est déjà utilisé.',
    'auth/invalid-email': 'Email invalide.',
    'auth/weak-password': 'Mot de passe trop faible (6 caractères min.).',
    'auth/user-not-found': 'Aucun compte avec cet email.',
    'auth/wrong-password': 'Mot de passe incorrect.',
    'auth/invalid-credential': 'Email ou mot de passe incorrect.',
    'auth/too-many-requests': 'Trop de tentatives. Réessayez plus tard.',
    'auth/network-request-failed': 'Pas de connexion internet.',
    'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'Clé API Firebase invalide. Vérifie firebase-config.js.'
  };
  return codes[ex.code] || 'Erreur : ' + (ex.message || ex.code);
}

auth.onAuthStateChanged(user => {
  if (user) {
    state.currentUid = user.uid;
    attachFirestoreListeners();
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('app-screen').classList.remove('hidden');
  } else {
    state.currentUid = null;
    state.user = null; state.company = null; state.transactions = [];
    detachFirestoreListeners();
    document.getElementById('app-screen').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('login-form').reset();
    document.getElementById('signup-form').reset();
  }
});

function attachFirestoreListeners() {
  detachFirestoreListeners();

  profileUnsub = db.collection('users').doc(state.currentUid).onSnapshot(doc => {
    const d = doc.data() || {};
    state.user = { name: d.name || '', email: d.email || '' };
    state.company = d.company || null;
    const t = d.theme || 'jour';
    state.theme = ['jour', 'nuit', 'navy', 'grenat'].includes(t) ? t : 'jour';
    applyTheme();
    updateTopbarLogo();
    if (!state.ready) { initApp(); state.ready = true; }
    else render();
  }, err => console.warn('Profile listener error:', err));

  txUnsub = db.collection('users').doc(state.currentUid).collection('transactions')
    .onSnapshot(snap => {
      state.transactions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (state.ready) render();
    }, err => console.warn('Tx listener error:', err));
}

function detachFirestoreListeners() {
  if (txUnsub) { txUnsub(); txUnsub = null; }
  if (profileUnsub) { profileUnsub(); profileUnsub = null; }
}

async function updateProfile(partial) {
  if (!state.currentUid) return;
  await db.collection('users').doc(state.currentUid).set(partial, { merge: true });
}

function logout() {
  detachFirestoreListeners();
  auth.signOut();
}

/* ============================================================
   INITIALISATION
   ============================================================ */
function initApp() {
  document.documentElement.setAttribute('data-theme', state.theme);
  const exs = getExercices();
  state.exercice = currentExercice();
  const sel = document.getElementById('exercice-select');
  sel.innerHTML = exs.map(e => `<option value="${e.label}">Exercice ${e.label}</option>`).join('');
  sel.value = state.exercice.label;
  sel.onchange = () => { state.exercice = exs.find(e => e.label === sel.value); render(); };

  updateThemeBtn();
  document.getElementById('theme-toggle').onclick = () => {
    const order = ['jour', 'nuit', 'navy', 'grenat'];
    const next = order[(order.indexOf(state.theme) + 1) % 4];
    state.theme = next;
    applyTheme(); updateThemeBtn();
    updateProfile({ theme: next });
  };

  document.querySelectorAll('.bottom-nav button').forEach(b => {
    b.onclick = () => { state.view = b.dataset.view; render(); };
  });

  if (!state.company) state.view = 'params';
  render();
}

function applyTheme() { document.documentElement.setAttribute('data-theme', state.theme); }
function updateThemeBtn() {
  const icons = { jour: '☀️', nuit: '🌙', navy: '🌊', grenat: '🍷' };
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = icons[state.theme] || '☀️';
}

function updateTopbarLogo() {
  const slot = document.getElementById('topbar-logo-slot');
  if (!slot) return;
  if (state.company?.logo) {
    slot.innerHTML = `<img src="${state.company.logo}" alt="logo">`;
  } else {
    slot.innerHTML = `<svg viewBox="0 0 100 100" width="30" height="30">
      <rect width="100" height="100" rx="22" fill="#7B1E28"/>
      <path d="M 71 29 A 30 30 0 1 0 71 71" fill="none" stroke="#fff" stroke-width="11" stroke-linecap="round"/>
      <path d="M 50 38 L 50 62 M 38 50 L 62 50" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
    </svg>`;
  }
}

/* ============================================================
   RENDU PRINCIPAL
   ============================================================ */
function render() {
  if (!state.ready) return;
  destroyCharts();
  document.querySelectorAll('.bottom-nav button').forEach(b =>
    b.classList.toggle('active', b.dataset.view === state.view)
  );
  const main = document.getElementById('main-content');
  const txs = filterTxByExercice(state.transactions, state.exercice);

  switch (state.view) {
    case 'dashboard':     main.innerHTML = renderDashboard(txs);    bindDashboard(txs); break;
    case 'transactions':  main.innerHTML = renderTransactions(txs); bindTransactions(); break;
    case 'ecritures':     main.innerHTML = renderEcritures(txs);                        break;
    case 'etats':         main.innerHTML = renderEtats(txs);        bindEtats();        break;
    case 'params':        main.innerHTML = renderParams();          bindParams();       break;
  }
  window.scrollTo(0, 0);
}

function destroyCharts() {
  Object.keys(state.charts).forEach(k => {
    try { state.charts[k].destroy(); } catch(e) {}
    delete state.charts[k];
  });
}

/* ============================================================
   VUE : TABLEAU DE BORD
   ============================================================ */
function renderDashboard(txs) {
  if (!state.company) return `
    <div class="empty">
      <div class="empty-icon">🏢</div>
      <p>Configurez votre entreprise.</p>
      <button type="button" class="btn btn-primary" style="margin-top:12px" onclick="state.view='params';render()">Paramètres</button>
    </div>`;

  const bal = computeBalances(txs);
  const r = computeResultat(bal);
  const tresorerie = groupTotal(bal, ['10', '11', '12']).total;
  const c = state.company;

  // Carte info entreprise
  let infoCard = '';
  if (c.type === 'EI') {
    infoCard = `
      <div class="card">
        <h3>👤 Exploitant</h3>
        <div class="info-row">
          <span class="info-label">Nom</span>
          <span class="info-value">${esc(c.ownerName || state.user?.name || '—')}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Entreprise</span>
          <span class="info-value">${esc(c.name)}</span>
        </div>
        ${c.nif ? `<div class="info-row"><span class="info-label">NIF</span><span class="info-value">${esc(c.nif)}</span></div>` : ''}
      </div>`;
  } else {
    const assoc = c.associates || [];
    infoCard = `
      <div class="card">
        <h3>👥 Associés (${assoc.length})</h3>
        ${assoc.length === 0 ? '<p style="color:var(--text-muted);font-size:13px;margin:0">Aucun associé enregistré</p>' :
          assoc.map((a, i) => `
            <div class="assoc-row">
              <span class="assoc-num">${310 + i}</span>
              <span class="assoc-name">${esc(a.name)}</span>
            </div>`).join('')}
      </div>`;
  }

  return `
    <div class="page-header">
      <h2>Bonjour, ${esc((state.user?.name || '').split(' ')[0])} 👋</h2>
      <p>${esc(c.name)} · ${c.type === 'EI' ? 'Entreprise Individuelle' : 'Entreprise en Nom Collectif'}</p>
    </div>

    <div class="kpi-grid">
      <div class="kpi"><div class="kpi-label">Produits</div><div class="kpi-value pos">${fmtN(r.totalProduits)}</div><div class="kpi-sub">HTG</div></div>
      <div class="kpi"><div class="kpi-label">Charges</div><div class="kpi-value neg">${fmtN(r.totalCharges)}</div><div class="kpi-sub">HTG</div></div>
      <div class="kpi"><div class="kpi-label">Résultat</div><div class="kpi-value ${r.resultat >= 0 ? 'pos' : 'neg'}">${fmtN(r.resultat)}</div><div class="kpi-sub">HTG</div></div>
      <div class="kpi"><div class="kpi-label">Trésorerie</div><div class="kpi-value">${fmtN(tresorerie)}</div><div class="kpi-sub">HTG</div></div>
    </div>

    ${infoCard}

    <div class="card">
      <h3>📊 Produits vs Charges</h3>
      <div class="chart-wrap"><canvas id="chart-pc"></canvas></div>
    </div>

    <div class="card">
      <h3>🥧 Répartition des charges</h3>
      <div class="chart-wrap tall"><canvas id="chart-charges"></canvas></div>
    </div>

    <button type="button" class="btn btn-primary btn-block" id="quick-add" style="padding:16px;font-size:15px">+ Ajouter une transaction</button>
  `;
}

function bindDashboard(txs) {
  const q = document.getElementById('quick-add');
  if (q) q.onclick = () => openTxModal();

  const bal = computeBalances(txs);
  const r = computeResultat(bal);

  // Graphique 1 : Bar Produits vs Charges
  const ctx1 = document.getElementById('chart-pc');
  if (ctx1 && window.Chart) {
    state.charts.pc = new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: ['Produits', 'Charges'],
        datasets: [{
          label: 'Montant (HTG)',
          data: [r.totalProduits, r.totalCharges],
          backgroundColor: ['#10b981', '#ef4444'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { callback: v => fmtN(v) } }
        }
      }
    });
  }

  // Graphique 2 : Doughnut Répartition des charges
  const ctx2 = document.getElementById('chart-charges');
  if (ctx2 && window.Chart) {
    const labels = [], values = [];
    const sections = [
      ['Achats de stocks', r.achats.total],
      ['Marchandises vendues', r.msesVend.total],
      ['Frais de vente', r.fraisV.total],
      ["Frais d'admin.", r.fraisA.total],
      ['Autres frais', r.autresF.total],
      ['Impôts', r.impots.total],
      ['Pertes extra.', r.pertes.total]
    ];
    sections.forEach(([l, v]) => { if (v > 0) { labels.push(l); values.push(v); } });

    if (values.length === 0) {
      ctx2.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:13px">Aucune charge enregistrée</div>';
    } else {
      const palette = ['#c8102e','#0b2545','#1e5a96','#10b981','#f59e0b','#7b1023','#4a7bb8','#dc2626','#0e9f6e'];
      state.charts.charges = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{ data: values, backgroundColor: palette.slice(0, values.length), borderWidth: 2, borderColor: '#fff' }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 10, boxWidth: 12 } },
            tooltip: { callbacks: { label: c => c.label + ' : ' + fmtN(c.raw) + ' HTG' } }
          }
        }
      });
    }
  }
}

/* ============================================================
   VUE : TRANSACTIONS
   ============================================================ */
function renderTransactions(txs) {
  const sorted = txs.slice().sort((a, b) => b.date.localeCompare(a.date));
  return `
    <div class="page-header">
      <h2>Transactions</h2>
      <p>${txs.length} opération${txs.length > 1 ? 's' : ''} · Exercice ${state.exercice.label}</p>
    </div>
    <button type="button" class="btn btn-primary btn-block" id="add-tx" style="margin-bottom:16px">+ Nouvelle transaction</button>
    ${sorted.length === 0
      ? `<div class="empty"><div class="empty-icon">📋</div><p>Aucune transaction</p></div>`
      : `<div class="tx-list">${sorted.map(t => renderTxItem(t, true)).join('')}</div>`}
  `;
}

function renderTxItem(t, withActions = false) {
  let icon = '📝', label = t.desc || 'Transaction', subLabel = '';
  if (t.mode === 'custom') {
    icon = '🔎';
    subLabel = `${t.debitAcc} → ${t.creditAcc}`;
    label = t.desc || subLabel;
  } else {
    const type = TX_TYPES[t.type];
    if (type) { icon = type.icon; label = t.desc || type.label; subLabel = type.label; }
  }
  const flow = txFlow(t);
  const cls = flow === 'in' ? 'pos' : 'neg';
  return `
    <div class="tx-item" data-id="${t.id}">
      <div class="tx-icon">${icon}</div>
      <div class="tx-info">
        <div class="tx-desc">${esc(label)}</div>
        <div class="tx-meta">${formatDate(t.date)} · ${esc(subLabel)}</div>
      </div>
      <div>
        <div class="tx-amount ${cls}">${fmtN(t.amount)}</div>
        ${withActions ? `
          <div class="tx-actions">
            <button type="button" class="edit-tx" data-id="${t.id}">✏️</button>
            <button type="button" class="del-tx" data-id="${t.id}">🗑️</button>
          </div>` : ''}
      </div>
    </div>`;
}

function bindTransactions() {
  const add = document.getElementById('add-tx');
  if (add) add.onclick = () => openTxModal();
  document.querySelectorAll('.edit-tx').forEach(b => b.onclick = e => { e.stopPropagation(); openTxModal(b.dataset.id); });
  document.querySelectorAll('.del-tx').forEach(b => b.onclick = async e => {
    e.stopPropagation();
    if (confirm('Supprimer cette transaction ?')) {
      try {
        await db.collection('users').doc(state.currentUid).collection('transactions').doc(b.dataset.id).delete();
        toast('Supprimée');
      } catch (ex) { toast('Erreur de suppression'); }
    }
  });
}

/* ============================================================
   MODALE TRANSACTION
   ============================================================ */
function openTxModal(id = null) {
  const editing = id ? state.transactions.find(t => t.id === id) : null;
  const today = todayISO();
  const isCustom = editing?.mode === 'custom';
  const all = allAccounts();

  const typeOptions = Object.entries(TX_TYPES).map(([k, v]) =>
    `<option value="${k}" ${(!isCustom && editing?.type === k) ? 'selected' : ''}>${v.icon} ${esc(v.label)}</option>`
  ).join('');

  document.getElementById('modal-root').innerHTML = `
    <div class="modal-overlay" id="tx-overlay">
      <div class="modal">
        <div class="modal-head">
          <h3>${editing ? 'Modifier' : 'Nouvelle'} transaction</h3>
          <button type="button" class="modal-close" id="close-modal">✕</button>
        </div>
        <div class="mode-tabs">
          <button type="button" class="mode-btn ${!isCustom ? 'active' : ''}" data-mode="preset">⚡ Type prédéfini</button>
          <button type="button" class="mode-btn ${isCustom ? 'active' : ''}" data-mode="custom">🔎 Recherche</button>
        </div>
        <form id="tx-form">
          <div id="section-preset" style="display:${isCustom ? 'none' : 'block'}">
            <div class="form-group">
              <label>Type d'opération</label>
              <select id="tx-type">${typeOptions}</select>
            </div>
          </div>
          <div id="section-custom" style="display:${isCustom ? 'block' : 'none'}">
            <div class="form-group search-wrap">
              <label>Compte à débiter</label>
              <input type="text" id="search-debit" placeholder="N° ou libellé (ex: 101, caisse, client...)" autocomplete="off" value="${editing?.mode === 'custom' ? esc(editing.debitAcc + ' — ' + (all[editing.debitAcc] || '')) : ''}">
              <div class="search-dropdown" id="dd-debit"></div>
              <div class="picked-info" id="picked-debit" style="display:${editing?.mode === 'custom' ? 'block' : 'none'}">✓ <span>${editing?.mode === 'custom' ? esc(editing.debitAcc + ' — ' + (all[editing.debitAcc] || '')) : ''}</span></div>
            </div>
            <div class="form-group search-wrap">
              <label>Compte à créditer</label>
              <input type="text" id="search-credit" placeholder="N° ou libellé (ex: 410, service, banque...)" autocomplete="off" value="${editing?.mode === 'custom' ? esc(editing.creditAcc + ' — ' + (all[editing.creditAcc] || '')) : ''}">
              <div class="search-dropdown" id="dd-credit"></div>
              <div class="picked-info" id="picked-credit" style="display:${editing?.mode === 'custom' ? 'block' : 'none'}">✓ <span>${editing?.mode === 'custom' ? esc(editing.creditAcc + ' — ' + (all[editing.creditAcc] || '')) : ''}</span></div>
            </div>
          </div>
          <div class="form-group">
            <label>Date</label>
            <input type="date" id="tx-date" value="${editing?.date || today}" required>
          </div>
          <div class="form-group">
            <label>Montant (HTG)</label>
            <input type="number" id="tx-amount" step="0.01" min="0.01" value="${editing?.amount || ''}" required placeholder="0.00" inputmode="decimal">
          </div>
          <div class="form-group">
            <label>Description (optionnel)</label>
            <input type="text" id="tx-desc" value="${editing ? esc(editing.desc || '') : ''}" placeholder="Ex: Facture client Dupont">
          </div>
          <div class="preview-box">
            <div class="preview-title">Écritures générées automatiquement</div>
            <div id="tx-preview"></div>
          </div>
          <div class="btn-row">
            <button type="button" class="btn btn-secondary" id="cancel-tx">Annuler</button>
            <button type="submit" class="btn btn-primary" id="submit-tx">${editing ? 'Enregistrer' : 'Ajouter'}</button>
          </div>
        </form>
      </div>
    </div>`;

  let currentMode = isCustom ? 'custom' : 'preset';
  let pickedDebit  = editing?.mode === 'custom' ? editing.debitAcc  : null;
  let pickedCredit = editing?.mode === 'custom' ? editing.creditAcc : null;

  function searchAccounts(q) {
    q = q.trim().toLowerCase();
    if (!q) return [];
    const accs = allAccounts();
    const results = [];
    for (const num of Object.keys(accs)) {
      const label = accs[num];
      if (num.toLowerCase().includes(q) || label.toLowerCase().includes(q)) results.push({ num, label });
    }
    results.sort((a, b) => {
      const aE = a.num === q ? 0 : a.num.startsWith(q) ? 1 : 2;
      const bE = b.num === q ? 0 : b.num.startsWith(q) ? 1 : 2;
      return aE !== bE ? aE - bE : a.num.localeCompare(b.num);
    });
    return results.slice(0, 30);
  }

  function renderDropdown(container, results, onPick) {
    if (!results.length) { container.style.display = 'none'; return; }
    container.innerHTML = results.map(r =>
      `<button type="button" class="search-item" data-num="${r.num}">
        <span class="num">${r.num}</span><span>${esc(r.label)}</span>
      </button>`).join('');
    container.style.display = 'block';
    container.querySelectorAll('.search-item').forEach(b => {
      b.onmousedown = e => { e.preventDefault(); onPick(b.dataset.num); };
    });
  }

  function setupSearch(inputId, ddId, pickedId, setter) {
    const input = document.getElementById(inputId);
    const dd = document.getElementById(ddId);
    const picked = document.getElementById(pickedId);
    input.oninput = () => {
      const q = input.value.trim();
      if (!q) { dd.style.display = 'none'; picked.style.display = 'none'; setter(null); return; }
      renderDropdown(dd, searchAccounts(q), num => {
        const accs = allAccounts();
        input.value = `${num} — ${accs[num]}`;
        dd.style.display = 'none';
        picked.innerHTML = `✓ <span>${esc(num + ' — ' + accs[num])}</span>`;
        picked.style.display = 'block';
        setter(num); updPreview();
      });
    };
    input.onfocus = () => { if (input.value.trim()) input.oninput(); };
    input.onblur = () => { setTimeout(() => { dd.style.display = 'none'; }, 200); };
  }

  setupSearch('search-debit', 'dd-debit', 'picked-debit', v => { pickedDebit = v; updPreview(); });
  setupSearch('search-credit', 'dd-credit', 'picked-credit', v => { pickedCredit = v; updPreview(); });

  function updPreview() {
    const box = document.getElementById('tx-preview');
    const amt = parseFloat(document.getElementById('tx-amount').value) || 0;
    let entries = [];
    if (currentMode === 'preset') {
      entries = entriesFor({ type: document.getElementById('tx-type').value, amount: amt });
    } else {
      const accs = allAccounts();
      if (pickedDebit)  entries.push({ acc: pickedDebit,  label: accs[pickedDebit]  || pickedDebit,  side: 'D' });
      if (pickedCredit) entries.push({ acc: pickedCredit, label: accs[pickedCredit] || pickedCredit, side: 'C' });
    }
    if (!entries.length) {
      box.innerHTML = '<div style="color:var(--text-muted);font-size:12px">Sélectionnez un type ou des comptes.</div>';
      return;
    }
    box.innerHTML = entries.map(e =>
      `<div class="preview-line ${e.side === 'D' ? 'debit' : 'credit'}">
        <span>${e.acc} — ${esc(e.label)}</span>
        <span>${fmtN(amt)} ${e.side === 'D' ? 'D' : 'C'}</span>
      </div>`).join('');
  }

  document.querySelectorAll('.mode-btn').forEach(b => {
    b.onclick = () => {
      currentMode = b.dataset.mode;
      document.querySelectorAll('.mode-btn').forEach(x => x.classList.toggle('active', x.dataset.mode === currentMode));
      document.getElementById('section-preset').style.display = currentMode === 'preset' ? 'block' : 'none';
      document.getElementById('section-custom').style.display = currentMode === 'custom' ? 'block' : 'none';
      updPreview();
    };
  });

  document.getElementById('tx-type').onchange = updPreview;
  document.getElementById('tx-amount').oninput = updPreview;
  updPreview();

  document.getElementById('close-modal').onclick = closeModal;
  document.getElementById('cancel-tx').onclick = closeModal;
  document.getElementById('tx-overlay').onclick = e => { if (e.target.id === 'tx-overlay') closeModal(); };

  document.getElementById('tx-form').onsubmit = async e => {
    e.preventDefault();
    const date = document.getElementById('tx-date').value;
    const amount = parseFloat(document.getElementById('tx-amount').value);
    const desc = document.getElementById('tx-desc').value.trim();

    if (!date || !amount || amount <= 0) { toast('Date et montant requis'); return; }

    let tx;
    if (currentMode === 'preset') {
      tx = { id: editing?.id || uid(), mode: 'preset', type: document.getElementById('tx-type').value, date, amount, desc };
    } else {
      const accs = allAccounts();
      let dAcc = pickedDebit, cAcc = pickedCredit;
      if (!dAcc) { const v = document.getElementById('search-debit').value.split('—')[0].trim(); if (accs[v]) dAcc = v; }
      if (!cAcc) { const v = document.getElementById('search-credit').value.split('—')[0].trim(); if (accs[v]) cAcc = v; }
      if (!dAcc || !cAcc) { toast('Sélectionnez débit et crédit'); return; }
      if (dAcc === cAcc) { toast('Débit et crédit identiques'); return; }
      tx = { id: editing?.id || uid(), mode: 'custom', debitAcc: dAcc, creditAcc: cAcc, date, amount, desc };
    }

    const btn = document.getElementById('submit-tx');
    btn.disabled = true; btn.textContent = 'Enregistrement…';

    try {
      const { id: txId, ...data } = tx;
      await db.collection('users').doc(state.currentUid).collection('transactions').doc(txId).set(data);
      closeModal();
      toast(editing ? 'Modifiée ✓' : 'Ajoutée ✓');
    } catch (ex) {
      console.error(ex);
      toast('Erreur d\'enregistrement');
      btn.disabled = false; btn.textContent = editing ? 'Enregistrer' : 'Ajouter';
    }
  };
}

function closeModal() { document.getElementById('modal-root').innerHTML = ''; }

/* ============================================================
   JOURNAL
   ============================================================ */
function renderEcritures(txs) {
  const sorted = txs.slice().sort((a, b) => a.date.localeCompare(b.date));
  if (!sorted.length) return `
    <div class="page-header"><h2>Journal des écritures</h2></div>
    <div class="empty"><div class="empty-icon">📖</div><p>Aucune écriture</p></div>`;

  let totalD = 0;
  const groups = sorted.map(t => {
    const entries = entriesFor(t);
    totalD += t.amount;
    const lib = t.desc || (t.mode === 'custom' ? `${t.debitAcc} → ${t.creditAcc}` : (TX_TYPES[t.type]?.label || ''));
    return `
      <div class="entry-group">
        <div class="entry-head">
          <span>${formatDate(t.date)} — ${esc(lib)}</span>
          <span>N°${t.id.slice(-6)}</span>
        </div>
        <div class="entry-lines">
          ${entries.map(e => `
            <div class="entry-line">
              <span class="acc">${e.acc}</span>
              <span class="lbl">${esc(e.label)}</span>
              <span class="d">${e.side === 'D' ? fmtN(t.amount) : ''}</span>
              <span class="c">${e.side === 'C' ? fmtN(t.amount) : ''}</span>
            </div>`).join('')}
        </div>
      </div>`;
  }).join('');

  return `
    <div class="page-header"><h2>Journal des écritures</h2><p>${txs.length} pièces · Exercice ${state.exercice.label}</p></div>
    ${groups}
    <div class="card" style="margin-top:16px">
      <div class="card-header"><h3>Totaux</h3></div>
      <div style="display:flex;justify-content:space-between;padding:6px 0">
        <span style="font-weight:700">Total Débit</span><span style="font-weight:800;color:var(--success)">${fmtN(totalD)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:6px 0">
        <span style="font-weight:700">Total Crédit</span><span style="font-weight:800;color:var(--accent)">${fmtN(totalD)}</span>
      </div>
    </div>`;
}

/* ============================================================
   ÉTATS FINANCIERS
   ============================================================ */
function renderEtats(txs) {
  const tabs = [
    { k: 'bilan', l: 'Bilan' },
    { k: 'resultat', l: 'Résultat' },
    { k: 'avoir', l: "État de l'avoir" },
    { k: 'balance', l: 'Balance' },
    { k: 'grandlivre', l: 'Grand livre' }
  ];
  return `
    <div class="page-header">
      <h2>États financiers</h2>
      <p>Exercice ${state.exercice.label} · ${formatDate(state.exercice.start)} → ${formatDate(state.exercice.end)}</p>
    </div>
    <div class="stmt-tabs">
      ${tabs.map(t => `<button type="button" class="stmt-tab ${state.stmtTab === t.k ? 'active' : ''}" data-tab="${t.k}">${t.l}</button>`).join('')}
    </div>
    <div id="stmt-content">${renderStmt(txs)}</div>`;
}

function bindEtats() {
  document.querySelectorAll('.stmt-tab').forEach(b => b.onclick = () => {
    state.stmtTab = b.dataset.tab;
    document.querySelectorAll('.stmt-tab').forEach(x => x.classList.toggle('active', x === b));
    document.getElementById('stmt-content').innerHTML = renderStmt(filterTxByExercice(state.transactions, state.exercice));
    bindPdfBtn();
  });
  bindPdfBtn();
}
function bindPdfBtn() {
  const btn = document.getElementById('pdf-btn');
  if (btn) btn.onclick = () => exportPDF(state.stmtTab);
}

function renderStmt(txs) {
  const bal = computeBalances(txs);
  switch (state.stmtTab) {
    case 'bilan':      return renderBilanView(bal);
    case 'resultat':   return renderResultatView(bal);
    case 'avoir':      return renderAvoirView(bal, txs);
    case 'balance':    return renderBalanceView(bal);
    case 'grandlivre': return renderGrandLivreView(txs);
  }
  return '';
}

function renderBilanView(bal) {
  const b = computeBilan(bal);
  const row = g => g.items.map(a =>
    `<tr><td>${esc(a.label)}</td><td class="balance-acc">${a.acc}</td><td class="num">${fmtN(a.solde)}</td></tr>`).join('');
  const sec = t => `<tr><td colspan="3" style="background:var(--bg-alt);font-weight:700;font-size:12px">${t}</td></tr>`;

  return `
    <div style="margin-bottom:12px"><button type="button" class="btn btn-primary btn-block" id="pdf-btn">📄 Exporter le Bilan en PDF</button></div>
    <div class="card">
      <h3 style="color:var(--primary);text-align:center;margin-bottom:4px">BILAN</h3>
      <p style="text-align:center;color:var(--text-muted);font-size:12px;margin:0 0 16px">
        ${esc(state.company.name)}<br>Au ${formatDateLongue(state.exercice.end)}
      </p>

      <div class="stmt-section">ACTIF</div>
      <table class="stmt-table">
        <thead><tr><th>Rubrique</th><th>Compte</th><th style="text-align:right">Montant</th></tr></thead>
        <tbody>
          ${sec('ACTIF IMMOBILISÉ')}${row(b.actif.immo)}
          ${b.actif.amort.items.length ? sec('AMORTISSEMENTS ACCUMULÉS') + row(b.actif.amort) : ''}
          <tr class="subtotal"><td>Total actif immobilisé net</td><td></td><td class="num">${fmtN(b.actif.immo.total + b.actif.amort.total)}</td></tr>
          ${b.actif.stocks.items.length ? sec('STOCKS') + row(b.actif.stocks) + `<tr class="subtotal"><td>Total stocks</td><td></td><td class="num">${fmtN(b.actif.stocks.total)}</td></tr>` : ''}
          ${b.actif.creances.items.length ? sec('CRÉANCES') + row(b.actif.creances) + `<tr class="subtotal"><td>Total créances</td><td></td><td class="num">${fmtN(b.actif.creances.total)}</td></tr>` : ''}
          ${b.actif.tresorerie.items.length ? sec('TRÉSORERIE') + row(b.actif.tresorerie) + `<tr class="subtotal"><td>Total trésorerie</td><td></td><td class="num">${fmtN(b.actif.tresorerie.total)}</td></tr>` : ''}
          <tr class="total"><td>TOTAL ACTIF</td><td></td><td class="num">${fmtN(b.actif.totalActif)}</td></tr>
        </tbody>
      </table>

      <div class="stmt-section" style="margin-top:20px">PASSIF</div>
      <table class="stmt-table">
        <thead><tr><th>Rubrique</th><th>Compte</th><th style="text-align:right">Montant</th></tr></thead>
        <tbody>
          ${sec('CAPITAUX PROPRES')}
          ${row(b.passif.capital)}${row(b.passif.reserves)}${row(b.passif.report)}${row(b.passif.expl)}
          <tr><td>Résultat de l'exercice</td><td class="balance-acc">—</td><td class="num">${fmtN(b.passif.resultat)}</td></tr>
          <tr class="subtotal"><td>Total capitaux propres</td><td></td><td class="num">${fmtN(b.passif.totalCapitaux)}</td></tr>
          ${b.passif.dettesLT.items.length ? sec('DETTES À LONG TERME') + row(b.passif.dettesLT) + `<tr class="subtotal"><td>Total dettes LT</td><td></td><td class="num">${fmtN(b.passif.dettesLT.total)}</td></tr>` : ''}
          ${sec('PASSIF CIRCULANT')}
          ${row(b.passif.impots)}${row(b.passif.fourn)}${row(b.passif.prets)}${row(b.passif.divCh)}
          <tr class="subtotal"><td>Total passif circulant</td><td></td>
            <td class="num">${fmtN(b.passif.impots.total + b.passif.fourn.total + b.passif.prets.total + b.passif.divCh.total)}</td></tr>
          <tr class="total"><td>TOTAL PASSIF</td><td></td><td class="num">${fmtN(b.passif.totalPassif)}</td></tr>
        </tbody>
      </table>

      ${Math.abs(b.actif.totalActif - b.passif.totalPassif) > 0.5
        ? `<p style="color:var(--danger);font-size:12px;margin-top:12px">⚠️ Écart actif/passif : ${fmtN(b.actif.totalActif - b.passif.totalPassif)}</p>`
        : `<p style="color:var(--success);font-size:12px;margin-top:12px;text-align:center">✓ Bilan équilibré</p>`}
    </div>`;
}

function renderResultatView(bal) {
  const r = computeResultat(bal);
  const section = (title, g) => {
    if (!g.items.length) return '';
    return `<tr><td colspan="3" style="background:var(--bg-alt);font-weight:700;font-size:12px">${title}</td></tr>
      ${g.items.map(a => `<tr><td>${esc(a.label)}</td><td class="balance-acc">${a.acc}</td><td class="num">${fmtN(a.solde)}</td></tr>`).join('')}
      <tr class="subtotal"><td>Total</td><td></td><td class="num">${fmtN(g.total)}</td></tr>`;
  };
  return `
    <div style="margin-bottom:12px"><button type="button" class="btn btn-primary btn-block" id="pdf-btn">📄 Exporter le Résultat en PDF</button></div>
    <div class="card">
      <h3 style="color:var(--primary);text-align:center;margin-bottom:4px">COMPTE DE RÉSULTAT</h3>
      <p style="text-align:center;color:var(--text-muted);font-size:12px;margin:0 0 16px">
        ${esc(state.company.name)}<br>Pour l'exercice clos le ${formatDateLongue(state.exercice.end)}
      </p>

      <div class="stmt-section">PRODUITS</div>
      <table class="stmt-table"><tbody>
        ${section('Ventes de marchandises', r.ventes) || '<tr><td colspan="3" style="color:var(--text-muted)">—</td></tr>'}
        ${section('Production vendue et prestations', r.services)}
        ${section('Autres revenus', r.autres)}
        ${section('Revenus extraordinaires', r.extra)}
        <tr class="total"><td>TOTAL PRODUITS</td><td></td><td class="num" style="color:var(--success)">${fmtN(r.totalProduits)}</td></tr>
      </tbody></table>

      <div class="stmt-section" style="margin-top:16px">CHARGES</div>
      <table class="stmt-table"><tbody>
        ${section('Achats de stocks', r.achats) || '<tr><td colspan="3" style="color:var(--text-muted)">—</td></tr>'}
        ${section('Marchandises vendues', r.msesVend)}
        ${section('Frais de vente', r.fraisV)}
        ${section("Frais d'administration", r.fraisA)}
        ${section('Autres frais', r.autresF)}
        ${section('Impôts sur le revenu', r.impots)}
        ${section('Pertes extraordinaires', r.pertes)}
        ${section('Comptabilité analytique', r.analyt)}
        <tr class="total"><td>TOTAL CHARGES</td><td></td><td class="num" style="color:var(--danger)">${fmtN(r.totalCharges)}</td></tr>
      </tbody></table>

      <div class="stmt-section" style="margin-top:16px">RÉSULTAT NET</div>
      <table class="stmt-table"><tbody>
        <tr class="total"><td>${r.resultat >= 0 ? 'BÉNÉFICE' : 'PERTE'}</td><td></td>
        <td class="num" style="color:${r.resultat >= 0 ? 'var(--success)' : 'var(--danger)'}">${fmtN(Math.abs(r.resultat))}</td></tr>
      </tbody></table>
    </div>`;
}

function renderAvoirView(bal, txs) {
  const a = computeAvoir(bal, txs);
  return `
    <div style="margin-bottom:12px"><button type="button" class="btn btn-primary btn-block" id="pdf-btn">📄 Exporter l'État de l'avoir en PDF</button></div>
    <div class="card">
      <h3 style="color:var(--primary);text-align:center;margin-bottom:4px">ÉTAT DE L'AVOIR</h3>
      <p style="text-align:center;color:var(--text-muted);font-size:12px;margin:0 0 16px">
        ${esc(state.company.name)}<br>Pour l'exercice clos le ${formatDateLongue(state.exercice.end)}
      </p>

      <table class="stmt-table">
        <tbody>
          <tr><td>Capital au début de l'exercice</td><td class="num">${fmtN(0)}</td></tr>
          <tr><td>Apports en capital</td><td class="num">${fmtN(a.capitalNet)}</td></tr>
          ${a.reserves ? `<tr><td>Réserves</td><td class="num">${fmtN(a.reserves)}</td></tr>` : ''}
          ${a.report ? `<tr><td>Bénéfices non répartis</td><td class="num">${fmtN(a.report)}</td></tr>` : ''}
          <tr class="subtotal"><td>Résultat net de l'exercice</td><td class="num" style="color:${a.resultat >= 0 ? 'var(--success)' : 'var(--danger)'}">${fmtN(a.resultat)}</td></tr>
          ${a.retraits ? `<tr><td>Retraits de l'exploitant</td><td class="num" style="color:var(--danger)">- ${fmtN(a.retraits)}</td></tr>` : ''}
          <tr class="total"><td>CAPITAL À LA FIN DE L'EXERCICE</td><td class="num">${fmtN(a.totalAvoir)}</td></tr>
        </tbody>
      </table>

      <div class="stmt-section" style="margin-top:20px">Détail du capital</div>
      <table class="stmt-table">
        <thead><tr><th>Rubrique</th><th>Compte</th><th style="text-align:right">Montant</th></tr></thead>
        <tbody>
          ${state.company.type === 'EI'
            ? `<tr><td>Capital individuel (EI)</td><td class="balance-acc">301</td><td class="num">${fmtN(a.capitalNet)}</td></tr>`
            : `${(state.company.associates || []).map((assoc, i) =>
                `<tr><td>Capital associé - ${esc(assoc.name)}</td><td class="balance-acc">${310 + i}</td><td class="num">—</td></tr>`).join('')}`
          }
        </tbody>
      </table>
    </div>`;
}

function renderBalanceView(bal) {
  const accounts = Object.keys(bal).sort();
  let totalD = 0, totalC = 0;
  const rows = accounts.map(a => {
    const d = bal[a].debit, c = bal[a].credit, s = d - c;
    totalD += d; totalC += c;
    return `<tr>
      <td class="balance-acc">${a}</td><td>${esc(bal[a].label)}</td>
      <td class="num">${fmtN(d)}</td><td class="num">${fmtN(c)}</td>
      <td class="num" style="color:${s >= 0 ? 'var(--success)' : 'var(--danger)'}">${fmtN(s)}</td>
    </tr>`;
  }).join('');
  return `
    <div style="margin-bottom:12px"><button type="button" class="btn btn-primary btn-block" id="pdf-btn">📄 Exporter la Balance en PDF</button></div>
    <div class="card">
      <h3 style="color:var(--primary);text-align:center;margin-bottom:16px">BALANCE GÉNÉRALE</h3>
      <p style="text-align:center;color:var(--text-muted);font-size:12px;margin:0 0 16px">
        ${esc(state.company.name)} — Au ${formatDateLongue(state.exercice.end)}
      </p>
      <div style="overflow-x:auto">
        <table class="stmt-table">
          <thead><tr><th>N°</th><th>Libellé</th><th style="text-align:right">Débit</th><th style="text-align:right">Crédit</th><th style="text-align:right">Solde</th></tr></thead>
          <tbody>
            ${rows || '<tr><td colspan="5" style="color:var(--text-muted)">Aucun mouvement</td></tr>'}
            <tr class="total"><td colspan="2">TOTAUX</td><td class="num">${fmtN(totalD)}</td><td class="num">${fmtN(totalC)}</td><td class="num">${fmtN(totalD - totalC)}</td></tr>
          </tbody>
        </table>
      </div>
    </div>`;
}

function renderGrandLivreView(txs) {
  const bal = computeBalances(txs);
  const accounts = Object.keys(bal).sort();
  return `
    <div style="margin-bottom:12px"><button type="button" class="btn btn-primary btn-block" id="pdf-btn">📄 Exporter le Grand livre en PDF</button></div>
    ${accounts.map(acc => {
      const lines = []; let running = 0;
      txs.slice().sort((a, b) => a.date.localeCompare(b.date)).forEach(t => {
        entriesFor(t).forEach(e => {
          if (e.acc === acc) {
            const d = e.side === 'D' ? t.amount : 0;
            const c = e.side === 'C' ? t.amount : 0;
            running += d - c;
            lines.push({ date: t.date, desc: t.desc || (t.mode === 'custom' ? `${t.debitAcc} → ${t.creditAcc}` : TX_TYPES[t.type]?.label) || '', d, c, running });
          }
        });
      });
      if (!lines.length) return '';
      return `
        <div class="card">
          <h3 style="color:var(--primary)">${acc} — ${esc(bal[acc].label)}</h3>
          <table class="stmt-table">
            <thead><tr><th>Date</th><th>Libellé</th><th style="text-align:right">Débit</th><th style="text-align:right">Crédit</th><th style="text-align:right">Solde</th></tr></thead>
            <tbody>${lines.map(l => `<tr>
              <td>${formatDate(l.date)}</td><td>${esc(l.desc)}</td>
              <td class="num">${l.d ? fmtN(l.d) : ''}</td><td class="num">${l.c ? fmtN(l.c) : ''}</td>
              <td class="num">${fmtN(l.running)}</td></tr>`).join('')}</tbody>
          </table>
        </div>`;
    }).join('') || '<div class="empty"><div class="empty-icon">📚</div><p>Aucun mouvement</p></div>'}`;
}

/* ============================================================
   PARAMÈTRES
   ============================================================ */
function renderParams() {
  const c = state.company || {};
  const associates = c.associates || [];
  return `
    <div class="page-header"><h2>Paramètres</h2><p>Configuration</p></div>

    <div class="card">
      <h3>🖼️ Logo de l'entreprise</h3>
      <p style="font-size:12px;color:var(--text-muted);margin:0 0 12px">Le logo ci-dessous apparaît dans l'application. L'icône sur l'écran d'accueil reste inchangée.</p>
      ${c.logo
        ? `<img src="${c.logo}" class="logo-preview" alt="Logo">`
        : `<div class="logo-placeholder">🏢</div>`}
      <div class="btn-row">
        <button type="button" class="btn btn-secondary" id="upload-logo">Changer le logo</button>
        ${c.logo ? `<button type="button" class="btn btn-secondary" id="remove-logo">Retirer</button>` : ''}
      </div>
      <input type="file" id="logo-file" accept="image/*" style="display:none">
    </div>

    <div class="card">
      <h3>🏢 Entreprise</h3>
      <div class="form-group"><label>Nom</label>
        <input type="text" id="co-name" value="${esc(c.name || '')}" placeholder="Ex: Jean Baptiste Services"></div>
      <div class="form-group"><label>Forme juridique</label>
        <div class="type-cards">
          <button type="button" class="type-card ${c.type === 'EI' ? 'active' : ''}" data-type="EI">
            <h4>Entreprise Individuelle</h4><p>Capital → 301</p>
          </button>
          <button type="button" class="type-card ${c.type === 'ENC' ? 'active' : ''}" data-type="ENC">
            <h4>Entreprise en Nom Collectif</h4><p>Capital → 302 + associés</p>
          </button>
        </div>
      </div>
      <div class="form-group" id="owner-field" style="display:${c.type === 'EI' ? 'block' : 'none'}">
        <label>Nom de l'exploitant</label>
        <input type="text" id="co-owner" value="${esc(c.ownerName || '')}" placeholder="Nom complet">
      </div>
      <div class="form-group"><label>NIF</label><input type="text" id="co-nif" value="${esc(c.nif || '')}" placeholder="Optionnel"></div>
      <div class="form-group"><label>Adresse</label><input type="text" id="co-addr" value="${esc(c.addr || '')}" placeholder="Optionnel"></div>
      <div class="form-group"><label>Téléphone</label><input type="text" id="co-tel" value="${esc(c.tel || '')}" placeholder="Optionnel" inputmode="tel"></div>
    </div>

    <div class="card" id="assoc-card" style="display:${c.type === 'ENC' ? 'block' : 'none'}">
      <h3>👥 Associés</h3>
      <p style="font-size:12px;color:var(--text-muted);margin:0 0 12px">Chaque associé crée un compte "Capital associé" (310, 311, ...)</p>
      <div id="assoc-list">
        ${associates.length === 0
          ? '<p style="color:var(--text-muted);font-size:13px;margin:0 0 12px">Aucun associé enregistré</p>'
          : associates.map((a, i) => `
            <div class="assoc-row">
              <span class="assoc-num">${310 + i}</span>
              <span class="assoc-name">Capital associé - ${esc(a.name)}</span>
              <button type="button" class="assoc-del del-assoc" data-index="${i}">🗑️</button>
            </div>`).join('')}
      </div>
      <div class="assoc-form">
        <input type="text" id="assoc-name" placeholder="Nom de l'associé" autocomplete="off">
        <button type="button" class="btn btn-primary" id="add-assoc">Ajouter</button>
      </div>
    </div>

    <button type="button" class="btn btn-primary btn-block" id="save-company" style="margin-bottom:14px">Enregistrer les paramètres</button>

    <div class="card">
      <h3>🎨 Thème</h3>
      <div class="theme-grid">
        <button type="button" class="theme-opt ${state.theme === 'jour' ? 'active' : ''}" data-theme="jour"><div class="dot" style="background:linear-gradient(135deg,#fff 50%,#f7f9fb 50%)"></div>Jour</button>
        <button type="button" class="theme-opt ${state.theme === 'nuit' ? 'active' : ''}" data-theme="nuit"><div class="dot" style="background:#0a0f1a"></div>Nuit</button>
        <button type="button" class="theme-opt ${state.theme === 'navy' ? 'active' : ''}" data-theme="navy"><div class="dot" style="background:#0b2545"></div>Navy</button>
        <button type="button" class="theme-opt ${state.theme === 'grenat' ? 'active' : ''}" data-theme="grenat"><div class="dot" style="background:#7b1023"></div>Grenat</button>
      </div>
    </div>

    <div class="card">
      <h3>💾 Données</h3>
      <div class="btn-row" style="margin-bottom:10px">
        <button type="button" class="btn btn-secondary" id="export-json">Exporter JSON</button>
        <button type="button" class="btn btn-secondary" id="import-json">Importer JSON</button>
      </div>
      <input type="file" id="import-file" accept=".json" style="display:none">
      <button type="button" class="btn btn-danger btn-block" id="reset-data" style="margin-top:10px">Réinitialiser mes données</button>
    </div>

    <div class="card">
      <h3>👤 Compte</h3>
      <p style="font-size:13px;color:var(--text-muted);margin:0 0 12px">
        <strong>${esc(state.user?.name || '')}</strong><br>${esc(state.user?.email || '')}
      </p>
      <p style="font-size:12px;color:var(--success);margin:0 0 12px">☁️ Synchronisé avec Firebase</p>
      <button type="button" class="btn btn-secondary btn-block" id="logout-btn">Se déconnecter</button>
    </div>

    <p style="text-align:center;color:var(--text-muted);font-size:11px;margin:20px 0">
      Compta+ v6.0 · Firebase Edition<br>Exercice : 1er octobre → 30 septembre
    </p>`;
}

function bindParams() {
  document.querySelectorAll('.type-card').forEach(b => b.onclick = () => {
    document.querySelectorAll('.type-card').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    const isEI = b.dataset.type === 'EI';
    document.getElementById('owner-field').style.display = isEI ? 'block' : 'none';
    document.getElementById('assoc-card').style.display = isEI ? 'none' : 'block';
  });

  document.querySelectorAll('.theme-opt').forEach(b => b.onclick = () => {
    state.theme = b.dataset.theme;
    applyTheme();
    document.querySelectorAll('.theme-opt').forEach(x => x.classList.toggle('active', x === b));
    updateThemeBtn();
    updateProfile({ theme: state.theme });
  });

  /* Logo upload */
  document.getElementById('upload-logo').onclick = () => document.getElementById('logo-file').click();
  document.getElementById('logo-file').onchange = async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const dataUrl = await compressImage(file, 200);
      const company = { ...(state.company || {}), logo: dataUrl };
      await updateProfile({ company });
      toast('Logo mis à jour ✓');
    } catch (ex) {
      console.error(ex);
      toast('Erreur de chargement');
    }
  };
  const removeBtn = document.getElementById('remove-logo');
  if (removeBtn) removeBtn.onclick = async () => {
    if (!confirm('Retirer le logo ?')) return;
    const company = { ...state.company };
    delete company.logo;
    await updateProfile({ company });
    toast('Logo retiré');
  };

  document.getElementById('add-assoc').onclick = async () => {
    const input = document.getElementById('assoc-name');
    const name = input.value.trim();
    if (!name) { toast('Entrez un nom'); return; }
    const associates = (state.company?.associates || []).slice();
    if (associates.length >= 90) { toast('Maximum 90 associés'); return; }
    associates.push({ name });
    const company = { ...(state.company || { name: 'Mon Entreprise', type: 'ENC' }), associates };
    try { await updateProfile({ company }); toast('Associé ajouté ✓'); }
    catch { toast('Erreur'); }
  };

  document.querySelectorAll('.del-assoc').forEach(b => b.onclick = async () => {
    const i = parseInt(b.dataset.index);
    if (!confirm('Supprimer cet associé ?')) return;
    const associates = (state.company?.associates || []).slice();
    associates.splice(i, 1);
    const company = { ...state.company, associates };
    try { await updateProfile({ company }); } catch { toast('Erreur'); }
  });

  document.getElementById('save-company').onclick = async () => {
    const type = document.querySelector('.type-card.active')?.dataset.type || 'EI';
    const existing = state.company?.associates || [];
    const existingLogo = state.company?.logo;
    const company = {
      name: document.getElementById('co-name').value.trim() || 'Mon Entreprise',
      type,
      ownerName: document.getElementById('co-owner').value.trim(),
      nif: document.getElementById('co-nif').value.trim(),
      addr: document.getElementById('co-addr').value.trim(),
      tel: document.getElementById('co-tel').value.trim(),
      associates: type === 'EI' ? [] : existing
    };
    if (existingLogo) company.logo = existingLogo;
    try {
      await updateProfile({ company });
      updateTopbarLogo();
      toast('Paramètres enregistrés ✓');
      state.view = 'dashboard'; render();
    } catch { toast('Erreur'); }
  };

  document.getElementById('logout-btn').onclick = () => { if (confirm('Se déconnecter ?')) logout(); };

  document.getElementById('reset-data').onclick = async () => {
    if (!confirm('⚠️ Effacer TOUTES les transactions et l\'entreprise ? Action irréversible.')) return;
    try {
      const snap = await db.collection('users').doc(state.currentUid).collection('transactions').get();
      const batch = db.batch();
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
      await updateProfile({ company: null });
      toast('Réinitialisé');
    } catch (ex) { toast('Erreur'); console.error(ex); }
  };

  document.getElementById('export-json').onclick = () => {
    const data = { company: state.company, transactions: state.transactions, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `compta-plus-${todayISO()}.json`;
    a.click();
  };

  document.getElementById('import-json').onclick = () => document.getElementById('import-file').click();
  document.getElementById('import-file').onchange = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.company) await updateProfile({ company: data.company });
        if (Array.isArray(data.transactions)) {
          const batch = db.batch();
          const col = db.collection('users').doc(state.currentUid).collection('transactions');
          data.transactions.forEach(tx => {
            const { id, ...rest } = tx;
            batch.set(col.doc(id || uid()), rest);
          });
          await batch.commit();
        }
        toast('Importé ✓');
      } catch (ex) { toast('Fichier invalide'); console.error(ex); }
    };
    reader.readAsText(file);
  };
}

/* Compresser une image en base64 (limite Firestore 1MB) */
function compressImage(file, maxSize = 200) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) { height *= maxSize / width; width = maxSize; }
        } else {
          if (height > maxSize) { width *= maxSize / height; height = maxSize; }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png', 0.85));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ============================================================
   EXPORT PDF — avec en-têtes normalisés
   ============================================================ */
function exportPDF(type) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const bal = computeBalances(filterTxByExercice(state.transactions, state.exercice));

  const titleMap = {
    bilan: 'BILAN',
    resultat: 'COMPTE DE RÉSULTAT',
    avoir: "ÉTAT DE L'AVOIR",
    balance: 'BALANCE GÉNÉRALE',
    grandlivre: 'GRAND LIVRE'
  };
  const stmtLabel = {
    bilan: 'Bilan',
    resultat: 'Compte de résultat',
    avoir: "État de l'avoir",
    balance: 'Balance générale',
    grandlivre: 'Grand livre'
  };
  const datePhrase = (type === 'bilan')
    ? `Au ${formatDateLongue(state.exercice.end)}`
    : `Pour l'exercice clos le ${formatDateLongue(state.exercice.end)}`;

  /* ---- EN-TÊTE NORMALISÉ ---- */
  doc.setFillColor(11, 37, 69);
  doc.rect(0, 0, pageW, 42, 'F');

  // Logo (si entreprise en a un)
  let headerTextX = 14;
  if (state.company?.logo) {
    try {
      doc.addImage(state.company.logo, 'PNG', 12, 8, 26, 26);
      headerTextX = 44;
    } catch (e) { /* ignore */ }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16); doc.setFont('helvetica', 'bold');
  doc.text(state.company?.name || '', headerTextX, 16);

  doc.setFontSize(12); doc.setFont('helvetica', 'normal');
  doc.text(stmtLabel[type] || '', headerTextX, 26);

  doc.setFontSize(10); doc.setFont('helvetica', 'italic');
  doc.text(datePhrase, headerTextX, 35);

  // Référence Compta+ à droite
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text('Compta+', pageW - 14, 12, { align: 'right' });

  doc.setTextColor(0, 0, 0);
  let y = 56;

  const headerStyle = { fillColor: [11, 37, 69], textColor: 255, fontStyle: 'bold' };
  const secFill = [240, 244, 250];

  /* ---- BILAN ---- */
  if (type === 'bilan') {
    const b = computeBilan(bal);
    const body = [];
    body.push([{ content: 'ACTIF IMMOBILISÉ', colSpan: 3, styles: { fontStyle: 'bold', fillColor: secFill } }]);
    b.actif.immo.items.forEach(a => body.push([a.label, a.acc, fmtN(a.solde)]));
    b.actif.amort.items.forEach(a => body.push([a.label, a.acc, fmtN(a.solde)]));
    body.push([{ content: 'Total actif immobilisé net', styles: { fontStyle: 'bold' } }, '', fmtN(b.actif.immo.total + b.actif.amort.total)]);
    if (b.actif.stocks.items.length) {
      body.push([{ content: 'STOCKS', colSpan: 3, styles: { fontStyle: 'bold', fillColor: secFill } }]);
      b.actif.stocks.items.forEach(a => body.push([a.label, a.acc, fmtN(a.solde)]));
    }
    if (b.actif.creances.items.length) {
      body.push([{ content: 'CRÉANCES', colSpan: 3, styles: { fontStyle: 'bold', fillColor: secFill } }]);
      b.actif.creances.items.forEach(a => body.push([a.label, a.acc, fmtN(a.solde)]));
    }
    if (b.actif.tresorerie.items.length) {
      body.push([{ content: 'TRÉSORERIE', colSpan: 3, styles: { fontStyle: 'bold', fillColor: secFill } }]);
      b.actif.tresorerie.items.forEach(a => body.push([a.label, a.acc, fmtN(a.solde)]));
    }
    body.push([{ content: 'TOTAL ACTIF', styles: { fontStyle: 'bold', fillColor: secFill } }, '', { content: fmtN(b.actif.totalActif), styles: { fontStyle: 'bold' } }]);
    doc.autoTable({ startY: y, head: [['ACTIF', 'Compte', 'Montant (HTG)']], body,
      theme: 'grid', headStyles: headerStyle, columnStyles: { 2: { halign: 'right', font: 'courier' } }, styles: { fontSize: 9, cellPadding: 3 } });
    y = doc.lastAutoTable.finalY + 12;

    const pb = [];
    pb.push([{ content: 'CAPITAUX PROPRES', colSpan: 3, styles: { fontStyle: 'bold', fillColor: secFill } }]);
    b.passif.capital.items.forEach(a => pb.push([a.label, a.acc, fmtN(a.solde)]));
    b.passif.reserves.items.forEach(a => pb.push([a.label, a.acc, fmtN(a.solde)]));
    b.passif.report.items.forEach(a => pb.push([a.label, a.acc, fmtN(a.solde)]));
    b.passif.expl.items.forEach(a => pb.push([a.label, a.acc, fmtN(a.solde)]));
    pb.push(["Résultat de l'exercice", '—', fmtN(b.passif.resultat)]);
    pb.push([{ content: 'Total capitaux propres', styles: { fontStyle: 'bold' } }, '', fmtN(b.passif.totalCapitaux)]);
    if (b.passif.dettesLT.items.length) {
      pb.push([{ content: 'DETTES À LONG TERME', colSpan: 3, styles: { fontStyle: 'bold', fillColor: secFill } }]);
      b.passif.dettesLT.items.forEach(a => pb.push([a.label, a.acc, fmtN(a.solde)]));
    }
    pb.push([{ content: 'PASSIF CIRCULANT', colSpan: 3, styles: { fontStyle: 'bold', fillColor: secFill } }]);
    b.passif.impots.items.forEach(a => pb.push([a.label, a.acc, fmtN(a.solde)]));
    b.passif.fourn.items.forEach(a => pb.push([a.label, a.acc, fmtN(a.solde)]));
    b.passif.prets.items.forEach(a => pb.push([a.label, a.acc, fmtN(a.solde)]));
    b.passif.divCh.items.forEach(a => pb.push([a.label, a.acc, fmtN(a.solde)]));
    pb.push([{ content: 'TOTAL PASSIF', styles: { fontStyle: 'bold', fillColor: secFill } }, '', { content: fmtN(b.passif.totalPassif), styles: { fontStyle: 'bold' } }]);
    doc.autoTable({ startY: y, head: [['PASSIF', 'Compte', 'Montant (HTG)']], body: pb,
      theme: 'grid', headStyles: headerStyle, columnStyles: { 2: { halign: 'right', font: 'courier' } }, styles: { fontSize: 9, cellPadding: 3 } });
  }

  /* ---- RÉSULTAT ---- */
  if (type === 'resultat') {
    const r = computeResultat(bal);
    const body = [];
    const pushG = (label, g) => {
      if (!g.items.length) return;
      body.push([{ content: label, colSpan: 3, styles: { fontStyle: 'bold', fillColor: secFill } }]);
      g.items.forEach(a => body.push([a.label, a.acc, fmtN(a.solde)]));
      body.push([{ content: 'Total', styles: { fontStyle: 'bold' } }, '', fmtN(g.total)]);
    };
    body.push([{ content: 'PRODUITS', colSpan: 3, styles: { fontStyle: 'bold', fillColor: secFill } }]);
    pushG('Ventes de marchandises', r.ventes);
    pushG('Production vendue et prestations', r.services);
    pushG('Autres revenus', r.autres);
    pushG('Revenus extraordinaires', r.extra);
    body.push([{ content: 'TOTAL PRODUITS', styles: { fontStyle: 'bold' } }, '', { content: fmtN(r.totalProduits), styles: { fontStyle: 'bold' } }]);
    body.push([{ content: 'CHARGES', colSpan: 3, styles: { fontStyle: 'bold', fillColor: secFill } }]);
    pushG('Achats de stocks', r.achats);
    pushG('Marchandises vendues', r.msesVend);
    pushG('Frais de vente', r.fraisV);
    pushG("Frais d'administration", r.fraisA);
    pushG('Autres frais', r.autresF);
    pushG('Impôts sur le revenu', r.impots);
    pushG('Pertes extraordinaires', r.pertes);
    pushG('Comptabilité analytique', r.analyt);
    body.push([{ content: 'TOTAL CHARGES', styles: { fontStyle: 'bold' } }, '', { content: fmtN(r.totalCharges), styles: { fontStyle: 'bold' } }]);
    body.push([{ content: r.resultat >= 0 ? 'BÉNÉFICE NET' : 'PERTE NETTE', styles: { fontStyle: 'bold', fillColor: secFill } }, '', { content: fmtN(Math.abs(r.resultat)), styles: { fontStyle: 'bold' } }]);
    doc.autoTable({ startY: y, head: [['Rubrique', 'Compte', 'Montant (HTG)']], body,
      theme: 'grid', headStyles: headerStyle, columnStyles: { 2: { halign: 'right', font: 'courier' } }, styles: { fontSize: 9, cellPadding: 3 } });
  }

  /* ---- ÉTAT DE L'AVOIR ---- */
  if (type === 'avoir') {
    const a = computeAvoir(bal, filterTxByExercice(state.transactions, state.exercice));
    const body = [
      ["Capital au début de l'exercice", '', fmtN(0)],
      ['Apports en capital', '', fmtN(a.capitalNet)]
    ];
    if (a.reserves) body.push(['Réserves', '', fmtN(a.reserves)]);
    if (a.report) body.push(['Bénéfices non répartis', '', fmtN(a.report)]);
    body.push([{ content: "Résultat net de l'exercice", styles: { fontStyle: 'bold' } }, '', { content: fmtN(a.resultat), styles: { fontStyle: 'bold' } }]);
    if (a.retraits) body.push(["Retraits de l'exploitant", '', '- ' + fmtN(a.retraits)]);
    body.push([{ content: "CAPITAL À LA FIN DE L'EXERCICE", styles: { fontStyle: 'bold', fillColor: secFill } }, '', { content: fmtN(a.totalAvoir), styles: { fontStyle: 'bold' } }]);

    doc.autoTable({ startY: y, head: [['Rubrique', 'Compte', 'Montant (HTG)']], body,
      theme: 'grid', headStyles: headerStyle, columnStyles: { 2: { halign: 'right', font: 'courier' } }, styles: { fontSize: 10, cellPadding: 4 } });
    y = doc.lastAutoTable.finalY + 12;

    // Détail capital par associé
    if (state.company.type === 'ENC' && (state.company.associates || []).length) {
      doc.setFontSize(11); doc.setFont('helvetica', 'bold');
      doc.text('Détail du capital par associé', 14, y);
      y += 3;
      const detail = state.company.associates.map((assoc, i) => [
        `Capital associé - ${assoc.name}`, String(310 + i), '—'
      ]);
      doc.autoTable({ startY: y, head: [['Associé', 'Compte', 'Montant']], body: detail,
        theme: 'striped', headStyles: headerStyle, styles: { fontSize: 9 } });
    }
  }

  /* ---- BALANCE ---- */
  if (type === 'balance') {
    const rows = Object.keys(bal).sort().map(a => [a, bal[a].label, fmtN(bal[a].debit), fmtN(bal[a].credit), fmtN(bal[a].debit - bal[a].credit)]);
    doc.autoTable({ startY: y, head: [['N°', 'Libellé', 'Débit', 'Crédit', 'Solde']], body: rows,
      theme: 'grid', headStyles: headerStyle,
      columnStyles: { 0: { font: 'courier' }, 2: { halign: 'right', font: 'courier' }, 3: { halign: 'right', font: 'courier' }, 4: { halign: 'right', font: 'courier' } },
      styles: { fontSize: 8, cellPadding: 2.5 } });
  }

  /* ---- GRAND LIVRE ---- */
  if (type === 'grandlivre') {
    const txs = filterTxByExercice(state.transactions, state.exercice).slice().sort((a, b) => a.date.localeCompare(b.date));
    const accounts = Object.keys(bal).sort();
    let cy = y;
    accounts.forEach(acc => {
      const lines = []; let run = 0;
      txs.forEach(t => {
        entriesFor(t).forEach(e => {
          if (e.acc === acc) {
            const d = e.side === 'D' ? t.amount : 0;
            const c = e.side === 'C' ? t.amount : 0;
            run += d - c;
            lines.push([formatDate(t.date), t.desc || TX_TYPES[t.type]?.label || '', d ? fmtN(d) : '', c ? fmtN(c) : '', fmtN(run)]);
          }
        });
      });
      if (!lines.length) return;
      if (cy > 250) { doc.addPage(); cy = 20; }
      doc.setFontSize(11); doc.setFont('helvetica', 'bold');
      doc.text(`${acc} — ${bal[acc].label}`, 14, cy);
      cy += 3;
      doc.autoTable({ startY: cy, head: [['Date', 'Libellé', 'Débit', 'Crédit', 'Solde']], body: lines,
        theme: 'striped', headStyles: { ...headerStyle, fontSize: 8 },
        columnStyles: { 2: { halign: 'right', font: 'courier' }, 3: { halign: 'right', font: 'courier' }, 4: { halign: 'right', font: 'courier' } },
        styles: { fontSize: 8, cellPadding: 2 } });
      cy = doc.lastAutoTable.finalY + 10;
    });
  }

  /* Pied de page */
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8); doc.setTextColor(120);
    doc.text(`Compta+ — ${titleMap[type]} — Page ${i}/${pageCount}`, pageW / 2, doc.internal.pageSize.getHeight() - 8, { align: 'center' });
  }
  doc.save(`${titleMap[type].replace(/[ '/]/g, '_')}_${state.company?.name?.replace(/\s+/g, '_') || 'entreprise'}_${state.exercice.label}.pdf`);
  toast('PDF exporté ✓');
}

/* ============================================================
   DÉMARRAGE + SERVICE WORKER
   ============================================================ */
(function start() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('service-worker.js').catch(() => {});
    });
  }
  // auth.onAuthStateChanged gère la suite
})();