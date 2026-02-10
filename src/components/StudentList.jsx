import { useState } from 'react'
import '../styles/StudentList.css'
import StudentCard from './StudentCard'
import InputModal from './InputModal'
import { getNextWeek, getPreviousWeek, getTodayWeek, saveToLocalStorage, getWeekId } from '../utils/dataManager'

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
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [modalType, setModalType] = useState(null)
  const [filterType, setFilterType] = useState('all')

  const students = selectedClass.students
  const weekId = getWeekId(currentDate)

  const filteredStudents = students.filter(s => {
    if (filterType === 'all') return true
    const weekData = dailyData[s.studentId]?.[weekId]
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
    if (!newDailyData[selectedStudent.studentId][weekId]) {
      newDailyData[selectedStudent.studentId][weekId] = {
        prayerRequests: [],
        notes: '',
        attendance: false
      }
    }

    if (modalType === 'prayer') {
      newDailyData[selectedStudent.studentId][weekId].prayerRequests.push(content)
    } else if (modalType === 'notes') {
      newDailyData[selectedStudent.studentId][weekId].notes = content
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
    if (!newDailyData[studentId][weekId]) {
      newDailyData[studentId][weekId] = {
        prayerRequests: [],
        notes: '',
        attendance: false
      }
    }

    newDailyData[studentId][weekId].attendance = !newDailyData[studentId][weekId].attendance
    setDailyData(newDailyData)
    saveToLocalStorage(data, newDailyData)
  }

  const handlePrevWeek = () => {
    setCurrentDate(getPreviousWeek(currentDate))
  }

  const handleNextWeek = () => {
    setCurrentDate(getNextWeek(currentDate))
  }

  const handleThisWeek = () => {
    setCurrentDate(getTodayWeek())
  }

  return (
    <div className="student-list">
      <header className="header">
        <div className="header-top">
          <button className="back-button" onClick={onBack}>← 뒤로가기</button>
          <button className="home-button" onClick={onHome}>🏠 홈</button>
        </div>
        <div className="header-content">
          <div className="breadcrumb">
            <button onClick={onHome}>홈</button>
            <span>&gt;</span>
            <button onClick={onBack}>{selectedGrade.gradeName}</button>
          </div>
          <div className="class-title-section">
            <h1>{selectedClass.className}</h1>
            <p className="teacher-info">{selectedClass.teacherName}</p>
          </div>
        </div>
      </header>

      <div className="date-selector-container">
        <div className="week-navigation">
          <button className="week-btn" onClick={handlePrevWeek}>← 이전 주</button>
          <span className="week-range">{weekId}</span>
          <button className="week-btn" onClick={handleNextWeek}>다음 주 →</button>
        </div>
        
        <div className="today-action">
           <button className="today-btn" onClick={handleThisWeek}>이번 주차로 이동</button>
        </div>
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
            const weekData = dailyData[s.studentId]?.[weekId]
            return weekData?.attendance
          }).length}명)
        </button>
        <button
          className={`filter-btn ${filterType === 'absent' ? 'active' : ''}`}
          onClick={() => setFilterType('absent')}
        >
          부재 ({students.filter(s => {
            const weekData = dailyData[s.studentId]?.[weekId]
            return !weekData?.attendance
          }).length}명)
        </button>
      </div>

      <div className="students-container">
        {filteredStudents.map(student => {
          const dayData = dailyData[student.studentId]?.[weekId] || {
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
            ? (dailyData[selectedStudent.studentId]?.[weekId]?.prayerRequests || [])
            : (dailyData[selectedStudent.studentId]?.[weekId]?.notes || '')}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
