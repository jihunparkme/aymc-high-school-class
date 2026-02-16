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
    teachers: teachers.map(t => {
      const assignedClasses = t.class_teachers 
        ? t.class_teachers.map(ct => ct.classes).filter(c => c) 
        : [];
      return { 
        id: t.id, 
        name: t.name,
        gender: t.gender, // Added gender
        assignedClasses: assignedClasses.map(c => c.name).join(', ')
      };
    }),
    grades: grades.map(grade => ({
      gradeId: String(grade.id),
      gradeName: grade.name,
      classes: classes
        .filter(c => Number(c.grade_id) === Number(grade.id))
        .map(c => {
          const classTeachers = c.class_teachers 
            ? c.class_teachers.map(ct => ct.teachers).filter(t => t) 
            : [];
          
          return {
            classId: String(c.id),
            className: c.name,
            teacherIds: classTeachers.map(t => t.id),
            teacherNames: classTeachers.map(t => t.name).join(', '),
            teacherName: classTeachers.map(t => t.name).join(', ') || '미정',
            students: students
              .filter(s => Number(s.class_id) === Number(c.id))
              .map(s => ({
                studentId: String(s.id),
                name: s.name,
                gender: s.gender
              }))
          };
        })
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

const transformTeacherDailyData = (teacherWeeklyRecords) => {
  const dailyData = {};
  teacherWeeklyRecords.forEach(record => {
    const teacherIdStr = String(record.teacher_id);
    if (!dailyData[teacherIdStr]) {
      dailyData[teacherIdStr] = {};
    }
    
    const prayerRequestsArray = record.prayer_requests 
      ? record.prayer_requests.split('\n').filter(p => p.trim() !== '') 
      : [];

    dailyData[teacherIdStr][record.week_id] = {
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
      { data: weeklyRecords, error: recordsError },
      { data: teacherWeeklyRecords, error: teacherRecordsError }
    ] = await Promise.all([
      supabase.from('grades').select('*').order('id'),
      supabase.from('teachers').select(`
        *,
        class_teachers (
          classes (
            name
          )
        )
      `).order('name'),
      supabase.from('classes').select(`
        *,
        class_teachers (
          teachers (
            id,
            name
          )
        )
      `).order('id'),
      supabase.from('students').select('*').order('id'),
      supabase.from('weekly_records').select('*'),
      supabase.from('teacher_weekly_records').select('*')
    ]);

    if (gradesError) throw gradesError;
    if (teachersError) throw teachersError;
    if (classesError) throw classesError;
    if (studentsError) throw studentsError;
    if (recordsError) throw recordsError;
    if (teacherRecordsError) throw teacherRecordsError;

    const schoolData = transformSchoolData(grades, classes, students, teachers);
    const dailyData = transformDailyData(weeklyRecords);
    const teacherDailyData = transformTeacherDailyData(teacherWeeklyRecords);

    return { data: schoolData, dailyData, teacherDailyData };

  } catch (error) {
    console.error('Failed to load data from Supabase:', error);
    return { data: null, dailyData: {}, teacherDailyData: {} };
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

// --- Teacher Data Saving ---

export const updateTeacherAttendance = async (teacherId, weekId, attendance) => {
  try {
    const { error } = await supabase
      .from('teacher_weekly_records')
      .upsert({ 
        teacher_id: parseInt(teacherId), 
        week_id: weekId, 
        attendance: attendance 
      }, { onConflict: 'teacher_id, week_id' })
      .select();

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating teacher attendance:', error);
    return false;
  }
};

export const updateTeacherNotes = async (teacherId, weekId, notes) => {
  try {
    const { error } = await supabase
      .from('teacher_weekly_records')
      .upsert({ 
        teacher_id: parseInt(teacherId), 
        week_id: weekId, 
        notes: notes 
      }, { onConflict: 'teacher_id, week_id' });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating teacher notes:', error);
    return false;
  }
};

export const addTeacherPrayerRequest = async (teacherId, weekId, content) => {
  try {
    const { data: currentRecord } = await supabase
      .from('teacher_weekly_records')
      .select('prayer_requests')
      .eq('teacher_id', parseInt(teacherId))
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
      .from('teacher_weekly_records')
      .upsert({
        teacher_id: parseInt(teacherId),
        week_id: weekId,
        prayer_requests: newRequestsText
      }, { onConflict: 'teacher_id, week_id' });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error adding teacher prayer request:', error);
    return false;
  }
};

// --- Admin Actions (Direct DB Manipulation) ---

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
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .insert({
        grade_id: parseInt(gradeId),
        name: classItem.className
      })
      .select();
    
    if (classError) throw classError;
    const newClassId = classData[0].id;

    if (classItem.teacherIds && classItem.teacherIds.length > 0) {
      const teacherRelations = classItem.teacherIds.map(teacherId => ({
        class_id: newClassId,
        teacher_id: parseInt(teacherId)
      }));

      const { error: relationError } = await supabase
        .from('class_teachers')
        .insert(teacherRelations);
      
      if (relationError) throw relationError;
    }
    
    return {
      id: newClassId,
      name: classItem.className,
      teacher_name: classItem.teacherNames
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
    const { error: classError } = await supabase
      .from('classes')
      .update({
        name: updates.className
      })
      .eq('id', parseInt(classId));

    if (classError) throw classError;

    if (updates.teacherIds) {
      const { error: deleteError } = await supabase
        .from('class_teachers')
        .delete()
        .eq('class_id', parseInt(classId));
      
      if (deleteError) throw deleteError;

      if (updates.teacherIds.length > 0) {
        const teacherRelations = updates.teacherIds.map(teacherId => ({
          class_id: parseInt(classId),
          teacher_id: parseInt(teacherId)
        }));

        const { error: insertError } = await supabase
          .from('class_teachers')
          .insert(teacherRelations);
        
        if (insertError) throw insertError;
      }
    }

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
