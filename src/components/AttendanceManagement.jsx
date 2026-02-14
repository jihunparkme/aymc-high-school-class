import { useState } from 'react'
import { getNextWeek, getPreviousWeek, getTodayWeek, getWeekId } from '../utils/dataManager'
import '../styles/AttendanceManagement.css'

export default function AttendanceManagement({ data, dailyData }) {
  const [currentWeekDate, setCurrentWeekDate] = useState(new Date())
  const [selectedGradeId, setSelectedGradeId] = useState('all') // 'all' 또는 특정 gradeId

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

  const filteredGrades = selectedGradeId === 'all' 
    ? data.grades 
    : data.grades.filter(grade => grade.gradeId === selectedGradeId)

  return (
    <div className="attendance-management">
      <div className="header-section">
        <h2>주간 출결 현황</h2>
        <div className="week-info">{weekId}</div>
      </div>

      <div className="date-navigation">
        <button onClick={handlePrevWeek}>← 이전주</button>
        <button className="today-btn" onClick={handleToday}>오늘</button>
        <button onClick={handleNextWeek}>다음주 →</button>
      </div>

      <div className="grade-selector-attendance">
        <label htmlFor="grade-select"></label>
        <select 
          id="grade-select" 
          value={selectedGradeId} 
          onChange={(e) => setSelectedGradeId(e.target.value)}
        >
          <option value="all">전체 학년</option>
          {data.grades.map(grade => (
            <option key={grade.gradeId} value={grade.gradeId}>
              {grade.gradeName}
            </option>
          ))}
        </select>
      </div>

      {filteredGrades.map(grade => (
        <div key={grade.gradeId} className="grade-section">
          <h3>{grade.gradeName}</h3>
          {grade.classes.map(classItem => {
            const total = classItem.students.length
            const present = classItem.students.filter(s => dailyData[s.studentId]?.[weekId]?.attendance).length
            const absent = total - present
            
            return (
              <div key={classItem.classId} className="class-section">
                <h4>{classItem.className} ({classItem.teacherName})<br/>출석: {present}명 / 결석: {absent}명</h4>
                <div className="student-attendance-list">
                  {classItem.students.map(student => {
                    const isPresent = dailyData[student.studentId]?.[weekId]?.attendance
                    return (
                      <div key={student.studentId} className={`student-tag ${isPresent ? 'present' : 'absent'}`}>
                        {student.name}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
