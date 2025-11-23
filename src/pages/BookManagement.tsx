import React, { useState } from 'react';
import { 
  Plus, 
  Upload, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  FileSpreadsheet 
} from 'lucide-react';
import { MOCK_BOOKS } from '../constants';
import type { Book } from '../types';

const BookManagement: React.FC = () => {
  // État local pour simuler la base de données
  const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
  const [searchTerm, setSearchTerm] = useState('');
  
  // États pour le formulaire (Modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBook, setCurrentBook] = useState<Partial<Book>>({});

  // 1. SEARCH / FILTER
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.isbn.includes(searchTerm)
  );

  // 2. DELETE
  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce livre du catalogue ?')) {
      setBooks(books.filter(b => b.id !== id));
    }
  };

  // 3. OPEN MODAL (ADD or EDIT)
  const openModal = (book?: Book) => {
    if (book) {
      setIsEditing(true);
      setCurrentBook({ ...book });
    } else {
      setIsEditing(false);
      setCurrentBook({
        title: '', author: '', isbn: '', publisher: '', 
        year: new Date().getFullYear(), genre: '', 
        availableCopies: 1, totalCopies: 1, summary: ''
      });
    }
    setIsModalOpen(true);
  };

  // 4. SAVE (CREATE or UPDATE)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && currentBook.id) {
      // Update logic
      setBooks(books.map(b => (b.id === currentBook.id ? currentBook as Book : b)));
    } else {
      // Create logic
      const newBook = {
        ...currentBook,
        id: `b${Date.now()}`, // Fake ID gen
        coverUrl: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=300', // Default image
      } as Book;
      setBooks([newBook, ...books]);
    }
    setIsModalOpen(false);
  };

  const handleImportCSV = () => {
    alert("Fonctionnalité d'importation CSV prête à être connectée au Backend Java.");
  };

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-amber-950">Gestion du Catalogue</h1>
          <p className="text-stone-600 italic">Ajoutez, modifiez ou supprimez des ouvrages.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleImportCSV}
            className="flex items-center px-4 py-2 bg-stone-100 text-stone-700 rounded-sm border border-stone-300 hover:bg-stone-200 transition-colors font-medium text-sm"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Import CSV
          </button>
          <button 
            onClick={() => openModal()}
            className="flex items-center px-4 py-2 bg-amber-900 text-amber-50 rounded-sm hover:bg-amber-800 transition-colors font-serif font-bold shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Livre
          </button>
        </div>
      </div>

      {/* --- TOOLBAR --- */}
      <div className="bg-white p-4 rounded-sm border border-stone-200 shadow-sm flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Rechercher par titre, auteur, ISBN..." 
            className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-amber-600 text-sm bg-[#fdfbf7]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* --- DATA TABLE --- */}
      <div className="bg-white rounded-sm shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-100 border-b border-stone-200 text-stone-600 font-serif uppercase tracking-wider text-xs">
            <tr>
              <th className="p-4 font-bold">Ouvrage</th>
              <th className="p-4 font-bold hidden md:table-cell">ISBN / Éditeur</th>
              <th className="p-4 font-bold hidden sm:table-cell">Genre / Année</th>
              <th className="p-4 font-bold text-center">Stock</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredBooks.map((book) => (
              <tr key={book.id} className="hover:bg-[#fefce8] transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={book.coverUrl} alt="" className="w-10 h-14 object-cover rounded-sm shadow-sm border border-stone-200" />
                    <div>
                      <div className="font-bold text-stone-900 font-serif">{book.title}</div>
                      <div className="text-stone-500">{book.author}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell">
                  <div className="text-stone-900 font-mono text-xs">{book.isbn}</div>
                  <div className="text-stone-500 text-xs">{book.publisher}</div>
                </td>
                <td className="p-4 hidden sm:table-cell">
                  <div className="inline-block px-2 py-0.5 bg-amber-50 text-amber-800 rounded-full text-xs border border-amber-100 mb-1">
                    {book.genre}
                  </div>
                  <div className="text-stone-500 text-xs">{book.year}</div>
                </td>
                <td className="p-4 text-center">
                  <span className={`font-bold ${book.availableCopies > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {book.availableCopies}
                  </span>
                  <span className="text-stone-400"> / {book.totalCopies}</span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => openModal(book)}
                      className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-amber-50 rounded-sm transition-colors" 
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(book.id)}
                      className="p-1.5 text-stone-500 hover:text-red-700 hover:bg-red-50 rounded-sm transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredBooks.length === 0 && (
          <div className="p-8 text-center text-stone-500 italic bg-[#fdfbf7]">
            Aucun livre ne correspond à votre recherche.
          </div>
        )}
      </div>

      {/* --- MODAL (Formulaire) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-sm shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border-t-4 border-amber-900">
            <div className="flex justify-between items-center p-6 border-b border-stone-100 bg-[#fdfbf7]">
              <h2 className="text-xl font-serif font-bold text-amber-950">
                {isEditing ? 'Modifier l\'ouvrage' : 'Nouvel ouvrage'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Titre du livre</label>
                  <input 
                    required 
                    className="w-full p-2 border border-stone-300 rounded-sm focus:ring-1 focus:ring-amber-600 outline-none"
                    value={currentBook.title || ''}
                    onChange={e => setCurrentBook({...currentBook, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Auteur</label>
                  <input 
                    required 
                    className="w-full p-2 border border-stone-300 rounded-sm focus:ring-1 focus:ring-amber-600 outline-none"
                    value={currentBook.author || ''}
                    onChange={e => setCurrentBook({...currentBook, author: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">ISBN</label>
                  <input 
                    required 
                    className="w-full p-2 border border-stone-300 rounded-sm focus:ring-1 focus:ring-amber-600 outline-none font-mono"
                    value={currentBook.isbn || ''}
                    onChange={e => setCurrentBook({...currentBook, isbn: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Éditeur</label>
                  <input 
                    className="w-full p-2 border border-stone-300 rounded-sm focus:ring-1 focus:ring-amber-600 outline-none"
                    value={currentBook.publisher || ''}
                    onChange={e => setCurrentBook({...currentBook, publisher: e.target.value})}
                  />
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Année</label>
                   <input 
                     type="number"
                     className="w-full p-2 border border-stone-300 rounded-sm focus:ring-1 focus:ring-amber-600 outline-none"
                     value={currentBook.year || ''}
                     onChange={e => setCurrentBook({...currentBook, year: parseInt(e.target.value)})}
                   />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Genre</label>
                  <select 
                    className="w-full p-2 border border-stone-300 rounded-sm focus:ring-1 focus:ring-amber-600 outline-none bg-white"
                    value={currentBook.genre || ''}
                    onChange={e => setCurrentBook({...currentBook, genre: e.target.value})}
                  >
                    <option value="">Sélectionner...</option>
                    <option value="Roman">Roman</option>
                    <option value="Science-fiction">Science-fiction</option>
                    <option value="Histoire">Histoire</option>
                    <option value="Biographie">Biographie</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Total Copies</label>
                        <input 
                            type="number" min="1"
                            className="w-full p-2 border border-stone-300 rounded-sm focus:ring-1 focus:ring-amber-600 outline-none"
                            value={currentBook.totalCopies || ''}
                            onChange={e => setCurrentBook({...currentBook, totalCopies: parseInt(e.target.value), availableCopies: parseInt(e.target.value)})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Disponibles</label>
                        <input 
                            type="number"
                            className="w-full p-2 border border-stone-300 rounded-sm focus:ring-1 focus:ring-amber-600 outline-none bg-stone-100"
                            value={currentBook.availableCopies || ''}
                            disabled
                        />
                    </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Résumé</label>
                  <textarea 
                    rows={3}
                    className="w-full p-2 border border-stone-300 rounded-sm focus:ring-1 focus:ring-amber-600 outline-none resize-none"
                    value={currentBook.summary || ''}
                    onChange={e => setCurrentBook({...currentBook, summary: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-100 mt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-sm transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-amber-900 text-amber-50 font-bold font-serif rounded-sm hover:bg-amber-800 shadow-md flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookManagement;