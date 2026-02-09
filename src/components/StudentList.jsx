import { useState } from 'react'
import '../styles/StudentList.css'
import StudentCard from './StudentCard'
import InputModal from './InputModal'
import { getWeekDates, getNextWeek, getPreviousWeek, getTodayWeek, saveToLocalStorage } from '../utils/dataManager'

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
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [modalType, setModalType] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [attendanceConfirm, setAttendanceConfirm] = useState(null)

  const students = selectedClass.students
  const weekDates = getWeekDates(selectedDate)
  
  // Helper to format date consistently
  const formatDate = (date) => date.toISOString().split('T')[0]
  const selectedDateStr = formatDate(selectedDate)

  const filteredStudents = students.filter(s => {
    if (filterType === 'all') return true
    const dayData = dailyData[s.studentId]?.[selectedDateStr]
    if (filterType === 'attendance') return dayData?.attendance === true
    if (filterType === 'absent') return dayData?.attendance !== true
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
    if (!newDailyData[selectedStudent.studentId][selectedDateStr]) {
      newDailyData[selectedStudent.studentId][selectedDateStr] = {
        prayerRequests: [],
        notes: '',
        attendance: false
      }
    }

    if (modalType === 'prayer') {
      newDailyData[selectedStudent.studentId][selectedDateStr].prayerRequests.push(content)
    } else if (modalType === 'notes') {
      newDailyData[selectedStudent.studentId][selectedDateStr].notes = content
    }

    setDailyData(newDailyData)
    saveToLocalStorage(data, newDailyData)
    handleCloseModal()
  }

  const initiateAttendanceToggle = (student) => {
    const currentStatus = dailyData[student.studentId]?.[selectedDateStr]?.attendance || false
    setAttendanceConfirm({
      student,
      currentStatus
    })
  }

  const confirmAttendanceToggle = () => {
    if (!attendanceConfirm) return

    const { student } = attendanceConfirm
    const newDailyData = JSON.parse(JSON.stringify(dailyData))
    
    if (!newDailyData[student.studentId]) {
      newDailyData[student.studentId] = {}
    }
    if (!newDailyData[student.studentId][selectedDateStr]) {
      newDailyData[student.studentId][selectedDateStr] = {
        prayerRequests: [],
        notes: '',
        attendance: false
      }
    }

    newDailyData[student.studentId][selectedDateStr].attendance = !newDailyData[student.studentId][selectedDateStr].attendance
    
    setDailyData(newDailyData)
    saveToLocalStorage(data, newDailyData)
    setAttendanceConfirm(null)
  }

  const getWeekDisplay = () => {
    const start = weekDates[0]
    const end = weekDates[6]
    return `${start} ~ ${end}`
  }

  const handlePrevWeek = () => {
    setSelectedDate(getPreviousWeek(selectedDate))
  }

  const handleNextWeek = () => {
    setSelectedDate(getNextWeek(selectedDate))
  }

  const handleToday = () => {
    setSelectedDate(getTodayWeek())
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

      <div className="date-selector-container">
        <div className="week-navigation">
          <button className="week-btn" onClick={handlePrevWeek}>← 이전 주</button>
          <span className="week-range">{getWeekDisplay()}</span>
          <button className="week-btn" onClick={handleNextWeek}>다음 주 →</button>
        </div>
        
        <div className="day-selector">
          {weekDates.map(dateStr => {
            const date = new Date(dateStr)
            const dayName = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
            const dayNum = date.getDate()
            const isSelected = dateStr === selectedDateStr
            const isToday = dateStr === formatDate(new Date())
            
            return (
              <button 
                key={dateStr} 
                className={`day-btn ${isSelected ? 'active' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => setSelectedDate(new Date(dateStr))}
              >
                <span className="day-name">{dayName}</span>
                <span className="day-num">{dayNum}</span>
              </button>
            )
          })}
        </div>
        
        <div className="today-action">
           <button className="today-btn" onClick={handleToday}>오늘 날짜로 이동</button>
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
            const dayData = dailyData[s.studentId]?.[selectedDateStr]
            return dayData?.attendance
          }).length}명)
        </button>
        <button
          className={`filter-btn ${filterType === 'absent' ? 'active' : ''}`}
          onClick={() => setFilterType('absent')}
        >
          부재 ({students.filter(s => {
            const dayData = dailyData[s.studentId]?.[selectedDateStr]
            return !dayData?.attendance
          }).length}명)
        </button>
      </div>

      <div className="students-container">
        {filteredStudents.map(student => {
          const dayData = dailyData[student.studentId]?.[selectedDateStr] || {
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
              onAttendanceClick={() => initiateAttendanceToggle(student)}
            />
          )
        })}
      </div>

      {modalType && selectedStudent && (
        <InputModal
          student={selectedStudent}
          modalType={modalType}
          currentContent={selectedStudent && modalType === 'prayer' 
            ? (dailyData[selectedStudent.studentId]?.[selectedDateStr]?.prayerRequests || [])
            : (dailyData[selectedStudent.studentId]?.[selectedDateStr]?.notes || '')}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}

      {attendanceConfirm && (
        <div className="modal-overlay" onClick={() => setAttendanceConfirm(null)}>
          <div className="modal-content confirm-modal" onClick={e => e.stopPropagation()}>
            <h3>출석 상태 변경</h3>
            <p>
              <strong>{attendanceConfirm.student.name}</strong> 학생의 출석 상태를<br/>
              <strong>{attendanceConfirm.currentStatus ? '결석' : '출석'}</strong>(으)로 변경하시겠습니까?
            </p>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setAttendanceConfirm(null)}>취소</button>
              <button className="btn-save" onClick={confirmAttendanceToggle}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
