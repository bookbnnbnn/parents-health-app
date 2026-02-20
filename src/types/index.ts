export type HealthRecord = {
    id: string
    user_id: string
    type: 'blood_pressure' | 'blood_sugar'
    value_1: number // 收縮壓 or 血糖值
    value_2?: number // 舒張壓 null for blood sugar
    value_3?: number // 心率 null for blood sugar
    unit: string
    recorded_at: string
    note?: string
    created_at: string
}
