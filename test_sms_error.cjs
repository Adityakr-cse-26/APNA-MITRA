const url = 'https://glytruwxtyhfkrstnygr.supabase.co/functions/v1/send-sos-sms';
const key = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';

fetch(url, { 
  method: 'POST',
  headers: { 
    'apikey': key, 
    'Authorization': 'Bearer ' + key,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ alert_id: 'a73d325a-4b95-4674-8848-f542478f773b' })
})
  .then(async res => {
      console.log(await res.text());
  });
