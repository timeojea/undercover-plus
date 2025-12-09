// --- TRADUCTIONS & CONFIG ---
let currentLang = 'fr';

const translations = {
    fr: {
        players_title: "Joueurs",
        add_player_btn: "+ Ajouter un joueur",
        settings_title: "Paramètres",
        theme_label: "Thème des mots",
        mix_all: "Tout mélanger",
        start_btn: "Lancer la partie",
        pass_phone: "Passez le téléphone à ce joueur",
        hold_reveal: "Maintenir pour voir",
        validate_btn: "Valider",
        in_game: "En jeu",
        quit_btn: "Quitter / Rejouer",
        add_player_modal: "Ajouter un joueur",
        tab_new: "Nouveau",
        tab_import: "Importer",
        change_photo: "Changer photo",
        add_btn: "Ajouter",
        close_btn: "Fermer",
        secret_check: "Vérification secrète",
        not_enough: "Pas assez de joueurs !",
        name_empty: "Nom vide !",
        already_in: "Ce joueur est déjà dans la partie !",
        incorrect_code: "Code incorrect !",
        enter_pin: "Entrez le code PIN pour supprimer ce joueur :",
        eliminate_confirm: "Éliminer",
        is_eliminated: "est éliminé !",
        role: "Rôle",
        word: "Mot",
        mr_white: "VOUS ÊTES MR. WHITE"
    },
    en: {
        players_title: "Players",
        add_player_btn: "+ Add Player",
        settings_title: "Settings",
        theme_label: "Word Theme",
        mix_all: "Mix Everything",
        start_btn: "Start Game",
        pass_phone: "Pass the phone to this player",
        hold_reveal: "Hold to reveal",
        validate_btn: "Next",
        in_game: "In Game",
        quit_btn: "Quit / Replay",
        add_player_modal: "Add Player",
        tab_new: "New",
        tab_import: "Import",
        change_photo: "Change photo",
        add_btn: "Add",
        close_btn: "Close",
        secret_check: "Secret Check",
        not_enough: "Not enough players!",
        name_empty: "Empty name!",
        already_in: "Player already in game!",
        incorrect_code: "Incorrect code!",
        enter_pin: "Enter PIN code to delete player:",
        eliminate_confirm: "Eliminate",
        is_eliminated: "is eliminated!",
        role: "Role",
        word: "Word",
        mr_white: "YOU ARE MR. WHITE"
    }
};

// --- DATA & INIT ---
let savedPlayers = JSON.parse(localStorage.getItem('undercover_db')) || [];
let currentPlayers = []; 
let gameData = []; 
let settings = { undercover: 1, white: 0 };

function saveDB() {
    localStorage.setItem('undercover_db', JSON.stringify(savedPlayers));
}

window.onload = function() {
    if (typeof DATABASE === 'undefined') return alert("Erreur: data.js manquant");
    setLanguage('fr'); // Langue par défaut
};

function setLanguage(lang) {
    currentLang = lang;
    
    // UI Update
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if(translations[lang][key]) el.innerText = translations[lang][key];
    });
    document.getElementById('new-player-name').placeholder = lang === 'fr' ? "Nom du joueur" : "Player name";

    // Boutons actifs
    document.getElementById('btn-fr').classList.toggle('active', lang === 'fr');
    document.getElementById('btn-en').classList.toggle('active', lang === 'en');

    // Mettre à jour la liste des catégories
    updateCategorySelect();
}

function updateCategorySelect() {
    const select = document.getElementById('category-select');
    select.innerHTML = "";
    
    // Option "Tout mélanger"
    let allOpt = document.createElement('option');
    allOpt.value = "all";
    allOpt.innerText = translations[currentLang].mix_all;
    select.appendChild(allOpt);

    // Catégories de la langue choisie
    const cats = DATABASE[currentLang];
    if(cats) {
        for (let cat in cats) {
            let opt = document.createElement('option');
            opt.value = cat;
            opt.innerText = cat;
            select.appendChild(opt);
        }
    }
}

// --- AVATAR & SETUP PLAYERS ---
function generateDefaultAvatar() {
    const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const svgString = document.getElementById('user-icon-svg').outerHTML;
    
    const canvas = document.createElement('canvas');
    canvas.width = 100; canvas.height = 100;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const img = new Image();
    const svgBlob = new Blob([svgString], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(svgBlob);
    
    return new Promise((resolve) => {
         img.onload = function() {
            const iconSize = 60;
            ctx.drawImage(img, (100-iconSize)/2, (100-iconSize)/2, iconSize, iconSize);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL());
        };
        img.src = url;
    });
}

function adjustCounter(type, delta) {
    settings[type] += delta;
    if (settings[type] < 0) settings[type] = 0;
    if (type === 'undercover' && settings[type] < 1) settings[type] = 1;
    document.getElementById(`disp-${type}`).innerText = settings[type];
}

async function openAddPlayerModal() {
    document.getElementById('modal-add-player').classList.remove('hidden');
    document.getElementById('new-player-name').value = "";
    const defaultAvatar = await generateDefaultAvatar();
    document.getElementById('preview-avatar').src = defaultAvatar;
    renderImportList();
    switchTab('new');
}

function closeAddModal() {
    document.getElementById('modal-add-player').classList.add('hidden');
}

function switchTab(tab) {
    document.getElementById('tab-new').classList.add('hidden');
    document.getElementById('tab-existing').classList.add('hidden');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.remove('hidden');
    event.target.classList.add('active');
}

function previewImage(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) { document.getElementById('preview-avatar').src = e.target.result; }
        reader.readAsDataURL(input.files[0]);
    }
}

function confirmAddPlayer() {
    const t = translations[currentLang];
    const name = document.getElementById('new-player-name').value.trim();
    if (!name) return alert(t.name_empty);
    
    const avatarSrc = document.getElementById('preview-avatar').src;
    const newP = { id: Date.now(), name: name, avatar: avatarSrc };
    
    if (!savedPlayers.find(p => p.name === name)) {
        savedPlayers.push(newP);
        saveDB();
    }
    addPlayerToGame(newP);
    closeAddModal();
}

function renderImportList() {
    const list = document.getElementById('saved-players-list');
    list.innerHTML = "";
    const t = translations[currentLang];
    
    savedPlayers.forEach((p, idx) => {
        const div = document.createElement('div');
        div.className = "import-row";
        const leftDiv = document.createElement('div');
        leftDiv.className = "import-left";
        leftDiv.innerHTML = `<img src="${p.avatar}" class="avatar-small"> <span>${p.name}</span>`;
        leftDiv.onclick = () => {
            if(!currentPlayers.find(cp => cp.name === p.name)){
                addPlayerToGame(p);
                closeAddModal();
            } else {
                alert(t.already_in);
            }
        };
        const delBtn = document.createElement('button');
        delBtn.className = "delete-saved-btn";
        delBtn.innerText = "🗑️";
        delBtn.onclick = (e) => { e.stopPropagation(); deleteSavedPlayer(idx); };
        div.appendChild(leftDiv);
        div.appendChild(delBtn);
        list.appendChild(div);
    });
    if(list.innerHTML === "") list.innerHTML = `<p style='padding:10px'>...</p>`;
}

function deleteSavedPlayer(idx) {
    const t = translations[currentLang];
    const code = prompt(t.enter_pin);
    if (code === "4862") {
        savedPlayers.splice(idx, 1);
        saveDB();
        renderImportList();
    } else {
        alert(t.incorrect_code);
    }
}

function addPlayerToGame(playerObj) {
    currentPlayers.push(playerObj);
    renderSetupList();
}

function removePlayer(idx) {
    currentPlayers.splice(idx, 1);
    renderSetupList();
}

function renderSetupList() {
    const container = document.getElementById('setup-players-list');
    container.innerHTML = "";
    document.getElementById('player-count').innerText = currentPlayers.length;
    currentPlayers.forEach((p, idx) => {
        const div = document.createElement('div');
        div.className = "player-chip";
        div.innerHTML = `
            <div class="remove-btn" onclick="removePlayer(${idx})">×</div>
            <img src="${p.avatar}">
            <div style="font-size:12px; overflow:hidden; text-overflow:ellipsis;">${p.name}</div>
        `;
        container.appendChild(div);
    });
}

// --- LOGIQUE JEU ---
function setupGame() {
    const t = translations[currentLang];
    const nbUnder = settings.undercover;
    const nbWhite = settings.white;
    if (currentPlayers.length < nbUnder + nbWhite + 1) return alert(t.not_enough);
    
    // Choix des mots depuis DATABASE[currentLang]
    const cat = document.getElementById('category-select').value;
    const dbLang = DATABASE[currentLang];
    
    let availablePairs = [];
    if (cat === "all") {
        for (let c in dbLang) availablePairs = availablePairs.concat(dbLang[c]);
    } else {
        availablePairs = dbLang[cat];
    }
    
    const pair = availablePairs[Math.floor(Math.random() * availablePairs.length)];
    const coinFlip = Math.random() > 0.5;
    const civilWord = coinFlip ? pair[0] : pair[1];
    const underWord = coinFlip ? pair[1] : pair[0];

    let roles = [];
    for (let i=0; i < nbUnder; i++) roles.push({type: 'Undercover', word: underWord});
    for (let i=0; i < nbWhite; i++) roles.push({type: 'Mr. White', word: 'Mr. White'});
    while (roles.length < currentPlayers.length) roles.push({type: 'Civil', word: civilWord});
    roles.sort(() => Math.random() - 0.5);

    gameData = currentPlayers.map((p, i) => ({
        ...p,
        role: roles[i].type,
        word: roles[i].word,
        isDead: false
    }));

    currentPlayerIndex = 0;
    document.getElementById('screen-setup').classList.add('hidden');
    document.getElementById('screen-distrib').classList.remove('hidden');
    updateDistribUI();
}

let currentPlayerIndex = 0;
function updateDistribUI() {
    const t = translations[currentLang];
    const p = gameData[currentPlayerIndex];
    document.getElementById('distrib-player-name').innerText = p.name;
    document.getElementById('distrib-avatar').src = p.avatar;
    document.getElementById('secret-text').innerText = t.hold_reveal;
}
function showSecret() {
    const t = translations[currentLang];
    const p = gameData[currentPlayerIndex];
    let text = p.word;
    if(p.role === 'Mr. White') text = t.mr_white;
    document.getElementById('secret-text').innerText = text;
}
function hideSecret() {
    document.getElementById('secret-text').innerText = translations[currentLang].hold_reveal;
}
function nextPlayerDistrib() {
    currentPlayerIndex++;
    if (currentPlayerIndex >= gameData.length) {
        document.getElementById('screen-distrib').classList.add('hidden');
        document.getElementById('screen-game').classList.remove('hidden');
        renderGameList();
    } else {
        updateDistribUI();
    }
}

function renderGameList() {
    const list = document.getElementById('game-players-list');
    list.innerHTML = '';
    const t = translations[currentLang];
    gameData.forEach((p, idx) => {
        const div = document.createElement('div');
        div.className = `player-row ${p.isDead ? 'dead' : ''}`;
        let actions = '';
        if (!p.isDead) {
            actions = `
                <button class="btn btn-secondary btn-mini" onclick="openCheckModal(${idx})">👁️</button>
                <button class="btn btn-primary btn-mini" style="background:#c0392b" onclick="eliminatePlayer(${idx})">☠️</button>
            `;
        } else {
            actions = `<span style="font-size:0.8em; color:#888">${p.role}</span>`;
        }
        div.innerHTML = `
            <div class="player-info">
                <img src="${p.avatar}" class="avatar-small">
                <span class="player-name">${p.name}</span>
            </div>
            <div>${actions}</div>
        `;
        list.appendChild(div);
    });
}
function eliminatePlayer(idx) {
    const t = translations[currentLang];
    if(confirm(`${t.eliminate_confirm} ${gameData[idx].name} ?`)) {
        gameData[idx].isDead = true;
        alert(`☠️ ${gameData[idx].name} ${t.is_eliminated}\n\n${t.role} : ${gameData[idx].role}\n${t.word} : ${gameData[idx].word}`);
        renderGameList();
    }
}
let checkingPlayerIdx = -1;
function openCheckModal(idx) {
    checkingPlayerIdx = idx;
    document.getElementById('check-modal-name').innerText = gameData[idx].name;
    document.getElementById('check-modal').classList.remove('hidden');
}
function closeCheckModal() {
    document.getElementById('check-modal').classList.add('hidden');
}
function revealCheck() {
    if(checkingPlayerIdx !== -1) document.getElementById('check-secret-box').innerText = gameData[checkingPlayerIdx].word;
}
function hideCheck() {
    const t = translations[currentLang];
    document.getElementById('check-secret-box').innerText = t.hold_reveal;
}