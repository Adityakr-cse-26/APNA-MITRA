const url = 'https://glytruwxtyhfkrstnygr.supabase.co/rest/v1/sos_alerts';
const key = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';

fetch(url, { headers: { 'apikey': key, 'Accept': 'text/csv' } })
  .then(res => res.text())
  .then(text => {
    console.log("CSV output for sos_alerts:");
    console.log(text);
  });
