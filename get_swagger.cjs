async function run() {
  const url = 'https://glytruwxtyhfkrstnygr.supabase.co/rest/v1/?apikey=sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
  try {
    const res = await fetch(url, { headers: { 'Accept': 'application/openapi+json' } });
    const data = await res.json();
    console.log("Caretakers:", data.definitions?.caretakers || data.components?.schemas?.caretakers);
  } catch (e) {
    console.error(e);
  }
}
run();
