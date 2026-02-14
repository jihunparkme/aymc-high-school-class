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

// --- Data Loading (Supabase) ---

export const loadFromSupabase = async () => {
  try {
    // 1. Fetch basic school structure
    const { data: grades, error: gradesError } = await supabase
      .from('grades')
      .select('*')
      .order('id');
    
    if (gradesError) throw gradesError;

    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('*')
      .order('id');

    if (classesError) throw classesError;

    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .order('id');

    if (studentsError) throw studentsError;

    // 2. Fetch weekly records (prayer_requests is now TEXT)
    const { data: weeklyRecords, error: recordsError } = await supabase
      .from('weekly_records')
      .select('*');

    if (recordsError) throw recordsError;

    // 3. Transform to App's Data Structure
    const schoolData = {
      date: new Date().toISOString().split('T')[0],
      grades: grades.map(grade => ({
        gradeId: String(grade.id), // Convert to String for consistency
        gradeName: grade.name,
        classes: classes
          .filter(c => c.grade_id === grade.id)
          .map(c => ({
            classId: String(c.id), // Convert to String
            className: c.name,
            teacherName: c.teacher_name,
            students: students
              .filter(s => s.class_id === c.id)
              .map(s => ({
                studentId: String(s.id), // Convert to String
                name: s.name,
                gender: s.gender
              }))
          }))
      }))
    };

    // 4. Transform to DailyData Structure
    const dailyData = {};
    weeklyRecords.forEach(record => {
      const studentIdStr = String(record.student_id);
      if (!dailyData[studentIdStr]) {
        dailyData[studentIdStr] = {};
      }
      
      // Convert TEXT prayer_requests to Array
      const prayerRequestsArray = record.prayer_requests 
        ? record.prayer_requests.split('\n').filter(p => p.trim() !== '') 
        : [];

      dailyData[studentIdStr][record.week_id] = {
        attendance: record.attendance,
        notes: record.notes || '',
        prayerRequests: prayerRequestsArray
      };
    });

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
        student_id: parseInt(studentId), // Convert back to Integer for DB
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
    // 1. Get current record to retrieve existing prayer requests
    const { data: currentRecord, error: fetchError } = await supabase
      .from('weekly_records')
      .select('prayer_requests')
      .eq('student_id', parseInt(studentId))
      .eq('week_id', weekId)
      .single();

    let currentRequestsText = '';
    if (currentRecord && currentRecord.prayer_requests) {
      currentRequestsText = currentRecord.prayer_requests;
    }

    // 2. Append new request (with newline if not empty)
    const newRequestsText = currentRequestsText 
      ? `${currentRequestsText}\n${content}` 
      : content;

    // 3. Upsert record with updated text
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

export const addClass = async (gradeId, classItem) => {
  try {
    // Remove ID generation, let DB handle it
    const { data, error } = await supabase
      .from('classes')
      .insert({
        grade_id: parseInt(gradeId),
        name: classItem.className,
        teacher_name: classItem.teacherName
      })
      .select(); // Select to get the generated ID
    
    if (error) throw error;
    return data[0]; // Return the created class object with ID
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
        teacher_name: updates.teacherName
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
    return data[0]; // Return created student with ID
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
