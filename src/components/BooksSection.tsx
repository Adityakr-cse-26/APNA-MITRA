import React, { useState, useEffect } from "react";
import { BookOpen, Search, ExternalLink, X, Book } from "lucide-react";
import { Language } from "../types";
import { supabase } from "../supabase";

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
    <section id="books" className="py-16 md:py-24 bg-white border-y border-[#D8E2DA]">
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
          <div className="text-center py-20 bg-red-50 rounded-3xl border border-red-200">
            <h3 className="text-xl font-bold text-red-700 mb-2">Error Loading Books</h3>
            <p className="text-red-500">{fetchError}</p>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1F4E46] mb-4"></div>
            <p>Loading books...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-gray-200">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No books found</h3>
            <p className="text-gray-500">Try adjusting your search or select a different language.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredBooks.map((book) => (
              <article 
                key={book.id} 
                className="bg-[#F4F7F4] rounded-3xl p-6 sm:p-7 border border-[#D8E2DA] shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col h-full cursor-pointer"
                onClick={() => setSelectedBook(book)}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-20 bg-gray-200 rounded-lg overflow-hidden shrink-0 shadow-sm border border-gray-300">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#DCEAE4] text-[#1F4E46]">
                        <Book className="w-8 h-8" />
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
                <div className="mt-auto pt-4 border-t border-[#D8E2DA]">
                  {book.pdf_url ? (
                    <button 
                      disabled={openingBookId === book.id}
                      onClick={(e) => handleReadBook(e, book)}
                      className={`flex items-center justify-center gap-2 w-full ${openingBookId === book.id ? 'bg-[#153A34] opacity-80 cursor-wait' : 'bg-[#1F4E46] hover:bg-[#153A34]'} text-white font-bold py-2.5 px-4 rounded-xl transition-colors text-sm`}
                    >
                      <BookOpen className={`w-4 h-4 ${openingBookId === book.id ? 'animate-pulse' : ''}`} />
                      {openingBookId === book.id ? 'Opening book...' : 'Read Book'}
                    </button>
                  ) : (
                    <button 
                      disabled
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center gap-2 w-full bg-gray-200 text-gray-500 font-bold py-2.5 px-2 rounded-xl cursor-not-allowed text-xs text-center"
                    >
                      Book content will be available soon.
                    </button>
                  )}

                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Book Details Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col md:flex-row h-full overflow-y-auto">
              <div className="w-full md:w-2/5 bg-gray-50 p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-gray-200">
                 {selectedBook.cover_url ? (
                    <img src={selectedBook.cover_url} alt={selectedBook.title} className="w-full max-w-[250px] rounded-lg shadow-xl" />
                  ) : (
                    <div className="w-full max-w-[250px] aspect-[2/3] rounded-lg shadow-xl flex items-center justify-center bg-[#DCEAE4] text-[#1F4E46]">
                      <Book className="w-20 h-20" />
                    </div>
                  )}
              </div>
              <div className="w-full md:w-3/5 p-8 flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-[#1F4E46] bg-[#DCEAE4] px-3 py-1 rounded-full w-max mb-4">
                  {selectedBook.language}
                </span>
                <h3 className="font-serif text-3xl font-bold text-[#153A34] mb-2">
                  {selectedBook.title}
                </h3>
                <p className="text-lg font-medium text-gray-600 mb-6">By {selectedBook.author || 'Unknown Author'}</p>
                
                <div className="prose prose-sm sm:prose-base text-gray-600 mb-8 max-w-none flex-1">
                  <p>{selectedBook.description || 'No description available for this book.'}</p>
                </div>
                                <div className="mt-auto pt-6 border-t border-gray-100">
                  {readError && openingBookId === selectedBook.id && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-600 font-medium">{readError}</p>
                    </div>
                  )}
                  {pdfErrorUrl && (
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between">
                      <p className="text-sm text-yellow-800 font-medium">Popup blocked. Click to open directly:</p>
                      <a 
                        href={pdfErrorUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="px-4 py-2 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-700 transition-colors whitespace-nowrap ml-4 text-sm"
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
