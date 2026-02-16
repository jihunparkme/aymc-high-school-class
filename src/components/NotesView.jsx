import { useState } from 'react'
import { getNextWeek, getPreviousWeek, getTodayWeek, getWeekId } from '../utils/dataManager'
import '../styles/PrayerView.css' // PrayerView와 동일한 스타일을 사용

export default function NotesView({ data, dailyData, teacherDailyData }) {
  const [currentWeekDate, setCurrentWeekDate] = useState(new Date())
  const [searchTerm, setSearchTerm] = useState('')
  
  const weekId = getWeekId(currentWeekDate)

  const handlePrevWeek = () => {
    setCurrentWeekDate(getPreviousWeek(currentWeekDate))
  }

  const handleNextWeek = () => {
    setCurrentWeekDate(getNextWeek(currentWeekDate))
  }

  const handleToday = () => {
    setCurrentWeekDate(getTodayWeek())
  }

  const allNotes = []

  // 학생 특이사항 수집
  data.grades.forEach(grade => {
    grade.classes.forEach(classItem => {
      classItem.students.forEach(student => {
        if (dailyData[student.studentId] && dailyData[student.studentId][weekId]) {
          const weekData = dailyData[student.studentId][weekId]
          if (weekData.notes && weekData.notes.length > 0) {
            allNotes.push({
              type: 'student',
              gradeName: grade.gradeName,
              className: classItem.className,
              studentName: student.name,
              gender: student.gender,
              note: weekData.notes,
              date: weekId,
              attendance: weekData.attendance || false
            })
          }
        }
      })
    })
  })

  // 교사 특이사항 수집
  if (data.teachers && teacherDailyData) {
    data.teachers.forEach(teacher => {
      if (teacherDailyData[teacher.id] && teacherDailyData[teacher.id][weekId]) {
        const weekData = teacherDailyData[teacher.id][weekId]
        if (weekData.notes && weekData.notes.length > 0) {
          allNotes.push({
            type: 'teacher',
            gradeName: '교사',
            className: '전체',
            studentName: teacher.name, // studentName 필드 재사용
            gender: teacher.gender,
            note: weekData.notes,
            date: weekId,
            attendance: weekData.attendance || false
          })
        }
      }
    })
  }

  // 정렬: 교사 먼저, 그 다음 학년순, 반순, 이름순
  allNotes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'teacher' ? -1 : 1 // 교사가 먼저 오도록
    }
    if (a.gradeName !== b.gradeName) return a.gradeName.localeCompare(b.gradeName)
    if (a.className !== b.className) return a.className.localeCompare(b.className)
    return a.studentName.localeCompare(b.studentName)
  })

  const filteredNotes = allNotes.filter(item => 
    item.studentName.includes(searchTerm) || 
    item.className.includes(searchTerm) ||
    item.gradeName.includes(searchTerm) ||
    item.note.includes(searchTerm)
  )

  return (
    <div className="prayer-view"> {/* 동일한 스타일 클래스 사용 */}
      <div className="prayer-header-section">
        <h2>주간 특이사항</h2>
        <div className="week-info">{weekId}</div>
      </div>

      <div className="date-navigation">
        <button onClick={handlePrevWeek}>← 이전주</button>
        <button className="today-btn" onClick={handleToday}>오늘</button>
        <button onClick={handleNextWeek}>다음주 →</button>
      </div>

      <div className="search-section">
        <input 
          type="text" 
          placeholder="검색 (이름, 반, 내용)" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <h3>전체 특이사항 ({filteredNotes.length}개)</h3>
      
      {filteredNotes.length === 0 ? (
        <p className="empty-message">
          {searchTerm ? '검색 결과가 없습니다.' : '이번 주 특이사항이 없습니다.'}
        </p>
      ) : (
        <div className="prayers-list"> {/* 동일한 스타일 클래스 사용 */}
          {filteredNotes.map((item, idx) => (
            <div key={idx} className={`notes-item ${item.type === 'teacher' ? 'teacher-item' : ''}`}>
              <div className="prayer-header-info"> {/* 동일한 스타일 클래스 사용 */}
                <div>
                  <span className={`grade-class ${item.type === 'teacher' ? 'teacher-badge' : ''}`}>
                    {item.gradeName} {item.type === 'student' ? item.className : ''}
                  </span>
                  <span className="student-name">{item.studentName}</span>
                  <span className="gender-emoji">
                    {item.gender === '남' ? '🙋🏼‍♂️' : '🙋🏻‍♀️'}
                  </span>
                </div>
                <span className="attendance-emoji">{item.attendance ? '✅' : '❌'}</span>
              </div>
              <p className="prayer-text">{item.note}</p> {/* note 내용 표시 */}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
