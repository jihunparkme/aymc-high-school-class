import { supabase } from './supabaseClient'

// --- Date Helper Functions ---

export const getWeekOfMonth = (date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  
  // 해당 월의 첫 날과 마지막 날
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  
  // 이 달에 속한 모든 일요일 찾기
  const sundays = []
  for (let d = new Date(firstDayOfMonth); d <= lastDayOfMonth; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === 0) { // 0은 일요일
      sundays.push(new Date(d).getDate())
    }
  }
  
  // 주어진 날짜가 속한 주의 일요일 찾기
  const dayOfWeek = date.getDay()
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
  
  // 일요일 날짜를 계산 (월을 넘어갈 수 있으므로 Date 객체로 계산)
  const sundayDate = new Date(date)
  sundayDate.setDate(sundayDate.getDate() + daysUntilSunday)
  
  // 계산된 일요일이 같은 달에 속하는지 확인
  if (sundayDate.getMonth() === month) {
    // 같은 달이면 몇 번째 일요일인지 찾기
    const weekNumber = sundays.findIndex(sunday => sunday === sundayDate.getDate()) + 1
    return weekNumber > 0 ? weekNumber : 1
  } else if (sundayDate.getMonth() > month) {
    // 다음 달로 넘어가면 이 달의 마지막 주 반환
    return sundays.length
  } else {
    // 이전 달로 돌아가면 첫 번째 주 반환
    return 1
  }
}

export const getWeekId = (date) => {
  // 해당 주의 일요일을 찾아서, 일요일이 속한 월 기준으로 주차를 결정
  const dayOfWeek = date.getDay()
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
  const sunday = new Date(date)
  sunday.setDate(sunday.getDate() + daysUntilSunday)

  const year = sunday.getFullYear()
  const month = sunday.getMonth() + 1
  const week = getWeekOfMonth(sunday)
  return `${year}년 ${String(month).padStart(2, '0')}월 ${week}주차`
}

export const getWeekStartDateFromId = (weekId) => {
  const [year, month, week] = weekId.replace('년', '').replace('월', '').replace('주차', '').split(' ').map(Number)
  
  // 해당 월의 모든 일요일 찾기
  const firstDayOfMonth = new Date(year, month - 1, 1)
  const lastDayOfMonth = new Date(year, month, 0)
  
  const sundays = []
  for (let d = new Date(firstDayOfMonth); d <= lastDayOfMonth; d.setDate(d.getDate() + 1)) {
    if (d.getDay() === 0) {
      sundays.push(d.getDate())
    }
  }
  
  // week번째 일요일 찾기 (week는 1부터 시작)
  if (week <= 0 || week > sundays.length) {
    return firstDayOfMonth // 범위 밖이면 월 첫날 반환
  }
  
  const sundayDate = sundays[week - 1]
  const sunday = new Date(year, month - 1, sundayDate)
  
  // 그 주의 월요일(일요일 - 6일)
  const monday = new Date(sunday)
  monday.setDate(monday.getDate() - 6)
  
  return monday
}

// 현재 날짜가 속한 주의 시작일(월요일)과 종료일(일요일)을 반환
export const getWeekBoundaries = (date) => {
  const dayOfWeek = date.getDay();
  
  // 주어진 날짜가 속한 주의 일요일 찾기 (0=일, 1=월, ..., 6=토)
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  const sunday = new Date(date);
  sunday.setDate(sunday.getDate() + daysUntilSunday);
  
  // 월요일은 일요일 - 6일
  const monday = new Date(sunday);
  monday.setDate(monday.getDate() - 6);
  
  return {
    start: monday,
    end: sunday,
  };
};

// 현재 주의 마지막 날 다음 날로 이동 → 월 경계에서 주차를 정확히 건너뜀
export const getNextWeek = (date) => {
  const { end } = getWeekBoundaries(date);
  const next = new Date(end);
  next.setDate(next.getDate() + 1);
  return next;
};

// 현재 주의 첫 날 이전 날로 이동 → 월 경계에서 주차를 정확히 건너뜀
export const getPreviousWeek = (date) => {
  const { start } = getWeekBoundaries(date);
  const prev = new Date(start);
  prev.setDate(prev.getDate() - 1);
  return prev;
};

export const getTodayWeek = () => {
  return new Date()
}

// --- Data Transformation Helpers ---

const transformSchoolData = (grades, classes, students, teachers, teams, teacherTeams) => {
  const teamMap = new Map(teams.map(team => [team.id, team.name]));

  const teacherTeamMap = new Map();
  teacherTeams.forEach(tt => {
    if (!teacherTeamMap.has(tt.teacher_id)) {
      teacherTeamMap.set(tt.teacher_id, []);
    }
    const teamName = teamMap.get(tt.team_id);
    if (teamName) {
      teacherTeamMap.get(tt.teacher_id).push(teamName);
    }
  });

  return {
    date: new Date().toISOString().split('T')[0],
    teams: teams.map(team => ({
      id: team.id,
      name: team.name,
      teacherIds: teacherTeams.filter(tt => tt.team_id === team.id).map(tt => tt.teacher_id)
    })),
    teachers: teachers.map(t => {
      const assignedClasses = t.class_teachers 
        ? t.class_teachers.map(ct => ct.classes).filter(c => c) 
        : []
      const assignedTeams = teacherTeamMap.get(t.id) || [];
      
      return { 
        id: t.id, 
        name: t.name,
        gender: t.gender,
        assignedClasses: assignedClasses.map(c => c.name).join(', '),
        assignedTeams: assignedTeams.join(', '),
        teamIds: teams.filter(team => assignedTeams.includes(team.name)).map(team => team.id)
      }
    }),
    grades: grades.map(grade => ({
      gradeId: String(grade.id),
      gradeName: grade.name,
      classes: classes
        .filter(c => Number(c.grade_id) === Number(grade.id))
        .map(c => {
          const classTeachers = c.class_teachers 
            ? c.class_teachers.map(ct => ct.teachers).filter(t => t) 
            : []
          
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
          }
        })
    }))
  }
}

const transformWeeklyData = (records, idField) => {
  const result = {}
  records.forEach(record => {
    const idStr = String(record[idField])
    if (!result[idStr]) {
      result[idStr] = {}
    }
    
    // Treat prayer_requests as a single text block; line breaks are content, not item separators.
    const prayerText = typeof record.prayer_requests === 'string' ? record.prayer_requests.trim() : ''
    const prayerRequestsArray = prayerText ? [prayerText] : []

    result[idStr][record.week_id] = {
      attendance: record.attendance,
      notes: record.notes || '',
      prayerRequests: prayerRequestsArray
    }
  })
  return result
}

const transformDailyData = (records) => transformWeeklyData(records, 'student_id')
const transformTeacherDailyData = (records) => transformWeeklyData(records, 'teacher_id')

// --- Data Loading (Supabase) ---

export const loadFromSupabase = async () => {
  try {
    const [
      { data: grades, error: gradesError },
      { data: teachers, error: teachersError },
      { data: classes, error: classesError },
      { data: students, error: studentsError },
      { data: weeklyRecords, error: recordsError },
      { data: teacherWeeklyRecords, error: teacherRecordsError },
      { data: teams, error: teamsError },
      { data: teacherTeams, error: teacherTeamsError }
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
      supabase.from('teacher_weekly_records').select('*'),
      supabase.from('teams').select('*').order('id'),
      supabase.from('teacher_teams').select('*')
    ])

    if (gradesError) throw gradesError
    if (teachersError) throw teachersError
    if (classesError) throw classesError
    if (studentsError) throw studentsError
    if (recordsError) throw recordsError
    if (teacherRecordsError) throw teacherRecordsError
    if (teamsError) throw teamsError;
    if (teacherTeamsError) throw teacherTeamsError;

    const schoolData = transformSchoolData(grades, classes, students, teachers, teams, teacherTeams)
    const dailyData = transformDailyData(weeklyRecords)
    const teacherDailyData = transformTeacherDailyData(teacherWeeklyRecords)

    return { data: schoolData, dailyData, teacherDailyData }

  } catch (error) {
    console.error('Failed to load data from Supabase:', error)
    return { data: null, dailyData: {}, teacherDailyData: {} }
  }
}

// --- Data Saving (Supabase Actions) ---

const upsertRecord = async (table, idField, id, weekId, data, errorMsg) => {
  try {
    const { error } = await supabase
      .from(table)
      .upsert({ 
        [idField]: parseInt(id), 
        week_id: weekId, 
        ...data 
      }, { onConflict: `${idField}, week_id` })

    if (error) throw error
    return true
  } catch (error) {
    console.error(errorMsg, error)
    return false
  }
}

const upsertPrayerRequest = (table, idField, id, weekId, content, errorMsg) =>
  upsertRecord(table, idField, id, weekId, { prayer_requests: content }, errorMsg)

// Student record functions
export const updateAttendance = (studentId, weekId, attendance) =>
  upsertRecord('weekly_records', 'student_id', studentId, weekId, { attendance }, 'Error updating attendance:')

export const updateNotes = (studentId, weekId, notes) =>
  upsertRecord('weekly_records', 'student_id', studentId, weekId, { notes }, 'Error updating notes:')

export const addPrayerRequest = (studentId, weekId, content) =>
  upsertPrayerRequest('weekly_records', 'student_id', studentId, weekId, content, 'Error adding prayer request:')

// Teacher record functions
export const updateTeacherAttendance = (teacherId, weekId, attendance) =>
  upsertRecord('teacher_weekly_records', 'teacher_id', teacherId, weekId, { attendance }, 'Error updating teacher attendance:')

export const updateTeacherNotes = (teacherId, weekId, notes) =>
  upsertRecord('teacher_weekly_records', 'teacher_id', teacherId, weekId, { notes }, 'Error updating teacher notes:')

export const addTeacherPrayerRequest = (teacherId, weekId, content) =>
  upsertPrayerRequest('teacher_weekly_records', 'teacher_id', teacherId, weekId, content, 'Error adding teacher prayer request:')

// --- Admin Actions (Direct DB Manipulation) ---

export const addTeacher = async (name) => {
  try {
    const { data, error } = await supabase
      .from('teachers')
      .insert({ name })
      .select()
    
    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error adding teacher:', error)
    return null
  }
}

export const updateTeacher = async (id, name) => {
  try {
    const { error } = await supabase
      .from('teachers')
      .update({ name })
      .eq('id', parseInt(id))
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating teacher:', error)
    return false
  }
}

export const removeTeacher = async (id) => {
  try {
    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', parseInt(id))
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error removing teacher:', error)
    return false
  }
}

export const addClass = async (gradeId, classItem) => {
  try {
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .insert({
        grade_id: parseInt(gradeId),
        name: classItem.className
      })
      .select()
    
    if (classError) throw classError
    const newClassId = classData[0].id

    if (classItem.teacherIds && classItem.teacherIds.length > 0) {
      const teacherRelations = classItem.teacherIds.map(teacherId => ({
        class_id: newClassId,
        teacher_id: parseInt(teacherId)
      }))

      const { error: relationError } = await supabase
        .from('class_teachers')
        .insert(teacherRelations)
      
      if (relationError) throw relationError
    }
    
    return {
      id: newClassId,
      name: classItem.className,
      teacher_name: classItem.teacherNames
    }
  } catch (error) {
    console.error('Error adding class:', error)
    return null
  }
}

export const removeClass = async (classId) => {
  try {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', parseInt(classId))
      
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error removing class:', error)
    return false
  }
}

export const updateClass = async (classId, updates) => {
  try {
    const { error: classError } = await supabase
      .from('classes')
      .update({
        name: updates.className
      })
      .eq('id', parseInt(classId))

    if (classError) throw classError

    if (updates.teacherIds) {
      const { error: deleteError } = await supabase
        .from('class_teachers')
        .delete()
        .eq('class_id', parseInt(classId))
      
      if (deleteError) throw deleteError

      if (updates.teacherIds.length > 0) {
        const teacherRelations = updates.teacherIds.map(teacherId => ({
          class_id: parseInt(classId),
          teacher_id: parseInt(teacherId)
        }))

        const { error: insertError } = await supabase
          .from('class_teachers')
          .insert(teacherRelations)
        
        if (insertError) throw insertError
      }
    }

    return true
  } catch (error) {
    console.error('Error updating class:', error)
    return false
  }
}

export const addStudent = async (classId, student) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .insert({
        class_id: parseInt(classId),
        name: student.name,
        gender: student.gender
      })
      .select()

    if (error) throw error
    return data[0]
  } catch (error) {
    console.error('Error adding student:', error)
    return null
  }
}

export const removeStudent = async (studentId) => {
  try {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', parseInt(studentId))

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error removing student:', error)
    return false
  }
}

export const updateStudent = async (studentId, name) => {
  try {
    const { error } = await supabase
      .from('students')
      .update({ name: name })
      .eq('id', parseInt(studentId))

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating student:', error)
    return false
  }
}

export const searchTeachers = async (query) => {
  try {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name')

    if (error) throw error

    return data.map(t => ({ id: t.id, name: t.name }))
  } catch (error) {
    console.error('Error searching teachers:', error)
    return []
  }
}
