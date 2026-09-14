import React, { useState, useEffect } from "react";
import { BookOpen, Search, ExternalLink, X, Book } from "lucide-react";
import { Language } from "../types";
import { supabase } from "../supabase";

const COVER_STYLES = [
  { bg: 'from-[#1F4E46] to-[#0a1e1b]', border: 'border-l-[#122e29]', text: 'text-amber-50', underline: 'border-amber-500/40' },
  { bg: 'from-rose-900 to-rose-950', border: 'border-l-rose-950', text: 'text-rose-50', underline: 'border-rose-500/40' },
  { bg: 'from-slate-800 to-slate-950', border: 'border-l-slate-900', text: 'text-slate-50', underline: 'border-slate-500/40' },
  { bg: 'from-purple-900 to-purple-950', border: 'border-l-purple-950', text: 'text-purple-50', underline: 'border-purple-500/40' },
  { bg: 'from-amber-800 to-amber-950', border: 'border-l-amber-900', text: 'text-amber-50', underline: 'border-amber-500/40' },
  { bg: 'from-teal-800 to-teal-950', border: 'border-l-teal-900', text: 'text-teal-50', underline: 'border-teal-500/40' },
  { bg: 'from-indigo-900 to-indigo-950', border: 'border-l-indigo-950', text: 'text-indigo-50', underline: 'border-indigo-500/40' },
  { bg: 'from-stone-700 to-stone-900', border: 'border-l-stone-800', text: 'text-stone-50', underline: 'border-stone-500/40' },
];

const getBookStyle = (title) => {
  if (!title) return COVER_STYLES[0];
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COVER_STYLES[Math.abs(hash) % COVER_STYLES.length];
};

interface BooksSectionProps {
  currentLang: Language;
}

export const BooksSection: React.FC<BooksSectionProps> = ({ currentLang }) => {
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('English');
  const [searchQuery, setSearchQuery] = useState('');
  const [pdfErrorUrl, setPdfErrorUrl] = useState<string | null>(null);
  const [openingBookId, setOpeningBookId] = useState<string | null>(null);
  const [readError, setReadError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchBooks();
    
    // Restore scroll position in case of page reload/back navigation
    const savedScroll = sessionStorage.getItem('bookScrollPosition');
    if (savedScroll) {
      setTimeout(() => {
        window.scrollTo({
          top: parseInt(savedScroll, 10),
          behavior: 'instant'
        });
        sessionStorage.removeItem('bookScrollPosition');
      }, 100);
    }
  }, []);

  const handleReadBook = async (e: React.MouseEvent, book: any) => {
    e.stopPropagation();
    
    // Save current scroll position before opening PDF
    const savedScrollPosition = window.scrollY;
    sessionStorage.setItem('bookScrollPosition', savedScrollPosition.toString());
    
    setPdfErrorUrl(null);
    setReadError(null);
    
    console.log("Book:", book.title);
    console.log("PDF path:", book.pdf_url);
    
    if (!book.pdf_url) {
      setReadError("Book content will be available soon.");
      return;
    }

    setOpeningBookId(book.id);

    try {
      // 1. Determine the EXACT bucket name based on language ONLY.
      let bucket = "book"; // default for Hindi
      if (book.language === 'English') {
        bucket = 'English Books';
      } else if (book.language === 'Bengali') {
        bucket = 'Bengali Books';
      } else if (book.language === 'Hindi') {
        bucket = 'book';
      }

      // 2. Determine the clean path (just the filename)
      let path = book.pdf_url;
      
      const supabaseUrlMatch = path.match(/\/object\/(?:public|sign)\/([^\/]+)\/(.+)$/);
      if (supabaseUrlMatch) {
        path = decodeURIComponent(supabaseUrlMatch[2]);
      } else if (path.startsWith('http')) {
        const parts = path.split('/');
        path = decodeURIComponent(parts[parts.length - 1]);
      }
      
      try {
        path = decodeURIComponent(path);
      } catch (e) {}
      
      // Strip any accidental bucket prefixes from the path
      const prefixesToRemove = ['books/', 'book/', 'English Books/', 'Bengali Books/', 'Book/'];
      for (const prefix of prefixesToRemove) {
        if (path.startsWith(prefix)) {
          path = path.substring(prefix.length);
        }
      }

      console.log(`Requesting from Bucket: "${bucket}", Path: "${path}"`);

      const newWindow = window.open('', '_blank');

      let { data, error } = await supabase
        .storage
        .from(bucket)
        .createSignedUrl(path, 3600);
        
      if (error) {
        console.warn(`Signed URL failed for Bucket: "${bucket}", Path: "${path}"`, error);
        
        // If the error is NoSuchBucket, we definitely want to show that clearly
        if (error.message === 'Bucket not found' || error.name === 'NoSuchBucket') {
           if (newWindow) newWindow.close();
           setReadError(`Storage Error: Bucket "${bucket}" not found. Please verify the bucket name exists exactly as shown.`);
           setOpeningBookId(null);
           return;
        }

        // Try public URL fallback for other errors
        const publicUrlData = supabase.storage.from(bucket).getPublicUrl(path);
        if (publicUrlData && publicUrlData.data && publicUrlData.data.publicUrl) {
           data = { signedUrl: publicUrlData.data.publicUrl };
           error = null as any;
        }
      }
              
      console.log("Signed URL error:", error);
      console.log("Signed URL:", data?.signedUrl);

      if (error) {
        if (newWindow) newWindow.close();
        let errMsg = error.message;
        if (errMsg === 'Failed to fetch') errMsg = 'Network error (Failed to fetch). This is often caused by an Ad Blocker (like Brave Shields or uBlock Origin) blocking the secure connection to the database. Please disable it for this site and try again.';
        setReadError(`Error opening PDF from Bucket "${bucket}": ${errMsg}`);
        setOpeningBookId(null);
        return;
      }

      if (data?.signedUrl) {
        if (newWindow) {
          newWindow.location.href = data.signedUrl;
          
          // Poll to restore scroll position when the new window is closed
          const timer = setInterval(() => {
            if (newWindow.closed) {
              clearInterval(timer);
              requestAnimationFrame(() => {
                window.scrollTo({
                  top: savedScrollPosition,
                  behavior: "instant"
                });
              });
            }
          }, 500);
        } else {
          setPdfErrorUrl(data.signedUrl);
        }
      } else if (newWindow) {
        newWindow.close();
      }
    } catch (err: any) {
      console.error("Exception in handleReadBook:", err);
      let errMsg2 = err.message;
      if (errMsg2 === 'Failed to fetch') errMsg2 = 'Network error (Failed to fetch). This is often caused by an Ad Blocker (like Brave Shields or uBlock Origin) blocking the secure connection to the database. Please disable it for this site and try again.';
      setReadError(`Unexpected error: ${errMsg2}`);
    } finally {
      setOpeningBookId(null);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    setFetchError(null);
    const { data, error } = await supabase.from('books').select('*').order('created_at', { ascending: false });
    
    console.log("Fetched books data:", data);
    console.log("Fetched books error:", error);

    let allBooks: any[] = [];
    if (error) {
      let errMsg = error.message;
      if (errMsg === 'Failed to fetch') errMsg = 'Network error (Failed to fetch). If you have an Ad Blocker, please disable it for this site to load the books.';
      setFetchError(errMsg);
    } else if (data) {
      allBooks = [...data];
    }
    
    try {
      const buckets = [
        { name: 'English Books', lang: 'English' },
        { name: 'Bengali Books', lang: 'Bengali' },
        { name: 'book', lang: 'Hindi' }
      ];
      
      for (const bucketInfo of buckets) {
        const { data: storageFiles, error: storageError } = await supabase.storage.from(bucketInfo.name).list();
        if (storageFiles && !storageError) {
          const storageBooks = storageFiles
            .filter(f => f.name.toLowerCase().endsWith('.pdf'))
            .map(f => {
              const title = f.name.replace(/\.pdf$/i, '');
              return {
                id: `storage_${bucketInfo.name}_${f.id || f.name}`,
                title: title,
                author: 'Unknown Author',
                language: bucketInfo.lang,
                description: `Book from ${bucketInfo.name} archive.`,
                pdf_url: f.name,
                cover_url: null,
                storageBucket: bucketInfo.name,
                storagePath: f.name,
                isFromStorage: true
              };
            });
            
          for (const sBook of storageBooks) {
            // Find if this storage file is already linked in a DB book
            const existingDbBook = allBooks.find(b => {
              if (b.language !== bucketInfo.lang) return false;
              if (!b.pdf_url) return b.title.toLowerCase() === sBook.title.toLowerCase();
              
              try {
                 const decodedDbUrl = decodeURIComponent(b.pdf_url);
                 const decodedStorageUrl = decodeURIComponent(sBook.pdf_url);
                 // Check if the DB URL contains the storage filename
                 return decodedDbUrl.includes(decodedStorageUrl);
              } catch (e) {
                 return b.pdf_url.includes(sBook.pdf_url);
              }
            });
            
            if (existingDbBook) {
              existingDbBook.storageBucket = sBook.storageBucket;
              existingDbBook.storagePath = sBook.storagePath;
            } else {
              // Also check for a strict title match as a fallback
              const titleMatch = allBooks.find(b => b.title.toLowerCase() === sBook.title.toLowerCase() && b.language === bucketInfo.lang);
              if (titleMatch) {
                titleMatch.storageBucket = sBook.storageBucket;
                titleMatch.storagePath = sBook.storagePath;
              } else {
                allBooks.push(sBook);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching books from storage buckets:", err);
    }

    if (allBooks.length > 0) {
      // Deduplicate DB books based on title and language
      const bookMap = new Map();
      const duplicates: string[] = [];
      const uniqueBooks: any[] = [];
      
      for (const book of allBooks) {
        // Clean title for comparison
        let cleanTitle = book.title.replace(/_[0-9]+$/, '').replace(/-VOL-/i, ' Vol ').replace(/_/g, ' ').trim().toLowerCase();
        
        // Also check if another book has the exact same pdf_url
        let pdfKey = book.pdf_url ? book.pdf_url.split('/').pop() : '';
        
        const key = `${cleanTitle}_${book.language}`;
        const pdfKeyFull = pdfKey ? `${pdfKey}_${book.language}` : null;

        if (bookMap.has(key) || (pdfKeyFull && bookMap.has(pdfKeyFull))) {
          if (!book.isFromStorage && typeof book.id === 'string' && !book.id.startsWith('storage_')) {
            duplicates.push(book.id);
          }
        } else {
          bookMap.set(key, true);
          if (pdfKeyFull) bookMap.set(pdfKeyFull, true);
          uniqueBooks.push(book);
        }
      }
      
      if (duplicates.length > 0) {
        console.log(`Found ${duplicates.length} duplicate DB books, deleting...`, duplicates);
        try {
          await supabase.from('books').delete().in('id', duplicates);
        } catch (e) {
          console.warn("Failed to delete duplicate books automatically:", e);
        }
      }
      
      setBooks(uniqueBooks);
    }
    
    setLoading(false);
  };

  const filteredBooks = books.filter(b => 
    b.language === activeTab && 
    (b.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     b.author.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <section id="books" className="py-16 md:py-24 bg-white border-y border-[#E2E4E0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1F4E46] bg-[#DCEAE4] px-3.5 py-1 rounded-full inline-block mb-3">
            {currentLang === 'hi' ? 'पुस्तकालय' : currentLang === 'bn' ? 'গ্রন্থাগার' : 'Library'}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#153A34] mb-4">
            Read & Heal
          </h2>
          <p className="text-base sm:text-lg text-[#5B6B60]">
            Explore our curated collection of books. Choose a language to discover amazing literature and health resources.
          </p>
        </div>

        {/* Language Tabs & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <div className="flex bg-gray-100 p-1.5 rounded-2xl w-full md:w-auto overflow-x-auto hide-scrollbar">
            <button 
              onClick={() => setActiveTab('English')} 
              className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'English' ? 'bg-white text-[#1F4E46] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              English 🇬🇧
            </button>
            <button 
              onClick={() => setActiveTab('Bengali')} 
              className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'Bengali' ? 'bg-white text-[#1F4E46] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              বাংলা 🇮🇳
            </button>
            <button 
              onClick={() => setActiveTab('Hindi')} 
              className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === 'Hindi' ? 'bg-white text-[#1F4E46] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              हिन्दी 🇮🇳
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search books..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1F4E46] focus:border-transparent outline-none transition"
            />
          </div>
        </div>

        {pdfErrorUrl && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between">
            <div>
              <h4 className="font-bold text-yellow-800">Popup Blocked</h4>
              <p className="text-sm text-yellow-700">Your browser blocked the PDF from opening automatically.</p>
            </div>
            <a 
              href={pdfErrorUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="px-4 py-2 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-700 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                const savedScrollPosition = window.scrollY;
                sessionStorage.setItem('bookScrollPosition', savedScrollPosition.toString());
                const fallbackWin = window.open(pdfErrorUrl, '_blank');
                if (fallbackWin) {
                  const timer = setInterval(() => {
                    if (fallbackWin.closed) {
                      clearInterval(timer);
                      requestAnimationFrame(() => {
                        window.scrollTo({
                          top: savedScrollPosition,
                          behavior: "instant"
                        });
                      });
                    }
                  }, 500);
                } else {
                  // If blocked again, fallback to normal link behavior
                  window.location.href = pdfErrorUrl;
                }
              }}
            >
              Open PDF
            </a>
          </div>
        )}
        {/* Books Grid */}
        {fetchError ? (
          <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-200">
            <h3 className="text-xl font-bold text-red-700 mb-2">Error Loading Books</h3>
            <p className="text-red-500">{fetchError}</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F4E46] mb-4"></div>
            <p>Loading books...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-200">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No books found</h3>
            <p className="text-gray-500">Try adjusting your search or select a different language.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredBooks.map((book) => (
              <article 
                key={book.id} 
                className="bg-[#FAFAFA] rounded-2xl p-6 sm:p-7 border border-[#E2E4E0] shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col h-full cursor-pointer"
                onClick={() => setSelectedBook(book)}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-20 bg-gray-200 rounded-lg overflow-hidden shrink-0 shadow-sm border border-gray-300">
                                        {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                                            <div className={`w-full h-full bg-gradient-to-br ${getBookStyle(book.title).bg} ${getBookStyle(book.title).text} flex flex-col items-center justify-center p-1.5 text-center relative overflow-hidden shadow-inner border-l-4 ${getBookStyle(book.title).border}`}>
                        <div className="absolute top-0 left-0 w-full h-full bg-white/5"></div>
                        <div className="absolute left-1 top-0 bottom-0 w-px bg-black/40"></div>
                        <div className="absolute left-1.5 top-0 bottom-0 w-px bg-white/10"></div>
                        <span className={`text-[10px] font-serif font-bold leading-[1.2] line-clamp-4 z-10 drop-shadow-md border-b pb-0.5 px-0.5 ${getBookStyle(book.title).underline}`}>
                          {book.title}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#153A34] leading-tight group-hover:text-[#1F4E46] transition-colors line-clamp-2 mb-1">
                      {book.title}
                    </h3>
                    <p className="text-sm font-medium text-gray-500 line-clamp-1">{book.author || 'Unknown Author'}</p>
                  </div>
                </div>
                
                <p className="text-sm text-[#5B6B60] leading-relaxed line-clamp-3 mb-4 flex-1">
                  {book.description || 'No description available for this book.'}
                </p>
                
                {readError && openingBookId === book.id && (
                  <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 text-center">
                    {readError}
                  </div>
                )}
                
                <div className="mt-auto flex items-center justify-between border-t border-[#E2E4E0] pt-4">
                  <span className="text-xs font-bold text-[#1F4E46] flex items-center gap-1">
                    Read Book <ExternalLink className="w-3 h-3" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Book Details Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={() => setSelectedBook(null)}>
          <div className="bg-[#F8FAF8] border border-[#E2E4E0] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1F4E46] via-[#2A655A] to-[#1F4E46] text-white p-6 relative">
              <button
                type="button"
                onClick={() => setSelectedBook(null)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-serif text-2xl font-bold pr-10">{selectedBook.title}</h3>
              <p className="text-emerald-100 font-medium mt-1">{selectedBook.author || 'Unknown Author'}</p>
            </div>
            
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-32 h-40 bg-gray-200 rounded-lg overflow-hidden shrink-0 shadow-md border border-gray-300 mx-auto sm:mx-0">
                  {selectedBook.cover_url ? (
                    <img src={selectedBook.cover_url} alt={selectedBook.title} className="w-full h-full object-cover" />
                  ) : (
                                        <div className={`w-full h-full bg-gradient-to-br ${getBookStyle(selectedBook.title).bg} ${getBookStyle(selectedBook.title).text} flex flex-col items-center justify-center p-2 text-center relative overflow-hidden shadow-inner border-l-4 ${getBookStyle(selectedBook.title).border}`}>
                        <div className="absolute top-0 left-0 w-full h-full bg-white/5"></div>
                        <div className="absolute left-1 top-0 bottom-0 w-px bg-black/40"></div>
                        <div className="absolute left-1.5 top-0 bottom-0 w-px bg-white/10"></div>
                        <span className={`text-xs font-serif font-bold leading-[1.2] line-clamp-4 z-10 drop-shadow-md border-b pb-0.5 px-0.5 ${getBookStyle(selectedBook.title).underline}`}>
                          {selectedBook.title}
                        </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Description</h4>
                    <p className="text-[#2A3D34] leading-relaxed text-sm">
                      {selectedBook.description || 'No description available for this book.'}
                    </p>
                  </div>
                  
                  {readError && openingBookId === selectedBook.id && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      {readError}
                    </div>
                  )}
                  
                  {pdfErrorUrl && openingBookId === selectedBook.id && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-sm text-amber-800 font-medium mb-3">
                        Your browser blocked the PDF from opening in a new tab.
                      </p>
                      <a 
                        href={pdfErrorUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg transition-colors"
                        onClick={() => {
                          setPdfErrorUrl(null);
                          setOpeningBookId(null);
                          const savedScroll = sessionStorage.getItem('bookScrollPosition');
                          if (savedScroll) {
                            setTimeout(() => {
                              window.scrollTo({
                                top: parseInt(savedScroll, 10),
                                behavior: 'instant'
                              });
                            }, 500);
                          }
                        }}
                      >
                        Open PDF
                      </a>
                    </div>
                  )}
                  {selectedBook.pdf_url ? (
                    <button 
                      disabled={openingBookId === selectedBook.id}
                      onClick={(e) => handleReadBook(e, selectedBook)}
                      className={`flex items-center justify-center gap-2 w-full ${openingBookId === selectedBook.id ? 'bg-[#153A34] opacity-80 cursor-wait' : 'bg-[#1F4E46] hover:bg-[#153A34]'} text-white font-bold py-4 px-6 rounded-2xl transition-colors text-lg`}
                    >
                      <BookOpen className={`w-6 h-6 ${openingBookId === selectedBook.id ? 'animate-pulse' : ''}`} />
                      {openingBookId === selectedBook.id ? 'Opening book...' : 'Read Book'}
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-400 font-bold py-4 px-6 rounded-2xl cursor-not-allowed text-lg"
                    >
                      <BookOpen className="w-6 h-6" />
                      Book content will be available soon.
                    </button>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
