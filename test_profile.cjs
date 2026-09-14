const url = 'https://glytruwxtyhfkrstnygr.supabase.co/rest/v1/profiles';
const key = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';

fetch(url, { 
  method: 'POST',
  headers: { 
    'apikey': key, 
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates,return=representation'
  },
  body: JSON.stringify({
      id: '00000000-0000-0000-0000-000000000000',
      full_name: 'Test',
      emergency_contact_name: "John"
  })
})
  .then(res => res.json())
  .then(json => {
    console.log("Upsert response:");
    console.log(json);
  });
