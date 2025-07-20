// src/lib/api-client.ts

interface ApiError {
    message: string;
}

const apiClient = {
    post: async <T>(path: string, body: object): Promise<T> => {
        
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) {
            throw new Error("API URL'i .env.local dosyasında tanımlanmamış.");
        }

        try {
            const response = await fetch(`${apiUrl}${path}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const result = await response.json();

            if (!response.ok) {
                // Hatanın tipini kontrol ederek fırlatıyoruz
                if (result && typeof result.message === 'string') {
                    throw new Error(result.message);
                }
                throw new Error('Sunucuda bilinmeyen bir hata oluştu.');
            }

            return result as T;

        } catch (error) {
            console.error(`API isteği hatası (${path}):`, error);
            // Gelen hatanın bir Error objesi olup olmadığını kontrol ediyoruz
            if (error instanceof Error) {
                throw new Error(error.message);
            }
            throw new Error('Bilinmeyen bir ağ hatası oluştu.');
        }
    }
};

export default apiClient;