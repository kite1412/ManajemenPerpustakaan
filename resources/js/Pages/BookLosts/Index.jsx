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
    // penalty hover preview cache and state
    const [hoveredPenaltyId, setHoveredPenaltyId] = useState(null);
    const [penaltyCache, setPenaltyCache] = useState({});

    // transaction hover preview cache and state
    const [hoveredTransactionId, setHoveredTransactionId] = useState(null);
    const [transactionCache, setTransactionCache] = useState({});

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
            // fetch admins for verification selection
            const res = await axios.get('/api/admins');
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

    const deleteReport = async (id) => {
        if(!confirm('Delete this book lost report?')) return;
        try{
            await axios.delete(`/api/book_losts/${id}`);
            fetchAll();
        }catch(err){
            console.error(err);
            alert('Failed to delete report');
        }
    };

    const fetchPenaltyDetail = async (id) => {
        if(!id) return null;
        // already cached
        if(penaltyCache[id]) return penaltyCache[id];
        try{
            const res = await axios.get(`/api/penalties/${id}`);
            const payload = (res.data && res.data.payload) ? res.data.payload : res.data;
            console.log('Fetched penalty detail:', payload);
            setPenaltyCache(prev=> ({ ...prev, [id]: payload }));
            return payload;
        }catch(err){
            setPenaltyCache(prev=> ({ ...prev, [id]: { error: true } }));
            return { error: true };
        }
    };

    const onHoverPenalty = async (id) => {
        if(!id) return;
        setHoveredPenaltyId(id);
        await fetchPenaltyDetail(id);
    };

    const onLeavePenalty = () => {
        setHoveredPenaltyId(null);
    };

    const fetchTransactionDetail = async (id) => {
        if(!id) return null;
        if(transactionCache[id]) return transactionCache[id];
        try{
            const res = await axios.get(`/api/transactions/${id}`);
            const payload = (res.data && res.data.payload) ? res.data.payload : res.data;
            console.log('Fetched transaction detail:', payload);
            setTransactionCache(prev=> ({ ...prev, [id]: payload }));
            return payload;
        }catch(err){
            setTransactionCache(prev=> ({ ...prev, [id]: { error: true } }));
            return { error: true };
        }
    };

    const onHoverTransaction = async (id) => {
        if(!id) return;
        setHoveredTransactionId(id);
        await fetchTransactionDetail(id);
    };

    const onLeaveTransaction = () => {
        setHoveredTransactionId(null);
    };

    // status editor state
    const [editingStatusId, setEditingStatusId] = useState(null);
    const [statusValue, setStatusValue] = useState('REPORTED');
    const [statusVerifiedBy, setStatusVerifiedBy] = useState('');

    const startEditStatus = (item) => {
        setEditingStatusId(item.id);
        setStatusValue(item.report_status ?? item.status ?? 'REPORTED');
        setStatusVerifiedBy(item.verified_by ?? '');
    };

    const cancelEditStatus = ()=>{
        setEditingStatusId(null);
        setStatusValue('REPORTED');
        setStatusVerifiedBy('');
    };

    const saveStatus = async (id) => {
        try{
            await axios.put(`/api/book_losts/${id}/status`, {
                report_status: statusValue,
                verified_by: statusVerifiedBy || null,
            });
            cancelEditStatus();
            fetchAll();
        }catch(err){
            console.error(err);
            alert('Failed to update status');
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
                                    <div className="truncate">
                                        {(() => {
                                            const tId = i.transaction_id ?? i.transaction?.id ?? null;
                                            const ccode = i.copy?.unique_code ?? i.copy_unique_code ?? i.copy_id;
                                            const tdata = transactionCache[tId];
                                            return (
                                                <div className="relative inline-block" onMouseEnter={()=>tId && onHoverTransaction(tId)} onMouseLeave={onLeaveTransaction}>
                                                    {tId ? (
                                                        <div>
                                                            <span className="underline cursor-pointer mr-2">#{tId}</span>
                                                            <div className="text-xs text-gray-500 truncate">{ccode}</div>

                                                            {hoveredTransactionId === tId && (
                                                                <div className="mt-1 w-80 p-2 bg-white border rounded shadow text-xs z-20">
                                                                    {tdata ? (
                                                                        tdata.error ? (
                                                                            <div className="text-red-600">Failed to load transaction</div>
                                                                        ) : (
                                                                            <div className="space-y-1">
                                                                                {
                                                                                    (() => {
                                                                                        // transaction payloads sometimes nest under `users` and `book_copies`
                                                                                        const bookInfo = tdata.book ?? tdata.book_copies ?? tdata.book_copy ?? null;
                                                                                        const userInfo = tdata.user ?? tdata.users ?? tdata.users ?? null;
                                                                                        return (
                                                                                            <div><strong>Book:</strong> {bookInfo ? (bookInfo.title ?? (bookInfo.unique_code ? `${bookInfo.unique_code} (book #${bookInfo.book_id ?? bookInfo.id ?? '-'})` : `#${bookInfo.book_id ?? bookInfo.id ?? '-'}`)) : `#${tdata.book_id ?? '-'}`}</div>
                                                                                        );
                                                                                    })()
                                                                                }
                                                                                <div><strong>Member:</strong> { (tdata.user?.name ?? tdata.users?.name ?? tdata.users?.username ?? tdata.user_name ?? `#${tdata.user_id ?? (tdata.users?.id ?? '-')}`) }</div>
                                                                                <div><strong>Borrowed:</strong> {tdata.borrow_date ?? tdata.created_at ?? '-'}</div>
                                                                                <div><strong>Due:</strong> {tdata.due_date ?? '-'}</div>
                                                                                <div><strong>Returned:</strong> {tdata.return_date ?? '-'}</div>
                                                                            </div>
                                                                        )
                                                                    ) : (
                                                                        <div>Loading…</div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-gray-500">{ccode}</div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                    <div className="truncate">{i.user?.name ?? i.user_name ?? i.user_id}</div>
                                    <div>
                                        {/** Show penalty id (hover to preview). The API may place penalty under `penalty` or `penalty_id` */}
                                        {(() => {
                                            const pId = i.penalty?.id ?? i.penalty_id ?? null;
                                            if(!pId) return <span className="text-gray-500">-</span>;
                                            const pdata = penaltyCache[pId];
                                            return (
                                                <div className="relative inline-block" onMouseEnter={()=>onHoverPenalty(pId)} onMouseLeave={onLeavePenalty}>
                                                    <span className="underline cursor-pointer">#{pId}</span>

                                                    {hoveredPenaltyId === pId && (
                                                        <div className="mt-1 w-72 p-2 bg-white border rounded shadow text-xs z-20">
                                                            {pdata ? (
                                                                pdata.error ? (
                                                                    <div className="text-red-600">Failed to load penalty</div>
                                                                ) : (
                                                                    <div className="space-y-1">
                                                                        <div><strong>Amount:</strong> {pdata.amount ?? pdata.total ?? '-'}</div>
                                                                        <div><strong>Transaction:</strong> #{pdata.transaction_id ?? pdata.borrow_transaction_id ?? '-'}</div>
                                                                        <div><strong>Created:</strong> {pdata.created_at ?? pdata.createdAt ?? '-'}</div>
                                                                        {pdata.note && <div className="truncate"><strong>Note:</strong> {pdata.note}</div>}
                                                                    </div>
                                                                )
                                                            ) : (
                                                                <div>Loading…</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                    <div>{i.report_date}</div>
                                    <div>{i.penalty?.amount ?? i.penalty_amount ?? '-'}</div>
                                    <div>
                                        {editingStatusId === i.id ? (
                                            <div className="flex items-center gap-2">
                                                <select className="border p-1 text-sm" value={statusValue} onChange={(e)=>setStatusValue(e.target.value)}>
                                                    <option value="REPORTED">REPORTED</option>
                                                    <option value="PAID">PAID</option>
                                                    <option value="VERIFIED">VERIFIED</option>
                                                </select>
                                                <select className="border p-1 text-sm" value={statusVerifiedBy} onChange={(e)=>setStatusVerifiedBy(e.target.value)}>
                                                    <option value="">None</option>
                                                    {users.map(u=> <option key={u.id} value={u.id}>{u.name ?? u.email ?? `#${u.id}`}</option>)}
                                                </select>
                                                <button type="button" onClick={()=>saveStatus(i.id)} className="px-2 py-1 bg-green-500 text-white rounded text-sm">Save</button>
                                                <button type="button" onClick={cancelEditStatus} className="px-2 py-1 bg-gray-300 text-gray-800 rounded text-sm">Cancel</button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div>{i.report_status ?? i.status ?? i.status}</div>
                                                <button type="button" onClick={()=>startEditStatus(i)} className="px-2 py-1 bg-yellow-200 text-gray-800 rounded text-sm">Edit Status</button>
                                                <button type="button" onClick={()=>deleteReport(i.id)} className="px-2 py-1 bg-red-500 text-white rounded text-sm">Delete</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
