const url = 'https://glytruwxtyhfkrstnygr.supabase.co/rest/v1/?apikey=sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';

fetch(url)
  .then(res => res.json())
  .then(json => {
    const roleProp = json.definitions['profiles'].properties['role'];
    console.log("Role property:", roleProp);
  });
