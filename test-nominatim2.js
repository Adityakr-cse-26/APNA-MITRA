async function run() {
  const lat = 22.7235;
  const lon = 88.4800;
  const size = 0.05;
  const viewbox = `${lon - size},${lat + size},${lon + size},${lat - size}`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=hospital&viewbox=${viewbox}&bounded=1&limit=10`;
  const res = await fetch(url, { headers: { 'User-Agent': 'ApnaMitraApp/1.0' } });
  const data = await res.json();
  console.log(data.length, data[0]?.name, data[0]?.lat, data[0]?.lon);
}
run();
