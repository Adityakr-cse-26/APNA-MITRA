const { createClient } = require('@supabase/supabase-js');
const fallbackUrl = 'https://glytruwxtyhfkrstnygr.supabase.co';
const fallbackKey = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
const supabase = createClient(fallbackUrl, fallbackKey);

async function run() {
  console.log("Signing up guardian...");
  let user;
  const { data, error } = await supabase.auth.signUp({
    email: 'guardian@test.com',
    password: 'Guardian@12345',
    options: {
      data: {
        full_name: 'Test Guardian'
      }
    }
  });

  if (error) {
    console.error("SignUp Error:", error.message);
    console.log("Attempting to sign in instead...");
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'guardian@test.com',
        password: 'Guardian@12345'
    });
    if (signInError) {
        console.error("SignIn Error:", signInError.message);
        return;
    }
    user = signInData.user;
  } else {
    user = data.user;
  }

  if (!user) {
      console.log("Failed to get user.");
      return;
  }

  console.log("User ID:", user.id);

  console.log("Upserting profile...");
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: user.id,
    full_name: 'Test Guardian',
    role: 'guardian'
  });

  if (profileError) {
    console.error("Profile Error:", profileError.message);
  } else {
    console.log("Successfully created/updated profile for Guardian!");
  }
}
run();
