async function run() {
  const url = 'https://glytruwxtyhfkrstnygr.supabase.co/rest/v1/caretakers?limit=1&apikey=sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("Caretakers:", data);
  } catch (e) {
    console.error(e);
  }
}
run();
