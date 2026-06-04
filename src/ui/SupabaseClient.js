import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const DEFAULT_URL = "https://noareegenxaomkiypktg.supabase.co";

class SupabaseService {
  constructor() {
    this.url = localStorage.getItem('supabase_url') || DEFAULT_URL;
    this.anonKey = localStorage.getItem('supabase_anon_key') || "";
    this.client = null;
    this.useMock = true;

    if (this.url && this.anonKey) {
      try {
        this.client = createClient(this.url, this.anonKey);
        this.useMock = false;
        console.log("Supabase client initialized successfully with project URL.");
      } catch (err) {
        console.warn("Supabase init failed, falling back to LocalStorage Mock database:", err);
      }
    }
  }

  setCredentials(url, anonKey) {
    this.url = url || DEFAULT_URL;
    this.anonKey = anonKey;
    localStorage.setItem('supabase_url', this.url);
    localStorage.setItem('supabase_anon_key', this.anonKey);
    try {
      this.client = createClient(this.url, this.anonKey);
      this.useMock = false;
      console.log("Credentials configured successfully. Supabase cloud connected!");
      return true;
    } catch (err) {
      console.error("Invalid credentials:", err);
      this.useMock = true;
      return false;
    }
  }

  // --- Auth APIs ---
  async signUp(email, password, username) {
    if (this.useMock) {
      const users = JSON.parse(localStorage.getItem('mock_users') || '{}');
      if (users[email]) throw new Error("Email sudah terdaftar!");
      users[email] = { email, username, password, wins: 0, losses: 0, rank: 1000 };
      localStorage.setItem('mock_users', JSON.stringify(users));
      const userObj = { email, user_metadata: { username } };
      localStorage.setItem('mock_current_user', JSON.stringify(userObj));
      return { data: { user: userObj } };
    }

    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });
    if (error) throw error;
    
    // Create user profile record in public profiles table
    try {
      await this.client.from('profiles').insert({
        id: data.user.id,
        username,
        wins: 0,
        losses: 0,
        rank: 1000
      });
    } catch (e) {
      console.warn("Could not insert profile into DB, table might not exist:", e);
    }
    return data;
  }

  async signIn(email, password) {
    if (this.useMock) {
      const users = JSON.parse(localStorage.getItem('mock_users') || '{}');
      const user = users[email];
      if (!user || user.password !== password) throw new Error("Email atau password salah!");
      const userObj = { email, user_metadata: { username: user.username } };
      localStorage.setItem('mock_current_user', JSON.stringify(userObj));
      return { data: { user: userObj } };
    }

    const { data, error } = await this.client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async getCurrentUser() {
    if (this.useMock) {
      const userStr = localStorage.getItem('mock_current_user');
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      const users = JSON.parse(localStorage.getItem('mock_users') || '{}');
      const details = users[user.email] || { wins: 0, losses: 0, rank: 1000 };
      return { ...user, profile: { username: user.user_metadata?.username || user.email, ...details } };
    }

    const { data: { user } } = await this.client.auth.getUser();
    if (!user) return null;

    // Fetch details from profiles table
    let profile = { username: user.user_metadata?.username || user.email, wins: 0, losses: 0, rank: 1000 };
    try {
      const { data, error } = await this.client.from('profiles').select('*').eq('id', user.id).single();
      if (data && !error) profile = data;
    } catch (e) {}
    return { ...user, profile };
  }

  async signOut() {
    if (this.useMock) {
      localStorage.removeItem('mock_current_user');
      return;
    }
    await this.client.auth.signOut();
  }

  // --- Matchmaking & Real-time Lobby room ---
  async joinQueue(mode, playerProfile) {
    if (this.useMock) {
      const lobbyId = 'mock-' + mode + '-' + Math.random().toString(36).substr(2, 9);
      return {
        id: lobbyId,
        lobbyId,
        mode,
        status: 'waiting',
        players: [playerProfile]
      };
    }

    try {
      const maxPlayers = (mode === '1v1') ? 2 : 6;
      
      // Find a waiting lobby of same mode
      const { data: waitingLobbies } = await this.client
        .from('lobbies')
        .select('*')
        .eq('mode', mode)
        .eq('status', 'waiting')
        .limit(1);

      let targetLobby = null;

      if (waitingLobbies && waitingLobbies.length > 0) {
        targetLobby = waitingLobbies[0];
        targetLobby.players.push(playerProfile);
        if (targetLobby.players.length >= maxPlayers) {
          targetLobby.status = 'filled';
        }
        const { data } = await this.client.from('lobbies').update({
          players: targetLobby.players,
          status: targetLobby.status
        }).eq('id', targetLobby.id).select().single();
        targetLobby = data;
      } else {
        const { data } = await this.client.from('lobbies').insert({
          mode,
          status: 'waiting',
          players: [playerProfile]
        }).select().single();
        targetLobby = data;
      }

      return targetLobby;
    } catch (e) {
      console.warn("DB table access failed, running simulated matchmaking:", e);
      const lobbyId = 'simulated-' + mode + '-' + Math.random().toString(36).substr(2, 9);
      return {
        id: lobbyId,
        lobbyId,
        mode,
        status: 'waiting',
        players: [playerProfile]
      };
    }
  }

  pollLobby(lobbyId, onUpdate, onError) {
    if (this.useMock || lobbyId.startsWith('mock-') || lobbyId.startsWith('simulated-')) {
      let step = 0;
      const mode = lobbyId.includes('1v1') ? '1v1' : (lobbyId.includes('2v2v2') ? '2v2v2' : '3v3');
      const max = mode === '1v1' ? 2 : 6;
      
      const interval = setInterval(() => {
        step++;
        
        // Fetch current mock users list
        const currentUserStr = localStorage.getItem('mock_current_user');
        const currentUser = currentUserStr ? JSON.parse(currentUserStr) : { email: 'anda@domain.com', user_metadata: { username: 'Anda' } };
        const selfCiv = localStorage.getItem('selected_civ') || 'inggris';
        const selfProfile = { name: currentUser.user_metadata?.username || 'Anda', civ: selfCiv, team: 1 };
        
        const allOpponents = this.generateMockOpponents(mode, selfProfile);
        const currentCount = Math.min(1 + step, max);
        const players = allOpponents.slice(0, currentCount);
        const status = currentCount >= max ? 'filled' : 'waiting';
        
        onUpdate({
          id: lobbyId,
          lobbyId,
          mode,
          status,
          players
        });
        
        if (status === 'filled') {
          clearInterval(interval);
        }
      }, 1000);
      
      return () => clearInterval(interval);
    }
    
    const interval = setInterval(async () => {
      try {
        const { data, error } = await this.client
          .from('lobbies')
          .select('*')
          .eq('id', lobbyId)
          .single();
        if (error) throw error;
        onUpdate(data);
        if (data.status === 'filled') {
          clearInterval(interval);
        }
      } catch (e) {
        if (onError) onError(e);
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }

  generateMockOpponents(mode, selfProfile) {
    const defaultCivs = ['inggris', 'prancis', 'mongol', 'jepang', 'tiongkok', 'saracen', 'spanyol', 'viking', 'bizantium', 'persia', 'teuton'];
    const botNames = ['GajahMada_35', 'Lord_Kahn_Enemy', 'Kaiser_Karl', 'Sultan_Bayezid', 'El_Cid_66', 'JoanOfArc_11', 'RichardHeart', 'Saladin_RTS', 'Barbarossa', 'Genghis_Khan'];
    
    const selfCiv = selfProfile.civ || 'inggris';
    const list = [{ name: selfProfile.username || 'Anda', civ: selfCiv, team: 1 }];

    if (mode === '1v1') {
      list.push({
        name: botNames[Math.floor(Math.random() * botNames.length)],
        civ: defaultCivs[Math.floor(Math.random() * defaultCivs.length)],
        team: 2
      });
    } else if (mode === '3v3') {
      // Team 1: Player 0 (You), Player 2 (bot), Player 4 (bot)
      list.push({ name: 'GajahMada_35', civ: 'jepang', team: 1 });
      list.push({ name: 'Sultan_Bayezid', civ: 'saracen', team: 1 });

      // Team 2: Player 1 (bot), Player 3 (bot), Player 5 (bot)
      list.push({ name: 'Lord_Kahn_Enemy', civ: 'mongol', team: 2 });
      list.push({ name: 'Kaiser_Karl', civ: 'teuton', team: 2 });
      list.push({ name: 'El_Cid_66', civ: 'spanyol', team: 2 });
    } else if (mode === '2v2v2') {
      // Team 1: Player 0 & Player 4
      list.push({ name: 'Sultan_Bayezid', civ: 'saracen', team: 1 });
      
      // Team 2: Player 1 & Player 5
      list.push({ name: 'Lord_Kahn_Enemy', civ: 'mongol', team: 2 });
      list.push({ name: 'El_Cid_66', civ: 'spanyol', team: 2 });
      
      // Team 3: Player 2 & Player 3
      list.push({ name: 'GajahMada_35', civ: 'jepang', team: 3 });
      list.push({ name: 'Kaiser_Karl', civ: 'teuton', team: 3 });
    }
    return list;
  }
}

export const Supabase = new SupabaseService();
