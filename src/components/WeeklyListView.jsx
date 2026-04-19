import { useState } from 'react'
import useWeekNavigation from '../hooks/useWeekNavigation'
import '../styles/PrayerView.css'

/**
 * Shared component for PrayerView and NotesView.
 * Props:
 *   - data, dailyData, teacherDailyData: app data
 *   - title: header title string
 *   - emptyMessage: message when no items
 *   - countLabel: label prefix for item count
 *   - itemClassName: CSS class for each item row
 *   - extractItems: (weekData) => Array<string> — extracts content items from a week record
 */
export default function WeeklyListView({
  data, dailyData, teacherDailyData,
  title, emptyMessage, countLabel, itemClassName,
  showCount = true,
  extractItems
}) {
  const { weekId, goToPrevWeek, goToNextWeek, goToThisWeek } = useWeekNavigation()
  const [searchTerm, setSearchTerm] = useState('')

  const allItems = []

  // 학생 데이터 수집
  data.grades.forEach(grade => {
    grade.classes.forEach(classItem => {
      classItem.students.forEach(student => {
        const weekData = dailyData[student.studentId]?.[weekId]
        if (!weekData) return
        const items = extractItems(weekData)
        items.forEach(content => {
          allItems.push({
            type: 'student',
            gradeName: grade.gradeName,
            className: classItem.className,
            studentName: student.name,
            gender: student.gender,
            content,
            attendance: weekData.attendance || false
          })
        })
      })
    })
  })

  // 교사 데이터 수집
  if (data.teachers && teacherDailyData) {
    data.teachers.forEach(teacher => {
      const weekData = teacherDailyData[teacher.id]?.[weekId]
      if (!weekData) return
      const items = extractItems(weekData)
      items.forEach(content => {
        allItems.push({
          type: 'teacher',
          gradeName: '교사',
          className: '전체',
          studentName: teacher.name,
          gender: teacher.gender,
          content,
          attendance: weekData.attendance || false
        })
      })
    })
  }

  // 정렬: 교사 먼저, 그 다음 학년순, 반순, 이름순
  allItems.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'teacher' ? -1 : 1
    }
    if (a.gradeName !== b.gradeName) return a.gradeName.localeCompare(b.gradeName)
    if (a.className !== b.className) return a.className.localeCompare(b.className)
    return a.studentName.localeCompare(b.studentName)
  })

  const filteredItems = allItems.filter(item => 
    item.studentName.includes(searchTerm) || 
    item.className.includes(searchTerm) ||
    item.gradeName.includes(searchTerm) ||
    item.content.includes(searchTerm)
  )

  return (
    <div className="prayer-view">
      <div className="prayer-header-section">
        <h2>{title}</h2>
        <div className="week-info">{weekId}</div>
      </div>

      <div className="date-navigation">
        <button onClick={goToPrevWeek}>← 이전주</button>
        <button className="today-btn" onClick={goToThisWeek}>오늘</button>
        <button onClick={goToNextWeek}>다음주 →</button>
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

      {showCount && <h3>{countLabel} ({filteredItems.length}개)</h3>}
      
      {filteredItems.length === 0 ? (
        <p className="empty-message">
          {searchTerm ? '검색 결과가 없습니다.' : emptyMessage}
        </p>
      ) : (
        <div className="prayers-list">
          {filteredItems.map((item, idx) => (
            <div key={idx} className={`${itemClassName} ${item.type === 'teacher' ? 'teacher-item' : ''}`}>
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
              <p className="prayer-text">{item.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}