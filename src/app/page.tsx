'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { HealthRecord } from '@/types'
import { LogOut } from 'lucide-react'

export default function Home() {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    checkUser()
    fetchRecords()
  }, [])

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
    } else {
      setUserName(session.user.email?.split('@')[0] || '長輩')
    }
  }

  async function fetchRecords() {
    const { data, error } = await supabase
      .from('health_records')
      .select('*')
      .eq('type', 'blood_pressure') // 目前先顯示血壓
      .order('recorded_at', { ascending: true })
      .limit(14) // 顯示最近 14 筆

    if (error) {
      console.error('Error fetching records:', error)
    } else {
      setRecords(data || [])
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // 格式化資料給圖表使用
  const chartData = records.map(r => ({
    time: new Date(r.recorded_at).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }),
    收縮壓: r.value_1,
    舒張壓: r.value_2,
    完整時間: new Date(r.recorded_at).toLocaleString('zh-TW')
  }))

  const lastRecord = records[records.length - 1]

  const getStatusColor = (sys?: number, dia?: number) => {
    if (!sys || !dia) return 'bg-gray-100 text-gray-800'
    if (sys >= 140 || dia >= 90) return 'bg-red-100 text-red-800 border-red-200' // 高血壓
    if (sys >= 130 || dia >= 80) return 'bg-yellow-100 text-yellow-800 border-yellow-200' // 偏高
    return 'bg-green-100 text-green-800 border-green-200' // 正常
  }
  const getStatusText = (sys?: number, dia?: number) => {
    if (!sys || !dia) return '無資料'
    if (sys >= 140 || dia >= 90) return '偏高要注意！'
    if (sys >= 130 || dia >= 80) return '稍微偏高'
    return '血壓正常，繼續保持！'
  }

  if (loading) return <div className="p-8 text-center text-xl">載入中...</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{userName} 的健康日誌</h1>
        <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-600 transition">
          <LogOut size={28} />
        </button>
      </div>

      {lastRecord ? (
        <div className={`p-6 rounded-2xl border-2 mb-8 shadow-sm ${getStatusColor(lastRecord.value_1, lastRecord.value_2)}`}>
          <h2 className="text-lg font-medium mb-2">最新測量結果 ({new Date(lastRecord.recorded_at).toLocaleDateString('zh-TW')})</h2>
          <div className="flex gap-4 items-baseline">
            <div className="text-5xl font-black">{lastRecord.value_1}</div>
            <div className="text-3xl text-gray-600 font-bold">/</div>
            <div className="text-5xl font-black">{lastRecord.value_2}</div>
            <span className="text-lg font-medium opacity-80 mt-2">mmHg</span>
          </div>
          <p className="mt-4 text-xl font-bold">{getStatusText(lastRecord.value_1, lastRecord.value_2)}</p>
        </div>
      ) : (
        <div className="p-8 text-center bg-gray-50 rounded-2xl mb-8 border border-gray-200">
          <p className="text-xl text-gray-600">目前還沒有記錄哦！</p>
          <p className="text-gray-500 mt-2">點擊下方按鈕新增第一筆資料</p>
        </div>
      )}

      {records.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">最近趨勢</h2>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="time" tick={{ fontSize: 14 }} tickLine={false} axisLine={false} />
                <YAxis domain={['dataMin - 10', 'dataMax + 10']} tick={{ fontSize: 14 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}
                />
                <ReferenceLine y={140} stroke="#EF4444" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: '標準最高', fill: '#EF4444', fontSize: 12 }} />
                <ReferenceLine y={90} stroke="#F59E0B" strokeDasharray="3 3" />
                <Line
                  type="monotone"
                  dataKey="收縮壓"
                  stroke="#DC2626"
                  strokeWidth={4}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="舒張壓"
                  stroke="#3B82F6"
                  strokeWidth={4}
                  dot={{ r: 4, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
