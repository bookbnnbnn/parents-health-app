'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Activity } from 'lucide-react'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isSignUp, setIsSignUp] = useState(false)
    const router = useRouter()

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                })
                if (error) throw error
                alert('註冊成功！請查看信箱完成驗證（如果沒有開啟信箱驗證，可以直接登入）。')
                setIsSignUp(false)
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                router.push('/')
                router.refresh()
            }
        } catch (err: any) {
            setError(err.message || '發生錯誤，請稍後再試。')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-red-100 p-4 rounded-full mb-4 text-red-600">
                        <Activity size={40} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {isSignUp ? '建立健康記錄帳號' : '登入您的健康記錄'}
                    </h1>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 text-lg mb-2 font-medium">電子郵件</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors"
                            placeholder="name@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-lg mb-2 font-medium">密碼</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl text-lg text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors"
                            placeholder="輸入密碼 (至少 6 字元)"
                            required
                            minLength={6}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 text-white font-bold text-xl py-4 rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors shadow-md"
                    >
                        {loading ? '處理中...' : (isSignUp ? '註冊' : '登入')}
                    </button>
                </form>

                <div className="mt-8 text-center text-gray-600">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-red-600 hover:text-red-800 font-medium text-lg underline"
                    >
                        {isSignUp ? '已經有帳號了？點此登入' : '還沒有帳號？免費註冊'}
                    </button>
                </div>
            </div>
        </div>
    )
}
