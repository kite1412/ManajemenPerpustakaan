import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

export default function Register() {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState({});
    const [phoneNumber, setPhoneNumber] = useState('');
    const [citizenId, setCitizenId] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/register', {
                username,
                name,
                email,
                phone_number: phoneNumber,
                citizen_id: citizenId,
                password,
                password_confirmation: passwordConfirmation,
            });
            // After register, redirect user to the login page instead of auto-login.
            window.location.href = '/login';
        } catch (err) {
            if (err.response && err.response.data) {
                setErrors(err.response.data.errors || { form: err.response.data.message });
            } else {
                setErrors({ form: 'Register failed' });
            }
        }
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="username" value="Username" />

                    <TextInput
                        id="username"
                        name="username"
                        value={username}
                        className="block w-full mt-1"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />

                    <InputError message={errors.username} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="name" value="Name" />

                    <TextInput
                        id="name"
                        name="name"
                        value={name}
                        className="block w-full mt-1"
                        autoComplete="name"
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={email}
                        className="block w-full mt-1"
                        autoComplete="username"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="phone_number" value="Phone Number" />

                    <TextInput
                        id="phone_number"
                        name="phone_number"
                        value={phoneNumber}
                        className="block w-full mt-1"
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />

                    <InputError message={errors.phone_number} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="citizen_id" value="Citizen ID" />

                    <TextInput
                        id="citizen_id"
                        name="citizen_id"
                        value={citizenId}
                        className="block w-full mt-1"
                        onChange={(e) => setCitizenId(e.target.value)}
                    />

                    <InputError message={errors.citizen_id} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={password}
                        className="block w-full mt-1"
                        autoComplete="new-password"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={passwordConfirmation}
                        className="block w-full mt-1"
                        autoComplete="new-password"
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="flex items-center justify-end mt-4">
                    <Link
                        href={route('login')}
                        className="text-sm text-gray-600 underline rounded-md hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Already registered?
                    </Link>

                    <PrimaryButton className="ms-4" disabled={false}>
                        Register
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
