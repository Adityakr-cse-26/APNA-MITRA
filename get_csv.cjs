const url = 'https://glytruwxtyhfkrstnygr.supabase.co/rest/v1/emergency_alerts';
const key = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';

fetch(url, { headers: { 'apikey': key, 'Accept': 'text/csv' } })
  .then(res => res.text())
  .then(text => {
    console.log("CSV output:");
    console.log(text);
  });
