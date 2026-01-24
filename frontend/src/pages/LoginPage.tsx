import { useState } from 'react'
import { LogIn, AlertCircle, Users, Shield } from 'lucide-react'
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
            // Backend API'ye hem email hem password gönderiyoruz
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
                        <span className="text-3xl font-bold text-primary-600">İ</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">İzmir Açıkhava CRM</h1>
                    <p className="text-primary-100 font-medium">Reklam Ajansı Yönetim Sistemi</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 transition-all hover:shadow-primary-500/10">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900">Hoş Geldiniz</h2>
                        <p className="text-sm text-gray-500 mt-2">Devam etmek için lütfen giriş bilgilerinizi yazın</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                                Kullanıcı Adı / E-posta
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Users className="w-5 h-5" />
                                </span>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                                    placeholder="ornek@cinarajans.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                                Şifre
                            </label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Shield className="w-5 h-5" />
                                </span>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm animate-shake">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 disabled:opacity-50 disabled:transform-none"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Giriş yapılıyor...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Sisteme Güvenli Giriş Yap
                                </>
                            )}
                        </button>
                    </form>

                    {/* Quick Help */}
                    <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center">
                        <p className="text-xs text-center text-gray-400">
                            Şifrenizi unuttuysanız sistem yöneticisi ile iletişime geçin.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-primary-100 text-sm mt-10 opacity-70">
                    © 2026 İzmir Açıkhava Reklam Ajansı
                </p>
            </div>
        </div>
    )
}
