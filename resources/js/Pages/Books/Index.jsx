import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Index() {
    const [books, setBooks] = useState([]);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [publisher, setPublisher] = useState('');
    const [year_publish, setYearPublish] = useState('');
    const [stock, setStock] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editFields, setEditFields] = useState({ title: '', author: '', publisher: '', year_publish: '', stock: '' });
    const [stockEditingId, setStockEditingId] = useState(null);
    const [stockValue, setStockValue] = useState('');

    useEffect(() => {
        fetchBooks();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try{
            const res = await axios.get('/api/categories');
            const payload = res.data && res.data.payload ? res.data.payload : res.data;
            setCategories(Array.isArray(payload) ? payload : []);
        }catch(e){ setCategories([]); }
    };

    const fetchBooks = async () => {
        const res = await axios.get('/api/books');
        setBooks(res.data.payload || []);
    };

    const submit = async (e) => {
        e.preventDefault();
        const body = { title, author, publisher, year_publish, stock, img: "image" };
        if(Array.isArray(selectedCategories) && selectedCategories.length > 0){
            // ensure numeric ids when possible
            body.category_id = selectedCategories.map(v=> Number(v));
        }
        await axios.post('/api/books', body);
        setTitle('');
        setAuthor('');
        setPublisher('');
        setYearPublish('');
        setStock('');
        setSelectedCategories([]);
        fetchBooks();
    };

    const startEdit = (book) => {
        setEditingId(book.id);
        setEditFields({
            title: book.title ?? '',
            author: book.author ?? '',
            publisher: book.publisher ?? '',
            year_publish: book.year_publish ?? '',
            stock: book.stock ?? '',
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditFields({ title: '', author: '', publisher: '', year_publish: '', stock: '' });
    };

    const saveEdit = async (id) => {
        try {
            // coerce numeric fields and send as PATCH to allow partial updates
            const payload = { ...editFields };
            if(payload.stock !== undefined && payload.stock !== '') payload.stock = Number(payload.stock);
            await axios.put(`/api/books/${id}`, payload);
            cancelEdit();
            fetchBooks();
        } catch (e) {
            console.error(e);
            alert('Failed to update book');
        }
    };

    const startStockEdit = (id, current) => {
        setStockEditingId(id);
        setStockValue(current ?? '');
    };

    const cancelStockEdit = () => {
        setStockEditingId(null);
        setStockValue('');
    };

    const saveStockEdit = async (id) => {
        try{
            await axios.patch(`/api/books/${id}`, { stock: Number(stockValue) });
            cancelStockEdit();
            fetchBooks();
        }catch(err){
            console.error(err);
            alert('Failed to update stock');
        }
    };

    const deleteBook = async (id) => {
        if (!confirm('Delete this book?')) return;
        try {
            await axios.delete(`/api/books/${id}`);
            fetchBooks();
        } catch (e) {
            console.error(e);
            alert('Failed to delete book');
        }
    };

    const getCategoryNames = (b) => {
        // prefer nested book_categories -> categories.name
        if(Array.isArray(b.book_categories) && b.book_categories.length > 0){
            return b.book_categories.map(bc => (bc.categories?.name ?? bc.categories?.title ?? '')).filter(Boolean).join(', ');
        } else return '-';
    };

    return (
        <AuthenticatedLayout>
            <Head title="Books" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold mb-4">Create Books</h1>
                    <form onSubmit={submit} className="mb-6">
                        <input className="border p-2 mr-2" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title" />
                        <input className="border p-2 mr-2" value={author} onChange={(e)=>setAuthor(e.target.value)} placeholder="Author" />
                        <input className="border p-2 mr-2" value={publisher} onChange={(e)=>setPublisher(e.target.value)} placeholder="Publisher" />
                        <input className="border p-2 mr-2" type="number" value={year_publish} onChange={(e)=>setYearPublish(e.target.value)} placeholder="Year Publish" />
                        <input className="border p-2 mr-2" type="number" value={stock} onChange={(e)=>setStock(e.target.value)} placeholder="Stock" />
                        <div className="relative inline-block mr-2">
                            <button type="button" onClick={()=>setShowCategoryDropdown(v=>!v)} className="border p-2 text-left" style={{minWidth:200}}>
                                {selectedCategories.length === 0 ? 'Select categories (optional)' : `${selectedCategories.length} selected`}
                            </button>

                            {showCategoryDropdown && (
                                <div className="absolute mt-1 bg-white border rounded shadow p-2 z-30" style={{minWidth:200}}>
                                    <div className="max-h-48 overflow-auto">
                                        {categories.map(c=> (
                                            <label key={c.id} className="flex items-center gap-2 text-sm p-1">
                                                <input type="checkbox" checked={selectedCategories.includes(c.id)} onChange={()=>{
                                                    setSelectedCategories(prev => {
                                                        if(prev.includes(c.id)) return prev.filter(x=>x!==c.id);
                                                        return [...prev, c.id];
                                                    });
                                                }} />
                                                <span>{c.name ?? c.title ?? `#${c.id}`}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="flex justify-end mt-2">
                                        <button type="button" onClick={()=>setShowCategoryDropdown(false)} className="px-2 py-1 bg-brand text-gray-800 rounded text-sm">Done</button>
                                    </div>
                                </div>
                            )}

                            <div className="text-xs text-gray-500 mt-1">Optional — choose one or more categories</div>
                        </div>
                        <button className="px-3 py-1 rounded bg-brand text-gray-800">Create</button>
                    </form>
                    <div className="overflow-x-auto">
                        <h1 className='text-3xl font-bold mb-4'>Books</h1>
                        {/* Header row */}
                        <div className="grid grid-cols-6 gap-4 font-semibold border-b pb-2 text-sm">
                            <div>Title</div>
                            <div>Author</div>
                            <div>Publisher</div>
                            <div>Year</div>
                            <div>Categories</div>
                            <div>Stock</div>
                        </div>

                        {/* Rows */}
                        {books.length === 0 ? (
                            <div className="py-4 text-sm">No books yet.</div>
                        ) : (
                            books.map((b) => (
                                <div key={b.id} className="grid grid-cols-6 gap-4 items-center py-2 border-b text-sm">
                                    {editingId === b.id ? (
                                        <>
                                            <div>
                                                <input className="w-full border p-1 text-sm" value={editFields.title} onChange={(e)=>setEditFields({...editFields, title: e.target.value})} />
                                            </div>
                                            <div>
                                                <input className="w-full border p-1 text-sm" value={editFields.author} onChange={(e)=>setEditFields({...editFields, author: e.target.value})} />
                                            </div>
                                            <div>
                                                <input className="w-full border p-1 text-sm" value={editFields.publisher} onChange={(e)=>setEditFields({...editFields, publisher: e.target.value})} />
                                            </div>
                                            <div>
                                                <input className="w-full border p-1 text-sm" type="number" value={editFields.year_publish} onChange={(e)=>setEditFields({...editFields, year_publish: e.target.value})} />
                                            </div>
                                            <div className="truncate text-sm text-gray-600">
                                                {getCategoryNames(b)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div>{editFields.stock}</div>
                                                <button type="button" onClick={()=>saveEdit(b.id)} className="px-2 py-1 bg-green-500 text-white rounded text-sm">Save</button>
                                                <button type="button" onClick={cancelEdit} className="px-2 py-1 bg-gray-300 text-gray-800 rounded text-sm">Cancel</button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="truncate">{b.title}</div>
                                            <div className="truncate">{b.author}</div>
                                            <div className="truncate">{b.publisher}</div>
                                            <div>{b.year_publish}</div>
                                            <div className="truncate text-sm text-gray-600">{getCategoryNames(b)}</div>
                                            <div className="flex items-center gap-2">
                                                {stockEditingId === b.id ? (
                                                    <>
                                                        <input className="w-20 border p-1 text-sm" type="number" value={stockValue} onChange={(e)=>setStockValue(e.target.value)} />
                                                        <button type="button" onClick={()=>saveStockEdit(b.id)} className="px-2 py-1 bg-green-500 text-white rounded text-sm">Save</button>
                                                        <button type="button" onClick={cancelStockEdit} className="px-2 py-1 bg-gray-300 text-gray-800 rounded text-sm">Cancel</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div onClick={()=>startStockEdit(b.id, b.stock)} className="cursor-pointer">{b.stock}</div>
                                                        <button type="button" onClick={()=>startEdit(b)} className="px-2 py-1 bg-yellow-300 text-gray-800 rounded text-sm">Edit</button>
                                                        <button type="button" onClick={()=>deleteBook(b.id)} className="px-2 py-1 bg-red-500 text-white rounded text-sm">Delete</button>
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
