const fs = require('fs');
const content = fs.readFileSync('src/services/db.ts', 'utf8');

const newExports = `

// --- BRAIN GAMES POINTS SYSTEM ---

export interface GameResult {
  id?: string;
  user_id: string;
  game_id: string;
  difficulty?: string;
  score?: number;
  points_earned: number;
  content_id?: string;
  accuracy?: number;
  completion_status?: boolean;
  played_at?: string;
}

export interface UserPoints {
  user_id: string;
  total_points: number;
  current_level: string;
  games_completed: number;
  daily_streak: number;
  last_played_at?: string;
}

export const saveGameResult = async (result: GameResult) => {
  try {
    const { data, error } = await supabase.from('game_results').insert([result]);
    if (error) throw error;
    
    // Update user points
    await updateUserPoints(result.user_id, result.points_earned);
    
    return data;
  } catch (error) {
    console.error("Save game result error:", error);
  }
};

export const fetchUserPoints = async (userId: string) => {
  try {
    const { data, error } = await supabase.from('user_points').select('*').eq('user_id', userId).single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows returned
    
    if (!data) {
       // Initialize if not exists
       const initial: UserPoints = {
         user_id: userId,
         total_points: 0,
         current_level: 'Bronze',
         games_completed: 0,
         daily_streak: 0,
       };
       await supabase.from('user_points').insert([initial]);
       return initial;
    }
    
    return data as UserPoints;
  } catch (error) {
    console.error("Fetch user points error:", error);
    return null;
  }
};

export const updateUserPoints = async (userId: string, pointsToAdd: number) => {
  try {
    const current = await fetchUserPoints(userId);
    if (!current) return;
    
    const newTotal = current.total_points + pointsToAdd;
    let newLevel = current.current_level;
    
    if (newTotal >= 1000) newLevel = 'Platinum';
    else if (newTotal >= 500) newLevel = 'Gold';
    else if (newTotal >= 200) newLevel = 'Silver';
    else newLevel = 'Bronze';
    
    // Simple streak logic (could be improved with real dates)
    let newStreak = current.daily_streak;
    const now = new Date();
    if (current.last_played_at) {
       const lastPlayed = new Date(current.last_played_at);
       const diffTime = Math.abs(now.getTime() - lastPlayed.getTime());
       const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
       
       if (diffDays === 1) {
         newStreak += 1;
       } else if (diffDays > 1) {
         newStreak = 1;
       }
    } else {
       newStreak = 1;
    }
    
    const updates = {
      total_points: newTotal,
      current_level: newLevel,
      games_completed: current.games_completed + 1,
      daily_streak: newStreak,
      last_played_at: now.toISOString(),
    };
    
    await supabase.from('user_points').update(updates).eq('user_id', userId);
  } catch (error) {
    console.error("Update user points error:", error);
  }
};

export const fetchRecentGameResults = async (userId: string) => {
  try {
    const { data, error } = await supabase.from('game_results').select('*').eq('user_id', userId).order('played_at', { ascending: false }).limit(5);
    if (error) throw error;
    return data as GameResult[];
  } catch (error) {
    console.error("Fetch game results error:", error);
    return [];
  }
};
`;

fs.writeFileSync('src/services/db.ts', content + newExports);
