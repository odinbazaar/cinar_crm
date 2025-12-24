import { useState } from 'react'
import { LogIn, AlertCircle } from 'lucide-react'
import { authService } from '../services'

interface LoginPageProps {
    onLogin: () => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)

        try {
            // Backend API'ye giriş isteği gönder
            const response = await authService.login({ email, password })

            // Başarılı giriş
            console.log('Login successful:', response.user)

            // Kullanıcı bilgilerini localStorage'a kaydet
            localStorage.setItem('user', JSON.stringify(response.user))
            localStorage.setItem('userId', response.user.id)

            // Ana sayfaya yönlendir
            onLogin()
        } catch (err: any) {
            console.error('Login error:', err)
            setError(err.message || 'Geçersiz e-posta veya şifre. Lütfen tekrar deneyin.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
                        <span className="text-3xl font-bold text-primary-600">Ç</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Çınar CRM</h1>
                    <p className="text-primary-100">Reklam Ajansı Yönetim Sistemi</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Giriş Yap</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                E-posta
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input"
                                placeholder="ornek@cinarajans.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Şifre
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                <span className="ml-2 text-sm text-gray-600">Beni hatırla</span>
                            </label>
                            <a href="#" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                                Şifremi unuttum
                            </a>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn btn-primary flex items-center justify-center gap-2 py-3"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Giriş yapılıyor...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Giriş Yap
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 font-medium mb-2">Demo Hesaplar:</p>
                        <div className="text-xs text-gray-500 space-y-1">
                            <p>Admin: admin@cinar.com / admin123</p>
                            <p>PM: pm@cinar.com / pm123</p>
                            <p>Designer: designer@cinar.com / designer123</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-primary-100 text-sm mt-6">
                    © 2024 Çınar Reklam Ajansı. Tüm hakları saklıdır.
                </p>
            </div>
        </div>
    )
}
