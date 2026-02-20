'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Brush } from 'recharts'
import { HealthRecord } from '@/types'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function Trends() {
    const [records, setRecords] = useState<HealthRecord[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchRecords()
    }, [])

    async function fetchRecords() {
        const { data, error } = await supabase
            .from('health_records')
            .select('*')
            .order('recorded_at', { ascending: true })

        if (!error && data) {
            setRecords(data)
        }
        setLoading(false)
    }

    const bpRecords = records.filter(r => r.type === 'blood_pressure')
    const sugarRecords = records.filter(r => r.type === 'blood_sugar')

    const bpChartData = bpRecords.map(r => ({
        id: r.id,
        time: new Date(r.recorded_at).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }),
        收縮壓: r.value_1,
        舒張壓: r.value_2,
        完整時間: new Date(r.recorded_at).toLocaleString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }))

    const sugarChartData = sugarRecords.map(r => ({
        id: r.id,
        time: new Date(r.recorded_at).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }),
        血糖值: r.value_1,
        完整時間: new Date(r.recorded_at).toLocaleString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }))

    if (loading) return <div className="p-8 text-center text-xl">載入中...</div>

    return (
        <div className="p-6 pb-24 max-w-lg mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/" className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    <ArrowLeft size={24} />
                </Link>
                <h1 className="text-3xl font-bold text-gray-800">所有趨勢</h1>
            </div>

            {bpRecords.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">血壓歷史 (可滑動放大)</h2>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={bpChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="id"
                                    tickFormatter={(val) => {
                                        const item = bpChartData.find(d => d.id === val);
                                        return item ? item.time : '';
                                    }}
                                    tick={{ fontSize: 14 }} tickLine={false} axisLine={false}
                                />
                                <YAxis domain={['dataMin - 10', 'dataMax + 10']} tick={{ fontSize: 14 }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}
                                    labelFormatter={(label, payload) => {
                                        if (payload && payload.length > 0) return payload[0].payload.完整時間;
                                        return label;
                                    }}
                                />
                                <ReferenceLine y={140} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: '標準最高', fill: '#EF4444', fontSize: 12 }} />
                                <ReferenceLine y={90} stroke="#F59E0B" strokeDasharray="3 3" />
                                <Line type="monotone" dataKey="收縮壓" stroke="#DC2626" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="舒張壓" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} />
                                <Brush dataKey="id" height={40} stroke="#9CA3AF" fill="#F3F4F6" tickFormatter={() => ''} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {sugarRecords.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">血糖歷史 (可滑動放大)</h2>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100 h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sugarChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis
                                    dataKey="id"
                                    tickFormatter={(val) => {
                                        const item = sugarChartData.find(d => d.id === val);
                                        return item ? item.time : '';
                                    }}
                                    tick={{ fontSize: 14 }} tickLine={false} axisLine={false}
                                />
                                <YAxis domain={['dataMin - 10', 'dataMax + 10']} tick={{ fontSize: 14 }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}
                                    labelFormatter={(label, payload) => {
                                        if (payload && payload.length > 0) return payload[0].payload.完整時間;
                                        return label;
                                    }}
                                />
                                <Line type="monotone" dataKey="血糖值" stroke="#2563EB" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                                <Brush dataKey="id" height={40} stroke="#9CA3AF" fill="#EFF6FF" tickFormatter={() => ''} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    )
}
