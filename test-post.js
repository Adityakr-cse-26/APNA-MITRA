async function testURL(url) {
  try {
    const query = `[out:json];(node["amenity"="hospital"](around:10000,22.7235,88.4800);way["amenity"="hospital"](around:10000,22.7235,88.4800););out center;`;
    const res = await fetch(url, { 
      method: "POST", 
      body: `data=${encodeURIComponent(query)}`,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      signal: AbortSignal.timeout(10000) 
    });
    console.log(url, res.status);
    if (res.ok) {
      const data = await res.json();
      console.log("Elements:", data.elements.length);
    } else {
      console.log(await res.text());
    }
  } catch (e) {
    console.log(url, "FAILED", e.message);
  }
}
async function run() {
  await testURL(`https://maps.mail.ru/osm/tools/overpass/api/interpreter`);
  await testURL(`https://overpass-api.de/api/interpreter`);
}
run();
