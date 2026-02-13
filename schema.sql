-- Enable UUID extension (optional, but good practice)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Grades Table
CREATE TABLE grades (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Classes Table
CREATE TABLE classes (
    id VARCHAR(50) PRIMARY KEY,
    grade_id VARCHAR(50) REFERENCES grades(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    teacher_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Students Table
CREATE TABLE students (
    id VARCHAR(50) PRIMARY KEY,
    class_id VARCHAR(50) REFERENCES classes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('남', '여')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Weekly Records Table (Attendance & Notes)
-- Stores data per student per week
CREATE TABLE weekly_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(50) REFERENCES students(id) ON DELETE CASCADE,
    week_id VARCHAR(50) NOT NULL, -- Format: 'YYYY년 MM월 N주차'
    attendance BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, week_id) -- Ensure one record per student per week
);

-- 5. Prayer Requests Table
-- Stores multiple prayer requests per weekly record
CREATE TABLE prayer_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    weekly_record_id UUID REFERENCES weekly_records(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) Policies (Optional but recommended for Supabase)
-- For simplicity, we'll enable read/write for everyone for now.
-- In production, you should restrict this based on authentication.

ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public access (Modify as needed for auth)
CREATE POLICY "Allow public read access on grades" ON grades FOR SELECT USING (true);
CREATE POLICY "Allow public read access on classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Allow public read access on students" ON students FOR SELECT USING (true);
CREATE POLICY "Allow public read access on weekly_records" ON weekly_records FOR SELECT USING (true);
CREATE POLICY "Allow public read access on prayer_requests" ON prayer_requests FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on grades" ON grades FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access on classes" ON classes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access on students" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access on weekly_records" ON weekly_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access on prayer_requests" ON prayer_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access on grades" ON grades FOR UPDATE USING (true);
CREATE POLICY "Allow public update access on classes" ON classes FOR UPDATE USING (true);
CREATE POLICY "Allow public update access on students" ON students FOR UPDATE USING (true);
CREATE POLICY "Allow public update access on weekly_records" ON weekly_records FOR UPDATE USING (true);
CREATE POLICY "Allow public update access on prayer_requests" ON prayer_requests FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access on grades" ON grades FOR DELETE USING (true);
CREATE POLICY "Allow public delete access on classes" ON classes FOR DELETE USING (true);
CREATE POLICY "Allow public delete access on students" ON students FOR DELETE USING (true);
CREATE POLICY "Allow public delete access on weekly_records" ON weekly_records FOR DELETE USING (true);
CREATE POLICY "Allow public delete access on prayer_requests" ON prayer_requests FOR DELETE USING (true);

-- --- SAMPLE DATA INSERTION ---

-- 1. Insert Grades
INSERT INTO grades (id, name) VALUES
('1', '1학년'),
('2', '2학년'),
('3', '3학년');

-- 2. Insert Classes
INSERT INTO classes (id, grade_id, name, teacher_name) VALUES
('1-1', '1', '1반', '김이선생님'),
('1-2', '1', '2반', '이선생님'),
('1-3', '1', '3반', '박선생님'),
('1-4', '1', '4반', '누구선생'),
('2-1', '2', '1반', '최선생님'),
('2-2', '2', '2반', '한선생님'),
('2-3', '2', '3반', '권선생님'),
('3-1', '3', '1반', '조선생님'),
('3-2', '3', '2반', '유선생님'),
('3-3', '3', '3반', '이선생님');

-- 3. Insert Students
INSERT INTO students (id, class_id, name, gender) VALUES
-- 1학년 1반
('1-1-1', '1-1', '이준호', '남'),
('1-1-2', '1-1', '김하늘', '여'),
('1-1-3', '1-1', '박미현', '여'),
('1-1-4', '1-1', '정성은', '여'),
('1-1-5', '1-1', '이서윤', '여'),
('1-1-6', '1-1', '오준석', '남'),
('1-1-7', '1-1', '정유진', '여'),
('1-1-8', '1-1', '최은준', '남'),
('1-1-9', '1-1', '한지원', '여'),
-- 1학년 2반
('1-2-1', '1-2', '박준혁', '남'),
('1-2-2', '1-2', '정예은', '여'),
('1-2-3', '1-2', '김진호', '남'),
('1-2-4', '1-2', '이현지', '여'),
('1-2-5', '1-2', '최민준', '남'),
('1-2-6', '1-2', '권서진', '여'),
('1-2-7', '1-2', '오지수', '여'),
('1-2-8', '1-2', '박선주', '여'),
('1-2-9', '1-2', '한승환', '남'),
('1-2-10', '1-2', '정민지', '여'),
-- 1학년 3반
('1-3-1', '1-3', '강민수', '남'),
('1-3-2', '1-3', '이소현', '여'),
('1-3-3', '1-3', '김지호', '남'),
('1-3-4', '1-3', '박영준', '남'),
('1-3-5', '1-3', '정다은', '여'),
('1-3-6', '1-3', '오예진', '여'),
('1-3-7', '1-3', '최준서', '남'),
('1-3-8', '1-3', '한나연', '여'),
('1-3-9', '1-3', '권혜진', '여'),
('1-3-10', '1-3', '이우진', '남'),
-- 1학년 4반
('1-4-1', '1-4', '누구', '남'),
-- 2학년 1반
('2-1-1', '2-1', '박준영', '남'),
('2-1-2', '2-1', '정서은', '여'),
('2-1-3', '2-1', '김준호', '남'),
('2-1-4', '2-1', '이나영', '여'),
('2-1-5', '2-1', '오은정', '여'),
('2-1-6', '2-1', '강현진', '남'),
('2-1-7', '2-1', '최지환', '남'),
('2-1-8', '2-1', '한승현', '남'),
('2-1-9', '2-1', '권준호', '남'),
('2-1-10', '2-1', '정혜미', '여'),
-- 2학년 2반
('2-2-1', '2-2', '이준혁', '남'),
('2-2-2', '2-2', '박지은', '여'),
('2-2-3', '2-2', '김소정', '여'),
('2-2-4', '2-2', '정우진', '남'),
('2-2-5', '2-2', '오미정', '여'),
('2-2-6', '2-2', '최서영', '여'),
('2-2-7', '2-2', '한준석', '남'),
('2-2-8', '2-2', '권지현', '여'),
('2-2-9', '2-2', '강나연', '여'),
('2-2-10', '2-2', '정민서', '여'),
-- 2학년 3반
('2-3-1', '2-3', '박현준', '남'),
('2-3-2', '2-3', '이지은', '여'),
('2-3-3', '2-3', '김준서', '남'),
('2-3-4', '2-3', '정혜진', '여'),
('2-3-5', '2-3', '오준영', '남'),
('2-3-6', '2-3', '최은지', '여'),
('2-3-7', '2-3', '한민준', '남'),
('2-3-8', '2-3', '권혜선', '여'),
('2-3-9', '2-3', '강서진', '남'),
('2-3-10', '2-3', '정준호', '남'),
-- 3학년 1반
('3-1-1', '3-1', '이현준', '남'),
('3-1-2', '3-1', '박서영', '여'),
('3-1-3', '3-1', '김준호', '남'),
('3-1-4', '3-1', '정지은', '여'),
('3-1-5', '3-1', '오은준', '남'),
('3-1-6', '3-1', '최민지', '여'),
('3-1-7', '3-1', '한준영', '남'),
('3-1-8', '3-1', '권소정', '여'),
('3-1-9', '3-1', '강준호', '남'),
('3-1-10', '3-1', '정나연', '여'),
-- 3학년 2반
('3-2-1', '3-2', '박준혁', '남'),
('3-2-2', '3-2', '이예은', '여'),
('3-2-3', '3-2', '김지호', '남'),
('3-2-4', '3-2', '정준서', '남'),
('3-2-5', '3-2', '오서진', '남'),
('3-2-6', '3-2', '최준호', '남'),
('3-2-7', '3-2', '한지은', '여'),
('3-2-8', '3-2', '권민준', '남'),
('3-2-9', '3-2', '강혜진', '여'),
('3-2-10', '3-2', '정우진', '남'),
-- 3학년 3반
('3-3-1', '3-3', '이준호', '남'),
('3-3-2', '3-3', '박은진', '여'),
('3-3-3', '3-3', '김준서', '남'),
('3-3-4', '3-3', '정나영', '여'),
('3-3-5', '3-3', '오지현', '여'),
('3-3-6', '3-3', '최수진', '여'),
('3-3-7', '3-3', '한준영', '남'),
('3-3-8', '3-3', '권준호', '남'),
('3-3-9', '3-3', '강은지', '여'),
('3-3-10', '3-3', '정혜은', '여');

-- 4. Insert Weekly Records (Sample Data)
-- Note: UUIDs are generated automatically, but for sample data we need to know IDs to insert prayer requests.
-- We can use a CTE (Common Table Expression) or just insert and let the app handle it later.
-- Here, we'll insert records and then prayer requests separately assuming we know the flow.
-- Or better, use a DO block or just simple inserts.

-- 1-1-1 이준호 (2026년 02월 2주차)
INSERT INTO weekly_records (student_id, week_id, attendance, notes) VALUES
('1-1-1', '2026년 02월 2주차', true, '');

-- 1-1-6 오준석 (2026년 02월 2주차)
INSERT INTO weekly_records (student_id, week_id, attendance, notes) VALUES
('1-1-6', '2026년 02월 2주차', true, 'ㅇㅇ');

-- 1-1-4 정성은 (2026년 02월 2주차)
INSERT INTO weekly_records (student_id, week_id, attendance, notes) VALUES
('1-1-4', '2026년 02월 2주차', false, '감기');

-- 2-1-1 박준영 (2026년 02월 1주차)
INSERT INTO weekly_records (student_id, week_id, attendance, notes) VALUES
('2-1-1', '2026년 02월 1주차', true, '');

-- 2-1-2 정서은 (2026년 02월 1주차)
INSERT INTO weekly_records (student_id, week_id, attendance, notes) VALUES
('2-1-2', '2026년 02월 1주차', false, '이전주 특이사항');

-- 3-1-1 이현준 (2026년 02월 2주차)
INSERT INTO weekly_records (student_id, week_id, attendance, notes) VALUES
('3-1-1', '2026년 02월 2주차', false, '');

-- 1-1-3 박미현 (2026년 02월 2주차)
INSERT INTO weekly_records (student_id, week_id, attendance, notes) VALUES
('1-1-3', '2026년 02월 2주차', true, '');


-- 5. Insert Prayer Requests (Sample Data)
-- We need to link these to the weekly_records we just inserted.
-- In a real script, we'd select the ID. Here, we'll use a subquery.

-- 1-1-1 이준호
INSERT INTO prayer_requests (weekly_record_id, content)
SELECT id, 'ㅇㅇㅇㅇ' FROM weekly_records WHERE student_id = '1-1-1' AND week_id = '2026년 02월 2주차';

-- 1-1-6 오준석
INSERT INTO prayer_requests (weekly_record_id, content)
SELECT id, 'ㅎㅎ' FROM weekly_records WHERE student_id = '1-1-6' AND week_id = '2026년 02월 2주차';

-- 2-1-1 박준영
INSERT INTO prayer_requests (weekly_record_id, content)
SELECT id, '이전주 기도 제목' FROM weekly_records WHERE student_id = '2-1-1' AND week_id = '2026년 02월 1주차';

-- 3-1-1 이현준
INSERT INTO prayer_requests (weekly_record_id, content)
SELECT id, '결석인데 기도제목' FROM weekly_records WHERE student_id = '3-1-1' AND week_id = '2026년 02월 2주차';

-- 1-1-3 박미현
INSERT INTO prayer_requests (weekly_record_id, content)
SELECT id, '기도제목' FROM weekly_records WHERE student_id = '1-1-3' AND week_id = '2026년 02월 2주차';
