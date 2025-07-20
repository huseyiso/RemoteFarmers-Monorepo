// frontend/src/app/(auth)/login/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Yönlendirme için import ediyoruz
import apiClient from '@/lib/api-client';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter(); // Yönlendiriciyi kullanıma hazırlıyoruz

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            // Backend'den dönecek başarılı yanıtın tipini tanımlıyoruz
            interface LoginResponse {
                message: string;
                token: string;
                user: {
                    id: string;
                    email: string;
                    firstName: string;
                };
            }

            const response = await apiClient.post<LoginResponse>('/api/auth/login', {
                email,
                password,
            });

            // Başarılı giriş sonrası
            alert(`Giriş başarılı! Hoş geldin ${response.user.firstName}.`);

            // TODO: Gelen token'ı ve kullanıcı bilgisini tarayıcıda sakla (localStorage veya State Management)
            
            // Kullanıcıyı ana sayfaya veya dashboard'a yönlendir
            router.push('/dashboard'); // Şimdilik /dashboard diye bir sayfamız yok ama hedef bu.

        } catch (error) {
            // Hatanın tipini kontrol ederek mesajını güvenle kullanıyoruz
            if (error instanceof Error) {
                alert(`Giriş başarısız: ${error.message}`);
            } else {
                alert('Bilinmeyen bir hata oluştu.');
            }
        }
    };

    // Stil değişkenleri (daha sonra ortak bileşenlere taşınabilir)
    const inputStyle = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500";
    const primaryButton = 'w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500';

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="p-8 bg-white rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Giriş Yap</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">E-posta</label>
                        <input name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputStyle} required />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Şifre</label>
                        <input name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputStyle} required />
                    </div>

                    <div>
                        <button type="submit" className={primaryButton}>Giriş Yap</button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Hesabın yok mu?{' '}
                        <Link href="/register" className="font-medium text-green-600 hover:text-green-500">
                            Hemen kaydol
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}