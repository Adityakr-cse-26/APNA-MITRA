function extractPath(pdf_url) {
  let path = pdf_url;
  
  // Try to match any standard Supabase storage URL format
  // Matches: 
  // http://.../object/public/book/filename.pdf
  // http://.../object/sign/book/filename.pdf
  // /storage/v1/object/public/book/filename.pdf
  const supabaseUrlMatch = path.match(/\/object\/(?:public|sign)\/(?:book|books)\/(.+)$/);
  
  if (supabaseUrlMatch) {
    path = decodeURIComponent(supabaseUrlMatch[1]);
  } else if (path.startsWith('http')) {
    // Some other HTTP url
    const parts = path.split('/');
    path = decodeURIComponent(parts[parts.length - 1]);
  }
  
  // Clean up any lingering bucket prefixes if it's just a path
  if (path.startsWith('books/')) path = path.replace('books/', '');
  if (path.startsWith('book/')) path = path.replace('book/', '');
  
  // Finally, try to decode it in case it was saved URL encoded without a full URL
  try {
    path = decodeURIComponent(path);
  } catch (e) {}

  return path;
}

const testCases = [
  "Gitanjali.pdf",
  "book/Gitanjali.pdf",
  "books/Gitanjali.pdf",
  "https://glytruwxtyhfkrstnygr.supabase.co/storage/v1/object/public/book/Malgudi%20Days.pdf",
  "/storage/v1/object/public/book/My%20Book.pdf",
  "Malgudi%20Days.pdf",
  "http://example.com/books/Book%20Name.pdf"
];

for (const t of testCases) {
  console.log(`${t}  =>  ${extractPath(t)}`);
}
