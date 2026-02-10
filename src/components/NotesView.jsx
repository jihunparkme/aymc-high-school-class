import { useState } from 'react'
import { getNextWeek, getPreviousWeek, getTodayWeek, getWeekId } from '../utils/dataManager'
import '../styles/PrayerView.css' // PrayerView와 동일한 스타일을 사용

export default function NotesView({ data, dailyData }) {
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

  data.grades.forEach(grade => {
    grade.classes.forEach(classItem => {
      classItem.students.forEach(student => {
        if (dailyData[student.studentId] && dailyData[student.studentId][weekId]) {
          const weekData = dailyData[student.studentId][weekId]
          if (weekData.notes && weekData.notes.length > 0) {
            allNotes.push({
              gradeName: grade.gradeName,
              className: classItem.className,
              studentName: student.name,
              note: weekData.notes,
              date: weekId,
              attendance: weekData.attendance || false
            })
          }
        }
      })
    })
  })

  // 학년순, 반순, 이름순 정렬
  allNotes.sort((a, b) => {
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
            <div key={idx} className="notes-item"> {/* notes-item 클래스 적용 */}
              <div className="prayer-header-info"> {/* 동일한 스타일 클래스 사용 */}
                <div>
                  <span className="grade-class">{item.gradeName} {item.className}</span>
                  <span className="student-name">{item.studentName}</span>
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
