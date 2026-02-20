'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { HealthRecord } from '@/types'
import { Activity, Droplet, Trash2 } from 'lucide-react'

export default function History() {
    const [records, setRecords] = useState<HealthRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'blood_pressure' | 'blood_sugar'>('all')

    useEffect(() => {
        fetchRecords()
    }, [])

    async function fetchRecords() {
        const { data, error } = await supabase
            .from('health_records')
            .select('*')
            .order('recorded_at', { ascending: false })

        if (!error && data) {
            setRecords(data)
        }
        setLoading(false)
    }

    async function handleDelete(id: string) {
        if (confirm('確定要刪除這筆紀錄嗎？')) {
            const { error } = await supabase.from('health_records').delete().eq('id', id)
            if (!error) {
                setRecords(records.filter(r => r.id !== id))
            } else {
                alert('刪除失敗')
            }
        }
    }

    const filteredRecords = records.filter(r => filter === 'all' || r.type === filter)

    if (loading) return <div className="p-8 text-center text-xl">載入中...</div>

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">歷史紀錄</h1>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {(['all', 'blood_pressure', 'blood_sugar'] as const).map(type => (
                    <button
                        key={type}
                        onClick={() => setFilter(type)}
                        className={`px-6 py-3 rounded-full font-bold whitespace-nowrap transition-colors ${filter === type
                                ? 'bg-gray-800 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {type === 'all' ? '全部' : type === 'blood_pressure' ? '血壓' : '血糖'}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filteredRecords.map(record => (
                    <div key={record.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${record.type === 'blood_pressure' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                                {record.type === 'blood_pressure' ? <Activity size={24} /> : <Droplet size={24} />}
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm">
                                    {new Date(record.recorded_at).toLocaleString('zh-TW', {
                                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                </p>
                                {record.type === 'blood_pressure' ? (
                                    <p className="text-2xl font-bold text-gray-800 mt-1">
                                        {record.value_1} <span className="text-gray-400 text-xl font-normal">/</span> {record.value_2}
                                        <span className="text-sm font-normal text-gray-500 ml-2">mmHg</span>
                                    </p>
                                ) : (
                                    <p className="text-2xl font-bold text-gray-800 mt-1">
                                        {record.value_1}
                                        <span className="text-sm font-normal text-gray-500 ml-2">mg/dL</span>
                                    </p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(record.id)}
                            className="text-gray-300 hover:text-red-500 p-2 transition-colors"
                        >
                            <Trash2 size={24} />
                        </button>
                    </div>
                ))}
                {filteredRecords.length === 0 && (
                    <p className="text-center text-gray-500 py-10 text-lg">沒有符合的記錄</p>
                )}
            </div>
        </div>
    )
}
