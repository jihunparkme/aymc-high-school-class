import { supabase } from './supabaseClient'

// --- Date Helper Functions ---

export const getWeekOfMonth = (date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  return Math.ceil((date.getDate() + firstDay) / 7);
}

export const getWeekId = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const week = getWeekOfMonth(date);
  return `${year}년 ${String(month).padStart(2, '0')}월 ${week}주차`;
}

export const getWeekStartDateFromId = (weekId) => {
  const [year, month, week] = weekId.replace('년', '').replace('월', '').replace('주차', '').split(' ').map(Number);
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const dayOffset = (week - 1) * 7 - firstDayOfWeek;
  return new Date(year, month - 1, 1 + dayOffset);
};

export const getNextWeek = (date) => {
  const d = new Date(date)
  d.setDate(d.getDate() + 7)
  return d
}

export const getPreviousWeek = (date) => {
  const d = new Date(date)
  d.setDate(d.getDate() - 7)
  return d
}

export const getTodayWeek = () => {
  return new Date()
}

// --- Data Transformation Helpers ---

const transformSchoolData = (grades, classes, students, teachers) => {
  return {
    date: new Date().toISOString().split('T')[0],
    teachers: teachers.map(t => ({ id: t.id, name: t.name })),
    grades: grades.map(grade => ({
      gradeId: String(grade.id),
      gradeName: grade.name,
      classes: classes
        .filter(c => c.grade_id === grade.id)
        .map(c => ({
          classId: String(c.id),
          className: c.name,
          teacherId: c.teacher_id,
          teacherName: c.teachers ? c.teachers.name : '미정',
          students: students
            .filter(s => s.class_id === c.id)
            .map(s => ({
              studentId: String(s.id),
              name: s.name,
              gender: s.gender
            }))
        }))
    }))
  };
};

const transformDailyData = (weeklyRecords) => {
  const dailyData = {};
  weeklyRecords.forEach(record => {
    const studentIdStr = String(record.student_id);
    if (!dailyData[studentIdStr]) {
      dailyData[studentIdStr] = {};
    }
    
    const prayerRequestsArray = record.prayer_requests 
      ? record.prayer_requests.split('\n').filter(p => p.trim() !== '') 
      : [];

    dailyData[studentIdStr][record.week_id] = {
      attendance: record.attendance,
      notes: record.notes || '',
      prayerRequests: prayerRequestsArray
    };
  });
  return dailyData;
};

// --- Data Loading (Supabase) ---

export const loadFromSupabase = async () => {
  try {
    const [
      { data: grades, error: gradesError },
      { data: teachers, error: teachersError },
      { data: classes, error: classesError },
      { data: students, error: studentsError },
      { data: weeklyRecords, error: recordsError }
    ] = await Promise.all([
      supabase.from('grades').select('*').order('id'),
      supabase.from('teachers').select('*').order('name'),
      supabase.from('classes').select('*, teachers!teacher_id(id, name)').order('id'),
      supabase.from('students').select('*').order('id'),
      supabase.from('weekly_records').select('*')
    ]);

    if (gradesError) throw gradesError;
    if (teachersError) throw teachersError;
    if (classesError) throw classesError;
    if (studentsError) throw studentsError;
    if (recordsError) throw recordsError;

    const schoolData = transformSchoolData(grades, classes, students, teachers);
    const dailyData = transformDailyData(weeklyRecords);

    return { data: schoolData, dailyData };

  } catch (error) {
    console.error('Failed to load data from Supabase:', error);
    return { data: null, dailyData: {} };
  }
};

// --- Data Saving (Supabase Actions) ---

export const updateAttendance = async (studentId, weekId, attendance) => {
  try {
    const { error } = await supabase
      .from('weekly_records')
      .upsert({ 
        student_id: parseInt(studentId), 
        week_id: weekId, 
        attendance: attendance 
      }, { onConflict: 'student_id, week_id' })
      .select();

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating attendance:', error);
    return false;
  }
};

export const updateNotes = async (studentId, weekId, notes) => {
  try {
    const { error } = await supabase
      .from('weekly_records')
      .upsert({ 
        student_id: parseInt(studentId), 
        week_id: weekId, 
        notes: notes 
      }, { onConflict: 'student_id, week_id' });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating notes:', error);
    return false;
  }
};

export const addPrayerRequest = async (studentId, weekId, content) => {
  try {
    const { data: currentRecord } = await supabase
      .from('weekly_records')
      .select('prayer_requests')
      .eq('student_id', parseInt(studentId))
      .eq('week_id', weekId)
      .single();

    let currentRequestsText = '';
    if (currentRecord && currentRecord.prayer_requests) {
      currentRequestsText = currentRecord.prayer_requests;
    }

    const newRequestsText = currentRequestsText 
      ? `${currentRequestsText}\n${content}` 
      : content;

    const { error } = await supabase
      .from('weekly_records')
      .upsert({
        student_id: parseInt(studentId),
        week_id: weekId,
        prayer_requests: newRequestsText
      }, { onConflict: 'student_id, week_id' });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding prayer request:', error);
    return false;
  }
};

// --- Admin Actions (Direct DB Manipulation) ---

// Teacher Management
export const addTeacher = async (name) => {
  try {
    const { data, error } = await supabase
      .from('teachers')
      .insert({ name })
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error adding teacher:', error);
    return null;
  }
};

export const updateTeacher = async (id, name) => {
  try {
    const { error } = await supabase
      .from('teachers')
      .update({ name })
      .eq('id', parseInt(id));
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating teacher:', error);
    return false;
  }
};

export const removeTeacher = async (id) => {
  try {
    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', parseInt(id));
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing teacher:', error);
    return false;
  }
};

export const addClass = async (gradeId, classItem) => {
  try {
    const { data, error } = await supabase
      .from('classes')
      .insert({
        grade_id: parseInt(gradeId),
        name: classItem.className,
        teacher_id: classItem.teacherId ? parseInt(classItem.teacherId) : null
      })
      .select(`
        *,
        teachers!teacher_id (
          name
        )
      `);
    
    if (error) throw error;
    
    const created = data[0];
    return {
      ...created,
      teacher_name: created.teachers ? created.teachers.name : null
    };
  } catch (error) {
    console.error('Error adding class:', error);
    return null;
  }
};

export const removeClass = async (classId) => {
  try {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', parseInt(classId));
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing class:', error);
    return false;
  }
};

export const updateClass = async (classId, updates) => {
  try {
    const { error } = await supabase
      .from('classes')
      .update({
        name: updates.className,
        teacher_id: updates.teacherId ? parseInt(updates.teacherId) : null
      })
      .eq('id', parseInt(classId));

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating class:', error);
    return false;
  }
};

export const addStudent = async (classId, student) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .insert({
        class_id: parseInt(classId),
        name: student.name,
        gender: student.gender
      })
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error adding student:', error);
    return null;
  }
};

export const removeStudent = async (studentId) => {
  try {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', parseInt(studentId));

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error removing student:', error);
    return false;
  }
};

export const updateStudent = async (studentId, name) => {
  try {
    const { error } = await supabase
      .from('students')
      .update({ name: name })
      .eq('id', parseInt(studentId));

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating student:', error);
    return false;
  }
};

// --- Teacher Search ---
export const searchTeachers = async (query) => {
  try {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name');

    if (error) throw error;

    return data.map(t => ({ id: t.id, name: t.name }));
  } catch (error) {
    console.error('Error searching teachers:', error);
    return [];
  }
};
