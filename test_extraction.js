function extractPath(pdf_url) {
  let path = pdf_url;
  const supabaseUrlMatch = path.match(/\/object\/(?:public|sign)\/(?:book|books)\/(.+)$/);
  if (supabaseUrlMatch) {
    path = decodeURIComponent(supabaseUrlMatch[1]);
  } else if (path.startsWith('http')) {
    const parts = path.split('/');
    path = decodeURIComponent(parts[parts.length - 1]);
  }
  if (path.startsWith('books/')) path = path.replace('books/', '');
  if (path.startsWith('book/')) path = path.replace('book/', '');
  try {
    path = decodeURIComponent(path);
  } catch (e) {}
  return path;
}

const url = 'https://glytruwxtyhfkrstnygr.supabase.co/storage/v1/object/public/book/The-Gift-Of-The-Magi-by-O.-Henry-Book-PDF-httpslearnenglish-new.com__1787504641692.pdf';
console.log(extractPath(url));
