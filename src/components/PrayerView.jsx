import { useState, useEffect } from 'react'
import { getWeekStart, getWeekDates, getNextWeek, getPreviousWeek, getTodayWeek } from '../utils/dataManager'
import '../styles/PrayerView.css'

export default function PrayerView({ data, dailyData }) {
  const [currentWeekDate, setCurrentWeekDate] = useState(new Date())
  const weekStartDate = getWeekStart(currentWeekDate)
  const weekDates = getWeekDates(weekStartDate)
  const weekDisplay = `${weekDates[0]} ~ ${weekDates[6]}`

  const handlePrevWeek = () => {
    setCurrentWeekDate(getPreviousWeek(currentWeekDate))
  }

  const handleNextWeek = () => {
    setCurrentWeekDate(getNextWeek(currentWeekDate))
  }

  const handleToday = () => {
    setCurrentWeekDate(getTodayWeek(new Date()))
  }

  const allPrayers = []

  data.grades.forEach(grade => {
    grade.classes.forEach(classItem => {
      classItem.students.forEach(student => {
        // 현재 주의 기도제목만 수집
        if (dailyData[student.studentId] && dailyData[student.studentId][weekStartDate]) {
          const weekData = dailyData[student.studentId][weekStartDate]
          if (weekData.prayerRequests && weekData.prayerRequests.length > 0) {
            weekData.prayerRequests.forEach(prayer => {
              allPrayers.push({
                gradeName: grade.gradeName,
                className: classItem.className,
                studentName: student.name,
                prayer: prayer,
                week: weekStartDate
              })
            })
          }
        }
      })
    })
  })

  return (
    <div className="prayer-view">
      <div className="prayer-header-section">
        <h2>주간 기도제목</h2>
        <div className="week-info">{weekDisplay}</div>
      </div>

      <div className="date-navigation">
        <button onClick={handlePrevWeek}>← 이전주</button>
        <button className="today-btn" onClick={handleToday}>오늘</button>
        <button onClick={handleNextWeek}>다음주 →</button>
      </div>

      <h3>전체 기도제목 ({allPrayers.length}개)</h3>
      
      {allPrayers.length === 0 ? (
        <p className="empty-message">이번 주 기도제목이 없습니다.</p>
      ) : (
        <div className="prayers-list">
          {allPrayers.map((item, idx) => (
            <div key={idx} className="prayer-item">
              <div className="prayer-header-info">
                <span className="grade-class">{item.gradeName} {item.className}</span>
                <span className="student-name">{item.studentName}</span>
              </div>
              <p className="prayer-text">{item.prayer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
