import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  ArrowRight, 
  Star 
} from 'lucide-react';
import { MOCK_BOOKS } from '../constants';

const Dashboard: React.FC = () => {
  // Get unique genres and take top 3
  const genres = Array.from(new Set(MOCK_BOOKS.map(b => b.genre))).slice(0, 4);

  return (
    <div className="space-y-16">
      {/* Hero Section - Style "Reliure de livre ancien" */}
      <div className="relative bg-amber-900 rounded-sm overflow-hidden shadow-xl text-amber-50 border-t-4 border-amber-600">
        {/* Motif subtil en fond */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fbbf24 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        <div className="relative px-8 py-16 md:px-12 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="md:w-1/2 space-y-6">
            <div className="inline-block px-3 py-1 border border-amber-500/50 rounded-full text-xs font-serif tracking-widest text-amber-200 uppercase mb-2">
              Bibliothèque Numérique
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-serif leading-tight text-amber-50">
              La connaissance est <span className="text-amber-400 italic">lumière</span>
            </h1>
            <p className="text-amber-100/80 text-lg md:text-xl leading-relaxed max-w-lg font-light">
              Explorez nos manuscrits et ouvrages. Une collection intemporelle à portée de main dans un cadre qui respecte la tradition.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link 
                to="/catalog" 
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-serif font-bold rounded-sm text-amber-900 bg-[#f3e5cf] hover:bg-white transition-colors shadow-lg hover:shadow-xl"
              >
                <BookOpen className="w-5 h-5 mr-2 opacity-80" />
                Parcourir la collection
              </Link>
            </div>
          </div>
          
          {/* Illustration décorative style "Arabesque abstraite" */}
          <div className="md:w-1/2 hidden md:flex justify-center items-center relative">
             <div className="w-64 h-80 border-4 border-double border-amber-500/30 rounded-t-full bg-amber-800/50 backdrop-blur-sm absolute transform rotate-3"></div>
             <div className="w-64 h-80 border-2 border-amber-400/20 rounded-t-full bg-amber-950/80 backdrop-blur-md relative flex items-center justify-center shadow-2xl">
                <BookOpen className="w-24 h-24 text-amber-500/50" strokeWidth={1} />
             </div>
          </div>
        </div>
      </div>

      {/* Category Sections with Book Previews */}
      <div className="space-y-16">
        {genres.map((genre) => {
          // Get up to 4 books for this genre
          const booksInGenre = MOCK_BOOKS.filter(b => b.genre === genre).slice(0, 4);
          
          return (
            <div key={genre} className="space-y-6">
               <div className="flex justify-between items-end border-b border-amber-900/10 pb-2">
                  <h2 className="text-3xl font-serif font-bold text-amber-950">{genre}</h2>
                  <Link 
                    to={`/catalog?genre=${encodeURIComponent(genre)}`} 
                    className="text-amber-700 hover:text-amber-900 font-medium flex items-center text-sm uppercase tracking-wide hover:underline decoration-amber-400 underline-offset-4 transition-all"
                  >
                    Voir tout <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {booksInGenre.map((book) => (
                    <Link key={book.id} to="/catalog" className="group">
                      <div className="bg-white rounded-sm shadow-sm border border-stone-200 overflow-hidden hover:shadow-lg hover:border-amber-200 transition-all duration-300 h-full flex flex-col">
                        <div className="aspect-[2/3] bg-stone-200 relative overflow-hidden">
                           <img 
                             src={book.coverUrl} 
                             alt={book.title} 
                             className="absolute inset-0 w-full h-full object-cover filter sepia-[0.2] group-hover:sepia-0 transition-all duration-500" 
                           />
                        </div>
                        <div className="p-4 flex-1 flex flex-col bg-[#fffcf5]">
                          <h3 className="font-serif font-bold text-lg text-stone-900 leading-tight mb-1 line-clamp-2 group-hover:text-amber-800">{book.title}</h3>
                          <p className="text-xs text-stone-500 font-medium uppercase tracking-wider mb-2">{book.author}</p>
                          <div className="mt-auto flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-400 fill-current" />
                            <span className="text-xs text-amber-700 font-bold">4.8</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
               </div>
            </div>
          );
        })}
      </div>

      {/* Newsletter / Call to Action */}
      <div className="bg-[#f3e5cf] rounded-sm p-10 border border-amber-200 text-center relative overflow-hidden">
         <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl font-serif font-bold text-amber-900 mb-4">Restez informé</h2>
            <p className="text-stone-600 mb-8 font-serif italic text-lg">Inscrivez-vous pour recevoir les actualités de la bibliothèque et nos nouvelles acquisitions.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
               <input 
                 type="email" 
                 placeholder="Votre adresse email" 
                 className="px-4 py-3 rounded-sm border border-amber-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-600 w-full sm:w-80 placeholder-stone-400"
               />
               <button className="px-6 py-3 bg-amber-800 text-amber-50 font-serif font-bold rounded-sm hover:bg-amber-900 transition-colors shadow-md">
                 S'inscrire
               </button>
            </div>
         </div>
         <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
             <BookOpen className="w-96 h-96 absolute -top-20 -right-20 text-amber-900" />
         </div>
      </div>
    </div>
  );
};

export default Dashboard;