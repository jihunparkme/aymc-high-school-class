-- 1. Grades Table
-- --- RESET (DROP TABLES) ---
-- Drop tables in reverse order of dependency or use CASCADE to handle foreign keys automatically.
DROP TABLE IF EXISTS weekly_records CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS classes CASCADE;
DROP TABLE IF EXISTS grades CASCADE;

-- --- TABLE CREATION ---

-- 1. Grades Table (학년)
CREATE TABLE grades (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Classes Table (반)
CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    grade_id INTEGER REFERENCES grades(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    teacher_id INTEGER, -- Circular reference: Added via ALTER TABLE later
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Students Table (학생)
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('남', '여')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Teachers Table (교사)
CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Weekly Records Table (주간 기록: 출석, 특이사항, 기도제목)
CREATE TABLE weekly_records (
    id BIGSERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    week_id VARCHAR(50) NOT NULL, -- Format: 'YYYY년 MM월 N주차'
    attendance BOOLEAN DEFAULT false,
    notes TEXT,
    prayer_requests TEXT, -- Stored as newline-separated text
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, week_id) -- Ensure one record per student per week
);

-- --- CONSTRAINTS & INDEXES ---

-- Add Foreign Key for classes.teacher_id (Circular Reference Resolution)
ALTER TABLE classes ADD CONSTRAINT fk_classes_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL;

-- --- RLS (ROW LEVEL SECURITY) ---
-- Enabling RLS for all tables.
-- Currently configured for public access (development mode).

ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_records ENABLE ROW LEVEL SECURITY;

-- Read Policies
CREATE POLICY "Allow public read access on grades" ON grades FOR SELECT USING (true);
CREATE POLICY "Allow public read access on classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Allow public read access on students" ON students FOR SELECT USING (true);
CREATE POLICY "Allow public read access on teachers" ON teachers FOR SELECT USING (true);
CREATE POLICY "Allow public read access on weekly_records" ON weekly_records FOR SELECT USING (true);

-- Insert Policies
CREATE POLICY "Allow public insert access on grades" ON grades FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access on classes" ON classes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access on students" ON students FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access on teachers" ON teachers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert access on weekly_records" ON weekly_records FOR INSERT WITH CHECK (true);

-- Update Policies
CREATE POLICY "Allow public update access on grades" ON grades FOR UPDATE USING (true);
CREATE POLICY "Allow public update access on classes" ON classes FOR UPDATE USING (true);
CREATE POLICY "Allow public update access on students" ON students FOR UPDATE USING (true);
CREATE POLICY "Allow public update access on teachers" ON teachers FOR UPDATE USING (true);
CREATE POLICY "Allow public update access on weekly_records" ON weekly_records FOR UPDATE USING (true);

-- Delete Policies
CREATE POLICY "Allow public delete access on grades" ON grades FOR DELETE USING (true);
CREATE POLICY "Allow public delete access on classes" ON classes FOR DELETE USING (true);
CREATE POLICY "Allow public delete access on students" ON students FOR DELETE USING (true);
CREATE POLICY "Allow public delete access on teachers" ON teachers FOR DELETE USING (true);
CREATE POLICY "Allow public delete access on weekly_records" ON weekly_records FOR DELETE USING (true);

-- --- SAMPLE DATA INSERTION ---

-- 1. Insert Grades
INSERT INTO grades (name) VALUES
('1학년'),
('2학년'),
('3학년');

-- 2. Insert Classes
-- Note: teacher_id is initially NULL
INSERT INTO classes (grade_id, name) VALUES
(1, '1반'),
(1, '2반'),
(1, '3반'),
(1, '4반'),
(2, '1반'),
(2, '2반'),
(2, '3반'),
(3, '1반'),
(3, '2반'),
(3, '3반');

-- 3. Insert Students
INSERT INTO students (class_id, name, gender) VALUES
-- 1학년 1반 (Class ID 1)
(1, '이준호', '남'),
(1, '김하늘', '여'),
(1, '박미현', '여'),
(1, '정성은', '여'),
(1, '이서윤', '여'),
(1, '오준석', '남'),
(1, '정유진', '여'),
(1, '최은준', '남'),
(1, '한지원', '여'),
-- 1학년 2반 (Class ID 2)
(2, '박준혁', '남'),
(2, '정예은', '여'),
(2, '김진호', '남'),
(2, '이현지', '여'),
(2, '최민준', '남'),
(2, '권서진', '여'),
(2, '오지수', '여'),
(2, '박선주', '여'),
(2, '한승환', '남'),
(2, '정민지', '여'),
-- 1학년 3반 (Class ID 3)
(3, '강민수', '남'),
(3, '이소현', '여'),
(3, '김지호', '남'),
(3, '박영준', '남'),
(3, '정다은', '여'),
(3, '오예진', '여'),
(3, '최준서', '남'),
(3, '한나연', '여'),
(3, '권혜진', '여'),
(3, '이우진', '남'),
-- 1학년 4반 (Class ID 4)
(4, '누구', '남'),
-- 2학년 1반 (Class ID 5)
(5, '박준영', '남'),
(5, '정서은', '여'),
(5, '김준호', '남'),
(5, '이나영', '여'),
(5, '오은정', '여'),
(5, '강현진', '남'),
(5, '최지환', '남'),
(5, '한승현', '남'),
(5, '권준호', '남'),
(5, '정혜미', '여'),
-- 2학년 2반 (Class ID 6)
(6, '이준혁', '남'),
(6, '박지은', '여'),
(6, '김소정', '여'),
(6, '정우진', '남'),
(6, '오미정', '여'),
(6, '최서영', '여'),
(6, '한준석', '남'),
(6, '권지현', '여'),
(6, '강나연', '여'),
(6, '정민서', '여'),
-- 2학년 3반 (Class ID 7)
(7, '박현준', '남'),
(7, '이지은', '여'),
(7, '김준서', '남'),
(7, '정혜진', '여'),
(7, '오준영', '남'),
(7, '최은지', '여'),
(7, '한민준', '남'),
(7, '권혜선', '여'),
(7, '강서진', '남'),
(7, '정준호', '남'),
-- 3학년 1반 (Class ID 8)
(8, '이현준', '남'),
(8, '박서영', '여'),
(8, '김준호', '남'),
(8, '정지은', '여'),
(8, '오은준', '남'),
(8, '최민지', '여'),
(8, '한준영', '남'),
(8, '권소정', '여'),
(8, '강준호', '남'),
(8, '정나연', '여'),
-- 3학년 2반 (Class ID 9)
(9, '박준혁', '남'),
(9, '이예은', '여'),
(9, '김지호', '남'),
(9, '정준서', '남'),
(9, '오서진', '남'),
(9, '최준호', '남'),
(9, '한지은', '여'),
(9, '권민준', '남'),
(9, '강혜진', '여'),
(9, '정우진', '남'),
-- 3학년 3반 (Class ID 10)
(10, '이준호', '남'),
(10, '박은진', '여'),
(10, '김준서', '남'),
(10, '정나영', '여'),
(10, '오지현', '여'),
(10, '최수진', '여'),
(10, '한준영', '남'),
(10, '권준호', '남'),
(10, '강은지', '여'),
(10, '정혜은', '여');

-- 4. Insert Teachers
INSERT INTO teachers (class_id, name) VALUES
(1, '김이선생님'),
(2, '이선생님'),
(3, '박선생님'),
(4, '누구선생'),
(5, '최선생님'),
(6, '한선생님'),
(7, '권선생님'),
(8, '조선생님'),
(9, '유선생님'),
(10, '이선생님');

-- 5. Update Classes with Teacher IDs (Linking back to teachers)
UPDATE classes SET teacher_id = 1 WHERE id = 1;
UPDATE classes SET teacher_id = 2 WHERE id = 2;
UPDATE classes SET teacher_id = 3 WHERE id = 3;
UPDATE classes SET teacher_id = 4 WHERE id = 4;
UPDATE classes SET teacher_id = 5 WHERE id = 5;
UPDATE classes SET teacher_id = 6 WHERE id = 6;
UPDATE classes SET teacher_id = 7 WHERE id = 7;
UPDATE classes SET teacher_id = 8 WHERE id = 8;
UPDATE classes SET teacher_id = 9 WHERE id = 9;
UPDATE classes SET teacher_id = 10 WHERE id = 10;

-- 6. Insert Weekly Records (Sample Data)
INSERT INTO weekly_records (student_id, week_id, attendance, notes, prayer_requests) VALUES
(1, '2026년 02월 2주차', true, '', 'ㅇㅇㅇㅇ'),
(6, '2026년 02월 2주차', true, 'ㅇㅇ', 'ㅎㅎ'),
(4, '2026년 02월 2주차', false, '감기', ''),
(31, '2026년 02월 1주차', true, '', '이전주 기도 제목'),
(32, '2026년 02월 1주차', false, '이전주 특이사항', ''),
(61, '2026년 02월 2주차', false, '', '결석인데 기도제목'),
(3, '2026년 02월 2주차', true, '', '기도제목');
