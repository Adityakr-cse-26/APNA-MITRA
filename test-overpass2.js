async function testURL(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    console.log(url, res.status);
  } catch (e) {
    console.log(url, "FAILED", e.message);
  }
}
async function run() {
  const query = `[out:json];node["amenity"="hospital"](around:1000, 22.7235, 88.4800);out center;`;
  const q = encodeURIComponent(query);
  await testURL(`https://overpass-api.de/api/interpreter?data=${q}`);
  await testURL(`https://lz4.overpass-api.de/api/interpreter?data=${q}`);
  await testURL(`https://overpass.kumi.systems/api/interpreter?data=${q}`);
  await testURL(`https://maps.mail.ru/osm/tools/overpass/api/interpreter?data=${q}`);
}
run();
