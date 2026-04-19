import { useState } from 'react'
import '../styles/StudentList.css'
import StudentCard from './StudentCard'
import InputModal from './InputModal'
import useWeekNavigation from '../hooks/useWeekNavigation'
import { applyOptimisticUpdate } from '../utils/optimisticUpdate'
import { updateAttendance, updateNotes, addPrayerRequest } from '../utils/dataManager'

export default function StudentList({ 
  dailyData,
  setDailyData,
  selectedGrade, 
  selectedClass, 
  onBack,
  onHome
}) {
  const { weekId, goToPrevWeek, goToNextWeek, goToThisWeek } = useWeekNavigation()
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [modalType, setModalType] = useState(null)
  const [filterType, setFilterType] = useState('all')

  const students = selectedClass.students

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

  const handleSave = async (content) => {
    if (!selectedStudent) return
    
    const id = selectedStudent.studentId
    const type = modalType
    handleCloseModal()

    if (type === 'prayer') {
      setDailyData(applyOptimisticUpdate(dailyData, id, weekId, w => { w.prayerRequests = content }))
      await addPrayerRequest(id, weekId, content)
    } else if (type === 'notes') {
      setDailyData(applyOptimisticUpdate(dailyData, id, weekId, w => { w.notes = content }))
      await updateNotes(id, weekId, content)
    }
  }

  const handleToggleAttendance = async (studentId) => {
    const current = dailyData[studentId]?.[weekId]?.attendance || false
    const newAttendance = !current
    setDailyData(applyOptimisticUpdate(dailyData, studentId, weekId, w => { w.attendance = newAttendance }))
    await updateAttendance(studentId, weekId, newAttendance)
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
          <button className="week-btn" onClick={goToPrevWeek}>← 이전 주</button>
          <span className="week-range">{weekId}</span>
          <button className="week-btn" onClick={goToNextWeek}>다음 주 →</button>
        </div>
        
        <div className="today-action">
           <button className="today-btn" onClick={goToThisWeek}>이번 주차로 이동</button>
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
            prayerRequests: '',
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
          key={`${selectedStudent.studentId}-${modalType}-${weekId}`}
          student={selectedStudent}
          modalType={modalType}
          currentContent={selectedStudent && modalType === 'prayer' 
            ? (dailyData[selectedStudent.studentId]?.[weekId]?.prayerRequests || '')
            : (dailyData[selectedStudent.studentId]?.[weekId]?.notes || '')}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
