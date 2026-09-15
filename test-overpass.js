async function run() {
  const query = `
    [out:json];
    (
      node["amenity"="hospital"](around:5000, 22.7235, 88.4800);
      way["amenity"="hospital"](around:5000, 22.7235, 88.4800);
    );
    out center;
  `;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(data.elements.length);
  if (data.elements.length > 0) {
    console.log(data.elements[0].tags.name);
  }
}
run();
