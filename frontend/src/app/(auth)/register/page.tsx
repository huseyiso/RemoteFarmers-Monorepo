// frontend/src/app/(auth)/register/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

type Role = 'member' | 'farmer';

export default function RegisterPage() {
    const [role, setRole] = useState<Role>('member');
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        farmName: '',
        latitude: '',
        longitude: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const submissionData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: role,
        ...(role === 'farmer' && {
            farmName: formData.farmName,
            location: {
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude)
            }
        })
    };
    
    try {
        // Backend'den dönecek verinin tipini (interface) tanımlayabiliriz.
        // Bu, 'response'un tipini 'unknown' olmaktan kurtarır.
        interface RegisterResponse {
            message: string;
            user: {
                first_name: string;
            };
        }

        const response = await apiClient.post<RegisterResponse>('/api/auth/register', submissionData);
        
        alert(`Kayıt başarılı! Hoş geldin ${response.user.first_name}.`);
        
    } catch (error) {
        // Hatanın tipini kontrol ederek mesajını güvenle kullanıyoruz
        if (error instanceof Error) {
            alert(`Kayıt başarısız: ${error.message}`);
        } else {
            alert('Bilinmeyen bir hata oluştu.');
        }
    }
};

    const inputStyle = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500";
    const primaryButton = 'w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500';
    const activeRoleStyle = 'bg-green-600 text-white border-green-600 z-10';
    const inactiveRoleStyle = 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50';

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12">
            <div className="p-8 bg-white rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Hesap Oluştur</h2>
                
                <div className="flex justify-center mb-6 rounded-md shadow-sm" role="group">
                    <button
                        type="button"
                        onClick={() => setRole('member')}
                        className={`px-6 py-2 text-sm font-medium rounded-l-lg border ${role === 'member' ? activeRoleStyle : inactiveRoleStyle}`}
                    >
                        Üye
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('farmer')}
                        className={`px-6 py-2 text-sm font-medium rounded-r-lg border-t border-b border-r ${role === 'farmer' ? activeRoleStyle : inactiveRoleStyle}`}
                    >
                        Çiftçi
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex space-x-4">
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700">İsim</label>
                            <input name="firstName" type="text" value={formData.firstName} onChange={handleInputChange} className={inputStyle} required />
                        </div>
                        <div className="w-1/2">
                            <label className="block text-sm font-medium text-gray-700">Soyisim</label>
                            <input name="lastName" type="text" value={formData.lastName} onChange={handleInputChange} className={inputStyle} required />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">E-posta</label>
                        <input name="email" type="email" value={formData.email} onChange={handleInputChange} className={inputStyle} required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Şifre</label>
                        <input name="password" type="password" value={formData.password} onChange={handleInputChange} className={inputStyle} required />
                    </div>
                    
                    {role === 'farmer' && (
                        <div className="pt-4 border-t border-gray-200 space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700 text-center">Çiftçi Bilgileri</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Çiftlik Adı</label>
                                <input name="farmName" type="text" value={formData.farmName} onChange={handleInputChange} className={inputStyle} required={role === 'farmer'} />
                            </div>
                            <div className="flex space-x-4">
                                <div className='w-1/2'>
                                    <label className="block text-sm font-medium text-gray-700">Konum (Enlem)</label>
                                    <input name="latitude" type="text" value={formData.latitude} onChange={handleInputChange} className={inputStyle} placeholder="Örn: 36.8969" required={role === 'farmer'} />
                                </div>
                                <div className='w-1/2'>
                                    <label className="block text-sm font-medium text-gray-700">Konum (Boylam)</label>
                                    <input name="longitude" type="text" value={formData.longitude} onChange={handleInputChange} className={inputStyle} placeholder="Örn: 30.7133" required={role === 'farmer'} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <button type="submit" className={primaryButton}>
                            Hesap Oluştur
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Zaten bir hesabın var mı?{' '}
                        <Link href="/login" className="font-medium text-green-600 hover:text-green-500">
                            Giriş yap
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}