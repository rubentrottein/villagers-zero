let gameState = {
    basicSeeds: 0,
    woodSeeds: 0,
    magicSeeds: 0,
    socialSeeds: 0,
    houses: 0,
    farms: 0,
    labs: 0,
    academies: 0,
    villagers: 0,
    buildings: [],
    currentMode: 'normal',
    gameWon: false
};

const narratives = [
    "Bienvenue dans votre nouveau village ! Commencez par collecter des graines basiques et de bois pour construire vos premiers bâtiments...",
    "Vos premières graines germent ! Vous découvrez des graines basiques et des graines de bois dans la nature...",
    "Votre première maison accueille l'espoir et produit encore plus de graines! Créez-en davantage pour en produire davantage et plus rapidement!",
    "Une ferme productive ! Elle génère des graines de bois pour alimenter vos futures constructions...",
    "Votre laboratoire est opérationnel ! Vous pouvez maintenant fusionner vos graines pour créer de la magie...",
    "Incroyable ! Vos premières graines magiques scintillent de pouvoir ! L'académie magique est maintenant à votre portée...",
    "Votre académie magique rayonne de savoir ! Elle produit des graines magiques et débloque le secret des graines sociales...",
    "Le moment ultime approche... La création d'une graine sociale donnera naissance à la vie dans votre village !"
];

let narrativeIndex = 0;
let buildPreview = null;
let basicProductionInterval = null;
let woodProductionInterval = null;
let magicProductionInterval = null;

function updateUI() {
    document.getElementById('basicSeeds').textContent = gameState.basicSeeds;
    document.getElementById('woodSeeds').textContent = gameState.woodSeeds;
    document.getElementById('magicSeeds').textContent = gameState.magicSeeds;
    document.getElementById('socialSeeds').textContent = gameState.socialSeeds;
    document.getElementById('houseCount').textContent = gameState.houses;
    document.getElementById('farmCount').textContent = gameState.farms;
    document.getElementById('labCount').textContent = gameState.labs;
    document.getElementById('academyCount').textContent = gameState.academies;
    document.getElementById('villagerCount').textContent = gameState.villagers;

    // Enable/disable build buttons
    document.getElementById('houseModeBtn').disabled = gameState.basicSeeds < 3;
    document.getElementById('farmModeBtn').disabled = gameState.woodSeeds < 5;
    document.getElementById('labModeBtn').disabled = gameState.basicSeeds < 2 || gameState.woodSeeds < 3;
    
    // Show/hide academy elements based on magic seeds
    if (gameState.magicSeeds > 0 || gameState.academies > 0) {
        document.getElementById('academyModeBtn').style.display = 'inline-block';
        document.getElementById('academyInfo').style.display = 'block';
        document.getElementById('academyStat').style.display = 'flex';
    }
    document.getElementById('academyModeBtn').disabled = gameState.magicSeeds < 6;

    // Show social seeds resource if we have any
    if (gameState.socialSeeds > 0) {
        document.getElementById('socialSeedResource').style.display = 'flex';
    }

    // Fusion lab visibility and button states
    const fusionLab = document.getElementById('fusionLab');
    const fuseMagicBtn = document.getElementById('fuseMagicBtn');
    const socialFusion = document.getElementById('socialFusion');
    const fuseSocialBtn = document.getElementById('fuseSocialBtn');
    
    if (gameState.labs > 0) {
        fusionLab.style.display = 'block';
        fuseMagicBtn.disabled = gameState.basicSeeds < 2 || gameState.woodSeeds < 1;
        
        // Show social fusion if we have academy
        if (gameState.academies > 0) {
            socialFusion.style.display = 'block';
            fuseSocialBtn.disabled = gameState.magicSeeds < 3 || gameState.basicSeeds < 2;
        }
    } else {
        fusionLab.style.display = 'none';
    }
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

function updateNarrative() {
    let newIndex = narrativeIndex;
    
    if (gameState.basicSeeds >= 5 && narrativeIndex < 1) newIndex = 1;
    if (gameState.houses >= 1 && narrativeIndex < 2) newIndex = 2;
    if (gameState.farms >= 1 && narrativeIndex < 3) newIndex = 3;
    if (gameState.labs >= 1 && narrativeIndex < 4) newIndex = 4;
    if (gameState.magicSeeds >= 1 && narrativeIndex < 5) newIndex = 5;
    if (gameState.academies >= 1 && narrativeIndex < 6) newIndex = 6;
    if (gameState.academies >= 1 && gameState.magicSeeds >= 3 && gameState.basicSeeds >= 2 && narrativeIndex < 7) newIndex = 7;
    
    if (newIndex > narrativeIndex) {
        narrativeIndex = newIndex;
        document.getElementById('narrativeText').textContent = narratives[narrativeIndex];
    }
}

let lastCollectTime = 0;
const COLLECT_COOLDOWN = 60000; // 1 minute en millisecondes

function collectSeeds() {
    const now = Date.now();
    const timeLeft = COLLECT_COOLDOWN - (now - lastCollectTime);
    
    if (timeLeft > 0) {
        const secondsLeft = Math.ceil(timeLeft / 1000);
        showNotification(`Attendez encore ${secondsLeft} secondes...`);
        return;
    }
    
    lastCollectTime = now;
    
    const basicCollected = Math.floor(Math.random() * 3) + 2;
    const woodCollected = Math.floor(Math.random() * 2) + 1;
    
    gameState.basicSeeds += basicCollected;
    gameState.woodSeeds += woodCollected;
    
    showNotification(`+${basicCollected}🌱 +${woodCollected}🌰 collectées !`);
    updateNarrative();
    updateUI();
    
    // Désactiver le bouton temporairement
    const collectBtn = document.querySelector('.btn-collect');
    collectBtn.disabled = true;
    
    // Timer visuel sur le bouton
    const originalText = collectBtn.textContent;
    const updateButtonTimer = setInterval(() => {
        const remaining = Math.ceil((COLLECT_COOLDOWN - (Date.now() - lastCollectTime)) / 1000);
        if (remaining > 0) {
            collectBtn.textContent = `Collecte (${remaining}s)`;
        } else {
            collectBtn.textContent = originalText;
            collectBtn.disabled = false;
            clearInterval(updateButtonTimer);
        }
    }, 1000);
}

function fuseMagicSeeds() {
    if (gameState.basicSeeds >= 2 && gameState.woodSeeds >= 1 && gameState.labs > 0) {
        gameState.basicSeeds -= 2;
        gameState.woodSeeds -= 1;
        gameState.magicSeeds += 1;
        
        showNotification('Fusion réussie ! +1✨ Graine Magique créée !');
        updateNarrative();
        updateUI();
    }
}

function fuseSocialSeeds() {
    if (gameState.magicSeeds >= 3 && gameState.basicSeeds >= 2 && gameState.woodSeeds >= 3 && gameState.academies > 0 && !gameState.gameWon) {
        gameState.magicSeeds -= 3;
        gameState.woodSeeds -= 3;
        gameState.basicSeeds -= 2;
        gameState.socialSeeds += 1;
        gameState.gameWon = true;
        
        showNotification('🎉 GRAINE SOCIALE CRÉÉE ! Le village prend vie ! 🎉');
        
        // Trigger victory sequence
        setTimeout(() => {
            triggerVictory();
        }, 1000);
        
        updateUI();
    }
}

function triggerVictory() {
    // Create fireworks
    createFireworks();
    
    // Spawn villagers in all houses
    spawnVillagers();
    
    // Show victory overlay
    setTimeout(() => {
        const overlay = document.getElementById('victoryOverlay');
        overlay.classList.add('show');
    }, 3000);
}

function createFireworks() {
    const fireworksContainer = document.getElementById('fireworks');
    const colors = ['🎆', '🎇', '✨', '🌟', '💫', '⭐'];
    
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.textContent = colors[Math.floor(Math.random() * colors.length)];
            firework.style.left = Math.random() * window.innerWidth + 'px';
            firework.style.top = Math.random() * window.innerHeight + 'px';
            
            fireworksContainer.appendChild(firework);
            
            setTimeout(() => {
                firework.remove();
            }, 2000);
        }, i * 200);
    }
}

function spawnVillagers() {
    const villagerEmojis = ['👨', '👩', '👦', '👧', '🧓', '👴', '👵'];
    
    gameState.buildings.forEach((building, index) => {
        if (building.type === 'house') {
            setTimeout(() => {
                const villager = document.createElement('div');
                villager.className = 'villager villager-walking';
                villager.textContent = villagerEmojis[Math.floor(Math.random() * villagerEmojis.length)];
                villager.style.left = (building.x + 40) + 'px';
                villager.style.top = (building.y + 80) + 'px';
                
                document.getElementById('villageGrid').appendChild(villager);
                gameState.villagers++;
                updateUI();
                
                // Random movement
                setInterval(() => {
                    if (!gameState.gameWon) return;
                    const newX = Math.max(0, Math.min(building.x + (Math.random() - 0.5) * 100, 520));
                    const newY = Math.max(0, Math.min(building.y + (Math.random() - 0.5) * 100, 420));
                    villager.style.left = newX + 'px';
                    villager.style.top = newY + 'px';
                }, 3000 + Math.random() * 2000);
                
            }, index * 500);
        }
    });
}

function setMode(mode) {
    gameState.currentMode = mode;
    
    // Update button states
    document.querySelectorAll('.btn-mode').forEach(btn => btn.classList.remove('active'));
    document.getElementById(mode + 'ModeBtn')?.classList.add('active');
    
    // Update grid cursor and mode indicator
    const grid = document.getElementById('villageGrid');
    const indicator = document.getElementById('modeIndicator');
    
    if (mode === 'normal') {
        grid.classList.remove('build-mode');
        indicator.textContent = 'Mode Normal';
    } else {
        grid.classList.add('build-mode');
        const modeNames = {
            house: 'Maison',
            farm: 'Ferme', 
            lab: 'Laboratoire',
            academy: 'Académie Magique'
        };
        indicator.textContent = `Mode Construction: ${modeNames[mode]}`;
    }
    
    // Remove any existing preview
    if (buildPreview) {
        buildPreview.remove();
        buildPreview = null;
    }
}

function canPlaceBuilding(x, y) {
    return !gameState.buildings.some(building => {
        const dx = Math.abs(building.x - x);
        const dy = Math.abs(building.y - y);
        return dx < 90 && dy < 90; // 80px building + 10px margin
    });
}

function placeBuilding(x, y, type) {
    if (!canPlaceBuilding(x, y)) {
        showNotification('Impossible de placer ici !');
        return false;
    }

    let canAfford, emoji, cssClass;
    
    switch (type) {
        case 'house':
            canAfford = gameState.basicSeeds >= 3;
            emoji = '🏠';
            cssClass = 'house';
            break;
        case 'farm':
            canAfford = gameState.woodSeeds >= 5;
            emoji = '🚜';
            cssClass = 'farm';
            break;
        case 'lab':
            canAfford = gameState.basicSeeds >= 2 && gameState.woodSeeds >= 3;
            emoji = '🔬';
            cssClass = 'lab';
            break;
        case 'academy':
            canAfford = gameState.magicSeeds >= 6;
            emoji = '🎓';
            cssClass = 'academy';
            break;
        default:
            return false;
    }

    if (!canAfford) {
        showNotification('Pas assez de graines !');
        return false;
    }

    // Deduct resources
    switch (type) {
        case 'house':
            gameState.basicSeeds -= 3;
            gameState.houses += 1;
            break;
        case 'farm':
            gameState.woodSeeds -= 5;
            gameState.farms += 1;
            break;
        case 'lab':
            gameState.basicSeeds -= 2;
            gameState.woodSeeds -= 3;
            gameState.labs += 1;
            break;
        case 'academy':
            gameState.magicSeeds -= 6;
            gameState.academies += 1;
            break;
    }

    // Create building element
    const building = { type, x, y };
    gameState.buildings.push(building);
    
    const buildingElement = document.createElement('div');
    buildingElement.className = `building ${cssClass}`;
    buildingElement.innerHTML = emoji;
    buildingElement.style.left = x + 'px';
    buildingElement.style.top = y + 'px';
    
    document.getElementById('villageGrid').appendChild(buildingElement);
    
    const buildingNames = {
        house: 'Maison',
        farm: 'Ferme',
        lab: 'Laboratoire',
        academy: 'Académie Magique'
    };
    showNotification(`${buildingNames[type]} construite !`);
    updateNarrative();
    updateUI();

    // Start auto production for first house
    if (type === 'house' && gameState.houses === 1) {
        startSeedProduction();
    }
    // Start auto production for first farm
    if (type === 'farm' && gameState.farms === 1) {
        startWoodProduction();
    }
    
    // Start magic production for first academy
    if (type === 'academy' && gameState.academies === 1) {
        startMagicProduction();
    }

    return true;
}

function startSeedProduction() {
    if (basicProductionInterval) clearInterval(basicProductionInterval);
    basicProductionInterval = setInterval(() => {
        if (gameState.houses > 0) {
            const produced = gameState.houses;
            gameState.basicSeeds += produced;
            updateUI();
        }
    }, 15000); // Every 15 seconds
}

function startWoodProduction() {
    if (woodProductionInterval) clearInterval(woodProductionInterval);
    woodProductionInterval = setInterval(() => {
        if (gameState.farms > 0) {
            const produced = gameState.farms;
            gameState.woodSeeds += produced;
            updateUI();
        }
    }, 15000); // Every 15 seconds
}

function startMagicProduction() {
    if (magicProductionInterval) clearInterval(magicProductionInterval);
    magicProductionInterval = setInterval(() => {
        if (gameState.academies > 0) {
            const produced = gameState.academies;
            gameState.magicSeeds += produced;
            updateUI();
        }
    }, 25000); // Every 25 seconds
}

// Grid click handler
document.getElementById('villageGrid').addEventListener('click', (e) => {
    if (gameState.currentMode === 'normal') return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left - 40, rect.width - 80));
    const y = Math.max(0, Math.min(e.clientY - rect.top - 40, rect.height - 80));
    
    if (placeBuilding(x, y, gameState.currentMode)) {
        setMode('normal'); // Return to normal mode after building
    }
});

// Mouse move preview
document.getElementById('villageGrid').addEventListener('mousemove', (e) => {
    if (gameState.currentMode === 'normal') {
        if (buildPreview) {
            buildPreview.remove();
            buildPreview = null;
        }
        return;
    }
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left - 40, rect.width - 80));
    const y = Math.max(0, Math.min(e.clientY - rect.top - 40, rect.height - 80));
    
    if (!buildPreview) {
        buildPreview = document.createElement('div');
        buildPreview.className = 'build-preview';
        document.getElementById('villageGrid').appendChild(buildPreview);
    }
    
    buildPreview.style.left = x + 'px';
    buildPreview.style.top = y + 'px';
    
    const emojis = {
        house: '🏠',
        farm: '🚜',
        lab: '🔬',
        academy: '🎓'
    };
    buildPreview.innerHTML = emojis[gameState.currentMode];
    
    // Change preview color based on placement validity
    if (canPlaceBuilding(x, y)) {
        buildPreview.style.borderColor = '#2ecc71';
        buildPreview.style.background = 'rgba(46, 204, 113, 0.2)';
    } else {
        buildPreview.style.borderColor = '#e74c3c';
        buildPreview.style.background = 'rgba(231, 76, 60, 0.2)';
    }
});

// Mouse leave handler
document.getElementById('villageGrid').addEventListener('mouseleave', () => {
    if (buildPreview) {
        buildPreview.remove();
        buildPreview = null;
    }
});

// Initialize the game
updateUI();