import { useState } from 'react'
import { getNextWeek, getPreviousWeek, getTodayWeek, getWeekId } from '../utils/dataManager'
import '../styles/PrayerView.css'

export default function PrayerView({ data, dailyData, teacherDailyData }) {
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

  const allPrayers = []

  // 학생 기도제목 수집
  data.grades.forEach(grade => {
    grade.classes.forEach(classItem => {
      classItem.students.forEach(student => {
        if (dailyData[student.studentId] && dailyData[student.studentId][weekId]) {
          const weekData = dailyData[student.studentId][weekId]
          if (weekData.prayerRequests && weekData.prayerRequests.length > 0) {
            weekData.prayerRequests.forEach(prayer => {
              allPrayers.push({
                type: 'student',
                gradeName: grade.gradeName,
                className: classItem.className,
                studentName: student.name,
                gender: student.gender,
                prayer: prayer,
                date: weekId,
                attendance: weekData.attendance || false
              })
            })
          }
        }
      })
    })
  })

  // 교사 기도제목 수집
  if (data.teachers && teacherDailyData) {
    data.teachers.forEach(teacher => {
      if (teacherDailyData[teacher.id] && teacherDailyData[teacher.id][weekId]) {
        const weekData = teacherDailyData[teacher.id][weekId]
        if (weekData.prayerRequests && weekData.prayerRequests.length > 0) {
          weekData.prayerRequests.forEach(prayer => {
            allPrayers.push({
              type: 'teacher',
              gradeName: '교사',
              className: '전체',
              studentName: teacher.name, // studentName 필드 재사용
              gender: teacher.gender,
              prayer: prayer,
              date: weekId,
              attendance: weekData.attendance || false
            })
          })
        }
      }
    })
  }

  // 정렬: 교사 먼저, 그 다음 학년순, 반순, 이름순
  allPrayers.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'teacher' ? -1 : 1 // 교사가 먼저 오도록
    }
    if (a.gradeName !== b.gradeName) return a.gradeName.localeCompare(b.gradeName)
    if (a.className !== b.className) return a.className.localeCompare(b.className)
    return a.studentName.localeCompare(b.studentName)
  })

  const filteredPrayers = allPrayers.filter(item => 
    item.studentName.includes(searchTerm) || 
    item.className.includes(searchTerm) ||
    item.gradeName.includes(searchTerm) ||
    item.prayer.includes(searchTerm)
  )

  return (
    <div className="prayer-view">
      <div className="prayer-header-section">
        <h2>주간 기도제목</h2>
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

      <h3>전체 기도제목 ({filteredPrayers.length}개)</h3>
      
      {filteredPrayers.length === 0 ? (
        <p className="empty-message">
          {searchTerm ? '검색 결과가 없습니다.' : '이번 주 기도제목이 없습니다.'}
        </p>
      ) : (
        <div className="prayers-list">
          {filteredPrayers.map((item, idx) => (
            <div key={idx} className={`prayer-item ${item.type === 'teacher' ? 'teacher-item' : ''}`}>
              <div className="prayer-header-info">
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
              <p className="prayer-text">{item.prayer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
