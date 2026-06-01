import * as THREE from 'three';
import { CIVILIZATIONS } from '../game/ModelFactory';
import { SVGIcons } from './SVGIcons';

export class HUD {
  constructor(gameManager) {
    this.gameManager = gameManager;
    
    this.notifications = [];
    this.floatingTexts = [];
    
    this.initDOM();
    this.setupListeners();
    
    // Start minimap rendering loop
    this.lastMinimapUpdate = 0;
    this.updateLoop();
  }

  initDOM() {
    // Create HUD Wrapper
    const hudContainer = document.getElementById('hud');
    hudContainer.className = 'glass-hud-container';
    
    hudContainer.innerHTML = `
      <!-- TOP STATUS BAR -->
      <div class="hud-top-bar ui-element">
        <div class="hud-logo" style="display: flex; align-items: center; gap: 8px;">EMPIRE BUILDER 3D</div>
        
        <div class="resource-group">
          <div class="resource-item" title="Food (needed to train units)">
            <span class="icon">${SVGIcons.food}</span>
            <span id="res-food" class="value">150</span>
          </div>
          <div class="resource-item" title="Wood (needed for houses and barracks)">
            <span class="icon">${SVGIcons.wood}</span>
            <span id="res-wood" class="value">200</span>
          </div>
          <div class="resource-item" title="Gold (needed to train soldiers)">
            <span class="icon">${SVGIcons.gold}</span>
            <span id="res-gold" class="value">100</span>
          </div>
          <div class="resource-item" title="Stone (needed for barracks)">
            <span class="icon">${SVGIcons.stone}</span>
            <span id="res-stone" class="value">50</span>
          </div>
          <div class="resource-item" title="Population (cap increased by building houses)">
            <span class="icon">${SVGIcons.population}</span>
            <span id="res-pop" class="value">0/10</span>
          </div>
        </div>
        
        <!-- CENTER: AGE & CIV PANEL -->
        <div class="hud-age-civ" id="hud-age-civ">
          <span class="age-civ-emblem" id="age-civ-emblem">🏰</span>
          <div class="age-civ-text">
            <span class="age-civ-title" id="age-civ-title">Zaman Gelap</span>
            <span class="age-civ-subtitle" id="age-civ-subtitle">Inggris</span>
          </div>
        </div>
        
        <!-- RIGHT: TIMER, SCORE & CONTROLS -->
        <div class="top-controls-wrapper">
          <div class="timer-score-group">
            <div class="timer-item" id="timer-display" title="Game Time">⏳ 00:00</div>
            <div class="score-item" id="score-display" title="Player Score">⭐ Score: 0</div>
          </div>
          <div class="top-controls">
            <button id="btn-diplomacy" class="hud-btn small-btn" style="background:#5b21b6; border-color:#7c3aed;" title="Diplomacy & Tributes">🤝 Diplomasi</button>
            <button id="btn-mute" class="hud-btn small-btn" title="Toggle Sound">🔊 Sound</button>
            <button id="btn-restart" class="hud-btn small-btn warning-btn">Restart</button>
          </div>
        </div>
      </div>

      <!-- FLOATING NOTIFICATION BOX -->
      <div id="notification-box"></div>

      <!-- DIPLOMACY MODAL OVERLAY (Initially Hidden) -->
      <div id="diplomacy-modal" class="diplomacy-overlay-modal" style="display: none;">
        <div class="diplomacy-container glassmorphism">
          <div class="diplomacy-header">
            <div class="diplomacy-title">DIPLOMASI & UPETI</div>
            <button class="diplomacy-close-btn" id="btn-diplomacy-close">&times;</button>
          </div>
          <div class="diplomacy-grid">
            <!-- Row for Enemy -->
            <div class="diplomacy-row">
              <div class="diplomacy-faction">
                <span class="diplomacy-color-dot" style="background: #ff4f4f;"></span>
                <span>Lord Kahn</span>
              </div>
              <div class="diplomacy-stance-group">
                <button class="diplomacy-stance-btn active stance-enemy" id="btn-dip-enemy-enemy">Musuh</button>
                <button class="diplomacy-stance-btn" id="btn-dip-enemy-neutral">Netral</button>
                <button class="diplomacy-stance-btn" id="btn-dip-enemy-ally">Sekutu</button>
              </div>
              <div class="diplomacy-tribute-group">
                <button class="diplomacy-tribute-btn" id="btn-trib-enemy-food">🌾 +100</button>
                <button class="diplomacy-tribute-btn" id="btn-trib-enemy-wood">🪵 +100</button>
                <button class="diplomacy-tribute-btn" id="btn-trib-enemy-gold">🪙 +100</button>
                <button class="diplomacy-tribute-btn" id="btn-trib-enemy-stone">🪨 +100</button>
              </div>
            </div>
            
            <!-- Row for Ally -->
            <div class="diplomacy-row">
              <div class="diplomacy-faction">
                <span class="diplomacy-color-dot" style="background: #81c784;"></span>
                <span>Gajah Mada</span>
              </div>
              <div class="diplomacy-stance-group">
                <button class="diplomacy-stance-btn" id="btn-dip-ally-enemy">Musuh</button>
                <button class="diplomacy-stance-btn" id="btn-dip-ally-neutral">Netral</button>
                <button class="diplomacy-stance-btn active stance-ally" id="btn-dip-ally-ally">Sekutu</button>
              </div>
              <div class="diplomacy-tribute-group">
                <button class="diplomacy-tribute-btn" id="btn-trib-ally-food">🌾 +100</button>
                <button class="diplomacy-tribute-btn" id="btn-trib-ally-wood">🪵 +100</button>
                <button class="diplomacy-tribute-btn" id="btn-trib-ally-gold">🪙 +100</button>
                <button class="diplomacy-tribute-btn" id="btn-trib-ally-stone">🪨 +100</button>
              </div>
            </div>

            <!-- Row for Neutral -->
            <div class="diplomacy-row">
              <div class="diplomacy-faction">
                <span class="diplomacy-color-dot" style="background: #94a3b8;"></span>
                <span>Nomad Grey</span>
              </div>
              <div class="diplomacy-stance-group">
                <button class="diplomacy-stance-btn" id="btn-dip-neut-enemy">Musuh</button>
                <button class="diplomacy-stance-btn active stance-neutral" id="btn-dip-neut-neutral">Netral</button>
                <button class="diplomacy-stance-btn" id="btn-dip-neut-ally">Sekutu</button>
              </div>
              <div class="diplomacy-tribute-group">
                <button class="diplomacy-tribute-btn" id="btn-trib-neut-food">🌾 +100</button>
                <button class="diplomacy-tribute-btn" id="btn-trib-neut-wood">🪵 +100</button>
                <button class="diplomacy-tribute-btn" id="btn-trib-neut-gold">🪙 +100</button>
                <button class="diplomacy-tribute-btn" id="btn-trib-neut-stone">🪨 +100</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- IN-GAME CHAT OVERLAY -->
      <div class="game-chat-wrapper">
        <div class="chat-messages-display" id="chat-messages-display">
          <div class="chat-msg sys">Sistem: Battle has begun! Ketik pesan atau cheat ("beli kayu", "serang", dll.)</div>
        </div>
        <div class="chat-input-wrapper">
          <input type="text" class="chat-input-field" id="chat-input-field" placeholder="Ketik pesan / cheat..." />
          <button class="chat-send-btn" id="chat-send-btn">Kirim</button>
        </div>
      </div>

      <!-- VOICE CHAT PANEL -->
      <div class="voice-chat-panel">
        <div class="voice-participant" id="vp-player">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#4fa3ff; margin-right:4px;"></span>
          <span>Anda</span>
          <div class="voice-wave"><span></span><span></span><span></span></div>
        </div>
        <div class="voice-participant" id="vp-ally">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#81c784; margin-right:4px;"></span>
          <span>GajahMada_35</span>
          <div class="voice-wave"><span></span><span></span><span></span></div>
        </div>
        <div class="voice-participant" id="vp-enemy">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#ff4f4f; margin-right:4px;"></span>
          <span>Lord_Kahn</span>
          <div class="voice-wave"><span></span><span></span><span></span></div>
        </div>
      </div>

      <!-- MAIN BOTTOM PANEL -->
      <div class="hud-bottom-panel ui-element">
        <!-- BOTTOM LEFT: UNIT INFO PANEL -->
        <div class="unit-info-panel ui-element" id="unit-info-panel">
          <div class="empty-selection-msg">No selection.<br><small>Click or drag to select.</small></div>
        </div>

        <!-- BOTTOM CENTER: COMMAND & QUEUE PANEL -->
        <div class="command-panel ui-element" id="command-panel">
          <div class="empty-selection-msg" style="font-size:0.75rem;">Commands and training options will appear here.</div>
        </div>

        <!-- BOTTOM RIGHT: MINIMAP & HELP -->
        <div class="minimap-container ui-element" style="flex-shrink: 0;">
          <canvas id="minimap-canvas" width="130" height="130"></canvas>
          <div class="camera-info">Drag: Pan Map | WASD: Pan | Scroll: Zoom</div>
        </div>
      </div>
      
      <!-- GAME OVER SCREEN OVERLAY -->
      <div id="gameover-overlay" class="gameover-screen" style="display: none;">
        <div class="gameover-box glassmorphism">
          <h1 id="gameover-title">VICTORY!</h1>
          <p id="gameover-desc">You have successfully destroyed the enemy base.</p>
          <button id="btn-play-again" class="hud-btn large-btn">Play Again</button>
        </div>
      </div>
    `;

    this.minimapCanvas = document.getElementById('minimap-canvas');
    this.minimapCtx = this.minimapCanvas.getContext('2d');
  }

  setupListeners() {
    // Mute button
    document.getElementById('btn-mute').addEventListener('click', (e) => {
      const isSoundOn = this.gameManager.soundManager.toggleSound();
      e.target.textContent = isSoundOn ? '🔊 Sound' : '🔇 Mute';
      e.target.classList.toggle('muted', !isSoundOn);
    });

    // Restart button
    document.getElementById('btn-restart').addEventListener('click', () => {
      if (confirm("Restart game? Progress will be lost.")) {
        this.gameManager.restartGame();
      }
    });

    // Play again victory/defeat button
    document.getElementById('btn-play-again').addEventListener('click', () => {
      this.gameManager.restartGame();
    });

    // In-game Chat listeners
    const chatInput = document.getElementById('chat-input-field');
    const sendBtn = document.getElementById('chat-send-btn');
    
    const sendChatMessage = () => {
      const text = chatInput.value.trim();
      if (!text) return;
      
      chatInput.value = '';
      
      // Add message to display
      this.addChatMessage('player', 'Anda', text);
      
      // Dispatch commands/trades to AI
      if (this.gameManager.allyAI) {
        this.gameManager.allyAI.handlePlayerCommand(text);
      }
      if (this.gameManager.neutralAI) {
        this.gameManager.neutralAI.handlePlayerTrade(text);
      }
    };
    
    sendBtn.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });

    // Diplomacy Modal open/close
    const dipModal = document.getElementById('diplomacy-modal');
    document.getElementById('btn-diplomacy').addEventListener('click', () => {
      this.updateDiplomacyModalUI();
      dipModal.style.display = 'flex';
      this.gameManager.soundManager.playClickSound('select');
    });
    document.getElementById('btn-diplomacy-close').addEventListener('click', () => {
      dipModal.style.display = 'none';
      this.gameManager.soundManager.playClickSound('select');
    });

    // Bind relation change buttons
    const bindStanceBtn = (btnId, targetId, stance) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener('click', () => {
          this.gameManager.changeRelation(0, targetId, stance);
          this.updateDiplomacyModalUI();
          this.gameManager.soundManager.playClickSound('select');
        });
      }
    };
    // Enemy (1)
    bindStanceBtn('btn-dip-enemy-enemy', 1, 'enemy');
    bindStanceBtn('btn-dip-enemy-neutral', 1, 'neutral');
    bindStanceBtn('btn-dip-enemy-ally', 1, 'ally');
    // Ally (2)
    bindStanceBtn('btn-dip-ally-enemy', 2, 'enemy');
    bindStanceBtn('btn-dip-ally-neutral', 2, 'neutral');
    bindStanceBtn('btn-dip-ally-ally', 2, 'ally');
    // Neutral (3)
    bindStanceBtn('btn-dip-neut-enemy', 3, 'enemy');
    bindStanceBtn('btn-dip-neut-neutral', 3, 'neutral');
    bindStanceBtn('btn-dip-neut-ally', 3, 'ally');

    // Bind tribute buttons
    const bindTributeBtn = (btnId, targetId, resType) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener('click', () => {
          this.gameManager.sendTribute(targetId, resType, 100);
          this.gameManager.soundManager.playClickSound('complete');
        });
      }
    };
    // Enemy
    bindTributeBtn('btn-trib-enemy-food', 1, 'food');
    bindTributeBtn('btn-trib-enemy-wood', 1, 'wood');
    bindTributeBtn('btn-trib-enemy-gold', 1, 'gold');
    bindTributeBtn('btn-trib-enemy-stone', 1, 'stone');
    // Ally
    bindTributeBtn('btn-trib-ally-food', 2, 'food');
    bindTributeBtn('btn-trib-ally-wood', 2, 'wood');
    bindTributeBtn('btn-trib-ally-gold', 2, 'gold');
    bindTributeBtn('btn-trib-ally-stone', 2, 'stone');
    // Neutral
    bindTributeBtn('btn-trib-neut-food', 3, 'food');
    bindTributeBtn('btn-trib-neut-wood', 3, 'wood');
    bindTributeBtn('btn-trib-neut-gold', 3, 'gold');
    bindTributeBtn('btn-trib-neut-stone', 3, 'stone');

    // Minimap panning controls
    this.isDraggingMinimap = false;
    this.minimapCanvas.addEventListener('mousedown', (e) => {
      this.isDraggingMinimap = true;
      this.panCameraFromMinimap(e);
    });
    window.addEventListener('mousemove', (e) => {
      if (this.isDraggingMinimap) {
        this.panCameraFromMinimap(e);
      }
    });
    window.addEventListener('mouseup', () => {
      this.isDraggingMinimap = false;
    });
  }

  panCameraFromMinimap(e) {
    if (!this.gameManager.terrain) return;
    const rect = this.minimapCanvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Clamp coordinate bounds
    const mx = Math.max(0, Math.min(rect.width, clickX));
    const my = Math.max(0, Math.min(rect.height, clickY));
    
    const mapSize = this.gameManager.terrain.mapSize;
    const size = rect.width || 130;
    
    const tx = (mx / size) * mapSize - mapSize / 2;
    const tz = (my / size) * mapSize - mapSize / 2;
    
    this.gameManager.renderer.cameraTarget.set(tx, 0, tz);
  }

  updateDiplomacyModalUI() {
    const rels = this.gameManager.relations[0];
    if (!rels) return;

    const toggleClass = (btnId, active) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.classList.toggle('active', active);
        if (active) {
          const typeClass = btnId.endsWith('enemy') ? 'stance-enemy' : btnId.endsWith('neutral') ? 'stance-neutral' : 'stance-ally';
          btn.classList.add(typeClass);
        } else {
          btn.classList.remove('stance-enemy', 'stance-neutral', 'stance-ally');
        }
      }
    };

    // Enemy Stances
    toggleClass('btn-dip-enemy-enemy', rels[1] === 'enemy');
    toggleClass('btn-dip-enemy-neutral', rels[1] === 'neutral');
    toggleClass('btn-dip-enemy-ally', rels[1] === 'ally');

    // Ally Stances
    toggleClass('btn-dip-ally-enemy', rels[2] === 'enemy');
    toggleClass('btn-dip-ally-neutral', rels[2] === 'neutral');
    toggleClass('btn-dip-ally-ally', rels[2] === 'ally');

    // Neutral Stances
    toggleClass('btn-dip-neut-enemy', rels[3] === 'enemy');
    toggleClass('btn-dip-neut-neutral', rels[3] === 'neutral');
    toggleClass('btn-dip-neut-ally', rels[3] === 'ally');
  }

  addChatMessage(senderType, senderName, text) {
    const display = document.getElementById('chat-messages-display');
    if (!display) return;
    
    const msg = document.createElement('div');
    msg.className = `chat-msg ${senderType}`;
    
    if (senderType === 'sys') {
      msg.textContent = `${senderName}: ${text}`;
    } else {
      msg.innerHTML = `<strong>${senderName}</strong>: ${text}`;
    }
    
    display.appendChild(msg);
    // Scroll to bottom
    display.scrollTop = display.scrollHeight;
    
    // Trigger visual voice indicator bounce for the sender
    this.triggerVoicePulse(senderType);
  }

  triggerVoicePulse(senderType) {
    let elementId = '';
    if (senderType === 'player') elementId = 'vp-player';
    else if (senderType === 'ally') elementId = 'vp-ally';
    else if (senderType === 'enemy') elementId = 'vp-enemy';
    
    if (!elementId) return;
    
    const vp = document.getElementById(elementId);
    if (vp) {
      vp.classList.add('active-speaker');
      
      // Remove it after 2 seconds of inactivity
      if (vp.voiceTimeout) clearTimeout(vp.voiceTimeout);
      vp.voiceTimeout = setTimeout(() => {
        vp.classList.remove('active-speaker');
      }, 2000);
    }
  }

  // -------------------------------------------------------------
  // HUD UI STATE UPDATES
  // -------------------------------------------------------------
  updateResourcesUI() {
    const playerState = this.gameManager.players[0];
    document.getElementById('res-food').textContent = playerState.resources.food;
    document.getElementById('res-wood').textContent = playerState.resources.wood;
    document.getElementById('res-gold').textContent = playerState.resources.gold;
    document.getElementById('res-stone').textContent = playerState.resources.stone;
    document.getElementById('res-pop').textContent = `${playerState.population}/${playerState.populationLimit}`;
  }

  updateSelectionUI() {
    const infoPanel = document.getElementById('unit-info-panel');
    const commandPanel = document.getElementById('command-panel');
    if (!infoPanel || !commandPanel) return;

    const selected = this.gameManager.selectedEntities;

    if (selected.length === 0) {
      infoPanel.innerHTML = `
        <div class="empty-selection-msg">No selection.<br><small>Click or drag to select.</small></div>
      `;
      commandPanel.innerHTML = `
        <div class="empty-selection-msg" style="font-size:0.75rem;">Commands and training options will appear here.</div>
      `;
      return;
    }

    if (selected.length === 1) {
      const entity = selected[0];
      const ownerName = entity.playerId === 0 ? 'Player' : entity.playerId === 2 ? 'Ally' : entity.playerId === 3 ? 'Neutral' : 'Enemy';
      const displayName = entity.getDisplayName ? entity.getDisplayName() : entity.type.charAt(0).toUpperCase() + entity.type.slice(1);
      const avatar = SVGIcons.getIcon(entity.type) || SVGIcons.getIcon('house');

      // 1. Populate Left Column: Unit Info Panel
      let infoHtml = `
        <div class="selection-card">
          <div class="entity-info" style="display: flex; align-items: center; gap: 10px;">
            <span class="entity-avatar">${avatar}</span>
            <div>
              <div class="entity-name" style="font-weight:bold; font-size:0.9rem;">${displayName}</div>
              <div class="entity-owner" style="font-size:0.7rem; color:#aaa;">Owner: ${ownerName}</div>
              <div class="entity-hp" style="font-size:0.8rem; margin-top:2px;">HP: ${entity.hp}/${entity.maxHp}</div>
      `;

      if (entity.inventory && entity.inventory.amount !== undefined) {
        infoHtml += `<div class="entity-cargo" style="font-size:0.75rem;">Carrying: ${entity.inventory.amount}/${entity.inventory.max} ${entity.inventory.type ? entity.inventory.type.toUpperCase() : 'None'}</div>`;
      }
      if (entity.amount !== undefined && ['wood', 'gold', 'stone', 'sheep', 'fish'].includes(entity.type)) {
        infoHtml += `<div class="entity-cargo" style="font-size:0.75rem;">Remaining: ${entity.amount}/${entity.maxAmount}</div>`;
      }
      if (entity.garrisonedUnits && entity.garrisonedUnits.length !== undefined) {
        infoHtml += `<div class="entity-cargo" style="font-size:0.75rem;">Garrisoned: ${entity.garrisonedUnits.length} / 100</div>`;
      }

      if (entity.attackPower !== undefined) {
        infoHtml += `
          <div class="entity-stats-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:4px; font-size:0.75rem; margin-top:4px; opacity:0.9;">
            <div>⚔️ Attack: ${entity.attackPower}</div>
            <div>🛡️ Armor: ${entity.armor}</div>
            <div>🎯 Range: ${entity.attackRange}</div>
            <div>⚡ Speed: ${(entity.speed || 0).toFixed(1)}</div>
          </div>
        `;
      } else if (entity.type === 'siegeTower') {
        infoHtml += `
          <div class="entity-stats-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:4px; font-size:0.75rem; margin-top:4px; opacity:0.9;">
            <div>🛡️ Armor: ${entity.armor || 0}</div>
            <div>⚡ Speed: ${(entity.speed || 0).toFixed(1)}</div>
            <div style="grid-column: span 2; color:#ffd700;">✨ Aura: +3 Armor to nearby infantry</div>
          </div>
        `;
      } else if (entity.type === 'watchTower' && entity.isCompleted) {
        infoHtml += `
          <div class="entity-stats-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:4px; font-size:0.75rem; margin-top:4px; opacity:0.9;">
            <div>⚔️ Attack: 10</div>
            <div>🎯 Range: 18</div>
          </div>
        `;
      }

      infoHtml += `
            </div>
          </div>
        </div>
      `;
      infoPanel.innerHTML = infoHtml;

      // 2. Populate Middle Column: Command Panel
      if (entity.playerId !== 0) {
        commandPanel.innerHTML = `
          <div class="empty-selection-msg" style="font-size:0.75rem;">Commands and queue information are only available for your own units and buildings.</div>
        `;
        return;
      }

      // If owned by Player
      let isBuilding = ['townCenter', 'barracks', 'blacksmith', 'castle', 'university', 'siegeWorkshop', 'temple', 'market', 'dock', 'farm', 'stable', 'archeryRange', 'monastery', 'bombardTower'].includes(entity.type);

      if (isBuilding) {
        const garrisonedCount = entity.garrisonedUnits ? entity.garrisonedUnits.length : 0;
        let queueHtml = '';
        let queueCardsHtml = '';
        if (entity.queue && entity.queue.length !== undefined) {
          if (entity.queue.length > 0) {
            queueHtml = `
              <div class="queue-list" style="font-size: 0.75rem; margin-bottom: 2px;">
                Active: ${entity.queue.length} in queue
                <div class="bar-outer" style="width:100%; height:6px; background:rgba(0,0,0,0.4); border-radius:3px; overflow:hidden; margin-top:2px;">
                  <div id="queue-bar" class="bar-inner" style="width:0%; height:100%; background:#4fa3ff; border-radius:3px;"></div>
                </div>
              </div>
            `;
            queueCardsHtml = `
              <div class="queue-items-row">
                ${entity.queue.map((item, idx) => {
                  let type = item;
                  let activeDot = idx === 0 ? '<div class="queue-active-indicator"></div>' : '';
                  if (item.startsWith('upgrade_')) {
                    type = item.replace('upgrade_', '');
                  }
                  const iconKey = SVGIcons[type] ? type : type.toLowerCase();
                  const qIcon = SVGIcons.getIcon(iconKey) || SVGIcons.getIcon('house');
                  return `
                    <div class="queue-item-card" data-idx="${idx}" title="Click to cancel queue item and refund resources">
                      ${qIcon}
                      ${activeDot}
                    </div>
                  `;
                }).join('')}
              </div>
            `;
          } else {
            queueHtml = `<div class="queue-list" style="font-size:0.7rem; opacity:0.8;">No training active.</div>`;
          }
        }

        // Render Action Grid for buildings
        let actionButtonsHtml = '';
        let qS = 0, qA = 0, qK = 0, qFk = 0, qHc = 0, qHa = 0, qSp = 0, qSc = 0, qC = 0, qCa = 0, qSk = 0, qG = 0, qF = 0;
        let qSan = 0, qFer = 0, qRed = 0, qAto = 0, qIll = 0, qBlo = 0, qThe = 0;
        let nextSLvl = 0, nextALvl = 0, nextKLvl = 0, nextFkLvl = 0, nextHcLvl = 0, nextHaLvl = 0, nextSpLvl = 0, nextScLvl = 0, nextCLvl = 0, nextCaLvl = 0, nextSkLvl = 0, nextGLvl = 0, nextFLvl = 0;
        let nextSan = 0, nextFer = 0, nextRed = 0, nextAto = 0, nextIll = 0, nextBlo = 0, nextThe = 0;
        let nextAttackLvl = 0, nextArmorLvl = 0, nextArrowLvl = 0;
        let nextPalisadeLvl = 0, nextStoneLvl = 0, nextTowerLvl = 0;
        let nextRamLvl = 0, nextMangonelLvl = 0, nextScorpionLvl = 0, nextCannonLvl = 0;

        if (entity.type === 'townCenter') {
          const playerState = this.gameManager.players[0];
          const currentAge = playerState.age;
          let ageUpBtnHtml = "";
          if (currentAge === 'dark') {
            ageUpBtnHtml = `<button class="action-btn" id="btn-age-up" title="Advance to Feudal Age (500 Food)">Zaman Feodal (500F)</button>`;
          } else if (currentAge === 'feudal') {
            ageUpBtnHtml = `<button class="action-btn" id="btn-age-up" title="Advance to Castle Age (800 Food, 200 Gold)">Zaman Kastil (800F, 200G)</button>`;
          } else if (currentAge === 'castle') {
            ageUpBtnHtml = `<button class="action-btn" id="btn-age-up" title="Advance to Imperial Age (1000 Food, 800 Gold)">Zaman Imperial (1000F, 800G)</button>`;
          }

          actionButtonsHtml = `
            <button class="action-btn" id="btn-train-villager" title="Train Villager (50 Food)">${SVGIcons.villager} Train Villager (50F)</button>
            ${ageUpBtnHtml}
          `;
        } else if (entity.type === 'barracks') {
          const player = this.gameManager.players[0];
          const sLvl = player.upgrades.swordsmanUpgrade || 0;
          const spLvl = player.upgrades.spearmanUpgrade || 0;
          const fkLvl = player.upgrades.footKnightUpgrade || 0;
          const hcLvl = player.upgrades.heavyCavalryUpgrade || 0;

          for (const item of entity.queue) {
            if (item === 'upgrade_swordsmanUpgrade') qS++;
            if (item === 'upgrade_spearmanUpgrade') qSp++;
            if (item === 'upgrade_footKnightUpgrade') qFk++;
            if (item === 'upgrade_heavyCavalryUpgrade') qHc++;
          }

          nextSLvl = sLvl + qS;
          nextSpLvl = spLvl + qSp;
          nextFkLvl = fkLvl + qFk;
          nextHcLvl = hcLvl + qHc;

          const sCost = nextSLvl < 2 ? this.gameManager.getUpgradeCost('swordsmanUpgrade', nextSLvl) : null;
          const spCost = nextSpLvl < 2 ? this.gameManager.getUpgradeCost('spearmanUpgrade', nextSpLvl) : null;
          const fkCost = nextFkLvl < 2 ? this.gameManager.getUpgradeCost('footKnightUpgrade', nextFkLvl) : null;
          const hcCost = nextHcLvl < 2 ? this.gameManager.getUpgradeCost('heavyCavalryUpgrade', nextHcLvl) : null;

          const sCostText = sCost ? `(${sCost.food || 0}F, ${sCost.gold || 0}G)` : 'MAX';
          const spCostText = spCost ? `(${spCost.food || 0}F, ${spCost.gold || 0}G)` : 'MAX';
          const fkCostText = fkCost ? `(${fkCost.food || 0}F, ${fkCost.gold || 0}G)` : 'MAX';
          const hcCostText = hcCost ? `(${hcCost.food || 0}F, ${hcCost.gold || 0}G)` : 'MAX';

          const isSDisabled = nextSLvl >= 2 ? 'disabled' : '';
          const isSpDisabled = nextSpLvl >= 2 ? 'disabled' : '';
          const isFkDisabled = nextFkLvl >= 2 ? 'disabled' : '';
          const isHcDisabled = nextHcLvl >= 2 ? 'disabled' : '';

          const sName = sLvl === 0 ? 'Men-at-Arms' : 'Longswordsman';
          const spName = spLvl === 0 ? 'Pikeman' : 'Halberdier';
          const fkName = fkLvl === 0 ? 'Champion Foot Knight' : 'Elite Foot Knight';
          const hcName = hcLvl === 0 ? 'Cataphract' : 'Elite Heavy Cav';

          actionButtonsHtml = `
            <button class="action-btn" id="btn-train-swordsman" title="Train Swordsman (60 Food, 20 Gold)">${SVGIcons.swordsman} Swordsman (60F, 20G)</button>
            <button class="action-btn" id="btn-train-spearman" title="Train Spearman (35 Food, 25 Wood)">${SVGIcons.spearman} Spearman (35F, 25W)</button>
            <button class="action-btn" id="btn-train-footknight" title="Train Foot Knight (75 Food, 35 Gold)">${SVGIcons.footKnight} Foot Knight (75F, 35G)</button>
            <button class="action-btn" id="btn-train-heavycavalry" title="Train Heavy Cavalry (90 Food, 60 Gold)">${SVGIcons.heavyCavalry} Heavy Cav (90F, 60G)</button>
            
            <button class="action-btn ${isSDisabled}" id="btn-upgrade-swordsman" ${isSDisabled}>Upgrade to ${sName} ${sCostText}</button>
            <button class="action-btn ${isSpDisabled}" id="btn-upgrade-spearman" ${isSpDisabled}>Upgrade to ${spName} ${spCostText}</button>
            <button class="action-btn ${isFkDisabled}" id="btn-upgrade-footknight" ${isFkDisabled}>Upgrade to ${fkName} ${fkCostText}</button>
            <button class="action-btn ${isHcDisabled}" id="btn-upgrade-heavycavalry" ${isHcDisabled}>Upgrade to ${hcName} ${hcCostText}</button>
          `;
        } else if (entity.type === 'stable') {
          const player = this.gameManager.players[0];
          const scLvl = player.upgrades.scoutUpgrade || 0;
          const kLvl = player.upgrades.knightUpgrade || 0;
          const cLvl = player.upgrades.camelUpgrade || 0;

          for (const item of entity.queue) {
            if (item === 'upgrade_scoutUpgrade') qSc++;
            if (item === 'upgrade_knightUpgrade') qK++;
            if (item === 'upgrade_camelUpgrade') qC++;
          }

          nextScLvl = scLvl + qSc;
          nextKLvl = kLvl + qK;
          nextCLvl = cLvl + qC;

          const scCost = nextScLvl < 2 ? this.gameManager.getUpgradeCost('scoutUpgrade', nextScLvl) : null;
          const kCost = nextKLvl < 2 ? this.gameManager.getUpgradeCost('knightUpgrade', nextKLvl) : null;
          const cCost = nextCLvl < 2 ? this.gameManager.getUpgradeCost('camelUpgrade', nextCLvl) : null;

          const scCostText = scCost ? `(${scCost.food || 0}F, ${scCost.gold || 0}G)` : 'MAX';
          const kCostText = kCost ? `(${kCost.food || 0}F, ${kCost.gold || 0}G)` : 'MAX';
          const cCostText = cCost ? `(${cCost.food || 0}F, ${cCost.gold || 0}G)` : 'MAX';

          const isScDisabled = nextScLvl >= 2 ? 'disabled' : '';
          const isKDisabled = nextKLvl >= 2 ? 'disabled' : '';
          const isCDisabled = nextCLvl >= 2 ? 'disabled' : '';

          const scName = scLvl === 0 ? 'Light Cavalry' : 'Hussar';
          const kName = kLvl === 0 ? 'Cavalier' : 'Paladin';
          const cName = cLvl === 0 ? 'Heavy Camel' : 'Imperial Camel';

          actionButtonsHtml = `
            <button class="action-btn" id="btn-train-scoutcavalry" title="Train Scout Cavalry (80 Food)">${SVGIcons.scoutCavalry} Scout Cav (80F)</button>
            <button class="action-btn" id="btn-train-knight" title="Train Knight (70 Food, 40 Gold)">${SVGIcons.knight} Knight (70F, 40G)</button>
            <button class="action-btn" id="btn-train-camelrider" title="Train Camel Rider (55 Food, 60 Gold)">${SVGIcons.camelRider} Camel Rider (55F, 60G)</button>
            
            <button class="action-btn ${isScDisabled}" id="btn-upgrade-scout" ${isScDisabled}>Upgrade to ${scName} ${scCostText}</button>
            <button class="action-btn ${isKDisabled}" id="btn-upgrade-knight" ${isKDisabled}>Upgrade to ${kName} ${kCostText}</button>
            <button class="action-btn ${isCDisabled}" id="btn-upgrade-camel" ${isCDisabled}>Upgrade to ${cName} ${cCostText}</button>
          `;
        } else if (entity.type === 'archeryRange') {
          const player = this.gameManager.players[0];
          const aLvl = player.upgrades.archerUpgrade || 0;
          const skLvl = player.upgrades.skirmisherUpgrade || 0;
          const caLvl = player.upgrades.cavalryArcherUpgrade || 0;

          for (const item of entity.queue) {
            if (item === 'upgrade_archerUpgrade') qA++;
            if (item === 'upgrade_skirmisherUpgrade') qSk++;
            if (item === 'upgrade_cavalryArcherUpgrade') qCa++;
          }

          nextALvl = aLvl + qA;
          nextSkLvl = skLvl + qSk;
          nextCaLvl = caLvl + qCa;

          const aCost = nextALvl < 2 ? this.gameManager.getUpgradeCost('archerUpgrade', nextALvl) : null;
          const skCost = nextSkLvl < 1 ? this.gameManager.getUpgradeCost('skirmisherUpgrade', nextSkLvl) : null;
          const caCost = nextCaLvl < 1 ? this.gameManager.getUpgradeCost('cavalryArcherUpgrade', nextCaLvl) : null;

          const aCostText = aCost ? `(${aCost.food || 0}F, ${aCost.wood || 0}W)` : 'MAX';
          const skCostText = skCost ? `(${skCost.food || 0}F, ${skCost.wood || 0}W)` : 'MAX';
          const caCostText = caCost ? `(${caCost.food || 0}F, ${caCost.gold || 0}G)` : 'MAX';

          const isADisabled = nextALvl >= 2 ? 'disabled' : '';
          const isSkDisabled = nextSkLvl >= 1 ? 'disabled' : '';
          const isCaDisabled = nextCaLvl >= 1 ? 'disabled' : '';

          const aName = aLvl === 0 ? 'Crossbowman' : 'Arbalest';
          const skName = 'Elite Skirmisher';
          const caName = 'Heavy Cavalry Archer';

          actionButtonsHtml = `
            <button class="action-btn" id="btn-train-archer" title="Train Archer (40 Food, 25 Wood)">${SVGIcons.archer} Archer (40F, 25W)</button>
            <button class="action-btn" id="btn-train-skirmisher" title="Train Skirmisher (25 Food, 35 Wood)">${SVGIcons.skirmisher} Skirmisher (25F, 35W)</button>
            <button class="action-btn" id="btn-train-cavalryarcher" title="Train Cavalry Archer (40 Food, 60 Gold)">${SVGIcons.cavalryArcher} Cavalry Archer (40F, 60G)</button>
            
            <button class="action-btn ${isADisabled}" id="btn-upgrade-archer" ${isADisabled}>Upgrade to ${aName} ${aCostText}</button>
            <button class="action-btn ${isSkDisabled}" id="btn-upgrade-skirmisher" ${isSkDisabled}>Upgrade to ${skName} ${skCostText}</button>
            <button class="action-btn ${isCaDisabled}" id="btn-upgrade-cavalryarcher" ${isCaDisabled}>Upgrade to ${caName} ${caCostText}</button>
          `;
        } else if (entity.type === 'monastery') {
          const player = this.gameManager.players[0];
          const sanctity = player.upgrades.sanctity || 0;
          const fervor = player.upgrades.fervor || 0;
          const redemption = player.upgrades.redemption || 0;
          const atonement = player.upgrades.atonement || 0;
          const illumination = player.upgrades.illumination || 0;
          const blockPrinting = player.upgrades.blockPrinting || 0;
          const theocracy = player.upgrades.theocracy || 0;

          for (const item of entity.queue) {
            if (item === 'upgrade_sanctity') qSan++;
            if (item === 'upgrade_fervor') qFer++;
            if (item === 'upgrade_redemption') qRed++;
            if (item === 'upgrade_atonement') qAto++;
            if (item === 'upgrade_illumination') qIll++;
            if (item === 'upgrade_blockPrinting') qBlo++;
            if (item === 'upgrade_theocracy') qThe++;
          }

          nextSan = sanctity + qSan;
          nextFer = fervor + qFer;
          nextRed = redemption + qRed;
          nextAto = atonement + qAto;
          nextIll = illumination + qIll;
          nextBlo = blockPrinting + qBlo;
          nextThe = theocracy + qThe;

          const sanCost = nextSan < 1 ? this.gameManager.getUpgradeCost('sanctity', nextSan) : null;
          const ferCost = nextFer < 1 ? this.gameManager.getUpgradeCost('fervor', nextFer) : null;
          const redCost = nextRed < 1 ? this.gameManager.getUpgradeCost('redemption', nextRed) : null;
          const atoCost = nextAto < 1 ? this.gameManager.getUpgradeCost('atonement', nextAto) : null;
          const illCost = nextIll < 1 ? this.gameManager.getUpgradeCost('illumination', nextIll) : null;
          const bloCost = nextBlo < 1 ? this.gameManager.getUpgradeCost('blockPrinting', nextBlo) : null;
          const theCost = nextThe < 1 ? this.gameManager.getUpgradeCost('theocracy', nextThe) : null;

          const sanCostText = sanCost ? `(${sanCost.gold}G)` : 'MAX';
          const ferCostText = ferCost ? `(${ferCost.gold}G)` : 'MAX';
          const redCostText = redCost ? `(${redCost.gold}G)` : 'MAX';
          const atoCostText = atoCost ? `(${atoCost.gold}G)` : 'MAX';
          const illCostText = illCost ? `(${illCost.gold}G)` : 'MAX';
          const bloCostText = bloCost ? `(${bloCost.gold}G)` : 'MAX';
          const theCostText = theCost ? `(${theCost.gold}G)` : 'MAX';

          const isSanDisabled = nextSan >= 1 ? 'disabled' : '';
          const isFerDisabled = nextFer >= 1 ? 'disabled' : '';
          const isRedDisabled = nextRed >= 1 ? 'disabled' : '';
          const isAtoDisabled = nextAto >= 1 ? 'disabled' : '';
          const isIllDisabled = nextIll >= 1 ? 'disabled' : '';
          const isBloDisabled = nextBlo >= 1 ? 'disabled' : '';
          const isTheDisabled = nextThe >= 1 ? 'disabled' : '';

          actionButtonsHtml = `
            <button class="action-btn" id="btn-train-monk" title="Train Monk (100 Gold)">${SVGIcons.monk} Train Monk (100G)</button>
            
            <button class="action-btn ${isSanDisabled}" id="btn-upgrade-sanctity" ${isSanDisabled}>Sanctity ${sanCostText}</button>
            <button class="action-btn ${isFerDisabled}" id="btn-upgrade-fervor" ${isFerDisabled}>Fervor ${ferCostText}</button>
            <button class="action-btn ${isRedDisabled}" id="btn-upgrade-redemption" ${isRedDisabled}>Redemption ${redCostText}</button>
            <button class="action-btn ${isAtoDisabled}" id="btn-upgrade-atonement" ${isAtoDisabled}>Atonement ${atoCostText}</button>
            <button class="action-btn ${isIllDisabled}" id="btn-upgrade-illumination" ${isIllDisabled}>Illumination ${illCostText}</button>
            <button class="action-btn ${isBloDisabled}" id="btn-upgrade-blockprinting" ${isBloDisabled}>Block Printing ${bloCostText}</button>
            <button class="action-btn ${isTheDisabled}" id="btn-upgrade-theocracy" ${isTheDisabled}>Theocracy ${theCostText}</button>
          `;
        } else if (entity.type === 'blacksmith') {
          const player = this.gameManager.players[0];
          const attackLvl = player.upgrades.attack || 0;
          const armorLvl = player.upgrades.armor || 0;
          const arrowLvl = player.upgrades.arrow || 0;
          
          let queuedAttack = 0;
          let queuedArmor = 0;
          let queuedArrow = 0;
          for (const item of entity.queue) {
            if (item === 'upgrade_attack') queuedAttack++;
            if (item === 'upgrade_armor') queuedArmor++;
            if (item === 'upgrade_arrow') queuedArrow++;
          }

          nextAttackLvl = attackLvl + queuedAttack;
          nextArmorLvl = armorLvl + queuedArmor;
          nextArrowLvl = arrowLvl + queuedArrow;

          const attackCost = nextAttackLvl < 3 ? this.gameManager.getUpgradeCost('attack', nextAttackLvl) : null;
          const armorCost = nextArmorLvl < 3 ? this.gameManager.getUpgradeCost('armor', nextArmorLvl) : null;
          const arrowCost = nextArrowLvl < 3 ? this.gameManager.getUpgradeCost('arrow', nextArrowLvl) : null;

          const attackCostText = attackCost ? `(${attackCost.food}F, ${attackCost.gold}G)` : 'MAX';
          const armorCostText = armorCost ? `(${armorCost.food}F, ${armorCost.gold}G)` : 'MAX';
          const arrowCostText = arrowCost ? `(${arrowCost.food}F, ${arrowCost.gold}G)` : 'MAX';

          const isAttackDisabled = nextAttackLvl >= 3 ? 'disabled' : '';
          const isArmorDisabled = nextArmorLvl >= 3 ? 'disabled' : '';
          const isArrowDisabled = nextArrowLvl >= 3 ? 'disabled' : '';

          actionButtonsHtml = `
            <button class="action-btn ${isAttackDisabled}" id="btn-upgrade-attack" title="Upgrade Melee Attack" ${isAttackDisabled}>
              Attack Lvl ${attackLvl} -> ${attackLvl + 1} ${attackCostText}
            </button>
            <button class="action-btn ${isArmorDisabled}" id="btn-upgrade-armor" title="Upgrade Armor" ${isArmorDisabled}>
              Armor Lvl ${armorLvl} -> ${armorLvl + 1} ${armorCostText}
            </button>
            <button class="action-btn ${isArrowDisabled}" id="btn-upgrade-arrow" title="Upgrade Arrow Range & Attack" ${isArrowDisabled}>
              Arrow Lvl ${arrowLvl} -> ${arrowLvl + 1} ${arrowCostText}
            </button>
          `;
        } else if (entity.type === 'castle') {
          actionButtonsHtml = `
            <button class="action-btn" id="btn-train-trebuchet" title="Train Trebuchet (200 Wood, 200 Gold)">${SVGIcons.trebuchet} Trebuchet (200W, 200G)</button>
            <button class="action-btn" id="btn-train-petard" title="Train Petard (65 Food, 20 Gold)">${SVGIcons.petard} Petard (65F, 20G)</button>
            ${garrisonedCount > 0 ? `
              <button class="action-btn" id="btn-ungarrison-all" title="Ungarrison all units">Ungarrison All</button>
            ` : ''}
          `;
        } else if (entity.type === 'university') {
          const player = this.gameManager.players[0];
          const palisadeLvl = player.upgrades.palisadeWallUpgrade || 0;
          const stoneLvl = player.upgrades.stoneWallUpgrade || 0;
          const towerLvl = player.upgrades.watchTowerUpgrade || 0;
          
          let queuedPalisade = 0;
          let queuedStone = 0;
          let queuedTower = 0;
          for (const item of entity.queue) {
            if (item === 'upgrade_palisadeWallUpgrade') queuedPalisade++;
            if (item === 'upgrade_stoneWallUpgrade') queuedStone++;
            if (item === 'upgrade_watchTowerUpgrade') queuedTower++;
          }

          nextPalisadeLvl = palisadeLvl + queuedPalisade;
          nextStoneLvl = stoneLvl + queuedStone;
          nextTowerLvl = towerLvl + queuedTower;

          const palisadeCost = nextPalisadeLvl < 2 ? this.gameManager.getUpgradeCost('palisadeWallUpgrade', nextPalisadeLvl) : null;
          const stoneCost = nextStoneLvl < 2 ? this.gameManager.getUpgradeCost('stoneWallUpgrade', nextStoneLvl) : null;
          const towerCost = nextTowerLvl < 2 ? this.gameManager.getUpgradeCost('watchTowerUpgrade', nextTowerLvl) : null;

          const palisadeCostText = palisadeCost ? `(${palisadeCost.wood || 0}W, ${palisadeCost.gold || 0}G)` : 'MAX';
          const stoneCostText = stoneCost ? `(${stoneCost.stone || 0}S, ${stoneCost.gold || 0}G)` : 'MAX';
          const towerCostText = towerCost ? `(${towerCost.wood || 0}W, ${towerCost.stone || 0}S${towerCost.gold ? `, ${towerCost.gold}G` : ''})` : 'MAX';

          const isPalisadeDisabled = nextPalisadeLvl >= 2 ? 'disabled' : '';
          const isStoneDisabled = nextStoneLvl >= 2 ? 'disabled' : '';
          const isTowerDisabled = nextTowerLvl >= 2 ? 'disabled' : '';

          actionButtonsHtml = `
            <button class="action-btn ${isPalisadeDisabled}" id="btn-upgrade-palisade" ${isPalisadeDisabled}>Palisade Lvl ${palisadeLvl} -> ${palisadeLvl + 1} ${palisadeCostText}</button>
            <button class="action-btn ${isStoneDisabled}" id="btn-upgrade-stone" ${isStoneDisabled}>Stone Lvl ${stoneLvl} -> ${stoneLvl + 1} ${stoneCostText}</button>
            <button class="action-btn ${isTowerDisabled}" id="btn-upgrade-tower" ${isTowerDisabled}>Tower Lvl ${towerLvl} -> ${towerLvl + 1} ${towerCostText}</button>
          `;
        } else if (entity.type === 'siegeWorkshop') {
          const player = this.gameManager.players[0];
          const ramLvl = player.upgrades.batteringRamUpgrade || 0;
          const mangonelLvl = player.upgrades.mangonelUpgrade || 0;
          const scorpionLvl = player.upgrades.scorpionUpgrade || 0;
          const cannonLvl = player.upgrades.bombardCannonUpgrade || 0;
          
          let queuedRam = 0, queuedMangonel = 0, queuedScorpion = 0, queuedCannon = 0;
          for (const item of entity.queue) {
            if (item === 'upgrade_batteringRamUpgrade') queuedRam++;
            if (item === 'upgrade_mangonelUpgrade') queuedMangonel++;
            if (item === 'upgrade_scorpionUpgrade') queuedScorpion++;
            if (item === 'upgrade_bombardCannonUpgrade') queuedCannon++;
          }

          nextRamLvl = ramLvl + queuedRam;
          nextMangonelLvl = mangonelLvl + queuedMangonel;
          nextScorpionLvl = scorpionLvl + queuedScorpion;
          nextCannonLvl = cannonLvl + queuedCannon;

          const ramCost = nextRamLvl < 2 ? this.gameManager.getUpgradeCost('batteringRamUpgrade', nextRamLvl) : null;
          const mangonelCost = nextMangonelLvl < 2 ? this.gameManager.getUpgradeCost('mangonelUpgrade', nextMangonelLvl) : null;
          const scorpionCost = nextScorpionLvl < 1 ? this.gameManager.getUpgradeCost('scorpionUpgrade', nextScorpionLvl) : null;
          const cannonCost = nextCannonLvl < 1 ? this.gameManager.getUpgradeCost('bombardCannonUpgrade', nextCannonLvl) : null;

          const ramCostText = ramCost ? `(${ramCost.food || 0}F, ${ramCost.gold || 0}G)` : 'MAX';
          const mangonelCostText = mangonelCost ? `(${mangonelCost.food || 0}F, ${mangonelCost.gold || 0}G)` : 'MAX';
          const scorpionCostText = scorpionCost ? `(${scorpionCost.wood || 0}W, ${scorpionCost.gold || 0}G)` : 'MAX';
          const cannonCostText = cannonCost ? `(${cannonCost.food || 0}F, ${cannonCost.gold || 0}G)` : 'MAX';

          const isRamDisabled = nextRamLvl >= 2 ? 'disabled' : '';
          const isMangonelDisabled = nextMangonelLvl >= 2 ? 'disabled' : '';
          const isScorpionDisabled = nextScorpionLvl >= 1 ? 'disabled' : '';
          const isCannonDisabled = nextCannonLvl >= 1 ? 'disabled' : '';

          actionButtonsHtml = `
            <button class="action-btn" id="btn-train-ram" title="Train Battering Ram">${SVGIcons.batteringRam} Battering Ram (160W, 75G)</button>
            <button class="action-btn" id="btn-train-mangonel" title="Train Mangonel">${SVGIcons.mangonel} Mangonel (160W, 135G)</button>
            <button class="action-btn" id="btn-train-scorpion" title="Train Scorpion">${SVGIcons.scorpion} Scorpion (75W, 75G)</button>
            <button class="action-btn" id="btn-train-cannon" title="Train Bombard Cannon">${SVGIcons.bombardCannon} Bombard Cannon (225W, 225G)</button>
            <button class="action-btn" id="btn-train-siege-tower" title="Train Siege Tower">${SVGIcons.siegeTower} Siege Tower (200W, 160G)</button>
            
            <button class="action-btn ${isRamDisabled}" id="btn-upgrade-ram" ${isRamDisabled}>Upgrade Ram Lvl ${ramLvl} -> ${ramLvl + 1} ${ramCostText}</button>
            <button class="action-btn ${isMangonelDisabled}" id="btn-upgrade-mangonel" ${isMangonelDisabled}>Upgrade Mangonel Lvl ${mangonelLvl} -> ${mangonelLvl + 1} ${mangonelCostText}</button>
            <button class="action-btn ${isScorpionDisabled}" id="btn-upgrade-scorpion" ${isScorpionDisabled}>Upgrade Scorpion -> Heavy ${scorpionCostText}</button>
            <button class="action-btn ${isCannonDisabled}" id="btn-upgrade-cannon" ${isCannonDisabled}>Upgrade Cannon -> Houfnice ${cannonCostText}</button>
          `;
        } else if (entity.type === 'temple') {
          actionButtonsHtml = `
            <button class="action-btn" id="btn-train-priest" title="Train Priest (100 Gold)">${SVGIcons.priest} Train Priest (100G)</button>
          `;
        } else if (entity.type === 'market') {
          actionButtonsHtml = `
            <button class="action-btn" id="btn-train-trader" title="Train Trader (60 Wood, 60 Gold)">${SVGIcons.trader} Train Trader (60W, 60G)</button>
          `;
        } else if (entity.type === 'dock') {
          const player = this.gameManager.players[0];
          const galleyLvl = player.upgrades.galleyUpgrade || 0;
          const fireLvl = player.upgrades.fireShipUpgrade || 0;

          for (const item of entity.queue) {
            if (item === 'upgrade_galleyUpgrade') qG++;
            if (item === 'upgrade_fireShipUpgrade') qF++;
          }

          const nextGLvl = galleyLvl + qG;
          const nextFLvl = fireLvl + qF;

          const galleyCost = nextGLvl < 2 ? this.gameManager.getUpgradeCost('galleyUpgrade', nextGLvl) : null;
          const fireCost = nextFLvl < 1 ? this.gameManager.getUpgradeCost('fireShipUpgrade', nextFLvl) : null;

          const galleyCostText = galleyCost ? `(${galleyCost.food || 0}F, ${galleyCost.gold || 0}G)` : 'MAX';
          const fireCostText = fireCost ? `(${fireCost.food || 0}F, ${fireCost.gold || 0}G)` : 'MAX';

          const isGDisabled = nextGLvl >= 2 ? 'disabled' : '';
          const isFDisabled = nextFLvl >= 1 ? 'disabled' : '';

          const gName = galleyLvl === 0 ? 'War Galley' : 'Galleon';
          const fName = 'Fast Fire Ship';

          actionButtonsHtml = `
            <button class="action-btn" id="btn-train-fishingShip" title="Train Fishing Ship (75 Wood)">${SVGIcons.fishingShip} Fishing Ship (75W)</button>
            <button class="action-btn" id="btn-train-transportShip" title="Train Transport Ship (125 Wood)">${SVGIcons.transportShip} Transport Ship (125W)</button>
            <button class="action-btn" id="btn-train-galley" title="Train Galley (90 Wood, 30 Gold)">${SVGIcons.galley} Galley (90W, 30G)</button>
            <button class="action-btn" id="btn-train-fireship" title="Train Fire Ship (75 Wood, 45 Gold)">${SVGIcons.fireShip} Fire Ship (75W, 45G)</button>
            <button class="action-btn" id="btn-train-demolitionship" title="Train Demolition Ship (70 Wood, 50 Gold)">${SVGIcons.demolitionShip} Demo Ship (70W, 50G)</button>
            <button class="action-btn" id="btn-train-cannongalleon" title="Train Cannon Galleon (200 Wood, 150 Gold)">${SVGIcons.cannonGalleon} Cannon Galleon (200W, 150G)</button>
            
            <button class="action-btn ${isGDisabled}" id="btn-upgrade-galley" ${isGDisabled}>Upgrade to ${gName} ${galleyCostText}</button>
            <button class="action-btn ${isFDisabled}" id="btn-upgrade-fireship" ${isFDisabled}>Upgrade to ${fName} ${fireCostText}</button>
          `;
        } else if (entity.type === 'farm') {
          if (!entity.isCompleted) {
            actionButtonsHtml = `
              <button class="action-btn" id="btn-reseed-farm" title="Reseed Farm (60 Wood)">${SVGIcons.farm} Reseed Farm (60W)</button>
            `;
          } else {
            actionButtonsHtml = `<div style="font-size:0.8rem; padding:8px; opacity:0.8;">Working Farm. Food remaining: ${entity.amount}</div>`;
          }
        }

        commandPanel.innerHTML = `
          <div style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
            <div class="action-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; overflow-y: auto; max-height: 110px; padding-right:4px;">
              ${actionButtonsHtml}
            </div>
            <div style="margin-top: auto; padding-top: 6px;">
              ${queueHtml}
              ${queueCardsHtml}
            </div>
          </div>
        `;

        // Bind Queue item cancellation click and contextmenu (right-click) events
        if (entity.queue && entity.queue.length > 0) {
          const cards = commandPanel.querySelectorAll('.queue-item-card');
          cards.forEach(card => {
            const idx = parseInt(card.dataset.idx, 10);
            const cancelHandler = (e) => {
              e.preventDefault();
              entity.cancelQueue(idx);
              this.gameManager.soundManager.playClickSound('select');
            };
            card.addEventListener('click', cancelHandler);
            card.addEventListener('contextmenu', cancelHandler);
          });
        }

        // Bind Action grid click events
        if (entity.isCompleted) {
          if (entity.type === 'townCenter') {
            document.getElementById('btn-train-villager').addEventListener('click', () => entity.queueUnit('villager'));
            const ageUpBtn = document.getElementById('btn-age-up');
            if (ageUpBtn) {
              ageUpBtn.addEventListener('click', () => {
                this.gameManager.upgradePlayerAge(0);
                setTimeout(() => this.updateSelectionUI(), 100);
              });
            }
          } else if (entity.type === 'barracks') {
            document.getElementById('btn-train-swordsman').addEventListener('click', () => entity.queueUnit('swordsman'));
            document.getElementById('btn-train-spearman').addEventListener('click', () => entity.queueUnit('spearman'));
            document.getElementById('btn-train-footknight').addEventListener('click', () => entity.queueUnit('footKnight'));
            document.getElementById('btn-train-heavycavalry').addEventListener('click', () => entity.queueUnit('heavyCavalry'));

            if (nextSLvl < 2) {
              document.getElementById('btn-upgrade-swordsman').addEventListener('click', () => entity.queueUpgrade('swordsmanUpgrade'));
            }
            if (nextSpLvl < 2) {
              document.getElementById('btn-upgrade-spearman').addEventListener('click', () => entity.queueUpgrade('spearmanUpgrade'));
            }
            if (nextFkLvl < 2) {
              document.getElementById('btn-upgrade-footknight').addEventListener('click', () => entity.queueUpgrade('footKnightUpgrade'));
            }
            if (nextHcLvl < 2) {
              document.getElementById('btn-upgrade-heavycavalry').addEventListener('click', () => entity.queueUpgrade('heavyCavalryUpgrade'));
            }
          } else if (entity.type === 'stable') {
            document.getElementById('btn-train-scoutcavalry').addEventListener('click', () => entity.queueUnit('scoutCavalry'));
            document.getElementById('btn-train-knight').addEventListener('click', () => entity.queueUnit('knight'));
            document.getElementById('btn-train-camelrider').addEventListener('click', () => entity.queueUnit('camelRider'));
            if (nextScLvl < 2) {
              document.getElementById('btn-upgrade-scout').addEventListener('click', () => entity.queueUpgrade('scoutUpgrade'));
            }
            if (nextKLvl < 2) {
              document.getElementById('btn-upgrade-knight').addEventListener('click', () => entity.queueUpgrade('knightUpgrade'));
            }
            if (nextCLvl < 2) {
              document.getElementById('btn-upgrade-camel').addEventListener('click', () => entity.queueUpgrade('camelUpgrade'));
            }
          } else if (entity.type === 'archeryRange') {
            document.getElementById('btn-train-archer').addEventListener('click', () => entity.queueUnit('archer'));
            document.getElementById('btn-train-skirmisher').addEventListener('click', () => entity.queueUnit('skirmisher'));
            document.getElementById('btn-train-cavalryarcher').addEventListener('click', () => entity.queueUnit('cavalryArcher'));
            if (nextALvl < 2) {
              document.getElementById('btn-upgrade-archer').addEventListener('click', () => entity.queueUpgrade('archerUpgrade'));
            }
            if (nextSkLvl < 1) {
              document.getElementById('btn-upgrade-skirmisher').addEventListener('click', () => entity.queueUpgrade('skirmisherUpgrade'));
            }
            if (nextCaLvl < 1) {
              document.getElementById('btn-upgrade-cavalryarcher').addEventListener('click', () => entity.queueUpgrade('cavalryArcherUpgrade'));
            }
          } else if (entity.type === 'monastery') {
            document.getElementById('btn-train-monk').addEventListener('click', () => entity.queueUnit('monk'));
            if (nextSan < 1) {
              document.getElementById('btn-upgrade-sanctity').addEventListener('click', () => entity.queueUpgrade('sanctity'));
            }
            if (nextFer < 1) {
              document.getElementById('btn-upgrade-fervor').addEventListener('click', () => entity.queueUpgrade('fervor'));
            }
            if (nextRed < 1) {
              document.getElementById('btn-upgrade-redemption').addEventListener('click', () => entity.queueUpgrade('redemption'));
            }
            if (nextAto < 1) {
              document.getElementById('btn-upgrade-atonement').addEventListener('click', () => entity.queueUpgrade('atonement'));
            }
            if (nextIll < 1) {
              document.getElementById('btn-upgrade-illumination').addEventListener('click', () => entity.queueUpgrade('illumination'));
            }
            if (nextBlo < 1) {
              document.getElementById('btn-upgrade-blockprinting').addEventListener('click', () => entity.queueUpgrade('blockPrinting'));
            }
            if (nextThe < 1) {
              document.getElementById('btn-upgrade-theocracy').addEventListener('click', () => entity.queueUpgrade('theocracy'));
            }
          } else if (entity.type === 'blacksmith') {
            if (nextAttackLvl < 3) {
              document.getElementById('btn-upgrade-attack').addEventListener('click', () => entity.queueUpgrade('attack'));
            }
            if (nextArmorLvl < 3) {
              document.getElementById('btn-upgrade-armor').addEventListener('click', () => entity.queueUpgrade('armor'));
            }
            if (nextArrowLvl < 3) {
              document.getElementById('btn-upgrade-arrow').addEventListener('click', () => entity.queueUpgrade('arrow'));
            }
          } else if (entity.type === 'castle') {
            document.getElementById('btn-train-trebuchet').addEventListener('click', () => entity.queueUnit('trebuchet'));
            document.getElementById('btn-train-petard').addEventListener('click', () => entity.queueUnit('petard'));
            const ungarrBtn = document.getElementById('btn-ungarrison-all');
            if (ungarrBtn) {
              ungarrBtn.addEventListener('click', () => entity.ungarrisonAll());
            }
          } else if (entity.type === 'university') {
            if (nextPalisadeLvl < 2) {
              document.getElementById('btn-upgrade-palisade').addEventListener('click', () => entity.queueUpgrade('palisadeWallUpgrade'));
            }
            if (nextStoneLvl < 2) {
              document.getElementById('btn-upgrade-stone').addEventListener('click', () => entity.queueUpgrade('stoneWallUpgrade'));
            }
            if (nextTowerLvl < 2) {
              document.getElementById('btn-upgrade-tower').addEventListener('click', () => entity.queueUpgrade('watchTowerUpgrade'));
            }
          } else if (entity.type === 'siegeWorkshop') {
            document.getElementById('btn-train-ram').addEventListener('click', () => entity.queueUnit('batteringRam'));
            document.getElementById('btn-train-mangonel').addEventListener('click', () => entity.queueUnit('mangonel'));
            document.getElementById('btn-train-scorpion').addEventListener('click', () => entity.queueUnit('scorpion'));
            document.getElementById('btn-train-cannon').addEventListener('click', () => entity.queueUnit('bombardCannon'));
            document.getElementById('btn-train-siege-tower').addEventListener('click', () => entity.queueUnit('siegeTower'));
            
            if (nextRamLvl < 2) {
              document.getElementById('btn-upgrade-ram').addEventListener('click', () => entity.queueUpgrade('batteringRamUpgrade'));
            }
            if (nextMangonelLvl < 2) {
              document.getElementById('btn-upgrade-mangonel').addEventListener('click', () => entity.queueUpgrade('mangonelUpgrade'));
            }
            if (nextScorpionLvl < 1) {
              document.getElementById('btn-upgrade-scorpion').addEventListener('click', () => entity.queueUpgrade('scorpionUpgrade'));
            }
            if (nextCannonLvl < 1) {
              document.getElementById('btn-upgrade-cannon').addEventListener('click', () => entity.queueUpgrade('bombardCannonUpgrade'));
            }
          } else if (entity.type === 'temple') {
            document.getElementById('btn-train-priest').addEventListener('click', () => entity.queueUnit('priest'));
          } else if (entity.type === 'market') {
            document.getElementById('btn-train-trader').addEventListener('click', () => entity.queueUnit('trader'));
          } else if (entity.type === 'dock') {
            document.getElementById('btn-train-fishingShip').addEventListener('click', () => entity.queueUnit('fishingShip'));
            document.getElementById('btn-train-transportShip').addEventListener('click', () => entity.queueUnit('transportShip'));
            document.getElementById('btn-train-galley').addEventListener('click', () => entity.queueUnit('galley'));
            document.getElementById('btn-train-fireship').addEventListener('click', () => entity.queueUnit('fireShip'));
            document.getElementById('btn-train-demolitionship').addEventListener('click', () => entity.queueUnit('demolitionShip'));
            document.getElementById('btn-train-cannongalleon').addEventListener('click', () => entity.queueUnit('cannonGalleon'));
            if (nextGLvl < 2) {
              document.getElementById('btn-upgrade-galley').addEventListener('click', () => entity.queueUpgrade('galleyUpgrade'));
            }
            if (nextFLvl < 1) {
              document.getElementById('btn-upgrade-fireship').addEventListener('click', () => entity.queueUpgrade('fireShipUpgrade'));
            }
          }
        } else {
          // depleted farm manually reseed
          if (entity.type === 'farm' && !entity.isCompleted) {
            document.getElementById('btn-reseed-farm').addEventListener('click', () => {
              const reseedCost = { wood: 60 };
              if (this.gameManager.hasResources(0, reseedCost)) {
                this.gameManager.deductResources(0, reseedCost);
                entity.amount = 250;
                entity.isCompleted = true;
                entity.buildProgress = 100;
                entity.hp = entity.maxHp;
                if (entity.mesh) {
                  const crops = entity.mesh.getObjectByName("crops");
                  if (crops) crops.scale.y = 1.0;
                  else entity.mesh.scale.set(1.0, 1.0, 1.0);
                  entity.mesh.traverse(c => {
                    if (c.isMesh && c.userData.originalMat) c.material = c.userData.originalMat;
                  });
                }
                this.gameManager.soundManager.playClickSound('complete');
                this.showNotification("Farm manually reseeded! (60 Wood)");
                this.gameManager.hud.showFloatingText(entity.position, "-60 Wood 🪵", 0xd48030);
                this.updateSelectionUI();
              } else {
                this.showNotification("Not enough Wood to reseed! Needs 60 Wood.");
              }
            });
          }
        }
      } else {
        // Selected is a player Unit
        if (entity.type === 'villager') {
          const playerCiv = this.gameManager.players[0].civ || 'inggris';
          const isGoth = playerCiv === 'goth';
          
          const currentAge = this.gameManager.players[0].age || 'dark';

          let buildButtonsHtml = `
            <button class="action-btn" id="btn-build-house" title="Build House (50 Wood) - Increases pop capacity">${SVGIcons.house} House (50W)</button>
            <button class="action-btn" id="btn-build-barracks" title="Build Barracks (120 Wood, 50 Stone) - Spawns army">${SVGIcons.barracks} Barracks (120W, 50S)</button>
            <button class="action-btn" id="btn-build-dock" title="Build Dock (150 Wood) - Shoreline Shipyard">${SVGIcons.dock} Dock (150W)</button>
            <button class="action-btn" id="btn-build-farm" title="Build Farm (60 Wood) - Constant Food Resource">${SVGIcons.farm} Farm (60W)</button>
            <button class="action-btn" id="btn-build-mill" title="Build Mill (100 Wood) - Drops off food, supports farms">${SVGIcons.mill} Mill (100W)</button>
            <button class="action-btn" id="btn-build-lumbercamp" title="Build Lumber Camp (100 Wood) - Drops off wood">${SVGIcons.lumberCamp} Lumber Camp (100W)</button>
            <button class="action-btn" id="btn-build-miningcamp" title="Build Mining Camp (100 Wood) - Drops off stone & gold">${SVGIcons.miningCamp} Mining Camp (100W)</button>
            <button class="action-btn" id="btn-build-palisadewall" title="Build Palisade Wall (5 Wood) - Basic Defense">${SVGIcons.palisadeWall} Palisade Wall (5W)</button>
          `;

          if (currentAge !== 'dark') {
            buildButtonsHtml += `
              <button class="action-btn" id="btn-build-stable" title="Build Stable (175 Wood) - Trains cavalry">${SVGIcons.stable} Stable (175W)</button>
              <button class="action-btn" id="btn-build-archeryrange" title="Build Archery Range (175 Wood) - Trains archers">${SVGIcons.archeryRange} Archery Range (175W)</button>
              <button class="action-btn" id="btn-build-blacksmith" title="Build Blacksmith (150 Wood) - Researches upgrades">${SVGIcons.blacksmith} Blacksmith (150W)</button>
              <button class="action-btn" id="btn-build-market" title="Build Market (100 Wood) - Trains Trader">${SVGIcons.market} Market (100W)</button>
              <button class="action-btn" id="btn-build-palisadegate" title="Build Palisade Gate (30 Wood) - Basic Passage">${SVGIcons.palisadeGate} Palisade Gate (30W)</button>
              <button class="action-btn" id="btn-build-watchtower" title="Build Watchtower (100 Wood, 125 Stone) - Fires arrows">${SVGIcons.watchTower} Watchtower (100W, 125S)</button>
            `;
          }

          if (currentAge === 'castle' || currentAge === 'imperial') {
            buildButtonsHtml += `
              <button class="action-btn" id="btn-build-monastery" title="Build Monastery (175 Wood) - Trains monks">${SVGIcons.monastery} Monastery (175W)</button>
              <button class="action-btn" id="btn-build-castle" title="Build Castle (200 Wood, 650 Stone) - Heavy garrison fortress">${SVGIcons.castle} Castle (200W, 650S)</button>
              <button class="action-btn" id="btn-build-university" title="Build University (200 Wood, 100 Gold) - Researches upgrades">${SVGIcons.university} University (200W, 100G)</button>
              <button class="action-btn" id="btn-build-siegeworkshop" title="Build Siege Workshop (200 Wood, 100 Gold)">${SVGIcons.siegeWorkshop} Siege Workshop (200W, 100G)</button>
            `;
          }

          if (currentAge === 'imperial') {
            buildButtonsHtml += `
              <button class="action-btn" id="btn-build-bombardtower" title="Build Bombard Tower (250 Stone, 100 Gold) - Fires cannonballs">${SVGIcons.bombardTower} Bombard Tower (250S, 100G)</button>
            `;
          }
          
          if (!isGoth && currentAge !== 'dark') {
            buildButtonsHtml += `
              <button class="action-btn" id="btn-build-stonewall" title="Build Stone Wall (5 Stone) - Heavy Defense">${SVGIcons.stoneWall} Stone Wall (5S)</button>
              <button class="action-btn" id="btn-build-stonegate" title="Build Stone Gate (30 Stone) - Heavy Passage">${SVGIcons.stoneGate} Stone Gate (30S)</button>
            `;
          }

          commandPanel.innerHTML = `
            <div style="display:flex; flex-direction:column; justify-content:space-between; height:100%;">
              <div class="action-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; overflow-y: auto; max-height: 145px; padding-right:4px;">
                ${buildButtonsHtml}
              </div>
              <div style="display:flex; gap:6px; margin-top:6px; padding-top:4px; border-top:1px solid rgba(255,255,255,0.08);">
                <button class="action-btn warning-btn" id="btn-cmd-stop" style="flex-grow:1; max-width: 100px;">Stop</button>
              </div>
            </div>
          `;

          const binds = [
            { id: 'btn-build-house', type: 'house', text: 'place House' },
            { id: 'btn-build-barracks', type: 'barracks', text: 'place Barracks' },
            { id: 'btn-build-dock', type: 'dock', text: 'place Dock' },
            { id: 'btn-build-farm', type: 'farm', text: 'place Farm' },
            { id: 'btn-build-mill', type: 'mill', text: 'place Mill' },
            { id: 'btn-build-lumbercamp', type: 'lumberCamp', text: 'place Lumber Camp' },
            { id: 'btn-build-miningcamp', type: 'miningCamp', text: 'place Mining Camp' },
            { id: 'btn-build-palisadewall', type: 'palisadeWall', text: 'place Palisade Wall' }
          ];

          if (currentAge !== 'dark') {
            binds.push(
              { id: 'btn-build-stable', type: 'stable', text: 'place Stable' },
              { id: 'btn-build-archeryrange', type: 'archeryRange', text: 'place Archery Range' },
              { id: 'btn-build-blacksmith', type: 'blacksmith', text: 'place Blacksmith' },
              { id: 'btn-build-market', type: 'market', text: 'place Market' },
              { id: 'btn-build-palisadegate', type: 'palisadeGate', text: 'place Palisade Gate' },
              { id: 'btn-build-watchtower', type: 'watchTower', text: 'place Watchtower' }
            );
          }

          if (currentAge === 'castle' || currentAge === 'imperial') {
            binds.push(
              { id: 'btn-build-monastery', type: 'monastery', text: 'place Monastery' },
              { id: 'btn-build-castle', type: 'castle', text: 'place Castle' },
              { id: 'btn-build-university', type: 'university', text: 'place University' },
              { id: 'btn-build-siegeworkshop', type: 'siegeWorkshop', text: 'place Siege Workshop' }
            );
          }

          if (currentAge === 'imperial') {
            binds.push(
              { id: 'btn-build-bombardtower', type: 'bombardTower', text: 'place Bombard Tower' }
            );
          }

          if (!isGoth && currentAge !== 'dark') {
            binds.push(
              { id: 'btn-build-stonewall', type: 'stoneWall', text: 'place Stone Wall' },
              { id: 'btn-build-stonegate', type: 'stoneGate', text: 'place Stone Gate' }
            );
          }

          if (!isGoth) {
            binds.push(
              { id: 'btn-build-stonewall', type: 'stoneWall', text: 'place Stone Wall' },
              { id: 'btn-build-stonegate', type: 'stoneGate', text: 'place Stone Gate' }
            );
          }

          binds.forEach(b => {
            const btn = document.getElementById(b.id);
            if (btn) {
              btn.addEventListener('click', () => {
                this.gameManager.input.startBuildPlacement(b.type);
                this.showNotification(`Left-click on the map to ${b.text}. Right-click to cancel.`);
              });
            }
          });

          document.getElementById('btn-cmd-stop').addEventListener('click', () => {
            entity.commandStop();
            this.gameManager.soundManager.playClickSound('select');
            this.updateSelectionUI();
          });

        } else {
          // Combat unit / Priest / Trader / Fishing Ship
          const isMilitary = ['swordsman', 'archer', 'knight', 'footKnight', 'heavyCavalry', 'horseArcher', 'batteringRam', 'mangonel', 'scorpion', 'bombardCannon', 'siegeTower', 'trebuchet', 'petard', 'spearman', 'skirmisher', 'scoutCavalry', 'camelRider', 'cavalryArcher', 'monk', 'transportShip', 'galley', 'fireShip', 'demolitionShip', 'cannonGalleon'].includes(entity.type);
          
          let militaryButtons = '';
          if (isMilitary) {
            militaryButtons = `
              <div class="formation-controls" style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
                <button class="action-btn formation-btn ${this.gameManager.currentFormation === 'box' ? 'glow-btn-active' : ''}" id="btn-formation-box" title="Box Formation">▣ Box</button>
                <button class="action-btn formation-btn ${this.gameManager.currentFormation === 'line' ? 'glow-btn-active' : ''}" id="btn-formation-line" title="Line Formation">═ Line</button>
                <button class="action-btn formation-btn ${this.gameManager.currentFormation === 'column' ? 'glow-btn-active' : ''}" id="btn-formation-column" title="Column Formation">║ Column</button>
                <button class="action-btn formation-btn ${this.gameManager.currentFormation === 'spread' ? 'glow-btn-active' : ''}" id="btn-formation-spread" title="Spread Formation">◇ Spread</button>
              </div>
              <div style="font-size:0.65rem; color:#888; margin-top:4px;">Formation: ${this.gameManager.getFormationName(this.gameManager.currentFormation)} (Press F to cycle)</div>
            `;
          }

          commandPanel.innerHTML = `
            <div style="display:flex; flex-direction:column; justify-content:space-between; height:100%;">
              <div style="font-size:0.8rem; font-weight:bold; opacity:0.9; margin-bottom:6px;">Commands</div>
              <div style="display:flex; gap:6px;">
                <button class="action-btn warning-btn" id="btn-cmd-stop" style="flex-grow:1; max-width: 100px;">Stop</button>
              </div>
              ${militaryButtons}
            </div>
          `;

          document.getElementById('btn-cmd-stop').addEventListener('click', () => {
            entity.commandStop();
            this.gameManager.soundManager.playClickSound('select');
            this.updateSelectionUI();
          });

          if (isMilitary) {
            ['box', 'line', 'column', 'spread'].forEach(f => {
              const btn = document.getElementById(`btn-formation-${f}`);
              if (btn) {
                btn.addEventListener('click', () => {
                  this.gameManager.currentFormation = f;
                  this.showNotification(`Formation: ${this.gameManager.getFormationName(f)}`);
                  this.updateSelectionUI();
                });
              }
            });
          }
        }
      }
    } 
    else {
      // Multiple Selection UI
      const villagers = selected.filter(e => e.type === 'villager').length;
      const swordsmen = selected.filter(e => e.type === 'swordsman').length;
      const footKnights = selected.filter(e => e.type === 'footKnight').length;
      const archers = selected.filter(e => e.type === 'archer').length;
      const knights = selected.filter(e => e.type === 'knight').length;
      const heavyCavalry = selected.filter(e => e.type === 'heavyCavalry').length;
      const horseArchers = selected.filter(e => e.type === 'horseArcher').length;
      const priests = selected.filter(e => e.type === 'priest').length;
      const traders = selected.filter(e => e.type === 'trader').length;
      const fishingShips = selected.filter(e => e.type === 'fishingShip').length;
      const sheep = selected.filter(e => e.type === 'sheep').length;
      const rams = selected.filter(e => e.type === 'batteringRam').length;
      const mangonels = selected.filter(e => e.type === 'mangonel').length;
      const scorpions = selected.filter(e => e.type === 'scorpion').length;
      const cannons = selected.filter(e => e.type === 'bombardCannon').length;
      const siegeTowers = selected.filter(e => e.type === 'siegeTower').length;
      const trebuchets = selected.filter(e => e.type === 'trebuchet').length;
      const petards = selected.filter(e => e.type === 'petard').length;
      
      const detailsList = [];
      if (villagers) detailsList.push(`Villagers: ${villagers}`);
      if (swordsmen) detailsList.push(`Swordsmen: ${swordsmen}`);
      if (footKnights) detailsList.push(`Foot Knights: ${footKnights}`);
      if (archers) detailsList.push(`Archers: ${archers}`);
      if (knights) detailsList.push(`Knights: ${knights}`);
      if (heavyCavalry) detailsList.push(`Heavy Cav: ${heavyCavalry}`);
      if (horseArchers) detailsList.push(`Horse Archers: ${horseArchers}`);
      if (priests) detailsList.push(`Priests: ${priests}`);
      if (traders) detailsList.push(`Traders: ${traders}`);
      if (fishingShips) detailsList.push(`Fishing Ships: ${fishingShips}`);
      if (sheep) detailsList.push(`Sheep: ${sheep}`);
      if (rams) detailsList.push(`Rams: ${rams}`);
      if (mangonels) detailsList.push(`Mangonels: ${mangonels}`);
      if (scorpions) detailsList.push(`Scorpions: ${scorpions}`);
      if (cannons) detailsList.push(`Cannons: ${cannons}`);
      if (siegeTowers) detailsList.push(`Siege Towers: ${siegeTowers}`);
      if (trebuchets) detailsList.push(`Trebuchets: ${trebuchets}`);
      if (petards) detailsList.push(`Petards: ${petards}`);

      infoPanel.innerHTML = `
        <div class="selection-card" style="width:100%; height:100%;">
          <div style="font-weight:bold; font-size:0.85rem; margin-bottom:4px;">Selected Units (${selected.length})</div>
          <div class="multi-select-grid">
            ${selected.map((u, idx) => {
              const hpPercent = Math.max(0, Math.min(100, (u.hp / u.maxHp) * 100));
              const iconKey = SVGIcons[u.type] ? u.type : u.type.toLowerCase();
              const icon = SVGIcons.getIcon(iconKey, 'multi-select-icon') || SVGIcons.getIcon('villager', 'multi-select-icon');
              return `
                <div class="multi-select-item" data-idx="${idx}" title="${u.type} (HP: ${u.hp}/${u.maxHp})">
                  ${icon}
                  <div class="multi-select-hp-bar" style="width: ${hpPercent}%"></div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;

      const gridItems = infoPanel.querySelectorAll('.multi-select-item');
      gridItems.forEach(item => {
        const idx = parseInt(item.dataset.idx, 10);
        item.addEventListener('click', () => {
          this.gameManager.selectEntity(selected[idx]);
        });
      });

      const currentFormation = this.gameManager.getFormationName(this.gameManager.currentFormation);
      
      commandPanel.innerHTML = `
        <div style="display:flex; flex-direction:column; justify-content:space-between; height:100%;">
          <div>
            <div class="entity-name" style="font-weight:bold; font-size:0.85rem; margin-bottom:4px;">Unit Group</div>
            <div class="entity-details" style="font-size:0.75rem; line-height: 1.3; max-height:50px; overflow-y:auto; color:#ccc;">
              ${detailsList.join(' | ')}
            </div>
          </div>
          
          <div style="margin-top:auto;">
            <div class="formation-controls" style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:4px;">
              <button class="action-btn formation-btn ${this.gameManager.currentFormation === 'box' ? 'glow-btn-active' : ''}" id="btn-formation-box" title="Box Formation">▣ Box</button>
              <button class="action-btn formation-btn ${this.gameManager.currentFormation === 'line' ? 'glow-btn-active' : ''}" id="btn-formation-line" title="Line Formation">═ Line</button>
              <button class="action-btn formation-btn ${this.gameManager.currentFormation === 'column' ? 'glow-btn-active' : ''}" id="btn-formation-column" title="Column Formation">║ Column</button>
              <button class="action-btn formation-btn ${this.gameManager.currentFormation === 'spread' ? 'glow-btn-active' : ''}" id="btn-formation-spread" title="Spread Formation">◇ Spread</button>
              <button class="action-btn warning-btn" id="btn-cmd-stop" style="max-width: 80px;">Stop</button>
            </div>
            <div style="font-size:0.65rem; color:#888;">Formation: ${currentFormation} (Press F to cycle)</div>
          </div>
        </div>
      `;

      document.getElementById('btn-cmd-stop').addEventListener('click', () => {
        selected.forEach(u => {
          if (u.commandStop) u.commandStop();
        });
        this.gameManager.soundManager.playClickSound('select');
        this.updateSelectionUI();
      });

      ['box', 'line', 'column', 'spread'].forEach(f => {
        const btn = document.getElementById(`btn-formation-${f}`);
        if (btn) {
          btn.addEventListener('click', () => {
            this.gameManager.currentFormation = f;
            this.showNotification(`Formation: ${this.gameManager.getFormationName(f)}`);
            this.updateSelectionUI();
          });
        }
      });
    }
  }

  updateQueueProgress(percent) {
    const bar = document.getElementById('queue-bar');
    if (bar) {
      bar.style.width = percent + '%';
    }
  }

  // -------------------------------------------------------------
  // NOTIFICATIONS
  // -------------------------------------------------------------
  showNotification(text, position = null) {
    const box = document.getElementById('notification-box');
    if (!box) return;
    const el = document.createElement('div');
    el.className = 'notification-item glassmorphism';
    el.textContent = text;
    
    if (position) {
      el.classList.add('clickable-alert');
      el.title = "Click to jump camera to this event";
      el.addEventListener('click', () => {
        this.gameManager.renderer.cameraTarget.set(position.x, 0, position.z);
        this.gameManager.soundManager.playClickSound('select');
      });
    }
    
    box.appendChild(el);
    
    // Animate removal after 4 seconds
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(-10px)';
      setTimeout(() => el.remove(), 400);
    }, 4000);
  }

  // -------------------------------------------------------------
  // SCREEN SPACE FLOATING TEXT (3D to 2D projection)
  // -------------------------------------------------------------
  showFloatingText(position3D, text, colorHex) {
    const textEl = document.createElement('div');
    textEl.className = 'floating-text';
    textEl.style.color = '#' + colorHex.toString(16).padStart(6, '0');
    textEl.textContent = text;
    document.body.appendChild(textEl);
    
    const floatingObj = {
      el: textEl,
      pos: position3D.clone(),
      offsetY: 0.5,
      opacity: 1.0
    };
    
    this.floatingTexts.push(floatingObj);
  }

  showResourceFloatingText(position3D, text, resourceType) {
    let color = 0xddcc99;
    if (resourceType === 'wood') color = 0x2e5c1e;
    else if (resourceType === 'gold') color = 0xffd700;
    else if (resourceType === 'stone') color = 0x7a7a7a;
    else if (resourceType === 'food') color = 0xff5555;
    
    this.showFloatingText(position3D, text, color);
  }

  updateFloatingTexts(deltaTime) {
    const activeCamera = this.gameManager.renderer.camera;
    
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const item = this.floatingTexts[i];
      item.offsetY += deltaTime * 1.5; // Float upwards
      item.opacity -= deltaTime * 1.2; // Fade out
      
      if (item.opacity <= 0) {
        item.el.remove();
        this.floatingTexts.splice(i, 1);
        continue;
      }
      
      // Calculate screen position
      const renderPos = item.pos.clone();
      renderPos.y += item.offsetY;
      
      renderPos.project(activeCamera);
      
      const x = (renderPos.x * .5 + .5) * window.innerWidth;
      const y = (-(renderPos.y * .5) + .5) * window.innerHeight;
      
      // Update element style
      item.el.style.left = `${x}px`;
      item.el.style.top = `${y}px`;
      item.el.style.opacity = item.opacity;
    }
  }

  // -------------------------------------------------------------
  // RENDERING MINIMAP & SCREEN LOOP
  // -------------------------------------------------------------
  updateLoop() {
    requestAnimationFrame(this.updateLoop.bind(this));
    
    const now = performance.now();
    
    // Update floating texts every frame
    const delta = (now - (this.lastTime || now)) / 1000;
    this.lastTime = now;
    if (delta > 0) {
      this.updateFloatingTexts(delta);
      
      // Update Timer
      const timerEl = document.getElementById('timer-display');
      if (timerEl) {
        const t = Math.floor(this.gameManager.gameTime || 0);
        const m = Math.floor(t / 60).toString().padStart(2, '0');
        const s = (t % 60).toString().padStart(2, '0');
        timerEl.textContent = `⏳ ${m}:${s}`;
      }
      
      // Update Score
      const scoreEl = document.getElementById('score-display');
      if (scoreEl) {
        const score = this.gameManager.calculatePlayerScore(0);
        scoreEl.textContent = `⭐ Score: ${score}`;
      }
      
      // Update Age & Civ Info
      const ageTitleEl = document.getElementById('age-civ-title');
      const ageSubtitleEl = document.getElementById('age-civ-subtitle');
      const ageEmblemEl = document.getElementById('age-civ-emblem');
      if (ageTitleEl && ageSubtitleEl && ageEmblemEl) {
        const playerState = this.gameManager.players[0];
        const ageMap = { dark: 'Zaman Gelap', feudal: 'Zaman Feodal', castle: 'Zaman Kastil', imperial: 'Zaman Imperial' };
        const civ = CIVILIZATIONS[playerState.civ] || { name: 'Inggris', icon: '🏰' };
        ageTitleEl.textContent = ageMap[playerState.age] || 'Zaman Gelap';
        ageSubtitleEl.textContent = civ.name;
        ageEmblemEl.textContent = civ.icon;
      }
    }
    
    // Throttle minimap rendering to 15 FPS for performance
    if (now - this.lastMinimapUpdate > 66) {
      this.lastMinimapUpdate = now;
      this.renderMinimap();
    }
  }

  renderMinimap() {
    if (!this.minimapCtx || !this.gameManager.terrain) return;
    
    const size = 130;
    const ctx = this.minimapCtx;
    const mapSize = this.gameManager.terrain.mapSize;
    
    // Clear and draw background grass
    ctx.fillStyle = '#2d5a27'; // Dark green grass
    ctx.fillRect(0, 0, size, size);
    
    // Coordinate scaler function (world bounds [-mapSize/2, mapSize/2] -> [0, size])
    const scale = (val) => {
      const offset = val + mapSize / 2;
      return (offset / mapSize) * size;
    };
    
    // Draw resources
    const resources = this.gameManager.entityManager.resources;
    resources.forEach(node => {
      const rx = scale(node.position.x);
      const rz = scale(node.position.z);
      
      if (node.type === 'wood') ctx.fillStyle = '#1e3c15';
      else if (node.type === 'gold') ctx.fillStyle = '#ffd700';
      else ctx.fillStyle = '#656565';
      
      ctx.fillRect(rx - 1, rz - 1, 2, 2);
    });

    // Draw buildings
    const buildings = this.gameManager.entityManager.buildings;
    buildings.forEach(b => {
      const bx = scale(b.position.x);
      const bz = scale(b.position.z);
      const bSize = Math.max(3, b.gridSize * 1.5);
      
      ctx.fillStyle = b.playerId === 0 ? '#1a5fb4' : '#c01c28';
      ctx.fillRect(bx - bSize / 2, bz - bSize / 2, bSize, bSize);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(bx - bSize / 2, bz - bSize / 2, bSize, bSize);
    });

    // Draw units
    const units = this.gameManager.entityManager.units;
    units.forEach(u => {
      const ux = scale(u.position.x);
      const uz = scale(u.position.z);
      
      ctx.beginPath();
      ctx.arc(ux, uz, ['swordsman', 'archer', 'knight', 'footKnight', 'heavyCavalry', 'horseArcher'].includes(u.type) ? 2 : 1.5, 0, Math.PI * 2);
      ctx.fillStyle = u.playerId === 0 ? '#4fa3ff' : '#ff4f4f';
      ctx.fill();
    });

    // Draw Camera Viewport Trapezoid
    this.drawMinimapCameraFrustum(ctx, scale);
  }

  drawMinimapCameraFrustum(ctx, scale) {
    const renderer = this.gameManager.renderer;
    const camera = renderer.camera;
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // Ground plane
    
    // Screen corners in NDC
    const cornersNDC = [
      new THREE.Vector2(-1, -1),
      new THREE.Vector2(1, -1),
      new THREE.Vector2(1, 1),
      new THREE.Vector2(-1, 1)
    ];
    
    const groundPoints = [];
    
    cornersNDC.forEach(ndc => {
      raycaster.setFromCamera(ndc, camera);
      const intersectPoint = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(plane, intersectPoint)) {
        groundPoints.push(intersectPoint);
      }
    });
    
    if (groundPoints.length === 4) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      
      ctx.moveTo(scale(groundPoints[0].x), scale(groundPoints[0].z));
      for (let i = 1; i < 4; i++) {
        ctx.lineTo(scale(groundPoints[i].x), scale(groundPoints[i].z));
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  // -------------------------------------------------------------
  // GAME OVER OVERLAYS
  // -------------------------------------------------------------
  showGameOverScreen(isVictory) {
    const overlay = document.getElementById('gameover-overlay');
    const title = document.getElementById('gameover-title');
    const desc = document.getElementById('gameover-desc');
    if (!overlay || !title || !desc) return;
    
    title.textContent = isVictory ? 'VICTORY!' : 'DEFEAT!';
    title.style.color = isVictory ? '#4caf50' : '#f44336';
    desc.textContent = isVictory 
      ? 'You have destroyed the Red Empire and built a glorious kingdom!' 
      : 'Your Town Center has fallen. The enemy forces have triumphed.';
      
    overlay.style.display = 'flex';
  }

  hideGameOverScreen() {
    const overlay = document.getElementById('gameover-overlay');
    if (overlay) overlay.style.display = 'none';
  }
}
