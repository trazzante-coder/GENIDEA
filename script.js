const carousel = document.getElementById('carousel');
const items = document.querySelectorAll('.item');
const dotsContainer = document.getElementById('dots');
let currDeg = 0;
let activeIdx = 0;
let timerId = null; // Cette variable va stocker le compte à rebours pour pouvoir l'arrêter

function init() {
    const gapAngle = 360 / items.length;
    // On réduit encore un peu le TZ sur mobile pour que les cartes de côté ne touchent pas les bords
    const tz = window.innerWidth < 768 ? 200 : 500; 

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
    else if (index === 2) { // CHALLENGE
        dataZone.innerHTML = `
            <h2 class="category-title">CHALLENGES</h2>
            <div class="card-mini">
                <span class="timer-badge">⏳ 14H 22M</span>
                <h3>DÉFI 24H</h3>
                <p class="theme-highlight">"${MODES.drawing.allColumns[0].i[0]} en plein désert"</p>
                <button class="launch-btn">PARTICIPER</button>
            </div>
            <div class="card-mini" style="margin-top:20px;">
                <h3>LE CERCLE DES 200</h3>
                <p style="font-size:0.8rem">192 / 200 participants</p>
                <div class="progress-container"><div class="progress-bar" style="width:92%"></div></div>
                <button class="launch-btn" style="background:#D4AC0D">REJOINDRE</button>
            </div>`;
    }
        else if (index === 3) { // GALERIE (Le Cercle des 200)
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

    else if (index === 4) { // PROFIL
        dataZone.innerHTML = `
            <h2 class="category-title">PROFIL</h2>
            <div class="avatar-circle" style="background:#E74C3C; width:80px; height:80px; margin:20px auto; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:2rem;">👤</div>
            <textarea id="notes-profil" class="notes-prestige" placeholder="Tes notes d'artiste..."></textarea>`;
        
        const notes = document.getElementById('notes-profil');
        notes.value = localStorage.getItem('notesPrestige') || "";
        notes.oninput = () => localStorage.setItem('notesPrestige', notes.value);
    }
    overlay.classList.add('active');
}

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
}

