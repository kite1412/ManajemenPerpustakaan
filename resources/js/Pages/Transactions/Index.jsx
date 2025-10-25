import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Index(){
    const [txs, setTxs] = useState([]);
    const [users, setUsers] = useState([]);
    // books will hold one AVAILABLE copy per book { copyId, unique_code, bookId, title, ... }
    const [books, setBooks] = useState([]);

    // form state
    const [userId, setUserId] = useState('');
    const [bookId, setBookId] = useState('');
    const [borrowDate, setBorrowDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [editingReturnId, setEditingReturnId] = useState(null);
    const [returnDateValue, setReturnDateValue] = useState('');

    useEffect(()=>{
        fetchTxs();
        fetchUsers();
        fetchAvailableCopies();
    }, []);

    const fetchTxs = async ()=>{
        const res = await axios.get('/api/transactions');
        const payload = (res.data && res.data.payload) ? res.data.payload : res.data;
        setTxs(Array.isArray(payload) ? payload : []);
    };

    const fetchUsers = async ()=>{
        try{
            const res = await axios.get('/api/members');
            const payload = (res.data && res.data.payload) ? res.data.payload : res.data;
            setUsers(Array.isArray(payload) ? payload : []);
        }catch(e){
            setUsers([]);
        }
    };
    // Fetch available book copies and pick one copy per book (to avoid duplicate book options)
    const fetchAvailableCopies = async ()=>{
        try{
            // request AVAILABLE copies; backend may expect uppercase
            const res = await axios.get('/api/book_copies?status=AVAILABLE');
            const payload = (res.data && res.data.payload) ? res.data.payload : res.data;
            const copies = Array.isArray(payload) ? payload : [];

            // build map of bookId -> first available copy
            const map = new Map();
            copies.forEach(copy => {
                const bookObj = copy.books || copy.book || null; // handle possible keys
                const bookId = bookObj ? bookObj.id : copy.book_id;
                if (!map.has(bookId)) {
                    map.set(bookId, {
                        copyId: copy.id,
                        unique_code: copy.unique_code,
                        bookId: bookId,
                        title: bookObj ? bookObj.title : `#${bookId}`,
                        author: bookObj ? bookObj.author : null,
                        publisher: bookObj ? bookObj.publisher : null,
                    });
                }
            });

            setBooks(Array.from(map.values()));
        }catch(e){
            setBooks([]);
        }
    };

    const submit = async (e)=>{
        e.preventDefault();
        // Basic validation
        if(!userId || !bookId || !borrowDate || !dueDate){
            alert('Please fill required fields: user, book, borrow date, due date.');
            return;
        }

        try{
            const res1 = await axios.post('/api/transactions', {
                user_id: userId,
                book_id: bookId,
                borrow_date: borrowDate,
                due_date: dueDate,
                return_date: returnDate || null,
            });
            console.log('Transaction created:', res1.data);

            // reset
            setUserId('');
            setBookId('');
            setBorrowDate('');
            setDueDate('');
            setReturnDate('');

            // refresh lists
            fetchTxs();
            fetchAvailableCopies();
        }catch(err){
            console.error(err);
            alert('Failed to create transaction or update book copy. See console for details.');
        }
    };

    const startEditReturn = (tx) => {
        setEditingReturnId(tx.id);
        setReturnDateValue(tx.return_date ?? '');
    };

    const cancelEditReturn = () => {
        setEditingReturnId(null);
        setReturnDateValue('');
    };

    const saveReturnDate = async (id) => {
        if(!returnDateValue){
            alert('Please select a return date');
            return;
        }
        try{
            await axios.patch(`/api/transactions/${id}/return`, { return_date: returnDateValue });
            cancelEditReturn();
            fetchTxs();
            fetchAvailableCopies();
        }catch(err){
            console.error(err);
            alert('Failed to update return date');
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Transactions" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold mb-4">Transactions</h1>

                    {/* Create transaction form */}
                    <form onSubmit={submit} className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">User</label>
                            <select className="w-full border p-2" value={userId} onChange={(e)=>setUserId(e.target.value)}>
                                <option value="">Select user</option>
                                {users.map(u=> <option key={u.id} value={u.id}>{u.name || u.email || `#${u.id}`}</option>)}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Book (available copy)</label>
                            <select className="w-full border p-2" value={bookId} onChange={(e)=>setBookId(e.target.value)}>
                                <option value="">Select book</option>
                                {books.map(b=> (
                                    <option key={b.copyId} value={b.copyId}>{b.title} — {b.unique_code}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Borrow Date</label>
                            <input type="date" className="border p-2 w-full" value={borrowDate} onChange={(e)=>setBorrowDate(e.target.value)} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Due Date</label>
                            <input type="date" className="border p-2 w-full" value={dueDate} onChange={(e)=>setDueDate(e.target.value)} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Return Date (optional)</label>
                            <input type="date" className="border p-2 w-full" value={returnDate} onChange={(e)=>setReturnDate(e.target.value)} />
                        </div>

                        <div className="md:col-span-6">
                            <button className="px-4 py-2 rounded bg-brand text-gray-800">Create Transaction</button>
                        </div>
                    </form>

                    {/* Transactions grid */}
                    <div className="overflow-x-auto">
                        <div className="grid grid-cols-6 gap-4 font-semibold border-b pb-2 text-sm">
                            <div>ID</div>
                            <div>User</div>
                            <div>Book</div>
                            <div>Borrow Date</div>
                            <div>Due Date</div>
                            <div>Return Date</div>
                        </div>

                        {txs.length === 0 ? (
                            <div className="py-4 text-sm">No transactions yet.</div>
                        ) : (
                            txs.map(t=> (
                                <div key={t.id} className="grid grid-cols-6 gap-4 items-center py-2 border-b text-sm">
                                    <div>{t.id}</div>
                                    <div className="truncate">{t.user?.name ?? t.user_name ?? `#${t.user_id}`}</div>
                                    <div className="truncate">{t.book?.title ?? t.book_title ?? `#${t.book_id}`}</div>
                                    <div>{t.borrow_date}</div>
                                    <div>{t.due_date}</div>
                                    <div>
                                        {editingReturnId === t.id ? (
                                            <div className="flex items-center gap-2">
                                                <input type="date" className="border p-1 text-sm" value={returnDateValue} onChange={(e)=>setReturnDateValue(e.target.value)} />
                                                <button type="button" onClick={()=>saveReturnDate(t.id)} className="px-2 py-1 bg-green-500 text-white rounded text-sm">Save</button>
                                                <button type="button" onClick={cancelEditReturn} className="px-2 py-1 bg-gray-300 text-gray-800 rounded text-sm">Cancel</button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div>{t.return_date || '-'}</div>
                                                <button type="button" onClick={()=>startEditReturn(t)} className="px-2 py-1 bg-blue-200 text-gray-800 rounded text-sm">Set/Update</button>
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
