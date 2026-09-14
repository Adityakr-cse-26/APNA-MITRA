const url = 'https://glytruwxtyhfkrstnygr.supabase.co/rest/v1/';
const key = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';

fetch(url, { headers: { 'apikey': key, 'Accept': 'application/openapi+json' } })
  .then(res => res.json())
  .then(json => {
    console.log("Top level keys:", Object.keys(json));
    if (json.definitions) console.log("Definitions keys:", Object.keys(json.definitions));
    if (json.components && json.components.schemas) console.log("Components keys:", Object.keys(json.components.schemas));
    
    // Look manually
    const schemas = json.components?.schemas || json.definitions;
    if (schemas) {
       for (const k of Object.keys(schemas)) {
           if (k.includes('alert')) {
               console.log("Found:", k);
               console.log(schemas[k].properties);
           }
       }
    }
  })
  .catch(err => console.error(err));
