import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

export default function Login({ status, canResetPassword }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [errors, setErrors] = useState({});

    const submit = async (e) => {
        e.preventDefault();

        // First: request API token so the SPA can use it for API calls
        try {
            const res = await axios.post('/api/login', {
                login: email,
                password,
            });
            const token = res.data.access_token;
            localStorage.setItem('api_token', token);
            // set axios default header for subsequent API requests
            window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (err) {
            // Show the error and stop; do not attempt web login if API auth failed
            if (err.response && err.response.data) {
                setErrors({ form: err.response.data.message || 'Login failed' });
            } else {
                setErrors({ form: 'Login failed' });
            }
            return;
        }

        // Then create the web session (so server-side auth and redirects work)
        router.post(route('login'), { email, password }, {
            onError: (errs) => {
                setErrors(errs || { form: 'Login failed' });
            },
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

                {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

                {errors.form && (
                    <div className="mb-4 text-sm font-medium text-red-600">
                        {errors.form}
                    </div>
                )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={email}
                        className="block w-full mt-1"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={password}
                        className="block w-full mt-1"
                        autoComplete="current-password"
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="block mt-4">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                        />
                        <span className="text-sm text-gray-600 ms-2">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="flex items-center justify-end mt-4">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm text-gray-600 underline rounded-md hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Forgot your password?
                        </Link>
                    )}

                    <PrimaryButton className="ms-4">
                        Log in
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
