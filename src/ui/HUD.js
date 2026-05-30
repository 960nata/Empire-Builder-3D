import * as THREE from 'three';

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
        <div class="hud-logo">EMPIRE BUILDER 3D</div>
        <div class="resource-group">
          <div class="resource-item" title="Food (needed to train units)">
            <span class="icon">🍎</span>
            <span id="res-food" class="value">150</span>
          </div>
          <div class="resource-item" title="Wood (needed for houses and barracks)">
            <span class="icon">🪓</span>
            <span id="res-wood" class="value">200</span>
          </div>
          <div class="resource-item" title="Gold (needed to train soldiers)">
            <span class="icon">🪙</span>
            <span id="res-gold" class="value">100</span>
          </div>
          <div class="resource-item" title="Stone (needed for barracks)">
            <span class="icon">🪨</span>
            <span id="res-stone" class="value">50</span>
          </div>
          <div class="resource-item" title="Population (cap increased by building houses)">
            <span class="icon">👥</span>
            <span id="res-pop" class="value">0/10</span>
          </div>
        </div>
        
        <div class="top-controls">
          <button id="btn-mute" class="hud-btn small-btn" title="Toggle Sound">🔊 Sound</button>
          <button id="btn-restart" class="hud-btn small-btn warning-btn">Restart</button>
        </div>
      </div>

      <!-- FLOATING NOTIFICATION BOX -->
      <div id="notification-box"></div>

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
      <div class="hud-bottom-panel">
        <!-- LEFT: SELECTION PANEL -->
        <div class="selection-panel ui-element" id="selection-panel">
          <div class="empty-selection-msg">No units or buildings selected.<br><small>Left-click or drag-select to command units.</small></div>
        </div>

        <!-- RIGHT: MINIMAP & HELP -->
        <div class="minimap-container ui-element">
          <canvas id="minimap-canvas" width="130" height="130"></canvas>
          <div class="camera-info">WASD / Arrow Keys: Pan | Right-Click Drag: Rotate | Scroll: Zoom</div>
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
    const selectionPanel = document.getElementById('selection-panel');
    const selected = this.gameManager.selectedEntities;

    if (selected.length === 0) {
      selectionPanel.innerHTML = `
        <div class="empty-selection-msg">No units or buildings selected.<br><small>Left-click or drag-select to command units.</small></div>
      `;
      return;
    }

    if (selected.length === 1) {
      const entity = selected[0];
      
      if (entity.type === 'villager' && entity.playerId === 0) {
        // Villager details & build action buttons
        selectionPanel.innerHTML = `
          <div class="selection-card">
            <div class="entity-info">
              <span class="entity-avatar">🧑🌾</span>
              <div>
                <div class="entity-name">Villager (Player)</div>
                <div class="entity-hp">HP: ${entity.hp}/${entity.maxHp}</div>
                <div class="entity-cargo">Carrying: ${entity.inventory.amount}/${entity.inventory.max} ${entity.inventory.type ? entity.inventory.type.toUpperCase() : 'None'}</div>
              </div>
            </div>
            <div class="action-grid">
              <button class="action-btn" id="btn-build-house" title="Build House (50 Wood) - Increases pop capacity">🏠 House (50W)</button>
              <button class="action-btn" id="btn-build-barracks" title="Build Barracks (120 Wood, 50 Stone) - Spawns army">⚔️ Barracks (120W, 50S)</button>
              <button class="action-btn" id="btn-build-temple" title="Build Temple (120 Wood, 100 Gold) - Trains Priest">⛪ Temple (120W, 100G)</button>
              <button class="action-btn" id="btn-build-market" title="Build Market (100 Wood) - Trains Trader">🛒 Market (100W)</button>
            </div>
          </div>
        `;
        
        // Bind build triggers
        document.getElementById('btn-build-house').addEventListener('click', () => {
          this.gameManager.input.startBuildPlacement('house');
          this.showNotification("Left-click on the map to place House. Right-click to cancel.");
        });
        document.getElementById('btn-build-barracks').addEventListener('click', () => {
          this.gameManager.input.startBuildPlacement('barracks');
          this.showNotification("Left-click on the map to place Barracks. Right-click to cancel.");
        });
        document.getElementById('btn-build-temple').addEventListener('click', () => {
          this.gameManager.input.startBuildPlacement('temple');
          this.showNotification("Left-click on the map to place Temple. Right-click to cancel.");
        });
        document.getElementById('btn-build-market').addEventListener('click', () => {
          this.gameManager.input.startBuildPlacement('market');
          this.showNotification("Left-click on the map to place Market. Right-click to cancel.");
        });
      } 
      else if (entity.type === 'swordsman') {
        selectionPanel.innerHTML = `
          <div class="selection-card">
            <div class="entity-info">
              <span class="entity-avatar">🛡️</span>
              <div>
                <div class="entity-name">Swordsman (${entity.playerId === 0 ? 'Player' : 'Enemy'})</div>
                <div class="entity-hp">HP: ${entity.hp}/${entity.maxHp}</div>
                <div class="entity-status">Status: ${entity.state}</div>
              </div>
            </div>
          </div>
        `;
      } 
      else if (entity.type === 'priest') {
        selectionPanel.innerHTML = `
          <div class="selection-card">
            <div class="entity-info">
              <span class="entity-avatar">🧙</span>
              <div>
                <div class="entity-name">Priest (${entity.playerId === 0 ? 'Player' : 'Enemy'})</div>
                <div class="entity-hp">HP: ${entity.hp}/${entity.maxHp}</div>
                <div class="entity-status">Status: ${entity.state}</div>
                ${entity.conversionCooldown > 0 ? `<div class="entity-cooldown" style="color:#ff8888">Faith recharge: ${Math.ceil(entity.conversionCooldown)}s</div>` : ''}
              </div>
            </div>
          </div>
        `;
      }
      else if (entity.type === 'trader') {
        selectionPanel.innerHTML = `
          <div class="selection-card">
            <div class="entity-info">
              <span class="entity-avatar">🐪</span>
              <div>
                <div class="entity-name">Trader (${entity.playerId === 0 ? 'Player' : 'Enemy'})</div>
                <div class="entity-hp">HP: ${entity.hp}/${entity.maxHp}</div>
                <div class="entity-status">Status: ${entity.state}</div>
              </div>
            </div>
          </div>
        `;
      }
      else if (entity.type === 'townCenter') {
        const queueHtml = entity.queue.length > 0 
          ? `<div class="queue-list">Training: ${entity.queue.length} in queue<br><div class="bar-outer"><div id="queue-bar" class="bar-inner" style="width:0%"></div></div></div>`
          : '<div class="queue-list">No training active.</div>';

        const playerState = this.gameManager.players[0];
        const currentAge = playerState.age;
        let ageUpBtnHtml = "";
        if (currentAge === 'dark') {
          ageUpBtnHtml = `<button class="action-btn" id="btn-age-up" title="Advance to Feudal Age (500 Food)">🏰 Zaman Feodal (500F)</button>`;
        } else if (currentAge === 'feudal') {
          ageUpBtnHtml = `<button class="action-btn" id="btn-age-up" title="Advance to Castle Age (800 Food, 200 Gold)">🏰 Zaman Kastil (800F, 200G)</button>`;
        } else if (currentAge === 'castle') {
          ageUpBtnHtml = `<button class="action-btn" id="btn-age-up" title="Advance to Imperial Age (1000 Food, 800 Gold)">🏰 Zaman Imperial (1000F, 800G)</button>`;
        }

        selectionPanel.innerHTML = `
          <div class="selection-card">
            <div class="entity-info">
              <span class="entity-avatar">🏛️</span>
              <div>
                <div class="entity-name">Town Center (${entity.playerId === 0 ? 'Player' : 'Enemy'})</div>
                <div class="entity-hp">HP: ${entity.hp}/${entity.maxHp}</div>
                ${entity.playerId === 0 ? queueHtml : ''}
              </div>
            </div>
            ${entity.playerId === 0 && entity.isCompleted ? `
              <div class="action-grid">
                <button class="action-btn" id="btn-train-villager" title="Train Villager (50 Food)">🧑🌾 Train Villager (50F)</button>
                ${ageUpBtnHtml}
              </div>
            ` : ''}
          </div>
        `;

        if (entity.playerId === 0 && entity.isCompleted) {
          document.getElementById('btn-train-villager').addEventListener('click', () => {
            entity.queueUnit('villager');
          });
          const ageUpBtn = document.getElementById('btn-age-up');
          if (ageUpBtn) {
            ageUpBtn.addEventListener('click', () => {
              this.gameManager.upgradePlayerAge(0);
              // Update selection UI to refresh button
              setTimeout(() => this.updateSelectionUI(), 100);
            });
          }
        }
      } 
      else if (entity.type === 'barracks') {
        const queueHtml = entity.queue.length > 0 
          ? `<div class="queue-list">Training: ${entity.queue.length} in queue<br><div class="bar-outer"><div id="queue-bar" class="bar-inner" style="width:0%"></div></div></div>`
          : '<div class="queue-list">No training active.</div>';

        selectionPanel.innerHTML = `
          <div class="selection-card">
            <div class="entity-info">
              <span class="entity-avatar">⚔️</span>
              <div>
                <div class="entity-name">Barracks (${entity.playerId === 0 ? 'Player' : 'Enemy'})</div>
                <div class="entity-hp">HP: ${entity.hp}/${entity.maxHp}</div>
                ${entity.playerId === 0 ? queueHtml : ''}
              </div>
            </div>
            ${entity.playerId === 0 && entity.isCompleted ? `
              <div class="action-grid">
                <button class="action-btn" id="btn-train-swordsman" title="Train Swordsman (60 Food, 20 Gold)">🛡️ Swordsman (60F, 20G)</button>
              </div>
            ` : ''}
          </div>
        `;

        if (entity.playerId === 0 && entity.isCompleted) {
          document.getElementById('btn-train-swordsman').addEventListener('click', () => {
            entity.queueUnit('swordsman');
          });
        }
      }
      else if (entity.type === 'temple') {
        const queueHtml = entity.queue.length > 0 
          ? `<div class="queue-list">Training: ${entity.queue.length} in queue<br><div class="bar-outer"><div id="queue-bar" class="bar-inner" style="width:0%"></div></div></div>`
          : '<div class="queue-list">No training active.</div>';

        selectionPanel.innerHTML = `
          <div class="selection-card">
            <div class="entity-info">
              <span class="entity-avatar">⛪</span>
              <div>
                <div class="entity-name">Temple (${entity.playerId === 0 ? 'Player' : 'Enemy'})</div>
                <div class="entity-hp">HP: ${entity.hp}/${entity.maxHp}</div>
                ${entity.playerId === 0 ? queueHtml : ''}
              </div>
            </div>
            ${entity.playerId === 0 && entity.isCompleted ? `
              <div class="action-grid">
                <button class="action-btn" id="btn-train-priest" title="Train Priest (100 Gold)">🧙 Train Priest (100G)</button>
              </div>
            ` : ''}
          </div>
        `;

        if (entity.playerId === 0 && entity.isCompleted) {
          document.getElementById('btn-train-priest').addEventListener('click', () => {
            entity.queueUnit('priest');
          });
        }
      }
      else if (entity.type === 'market') {
        const queueHtml = entity.queue.length > 0 
          ? `<div class="queue-list">Training: ${entity.queue.length} in queue<br><div class="bar-outer"><div id="queue-bar" class="bar-inner" style="width:0%"></div></div></div>`
          : '<div class="queue-list">No training active.</div>';

        selectionPanel.innerHTML = `
          <div class="selection-card">
            <div class="entity-info">
              <span class="entity-avatar">🛒</span>
              <div>
                <div class="entity-name">Market (${entity.playerId === 0 ? 'Player' : 'Enemy'})</div>
                <div class="entity-hp">HP: ${entity.hp}/${entity.maxHp}</div>
                ${entity.playerId === 0 ? queueHtml : ''}
              </div>
            </div>
            ${entity.playerId === 0 && entity.isCompleted ? `
              <div class="action-grid">
                <button class="action-btn" id="btn-train-trader" title="Train Trader (60 Wood, 60 Gold)">🐪 Train Trader (60W, 60G)</button>
              </div>
            ` : ''}
          </div>
        `;

        if (entity.playerId === 0 && entity.isCompleted) {
          document.getElementById('btn-train-trader').addEventListener('click', () => {
            entity.queueUnit('trader');
          });
        }
      }
      else if (entity.type === 'resource') {
        selectionPanel.innerHTML = `
          <div class="selection-card">
            <div class="entity-info">
              <span class="entity-avatar">${entity.type === 'wood' ? '🌲' : entity.type === 'gold' ? '🪙' : '🪨'}</span>
              <div>
                <div class="entity-name">${entity.type.toUpperCase()} deposit</div>
                <div class="entity-cargo">Amount remaining: ${entity.amount}/${entity.maxAmount}</div>
              </div>
            </div>
          </div>
        `;
      }
    } 
    else {
      // Multiple units selected
      const villagers = selected.filter(e => e.type === 'villager').length;
      const soldiers = selected.filter(e => e.type === 'swordsman').length;
      const priests = selected.filter(e => e.type === 'priest').length;
      const traders = selected.filter(e => e.type === 'trader').length;
      
      selectionPanel.innerHTML = `
        <div class="selection-card">
          <div class="entity-info">
            <span class="entity-avatar">👥</span>
            <div>
              <div class="entity-name">Multiple Units Selected</div>
              <div class="entity-hp">Total: ${selected.length} units</div>
              <div class="entity-details">Villagers: ${villagers} | Swordsmen: ${soldiers} | Priests: ${priests} | Traders: ${traders}</div>
            </div>
          </div>
        </div>
      `;
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
  showNotification(text) {
    const box = document.getElementById('notification-box');
    const el = document.createElement('div');
    el.className = 'notification-item glassmorphism';
    el.textContent = text;
    
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
      ctx.arc(ux, uz, u.type === 'swordsman' ? 2 : 1.5, 0, Math.PI * 2);
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
    
    title.textContent = isVictory ? 'VICTORY!' : 'DEFEAT!';
    title.style.color = isVictory ? '#4caf50' : '#f44336';
    desc.textContent = isVictory 
      ? 'You have destroyed the Red Empire and built a glorious kingdom!' 
      : 'Your Town Center has fallen. The enemy forces have triumphed.';
      
    overlay.style.display = 'flex';
  }

  hideGameOverScreen() {
    document.getElementById('gameover-overlay').style.display = 'none';
  }
}
