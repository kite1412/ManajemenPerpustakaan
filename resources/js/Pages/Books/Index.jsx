import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Index() {
    const [books, setBooks] = useState([]);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [publisher, setPublisher] = useState('');
    const [year_publish, setYearPublish] = useState('');
    const [stock, setStock] = useState('');

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        const res = await axios.get('/api/books');
        setBooks(res.data.payload || []);
    };

    const submit = async (e) => {
        e.preventDefault();
        await axios.post('/api/books', { title, author, publisher, year_publish, stock, img: "image" });
        setTitle('');
        setAuthor('');
        setPublisher('');
        setYearPublish('');
        setStock('');
        fetchBooks();
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
                        <button className="px-3 py-1 rounded bg-brand text-gray-800">Create</button>
                    </form>
                    <div className="overflow-x-auto">
                        <h1 className='text-3xl font-bold mb-4'>Books</h1>
                        {/* Header row */}
                        <div className="grid grid-cols-5 gap-4 font-semibold border-b pb-2 text-sm">
                            <div>Title</div>
                            <div>Author</div>
                            <div>Publisher</div>
                            <div>Year</div>
                            <div>Stock</div>
                        </div>

                        {/* Rows */}
                        {books.length === 0 ? (
                            <div className="py-4 text-sm">No books yet.</div>
                        ) : (
                            books.map((b) => (
                                <div key={b.id} className="grid grid-cols-5 gap-4 items-center py-2 border-b text-sm">
                                    <div className="truncate">{b.title}</div>
                                    <div className="truncate">{b.author}</div>
                                    <div className="truncate">{b.publisher}</div>
                                    <div>{b.year_publish}</div>
                                    <div>{b.stock}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
