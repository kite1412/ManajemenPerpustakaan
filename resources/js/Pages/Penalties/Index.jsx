import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Index(){
    const [items, setItems] = useState([]);
    useEffect(
        ()=>{
            fetch(); 
        }, []
    );
    const fetch = async ()=>{
         const res = await axios.get('/api/penalties');
         setItems(res.data.payload || []);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Penalties" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold mb-4">Penalties</h1>
                    <div className="overflow-x-auto">
                        <div className="grid grid-cols-9 gap-4 font-semibold border-b pb-2 text-sm">
                            <div>ID</div>
                            <div>Amount</div>
                            <div>Paid</div>
                            <div>Transaction</div>
                            <div>User</div>
                            <div>Book</div>
                            <div>Borrow Date</div>
                            <div>Due Date</div>
                            <div>Created At</div>
                        </div>

                        {items.length === 0 ? (
                            <div className="py-4 text-sm">No penalties found.</div>
                        ) : (
                            items.map(i => (
                                <div key={i.id} className="grid grid-cols-9 gap-4 items-center py-2 border-b text-sm">
                                    <div>{i.id}</div>
                                    <div>{i.amount}</div>
                                    <div>{i.paid_status ? 'Yes' : 'No'}</div>
                                    <div>{i.transaction_id ? `#${i.transaction_id}` : '-'}</div>
                                    <div>{i.borrow_transactions?.user_id ?? '-'}</div>
                                    <div>{i.borrow_transactions?.book_id ?? '-'}</div>
                                    <div>{i.borrow_transactions?.borrow_date ?? '-'}</div>
                                    <div>{i.borrow_transactions?.due_date ?? '-'}</div>
                                    <div className="truncate">{i.created_at ?? '-'}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
