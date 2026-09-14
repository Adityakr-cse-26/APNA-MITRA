const url = 'https://glytruwxtyhfkrstnygr.supabase.co/rest/v1/?apikey=sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';

fetch(url)
  .then(res => res.json())
  .then(json => {
    const tableProps = json.definitions['profiles'].properties;
    console.log("profiles properties:");
    for (const [k, v] of Object.entries(tableProps)) {
      console.log(`- ${k}: ${v.type} (${v.format})`);
    }
  })
  .catch(err => console.error(err));
