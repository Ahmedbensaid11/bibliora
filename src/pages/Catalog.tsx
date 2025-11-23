import React, { useState, useEffect } from 'react';
import { MOCK_BOOKS } from '../constants';
import { Search, Filter, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const Catalog: React.FC = () => {
  const [searchParams] = useSearchParams();
  const genreParam = searchParams.get('genre');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState(genreParam || 'All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Update filter if URL param changes
  useEffect(() => {
    if (genreParam) {
        setFilterGenre(genreParam);
    } else {
        setFilterGenre('All');
    }
    setCurrentPage(1); // Reset to page 1 on filter change
  }, [genreParam]);

  const filteredBooks = MOCK_BOOKS.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = filterGenre === 'All' || book.genre === filterGenre;
    return matchesSearch && matchesGenre;
  });

  const genres = ['All', ...Array.from(new Set(MOCK_BOOKS.map(b => b.genre))).sort()];

  // Pagination Logic
  const indexOfLastBook = currentPage * itemsPerPage;
  const indexOfFirstBook = indexOfLastBook - itemsPerPage;
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="border-b border-stone-200 pb-6 flex flex-col md:flex-row justify-between items-end">
        <div>
            <h1 className="text-4xl font-serif font-bold text-amber-950 mb-2">Le Catalogue</h1>
            <p className="text-stone-600 font-light italic text-lg">
                {filterGenre === 'All' ? 'Parcourez l\'intégralité de notre collection.' : `Parcourez nos ouvrages : ${filterGenre}`}
            </p>
        </div>
        <div className="text-sm text-stone-500 font-mono mt-4 md:mt-0">
            Affichage {indexOfFirstBook + 1}-{Math.min(indexOfLastBook, filteredBooks.length)} sur {filteredBooks.length} résultats
        </div>
      </div>

      {/* Controls Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-white p-5 rounded-sm shadow-md border border-stone-200">
        <div className="flex items-center space-x-4 w-full">
           <div className="relative w-full lg:max-w-md flex-1">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-5 h-5" />
             <input 
               type="text" 
               placeholder="Rechercher un titre, un auteur..." 
               className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-600 focus:border-amber-600 transition-all bg-[#fdfbf7] placeholder-stone-400 text-stone-800"
               value={searchTerm}
               onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
             />
           </div>
           
           <div className="relative hidden sm:block min-w-[200px]">
             <select 
               className="w-full appearance-none pl-10 pr-10 py-3 border border-stone-300 rounded-sm bg-[#fdfbf7] text-stone-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600 cursor-pointer font-serif"
               value={filterGenre}
               onChange={(e) => { setFilterGenre(e.target.value); setCurrentPage(1); }}
             >
               {genres.map(g => <option key={g} value={g}>{g === 'All' ? 'Tous les genres' : g}</option>)}
             </select>
             <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
           </div>
        </div>
      </div>

      {/* Grid Layout */}
      {currentBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {currentBooks.map((book) => (
            <div key={book.id} className="group bg-white rounded-sm shadow-sm border border-stone-200 overflow-hidden hover:shadow-xl hover:border-amber-200 transition-all duration-300 flex flex-col h-full">
              <div className="relative aspect-[2/3] overflow-hidden bg-stone-200">
                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover filter sepia-[0.15]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-sm text-xs font-bold font-serif shadow-sm border ${
                        book.availableCopies > 0 
                        ? 'bg-[#f0fdf4] text-emerald-800 border-emerald-200' 
                        : 'bg-[#fef2f2] text-red-800 border-red-200'
                    }`}>
                      {book.availableCopies > 0 ? 'Disponible' : 'Épuisé'}
                    </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col bg-[#fffcf5]">
                <div className="mb-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-amber-700 border-b border-amber-200 pb-0.5">{book.genre}</span>
                </div>
                <h3 className="font-serif font-bold text-xl text-stone-900 mb-1 leading-snug line-clamp-2" title={book.title}>{book.title}</h3>
                <p className="text-stone-500 mb-4 text-sm font-medium italic">{book.author}</p>
                
                <div className="mt-auto pt-4 border-t border-stone-200 flex justify-between items-center">
                   <p className="text-xs text-stone-400 font-mono">{book.isbn}</p>
                   <button className="text-amber-800 hover:text-amber-600 text-sm font-bold font-serif border-b border-transparent hover:border-amber-600 transition-all">Voir Détails</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#fcfbf9] rounded-sm border-2 border-dashed border-stone-300">
          <div className="bg-stone-100 p-4 rounded-full inline-flex mb-4">
             <BookOpen className="w-8 h-8 text-stone-400" />
          </div>
          <p className="text-stone-800 font-serif font-bold text-xl mb-2">Aucun ouvrage trouvé</p>
          <p className="text-stone-500 italic">Essayez de modifier vos critères de recherche.</p>
        </div>
      )}

      {/* Classic Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-8 border-t border-stone-200">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-sm border border-stone-200 text-stone-600 hover:bg-amber-50 hover:text-amber-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-10 h-10 flex items-center justify-center rounded-sm font-serif font-bold text-sm transition-all ${
                currentPage === page 
                  ? 'bg-amber-900 text-amber-50 shadow-md' 
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-amber-50 hover:border-amber-300'
              }`}
            >
              {page}
            </button>
          ))}

          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-sm border border-stone-200 text-stone-600 hover:bg-amber-50 hover:text-amber-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Catalog;