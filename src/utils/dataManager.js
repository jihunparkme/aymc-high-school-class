const STORAGE_KEY = 'aymc_student_data'
const DAILY_STORAGE_KEY = 'aymc_student_daily_data'
const BACKUP_KEY = 'aymc_student_backup'

// --- New Date Functions ---

// Get the week number of a month
export const getWeekOfMonth = (date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  return Math.ceil((date.getDate() + firstDay) / 7);
}

// Format date to "YYYY년 MM월 W주차"
export const getWeekId = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const week = getWeekOfMonth(date);
  return `${year}년 ${String(month).padStart(2, '0')}월 ${week}주차`;
}

// Get the start date of a week (Sunday) from a weekId
export const getWeekStartDateFromId = (weekId) => {
  const [year, month, week] = weekId.replace('년', '').replace('월', '').replace('주차', '').split(' ').map(Number);
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday...
  const dayOffset = (week - 1) * 7 - firstDayOfWeek;
  return new Date(year, month - 1, 1 + dayOffset);
};


export const initializeData = () => {
  const today = new Date().toISOString().split('T')[0]
  
  return {
    date: today,
    grades: [
      {
        gradeId: '1',
        gradeName: '1학년',
        classes: [
          {
            classId: '1-1',
            className: '1반',
            teacherName: '김선생님',
            students: [
              { studentId: '1-1-1', name: '이준호' },
              { studentId: '1-1-2', name: '김하늘' },
              { studentId: '1-1-3', name: '박미현' },
              { studentId: '1-1-4', name: '정성은' },
              { studentId: '1-1-5', name: '이서윤' },
              { studentId: '1-1-6', name: '오준석' },
              { studentId: '1-1-7', name: '정유진' },
              { studentId: '1-1-8', name: '최은준' },
              { studentId: '1-1-9', name: '한지원' },
              { studentId: '1-1-10', name: '강동현' },
            ]
          },
          {
            classId: '1-2',
            className: '2반',
            teacherName: '이선생님',
            students: [
              { studentId: '1-2-1', name: '박준혁' },
              { studentId: '1-2-2', name: '정예은' },
              { studentId: '1-2-3', name: '김진호' },
              { studentId: '1-2-4', name: '이현지' },
              { studentId: '1-2-5', name: '최민준' },
              { studentId: '1-2-6', name: '권서진' },
              { studentId: '1-2-7', name: '오지수' },
              { studentId: '1-2-8', name: '박선주' },
              { studentId: '1-2-9', name: '한승환' },
              { studentId: '1-2-10', name: '정민지' },
            ]
          },
          {
            classId: '1-3',
            className: '3반',
            teacherName: '박선생님',
            students: [
              { studentId: '1-3-1', name: '강민수' },
              { studentId: '1-3-2', name: '이소현' },
              { studentId: '1-3-3', name: '김지호' },
              { studentId: '1-3-4', name: '박영준' },
              { studentId: '1-3-5', name: '정다은' },
              { studentId: '1-3-6', name: '오예진' },
              { studentId: '1-3-7', name: '최준서' },
              { studentId: '1-3-8', name: '한나연' },
              { studentId: '1-3-9', name: '권혜진' },
              { studentId: '1-3-10', name: '이우진' },
            ]
          }
        ]
      },
      {
        gradeId: '2',
        gradeName: '2학년',
        classes: [
          {
            classId: '2-1',
            className: '1반',
            teacherName: '최선생님',
            students: [
              { studentId: '2-1-1', name: '박준영' },
              { studentId: '2-1-2', name: '정서은' },
              { studentId: '2-1-3', name: '김준호' },
              { studentId: '2-1-4', name: '이나영' },
              { studentId: '2-1-5', name: '오은정' },
              { studentId: '2-1-6', name: '강현진' },
              { studentId: '2-1-7', name: '최지환' },
              { studentId: '2-1-8', name: '한승현' },
              { studentId: '2-1-9', name: '권준호' },
              { studentId: '2-1-10', name: '정혜미' },
            ]
          },
          {
            classId: '2-2',
            className: '2반',
            teacherName: '한선생님',
            students: [
              { studentId: '2-2-1', name: '이준혁' },
              { studentId: '2-2-2', name: '박지은' },
              { studentId: '2-2-3', name: '김소정' },
              { studentId: '2-2-4', name: '정우진' },
              { studentId: '2-2-5', name: '오미정' },
              { studentId: '2-2-6', name: '최서영' },
              { studentId: '2-2-7', name: '한준석' },
              { studentId: '2-2-8', name: '권지현' },
              { studentId: '2-2-9', name: '강나연' },
              { studentId: '2-2-10', name: '정민서' },
            ]
          },
          {
            classId: '2-3',
            className: '3반',
            teacherName: '권선생님',
            students: [
              { studentId: '2-3-1', name: '박현준' },
              { studentId: '2-3-2', name: '이지은' },
              { studentId: '2-3-3', name: '김준서' },
              { studentId: '2-3-4', name: '정혜진' },
              { studentId: '2-3-5', name: '오준영' },
              { studentId: '2-3-6', name: '최은지' },
              { studentId: '2-3-7', name: '한민준' },
              { studentId: '2-3-8', name: '권혜선' },
              { studentId: '2-3-9', name: '강서진' },
              { studentId: '2-3-10', name: '정준호' },
            ]
          }
        ]
      },
      {
        gradeId: '3',
        gradeName: '3학년',
        classes: [
          {
            classId: '3-1',
            className: '1반',
            teacherName: '조선생님',
            students: [
              { studentId: '3-1-1', name: '이현준' },
              { studentId: '3-1-2', name: '박서영' },
              { studentId: '3-1-3', name: '김준호' },
              { studentId: '3-1-4', name: '정지은' },
              { studentId: '3-1-5', name: '오은준' },
              { studentId: '3-1-6', name: '최민지' },
              { studentId: '3-1-7', name: '한준영' },
              { studentId: '3-1-8', name: '권소정' },
              { studentId: '3-1-9', name: '강준호' },
              { studentId: '3-1-10', name: '정나연' },
            ]
          },
          {
            classId: '3-2',
            className: '2반',
            teacherName: '유선생님',
            students: [
              { studentId: '3-2-1', name: '박준혁' },
              { studentId: '3-2-2', name: '이예은' },
              { studentId: '3-2-3', name: '김지호' },
              { studentId: '3-2-4', name: '정준서' },
              { studentId: '3-2-5', name: '오서진' },
              { studentId: '3-2-6', name: '최준호' },
              { studentId: '3-2-7', name: '한지은' },
              { studentId: '3-2-8', name: '권민준' },
              { studentId: '3-2-9', name: '강혜진' },
              { studentId: '3-2-10', name: '정우진' },
            ]
          },
          {
            classId: '3-3',
            className: '3반',
            teacherName: '이선생님',
            students: [
              { studentId: '3-3-1', name: '이준호' },
              { studentId: '3-3-2', name: '박은진' },
              { studentId: '3-3-3', name: '김준서' },
              { studentId: '3-3-4', name: '정나영' },
              { studentId: '3-3-5', name: '오지현' },
              { studentId: '3-3-6', name: '최수진' },
              { studentId: '3-3-7', name: '한준영' },
              { studentId: '3-3-8', name: '권준호' },
              { studentId: '3-3-9', name: '강은지' },
              { studentId: '3-3-10', name: '정혜은' },
            ]
          }
        ]
      }
    ]
  }
}

export const initializeDailyData = () => {
  return {}
}

const API_URL = 'http://localhost:3001/api'

// API를 통해 데이터 저장
export const saveToLocalStorage = async (data, dailyData) => {
  try {
    // 먼저 로컬 스토리지에 저장 (오프라인 지원)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(dailyData))
    localStorage.setItem(BACKUP_KEY, JSON.stringify(data))

    // 서버에도 저장 시도 (실패해도 로컬 스토리지는 유지됨)
    try {
      await fetch(`${API_URL}/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data, dailyData })
      })
    } catch (apiError) {
      console.warn('Failed to save to server, using local storage only:', apiError)
    }
  } catch (error) {
    console.error('Failed to save data:', error)
  }
}

// 일일 백업 생성
export const createDailyBackup = (data, dailyData) => {
  try {
    const date = new Date().toISOString().split('T')[0]
    const backupKey = `aymc_backup_${date}`
    const backupData = { data, dailyData }
    localStorage.setItem(backupKey, JSON.stringify(backupData))
    console.log(`Daily backup created for ${date}`)
  } catch (error) {
    console.error('Failed to create daily backup:', error)
  }
}

// 백업 목록 조회
export const getBackupsList = () => {
  const backups = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.startsWith('aymc_backup_')) {
      backups.push(key)
    }
  }
  return backups.sort().reverse()
}

// 백업 로드
export const loadBackup = (key) => {
  const backup = localStorage.getItem(key)
  return backup ? JSON.parse(backup) : null
}

// API를 통해 데이터 로드
export const loadFromLocalStorage = async () => {
  try {
    // 먼저 서버에서 데이터 로드 시도
    try {
      const response = await fetch(`${API_URL}/data`)
      if (response.ok) {
        const serverData = await response.json()
        return {
          data: serverData.data || null,
          dailyData: serverData.dailyData || {}
        }
      }
    } catch (apiError) {
      console.warn('Failed to load from server, using local storage:', apiError)
    }

    // 서버 실패 시 로컬 스토리지에서 로드
    const data = localStorage.getItem(STORAGE_KEY)
    const dailyData = localStorage.getItem(DAILY_STORAGE_KEY)
    return {
      data: data ? JSON.parse(data) : null,
      dailyData: dailyData ? JSON.parse(dailyData) : {}
    }
  } catch (error) {
    console.error('Failed to load data:', error)
    return { data: null, dailyData: {} }
  }
}

export const exportToJSON = (data, dailyData) => {
  const exportData = {
    data,
    dailyData
  }
  const jsonString = JSON.stringify(exportData, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `student_data_${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const importFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const importData = JSON.parse(event.target.result)
        resolve(importData)
      } catch (error) {
        reject(new Error('Invalid JSON file'))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

// 날짜별 학생 데이터 관리
export const getStudentDailyData = (dailyData, studentId, date) => {
  if (!dailyData[studentId]) {
    return {
      prayerRequests: [],
      notes: '',
      attendance: false
    }
  }
  return dailyData[studentId][date] || {
    prayerRequests: [],
    notes: '',
    attendance: false
  }
}

export const updateStudentDailyData = (dailyData, studentId, date, updates) => {
  const newData = JSON.parse(JSON.stringify(dailyData))
  if (!newData[studentId]) {
    newData[studentId] = {}
  }
  newData[studentId][date] = {
    ...getStudentDailyData(newData, studentId, date),
    ...updates
  }
  return newData
}

export const addPrayerRequest = (dailyData, studentId, date, prayer) => {
  const current = getStudentDailyData(dailyData, studentId, date)
  return updateStudentDailyData(dailyData, studentId, date, {
    prayerRequests: [...(current.prayerRequests || []), prayer]
  })
}

export const updateNotes = (dailyData, studentId, date, notes) => {
  return updateStudentDailyData(dailyData, studentId, date, { notes })
}

export const updateAttendance = (dailyData, studentId, date, attendance) => {
  return updateStudentDailyData(dailyData, studentId, date, { attendance })
}

// 주간 시작 날짜 계산 (일요일)
export const getWeekStart = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}

// 특정 날짜의 주간 날짜들 배열 반환
export const getWeekDates = (date) => {
  const weekStart = getWeekStart(date)
  const dates = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    dates.push(d.toISOString().split('T')[0])
  }
  return dates
}

// 다음 주 시작 날짜
export const getNextWeek = (date) => {
  const d = new Date(date)
  d.setDate(d.getDate() + 7)
  return d
}

// 이전 주 시작 날짜
export const getPreviousWeek = (date) => {
  const d = new Date(date)
  d.setDate(d.getDate() - 7)
  return d
}

// 오늘 날짜의 주로 이동
export const getTodayWeek = () => {
  return new Date()
}

// 관리자 기능용 기존 함수들
export const addClass = (data, gradeId, classItem) => {
  const newData = JSON.parse(JSON.stringify(data))
  const grade = newData.grades.find(g => g.gradeId === gradeId)
  if (!grade) return data
  
  grade.classes.push(classItem)
  return newData
}

export const removeClass = (data, gradeId, classId) => {
  const newData = JSON.parse(JSON.stringify(data))
  const grade = newData.grades.find(g => g.gradeId === gradeId)
  if (!grade) return data
  
  grade.classes = grade.classes.filter(c => c.classId !== classId)
  return newData
}

export const updateClass = (data, gradeId, classId, updates) => {
  const newData = JSON.parse(JSON.stringify(data))
  const grade = newData.grades.find(g => g.gradeId === gradeId)
  if (!grade) return data
  
  const classItem = grade.classes.find(c => c.classId === classId)
  if (!classItem) return data
  
  Object.assign(classItem, updates)
  return newData
}

export const addStudent = (data, gradeId, classId, student) => {
  const newData = JSON.parse(JSON.stringify(data))
  const grade = newData.grades.find(g => g.gradeId === gradeId)
  if (!grade) return data
  
  const classItem = grade.classes.find(c => c.classId === classId)
  if (!classItem) return data
  
  classItem.students.push(student)
  return newData
}

export const removeStudent = (data, gradeId, classId, studentId) => {
  const newData = JSON.parse(JSON.stringify(data))
  const grade = newData.grades.find(g => g.gradeId === gradeId)
  if (!grade) return data
  
  const classItem = grade.classes.find(c => c.classId === classId)
  if (!classItem) return data
  
  classItem.students = classItem.students.filter(s => s.studentId !== studentId)
  return newData
}

export const updateStudent = (data, gradeId, classId, studentId, newName) => {
  const newData = JSON.parse(JSON.stringify(data))
  const grade = newData.grades.find(g => g.gradeId === gradeId)
  if (!grade) return data
  
  const classItem = grade.classes.find(c => c.classId === classId)
  if (!classItem) return data
  
  const student = classItem.students.find(s => s.studentId === studentId)
  if (!student) return data
  
  student.name = newName
  return newData
}
