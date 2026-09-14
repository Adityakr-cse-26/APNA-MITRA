const url = 'https://glytruwxtyhfkrstnygr.supabase.co/rest/v1/';
const key = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';

fetch(url, { headers: { 'apikey': key, 'Accept': 'application/openapi+json' } })
  .then(res => res.json())
  .then(json => {
    const tableProps = json.definitions['emergency_alerts'].properties;
    console.log("emergency_alerts properties:");
    for (const [k, v] of Object.entries(tableProps)) {
      console.log(`${k}: ${v.type} (${v.format})`);
    }
  })
  .catch(err => console.error(err));
