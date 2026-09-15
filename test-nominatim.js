async function testURL(url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000), headers: { 'User-Agent': 'ApnaMitraApp/1.0' }});
    console.log(url, res.status);
    const data = await res.json();
    console.log(data.length, data[0]?.name);
  } catch (e) {
    console.log(url, "FAILED", e.message);
  }
}
async function run() {
  await testURL(`https://nominatim.openstreetmap.org/search?q=hospital&format=json&limit=5&lat=22.7235&lon=88.4800`);
}
run();
