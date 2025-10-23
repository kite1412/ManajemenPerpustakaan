import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Index() {
    const [items, setItems] = useState([]);
    const [name, setName] = useState('');

    useEffect(()=>{ fetch(); }, []);

    const fetch = async ()=>{ const res = await axios.get('/api/categories'); setItems(res.data); };
    const submit = async (e)=>{ e.preventDefault(); await axios.post('/api/categories', { name }); setName(''); fetch(); };

    return (
        <AuthenticatedLayout>
            <Head title="Categories" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold mb-4">Categories</h1>
                    <form onSubmit={submit} className="mb-6">
                        <input className="border p-2 mr-2" value={name} onChange={(e)=>setName(e.target.value)} placeholder="Name" />
                        <button className="px-3 py-1 rounded bg-brand text-gray-800">Create</button>
                    </form>
                    <ul>
                        {items.map((c)=> <li key={c.id} className="py-2 border-b">{c.name}</li>)}
                    </ul>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
