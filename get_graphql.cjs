const url = 'https://glytruwxtyhfkrstnygr.supabase.co/graphql/v1';
const key = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';

const query = `
  {
    __schema {
      types {
        name
        fields {
          name
          type {
            name
            kind
          }
        }
      }
    }
  }
`;

fetch(url, { 
  method: 'POST',
  headers: { 
    'apikey': key,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ query })
})
  .then(res => res.json())
  .then(json => {
    if (json.data && json.data.__schema) {
      const types = json.data.__schema.types;
      const alertType = types.find(t => t.name.toLowerCase().includes('emergency_alert'));
      console.log(alertType ? alertType.name : "Not found in GraphQL");
      if (alertType) {
        console.log(alertType.fields);
      }
    } else {
      console.log(json);
    }
  });
