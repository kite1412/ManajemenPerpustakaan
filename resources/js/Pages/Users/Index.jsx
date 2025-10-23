import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Index(){
    const [items, setItems] = useState([]);
    useEffect(()=>{ fetch(); }, []);
    const fetch = async ()=>{ const res = await axios.get('/api/users'); setItems(res.data); };

    return (
        <AuthenticatedLayout>
            <Head title="Users" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold mb-4">Users</h1>
                    <ul>
                        {items.map(i=> <li key={i.id} className="py-2 border-b">{i.username} ({i.email})</li>)}
                    </ul>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
