import fs from 'fs';
let code = fs.readFileSync('src/services/db.ts', 'utf8');

const newProfileFns = `
export const subscribeToUserProfile = (userId: string, callback: (profile: ElderlyProfile | null) => void) => {
  // Use Supabase to get the profile
  let isMounted = true;
  
  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("Supabase Profile Error:", error);
        callback(null);
        return;
      }
      
      if (data && isMounted) {
        callback({
          id: data.id,
          name: data.full_name || '',
          phone: data.phone || '',
          age: data.age?.toString() || '',
          gender: data.gender || '',
          bloodGroup: data.blood_group || '',
          basicHealthInfo: data.health_info || '',
          passionsLifestyle: data.lifestyle || '',
          caretakers: [],
          isRegistered: true,
          ...data
        } as unknown as ElderlyProfile);
      } else {
        callback(null);
      }
    } catch (err) {
      console.error(err);
      callback(null);
    }
  };
  
  fetchProfile();
  
  // Minimal fallback unsubscribe since we are just doing a one-off fetch for simplicity here,
  // real realtime would use supabase.channel
  return () => { isMounted = false; };
};

export const saveUserProfile = async (userId: string, profile: Partial<ElderlyProfile>) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.name,
        phone: profile.phone,
        age: parseInt(profile.age || '0'),
        gender: profile.gender,
        blood_group: profile.bloodGroup,
        health_info: profile.basicHealthInfo,
        lifestyle: profile.passionsLifestyle
      })
      .eq('id', userId);
      
    if (error) throw error;
  } catch (error) {
    console.error("Failed to save profile:", error);
  }
};
`;

code = code.replace(/export const subscribeToUserProfile =[\s\S]*?export const saveUserProfile = async [\s\S]*?catch \(error\) \{\n\s*handleFirestoreError[^\n]*\n\s*\}\n\};/, newProfileFns.trim() + '\n\n');

fs.writeFileSync('src/services/db.ts', code);
console.log("Patched profile fns");
