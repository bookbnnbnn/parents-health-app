'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { CheckCircle, Activity, Droplet } from 'lucide-react'

export default function AddRecord() {
    const router = useRouter()
    const [type, setType] = useState<'blood_pressure' | 'blood_sugar'>('blood_pressure')
    const [sys, setSys] = useState('')
    const [dia, setDia] = useState('')
    const [pulse, setPulse] = useState('')
    const [sugar, setSugar] = useState('')
    const [recordedAt, setRecordedAt] = useState(() => {
        const tzoffset = (new Date()).getTimezoneOffset() * 60000;
        return new Date(Date.now() - tzoffset).toISOString().slice(0, 16);
    })
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
            router.push('/login')
            return
        }

        try {
            const userName = session.user.user_metadata?.name || session.user.email?.split('@')[0] || '';

            const recordData = type === 'blood_pressure'
                ? {
                    user_id: session.user.id,
                    user_name: userName,
                    type: 'blood_pressure',
                    value_1: parseInt(sys),
                    value_2: parseInt(dia),
                    value_3: pulse ? parseInt(pulse) : null,
                    unit: 'mmHg',
                    recorded_at: new Date(recordedAt).toISOString(),
                }
                : {
                    user_id: session.user.id,
                    user_name: userName,
                    type: 'blood_sugar',
                    value_1: parseInt(sugar),
                    unit: 'mg/dL',
                    recorded_at: new Date(recordedAt).toISOString(),
                }

            const { error } = await supabase.from('health_records').insert([recordData])

            if (error) throw error

            setSuccess(true)
            setTimeout(() => {
                router.push('/')
                router.refresh()
            }, 1500)
        } catch (error) {
            console.error('Error adding record:', error)
            alert('儲存失敗，請重試。')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-green-50">
                <CheckCircle size={80} className="text-green-500 mb-6" />
                <h2 className="text-3xl font-bold text-green-700">記錄成功！</h2>
                <p className="text-gray-600 mt-2 text-lg">正在返回主畫面...</p>
            </div>
        )
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">新增健康記錄</h1>

            <div className="flex gap-4 mb-8">
                <button
                    onClick={() => setType('blood_pressure')}
                    className={`flex-1 py-4 px-2 rounded-xl text-lg font-bold flex flex-col items-center gap-2 border-2 transition-all ${type === 'blood_pressure'
                        ? 'bg-red-50 border-red-500 text-red-700 shadow-md'
                        : 'bg-white border-gray-200 text-gray-500'
                        }`}
                >
                    <Activity size={32} />
                    血壓
                </button>
                <button
                    onClick={() => setType('blood_sugar')}
                    className={`flex-1 py-4 px-2 rounded-xl text-lg font-bold flex flex-col items-center gap-2 border-2 transition-all ${type === 'blood_sugar'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md'
                        : 'bg-white border-gray-200 text-gray-500'
                        }`}
                >
                    <Droplet size={32} />
                    血糖
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-gray-700 text-xl mb-2 font-bold">測量時間</label>
                    <input
                        type="datetime-local"
                        value={recordedAt}
                        onChange={(e) => setRecordedAt(e.target.value)}
                        className="w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl text-xl text-gray-900 font-bold focus:outline-none focus:border-gray-500"
                        required
                    />
                </div>
                {type === 'blood_pressure' ? (
                    <>
                        <div>
                            <label className="block text-gray-700 text-xl mb-2 font-bold">收縮壓 (高的)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={sys}
                                    onChange={(e) => setSys(e.target.value)}
                                    className="w-full px-6 py-5 bg-white border-2 border-gray-200 rounded-2xl text-4xl text-gray-900 font-bold focus:outline-none focus:border-red-500"
                                    pattern="\d*"
                                    required
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">mmHg</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-xl mb-2 font-bold">舒張壓 (低的)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={dia}
                                    onChange={(e) => setDia(e.target.value)}
                                    className="w-full px-6 py-5 bg-white border-2 border-gray-200 rounded-2xl text-4xl text-gray-900 font-bold focus:outline-none focus:border-blue-500"
                                    pattern="\d*"
                                    required
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">mmHg</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-xl mb-2 font-bold">心跳 (選填)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={pulse}
                                    onChange={(e) => setPulse(e.target.value)}
                                    className="w-full px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl text-2xl text-gray-900 font-bold focus:outline-none focus:border-gray-500"
                                    pattern="\d*"
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">下/分</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div>
                        <label className="block text-gray-700 text-xl mb-2 font-bold">血糖值</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={sugar}
                                onChange={(e) => setSugar(e.target.value)}
                                className="w-full px-6 py-5 bg-white border-2 border-gray-200 rounded-2xl text-4xl text-gray-900 font-bold focus:outline-none focus:border-blue-500"
                                pattern="\d*"
                                required
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">mg/dL</span>
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gray-900 text-white font-bold text-2xl py-6 rounded-2xl mt-8 shadow-lg active:scale-95 transition-transform"
                >
                    {loading ? '儲存中...' : '儲存紀錄'}
                </button>
            </form>
        </div>
    )
}
