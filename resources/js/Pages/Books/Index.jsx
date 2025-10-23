import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Index() {
    const [books, setBooks] = useState([]);
    const [title, setTitle] = useState('');

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        const res = await axios.get('/api/books');
        setBooks(res.data.payload || []);
    };

    const submit = async (e) => {
        e.preventDefault();
        await axios.post('/api/books', { title });
        setTitle('');
        fetchBooks();
    };

    return (
        <AuthenticatedLayout>
            <Head title="Books" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold mb-4">Books</h1>
                    <form onSubmit={submit} className="mb-6">
                        <input className="border p-2 mr-2" value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title" />
                        <button className="px-3 py-1 rounded bg-brand text-gray-800">Create</button>
                    </form>
                    <ul>
                        {books.map((b)=> (
                            <li key={b.id} className="py-2 border-b">{b.title}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
