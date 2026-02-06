import { useState } from 'react'
import '../styles/StudentList.css'
import StudentCard from './StudentCard'
import InputModal from './InputModal'
import { getWeekDates, getNextWeek, getPreviousWeek, getTodayWeek, getWeekStart, saveToLocalStorage } from '../utils/dataManager'

export default function StudentList({ 
  data, 
  setData,
  dailyData,
  setDailyData,
  selectedGrade, 
  selectedClass, 
  onBack,
  onHome
}) {
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [modalType, setModalType] = useState(null)
  const [currentWeekDate, setCurrentWeekDate] = useState(new Date())
  const [filterType, setFilterType] = useState('all')

  const students = selectedClass.students
  const weekDates = getWeekDates(currentWeekDate)
  const weekStartDate = getWeekStart(currentWeekDate)

  const filteredStudents = students.filter(s => {
    if (filterType === 'all') return true
    const weekData = dailyData[s.studentId]?.[weekStartDate]
    if (filterType === 'attendance') return weekData?.attendance === true
    if (filterType === 'absent') return weekData?.attendance !== true
    return true
  })

  const handleOpenModal = (student, type) => {
    setSelectedStudent(student)
    setModalType(type)
  }

  const handleCloseModal = () => {
    setSelectedStudent(null)
    setModalType(null)
  }

  const handleSave = (content) => {
    if (!selectedStudent) return
    
    const newDailyData = JSON.parse(JSON.stringify(dailyData))
    if (!newDailyData[selectedStudent.studentId]) {
      newDailyData[selectedStudent.studentId] = {}
    }
    if (!newDailyData[selectedStudent.studentId][weekStartDate]) {
      newDailyData[selectedStudent.studentId][weekStartDate] = {
        prayerRequests: [],
        notes: '',
        attendance: false
      }
    }

    if (modalType === 'prayer') {
      newDailyData[selectedStudent.studentId][weekStartDate].prayerRequests.push(content)
    } else if (modalType === 'notes') {
      newDailyData[selectedStudent.studentId][weekStartDate].notes = content
    }

    setDailyData(newDailyData)
    saveToLocalStorage(data, newDailyData)
    handleCloseModal()
  }

  const handleToggleAttendance = (studentId) => {
    const newDailyData = JSON.parse(JSON.stringify(dailyData))
    if (!newDailyData[studentId]) {
      newDailyData[studentId] = {}
    }
    if (!newDailyData[studentId][weekStartDate]) {
      newDailyData[studentId][weekStartDate] = {
        prayerRequests: [],
        notes: '',
        attendance: false
      }
    }

    newDailyData[studentId][weekStartDate].attendance = !newDailyData[studentId][weekStartDate].attendance
    setDailyData(newDailyData)
    saveToLocalStorage(data, newDailyData)
  }

  const getWeekDisplay = () => {
    const start = weekDates[0]
    const end = weekDates[6]
    return `${start} ~ ${end}`
  }

  const handlePrevWeek = () => {
    setCurrentWeekDate(getPreviousWeek(currentWeekDate))
  }

  const handleNextWeek = () => {
    setCurrentWeekDate(getNextWeek(currentWeekDate))
  }

  const handleToday = () => {
    setCurrentWeekDate(getTodayWeek())
  }

  return (
    <div className="student-list">
      <header className="header">
        <div className="header-top">
          <button className="back-button" onClick={onBack}>← 뒤로가기</button>
          <button className="home-button" onClick={onHome}>🏠 홈</button>
        </div>
        <div className="header-content">
          <h1>{selectedClass.className}</h1>
          <p className="teacher-info">{selectedClass.teacherName}</p>
        </div>
      </header>

      <div className="week-navigation">
        <button className="week-btn" onClick={handlePrevWeek}>← 이전 주</button>
        <div className="week-display">
          <span className="week-range">{getWeekDisplay()}</span>
          <button className="today-btn" onClick={handleToday}>오늘</button>
        </div>
        <button className="week-btn" onClick={handleNextWeek}>다음 주 →</button>
      </div>

      <div className="date-selector">
        <p>이번 주: {weekDates[0]} ~ {weekDates[6]}</p>
      </div>

      <div className="filter-buttons">
        <button
          className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          전체 ({students.length}명)
        </button>
        <button
          className={`filter-btn ${filterType === 'attendance' ? 'active' : ''}`}
          onClick={() => setFilterType('attendance')}
        >
          출석 ({students.filter(s => {
            const weekData = dailyData[s.studentId]?.[weekStartDate]
            return weekData?.attendance
          }).length}명)
        </button>
        <button
          className={`filter-btn ${filterType === 'absent' ? 'active' : ''}`}
          onClick={() => setFilterType('absent')}
        >
          부재 ({students.filter(s => {
            const weekData = dailyData[s.studentId]?.[weekStartDate]
            return !weekData?.attendance
          }).length}명)
        </button>
      </div>

      <div className="students-container">
        {filteredStudents.map(student => {
          const dayData = dailyData[student.studentId]?.[weekStartDate] || {
            prayerRequests: [],
            notes: '',
            attendance: false
          }
          return (
            <StudentCard
              key={student.studentId}
              student={student}
              dayData={dayData}
              onPrayerClick={() => handleOpenModal(student, 'prayer')}
              onNotesClick={() => handleOpenModal(student, 'notes')}
              onAttendanceClick={() => handleToggleAttendance(student.studentId)}
            />
          )
        })}
      </div>

      {modalType && selectedStudent && (
        <InputModal
          student={selectedStudent}
          modalType={modalType}
          currentContent={selectedStudent && modalType === 'prayer' 
            ? (dailyData[selectedStudent.studentId]?.[weekStartDate]?.prayerRequests || [])
            : (dailyData[selectedStudent.studentId]?.[weekStartDate]?.notes || '')}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
