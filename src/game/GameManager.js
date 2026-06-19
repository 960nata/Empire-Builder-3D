import * as THREE from 'three';
import { Renderer } from '../engine/Renderer';
import { Input } from '../engine/Input';
import { Terrain } from '../engine/Terrain';
import { EntityManager } from './EntityManager';
import { ModelFactory, CIVILIZATIONS } from './ModelFactory';
import { SoundManager } from './SoundManager';
import { SVGIcons } from '../ui/SVGIcons';
import { EnemyAI } from './EnemyAI';
import { AllyAI } from './AllyAI';
import { NeutralAI } from './NeutralAI';
import { HUD } from '../ui/HUD';
import { ResourceNode } from './ResourceNode';
import { Supabase } from '../ui/SupabaseClient';

export class GameManager {
  constructor() {
    this.renderer = null;
    this.input = null;
    this.terrain = null;
    this.entityManager = null;
    this.modelFactory = null;
    this.soundManager = null;
    this.enemyAI = null;
    this.allyAI = null;
    this.neutralAI = null;
    this.hud = null;

    // Lobby Configurations
    this.selectedCiv = 'inggris';
    this.selectedMap = 'river';
    this.gameMode = 'multi';
    this.graphicsQuality = 'high';
    this.startingResourcesOption = 'standard';
    this.maxPopulationCap = 100;
    this.aiDifficulty = 'normal';
    this.gameSpeedMultiplier = 1.0;

    // Helper to generate the complete tech/upgrade tree initialized to 0
    const createFullUpgradesObj = () => ({
      attack: 0, armor: 0, arrow: 0,
      swordsmanUpgrade: 0, archerUpgrade: 0, knightUpgrade: 0, 
      footKnightUpgrade: 0, heavyCavalryUpgrade: 0, horseArcherUpgrade: 0,
      palisadeWallUpgrade: 0, stoneWallUpgrade: 0, watchTowerUpgrade: 0,
      batteringRamUpgrade: 0, mangonelUpgrade: 0, scorpionUpgrade: 0, bombardCannonUpgrade: 0,
      spearmanUpgrade: 0, skirmisherUpgrade: 0, scoutUpgrade: 0, camelUpgrade: 0, cavalryArcherUpgrade: 0,
      sanctity: 0, fervor: 0, redemption: 0, atonement: 0, heresy: 0, faith: 0, illumination: 0, blockPrinting: 0, theocracy: 0,
      galleyUpgrade: 0, fireShipUpgrade: 0,
      loom: 0, wheelbarrow: 0, handCart: 0, townWatch: 0, townPatrol: 0,
      horseCollar: 0, heavyPlow: 0, cropRotation: 0,
      doubleBitAxe: 0, bowSaw: 0, twoManSaw: 0,
      goldMining: 0, goldShaftMining: 0, stoneMining: 0, stoneShaftMining: 0,
      coinage: 0, banking: 0, guilds: 0,
      careening: 0, dryDock: 0, shipwright: 0, gillnets: 0,
      squires: 0, arson: 0,
      thumbRing: 0, ballistics: 0,
      bloodlines: 0, husbandry: 0,
      hoardings: 0, sapper: 0, conscription: 0, spies: 0,
      heatedShot: 0,
      masonry: 0, architecture: 0,
      chemistry: 0, siegeEngineers: 0, murderHoles: 0, arrowslits: 0
    });

    // Game stats & Player states (4 Factions: 0: Player, 1: Enemy, 2: Ally, 3: Neutral)
    this.players = {
      0: { // Player
        resources: { wood: 200, food: 150, gold: 100, stone: 50 },
        population: 0,
        populationLimit: 10,
        age: 'dark',
        civ: 'inggris',
        upgrades: createFullUpgradesObj()
      },
      1: { // Enemy (Red AI)
        resources: { wood: 1000, food: 1000, gold: 1000, stone: 1000 },
        population: 0,
        populationLimit: 100,
        age: 'dark',
        civ: 'mongol',
        upgrades: createFullUpgradesObj()
      },
      2: { // Ally (Green AI)
        resources: { wood: 400, food: 400, gold: 200, stone: 100 },
        population: 0,
        populationLimit: 20,
        age: 'dark',
        civ: 'jepang',
        upgrades: createFullUpgradesObj()
      },
      3: { // Neutral (Grey)
        resources: { wood: 500, food: 500, gold: 500, stone: 500 },
        population: 0,
        populationLimit: 50,
        age: 'dark',
        civ: 'bizantium',
        upgrades: createFullUpgradesObj()
      }
    };

    // Initialize kills for each player
    for (let pId in this.players) {
      this.players[pId].kills = 0;
    }

    // Selection
    this.selectedEntities = [];

    // Control Groups (1-9)
    this.controlGroups = {
      1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: []
    };

    // Faction Relations Matrix (0: player, 1: enemy, 2: ally, 3: neutral)
    this.relations = {
      0: { 1: 'enemy', 2: 'ally', 3: 'neutral' },
      1: { 0: 'enemy', 2: 'enemy', 3: 'neutral' },
      2: { 0: 'ally', 1: 'enemy', 3: 'neutral' },
      3: { 0: 'neutral', 1: 'neutral', 2: 'neutral' }
    };

    // Grid collision map (x,z key -> true/false/type)
    this.gridMap = {};
    
    // Formation system
    this.currentFormation = 'box'; // 'box', 'line', 'column', 'spread'
    
    // Time tracking
    this.clock = new THREE.Clock();
    this.gameTime = 0;
    this.gameActive = false; // Set to true after lobby start

    // VFX pools — updated in main animate loop instead of one RAF per effect
    this._activeParticleGroups = [];
    this._activeProjectiles = [];
    this._boundAnimate = null;
  }

  start() {
    // 1. Initialise Utilities
    this.modelFactory = new ModelFactory();
    this.soundManager = new SoundManager();

    // 2. Setup Lobby Event Listeners
    const selectCiv = document.getElementById('select-civ');
    const selectMap = document.getElementById('select-map');
    const selectMode = document.getElementById('select-mode');
    const selectGraphics = document.getElementById('select-graphics');
    const btnLaunch = document.getElementById('btn-launch');

    if (selectCiv) {
      selectCiv.addEventListener('change', (e) => {
        this.updateCivDetails(e.target.value);
        this.renderLobbySlots();
        // Update encyclopedia
        this.updateEncyclopedia(e.target.value);
      });
      // Initial trigger
      this.updateCivDetails(selectCiv.value);
      this.updateEncyclopedia(selectCiv.value);
    }

    if (selectMode) {
      selectMode.addEventListener('change', (e) => {
        const multiPanel = document.getElementById('lobby-multiplayer-panel');
        if (multiPanel) {
          multiPanel.style.display = e.target.value === 'multi' ? 'block' : 'none';
        }
      });
      // Run initial check
      const multiPanel = document.getElementById('lobby-multiplayer-panel');
      if (multiPanel) {
        multiPanel.style.display = selectMode.value === 'multi' ? 'block' : 'none';
      }
    }

    // Setup Tab Buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        const targetContent = document.getElementById(tabId);
        if (targetContent) {
          targetContent.classList.add('active');
        }

        // Play click sound
        this.soundManager.playClickSound('select');

        // Sync encyclopedia if active
        if (tabId === 'tab-encyclopedia' && selectCiv) {
          this.updateEncyclopedia(selectCiv.value);
        }
      });
    });

    // Setup Mouse Parallax
    const lobbyScreen = document.getElementById('lobby-screen');
    const layerStars = document.getElementById('layer-stars');
    const layerCastle = document.getElementById('layer-castle');
    const layerMist = document.getElementById('layer-mist');
    const layerEmbers = document.getElementById('layer-embers');

    if (lobbyScreen) {
      lobbyScreen.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;

        if (layerStars) layerStars.style.transform = `translate(${x * -10}px, ${y * -10}px)`;
        if (layerCastle) layerCastle.style.transform = `translate(${x * -25}px, ${y * -15}px)`;
        if (layerMist) layerMist.style.transform = `translate(${x * -40}px, ${y * -25}px) scale(1.1)`;
        if (layerEmbers) layerEmbers.style.transform = `translate(${x * -60}px, ${y * -40}px)`;
      });
    }

    // Run simulated multiplayer connection steps
    this.runSimulatedMatchmaking();

    const selectAllies = document.getElementById('select-allies');
    const selectEnemies = document.getElementById('select-enemies');

    if (selectAllies) {
      selectAllies.addEventListener('change', () => this.renderLobbySlots());
    }
    if (selectEnemies) {
      selectEnemies.addEventListener('change', () => this.renderLobbySlots());
    }

    // Initial render of matchmaking slots
    this.renderLobbySlots();

    if (btnLaunch) {
      btnLaunch.addEventListener('click', () => {
        this.launchGame();
      });
    }

    // Initialize Supabase Tab & Matchmaking listeners
    this.initSupabaseUI();
  }

  initSupabaseUI() {
    const urlInput = document.getElementById('supabase-url-input');
    const keyInput = document.getElementById('supabase-key-input');
    const btnSaveCreds = document.getElementById('btn-save-supabase-creds');
    const statusBanner = document.getElementById('supabase-status-banner');
    
    const emailInput = document.getElementById('auth-email');
    const usernameInput = document.getElementById('auth-username');
    const passwordInput = document.getElementById('auth-password');
    const btnAuthSubmit = document.getElementById('btn-auth-submit');
    const btnAuthToggle = document.getElementById('btn-auth-toggle');
    const authTitle = document.getElementById('auth-title');
    const groupUsername = document.getElementById('group-username');
    
    const authSection = document.getElementById('supabase-auth-section');
    const profileSection = document.getElementById('supabase-profile-section');
    const matchmakingSection = document.getElementById('supabase-matchmaking-section');
    
    const profileUsername = document.getElementById('profile-username');
    const profileRank = document.getElementById('profile-rank');
    const profileWins = document.getElementById('profile-wins');
    const profileLosses = document.getElementById('profile-losses');
    const btnLogout = document.getElementById('btn-supabase-logout');
    
    const matchmakingMode = document.getElementById('matchmaking-mode');
    const btnStartMatchmaking = document.getElementById('btn-start-matchmaking');
    const matchmakingOverlay = document.getElementById('matchmaking-overlay');
    const matchmakingStatus = document.getElementById('matchmaking-status-text');
    const matchmakingSlots = document.getElementById('matchmaking-slots-container');
    const btnCancelMatchmaking = document.getElementById('btn-cancel-matchmaking');

    let authMode = 'login'; // 'login' or 'register'
    let activeUnsubscribe = null;
    
    // Save Civ choice to LocalStorage for matchmaking sync
    const selectCiv = document.getElementById('select-civ');
    if (selectCiv) {
      localStorage.setItem('selected_civ', selectCiv.value);
      selectCiv.addEventListener('change', (e) => {
        localStorage.setItem('selected_civ', e.target.value);
      });
    }

    const updateUIState = async () => {
      // Update connection banner
      if (statusBanner) {
        if (Supabase.useMock) {
          statusBanner.style.background = 'rgba(220, 38, 38, 0.15)';
          statusBanner.style.border = '1px solid rgba(220, 38, 38, 0.3)';
          statusBanner.style.color = '#f87171';
          statusBanner.innerHTML = `<span style="width: 8px; height: 8px; border-radius: 50%; background: #ef4444; box-shadow: 0 0 8px #ef4444; display: inline-block;"></span> Mode Offline (Mock LocalStorage)`;
        } else {
          statusBanner.style.background = 'rgba(16, 185, 129, 0.15)';
          statusBanner.style.border = '1px solid rgba(16, 185, 129, 0.3)';
          statusBanner.style.color = '#34d399';
          statusBanner.innerHTML = `<span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; display: inline-block;"></span> Connected to Supabase Cloud!`;
        }
      }
      
      // Check current user profile
      const user = await Supabase.getCurrentUser();
      if (user) {
        if (authSection) authSection.style.display = 'none';
        if (profileSection) profileSection.style.display = 'flex';
        if (matchmakingSection) matchmakingSection.style.display = 'flex';
        
        if (profileUsername) profileUsername.textContent = user.profile?.username || user.email;
        if (profileRank) profileRank.textContent = `MMR: ${user.profile?.rank || 1000}`;
        if (profileWins) profileWins.textContent = user.profile?.wins || 0;
        if (profileLosses) profileLosses.textContent = user.profile?.losses || 0;
      } else {
        if (authSection) authSection.style.display = 'flex';
        if (profileSection) profileSection.style.display = 'none';
        if (matchmakingSection) matchmakingSection.style.display = 'none';
      }
    };

    // Load credentials from LocalStorage
    if (urlInput) urlInput.value = Supabase.url;
    if (keyInput) keyInput.value = Supabase.anonKey;

    if (btnSaveCreds) {
      btnSaveCreds.addEventListener('click', () => {
        const url = urlInput.value.trim();
        const key = keyInput.value.trim();
        const success = Supabase.setCredentials(url, key);
        if (success) {
          alert("Kredensial disimpan! Menghubungkan ke Supabase...");
        } else {
          alert("Gagal menginisialisasi client Supabase dengan kredensial ini.");
        }
        updateUIState();
      });
    }

    if (btnAuthToggle) {
      btnAuthToggle.addEventListener('click', () => {
        if (authMode === 'login') {
          authMode = 'register';
          authTitle.textContent = 'Registrasi Akun Baru';
          btnAuthSubmit.textContent = 'Daftar & Masuk';
          btnAuthToggle.textContent = 'Kembali ke Login';
          groupUsername.style.display = 'flex';
        } else {
          authMode = 'login';
          authTitle.textContent = 'Masuk Ke Akun';
          btnAuthSubmit.textContent = 'Log In';
          btnAuthToggle.textContent = 'Buat Akun Baru';
          groupUsername.style.display = 'none';
        }
      });
    }

    if (btnAuthSubmit) {
      btnAuthSubmit.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const username = usernameInput.value.trim() || email.split('@')[0];
        
        if (!email || !password) {
          alert("Email dan password harus diisi!");
          return;
        }
        
        btnAuthSubmit.disabled = true;
        btnAuthSubmit.textContent = "Processing...";
        
        try {
          if (authMode === 'register') {
            await Supabase.signUp(email, password, username);
            alert("Pendaftaran berhasil! Akun Anda aktif.");
          } else {
            await Supabase.signIn(email, password);
          }
          emailInput.value = '';
          passwordInput.value = '';
          usernameInput.value = '';
          updateUIState();
        } catch (e) {
          alert("Error: " + e.message);
        } finally {
          btnAuthSubmit.disabled = false;
          btnAuthSubmit.textContent = authMode === 'login' ? 'Log In' : 'Daftar & Masuk';
        }
      });
    }

    if (btnLogout) {
      btnLogout.addEventListener('click', async () => {
        await Supabase.signOut();
        updateUIState();
      });
    }

    if (btnStartMatchmaking) {
      btnStartMatchmaking.addEventListener('click', async () => {
        const user = await Supabase.getCurrentUser();
        if (!user) {
          alert("Anda harus masuk (login) terlebih dahulu!");
          return;
        }
        
        const mode = matchmakingMode ? matchmakingMode.value : '3v3';
        const selfCiv = localStorage.getItem('selected_civ') || 'inggris';
        const playerProfile = {
          username: user.profile?.username || user.email,
          civ: selfCiv,
          team: 1,
          rank: user.profile?.rank || 1000
        };
        
        if (matchmakingOverlay) matchmakingOverlay.style.display = 'flex';
        if (matchmakingStatus) matchmakingStatus.textContent = 'Menghubungkan ke antrean...';
        if (matchmakingSlots) matchmakingSlots.innerHTML = '';
        
        try {
          const lobby = await Supabase.joinQueue(mode, playerProfile);
          
          if (matchmakingStatus) matchmakingStatus.textContent = 'Menunggu pemain lain bergabung...';
          
          // Poll lobby status
          activeUnsubscribe = Supabase.pollLobby(lobby.id, (updatedLobby) => {
            // Draw players in slots
            if (matchmakingSlots) {
              matchmakingSlots.innerHTML = updatedLobby.players.map(p => {
                const isSelf = p.name === playerProfile.username;
                const dotColor = p.team === 1 ? '#3b82f6' : (p.team === 2 ? '#ef4444' : '#8b5cf6');
                return `
                  <div style="background: rgba(255,255,255,0.05); padding: 8px 12px; border-radius: 4px; display: flex; align-items: center; justify-content: space-between; border: 1px solid ${isSelf ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.05)'};">
                    <span style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem; font-weight: ${isSelf ? 'bold' : 'normal'};">
                      <span style="width: 8px; height: 8px; border-radius: 50%; background: ${dotColor}; display: inline-block;"></span>
                      ${p.name}
                    </span>
                    <span style="font-size: 0.7rem; background: rgba(255,255,255,0.1); padding: 1px 5px; border-radius: 3px; color: #ffd54f;">${CIVILIZATIONS[p.civ]?.name || p.civ}</span>
                  </div>
                `;
              }).join('');
            }
            
            const maxPlayers = mode === '1v1' ? 2 : 6;
            if (matchmakingStatus) {
              matchmakingStatus.textContent = `Menunggu pemain... (${updatedLobby.players.length}/${maxPlayers})`;
            }
            
            if (updatedLobby.status === 'filled') {
              if (activeUnsubscribe) activeUnsubscribe();
              activeUnsubscribe = null;
              
              if (matchmakingStatus) matchmakingStatus.innerHTML = '<span style="color: #4ade80; font-weight: bold;">LOBI PENUH! Memulai pertempuran...</span>';
              
              // Countdown 5s then launch
              let countdown = 5;
              const countdownInterval = setInterval(() => {
                countdown--;
                if (matchmakingStatus) matchmakingStatus.innerHTML = `<span style="color: #4ade80; font-weight: bold;">PERTARUNGAN DISETUJUI! Memulai dalam ${countdown} detik...</span>`;
                
                if (countdown <= 0) {
                  clearInterval(countdownInterval);
                  if (matchmakingOverlay) matchmakingOverlay.style.display = 'none';
                  
                  // Launch game with this lobby configurations
                  this.currentMatchLobby = updatedLobby;
                  this.launchGame();
                }
              }, 1000);
            }
          }, (err) => {
            console.error("Matchmaking error:", err);
            if (matchmakingStatus) matchmakingStatus.textContent = "Error: " + err.message;
          });
        } catch (e) {
          alert("Gagal masuk antrean: " + e.message);
          if (matchmakingOverlay) matchmakingOverlay.style.display = 'none';
        }
      });
    }

    if (btnCancelMatchmaking) {
      btnCancelMatchmaking.addEventListener('click', () => {
        if (activeUnsubscribe) {
          activeUnsubscribe();
          activeUnsubscribe = null;
        }
        if (matchmakingOverlay) matchmakingOverlay.style.display = 'none';
      });
    }

    // Run initial state update
    updateUIState();
  }


  updateCivDetails(civKey) {
    const detailsEl = document.getElementById('civ-details');
    if (!detailsEl) return;
    
    const civ = CIVILIZATIONS[civKey];
    if (!civ) return;
    
    let html = `<strong>${SVGIcons.getIcon(civKey)} Bangsa ${civ.name}</strong>`;
    html += `<span class="bonus">✓ Kelebihan:</span><ul style="padding-left:15px; margin: 4px 0 8px 0; list-style-type: square;">`;
    civ.bonuses.forEach(b => html += `<li>${b}</li>`);
    html += `</ul>`;
    html += `<span class="limit">✗ Limitasi:</span><ul style="padding-left:15px; margin: 4px 0 0 0; list-style-type: square;">`;
    civ.limitations.forEach(l => html += `<li>${l}</li>`);
    html += `</ul>`;
    
    detailsEl.innerHTML = html;
  }

  renderLobbySlots() {
    const slotsGrid = document.getElementById('lobby-player-slots');
    if (!slotsGrid) return;

    const selectCiv = document.getElementById('select-civ');
    const playerCivName = selectCiv ? CIVILIZATIONS[selectCiv.value].name : 'Inggris';

    const selectAllies = document.getElementById('select-allies');
    const selectEnemies = document.getElementById('select-enemies');

    const alliesCount = selectAllies ? parseInt(selectAllies.value, 10) : 1;
    const enemiesCount = selectEnemies ? parseInt(selectEnemies.value, 10) : 1;

    let html = `
      <div class="slot self">
        <span class="dot blue"></span> 
        <span>You (Player 1)</span> 
        <span class="slot-civ-badge" id="slot-self-civ">${playerCivName}</span> 
        <span class="ready-badge">Ready</span>
      </div>
    `;

    if (alliesCount >= 1) {
      html += `
        <div class="slot">
          <span class="dot green"></span> 
          <span>GajahMada_35 (Ally)</span> 
          <span class="slot-civ-badge">Jepang</span> 
          <span id="slot-ally-status" class="ready-badge waiting">Connecting...</span>
        </div>
      `;
    }

    html += `
      <div class="slot">
        <span class="dot red"></span> 
        <span>Lord_Kahn_Enemy (Enemy 1)</span> 
        <span class="slot-civ-badge">Mongol</span> 
        <span class="ready-badge">Ready</span>
      </div>
    `;

    if (enemiesCount >= 2) {
      html += `
        <div class="slot">
          <span class="dot grey" style="background:#8b5cf6;"></span> 
          <span>Kaiser_Karl (Enemy 2)</span> 
          <span class="slot-civ-badge">Teuton</span> 
          <span class="ready-badge">Ready</span>
        </div>
      `;
    } else {
      html += `
        <div class="slot">
          <span class="dot grey"></span> 
          <span style="color:#aaa;">Nomad_Grey (Neutral)</span> 
          <span class="slot-civ-badge">Bizantium</span> 
          <span class="ready-badge">Ready</span>
        </div>
      `;
    }

    slotsGrid.innerHTML = html;
  }

  updateEncyclopedia(civKey) {
    const titleEl = document.getElementById('encyclopedia-title');
    const descEl = document.getElementById('encyclopedia-description');
    const unitEl = document.getElementById('encyclopedia-unit');
    const bonusEl = document.getElementById('encyclopedia-bonus');
    const focusEl = document.getElementById('encyclopedia-focus');
    
    const civ = CIVILIZATIONS[civKey];
    if (!civ) return;

    if (titleEl) titleEl.innerHTML = `${SVGIcons.getIcon(civKey)} Kekaisaran ${civ.name}`;

    let desc = "";
    if (civKey === 'inggris') {
      desc = "Mewakili kekuatan pemanah ulung dari pulau Britania Raya. Memiliki keuntungan jangkauan tembakan terjauh untuk unit busur dan kecepatan pengelolaan hutan.";
    } else if (civKey === 'prancis') {
      desc = "Kavaleri berat yang tak tertandingi dengan baju zirah tebal. Mereka dapat membangun sarana militer lebih hemat dan melancarkan kavaleri serbu.";
    } else if (civKey === 'mongol') {
      desc = "Bangsa pengembara dari padang rumput Asia. Ahli dalam taktik tabrak-lari (hit-and-run) menggunakan pemanah berkuda yang sangat lincah.";
    } else if (civKey === 'jepang') {
      desc = "Klan Samurai yang disiplin dan terlatih dalam pertempuran jarak dekat. Kecepatan serangan infantri mereka mematikan di medan pertempuran.";
    } else if (civKey === 'tiongkok') {
      desc = "Kekaisaran Timur yang maju secara administrasi dan teknologi. Mulai dengan jumlah rakyat (villager) lebih banyak untuk booming ekonomi cepat.";
    } else if (civKey === 'saracen') {
      desc = "Pasukan gurun pasir yang andal dalam perdagangan lintas negara. Menggunakan kavaleri unta untuk menetralisir kavaleri kuda musuh.";
    } else if (civKey === 'spanyol') {
      desc = "Penjelajah dunia baru yang perkasa dengan konstruksi cepat dan pasukan bersenjata api (mesiu) yang mematikan.";
    } else if (civKey === 'viking') {
      desc = "Perompak laut utara yang tangguh. Pasukan infantri memiliki ketahanan fisik (HP) luar biasa dan didukung armada laut yang ekonomis.";
    } else if (civKey === 'bizantium') {
      desc = "Pewaris takhta Romawi Timur dengan pertahanan benteng yang sangat kokoh dan biaya perekrutan unit penangkal yang sangat terjangkau.";
    } else if (civKey === 'persia') {
      desc = "Kekuatan dinasti kuno dengan pusat kota yang efisien dan andalan gajah perang raksasa untuk menghancurkan pertahanan musuh.";
    } else if (civKey === 'aztec') {
      desc = "Prajurit elang dan macan tutul yang militan. Mampu melatih prajurit dengan sangat cepat untuk strategi serbuan infantri massal.";
    } else if (civKey === 'maya') {
      desc = "Peradaban Mesoamerika kuno dengan pemanah bulu yang murah dan efisiensi pemanfaatan sumber daya alam yang bertahan lebih lama.";
    } else if (civKey === 'hun') {
      desc = "Pasukan berkuda nomaden yang tangguh dan tidak membutuhkan rumah tinggal. Siap menerjang wilayah musuh secara instan tanpa batas populasi.";
    } else if (civKey === 'turki') {
      desc = "Pelopor penggunaan artileri mesiu berat abad pertengahan. Pasukan penembak mesiu mereka memiliki daya tahan tinggi dan riset kimia gratis.";
    } else if (civKey === 'kelt') {
      desc = "Prajurit dataran tinggi yang bergerak sangat cepat serta mahir dalam merakit dan mengoperasikan mesin kepung (siege) yang merusak.";
    } else if (civKey === 'goth') {
      desc = "Suku barbar yang membanjiri peradaban dengan infantri murah. Mampu melatih infantri dengan kecepatan luar biasa namun tidak dapat membuat tembok batu.";
    } else if (civKey === 'teuton') {
      desc = "Ksatria Teutonik Jerman dengan pertahanan armor infantri yang sangat tebal serta keahlian pertanian yang unggul.";
    } else {
      desc = `Peradaban ${civ.name} dengan kelebihan unik dan unit-unit tempur khas siap memenangkan pertempuran real-time di medan perang.`;
    }
    
    if (descEl) descEl.textContent = desc;

    const statsData = {
      inggris: { unit: 'Longbowman', bonus: 'Tebang Kayu +20%', focus: 'Bertahan (Defensive)' },
      prancis: { unit: 'Throwing Axeman', bonus: 'HP Kavaleri +20%', focus: 'Serbu (Aggressive)' },
      mongol: { unit: 'Mangudai', bonus: 'Speed Kavaleri +15%', focus: 'Mobilitas (Hit & Run)' },
      jepang: { unit: 'Samurai', bonus: 'Atk Speed Infantri +15%', focus: 'Infantri (Melee)' },
      tiongkok: { unit: 'Chu Ko Nu', bonus: 'Starter +2 Rakyat', focus: 'Ekonomi (Booming)' },
      saracen: { unit: 'Mameluke', bonus: 'Trade Rate +20%', focus: 'Kavaleri Unta & Emas' },
      spanyol: { unit: 'Conquistador', bonus: 'Bangun Cepat +30%', focus: 'Konstruksi & Mesiu' },
      viking: { unit: 'Berserker', bonus: 'HP Infantri +15%', focus: 'Infantri & Pelabuhan' },
      bizantium: { unit: 'Cataphract', bonus: 'HP Struktur +25%', focus: 'Defensif & Benteng' },
      persia: { unit: 'War Elephant', bonus: 'Starter +50 Wood/Food', focus: 'Booming & Gajah' },
      aztec: { unit: 'Jaguar Warrior', bonus: 'Latih Militer +15%', focus: 'Infantri Swarm' },
      maya: { unit: 'Plumed Archer', bonus: 'Diskon Archer s/d -20%', focus: 'Jarak Jauh & Hemat' },
      hun: { unit: 'Tarkhan', bonus: 'Pop 100 Tanpa Rumah', focus: 'Kavaleri & Agresif' },
      turki: { unit: 'Janissary', bonus: 'HP Unit Mesiu +25%', focus: 'Senjata Api & Artileri' },
      kelt: { unit: 'Woad Raider', bonus: 'Speed Infantri +15%', focus: 'Infantri & Pengepungan' },
      goth: { unit: 'Huskarl', bonus: 'Harga Infantri -30%', focus: 'Harga Murah' },
      teuton: { unit: 'Teutonic Knight', bonus: 'Armor Infantri +2', focus: 'Pertahanan Infantri' }
    };

    const cStats = statsData[civKey] || { unit: 'Villager', bonus: 'Umum', focus: 'Keseimbangan' };
    
    if (unitEl) unitEl.textContent = cStats.unit;
    if (bonusEl) bonusEl.textContent = cStats.bonus;
    if (focusEl) focusEl.textContent = cStats.focus;
  }

  runSimulatedMatchmaking() {
    const log = document.getElementById('lobby-chat-log');
    const allyStatus = document.getElementById('slot-ally-status');
    if (!log) return;

    const addSysLog = (text) => {
      const el = document.createElement('div');
      el.className = 'msg sys';
      el.textContent = `System: ${text}`;
      log.appendChild(el);
      log.scrollTop = log.scrollHeight;
    };

    const addChatLog = (user, msg) => {
      const el = document.createElement('div');
      el.className = 'msg chat';
      el.innerHTML = `<strong>${user}</strong>: ${msg}`;
      log.appendChild(el);
      log.scrollTop = log.scrollHeight;
    };

    setTimeout(() => {
      addSysLog("Pemain GajahMada_35 bergabung ke lobi.");
      if (allyStatus) {
        allyStatus.className = "ready-badge";
        allyStatus.textContent = "Ready";
      }
    }, 1000);

    setTimeout(() => {
      addChatLog("GajahMada_35", "Oi cuy! Salam kenal, siap bantuin lawan faksi merah ya!");
    }, 2000);

    setTimeout(() => {
      addChatLog("Lord_Kahn_Enemy", "Hahaha, siap-siap aja diserbu sama kavaleri Mongol gw!");
    }, 3500);

    setTimeout(() => {
      addChatLog("Nomad_Grey", "Ane netral ya gan, mau fokus dagang emas aja di pojok map.");
    }, 5000);
  }

  launchGame() {
    const selectCiv = document.getElementById('select-civ');
    const selectMap = document.getElementById('select-map');
    const selectMode = document.getElementById('select-mode');
    const selectGraphics = document.getElementById('select-graphics');
    const selectResources = document.getElementById('select-resources');
    const selectPopLimit = document.getElementById('select-pop-limit');
    const selectAIDifficulty = document.getElementById('select-ai-difficulty');
    const selectGameSpeed = document.getElementById('select-game-speed');
    const selectMapSize = document.getElementById('select-map-size');
    const selectAllies = document.getElementById('select-allies');
    const selectEnemies = document.getElementById('select-enemies');

    this.selectedMap = selectMap ? selectMap.value : 'river';
    this.gameMode = selectMode ? selectMode.value : 'multi';
    this.graphicsQuality = selectGraphics ? selectGraphics.value : 'high';

    // Parse matchmaking configurations if launching from matchmaking
    this.matchMode = 'multi';
    if (this.currentMatchLobby) {
      this.matchMode = this.currentMatchLobby.mode;
      const players = this.currentMatchLobby.players;
      
      const selfPlayer = players[0]; // first one is self
      if (selfPlayer) {
        this.selectedCiv = selfPlayer.civ;
      }
      
      if (this.matchMode === '1v1') {
        this.alliesCount = 0;
        this.enemiesCount = 1;
        
        const enemy1 = players.find(p => p.team === 2);
        if (enemy1) this.players[1].civ = enemy1.civ;
      } else if (this.matchMode === '3v3') {
        this.alliesCount = 1;
        this.enemiesCount = 2;
        
        const selfName = selfPlayer ? selfPlayer.name : '';
        const ally = players.find(p => p.team === 1 && p.name !== selfName);
        if (ally) this.players[2].civ = ally.civ;
        
        const enemies = players.filter(p => p.team === 2);
        if (enemies[0]) this.players[1].civ = enemies[0].civ;
        if (enemies[1]) this.players[3].civ = enemies[1].civ;
      } else if (this.matchMode === '2v2v2') {
        this.alliesCount = 1;
        this.enemiesCount = 2;
        
        const selfName = selfPlayer ? selfPlayer.name : '';
        const ally = players.find(p => p.team === 1 && p.name !== selfName);
        if (ally) this.players[2].civ = ally.civ;
        
        const enemy1 = players.find(p => p.team === 2);
        if (enemy1) this.players[1].civ = enemy1.civ;
        
        const enemy2 = players.find(p => p.team === 3);
        if (enemy2) this.players[3].civ = enemy2.civ;
      }
    } else {
      this.selectedCiv = selectCiv ? selectCiv.value : 'inggris';
      this.alliesCount = selectAllies ? parseInt(selectAllies.value, 10) : 1;
      this.enemiesCount = selectEnemies ? parseInt(selectEnemies.value, 10) : 1;
    }

    // Advanced configs
    this.startingResourcesOption = selectResources ? selectResources.value : 'standard';
    this.maxPopulationCap = selectPopLimit ? parseInt(selectPopLimit.value, 10) : 1000;
    this.aiDifficulty = selectAIDifficulty ? selectAIDifficulty.value : 'normal';
    this.gameSpeedMultiplier = selectGameSpeed ? parseFloat(selectGameSpeed.value) : 1.0;
    const mapSizeVal = selectMapSize ? parseInt(selectMapSize.value, 10) : 500;

    // Hide Lobby Overlay
    const lobbyScreen = document.getElementById('lobby-screen');
    if (lobbyScreen) {
      lobbyScreen.style.display = 'none';
    }

    // Reset game logic variables
    this.gameTime = 0;
    this.fowGrid = null;
    this.controlGroups = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] };
    
    // Dynamically build relations matrix
    this.relations = {
      0: { 
        1: 'enemy', 
        2: this.alliesCount >= 1 ? 'ally' : 'neutral', 
        3: this.enemiesCount >= 2 ? 'enemy' : 'neutral' 
      },
      1: { 
        0: 'enemy', 
        2: this.alliesCount >= 1 ? 'enemy' : 'neutral', 
        3: this.enemiesCount >= 2 ? 'ally' : 'neutral' 
      },
      2: { 
        0: this.alliesCount >= 1 ? 'ally' : 'neutral', 
        1: 'enemy', 
        3: this.enemiesCount >= 2 ? 'enemy' : 'neutral' 
      },
      3: { 
        0: this.enemiesCount >= 2 ? 'enemy' : 'neutral', 
        1: this.enemiesCount >= 2 ? 'ally' : 'neutral', 
        2: (this.enemiesCount >= 2 && this.alliesCount >= 1) ? 'enemy' : 'neutral' 
      }
    };

    // If 2v2v2 matchmaking, Faction 1 (team 2) and Faction 3 (team 3) are hostile to each other
    if (this.matchMode === '2v2v2') {
      this.relations[1][3] = 'enemy';
      this.relations[3][1] = 'enemy';
    }

    for (let pId in this.players) {
      this.players[pId].kills = 0;
    }

    // Determine starting resources base values
    let baseResources = { wood: 500, food: 500, gold: 300, stone: 150 };
    if (this.startingResourcesOption === 'low') {
      baseResources = { wood: 200, food: 150, gold: 100, stone: 50 };
    } else if (this.startingResourcesOption === 'high') {
      baseResources = { wood: 1500, food: 1500, gold: 1000, stone: 500 };
    } else if (this.startingResourcesOption === 'deathmatch') {
      baseResources = { wood: 10000, food: 10000, gold: 10000, stone: 10000 };
    }

    // Apply Civ starter modifiers and starting resources to Player (0)
    const civModifiers = CIVILIZATIONS[this.selectedCiv].modifiers;
    this.players[0].civ = this.selectedCiv;
    this.players[0].resources.wood = baseResources.wood + (civModifiers.startWood || 0);
    this.players[0].resources.food = baseResources.food + (civModifiers.startFood || 0);
    this.players[0].resources.gold = baseResources.gold;
    this.players[0].resources.stone = baseResources.stone;

    if (civModifiers.noHouses) {
      this.players[0].populationLimit = this.maxPopulationCap;
    } else {
      this.players[0].populationLimit = 10;
    }

    // Apply starting resources to Enemy (1)
    const enemyCivModifiers = CIVILIZATIONS[this.players[1].civ]?.modifiers || {};
    this.players[1].resources.wood = baseResources.wood * 1.5 + (enemyCivModifiers.startWood || 0);
    this.players[1].resources.food = baseResources.food * 1.5 + (enemyCivModifiers.startFood || 0);
    this.players[1].resources.gold = baseResources.gold * 1.5;
    this.players[1].resources.stone = baseResources.stone * 1.5;

    // Apply starting resources to Ally (2)
    if (this.alliesCount === 1) {
      const allyCivModifiers = CIVILIZATIONS[this.players[2].civ]?.modifiers || {};
      this.players[2].resources.wood = baseResources.wood + (allyCivModifiers.startWood || 0);
      this.players[2].resources.food = baseResources.food + (allyCivModifiers.startFood || 0);
      this.players[2].resources.gold = baseResources.gold;
      this.players[2].resources.stone = baseResources.stone;
    }

    // Apply starting resources to Player 3 (Neutral or Enemy 2)
    if (this.enemiesCount === 2) {
      const enemyCiv2Modifiers = CIVILIZATIONS['teuton']?.modifiers || {};
      this.players[3].civ = 'teuton';
      this.players[3].resources.wood = baseResources.wood * 1.5 + (enemyCiv2Modifiers.startWood || 0);
      this.players[3].resources.food = baseResources.food * 1.5 + (enemyCiv2Modifiers.startFood || 0);
      this.players[3].resources.gold = baseResources.gold * 1.5;
      this.players[3].resources.stone = baseResources.stone * 1.5;
    } else {
      this.players[3].civ = 'bizantium';
      this.players[3].resources.wood = baseResources.wood;
      this.players[3].resources.food = baseResources.food;
      this.players[3].resources.gold = baseResources.gold;
      this.players[3].resources.stone = baseResources.stone;
    }

    // Setup ThreeJS Engine
    this.renderer = new Renderer('game-canvas-container');
    
    // Configure Graphics Quality Settings
    if (this.graphicsQuality === 'low') {
      this.renderer.webGLRenderer.shadowMap.enabled = false;
      this.renderer.webGLRenderer.setPixelRatio(1.0); // Keep lightweight to save battery/heat
      if (this.renderer.sunLight) {
        this.renderer.sunLight.castShadow = false;
      }
    }

    // Setup HUD UI
    this.hud = new HUD(this);
    
    // Setup Entities & Terrain
    this.entityManager = new EntityManager(this);
    // Custom map size (large like AoE)
    this.terrain = new Terrain(this.renderer.scene, this, mapSizeVal);

    // Dynamically update fog bounds based on map size
    if (this.renderer) {
      this.renderer.updateFogForMapSize(mapSizeVal);
    }
    
    // Setup Controls Input
    this.input = new Input(this.renderer, this);
    
    // Setup Map Assets
    this.spawnInitialAssets();

    // Setup AI factions
    this.enemyAI = new EnemyAI(this, 1);
    this.enemyAI2 = null;
    
    if (this.enemiesCount === 2) {
      this.enemyAI2 = new EnemyAI(this, 3);
      this.neutralAI = null;
    } else {
      this.neutralAI = new NeutralAI(this);
    }
    
    if (this.alliesCount === 1) {
      this.allyAI = new AllyAI(this);
    } else {
      this.allyAI = null;
    }

    // Preload building GLBs in background (non-blocking, ~2MB each)
    // Both are ready well before the player can build their first castle or stone wall
    // Stagger all GLB preloads so they don't hit network simultaneously
    this.modelFactory.loadCastleGLB().catch(() => {});
    this.modelFactory.loadStoneWallGLB().catch(() => {});
    setTimeout(() => { this.modelFactory.loadFortressGLB().catch(() => {}); }, 600);
    setTimeout(() => { this.modelFactory.loadHouseGLB().catch(() => {}); }, 1200);
    setTimeout(() => { this.modelFactory.loadPeasantGLB().catch(() => {}); }, 1800);
    setTimeout(() => { this.modelFactory.loadFemaleVillagerGLB().catch(() => {}); }, 2400);
    setTimeout(() => { this.modelFactory.loadHorsemanGLB().catch(() => {}); }, 3000);
    setTimeout(() => { this.modelFactory.loadMosqueGLB().catch(() => {}); }, 3600);

    // Start Game Loops
    this.clock.getDelta(); // reset clock
    this.gameActive = true;
    this.animate();
    
    // Set up graphic resolution visual feedback
    this.hud.updateResourcesUI();
    this.hud.showNotification(`🌲 Battle launched! You are playing as ${CIVILIZATIONS[this.selectedCiv].name}. Advancing to the next age requires Town Center.`);
  }

  spawnInitialAssets() {
    const mapSize = this.terrain.mapSize;
    const spawnDist = Math.round(mapSize * 0.32); // Spawns near quadrants
    
    // Player spawn (Bottom-Left: -x, -z)
    const px = -spawnDist;
    const pz = -spawnDist;
    const tc0 = this.entityManager.createBuilding('townCenter', 0, px, pz, true);
    this.gridAddBuilding(tc0);
    this.players[0].population = 3;
    this.entityManager.createUnit('villager', 0, px + 4, pz + 3);
    this.entityManager.createUnit('villager', 0, px + 3, pz + 6);
    this.entityManager.createUnit('villager', 0, px - 3, pz + 4);
    this.spawnStarterResources(px, pz);

    // Enemy spawn (Top-Right: +x, +z)
    const ex = spawnDist;
    const ez = spawnDist;
    const tc1 = this.entityManager.createBuilding('townCenter', 1, ex, ez, true);
    this.gridAddBuilding(tc1);
    this.players[1].population = 3;
    this.entityManager.createUnit('villager', 1, ex - 4, ez - 3);
    this.entityManager.createUnit('villager', 1, ex - 3, ez - 6);
    this.entityManager.createUnit('villager', 1, ex + 3, ez - 4);
    this.spawnStarterResources(ex, ez);

    // Ally spawn (Top-Left: -x, +z)
    if (this.alliesCount === 1) {
      const ax = -spawnDist;
      const az = spawnDist;
      const tc2 = this.entityManager.createBuilding('townCenter', 2, ax, az, true);
      this.gridAddBuilding(tc2);
      this.players[2].population = 3;
      this.entityManager.createUnit('villager', 2, ax + 4, az - 3);
      this.entityManager.createUnit('villager', 2, ax + 3, az - 6);
      this.entityManager.createUnit('villager', 2, ax - 3, az - 4);
      this.spawnStarterResources(ax, az);
    }

    // Neutral / Enemy 2 spawn (Bottom-Right: +x, -z)
    const nx = spawnDist;
    const nz = -spawnDist;
    const tc3 = this.entityManager.createBuilding('townCenter', 3, nx, nz, true);
    this.gridAddBuilding(tc3);
    if (this.enemiesCount === 2) {
      this.players[3].population = 3;
      this.entityManager.createUnit('villager', 3, nx - 4, nz + 3);
      this.entityManager.createUnit('villager', 3, nx - 3, nz + 6);
      this.entityManager.createUnit('villager', 3, nx + 3, nz + 4);
    } else {
      this.players[3].population = 2;
      this.entityManager.createUnit('villager', 3, nx - 4, nz + 3);
      this.entityManager.createUnit('villager', 3, nx - 3, nz + 4);
    }
    this.spawnStarterResources(nx, nz);
  }

  spawnStarterResources(cx, cz) {
    // Spawns starter forests, gold deposits and stone quarries immediately adjacent to the TC
    const starterGroups = [
      { type: 'wood', count: 12, offset: { x: -9, z: 9 }, radius: 4 },
      { type: 'gold', count: 4, offset: { x: 10, z: 10 }, radius: 2.5 },
      { type: 'stone', count: 3, offset: { x: 10, z: -10 }, radius: 2.5 }
    ];

    starterGroups.forEach(group => {
      for (let i = 0; i < group.count; i++) {
        const angle = (i / group.count) * Math.PI * 2 + Math.random() * 0.4;
        const dist = Math.random() * group.radius;
        const rx = Math.round(cx + group.offset.x + Math.cos(angle) * dist);
        const rz = Math.round(cz + group.offset.z + Math.sin(angle) * dist);
        
        if (this.isCellBlocked(rx, rz)) continue;
        
        const ry = this.terrain.getGroundHeight(rx, rz);
        if (ry < -0.5) continue; // Skip water
        
        const node = new ResourceNode(this, group.type, rx, ry, rz);
        this.entityManager.addResource(node);
      }
    });
  }

  // -------------------------------------------------------------
  // RESOURCE MANAGEMENT
  // -------------------------------------------------------------
  getUnitCost(type) {
    if (type === 'villager') {
      return { food: 50 };
    } else if (type === 'swordsman') {
      return { food: 60, gold: 20 };
    } else if (type === 'spearman') {
      return { food: 35, wood: 25 };
    } else if (type === 'skirmisher') {
      return { food: 25, wood: 35 };
    } else if (type === 'scoutCavalry') {
      return { food: 80 };
    } else if (type === 'camelRider') {
      return { food: 55, gold: 60 };
    } else if (type === 'cavalryArcher') {
      return { food: 40, gold: 60 };
    } else if (type === 'monk') {
      return { gold: 100 };
    } else if (type === 'footKnight') {
      return { food: 75, gold: 35 };
    } else if (type === 'archer') {
      return { food: 40, wood: 25 };
    } else if (type === 'knight') {
      return { food: 70, gold: 40 };
    } else if (type === 'heavyCavalry') {
      return { food: 90, gold: 60 };
    } else if (type === 'horseArcher') {
      return { food: 50, wood: 50 };
    } else if (type === 'priest') {
      return { gold: 100 };
    } else if (type === 'trader') {
      return { wood: 60, gold: 60 };
    } else if (type === 'fishingShip') {
      return { wood: 75 };
    } else if (type === 'transportShip') {
      return { wood: 125 };
    } else if (type === 'galley') {
      return { wood: 90, gold: 30 };
    } else if (type === 'fireShip') {
      return { wood: 75, gold: 45 };
    } else if (type === 'demolitionShip') {
      return { wood: 70, gold: 50 };
    } else if (type === 'cannonGalleon') {
      return { wood: 200, gold: 150 };
    } else if (type === 'batteringRam') {
      return { wood: 160, gold: 75 };
    } else if (type === 'mangonel') {
      return { wood: 160, gold: 135 };
    } else if (type === 'scorpion') {
      return { wood: 75, gold: 75 };
    } else if (type === 'bombardCannon') {
      return { wood: 225, gold: 225 };
    } else if (type === 'siegeTower') {
      return { wood: 200, gold: 160 };
    } else if (type === 'trebuchet') {
      return { wood: 200, gold: 200 };
    } else if (type === 'petard') {
      return { food: 65, gold: 20 };
    } else if (type === 'eagleWarrior') {
      return { food: 20, gold: 50 };
    } else if (type === 'handCannoneer') {
      return { food: 45, gold: 50 };
    } else if (type === 'elephantArcher') {
      return { food: 100, gold: 70 };
    } else if (type === 'battleElephant') {
      return { food: 120, gold: 70 };
    } else if (type === 'steppeLancer') {
      return { food: 70, gold: 30 };
    } else if (type === 'missionary') {
      return { gold: 100 };
    } else if (type === 'longbowman') {
      return { wood: 35, gold: 40 };
    } else if (type === 'cataphract') {
      return { food: 75, gold: 75 };
    } else if (type === 'throwingAxeman') {
      return { food: 55, gold: 25 };
    } else if (type === 'mangudai') {
      return { wood: 55, gold: 65 };
    } else if (type === 'conquistador') {
      return { food: 60, gold: 60 };
    } else if (type === 'karambitWarrior') {
      return { food: 30, gold: 15 };
    } else if (type === 'boyar') {
      return { food: 50, gold: 80 };
    } else if (type === 'samurai') {
      return { food: 60, gold: 30 };
    } else if (type === 'chuKoNu') {
      return { wood: 40, gold: 35 };
    } else if (type === 'woadRaider') {
      return { food: 65, gold: 25 };
    } else if (type === 'huskarl') {
      return { food: 52, gold: 26 };
    } else if (type === 'teutonicKnight') {
      return { food: 85, gold: 40 };
    } else if (type === 'tarkan') {
      return { food: 60, gold: 60 };
    } else if (type === 'janissary') {
      return { food: 60, gold: 55 };
    } else if (type === 'warElephant') {
      return { food: 200, gold: 75 };
    } else if (type === 'jaguarWarrior') {
      return { food: 60, gold: 30 };
    } else if (type === 'plumedArcher') {
      return { wood: 50, gold: 50 };
    } else if (type === 'centurion') {
      return { food: 75, gold: 85 };
    } else if (type === 'berserk') {
      return { food: 65, gold: 25 };
    }
    return {};
  }

  getUpgradeCost(type, currentLevel) {
    const costs = {
      swordsmanUpgrade: [{ food: 100, gold: 40 }, { food: 200, gold: 100 }],
      archerUpgrade: [{ food: 100, wood: 50 }, { food: 200, wood: 100 }],
      knightUpgrade: [{ food: 150, gold: 80 }, { food: 300, gold: 150 }],
      footKnightUpgrade: [{ food: 120, gold: 60 }, { food: 240, gold: 120 }],
      heavyCavalryUpgrade: [{ food: 200, gold: 120 }, { food: 400, gold: 250 }],
      horseArcherUpgrade: [{ food: 150, wood: 100 }, { food: 300, wood: 200 }],
      palisadeWallUpgrade: [{ wood: 100, gold: 50 }, { wood: 200, gold: 100 }],
      stoneWallUpgrade: [{ stone: 150, gold: 100 }, { stone: 300, gold: 200 }],
      watchTowerUpgrade: [{ wood: 100, stone: 100 }, { wood: 200, stone: 200, gold: 100 }],
      batteringRamUpgrade: [{ food: 150, gold: 100 }, { food: 300, gold: 200 }],
      mangonelUpgrade: [{ food: 200, gold: 150 }, { food: 400, gold: 250 }],
      scorpionUpgrade: [{ wood: 200, gold: 100 }],
      bombardCannonUpgrade: [{ food: 300, gold: 200 }],
      spearmanUpgrade: [{ food: 215, gold: 150 }, { food: 300, gold: 600 }],
      skirmisherUpgrade: [{ food: 230, wood: 130 }],
      scoutUpgrade: [{ food: 150, gold: 50 }, { food: 500, gold: 600 }],
      camelUpgrade: [{ food: 325, gold: 360 }, { food: 500, gold: 500 }],
      cavalryArcherUpgrade: [{ food: 350, gold: 250 }],
      sanctity: [{ gold: 120 }],
      fervor: [{ gold: 140 }],
      redemption: [{ gold: 475 }],
      atonement: [{ gold: 325 }],
      heresy: [{ gold: 1000 }],
      faith: [{ gold: 750 }],
      illumination: [{ gold: 120 }],
      blockPrinting: [{ gold: 200 }],
      theocracy: [{ gold: 200 }],
      galleyUpgrade: [{ food: 230, gold: 100 }, { food: 400, gold: 315 }],
      fireShipUpgrade: [{ food: 280, gold: 250 }],
      loom: [{ gold: 50 }],
      wheelbarrow: [{ food: 175, wood: 50 }],
      handCart: [{ food: 300, wood: 200 }],
      townWatch: [{ food: 75 }],
      townPatrol: [{ food: 300, gold: 200 }],
      horseCollar: [{ food: 75, wood: 75 }],
      heavyPlow: [{ food: 125, wood: 125 }],
      cropRotation: [{ food: 250, wood: 250 }],
      doubleBitAxe: [{ food: 100, wood: 50 }],
      bowSaw: [{ food: 150, wood: 100 }],
      twoManSaw: [{ food: 300, wood: 200 }],
      goldMining: [{ food: 100, wood: 75 }],
      goldShaftMining: [{ food: 200, wood: 150 }],
      stoneMining: [{ food: 100, wood: 75 }],
      stoneShaftMining: [{ food: 200, wood: 150 }],
      coinage: [{ food: 200, gold: 100 }],
      banking: [{ food: 300, gold: 200 }],
      guilds: [{ food: 200, gold: 300 }],
      careening: [{ food: 250, gold: 150 }],
      dryDock: [{ food: 600, gold: 400 }],
      shipwright: [{ food: 1000, gold: 800 }],
      gillnets: [{ food: 150, gold: 200 }],
      squires: [{ food: 100 }],
      arson: [{ food: 150, gold: 50 }],
      thumbRing: [{ food: 300, wood: 250 }],
      ballistics: [{ wood: 400, gold: 175 }],
      bloodlines: [{ food: 150, gold: 100 }],
      husbandry: [{ food: 150 }],
      hoardings: [{ food: 400, wood: 400 }],
      sapper: [{ food: 400, gold: 200 }],
      conscription: [{ food: 150, gold: 150 }],
      spies: [{ gold: 1000 }],
      heatedShot: [{ food: 350, gold: 100 }],
      masonry: [{ food: 150, wood: 175 }],
      architecture: [{ food: 200, wood: 300, gold: 100 }],
      chemistry: [{ food: 300, gold: 200 }],
      siegeEngineers: [{ food: 500, wood: 600 }],
      murderHoles: [{ food: 200, stone: 200 }],
      arrowslits: [{ food: 250, wood: 250 }]
    };
    if (costs[type] && costs[type][currentLevel]) {
      return costs[type][currentLevel];
    }
    const multiplier = currentLevel + 1;
    return {
      food: multiplier * 100,
      gold: multiplier * 50
    };
  }

  getBuildingCost(type) {
    if (type === 'house') {
      return { wood: 50 };
    } else if (type === 'barracks') {
      return { wood: 120, stone: 50 };
    } else if (type === 'stable' || type === 'archeryRange' || type === 'monastery') {
      return { wood: 175 };
    } else if (type === 'bombardTower') {
      return { stone: 250, gold: 100 };
    } else if (type === 'temple') {
      return { wood: 120, gold: 100 };
    } else if (type === 'market') {
      return { wood: 100 };
    } else if (type === 'dock') {
      const playerCiv = this.players[0].civ || 'inggris';
      const civ = CIVILIZATIONS[playerCiv];
      const discount = (civ && civ.modifiers && civ.modifiers.costDock) ? civ.modifiers.costDock : 1.0;
      return { wood: Math.round(150 * discount) };
    } else if (type === 'farm') {
      return { wood: 60 };
    } else if (type === 'mill' || type === 'lumberCamp' || type === 'miningCamp') {
      return { wood: 100 };
    } else if (type === 'palisadeWall') {
      return { wood: 5 };
    } else if (type === 'palisadeGate') {
      return { wood: 30 };
    } else if (type === 'stoneWall') {
      return { stone: 5 };
    } else if (type === 'stoneGate') {
      return { stone: 30 };
    } else if (type === 'watchTower') {
      return { wood: 100, stone: 125 };
    } else if (type === 'blacksmith') {
      return { wood: 150 };
    } else if (type === 'university') {
      return { wood: 200, gold: 100 };
    } else if (type === 'siegeWorkshop') {
      return { wood: 200, gold: 100 };
    } else if (type === 'castle') {
      return { wood: 200, stone: 650 };
    } else if (type === 'outpost') {
      return { wood: 25, stone: 5 };
    } else if (type === 'wonder') {
      return { wood: 1000, gold: 1000, stone: 1000 };
    } else if (type === 'fishTrap') {
      return { wood: 100 };
    }
    return {};
  }

  hasResources(playerId, cost) {
    const res = this.players[playerId].resources;
    for (const key in cost) {
      if (!res[key] || res[key] < cost[key]) {
        return false;
      }
    }
    return true;
  }

  deductResources(playerId, cost) {
    const res = this.players[playerId].resources;
    for (const key in cost) {
      res[key] -= cost[key];
    }
    if (playerId === 0) {
      this.hud.updateResourcesUI();
    }
  }

  depositResources(playerId, type, amount) {
    if (!type) return;
    this.players[playerId].resources[type] += amount;
    if (playerId === 0) {
      this.hud.updateResourcesUI();
    }
  }

  addPopulationLimit(playerId, amount) {
    this.players[playerId].populationLimit = Math.max(0, Math.min(this.maxPopulationCap, this.players[playerId].populationLimit + amount));
    if (playerId === 0) {
      this.hud.updateResourcesUI();
    }
  }

  // -------------------------------------------------------------
  // GRID COLLISION MAP
  // -------------------------------------------------------------
  gridAdd(x, z, type) {
    this.gridMap[`${x},${z}`] = type;
  }

  gridRemove(x, z) {
    delete this.gridMap[`${x},${z}`];
  }

  isCellBlocked(x, z) {
    return this.gridMap[`${x},${z}`] !== undefined;
  }

  findPath(startX, startZ, endX, endZ, isWaterUnit = false, playerId = 0) {
    // A* Pathfinding implementation with a step size of 2 units (highly optimized)
    const step = 2;
    
    const startNode = {
      x: Math.round(startX / step) * step,
      z: Math.round(startZ / step) * step,
      g: 0,
      h: Math.abs(endX - startX) + Math.abs(endZ - startZ),
      parent: null
    };
    
    const endNode = {
      x: Math.round(endX / step) * step,
      z: Math.round(endZ / step) * step
    };

    const openSet = [startNode];
    const closedSet = new Set();
    const getHash = (x, z) => `${x},${z}`;

    let bestNode = startNode;
    let iterations = 0;
    // Scale search steps to support pathfinding across larger maps while preserving 60fps
    const maxIterations = Math.max(350, Math.round(this.terrain.mapSize * 1.25));

    const isPassable = (x, z) => {
      // Map boundaries check
      const halfMap = this.terrain.mapSize / 2;
      if (Math.abs(x) > halfMap - 2 || Math.abs(z) > halfMap - 2) return false;

      // Ground height / water check
      const height = this.terrain.getGroundHeight(x, z);
      if (isWaterUnit) {
        if (height >= -0.5) return false; // Water units (fishing ship) only move in water
      } else {
        if (height < -0.5) return false; // Land units cannot cross water
      }

      // Check grid map collisions (buildings, resources) in 3x3 footprint
      for (let dx = -1; dx <= 1; dx++) {
        for (let dz = -1; dz <= 1; dz++) {
          const val = this.gridMap[`${x + dx},${z + dz}`];
          if (val !== undefined) {
            // Friendly completed gates don't block friendly units during pathfinding
            if (typeof val === 'object' && val.type) {
              const isFriendlyGate = (val.type === 'palisadeGate' || val.type === 'stoneGate') && 
                                     val.playerId === (isWaterUnit ? -1 : playerId) && 
                                     val.isCompleted;
              if (isFriendlyGate) {
                continue;
              }
            }
            return false;
          }
        }
      }
      return true;
    };

    // If destination is blocked, search spirally for a nearby passable coordinate
    if (!isPassable(endNode.x, endNode.z)) {
      let foundAlternative = false;
      for (let r = 2; r <= 8; r += 2) {
        for (let dx = -r; dx <= r; dx += 2) {
          for (let dz = -r; dz <= r; dz += 2) {
            if (Math.abs(dx) !== r && Math.abs(dz) !== r) continue;
            const ax = endNode.x + dx;
            const az = endNode.z + dz;
            if (isPassable(ax, az)) {
              endNode.x = ax;
              endNode.z = az;
              foundAlternative = true;
              break;
            }
          }
          if (foundAlternative) break;
        }
        if (foundAlternative) break;
      }
    }

    while (openSet.length > 0 && iterations < maxIterations) {
      iterations++;
      // Sort openSet by f-cost (g + h)
      openSet.sort((a, b) => (a.g + a.h) - (b.g + b.h));
      const current = openSet.shift();

      if (current.x === endNode.x && current.z === endNode.z) {
        const path = [];
        let curr = current;
        while (curr !== null) {
          path.push(new THREE.Vector3(curr.x, this.terrain.getGroundHeight(curr.x, curr.z), curr.z));
          curr = curr.parent;
        }
        return path.reverse();
      }

      closedSet.add(getHash(current.x, current.z));

      if (current.h < bestNode.h) {
        bestNode = current;
      }

      // 8-directional movement neighbors
      const neighbors = [
        { x: step, z: 0 }, { x: -step, z: 0 }, { x: 0, z: step }, { x: 0, z: -step },
        { x: step, z: step }, { x: -step, z: step }, { x: step, z: -step }, { x: -step, z: -step }
      ];

      for (const dir of neighbors) {
        const nx = current.x + dir.x;
        const nz = current.z + dir.z;
        const hash = getHash(nx, nz);

        if (closedSet.has(hash)) continue;
        if (!isPassable(nx, nz)) continue;

        const isDiagonal = (dir.x !== 0 && dir.z !== 0);
        const gCost = current.g + (isDiagonal ? step * 1.414 : step);
        const hCost = Math.abs(endNode.x - nx) + Math.abs(endNode.z - nz);

        let existing = openSet.find(node => node.x === nx && node.z === nz);
        if (!existing) {
          openSet.push({ x: nx, z: nz, g: gCost, h: hCost, parent: current });
        } else if (gCost < existing.g) {
          existing.g = gCost;
          existing.parent = current;
        }
      }
    }

    // Fallback: build path to the closest node reached
    const path = [];
    let curr = bestNode;
    while (curr !== null) {
      path.push(new THREE.Vector3(curr.x, this.terrain.getGroundHeight(curr.x, curr.z), curr.z));
      curr = curr.parent;
    }
    return path.reverse();
  }

  gridAddBuilding(building) {
    const size = building.gridSize;
    const startX = Math.round(building.position.x - size / 2);
    const startZ = Math.round(building.position.z - size / 2);
    
    for (let dx = 0; dx < size; dx++) {
      for (let dz = 0; dz < size; dz++) {
        this.gridAdd(startX + dx, startZ + dz, building);
      }
    }
  }

  gridRemoveBuilding(building) {
    const startX = Math.round(building.position.x - building.gridSize / 2);
    const startZ = Math.round(building.position.z - building.gridSize / 2);
    
    for (let dx = 0; dx < building.gridSize; dx++) {
      for (let dz = 0; dz < building.gridSize; dz++) {
        this.gridRemove(startX + dx, startZ + dz);
      }
    }
  }

  checkBuildPosition(x, z, buildingType) {
    let size = 2;
    if (buildingType === 'townCenter' || buildingType === 'wonder') size = 4;
    else if (['barracks', 'temple', 'market', 'dock', 'university', 'siegeWorkshop', 'blacksmith', 'stable', 'archeryRange', 'monastery'].includes(buildingType)) size = 3;
    else if (['palisadeWall', 'stoneWall', 'watchTower', 'bombardTower', 'outpost', 'fishTrap'].includes(buildingType)) size = 1;
    else if (buildingType === 'palisadeGate' || buildingType === 'stoneGate' || buildingType === 'mill' || buildingType === 'lumberCamp' || buildingType === 'miningCamp') size = 2;
    
    const startX = Math.round(x - size / 2);
    const startZ = Math.round(z - size / 2);
    
    // Check if within map boundaries
    const halfMap = this.terrain.mapSize / 2;
    if (startX < -halfMap + 2 || startX + size > halfMap - 2 ||
        startZ < -halfMap + 2 || startZ + size > halfMap - 2) {
      return false;
    }

    let hasLand = false;
    let hasWater = false;

    // Check cells
    for (let dx = 0; dx < size; dx++) {
      for (let dz = 0; dz < size; dz++) {
        const curX = startX + dx;
        const curZ = startZ + dz;
        
        const height = this.terrain.getGroundHeight(curX, curZ);
        
        if (buildingType === 'dock') {
          if (height >= -0.4) hasLand = true;
          if (height < -0.4) hasWater = true;
        } else if (buildingType === 'fishTrap') {
          if (height >= -0.4) {
            return false; // Water only
          }
        } else {
          // Terrain steepness check (no building in water/slopes for normal buildings)
          if (height < -0.4) {
            return false;
          }
        }
        
        if (this.isCellBlocked(curX, curZ)) {
          // Allow replacement of walls by gates and watchtowers
          const blockingEntity = this.gridMap[`${curX},${curZ}`];
          if (typeof blockingEntity === 'object' && blockingEntity.type) {
            const canReplace = 
              (buildingType === 'palisadeGate' && blockingEntity.type === 'palisadeWall') ||
              (buildingType === 'stoneGate' && blockingEntity.type === 'stoneWall') ||
              (buildingType === 'watchTower' && (blockingEntity.type === 'palisadeWall' || blockingEntity.type === 'stoneWall'));
            if (canReplace && blockingEntity.playerId === 0) {
              continue;
            }
          }
          return false;
        }
      }
    }

    if (buildingType === 'dock') {
      if (!hasLand || !hasWater) {
        return false;
      }
    }
    return true;
  }

  placeBuilding(x, z, buildingType, angle = 0) {
    // Check Age and Civilization restrictions
    const playerCiv = this.players[0].civ || 'inggris';
    const civ = CIVILIZATIONS[playerCiv];
    const civModifiers = (civ && civ.modifiers) ? civ.modifiers : {};
    const currentAge = this.players[0].age || 'dark';

    // 1. Goth stone wall restriction
    if (civModifiers.noStoneWalls && (buildingType === 'stoneWall' || buildingType === 'stoneGate')) {
      this.hud.showNotification("Goth faksi tidak bisa membangun tembok batu!");
      return false;
    }

    // 2. Age Restrictions
    if (currentAge === 'dark' && ['palisadeGate', 'stoneWall', 'stoneGate', 'university', 'siegeWorkshop', 'stable', 'archeryRange', 'watchTower'].includes(buildingType)) {
      this.hud.showNotification("Butuh Zaman Feodal ke atas untuk membangun struktur ini!");
      return false;
    }
    if ((currentAge === 'dark' || currentAge === 'feudal') && ['monastery', 'castle'].includes(buildingType)) {
      this.hud.showNotification("Butuh Zaman Kastil ke atas untuk membangun struktur ini!");
      return false;
    }
    if (currentAge !== 'imperial' && ['bombardTower'].includes(buildingType)) {
      this.hud.showNotification("Butuh Zaman Imperial untuk membangun struktur ini!");
      return false;
    }

    const cost = this.getBuildingCost(buildingType);
    
    if (!this.hasResources(0, cost)) {
      this.hud.showNotification("Sumber daya tidak cukup!");
      return false;
    }
    
    if (!this.checkBuildPosition(x, z, buildingType)) {
      return false;
    }
    
    // Deduct cost
    this.deductResources(0, cost);

    // Overlapping walls replacement: destroy any overlapping wall entities
    let size = 2;
    if (buildingType === 'townCenter') size = 4;
    else if (['barracks', 'temple', 'market', 'dock', 'university', 'siegeWorkshop', 'blacksmith', 'stable', 'archeryRange', 'monastery'].includes(buildingType)) size = 3;
    else if (['palisadeWall', 'stoneWall', 'watchTower', 'bombardTower'].includes(buildingType)) size = 1;
    else if (buildingType === 'palisadeGate' || buildingType === 'stoneGate' || buildingType === 'mill' || buildingType === 'lumberCamp' || buildingType === 'miningCamp') size = 2;
    
    const startX = Math.round(x - size / 2);
    const startZ = Math.round(z - size / 2);
    
    const replacedBuildings = new Set();
    for (let dx = 0; dx < size; dx++) {
      for (let dz = 0; dz < size; dz++) {
        const curX = startX + dx;
        const curZ = startZ + dz;
        const blocking = this.gridMap[`${curX},${curZ}`];
        if (typeof blocking === 'object' && blocking.type) {
          replacedBuildings.add(blocking);
        }
      }
    }
    replacedBuildings.forEach(b => {
      b.destroy();
    });
    
    // Spawn blueprint building
    const b = this.entityManager.createBuilding(buildingType, 0, x, z, false, angle);
    this.gridAddBuilding(b);
    
    // If we have selected villagers, automatically command them to build it
    const selectedVillagers = this.selectedEntities.filter(e => e.type === 'villager' && e.playerId === 0);
    if (selectedVillagers.length > 0) {
      selectedVillagers.forEach(v => v.commandBuild(b));
    }
    // If we have selected fishing ships and placing a fishTrap, command them to build it
    const selectedFishingShips = this.selectedEntities.filter(e => e.type === 'fishingShip' && e.playerId === 0);
    if (selectedFishingShips.length > 0 && buildingType === 'fishTrap') {
      selectedFishingShips.forEach(fs => fs.commandBuild(b));
    }
    
    this.soundManager.playClickSound('build');
    return true;
  }

  isEnemy(p1, p2) {
    if (p1 === p2) return false;
    return this.relations[p1] && this.relations[p1][p2] === 'enemy';
  }

  isAlly(p1, p2) {
    if (p1 === p2) return true;
    return this.relations[p1] && this.relations[p1][p2] === 'ally';
  }

  changeRelation(playerId, targetPlayerId, stance) {
    if (!this.relations[playerId]) this.relations[playerId] = {};
    this.relations[playerId][targetPlayerId] = stance;
    
    if (playerId === 0) {
      let responseText = "";
      const targetName = targetPlayerId === 1 ? "Lord Kahn" : targetPlayerId === 2 ? "Gajah Mada" : "Nomad Grey";
      
      if (stance === 'enemy') {
        // If we set an ally/neutral to enemy, they set us to enemy in return!
        if (this.relations[targetPlayerId] && this.relations[targetPlayerId][0] !== 'enemy') {
          this.relations[targetPlayerId][0] = 'enemy';
          if (targetPlayerId === 2) {
            responseText = "Gajah Mada: Pengkhianat! Kau akan membayar harga dari pembelotan ini!";
          } else if (targetPlayerId === 3) {
            responseText = "Nomad Grey: Kami tidak menginginkan pertempuran, tetapi kami akan mempertahankan diri!";
          }
        }
      } else if (stance === 'ally') {
        if (targetPlayerId === 1) {
          responseText = "Lord Kahn: Kita masih berperang, dasar bodoh!";
          this.relations[0][1] = 'enemy'; // Force back to enemy!
        } else if (targetPlayerId === 3) {
          responseText = "Nomad Grey: Semoga aliansi ini membawa kedamaian bagi wilayah kita.";
          this.relations[3][0] = 'ally'; // Neutral accepts alliance!
        } else if (targetPlayerId === 2) {
          responseText = "Gajah Mada: Senang kita kembali menjadi sekutu sejati.";
          this.relations[2][0] = 'ally';
        }
      } else if (stance === 'neutral') {
        if (targetPlayerId === 1) {
          responseText = "Lord Kahn: Tidak ada perdamaian di antara kita!";
          this.relations[0][1] = 'enemy'; // Force back
        } else {
          responseText = `${targetName}: Kami akan menjaga jarak dan memantau gerak-gerikmu.`;
          if (this.relations[targetPlayerId]) {
            this.relations[targetPlayerId][0] = 'neutral';
          }
        }
      }
      
      if (responseText) {
        this.hud.addChatMessage('sys', targetName, responseText);
      }
      
      this.hud.showNotification(`Relation to ${targetName} set to ${stance.toUpperCase()}`);
    }
  }

  sendTribute(targetPlayerId, resourceType, amount) {
    if (this.players[0].resources[resourceType] < amount) {
      this.hud.showNotification(`Not enough ${resourceType} to send tribute!`);
      return;
    }
    
    // Deduct from player 0
    this.players[0].resources[resourceType] -= amount;
    // Add to target player
    this.players[targetPlayerId].resources[resourceType] += amount;
    
    this.hud.updateResourcesUI();
    
    const targetName = targetPlayerId === 1 ? "Lord Kahn" : targetPlayerId === 2 ? "Gajah Mada" : "Nomad Grey";
    this.hud.showNotification(`Sent tribute of ${amount} ${resourceType} to ${targetName}`);
    this.hud.addChatMessage('sys', 'Anda', `Mengirim upeti ${amount} ${resourceType} ke ${targetName}`);
    
    // React to tribute
    let reply = "";
    if (targetPlayerId === 1) { // Enemy
      reply = "Lord Kahn: Upeti ini tidak akan menyelamatkan kerajaanmu dari kehancuran, tetapi akan aku ambil!";
    } else if (targetPlayerId === 2) { // Ally
      reply = "Gajah Mada: Terima kasih atas bantuan logistik ini, sahabatku!";
    } else { // Neutral
      reply = "Nomad Grey: Keramahanmu sangat dihargai. Hubungan perdagangan kita akan semakin kuat.";
    }
    this.hud.addChatMessage('sys', targetName, reply);
  }

  calculatePlayerScore(playerId) {
    const p = this.players[playerId];
    if (!p) return 0;
    
    let score = 0;
    // 1. Resources score: current resources / 10
    score += Math.floor((p.resources.food + p.resources.wood + p.resources.gold + p.resources.stone) / 10);
    
    // 2. Units score: count active units * 15
    const unitsCount = this.entityManager.units.filter(u => u.playerId === playerId && u.hp > 0).length;
    score += unitsCount * 15;
    
    // 3. Buildings score: count active buildings * 30
    const buildingsCount = this.entityManager.buildings.filter(b => b.playerId === playerId && b.hp > 0).length;
    score += buildingsCount * 30;
    
    // 4. Technology upgrades score: count upgrades researched * 50
    let upgradesCount = 0;
    for (const k in p.upgrades) {
      upgradesCount += p.upgrades[k] || 0;
    }
    score += upgradesCount * 50;
    
    // 5. Kills score: kills * 25
    const kills = p.kills || 0;
    score += kills * 25;
    
    return score;
  }

  updateFogOfWar(deltaTime) {
    const FOW_GRID_SIZE = 50;
    if (!this.fowGrid) {
      this.fowGrid = Array(FOW_GRID_SIZE).fill(null).map(() => Array(FOW_GRID_SIZE).fill(0));
    }
    
    // Reset currently visible (2) cells to explored (1)
    for (let x = 0; x < FOW_GRID_SIZE; x++) {
      for (let z = 0; z < FOW_GRID_SIZE; z++) {
        if (this.fowGrid[x][z] === 2) {
          this.fowGrid[x][z] = 1;
        }
      }
    }
    
    const entities = [
      ...this.entityManager.units.filter(u => u.playerId === 0 || u.playerId === 2),
      ...this.entityManager.buildings.filter(b => b.playerId === 0 || b.playerId === 2)
    ];
    
    const mapSize = this.terrain ? this.terrain.mapSize : 500;
    
    entities.forEach(ent => {
      if (ent.hp <= 0 || ent.state === 'DEAD' || ent.state === 'GARRISONED') return;
      
      // Sight ranges
      let sightRadius = 12.0;
      if (ent.type === 'villager') sightRadius = 10.0;
      else if (ent.type === 'scoutCavalry') sightRadius = 16.0;
      else if (ent.type === 'watchTower') sightRadius = 25.0;
      else if (ent.type === 'castle') sightRadius = 30.0;
      else if (ent.type === 'townCenter') sightRadius = 22.0;
      else if (ent.type === 'fishingShip') sightRadius = 10.0;
      else if (['mill','barracks','stable','siegeWorkshop','monastery','university','blacksmith','market','dock'].includes(ent.type)) {
        sightRadius = 16.0;
      }
      
      const gx = Math.floor(((ent.position.x + mapSize/2) / mapSize) * FOW_GRID_SIZE);
      const gz = Math.floor(((ent.position.z + mapSize/2) / mapSize) * FOW_GRID_SIZE);
      
      if (gx < 0 || gx >= FOW_GRID_SIZE || gz < 0 || gz >= FOW_GRID_SIZE) return;
      
      const gridSight = Math.ceil((sightRadius / mapSize) * FOW_GRID_SIZE);
      
      for (let dx = -gridSight; dx <= gridSight; dx++) {
        for (let dz = -gridSight; dz <= gridSight; dz++) {
          if (dx*dx + dz*dz <= gridSight*gridSight) {
            const nx = gx + dx;
            const nz = gz + dz;
            if (nx >= 0 && nx < FOW_GRID_SIZE && nz >= 0 && nz < FOW_GRID_SIZE) {
              this.fowGrid[nx][nz] = 2; // Visible
            }
          }
        }
      }
    });
    
    // Apply visibility to units in the world
    const units = this.entityManager.units;
    units.forEach(u => {
      if (u.playerId === 0 || u.playerId === 2) {
        if (u.mesh) u.mesh.visible = true;
        return;
      }
      const gx = Math.floor(((u.position.x + mapSize/2) / mapSize) * FOW_GRID_SIZE);
      const gz = Math.floor(((u.position.z + mapSize/2) / mapSize) * FOW_GRID_SIZE);
      let isVisible = false;
      if (gx >= 0 && gx < FOW_GRID_SIZE && gz >= 0 && gz < FOW_GRID_SIZE) {
        isVisible = (this.fowGrid[gx][gz] === 2);
      }
      if (u.mesh) u.mesh.visible = isVisible;
    });
    
    // Apply visibility to buildings
    const buildings = this.entityManager.buildings;
    buildings.forEach(b => {
      if (b.playerId === 0 || b.playerId === 2) {
        if (b.mesh) b.mesh.visible = true;
        return;
      }
      const gx = Math.floor(((b.position.x + mapSize/2) / mapSize) * FOW_GRID_SIZE);
      const gz = Math.floor(((b.position.z + mapSize/2) / mapSize) * FOW_GRID_SIZE);
      let isExplored = false;
      if (gx >= 0 && gx < FOW_GRID_SIZE && gz >= 0 && gz < FOW_GRID_SIZE) {
        isExplored = (this.fowGrid[gx][gz] > 0);
      }
      if (b.mesh) b.mesh.visible = isExplored;
    });
    
    // Apply visibility to resources
    const resources = this.entityManager.resources;
    resources.forEach(node => {
      const gx = Math.floor(((node.position.x + mapSize/2) / mapSize) * FOW_GRID_SIZE);
      const gz = Math.floor(((node.position.z + mapSize/2) / mapSize) * FOW_GRID_SIZE);
      let isExplored = false;
      if (gx >= 0 && gx < FOW_GRID_SIZE && gz >= 0 && gz < FOW_GRID_SIZE) {
        isExplored = (this.fowGrid[gx][gz] > 0);
      }
      if (node.mesh) node.mesh.visible = isExplored;
    });
  }

  // -------------------------------------------------------------
  // SELECTION
  // -------------------------------------------------------------
  selectEntity(entity) {
    this.deselectAll();
    this.selectedEntities = [entity];
    entity.setSelected(true);
    this.hud.updateSelectionUI();
    this.soundManager.playClickSound('select');
  }

  selectEntities(entities) {
    this.deselectAll();
    this.selectedEntities = entities;
    this.selectedEntities.forEach(e => e.setSelected(true));
    this.hud.updateSelectionUI();
    this.soundManager.playClickSound('select');
  }

  deselectAll() {
    this.selectedEntities.forEach(e => e.setSelected(false));
    this.selectedEntities = [];
    this.hud.updateSelectionUI();
  }

  getClickableObjects() {
    return this.entityManager.getClickableMeshes();
  }

  // -------------------------------------------------------------
  // COMMAND SYSTEM
  // -------------------------------------------------------------
  
  cycleFormation() {
    const formations = ['box', 'line', 'column', 'flank', 'deathball'];
    const idx = formations.indexOf(this.currentFormation);
    this.currentFormation = formations[(idx + 1) % formations.length];
    return this.currentFormation;
  }

  getFormationName(key) {
    const names = { 
      box: '■ Box (Kotak)', 
      line: '═ Line (Baris)', 
      column: '║ Column (Kolom)', 
      flank: '⇄ Flank (Mengapit)', 
      deathball: '● Deathball (Gumpalan)' 
    };
    return names[key] || key;
  }

  calculateFormationOffsets(count, formation, heading) {
    const spacing = 1.6;
    const offsets = [];
    
    if (count <= 1) {
      offsets.push({ dx: 0, dz: 0 });
      return offsets;
    }

    // heading angle from group centroid to target (radians)
    const cosH = Math.cos(heading);
    const sinH = Math.sin(heading);

    if (formation === 'box') {
      const cols = Math.ceil(Math.sqrt(count));
      for (let i = 0; i < count; i++) {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const rows = Math.ceil(count / cols);
        // local offsets (x = sideways, z = depth behind target)
        const lx = (c - (cols - 1) / 2) * spacing;
        const lz = (r - (rows - 1) / 2) * spacing;
        // rotate to face heading
        offsets.push({
          dx: lx * cosH - lz * sinH,
          dz: lx * sinH + lz * cosH
        });
      }
    } else if (formation === 'line') {
      // Single row perpendicular to heading
      for (let i = 0; i < count; i++) {
        const lx = (i - (count - 1) / 2) * spacing;
        const lz = 0;
        offsets.push({
          dx: lx * cosH - lz * sinH,
          dz: lx * sinH + lz * cosH
        });
      }
    } else if (formation === 'column') {
      // Single column along the heading direction
      for (let i = 0; i < count; i++) {
        const lx = 0;
        const lz = (i - (count - 1) / 2) * spacing;
        offsets.push({
          dx: lx * cosH - lz * sinH,
          dz: lx * sinH + lz * cosH
        });
      }
    } else if (formation === 'flank') {
      // Split into 2 columns on the left and right sides
      const half = Math.ceil(count / 2);
      for (let i = 0; i < count; i++) {
        const side = (i % 2 === 0) ? -1 : 1;
        const row = Math.floor(i / 2);
        const lx = side * 5.0; // 5 units offset left/right
        const lz = (row - (half - 1) / 2) * spacing;
        offsets.push({
          dx: lx * cosH - lz * sinH,
          dz: lx * sinH + lz * cosH
        });
      }
    } else if (formation === 'deathball') {
      // Extremely tight spiral cluster
      for (let i = 0; i < count; i++) {
        const r = Math.sqrt(i) * spacing * 0.7;
        const angle = i * 2.39996; // Golden angle
        offsets.push({
          dx: Math.cos(angle) * r,
          dz: Math.sin(angle) * r
        });
      }
    }
    
    return offsets;
  }

  dispatchCommand(units, targetEntity, groundPoint) {
    const commandableUnits = units.filter(u => u.playerId === 0 && typeof u.commandMove === 'function');
    const count = commandableUnits.length;
    
    // Calculate group centroid for heading computation
    let centroidX = 0, centroidZ = 0;
    commandableUnits.forEach(u => {
      centroidX += u.position.x;
      centroidZ += u.position.z;
    });
    if (count > 0) {
      centroidX /= count;
      centroidZ /= count;
    }

    // Determine heading towards target
    let heading = 0;
    if (groundPoint) {
      heading = Math.atan2(groundPoint.x - centroidX, groundPoint.z - centroidZ);
    } else if (targetEntity) {
      heading = Math.atan2(targetEntity.position.x - centroidX, targetEntity.position.z - centroidZ);
    }

    const formationOffsets = this.calculateFormationOffsets(count, this.currentFormation, heading);

    // Sort units and offsets for box formation to protect Monk/Siege in the center
    if (this.currentFormation === 'box' && count > 1) {
      const getRolePriority = (type) => {
        if (['monk', 'trebuchet', 'mangonel', 'scorpion', 'bombardCannon', 'siegeTower'].includes(type)) return 0; // Center
        if (['archer', 'skirmisher', 'cavalryArcher', 'horseArcher'].includes(type)) return 1; // Middle
        return 2; // Perimeter guards
      };
      commandableUnits.sort((a, b) => getRolePriority(a.type) - getRolePriority(b.type));
      
      const centerOffsets = [...formationOffsets];
      centerOffsets.sort((a, b) => (a.dx * a.dx + a.dz * a.dz) - (b.dx * b.dx + b.dz * b.dz));
      
      for (let i = 0; i < count; i++) {
        formationOffsets[i] = centerOffsets[i];
      }
    }

    // Compute maximum distance for speed normalization
    let maxDist = 0;
    const unitDistances = [];
    commandableUnits.forEach((unit, idx) => {
      const off = formationOffsets[idx] || { dx: 0, dz: 0 };
      let targetX, targetZ;
      if (groundPoint) {
        targetX = groundPoint.x + off.dx;
        targetZ = groundPoint.z + off.dz;
      } else if (targetEntity) {
        targetX = targetEntity.position.x + off.dx;
        targetZ = targetEntity.position.z + off.dz;
      } else {
        targetX = unit.position.x;
        targetZ = unit.position.z;
      }
      const dist = Math.sqrt(
        (targetX - unit.position.x) ** 2 +
        (targetZ - unit.position.z) ** 2
      );
      unitDistances.push(dist);
      if (dist > maxDist) maxDist = dist;
    });

    commandableUnits.forEach((unit, idx) => {
      // Sheep movement commands support
      if (unit.type === 'sheep') {
        if (groundPoint) {
          unit.commandMove(groundPoint);
        } else if (targetEntity) {
          unit.commandMove(targetEntity.position);
        }
        return;
      }

      if (targetEntity) {
        const isResource = ['wood', 'gold', 'stone', 'food', 'sheep', 'fish'].includes(targetEntity.type);
        const isBuilding = ['townCenter', 'barracks', 'house', 'temple', 'market', 'dock', 'farm', 'watchTower', 'blacksmith', 'palisadeWall', 'palisadeGate', 'stoneWall', 'stoneGate', 'castle', 'university', 'siegeWorkshop'].includes(targetEntity.type);
        const isUnit = ['villager', 'swordsman', 'archer', 'knight', 'priest', 'trader', 'footKnight', 'heavyCavalry', 'horseArcher', 'fishingShip', 'sheep'].includes(targetEntity.type);

        if (targetEntity.type === 'sheep' && targetEntity.hp !== undefined) {
          // Live sheep target (gather/slaughter for villager, move for others)
          if (unit.type === 'villager') {
            unit.commandGather(targetEntity);
          } else {
            unit.commandMove(targetEntity.position);
          }
        }
        else if (isResource) {
          if (unit.type === 'villager') {
            unit.commandGather(targetEntity);
          } else if (unit.type === 'fishingShip' && targetEntity.type === 'fish') {
            unit.commandGather(targetEntity);
          } else {
            unit.commandMove(targetEntity.position);
          }
        } 
        else if (isBuilding) {
          if (targetEntity.playerId === 1) {
            unit.commandAttack(targetEntity);
          } else {
            if (!targetEntity.isCompleted) {
              if (unit.type === 'villager') {
                unit.commandBuild(targetEntity);
              } else {
                unit.commandMove(targetEntity.position);
              }
            } else {
              if (targetEntity.type === 'castle') {
                if (unit.type !== 'sheep' && unit.type !== 'fishingShip') {
                  unit.commandGarrison(targetEntity);
                } else {
                  unit.commandMove(targetEntity.position);
                }
              } else if (unit.type === 'villager' && targetEntity.type === 'farm' && targetEntity.amount > 0) {
                unit.commandGather(targetEntity);
              } else {
                unit.commandMove(targetEntity.position);
              }
            }
          }
        } 
        else if (isUnit) {
          if (targetEntity.playerId === 1) {
            unit.commandAttack(targetEntity);
          } else {
            unit.commandMove(targetEntity.position);
          }
        }
      } 
      else if (groundPoint) {
        if (count > 1) {
          const off = formationOffsets[idx] || { dx: 0, dz: 0 };
          const formationPoint = new THREE.Vector3(
            groundPoint.x + off.dx,
            groundPoint.y,
            groundPoint.z + off.dz
          );
          unit.commandMove(formationPoint);
          
          // Speed normalization: slow down closer units so they arrive together
          if (maxDist > 0 && unitDistances[idx] > 0) {
            const ratio = unitDistances[idx] / maxDist;
            unit._formationSpeedMult = Math.max(0.4, ratio);
          } else {
            unit._formationSpeedMult = 1.0;
          }
        } else {
          unit._formationSpeedMult = 1.0;
          unit.commandMove(groundPoint);
        }
      }
    });
  }

  // -------------------------------------------------------------
  // SYSTEM LOOPS
  // -------------------------------------------------------------
  animate() {
    if (!this.gameActive) return;

    if (!this._boundAnimate) this._boundAnimate = this.animate.bind(this);
    requestAnimationFrame(this._boundAnimate);

    const baseDeltaTime = Math.min(0.1, this.clock.getDelta()); // clamp spike deltas
    const deltaTime = baseDeltaTime * this.gameSpeedMultiplier;
    
    // Accumulate total game time
    this.gameTime += baseDeltaTime;

    // Drive all flag shader animations — one write updates every building flag simultaneously
    if (this.modelFactory) this.modelFactory._flagTimeUniform.value = this.gameTime;
    
    // Update camera controls (independent of game speed)
    this.renderer.update(baseDeltaTime);
    
    // Update Fog of War visibility (throttled to 150ms for major performance boost)
    if (this.fowTimer === undefined) this.fowTimer = 0;
    this.fowTimer += baseDeltaTime;
    if (this.fowTimer >= 0.15) {
      this.fowTimer = 0;
      this.updateFogOfWar(deltaTime);
    }
    
    // Update water shader waves
    if (this.terrain) {
      this.terrain.update(deltaTime);
    }
    
    // Update game objects
    this.entityManager.update(deltaTime);
    
    // Periodic check for neutral sheep takeover
    this.checkSheepTakeover(deltaTime);

    // Relic gold generation: +2 Gold/sec per relic in Monasteries
    if (this.relicGoldTimer === undefined) this.relicGoldTimer = 0;
    this.relicGoldTimer += deltaTime;
    if (this.relicGoldTimer >= 1.0) {
      this.relicGoldTimer = 0;
      const monasteries = this.entityManager.buildings.filter(b => b.type === 'monastery' && b.isCompleted);
      const relicsByPlayer = { 0: 0, 1: 0, 2: 0, 3: 0 };
      monasteries.forEach(m => {
        if (m.relicsCount) {
          relicsByPlayer[m.playerId] = (relicsByPlayer[m.playerId] || 0) + m.relicsCount;
        }
      });
      for (const pId in relicsByPlayer) {
        const count = relicsByPlayer[pId];
        if (count > 0) {
          this.depositResources(parseInt(pId, 10), 'gold', count * 2);
        }
      }
    }

    // Update AI factions
    if (this.enemyAI) {
      this.enemyAI.update(deltaTime);
    }
    if (this.enemyAI2) {
      this.enemyAI2.update(deltaTime);
    }
    if (this.allyAI) {
      this.allyAI.update(deltaTime);
    }
    if (this.neutralAI) {
      this.neutralAI.update(deltaTime);
    }
    
    // Update Wonder countdown
    if (this.wonderCountdown !== null && this.wonderCountdown !== undefined) {
      this.wonderCountdown -= deltaTime;
      if (this.wonderCountdown <= 0) {
        this.wonderCountdown = 0;
        const isPlayerTeam = (this.wonderOwnerId === 0 || this.wonderOwnerId === 2);
        this.gameOver(isPlayerTeam);
      }
    }
    
    // Tick VFX (particles & projectiles) in one batch instead of per-effect RAF
    this._updateActiveEffects(baseDeltaTime);

    // Render 3D Canvas
    this.renderer.render();
  }

  findNearestDropoff(position, playerId, resourceType = null) {
    const buildings = this.entityManager.buildings;
    let closestDropoff = null;
    let closestDist = Infinity;
    
    buildings.forEach(b => {
      if (b.playerId !== playerId || !b.isCompleted) return;
      
      let isValidDropoff = false;
      
      if (b.type === 'townCenter') {
        isValidDropoff = true;
      } else if (b.type === 'mill' && resourceType === 'food') {
        isValidDropoff = true;
      } else if (b.type === 'lumberCamp' && resourceType === 'wood') {
        isValidDropoff = true;
      } else if (b.type === 'miningCamp' && (resourceType === 'stone' || resourceType === 'gold')) {
        isValidDropoff = true;
      } else if (b.type === 'dock' && resourceType === 'food') {
        isValidDropoff = true;
      }
      
      if (!isValidDropoff) return;
      
      const dist = position.distanceTo(b.position);
      if (dist < closestDist) {
        closestDist = dist;
        closestDropoff = b;
      }
    });
    
    return closestDropoff;
  }

  // -------------------------------------------------------------
  // WIN / LOSE CONDITIONS
  // -------------------------------------------------------------
  onTownCenterDestroyed(playerId) {
    if (playerId === 0) {
      // Player lost
      this.gameOver(false);
    } else {
      // Enemy lost, player wins!
      this.gameOver(true);
    }
  }

  gameOver(isVictory) {
    this.gameActive = false;
    this._clearActiveEffects();

    if (isVictory) {
      this.soundManager.playVictoryTheme();
      this.hud.showGameOverScreen(true);
    } else {
      this.soundManager.playDefeatTheme();
      this.hud.showGameOverScreen(false);
    }
  }

  startWonderCountdown(playerId) {
    this.wonderOwnerId = playerId;
    this.wonderCountdown = 300.0;
    const name = this.players[playerId].civ.toUpperCase();
    if (playerId === 0) {
      this.hud.showNotification("Wonder completed! Victory countdown started: 300 seconds! 🏛️");
    } else {
      this.hud.showNotification(`⚠️ Enemy ${name} completed a Wonder! Defeat imminent in 300 seconds! ⚠️`);
    }
  }

  cancelWonderCountdown(playerId) {
    if (this.wonderOwnerId === playerId) {
      const otherWonders = this.entityManager.buildings.some(b => b.playerId === playerId && b.type === 'wonder' && b.isCompleted && b.hp > 0);
      if (!otherWonders) {
        this.wonderOwnerId = null;
        this.wonderCountdown = null;
        this.hud.showNotification("A Wonder was destroyed! Countdown cancelled.");
      }
    }
  }

  restartGame() {
    this.wonderCountdown = null;
    this.wonderOwnerId = null;
    this.gameActive = false;
    this._clearActiveEffects();
    this.entityManager.clearAll();
    this.gridMap = {};
    
    // Clear canvas child nodes
    const container = document.getElementById('game-canvas-container');
    if (container) {
      container.innerHTML = '';
    }
    
    // Hide game-over overlay BEFORE clearing HUD contents
    if (this.hud) {
      this.hud.hideGameOverScreen();
    }

    // Clear HUD overlay DOM contents
    const hudContainer = document.getElementById('hud');
    if (hudContainer) {
      hudContainer.innerHTML = '';
    }

    // Reset player stats
    const cleanUpgrades = () => ({
      attack: 0, armor: 0, arrow: 0,
      swordsmanUpgrade: 0, archerUpgrade: 0, knightUpgrade: 0, 
      footKnightUpgrade: 0, heavyCavalryUpgrade: 0, horseArcherUpgrade: 0,
      palisadeWallUpgrade: 0, stoneWallUpgrade: 0, watchTowerUpgrade: 0,
      batteringRamUpgrade: 0, mangonelUpgrade: 0, scorpionUpgrade: 0, bombardCannonUpgrade: 0,
      spearmanUpgrade: 0, skirmisherUpgrade: 0, scoutUpgrade: 0, camelUpgrade: 0, cavalryArcherUpgrade: 0,
      sanctity: 0, fervor: 0, redemption: 0, atonement: 0, heresy: 0, faith: 0, illumination: 0, blockPrinting: 0, theocracy: 0,
      galleyUpgrade: 0, fireShipUpgrade: 0,
      loom: 0, wheelbarrow: 0, handCart: 0, townWatch: 0, townPatrol: 0,
      horseCollar: 0, heavyPlow: 0, cropRotation: 0,
      doubleBitAxe: 0, bowSaw: 0, twoManSaw: 0,
      goldMining: 0, goldShaftMining: 0, stoneMining: 0, stoneShaftMining: 0,
      coinage: 0, banking: 0, guilds: 0,
      careening: 0, dryDock: 0, shipwright: 0, gillnets: 0,
      squires: 0, arson: 0,
      thumbRing: 0, ballistics: 0,
      bloodlines: 0, husbandry: 0,
      hoardings: 0, sapper: 0, conscription: 0, spies: 0,
      heatedShot: 0,
      masonry: 0, architecture: 0,
      chemistry: 0, siegeEngineers: 0, murderHoles: 0, arrowslits: 0
    });

    this.players[0] = {
      resources: { wood: 200, food: 150, gold: 100, stone: 50 },
      population: 0,
      populationLimit: 10,
      age: 'dark',
      civ: 'inggris',
      upgrades: cleanUpgrades(),
      kills: 0
    };
    
    this.players[1] = {
      resources: { wood: 1000, food: 1000, gold: 1000, stone: 1000 },
      population: 0,
      populationLimit: 100,
      age: 'dark',
      civ: 'mongol',
      upgrades: cleanUpgrades(),
      kills: 0
    };

    this.players[2] = {
      resources: { wood: 400, food: 400, gold: 200, stone: 100 },
      population: 0,
      populationLimit: 20,
      age: 'dark',
      civ: 'jepang',
      upgrades: cleanUpgrades(),
      kills: 0
    };

    this.players[3] = {
      resources: { wood: 500, food: 500, gold: 500, stone: 500 },
      population: 0,
      populationLimit: 50,
      age: 'dark',
      civ: 'bizantium',
      upgrades: cleanUpgrades(),
      kills: 0
    };
    
    this.gameTime = 0;
    this.fowGrid = null;
    this.controlGroups = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [], 9: [] };
    this.relations = {
      0: { 1: 'enemy', 2: 'ally', 3: 'neutral' },
      1: { 0: 'enemy', 2: 'enemy', 3: 'neutral' },
      2: { 0: 'ally', 1: 'enemy', 3: 'neutral' },
      3: { 0: 'neutral', 1: 'neutral', 2: 'neutral' }
    };
    
    this.selectedEntities = [];

    // Show Lobby Screen again
    const lobbyScreen = document.getElementById('lobby-screen');
    if (lobbyScreen) {
      lobbyScreen.style.display = 'flex';
      // Reset simulated chat
      const log = document.getElementById('lobby-chat-log');
      if (log) log.innerHTML = '<div class="msg sys">System: Re-connected to matchmaking server.</div>';
      this.runSimulatedMatchmaking();
    }
  }

  // -------------------------------------------------------------
  // AGE ADVANCEMENT SYSTEM
  // -------------------------------------------------------------
  upgradePlayerAge(playerId) {
    const player = this.players[playerId];
    const currentAge = player.age;
    let nextAge = null;
    let cost = {};

    const civModifiers = CIVILIZATIONS[player.civ].modifiers;
    const ageUpCostModifier = civModifiers.ageUpCost || 1.0; // Bizantium modifier

    if (currentAge === 'dark') {
      nextAge = 'feudal';
      cost = { food: Math.round(500 * ageUpCostModifier) };
    } else if (currentAge === 'feudal') {
      nextAge = 'castle';
      cost = { food: Math.round(800 * ageUpCostModifier), gold: Math.round(200 * ageUpCostModifier) };
    } else if (currentAge === 'castle') {
      nextAge = 'imperial';
      cost = { food: Math.round(1000 * ageUpCostModifier), gold: Math.round(800 * ageUpCostModifier) };
    }

    if (!nextAge) return;

    // Check building requirements before checking resources or advancing age
    const buildingsList = this.entityManager.buildings.filter(b => b.playerId === playerId);
    if (currentAge === 'dark') {
      const darkAgeBuildingsCount = buildingsList.filter(b => b.isCompleted && b.type !== 'townCenter' && b.type !== 'house').length;
      if (darkAgeBuildingsCount < 2) {
        if (playerId === 0) {
          this.hud.showNotification("⚠️ Requires at least 2 Dark Age buildings (excluding Town Center and Houses) to age up!");
        }
        return;
      }
    } else if (currentAge === 'feudal') {
      const feudalTypes = ['blacksmith', 'market', 'stable', 'archeryRange', 'watchTower', 'stoneWall', 'stoneGate'];
      const feudalCount = buildingsList.filter(b => b.isCompleted && feudalTypes.includes(b.type)).length;
      if (feudalCount < 2) {
        if (playerId === 0) {
          this.hud.showNotification("⚠️ Requires at least 2 Feudal Age buildings (e.g. Blacksmith, Market, Stable, Archery Range) to age up!");
        }
        return;
      }
    } else if (currentAge === 'castle') {
      const castleCount = buildingsList.filter(b => b.isCompleted && b.type === 'castle').length;
      const castleTypes = ['monastery', 'university', 'siegeWorkshop'];
      const castleCountOthers = buildingsList.filter(b => b.isCompleted && castleTypes.includes(b.type)).length;
      if (castleCount < 1 && (castleCount + castleCountOthers) < 2) {
        if (playerId === 0) {
          this.hud.showNotification("⚠️ Requires at least 2 Castle Age buildings (Monastery, University, Siege Workshop) or 1 Castle to age up!");
        }
        return;
      }
    }

    if (!this.hasResources(playerId, cost)) {
      if (playerId === 0) {
        this.hud.showNotification(`Not enough resources! Needs ${cost.food} Food${cost.gold ? ' & ' + cost.gold + ' Gold' : ''} to Age Up.`);
      }
      return;
    }

    // Deduct resources
    this.deductResources(playerId, cost);
    player.age = nextAge;

    // Visual & stat upgrades for all player's buildings
    const buildings = this.entityManager.buildings.filter(b => b.playerId === playerId);
    buildings.forEach(b => {
      const isCompleted = b.isCompleted;
      const progress = b.buildProgress;

      // Clean old mesh
      this.renderer.scene.remove(b.mesh);
      b.mesh.traverse(child => {
        if (child.isMesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });

      // Regenerate with new age parameters
      b.initMesh();

      // HP stats scaling with Age
      if (b.type === 'townCenter') {
        b.maxHp = nextAge === 'feudal' ? 1200 : (nextAge === 'castle' ? 2000 : 3500);
      } else if (b.type === 'barracks') {
        b.maxHp = nextAge === 'feudal' ? 800 : (nextAge === 'castle' ? 1400 : 2500);
      } else if (b.type === 'house') {
        b.maxHp = nextAge === 'feudal' ? 400 : (nextAge === 'castle' ? 700 : 1200);
      } else if (b.type === 'temple') {
        b.maxHp = nextAge === 'feudal' ? 600 : (nextAge === 'castle' ? 1000 : 1800);
      } else if (b.type === 'market') {
        b.maxHp = nextAge === 'feudal' ? 700 : (nextAge === 'castle' ? 1200 : 2000);
      }

      b.isCompleted = isCompleted;
      b.buildProgress = progress;
      if (isCompleted) {
        b.hp = b.maxHp;
      } else {
        b.hp = Math.round((progress / 100) * b.maxHp);
      }
    });

    // Visual & stat upgrades for all player's units
    const units = this.entityManager.units.filter(u => u.playerId === playerId);
    units.forEach(u => {
      // Clean old mesh
      this.renderer.scene.remove(u.mesh);
      u.mesh.traverse(child => {
        if (child.isMesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });

      // Regenerate with new age parameters
      u.initMesh();

      // Scale unit parameters with Age
      if (u.type === 'swordsman') {
        if (nextAge === 'feudal') {
          u.maxHp = 110;
          u.attackPower = 16;
        } else if (nextAge === 'castle') {
          u.maxHp = 140;
          u.attackPower = 22;
        } else { // imperial
          u.maxHp = 180;
          u.attackPower = 32;
        }
        u.hp = u.maxHp;
      } else if (u.type === 'archer') {
        if (nextAge === 'feudal') {
          u.maxHp = 50;
          u.attackPower = 8;
        } else if (nextAge === 'castle') {
          u.maxHp = 65;
          u.attackPower = 11;
          u.attackRange = 6.0;
        } else { // imperial
          u.maxHp = 80;
          u.attackPower = 15;
          u.attackRange = 6.5;
        }
        u.hp = u.maxHp;
      } else if (u.type === 'knight') {
        if (nextAge === 'feudal') {
          u.maxHp = 135;
          u.attackPower = 17;
        } else if (nextAge === 'castle') {
          u.maxHp = 170;
          u.attackPower = 23;
        } else { // imperial
          u.maxHp = 220;
          u.attackPower = 32;
        }
        u.hp = u.maxHp;
      } else if (u.type === 'footKnight') {
        if (nextAge === 'feudal') {
          u.maxHp = 120;
          u.attackPower = 18;
        } else if (nextAge === 'castle') {
          u.maxHp = 160;
          u.attackPower = 25;
        } else { // imperial
          u.maxHp = 210;
          u.attackPower = 35;
        }
        u.hp = u.maxHp;
      } else if (u.type === 'heavyCavalry') {
        if (nextAge === 'feudal') {
          u.maxHp = 200;
          u.attackPower = 21;
        } else if (nextAge === 'castle') {
          u.maxHp = 250;
          u.attackPower = 28;
        } else { // imperial
          u.maxHp = 320;
          u.attackPower = 38;
        }
        u.hp = u.maxHp;
      } else if (u.type === 'horseArcher') {
        if (nextAge === 'feudal') {
          u.maxHp = 95;
          u.attackPower = 9;
          u.attackRange = 5.0;
        } else if (nextAge === 'castle') {
          u.maxHp = 120;
          u.attackPower = 13;
          u.attackRange = 5.5;
        } else { // imperial
          u.maxHp = 150;
          u.attackPower = 17;
          u.attackRange = 6.0;
        }
        u.hp = u.maxHp;
      }
      if (typeof u.recalculateStats === 'function') {
        u.recalculateStats();
      }
    });

    // Play click and alert effects
    this.soundManager.playClickSound('complete');

    if (playerId === 0) {
      this.hud.updateResourcesUI();
      this.hud.updateSelectionUI();
      this.hud.showNotification(`🚀 Advanced to ${nextAge.toUpperCase()} AGE! Unlocked visual building upgrades and enhanced troop stats.`);
      
      const tc = buildings.find(b => b.type === 'townCenter');
      const textPos = tc ? tc.position.clone() : new THREE.Vector3(0, 5, 0);
      this.hud.showFloatingText(textPos, `${nextAge.toUpperCase()} AGE!`, 0x00ffff);
    }
  }

  // -------------------------------------------------------------
  // DYNAMIC ACTION VFX & PROJECTILES
  // All effects are registered in pools and ticked once per frame
  // in _updateActiveEffects() — no separate RAF per effect.
  // -------------------------------------------------------------
  spawnParticles(position, color, count = 6, size = 0.12) {
    const particleGroup = new THREE.Group();
    const geom = new THREE.DodecahedronGeometry(size);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });

    const particles = [];
    for (let i = 0; i < count; i++) {
      const p = new THREE.Mesh(geom, mat);
      p.position.copy(position);
      p.position.y += 0.4 + Math.random() * 0.3;
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.0 + Math.random() * 3.0;
      p.userData.velocity = new THREE.Vector3(
        Math.cos(angle) * speed * 0.5,
        4.0 + Math.random() * 4.0,
        Math.sin(angle) * speed * 0.5
      );
      particleGroup.add(p);
      particles.push(p);
    }

    this.renderer.scene.add(particleGroup);
    this._activeParticleGroups.push({ group: particleGroup, geom, mat, particles, elapsed: 0 });
  }

  spawnArrow(fromPos, toPos) {
    const arrowGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4);
    arrowGeom.rotateX(Math.PI / 2);
    const arrowMat = new THREE.MeshBasicMaterial({ color: 0x966f33 });
    const arrow = new THREE.Mesh(arrowGeom, arrowMat);

    const startPos = fromPos.clone();
    startPos.y += 0.8;
    arrow.position.copy(startPos);

    const target = toPos.clone();
    target.y += 0.5;
    arrow.lookAt(target.x, target.y, target.z);
    this.renderer.scene.add(arrow);

    const speed = 25.0;
    const duration = Math.max(0.05, startPos.distanceTo(target) / speed);
    this._activeProjectiles.push({ mesh: arrow, geom: arrowGeom, mat: arrowMat, startPos, target, duration, arcHeight: 1.5, elapsed: 0, onComplete: null });
  }

  checkSheepTakeover(deltaTime) {
    if (this.sheepTakeoverTimer === undefined) this.sheepTakeoverTimer = 0;
    this.sheepTakeoverTimer += deltaTime;
    if (this.sheepTakeoverTimer < 0.3) return;
    this.sheepTakeoverTimer = 0;

    const neutralSheep = this.entityManager.units.filter(u => u.type === 'sheep' && u.playerId === 3);
    if (neutralSheep.length === 0) return;

    const friendlyUnits = this.entityManager.units.filter(u => (u.playerId === 0 || u.playerId === 2) && u.type !== 'sheep' && u.state !== 'DEAD');
    if (friendlyUnits.length === 0) return;

    neutralSheep.forEach(sheep => {
      for (const friendly of friendlyUnits) {
        if (sheep.position.distanceTo(friendly.position) < 3.0) {
          const newPlayerId = friendly.playerId;
          sheep.playerId = newPlayerId;
          
          this.renderer.scene.remove(sheep.mesh);
          sheep.mesh.traverse(child => {
            if (child.isMesh) {
              child.geometry.dispose();
              if (child.material) child.material.dispose();
            }
          });
          sheep.initMesh();
          
          if (newPlayerId === 0) {
            this.hud.showNotification("You tamed a neutral sheep! 🐑");
            this.soundManager.playClickSound('complete');
          }
          break;
        }
      }
    });
  }

  spawnProjectile(fromPos, toPos, type) {
    let geom, mat;
    if (type === 'boulder') {
      geom = new THREE.SphereGeometry(0.24, 8, 8);
      mat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9 });
    } else if (type === 'bolt') {
      geom = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 4);
      geom.rotateX(Math.PI / 2);
      mat = new THREE.MeshBasicMaterial({ color: 0x92400e });
    } else if (type === 'cannonball') {
      geom = new THREE.SphereGeometry(0.14, 8, 8);
      mat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.8, roughness: 0.2 });
    } else {
      this.spawnArrow(fromPos, toPos);
      return;
    }

    const projectile = new THREE.Mesh(geom, mat);
    const startPos = fromPos.clone();
    startPos.y += 0.8;
    projectile.position.copy(startPos);

    const target = toPos.clone();
    target.y += 0.5;
    projectile.lookAt(target.x, target.y, target.z);
    this.renderer.scene.add(projectile);

    const speed = type === 'cannonball' ? 35.0 : (type === 'bolt' ? 30.0 : 20.0);
    const duration = Math.max(0.05, startPos.distanceTo(target) / speed);
    const arcHeight = type === 'boulder' ? 3.5 : 0.4;

    const onComplete = (hitPos) => {
      let impactColor = 0x888888;
      if (type === 'cannonball') {
        impactColor = 0xff5500;
        this.spawnParticles(hitPos, 0x555555, 8, 0.12);
      }
      this.spawnParticles(hitPos, impactColor, 10, 0.1);
    };

    this._activeProjectiles.push({ mesh: projectile, geom, mat, startPos, target, duration, arcHeight, elapsed: 0, onComplete });
  }

  _updateActiveEffects(dt) {
    const _lerpV = new THREE.Vector3();

    for (let i = this._activeParticleGroups.length - 1; i >= 0; i--) {
      const pg = this._activeParticleGroups[i];
      pg.elapsed += dt;
      if (pg.elapsed >= 0.6) {
        this.renderer.scene.remove(pg.group);
        pg.geom.dispose();
        pg.mat.dispose();
        this._activeParticleGroups.splice(i, 1);
        continue;
      }
      const opacity = 1.0 - pg.elapsed / 0.6;
      const scale = Math.max(0.01, 1.0 - (pg.elapsed / 0.6) * 0.77);
      for (let j = 0; j < pg.particles.length; j++) {
        const p = pg.particles[j];
        p.position.addScaledVector(p.userData.velocity, dt);
        p.userData.velocity.y -= 9.8 * dt;
        p.material.opacity = opacity;
        p.scale.setScalar(scale);
      }
    }

    for (let i = this._activeProjectiles.length - 1; i >= 0; i--) {
      const proj = this._activeProjectiles[i];
      proj.elapsed += dt;
      const t = Math.min(1.0, proj.elapsed / proj.duration);

      _lerpV.lerpVectors(proj.startPos, proj.target, t);
      _lerpV.y += Math.sin(t * Math.PI) * proj.arcHeight;
      proj.mesh.position.copy(_lerpV);

      const nextT = Math.min(1.0, t + 0.05);
      _lerpV.lerpVectors(proj.startPos, proj.target, nextT);
      _lerpV.y += Math.sin(nextT * Math.PI) * proj.arcHeight;
      proj.mesh.lookAt(_lerpV);

      if (t >= 1.0) {
        if (proj.onComplete) proj.onComplete(proj.target);
        this.renderer.scene.remove(proj.mesh);
        proj.geom.dispose();
        proj.mat.dispose();
        this._activeProjectiles.splice(i, 1);
      }
    }
  }

  _clearActiveEffects() {
    for (const pg of this._activeParticleGroups) {
      this.renderer.scene.remove(pg.group);
      pg.geom.dispose();
      pg.mat.dispose();
    }
    this._activeParticleGroups = [];
    for (const proj of this._activeProjectiles) {
      this.renderer.scene.remove(proj.mesh);
      proj.geom.dispose();
      proj.mat.dispose();
    }
    this._activeProjectiles = [];
  }
}
