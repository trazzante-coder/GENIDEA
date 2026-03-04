const carousel = document.getElementById('carousel');
const items = document.querySelectorAll('.item');
const dotsContainer = document.getElementById('dots');
let currDeg = 0;
let activeIdx = 0;
let timerId = null; // Cette variable va stocker le compte à rebours pour pouvoir l'arrêter

function init() {
    const gapAngle = 360 / items.length;
    // On réduit encore un peu le TZ sur mobile pour que les cartes de côté ne touchent pas les bords
    const tz = window.innerWidth < 768 ? 220 : 500; 

    items.forEach((item, i) => {
        const angle = i * gapAngle;
        item.style.transform = `rotateY(${angle}deg) translateZ(${tz}px)`;
        
        if (dotsContainer.children.length < items.length) {
            const d = document.createElement('div');
            d.className = `dot ${i === 0 ? 'active' : ''}`;
            dotsContainer.appendChild(d);
        }
    });
}

function rotate(dir) {
    const gapAngle = 360 / items.length;
    currDeg -= dir * gapAngle;
    activeIdx = (activeIdx + dir + items.length) % items.length;
    carousel.style.transform = `rotateX(-4deg) rotateY(${currDeg}deg)`;
    update();
}

function update() {
    items.forEach((item, i) => item.classList.toggle('active', i === activeIdx));
    document.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === activeIdx));
}

// Swipe tactile
let startX;
document.addEventListener('touchstart', e => startX = e.touches[0].clientX);
document.addEventListener('touchend', e => {
    let diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) rotate(diff > 0 ? 1 : -1);
});

window.addEventListener('resize', init);
init();

// Détecter le clic sur la carte active uniquement
document.querySelectorAll('.item').forEach((item, index) => {
    item.addEventListener('click', () => {
        if (item.classList.contains('active')) {
            openCard(index);
        }
    });
});

// On garde tes données MODES en haut du script
const MODES = {
    drawing: { 
        allColumns: [
            {id: "sujet", l:"Sujet", i:["Chevalier", "Robot", "Pirate", "Cyborg", "Samouraï", "Astronaute", "Monstre","chien","chat","enfant","voiture","vélo","tasse","chaise","vieux monsieur","vieille dame","souris","tortue","poisson","pauvre","riche"]},
            {id: "action", l:"Action", i:["En plein combat", "Qui dort", "Qui mange", "En train de courir", "Qui danse","assis","bois","mange","rigole","pleure","étonné","triste"]},
            {id: "lieu", l:"Lieu", i:["Forêt", "Espace", "Enfers", "Cyber-ville", "Plage", "Désert","Un bar","dans un salon","dans une cuisine","Egypte","Italie","France","Paradis","Terrain de foot","Balcon"]},
            {id: "style", l:"Style", i:["Manga", "Comics", "Réaliste", "Pixel Art", "Aquarelle","BD","Marvel","Caricature","Horreur","fin"]},
            {id: "couleur", l:"Palette", i:["Néon/Noir", "Pastel/Gris", "Or/Noir", "Rouge/Blanc","orange/bleu","bleu/vert","bleu/rouge","bleu/jaune","bleu/noir","rouge/vert","rouge/orange","rouge/gris","rouge/jaune","rouge/noir","rouge/blanc"]},
            {id: "meteo", l:"Météo", i:["Orage", "Brouillard", "Plein soleil", "Pluie acide","Gris","Canicule","Neige","Blizard"]},
            {id: "accessoire", l:"Objet", i:["Épée laser", "Livre ancien", "Masque", "Gants de boxe","Seringue","Cannette","Chapeau","Bonnet","Bague","Boucle d'oreille","Short","Bandana","Fusil","Lunette","Masque","Casquette","Baton"]}
        ]
    }
};

let selectedCols = ["sujet", "action", "style"]; // Colonnes par défaut

function openCard(index) {
    const overlay = document.getElementById('content-overlay');
    const dataZone = document.getElementById('category-data');
    dataZone.innerHTML = ""; 

    if (index === 0) renderGenerator(dataZone); 
    else if (index === 1) renderChrono(dataZone);
    else if (index === 2) { // SECTION CHALLENGES
    const cols = MODES.drawing.allColumns;
    const today = new Date();
    const dateSeed = today.getDate() + today.getMonth() + today.getFullYear();
    
    // 1. Logique de compteur
    let count200 = parseInt(localStorage.getItem('cercle_count') || "192");
    let aDejaParticipe = localStorage.getItem('cercle_deja_participe') === "true";
    const estComplet = count200 >= 200;
    const pourcentage = Math.min((count200 / 200) * 100, 100);

    const genererPhrase = (seed) => {
        const S = cols.find(c => c.id === "sujet")?.i || ["Un personnage"];
        const A = cols.find(c => c.id === "action")?.i || ["qui pose"];
        const L = cols.find(c => c.id === "lieu")?.i || ["dans un lieu"];
        
        const sujet = S[seed % S.length];
        const action = A[(seed + 1) % A.length];
        const lieu = L[(seed + 2) % L.length];
        
        return `${sujet} ${action} ${lieu}`;
    };

    const defi24h = genererPhrase(dateSeed);
    const seedCercle = parseInt(localStorage.getItem('cercle_seed') || "500");
    const defiCercle = genererPhrase(seedCercle);

    // 2. Injection HTML UNIQUE
    dataZone.innerHTML = `
        <h2 class="category-title">CHALLENGES</h2>
        
        <div class="card-mini">
            <span style="font-size: 0.55rem; background: rgba(168, 85, 247, 0.2); color: #a855f7; padding: 4px 8px; border-radius: 8px; float: right; font-weight:900;">24H</span>
            <h3 style="opacity:0.5; font-size:0.7rem;">AUJOURD'HUI</h3>
            <p style="font-weight: 900; margin: 15px 0; font-size: 1.1rem; color:#fff;">"${defi24h}"</p>
            <button class="launch-btn" onclick="closeOverlay()">DESSINER</button>
        </div>

        <div class="card-mini" style="margin-top: 20px; border: 1px solid ${estComplet ? '#27AE60' : '#D4AC0D'};">
            <h3 style="color: #D4AC0D; font-size:0.8rem;">LE CERCLE DES 200</h3>
            <p style="font-size: 0.7rem; margin: 10px 0; opacity: 0.5;">DÉFI :</p>
            <p style="font-weight: 700; color: #D4AC0D; margin-bottom:10px;">"${defiCercle}"</p>
            
            <div onclick="toggleReglement()" style="cursor:pointer; margin-bottom:15px; display:inline-block;">
                <span style="font-size:0.55rem; color:#D4AC0D; border-bottom:1px dashed #D4AC0D; opacity:0.8;">Lire le règlement du concours</span>
            </div>

            <div id="reglement-zone" style="display:none; background:rgba(0,0,0,0.3); padding:15px; border-radius:12px; margin-bottom:15px; text-align:left; border:1px solid rgba(212, 172, 13, 0.2);">
                <h4 style="font-size:0.6rem; color:#D4AC0D; margin-top:0; letter-spacing:1px;">RÈGLES DE L'ATELIER</h4>
                <ul style="font-size:0.55rem; color:#eee; padding-left:15px; line-height:1.4; margin-bottom:0;">
                    <li>Une seule participation par artiste.</li>
                    <li>Le dessin doit inclure TOUS les éléments du défi.</li>
                    <li>Pas d'IA, uniquement du traditionnel ou digital main.</li>
                    <li>Le Maître de l'Atelier valide chaque entrée manuellement.</li>
                    <li>Tous supports autorisés (traditionnel et numérique).</li>
                </ul>
            </div>

            <div style="font-size: 0.55rem; display: flex; justify-content: space-between; margin-bottom:5px;">
                <span>${estComplet ? '🏁 EN ATTENTE DES RÉSULTATS' : `PLACES : ${count200} / 200`}</span>
                <span>${Math.floor(pourcentage)}%</span>
            </div>
            
            <div style="background: rgba(255,255,255,0.05); height: 6px; border-radius: 10px; overflow: hidden; margin-bottom:20px;">
                <div style="width: ${pourcentage}%; height: 100%; background: ${estComplet ? '#27AE60' : '#D4AC0D'}; box-shadow: 0 0 10px ${estComplet ? '#27AE60' : '#D4AC0D'}; transition: 0.5s;"></div>
            </div>

            ${estComplet 
                ? `<p style="font-size:0.6rem; text-align:center; opacity:0.6;">Le cercle est complet. Le jury examine les créations.</p>` 
                : aDejaParticipe 
                    ? `<button class="launch-btn" style="background:rgba(255,255,255,0.1) !important; color:gray !important; cursor:default;">DÉJÀ PARTICIPÉ ✅</button>`
                    : `<button class="launch-btn" style="background: #D4AC0D !important; border:none;" onclick="ouvrirSoumissionCercle()">REJOINDRE AVEC PHOTO</button>`
            }
        </div>`;
}
else if (index === 3) { // SECTION ENTRAÎNEMENT
        const jourIndex = new Date().getDay(); 
        const tousLesExos = [
            "Un cube en 3D vue de dessus", "Une sphère avec ombre portée", "Un nez de profil", "Une main ouverte", "Un drapé simple",
            "Un oeil réaliste", "Une perspective à 2 points", "Un visage d'homme moustachu", "Une oreille", "Un arbre sans feuilles",
            "Une bouche qui sourit", "Une chaussure de sport", "Un paysage de montagne", "Une main qui tient un crayon", "Un chat assis",
            "Des hachures croisées", "Un portrait de trois-quarts", "Une voiture simplifiée", "Un escalier en perspective", "Des nuages réalistes",
            "Une texture de bois", "Une clé ancienne", "Un buste de statue", "Un verre d'eau", "Un autoportrait rapide",
            "Une rue de ville", "Un crâne humain", "Un animal fantastique", "Une fleur détaillée", "Une plume",
            "Un drapé sur une chaise", "Un pied", "Un objet en métal", "Une forêt au loin", "Un personnage qui court"
        ]; // <-- Fermé avec ] et non }

        const depart = (jourIndex === 0 ? 6 : jourIndex - 1) * 5; 
        const exosDuJour = tousLesExos.slice(depart, depart + 5);

        let htmlExos = "";
        exosDuJour.forEach((exo, i) => {
            const estFait = localStorage.getItem(`exo_${jourIndex}_${i}`) === "true";
            htmlExos += `
                <div onclick="validerExo(${jourIndex}, ${i})" style="display:flex; align-items:center; background:rgba(255,255,255,0.05); padding:15px; border-radius:12px; margin-bottom:10px; cursor:pointer; border-left: 4px solid ${estFait ? '#27AE60' : '#444'};">
                    <div style="flex-grow:1;">
                        <span style="font-size:0.5rem; opacity:0.5;">EXERCICE ${i+1}</span>
                        <div style="font-size:0.9rem; color:${estFait ? '#27AE60' : '#fff'};">${exo}</div>
                    </div>
                    <div>${estFait ? '✅' : '⭕'}</div>
                </div>`;
        });

        dataZone.innerHTML = `
            <h2 class="category-title">ENTRAÎNEMENT</h2>
            <p style="font-size:0.7rem; opacity:0.6; margin-bottom:20px;">5 exercices quotidiens pour forger ta discipline.</p>
            ${htmlExos}
            <div style="margin-top:20px; padding:15px; background:rgba(255,255,255,0.03); border-radius:15px; text-align:center;">
                <div style="font-size:0.6rem; opacity:0.5;">SÉANCE DE LA SEMAINE</div>
                <div style="font-size:1.2rem; font-weight:bold;">${typeof calculerTotalSemaine === 'function' ? calculerTotalSemaine() : 0} / 35</div>
            </div>`;
    } // <-- Fermeture propre de l'index 3
    else if (index === 4) { // GALERIE
        const gagnants = [
            { art: "Aiko_Draw", défi: "Samouraï / Futur", img: 55 },
            { art: "Mecha_Design", défi: "Robot / Désert", img: 58 },
            { art: "Cyber_Punk", défi: "Cyborg / Pluie", img: 62 },
            { art: "Pixel_Master", défi: "Chevalier / Forêt", img: 70 }
        ];

        dataZone.innerHTML = `
            <h2 class="category-title">GALERIE</h2>
            <p class="category-subtitle">Les Maîtres du Cercle</p>
            <div class="grille-prestige">
                ${gagnants.map(g => `
                    <div class="gallery-card">
                        <div class="gallery-img-container">
                            <img src="https://picsum.photos/seed/${g.img}/300" alt="Dessin">
                            <div class="artist-tag">👤 ${g.art}</div>
                        </div>
                        <div class="challenge-info">
                            <span>DÉFI</span>
                            <p>${g.défi}</p>
                        </div>
                    </div>
                `).join('')}
            </div>`;
    }
    else if (index === 5) { // SECTION PROFIL
        const pseudo = localStorage.getItem('user_pseudo') || "Artiste Anonyme";
        const styleArt = localStorage.getItem('user_style') || "Non défini";
        const totalExos = calculerTotalSemaine();
        const participeCercle = localStorage.getItem('cercle_deja_participe') === "true";
        
        // CORRECTION ICI : On récupère la valeur en temps réel
        const nbGenerations = parseInt(localStorage.getItem('stats_gen_total') || "0");
        const moyenneGen = (nbGenerations / 7).toFixed(1);

    dataZone.innerHTML = `
        <h2 class="category-title">MON PRESTIGE</h2>
        
        <div style="text-align:center; margin-bottom:20px;">
            <div onclick="changerAvatar()" style="width:80px; height:80px; background:linear-gradient(45deg, #a855f7, #27AE60); border-radius:50%; margin:0 auto 10px; display:flex; align-items:center; justify-content:center; font-size:2rem; cursor:pointer; border:3px solid rgba(255,255,255,0.1); box-shadow: 0 0 15px rgba(168, 85, 247, 0.4);">
                ${localStorage.getItem('user_avatar') || '🎨'}
            </div>
            <h3 id="display-pseudo" onclick="editerProfil()" style="margin:0; color:#fff; font-size:1.2rem;">${pseudo} <i class="fa-solid fa-pen" style="font-size:0.7rem; opacity:0.5;"></i></h3>
            <p style="font-size:0.7rem; color:#27AE60; margin-top:5px; letter-spacing:1px;">STYLE : ${styleArt.toUpperCase()}</p>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:20px;">
            <div class="card-mini" style="padding:10px; text-align:center; background:rgba(255,255,255,0.03);">
                <span style="font-size:0.6rem; opacity:0.5; display:block;">TOTAL GÉNÉRATIONS</span>
                <strong style="color:#a855f7; font-size:1.2rem;">${nbGenerations}</strong>
            </div>
            <div class="card-mini" style="padding:10px; text-align:center; background:rgba(255,255,255,0.03);">
                <span style="font-size:0.6rem; opacity:0.5; display:block;">MOYENNE / J</span>
                <strong style="color:#27AE60; font-size:1.2rem;">${moyenneGen}</strong>
            </div>
        </div>

        <div class="card-mini" style="margin-bottom:20px; border-left: 4px solid ${participeCercle ? '#D4AC0D' : '#444'};">
            <h4 style="font-size:0.7rem; margin:0 0 10px 0; opacity:0.8;">CERCLE DES 200</h4>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:0.8rem;">Statut :</span>
                <span style="color:${participeCercle ? '#D4AC0D' : '#666'}; font-weight:bold;">
                    ${participeCercle ? 'INSCRIT ✅' : 'NON INSCRIT ⭕'}
                </span>
            </div>
        </div>
     
        <div style="margin-top:20px; border-top:1px solid rgba(255,255,255,0.1); padding-top:20px; text-align:center;">
            <button class="launch-btn" onclick="exporterDonnees()" style="background:rgba(255,255,255,0.1) !important; font-size:0.7rem;">
                💾 GÉNÉRER MON CODE DE RÉCUPÉRATION
            </button>
            <p style="font-size:0.55rem; opacity:0.4; margin-top:10px; line-height:1.2;">
                Copie ce code pour ne pas perdre ton Prestige en changeant de téléphone.
            </p>
            <textarea id="notes-profil" class="notes-prestige" placeholder="Tes objectifs de la semaine..."></textarea>
        </div>
    `; // On ferme le template string ici

    // Sauvegarde des notes (Vérifie que c'est bien APRES l'injection du innerHTML)
    const notes = document.getElementById('notes-profil');
    if (notes) {
        notes.value = localStorage.getItem('notesPrestige') || "";
        notes.oninput = () => localStorage.setItem('notesPrestige', notes.value);
    }
} // Fin de l'index 5

   overlay.classList.add('active'); // LA LIGNE QUI OUVRE ENFIN LA FENÊTRE
} // FIN DE LA FONCTION OPENCARD

function renderGenerator(container) {
    // 1. On prépare le début de la carte (Titre et Menu de sélection)
    let menuHtml = `
        <h2 class="category-title">GÉNÉRATEUR</h2>
        <p class="category-subtitle">Configurez vos colonnes</p>
        <div class="selector-menu">`;
    
    // 2. On crée les petits boutons (Sujet, Action...) pour choisir ses colonnes
    MODES.drawing.allColumns.forEach(col => {
        const activeClass = selectedCols.includes(col.id) ? 'active' : '';
        menuHtml += `<button class="col-btn ${activeClass}" onclick="toggleColumn('${col.id}')">${col.l}</button>`;
    });

    // 3. On ferme le menu et on prépare la zone où les slots vont s'afficher
    // C'est ici qu'on ajoute notre nouveau groupe de boutons (LANCER + AUTO)
    menuHtml += `</div>
                 <div id="active-slots" class="slots-container"></div>
                 
                 <div class="btn-group-gen" style="display: flex; gap: 10px; margin-top: 20px;">
                    <button class="launch-btn" style="flex: 3; margin-top:0;" onclick="spinSlots()">✨ LANCER LE TIRAGE</button>
                    <button class="auto-btn-prestige" style="flex: 1; background: #eee; border: none; border-radius: 15px; cursor: pointer; font-size: 1.2rem;" onclick="genererAutoPrestige()">🎲 AUTO</button>
                 </div>`;
    
    // 4. On injecte tout le texte HTML d'un coup dans l'overlay
    container.innerHTML = menuHtml;

    // 5. On demande à l'autre fonction de dessiner les slots (les rouleaux)
    renderSlots();
}

function toggleColumn(colId) {
    if (selectedCols.includes(colId)) {
        if (selectedCols.length > 1) selectedCols = selectedCols.filter(c => c !== colId);
    } else {
        if (selectedCols.length < 8) selectedCols.push(colId);
    }
    renderGenerator(document.getElementById('category-data'));
}

function renderSlots() {
    const slotArea = document.getElementById('active-slots');
    const activeData = MODES.drawing.allColumns.filter(c => selectedCols.includes(c.id));

    slotArea.innerHTML = activeData.map((s, i) => `
        <div class="slot-box" id="box-${i}">
            <div class="slot-label">${s.l}</div>
            <div class="reel-container">
                <div id="reel-${i}" class="reel">
                    ${s.i.map(item => `<div class="option">${item}</div>`).join('')}
                </div>
            </div>
            <button class="lock-btn" onclick="this.parentElement.classList.toggle('locked')">FIXER</button>
        </div>
    `).join('');
}

function spinSlots() {
    let totalGen = parseInt(localStorage.getItem('stats_gen_total') || "0");
    localStorage.setItem('stats_gen_total', totalGen + 1);
    const h = 60; // Hauteur d'une option
    const activeData = MODES.drawing.allColumns.filter(c => selectedCols.includes(c.id));

    activeData.forEach((s, idx) => {
        const parentBox = document.getElementById(`box-${idx}`);
        if (parentBox.classList.contains('locked')) return;

        const reel = document.getElementById(`reel-${idx}`);
        const rand = Math.floor(Math.random() * s.i.length);
        
        reel.style.transform = `translateY(-${rand * h}px)`;
    });
}

function closeCard() {
    console.log("Tentative de fermeture..."); // Si tu vois ça dans la console (F12), le bouton marche.
    document.getElementById('content-overlay').classList.remove('active');
}
// --- FONCTIONS POUR LE CHRONO ---
let timeLeft = 300; 

let totalTime = 300; // Pour garder la référence du temps de départ

function renderChrono(container) {
    container.innerHTML = `
        <h2 class="category-title">CHRONO</h2>
        <p class="category-subtitle">Discipline & Rapidité</p>
        
        <div class="chrono-setup">
            <div class="timer-container">
                <svg class="timer-svg" viewBox="0 0 160 160">
                    <circle class="bg-circle" cx="80" cy="80" r="70"></circle>
                    <circle id="progress-bar" class="progress-bar" cx="80" cy="80" r="70"></circle>
                </svg>
                <div id="chrono-display" class="timer-circle">05:00</div>
            </div>
            
            <div id="challenge-box" class="challenge-display">Prêt pour un défi flash ?</div>
            
            <div class="time-presets">
                <button class="time-btn" onclick="setTime(30)">30s</button>
                <button class="time-btn" onclick="setTime(60)">1m</button>
                <button class="time-btn" onclick="setTime(180)">3m</button>
                <button class="time-btn" onclick="setTime(300)">5m</button>
            </div>
            
            <button class="launch-btn" onclick="startChronoSession()">LANCER LE DÉFI</button>
        </div>
    `;
    updateTimerDisplay();
}

function setTime(seconds) {
    timeLeft = seconds;
    totalTime = seconds; // On enregistre le maximum pour le calcul du cercle
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const display = document.getElementById('chrono-display');
    const progressBar = document.getElementById('progress-bar');
    
    if(display) {
        display.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    if(progressBar) {
        // Calcul de l'effacement : 440 est la longueur totale du trait
        const offset = 440 - (timeLeft / totalTime) * 440;
        progressBar.style.strokeDashoffset = offset;
    }
}

function startChronoSession() {
    // 1. Tirage au sort
    const allCols = MODES.drawing.allColumns;
    const sujetCol = allCols.find(c => c.id === "sujet");
    const others = allCols.filter(c => c.id !== "sujet").sort(() => 0.5 - Math.random());
    const selectedCols = [sujetCol, others[0], others[1]];

    const resultHtml = selectedCols.map(col => {
        const word = col.i[Math.floor(Math.random() * col.i.length)];
        return `<div style="margin:5px 0;"><strong>${col.l} :</strong> ${word}</div>`;
    }).join('');

    const box = document.getElementById('challenge-box');
    box.innerHTML = resultHtml;
    box.classList.add('active');
    box.style.borderColor = "rgba(0,0,0,0.05)"; // Reset couleur si on rejoue

    // 2. Gestion du bouton
    const launchBtn = document.querySelector('.launch-btn');
    launchBtn.style.display = 'block'; // On s'assure qu'il est visible
    launchBtn.innerText = "GO !";
    launchBtn.style.background = "#FFD700";
    launchBtn.onclick = startCountdown; 
}

function finishSession() {
    const box = document.getElementById('challenge-box');
    const display = document.getElementById('chrono-display');
    const launchBtn = document.querySelector('.launch-btn');
    
    if(launchBtn) launchBtn.style.display = 'none'; // Cache le bouton STOP
    
    display.innerHTML = "FIN";
    display.style.color = "#FF4444";
    
    box.innerHTML = `
        <h3 style="margin-bottom:10px;">BRAVO !</h3>
        <p>Session terminée.</p>
        <button class="launch-btn" onclick="openCard(1)" style="margin-top:15px; background:black; color:white; display:block;">NOUVEAU DÉFI</button>
    `;
}

function startCountdown() {
    const launchBtn = document.querySelector('.launch-btn');
    
    // Si on clique alors que ça tourne déjà, ça devient un "STOP"
    if (timerId) {
        stopCountdown();
        return;
    }

    launchBtn.innerText = "STOP";
    launchBtn.style.background = "#FF4444";
    launchBtn.style.color = "#fff";

    timerId = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimerDisplay();
        } else {
            clearInterval(timerId);
            timerId = null;
            finishSession();
        }
    }, 1000);
}

function stopCountdown() {
    clearInterval(timerId);
    timerId = null;

    const launchBtn = document.querySelector('.launch-btn');
    launchBtn.innerText = "REPRENDRE";
    launchBtn.style.background = "#FFD700";
    launchBtn.style.color = "#000";

    const box = document.getElementById('challenge-box');
    
    // On vérifie si les options existent déjà
    if (!document.getElementById('reset-options')) {
        const optionsDiv = document.createElement('div');
        optionsDiv.id = "reset-options";

        optionsDiv.innerHTML = `
            <button class="btn-secondary" onclick="resetTimer()">
                <span>↩</span> Recommencer
            </button>
            <button class="btn-secondary" onclick="openCard(1)">
                <span>🔄</span> Nouveau défi
            </button>
        `;
        box.appendChild(optionsDiv);
    }
}

// Modifie aussi ta fonction closeCard pour qu'elle arrête le bruit/chrono en sortant
function closeCard() {
    console.log("Tentative de fermeture...");
    document.getElementById('content-overlay').classList.remove('active');
    clearInterval(timerId); // Sécurité : on arrête le chrono si on ferme la carte
}
function resetTimer() {
    // 1. On arrête le chrono s'il tourne
    clearInterval(timerId);
    timerId = null;

    // 2. On remet le temps à sa valeur initiale choisie (30s, 2m, etc.)
    timeLeft = totalTime;
    updateTimerDisplay();

    // 3. On remet le bouton sur GO
    const launchBtn = document.querySelector('.launch-btn');
    if (launchBtn) {
        launchBtn.innerText = "GO !";
        launchBtn.style.background = "#FFD700";
        launchBtn.style.color = "#000";
        launchBtn.onclick = startCountdown;
        launchBtn.style.display = 'block';
    }
    
    // 4. On nettoie les boutons temporaires s'ils existent
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) resetBtn.remove();
}

function genererAutoPrestige() {
    // AJOUT : On incrémente le compteur global
    let totalGen = parseInt(localStorage.getItem('stats_gen_total') || "0");
    localStorage.setItem('stats_gen_total', totalGen + 1);
    // 1. On récupère tous les IDs de colonnes sauf le "sujet"
    const otherIds = MODES.drawing.allColumns
        .map(c => c.id)
        .filter(id => id !== "sujet");
    
    // 2. On décide d'un nombre aléatoire d'options SUPPLÉMENTAIRES (entre 1 et 5)
    // + le sujet, ça fera entre 2 et 6 colonnes au total
    const nbOptions = Math.floor(Math.random() * 5) + 1; 
    
    // 3. On mélange les autres colonnes et on en pioche 'nbOptions'
    const shuffledExtras = otherIds.sort(() => 0.5 - Math.random()).slice(0, nbOptions);
    
    // 4. On définit selectedCols avec le Sujet TOUJOURS présent + les extras
    selectedCols = ["sujet", ...shuffledExtras];
    
    // 5. On rafraîchit l'affichage du générateur
    renderGenerator(document.getElementById('category-data'));
    
    // 6. On lance le spin après un court délai pour l'effet visuel
    setTimeout(spinSlots, 100);

    // On force le rafraîchissement visuel du profil si on est dessus
    if (document.getElementById('notes-profil')) {
    openCard(5); }
}
// --- FONCTIONS UTILITAIRES ---

function injecterDefi(texte) {
    // 1. On ferme l'overlay des challenges
    closeOverlay();
    
    // 2. On attend la fin de l'animation de fermeture (300ms)
    setTimeout(() => {
        // 3. On ouvre la carte du générateur (index 0)
        openCard(0);
        
        // 4. On prévient l'utilisateur (ou tu peux supprimer l'alert si tu préfères la discrétion)
        console.log("Défi injecté : " + texte);
    }, 300);
}
function participerCercle() {
    let count = parseInt(localStorage.getItem('cercle_count') || "192");
    count++;
    localStorage.setItem('cercle_count', count);

    // Si on atteint un multiple de 200, le défi va changer automatiquement
    if (count % 200 === 0) {
        alert("BRAVO ! L'objectif des 200 est atteint. Nouveau challenge débloqué !");
    }

    // On rafraîchit l'affichage sans fermer pour voir la barre monter
    openCard(2); 
}
// 1. L'utilisateur tente de rejoindre
function ouvrirSoumissionCercle() {
    const confirmation = confirm("RÈGLEMENT : Un seul envoi autorisé. Ton dessin doit respecter strictement le défi. Continuer ?");
    if(confirmation) {
        // Ici, on simule l'envoi de la photo
        alert("Photo envoyée au jury ! Le compteur augmentera après validation.");
        
        // On marque que cet utilisateur a déjà participé
        localStorage.setItem('cercle_deja_participe', "true");
        
        // Optionnel : Pour tes tests, tu peux appeler validerDessin() manuellement dans la console
        openCard(2); // Rafraîchit l'affichage
    }
}

// 2. TA FONCTION DE JUGE (À taper dans la console du navigateur pour l'instant)
// Tape : validerDessin() pour ajouter +1
// Tape : rejeterDessin() pour libérer la place de l'utilisateur
function validerDessin() {
    let count = parseInt(localStorage.getItem('cercle_count') || "0");
    if (count < 200) {
        count++;
        localStorage.setItem('cercle_count', count);
        console.log("Dessin validé ! Nouveau score : " + count);
    } else {
        console.log("Le cercle est déjà plein (200).");
    }
}

function rejeterDessin() {
    // Si tu juges que ce n'est pas bon, on redonne le droit à l'utilisateur de retenter
    localStorage.setItem('cercle_deja_participe', "false");
    alert("Dessin refusé par l'atelier. Tu peux soumettre une nouvelle œuvre.");
}

// 3. FONCTION POUR RESET LE CONCOURS (Quand le concours est fini)
function nouveauConcoursCercle() {
    localStorage.setItem('cercle_count', "0");
    localStorage.setItem('cercle_deja_participe', "false");
    // On change la graine pour avoir un nouveau défi aléatoire
    const nouvelleSeed = Math.floor(Math.random() * 1000);
    localStorage.setItem('cercle_seed', nouvelleSeed);
    alert("Nouveau concours lancé !");
}
function toggleReglement() {
    const zone = document.getElementById('reglement-zone');
    if(zone) zone.style.display = (zone.style.display === 'none') ? 'block' : 'none';
}

function ouvrirSoumissionCercle() {
    if(confirm("Confirmer l'envoi de ta création au Maître de l'Atelier ?")) {
        localStorage.setItem('cercle_deja_participe', "true");
        openCard(2); // On recharge l'affichage
    }
}
function validerExo(jour, i) {
    const key = `exo_${jour}_${i}`;
    const estFait = localStorage.getItem(key) === "true";
    localStorage.setItem(key, !estFait);
    
    // On relance l'affichage pour voir le ✅ immédiatement
    openCard(3); 
}
function calculerTotalSemaine() {
    let total = 0;
    const jours = [0, 1, 2, 3, 4, 5, 6]; // Dimanche à Samedi
    jours.forEach(j => {
        for (let i = 0; i < 5; i++) {
            if (localStorage.getItem(`exo_${j}_${i}`) === "true") {
                total++;
            }
        }
    });
    return total;
}
function editerProfil() {
    const nouveauPseudo = prompt("Ton nouveau Pseudo :", localStorage.getItem('user_pseudo') || "");
    const nouveauStyle = prompt("Ton style (ex: Manga, Semi-Réalisme, Concept Art) :", localStorage.getItem('user_style') || "");
    
    if (nouveauPseudo) localStorage.setItem('user_pseudo', nouveauPseudo);
    if (nouveauStyle) localStorage.setItem('user_style', nouveauStyle);
    
    openCard(5); // Rafraîchir la vue
}

function changerAvatar() {
    const avatars = ['🎨', '🖌️', '🖍️', '✏️', '✒️', '🖼️', '🎭', '👾'];
    let actuel = localStorage.getItem('user_avatar') || '🎨';
    let index = avatars.indexOf(actuel);
    let suivant = avatars[(index + 1) % avatars.length];
    
    localStorage.setItem('user_avatar', suivant);
    openCard(5); // Rafraîchir la vue
}
function exporterDonnees() {
    // On récupère tout ce qui commence par "user_", "exo_" ou "cercle_"
    const backup = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('user_') || key.startsWith('exo_') || key.startsWith('cercle_') || key === 'notesPrestige') {
            backup[key] = localStorage.getItem(key);
        }
    }

    const codeSecret = btoa(JSON.stringify(backup)); // On transforme en code "secret" (base64)
    
    // On affiche le code dans une alerte ou un prompt pour qu'il puisse le copier
    const inputStyle = "width:100%; padding:10px; background:#222; color:#27AE60; border:1px solid #27AE60; font-family:monospace; margin-top:10px;";
    
    const dataZone = document.getElementById('category-data');
    dataZone.innerHTML = `
        <h2 class="category-title">SAUVEGARDE</h2>
        <p style="font-size:0.8rem; margin-bottom:20px;">Copie ce code et garde-le précieusement :</p>
        <textarea readonly style="${inputStyle}" rows="8">${codeSecret}</textarea>
        <button class="launch-btn" onclick="openCard(5)" style="margin-top:20px;">RETOUR AU PROFIL</button>
    `;
}
