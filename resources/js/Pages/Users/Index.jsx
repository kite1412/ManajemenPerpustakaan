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
        const res = await axios.get('/api/members'); 
        setItems(res.data.payload || []); 
    };

    return (
        <AuthenticatedLayout>
            <Head title="Members" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold mb-4">Members</h1>
                    <div className="overflow-x-auto">
                        <div className="grid grid-cols-7 gap-4 font-semibold border-b pb-2 text-sm">
                            <div>ID</div>
                            <div>Username</div>
                            <div>Email</div>
                            <div>Name</div>
                            <div>Phone</div>
                            <div>Citizen ID</div>
                            <div>Role</div>
                        </div>

                        {items.length === 0 ? (
                            <div className="py-4 text-sm">No members found.</div>
                        ) : (
                            items.map(i => (
                                <div key={i.id} className="grid grid-cols-7 gap-4 items-center py-2 border-b text-sm">
                                    <div>{i.id}</div>
                                    <div className="truncate">{i.username}</div>
                                    <div className="truncate">{i.email}</div>
                                    <div className="truncate">{i.name ?? '-'}</div>
                                    <div className="truncate">{i.phone_number ?? '-'}</div>
                                    <div className="truncate">{i.citizen_id ?? '-'}</div>
                                    <div>{i.role ?? '-'}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
