const url = 'https://glytruwxtyhfkrstnygr.supabase.co/rest/v1/profiles?select=fake_col';
const key = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';

fetch(url, { headers: { 'apikey': key } })
  .then(res => res.json())
  .then(json => {
    console.log("Select fake_col response:");
    console.log(json);
  });
