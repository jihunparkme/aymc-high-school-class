import { useState } from 'react'
import '../styles/StudentList.css' // Reusing StudentList styles
import StudentCard from './StudentCard' // Reusing StudentCard (can be renamed to PersonCard later)
import InputModal from './InputModal'
import { getNextWeek, getPreviousWeek, getTodayWeek, getWeekId, updateTeacherAttendance, updateTeacherNotes, addTeacherPrayerRequest } from '../utils/dataManager'

export default function TeacherList({ 
  data, 
  teacherDailyData,
  setTeacherDailyData,
  onBack,
  onHome
}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [modalType, setModalType] = useState(null)
  const [filterType, setFilterType] = useState('all')

  const teachers = data.teachers || []
  const weekId = getWeekId(currentDate)

  const filteredTeachers = teachers.filter(t => {
    if (filterType === 'all') return true
    const weekData = teacherDailyData[t.id]?.[weekId]
    if (filterType === 'attendance') return weekData?.attendance === true
    if (filterType === 'absent') return weekData?.attendance !== true
    return true
  })

  const handleOpenModal = (teacher, type) => {
    setSelectedTeacher(teacher)
    setModalType(type)
  }

  const handleCloseModal = () => {
    setSelectedTeacher(null)
    setModalType(null)
  }

  const handleSave = async (content) => {
    if (!selectedTeacher) return
    
    // Optimistic UI Update
    const newDailyData = JSON.parse(JSON.stringify(teacherDailyData))
    if (!newDailyData[selectedTeacher.id]) {
      newDailyData[selectedTeacher.id] = {}
    }
    if (!newDailyData[selectedTeacher.id][weekId]) {
      newDailyData[selectedTeacher.id][weekId] = {
        prayerRequests: [],
        notes: '',
        attendance: false
      }
    }

    if (modalType === 'prayer') {
      newDailyData[selectedTeacher.id][weekId].prayerRequests.push(content)
      await addTeacherPrayerRequest(selectedTeacher.id, weekId, content)
    } else if (modalType === 'notes') {
      newDailyData[selectedTeacher.id][weekId].notes = content
      await updateTeacherNotes(selectedTeacher.id, weekId, content)
    }

    setTeacherDailyData(newDailyData)
    handleCloseModal()
  }

  const handleToggleAttendance = async (teacherId) => {
    // Optimistic UI Update
    const newDailyData = JSON.parse(JSON.stringify(teacherDailyData))
    if (!newDailyData[teacherId]) {
      newDailyData[teacherId] = {}
    }
    if (!newDailyData[teacherId][weekId]) {
      newDailyData[teacherId][weekId] = {
        prayerRequests: [],
        notes: '',
        attendance: false
      }
    }

    const newAttendance = !newDailyData[teacherId][weekId].attendance
    newDailyData[teacherId][weekId].attendance = newAttendance
    
    setTeacherDailyData(newDailyData)
    await updateTeacherAttendance(teacherId, weekId, newAttendance)
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
            <span>교사 관리</span>
          </div>
          <div className="class-title-section">
            <h1>교사 목록</h1>
            <p className="teacher-info">전체 교사 ({teachers.length}명)</p>
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
          전체 ({teachers.length}명)
        </button>
        <button
          className={`filter-btn ${filterType === 'attendance' ? 'active' : ''}`}
          onClick={() => setFilterType('attendance')}
        >
          출석 ({teachers.filter(t => {
            const weekData = teacherDailyData[t.id]?.[weekId]
            return weekData?.attendance
          }).length}명)
        </button>
        <button
          className={`filter-btn ${filterType === 'absent' ? 'active' : ''}`}
          onClick={() => setFilterType('absent')}
        >
          부재 ({teachers.filter(t => {
            const weekData = teacherDailyData[t.id]?.[weekId]
            return !weekData?.attendance
          }).length}명)
        </button>
      </div>

      <div className="students-container">
        {filteredTeachers.map(teacher => {
          const dayData = teacherDailyData[teacher.id]?.[weekId] || {
            prayerRequests: [],
            notes: '',
            attendance: false
          }
          return (
            <StudentCard
              key={teacher.id}
              student={teacher} // Reusing StudentCard prop name
              dayData={dayData}
              onPrayerClick={() => handleOpenModal(teacher, 'prayer')}
              onNotesClick={() => handleOpenModal(teacher, 'notes')}
              onAttendanceClick={() => handleToggleAttendance(teacher.id)}
            />
          )
        })}
      </div>

      {modalType && selectedTeacher && (
        <InputModal
          student={selectedTeacher} // Reusing InputModal prop name
          modalType={modalType}
          currentContent={selectedTeacher && modalType === 'prayer' 
            ? (teacherDailyData[selectedTeacher.id]?.[weekId]?.prayerRequests || [])
            : (teacherDailyData[selectedTeacher.id]?.[weekId]?.notes || '')}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
