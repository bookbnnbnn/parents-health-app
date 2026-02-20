-- Supabase 資料庫初始化設定

-- 建立 health_records 資料表
CREATE TABLE health_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- 例如: 'blood_pressure', 'blood_sugar'
    value_1 NUMERIC, -- 收縮壓
    value_2 NUMERIC, -- 舒張壓
    value_3 NUMERIC, -- 心率 / 血糖值
    unit TEXT, -- 單位 (如: 'mmHg', 'mg/dL')
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 設定 Row Level Security (RLS) 保護資料安全
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

-- 允許使用者新增自己的資料
CREATE POLICY "Users can insert their own records" 
ON health_records FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 允許使用者看見自己的資料
CREATE POLICY "Users can view their own records" 
ON health_records FOR SELECT 
USING (auth.uid() = user_id);

-- 允許使用者更新自己的資料
CREATE POLICY "Users can update their own records" 
ON health_records FOR UPDATE 
USING (auth.uid() = user_id);

-- 允許使用者刪除自己的資料
CREATE POLICY "Users can delete their own records" 
ON health_records FOR DELETE 
USING (auth.uid() = user_id);
