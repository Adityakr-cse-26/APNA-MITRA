const fs = require('fs');
let code = fs.readFileSync('src/components/BooksSection.tsx', 'utf-8');

// Remove debugPdfUrl state
code = code.replace("const [debugPdfUrl, setDebugPdfUrl] = useState<{id: string, url: string, path: string} | null>(null);\n", "");
code = code.replace("setDebugPdfUrl(null);\n", "");
code = code.replace("setDebugPdfUrl({ id: book.id, url: data.signedUrl, path: path });\n", "");

// Remove debug UI in grid
const gridDebugTarget = `                  {debugPdfUrl && debugPdfUrl.id === book.id && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-sm text-green-800 font-bold mb-2">Signed URL generated successfully</p>
                      <p className="text-xs text-green-700 mb-4 break-all">PDF path: {debugPdfUrl.path}</p>
                      <a 
                        href={debugPdfUrl.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-xl w-full transition-colors text-sm"
                      >
                        Open PDF manually
                      </a>
                    </div>
                  )}`;
code = code.replace(gridDebugTarget, "");

// Remove debug UI in modal
const modalDebugTarget = `                  {debugPdfUrl && debugPdfUrl.id === selectedBook.id && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-sm text-green-800 font-bold mb-2">Signed URL generated successfully</p>
                      <p className="text-xs text-green-700 mb-4 break-all">PDF path: {debugPdfUrl.path}</p>
                      <a 
                        href={debugPdfUrl.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-2xl w-full transition-colors text-lg"
                      >
                        Open PDF manually
                      </a>
                    </div>
                  )}`;
code = code.replace(modalDebugTarget, "");

fs.writeFileSync('src/components/BooksSection.tsx', code);
