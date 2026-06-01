export const SVGIcons = {
  // --- RESOURCES (COLORED) ---
  food: `<svg viewBox="0 0 24 24" class="svg-icon-res"><path d="M12 22c4.5 0 8-3.5 8-8 0-3.5-2.5-5-4-5-1.2 0-2.5.6-3.5 1.4C11.5 9.6 10.2 9 9 9c-1.5 0-4 1.5-4 5 0 4.5 3.5 8 8 8z" fill="#f87171" stroke="#ef4444" stroke-width="1.5"/><path d="M12 9V5c0-1.5 1-2.5 2-2.5" stroke="#4ade80" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`,
  wood: `<svg viewBox="0 0 24 24" class="svg-icon-res"><path d="M3 10h18v4H3z" fill="#b45309" stroke="#78350f" stroke-width="1.5" rx="1"/><path d="M6 4h12v4H6z" fill="#d97706" stroke="#78350f" stroke-width="1.5" rx="1"/><path d="M8 16h8v4H8z" fill="#92400e" stroke="#78350f" stroke-width="1.5" rx="1"/></svg>`,
  gold: `<svg viewBox="0 0 24 24" class="svg-icon-res"><circle cx="12" cy="12" r="9" fill="#fbbf24" stroke="#d97706" stroke-width="1.5"/><circle cx="12" cy="12" r="5" fill="none" stroke="#d97706" stroke-width="1.5"/><path d="M12 7v10M10 9h4M10 15h4" stroke="#d97706" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  stone: `<svg viewBox="0 0 24 24" class="svg-icon-res"><path d="M12 3L2 12h5l3 9 4-7 8 2z" fill="#9ca3af" stroke="#4b5563" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/></svg>`,
  population: `<svg viewBox="0 0 24 24" class="svg-icon-res"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="none" stroke="#60a5fa" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="7" r="4" fill="none" stroke="#60a5fa" stroke-width="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="#60a5fa" stroke-width="2" stroke-linecap="round"/></svg>`,

  // --- BUILDINGS (MONOCHROME / STROKE) ---
  house: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  barracks: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5 3 6M10 21l-2-2M21 3l-8.5 8.5M19 10l-2-2M21 14.5l-11.5-11.5M14 3l-2 2M3 21l8.5-8.5M10 19l-2-2"/></svg>`,
  temple: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v6M9 5h6M4 22V10l8-5 8 5v12H4z"/><path d="M9 22v-6a3 3 0 0 1 6 0v6"/></svg>`,
  market: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`,
  dock: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="8" x2="12" y2="22"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><circle cx="12" cy="12" r="1"/></svg>`,
  farm: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22c1.25-3.33 3.5-5.5 6.5-6.5M22 22c-1.25-3.33-3.5-5.5-6.5-6.5M12 22V10M12 10C9.5 7.5 8 5 8 2M12 10c2.5-2.5 4-5 4-8"/></svg>`,
  mill: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20M12 12l7-7M12 12l-7 7M12 12l7 7M12 12l-7-7"/></svg>`,
  lumberCamp: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V12M12 12c-2.5 0-4.5-2-4.5-4.5S9.5 3 12 3s4.5 2 4.5 4.5S14.5 12 12 12z"/></svg>`,
  lumbercamp: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22V12M12 12c-2.5 0-4.5-2-4.5-4.5S9.5 3 12 3s4.5 2 4.5 4.5S14.5 12 12 12z"/></svg>`,
  miningCamp: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5 6-2v6l-6 2M19 3 5 17M10 8l-6 6M4 20h2v2H4z"/></svg>`,
  miningcamp: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5 6-2v6l-6 2M19 3 5 17M10 8l-6 6M4 20h2v2H4z"/></svg>`,
  palisadeWall: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V3M8 21V3M13 21V3M18 21V3M21 21V3M3 10h18M3 16h18"/></svg>`,
  palisadewall: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V3M8 21V3M13 21V3M18 21V3M21 21V3M3 10h18M3 16h18"/></svg>`,
  palisadeGate: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V3M21 21V3M3 5h18M3 19h18M8 5v14M16 5v14"/></svg>`,
  palisadegate: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V3M21 21V3M3 5h18M3 19h18M8 5v14M16 5v14"/></svg>`,
  watchTower: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V6l6-4 6 4v16M4 22h16M8 8h8M8 12h8M10 16h4"/></svg>`,
  watchtower: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V6l6-4 6 4v16M4 22h16M8 8h8M8 12h8M10 16h4"/></svg>`,
  stoneWall: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 9v6M15 9v6M12 15v6M6 15v6M18 15v6M12 3v6M6 3v6M18 3v6"/></svg>`,
  stonewall: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 9v6M15 9v6M12 15v6M6 15v6M18 15v6M12 3v6M6 3v6M18 3v6"/></svg>`,
  stoneGate: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 20v-8H2v8M6 12V4h12v8M10 20v-5a2 2 0 0 1 4 0v5"/></svg>`,
  stonegate: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 20v-8H2v8M6 12V4h12v8M10 20v-5a2 2 0 0 1 4 0v5"/></svg>`,
  townCenter: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 20v-8H2v8M6 12V4h12v8M10 20v-5a2 2 0 0 1 4 0v5"/></svg>`,
  towncenter: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 20v-8H2v8M6 12V4h12v8M10 20v-5a2 2 0 0 1 4 0v5"/></svg>`,

  // --- UNITS (MONOCHROME / STROKE) ---
  villager: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="4"/><path d="M12 14c-4 0-7 2-7 6v2h14v-2c0-4-3-6-7-6zM6 6c0-2 2-3 6-3s6 1 6 3"/></svg>`,
  swordsman: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  archer: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3c0 0 12 1 12 9s-12 9-12 9M18 12H3M7 8l-4 4 4 4"/></svg>`,
  footKnight: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM12 6v10M8 10h8"/></svg>`,
  footknight: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM12 6v10M8 10h8"/></svg>`,
  knight: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13c1 0 4-2 6-4s3-4 6-4 4 2 5 4-1 6-3 7-5 1-8 0-4-3-6-3zM10 9v9M15 8v10"/></svg>`,
  heavyCavalry: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13c1 0 4-2 6-4s3-4 6-4 4 2 5 4-1 6-3 7-5 1-8 0-4-3-6-3zM10 9v9M15 8v10M19 8l2-2"/></svg>`,
  heavycavalry: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13c1 0 4-2 6-4s3-4 6-4 4 2 5 4-1 6-3 7-5 1-8 0-4-3-6-3zM10 9v9M15 8v10M19 8l2-2"/></svg>`,
  horseArcher: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13c1 0 4-2 6-4s3-4 6-4 4 2 5 4-1 6-3 7-5 1-8 0-4-3-6-3zM6 3c0 0 12 1 12 9s-12 9-12 9"/></svg>`,
  horsearcher: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13c1 0 4-2 6-4s3-4 6-4 4 2 5 4-1 6-3 7-5 1-8 0-4-3-6-3zM6 3c0 0 12 1 12 9s-12 9-12 9"/></svg>`,
  priest: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M5 12h14M12 7H9M12 17h3"/></svg>`,
  trader: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 16V8h12v8M3 21h18M6 8V5c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v3M9 12h6M12 8v8"/></svg>`,
  fishingShip: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 18H2l3 4h14zM12 2v16M12 6l6 6H12"/></svg>`,
  fishingship: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 18H2l3 4h14zM12 2v16M12 6l6 6H12"/></svg>`,
  sheep: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="6"/><path d="M8 8a2 2 0 0 0-4 0M16 8a2 2 0 0 1 4 0M6 15a3 3 0 0 0 6 0M12 15a3 3 0 0 0 6 0"/></svg>`,

  // --- CIVILIZATIONS (STYLIZED VECTOR) ---
  inggris: `<svg viewBox="0 0 24 24" class="svg-icon-civ" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 20v-8H2v8M6 12V4h12v8M10 20v-5a2 2 0 0 1 4 0v5"/></svg>`,
  prancis: `<svg viewBox="0 0 24 24" class="svg-icon-civ" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5 3 6M10 21l-2-2M21 3l-8.5 8.5M19 10l-2-2M21 14.5l-11.5-11.5M14 3l-2 2M3 21l8.5-8.5M10 19l-2-2"/></svg>`,
  mongol: `<svg viewBox="0 0 24 24" class="svg-icon-civ" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13c1 0 4-2 6-4s3-4 6-4 4 2 5 4-1 6-3 7-5 1-8 0-4-3-6-3zM10 9v9M15 8v10"/></svg>`,
  jepang: `<svg viewBox="0 0 24 24" class="svg-icon-civ" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h20M4 9h16M6 6v15M18 6v15"/></svg>`,
  tiongkok: `<svg viewBox="0 0 24 24" class="svg-icon-civ" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 9h20L12 2zM4 9v6h16V9M12 15v7M2 19h20"/></svg>`,
  saracen: `<svg viewBox="0 0 24 24" class="svg-icon-civ" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 7 7 0 0 1-10-10z"/></svg>`,
  spanyol: `<svg viewBox="0 0 24 24" class="svg-icon-civ" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM12 6v10M8 10h8"/></svg>`,
  viking: `<svg viewBox="0 0 24 24" class="svg-icon-civ" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c4 4 16 4 20 0M12 3v13M8 6l4-3 4 3"/></svg>`,
  bizantium: `<svg viewBox="0 0 24 24" class="svg-icon-civ" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M5 12h14M8 8l8 8M8 16l8-8"/></svg>`,
  persia: `<svg viewBox="0 0 24 24" class="svg-icon-civ" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/></svg>`,
  aztec: `<svg viewBox="0 0 24 24" class="svg-icon-civ" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22h20M4 17h16M6 12h12M8 7h8M10 2h4"/></svg>`,
  maya: `<svg viewBox="0 0 24 24" class="svg-icon-civ" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3c0 0 12 1 12 9s-12 9-12 9M18 12H3M10 6L7 3M11 9L8 6"/></svg>`,
  hun: `<svg viewBox="0 0 24 24" class="svg-icon-civ" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3L2 19h20zM12 19v-6"/></svg>`,
  turki: `<svg viewBox="0 0 24 24" class="svg-icon-civ" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="13" r="8"/><path d="M18.5 5.5L21 3M16 3h5v5"/></svg>`,
  kelt: `<svg viewBox="0 0 24 24" class="svg-icon-civ" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-6M12 12a4 4 0 1 0-4-4 4 4 0 1 0 8 0 4 4 0 1 0-4 4z"/></svg>`,
  goth: `<svg viewBox="0 0 24 24" class="svg-icon-civ" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM4 10h16M12 2v20"/></svg>`,
  teuton: `<svg viewBox="0 0 24 24" class="svg-icon-civ" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20M7 7h10v10H7z"/></svg>`,
  roma: `<svg viewBox="0 0 24 24" class="svg-icon-civ" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10a8 8 0 0 0 16 0M12 2v10M8 5l4-3 4 3"/></svg>`,
  blacksmith: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8c1-1.5 3-2 5-2h8c2 0 4 .5 5 2a3 3 0 0 1 1 2v4a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-4c0-.7.3-1.4 1-2z"/><path d="M8 17v3M16 17v3M4 20h16M7 11h10"/></svg>`,
  castle: `<svg viewBox="0 0 24 24" class="svg-icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22V8l3-3 3 3v14M20 22V8l-3-3-3 3v14M10 8h4M8 12h8M10 22v-5a2 2 0 0 1 4 0v5"/></svg>`,
  
  // Custom utility function to get custom icons
  getIcon(name, customClass = '') {
    let raw = this[name] || this.house;
    if (customClass) {
      raw = raw.replace('class="', `class="${customClass} `);
    }
    return raw;
  }
};
