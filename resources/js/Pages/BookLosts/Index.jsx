import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Index(){
    const [items, setItems] = useState([]);
    const [users, setUsers] = useState([]);
    // copies are not required in the form anymore; copy_id will be derived from transaction
    const [transactions, setTransactions] = useState([]);

    // form state
    // copyId is not needed in the form; we'll derive it from the selected transaction
    const [transactionId, setTransactionId] = useState('');
    const [reportDate, setReportDate] = useState('');
    const [verifiedBy, setVerifiedBy] = useState('');
    const [penaltyAmount, setPenaltyAmount] = useState('');
    const [status, setStatus] = useState('REPORTED');
    const [loading, setLoading] = useState(false);

    useEffect(()=>{ fetchAll(); }, []);

    const fetchAll = async ()=>{
        fetchItems();
        fetchUsers();
        fetchTransactions();
    };

    const fetchItems = async ()=>{
        try{
            const res = await axios.get('/api/book_losts');
            const payload = (res.data && res.data.payload) ? res.data.payload : res.data;
            setItems(Array.isArray(payload) ? payload : []);
        }catch(e){ setItems([]); }
    };

    const fetchUsers = async ()=>{
        try{
            const res = await axios.get('/api/members');
            const payload = (res.data && res.data.payload) ? res.data.payload : res.data;
            setUsers(Array.isArray(payload) ? payload : []);
        }catch(e){ setUsers([]); }
    };

    // copies fetching removed — copy is derived from transaction.book_id

    const fetchTransactions = async ()=>{
        try{
            const res = await axios.get('/api/transactions');
            const payload = (res.data && res.data.payload) ? res.data.payload : res.data;
            setTransactions(Array.isArray(payload) ? payload : []);
        }catch(e){ setTransactions([]); }
    };

    const submit = async (e)=>{
        e.preventDefault();

        // require transaction_id and amount for penalty creation per your instruction
        if(!transactionId || !penaltyAmount){
            alert('Please provide transaction and penalty amount');
            return;
        }

        if(!reportDate){
            alert('Please provide report date');
            return;
        }

        setLoading(true);
        try{
            // 1) create penalty
            const penRes = await axios.post('/api/penalties', {
                transaction_id: transactionId,
                amount: Number(penaltyAmount),
            });
            const penalty = penRes.data && (penRes.data.payload || penRes.data) ? (penRes.data.payload || penRes.data) : null;
            const penaltyId = penalty && penalty.id ? penalty.id : (penRes.data.id || null);

            if(!penaltyId){
                throw new Error('Failed to create penalty');
            }

            // POST to create book_lost — copy_id is derived server-side from transaction_id
            await axios.post('/api/book_losts', {
                transaction_id: transactionId || null,
                report_date: reportDate,
                verified_by: verifiedBy || null,
                penalty_id: penaltyId,
                report_status: status,
            });

            // reset
            setTransactionId(''); setReportDate(''); setVerifiedBy(''); setPenaltyAmount(''); setStatus('REPORTED');

            // refresh lists
            fetchAll();
        }catch(err){
            console.error(err);
            alert('Error creating penalty or book lost. See console for details.');
        }finally{
            setLoading(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Reported Lost Books" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold mb-4">Lost Books</h1>

                    {/* Form to report lost book (creates penalty first) */}
                    <form onSubmit={submit} className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-3">
                        {/* Copy is derived from the selected transaction; no manual selection needed */}

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Transaction</label>
                            <select className="w-full border p-2" value={transactionId} onChange={(e)=>setTransactionId(e.target.value)}>
                                <option value="">Select transaction</option>
                                {transactions.map(t=> (
                                    <option key={t.id} value={t.id}>#{t.id} — {t.book?.title ?? t.book_title ?? `book:${t.book_id}`}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Report Date</label>
                            <input type="date" className="border p-2 w-full" value={reportDate} onChange={(e)=>setReportDate(e.target.value)} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Verified By (optional)</label>
                            <select className="w-full border p-2" value={verifiedBy} onChange={(e)=>setVerifiedBy(e.target.value)}>
                                <option value="">None</option>
                                {users.map(u=> <option key={u.id} value={u.id}>{u.name ?? u.email ?? `#${u.id}`}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Penalty Amount</label>
                            <input type="number" step="0.01" className="border p-2 w-full" value={penaltyAmount} onChange={(e)=>setPenaltyAmount(e.target.value)} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select className="w-full border p-2" value={status} onChange={(e)=>setStatus(e.target.value)}>
                                <option value="REPORTED">REPORTED</option>
                                <option value="PAID">PAID</option>
                                <option value="VERIFIED">VERIFIED</option>
                            </select>
                        </div>

                        <div className="md:col-span-6">
                            <button disabled={loading} className="px-4 py-2 rounded bg-brand text-gray-800">{loading ? 'Saving...' : 'Report Lost Book'}</button>
                        </div>
                    </form>

                    {/* Grid of reported lost books */}
                    <div className="overflow-x-auto">
                        <div className="grid grid-cols-7 gap-4 font-semibold border-b pb-2 text-sm">
                            <div>ID</div>
                            <div>Transaction</div>
                            <div>Member Name</div>
                            <div>Penalty ID</div>
                            <div>Report Date</div>
                            <div>Penalty Amount</div>
                            <div>Report Status</div>
                        </div>

                        {items.length === 0 ? (
                            <div className="py-4 text-sm">No reported lost books.</div>
                        ) : (
                            items.map(i=> (
                                <div key={i.id} className="grid grid-cols-7 gap-4 items-center py-2 border-b text-sm">
                                    <div>{i.id}</div>
                                    <div className="truncate">{i.copy?.unique_code ?? i.copy_unique_code ?? i.copy_id}</div>
                                    <div className="truncate">{i.user?.name ?? i.user_name ?? i.user_id}</div>
                                    <div>#{i.transaction_id}</div>
                                    <div>{i.report_date}</div>
                                    <div>{i.penalty?.amount ?? i.penalty_amount ?? '-'}</div>
                                    <div>{i.report_status ?? i.status ?? i.status}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
