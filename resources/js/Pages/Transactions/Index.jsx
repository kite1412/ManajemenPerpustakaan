import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Index(){
    const [txs, setTxs] = useState([]);
    useEffect(()=>{ fetch(); }, []);
    const fetch = async ()=>{
        const res = await axios.get('/api/transactions');
        // API returns an object with payload property; fall back to data if plain array
        const payload = (res.data && res.data.payload) ? res.data.payload : res.data;
        setTxs(Array.isArray(payload) ? payload : []);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Transactions" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold mb-4">Transactions</h1>
                    <ul>
                        {txs.map(t=> <li key={t.id} className="py-2 border-b">{t.id} - {t.status}</li>)}
                    </ul>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
