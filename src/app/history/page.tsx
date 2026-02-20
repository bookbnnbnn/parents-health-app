'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { HealthRecord } from '@/types'
import { Activity, Droplet, Trash2, Edit2, X, Check } from 'lucide-react'

export default function History() {
    const [records, setRecords] = useState<HealthRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'blood_pressure' | 'blood_sugar'>('all')

    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState<{ value_1: string, value_2: string, recorded_at: string }>({ value_1: '', value_2: '', recorded_at: '' })

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

    function startEdit(record: HealthRecord) {
        setEditingId(record.id)

        // Convert to local datetime string for input type="datetime-local" (YYYY-MM-DDTHH:mm)
        const d = new Date(record.recorded_at)
        const tzoffset = d.getTimezoneOffset() * 60000
        const localISOTime = new Date(d.getTime() - tzoffset).toISOString().slice(0, 16)

        setEditForm({
            value_1: String(record.value_1),
            value_2: record.value_2 ? String(record.value_2) : '',
            recorded_at: localISOTime
        })
    }

    function cancelEdit() {
        setEditingId(null)
    }

    async function saveEdit(id: string, type: string) {
        if (!editForm.value_1 || (type === 'blood_pressure' && !editForm.value_2)) {
            alert('請填寫完整數值')
            return
        }

        const updateData: any = {
            value_1: Number(editForm.value_1),
            recorded_at: new Date(editForm.recorded_at).toISOString(),
        }
        if (type === 'blood_pressure') {
            updateData.value_2 = Number(editForm.value_2)
        }

        const { error } = await supabase.from('health_records').update(updateData).eq('id', id)
        if (!error) {
            setRecords(records.map(r => r.id === id ? { ...r, ...updateData } : r).sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()))
            setEditingId(null)
        } else {
            alert('更新失敗')
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
                    <div key={record.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        {editingId === record.id ? (
                            <div className="flex flex-col gap-3">
                                <div>
                                    <label className="text-sm text-gray-500 font-bold mb-1 block">測量時間</label>
                                    <input
                                        type="datetime-local"
                                        value={editForm.recorded_at}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, recorded_at: e.target.value }))}
                                        className="w-full border-2 border-gray-200 rounded-lg p-2 font-medium"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <label className="text-sm text-gray-500 font-bold mb-1 block">
                                            {record.type === 'blood_pressure' ? '收縮壓' : '血糖值'}
                                        </label>
                                        <input
                                            type="number"
                                            value={editForm.value_1}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, value_1: e.target.value }))}
                                            className="w-full border-2 border-gray-200 rounded-lg p-2 font-bold text-xl text-gray-900"
                                        />
                                    </div>
                                    {record.type === 'blood_pressure' && (
                                        <div className="flex-1">
                                            <label className="text-sm text-gray-500 font-bold mb-1 block">舒張壓</label>
                                            <input
                                                type="number"
                                                value={editForm.value_2}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, value_2: e.target.value }))}
                                                className="w-full border-2 border-gray-200 rounded-lg p-2 font-bold text-xl text-gray-900"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-end gap-2 mt-2">
                                    <button onClick={cancelEdit} className="p-2 text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200">
                                        <X size={24} />
                                    </button>
                                    <button onClick={() => saveEdit(record.id, record.type)} className="p-2 text-white bg-green-500 rounded-lg hover:bg-green-600 flex items-center gap-1 font-bold">
                                        <Check size={24} /> 儲存
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
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
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => startEdit(record)}
                                        className="text-gray-300 hover:text-blue-500 p-2 transition-colors"
                                    >
                                        <Edit2 size={24} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(record.id)}
                                        className="text-gray-300 hover:text-red-500 p-2 transition-colors"
                                    >
                                        <Trash2 size={24} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {filteredRecords.length === 0 && (
                    <p className="text-center text-gray-500 py-10 text-lg">沒有符合的記錄</p>
                )}
            </div>
        </div>
    )
}
