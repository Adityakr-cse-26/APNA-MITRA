const url = 'https://glytruwxtyhfkrstnygr.supabase.co/rest/v1/profiles?select=guardian_name';
const key = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';

fetch(url, { headers: { 'apikey': key } })
  .then(res => res.json())
  .then(json => console.log(json));
