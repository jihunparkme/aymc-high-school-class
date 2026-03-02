import { useState } from 'react'
import '../styles/StudentList.css'
import '../styles/ClassManagement.css'
import StudentCard from './StudentCard'
import InputModal from './InputModal'
import useWeekNavigation from '../hooks/useWeekNavigation'
import { applyOptimisticUpdate } from '../utils/optimisticUpdate'
import { updateTeacherAttendance, updateTeacherNotes, addTeacherPrayerRequest } from '../utils/dataManager'

export default function TeacherList({ 
  data, 
  teacherDailyData,
  setTeacherDailyData,
  onBack,
  onHome
}) {
  const { weekId, goToPrevWeek, goToNextWeek, goToThisWeek } = useWeekNavigation()
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [modalType, setModalType] = useState(null)
  const [filterType, setFilterType] = useState('all')
  const [filterGradeId, setFilterGradeId] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const teachers = data.teachers || []

  const filteredTeachers = teachers.filter(t => {
    // 0. Name search
    if (searchTerm && !t.name.includes(searchTerm)) return false

    // 1. Grade Filter
    let gradeMatch = true
    if (filterGradeId !== 'all') {
      if (filterGradeId === 'unassigned') {
        const isAssigned = data.grades.some(grade => 
          grade.classes.some(cls => cls.teacherIds && cls.teacherIds.includes(t.id))
        )
        gradeMatch = !isAssigned
      } else {
        const grade = data.grades.find(g => g.gradeId === filterGradeId)
        if (!grade) gradeMatch = false
        else {
          gradeMatch = grade.classes.some(cls => cls.teacherIds && cls.teacherIds.includes(t.id))
        }
      }
    }
    if (!gradeMatch) return false

    // 2. Attendance Filter
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
    
    const id = selectedTeacher.id
    const type = modalType
    handleCloseModal()

    if (type === 'prayer') {
      setTeacherDailyData(applyOptimisticUpdate(teacherDailyData, id, weekId, w => w.prayerRequests.push(content)))
      await addTeacherPrayerRequest(id, weekId, content)
    } else if (type === 'notes') {
      setTeacherDailyData(applyOptimisticUpdate(teacherDailyData, id, weekId, w => { w.notes = content }))
      await updateTeacherNotes(id, weekId, content)
    }
  }

  const handleToggleAttendance = async (teacherId) => {
    const current = teacherDailyData[teacherId]?.[weekId]?.attendance || false
    const newAttendance = !current
    setTeacherDailyData(applyOptimisticUpdate(teacherDailyData, teacherId, weekId, w => { w.attendance = newAttendance }))
    await updateTeacherAttendance(teacherId, weekId, newAttendance)
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
          <button className="week-btn" onClick={goToPrevWeek}>← 이전 주</button>
          <span className="week-range">{weekId}</span>
          <button className="week-btn" onClick={goToNextWeek}>다음 주 →</button>
        </div>
        
        <div className="today-action">
           <button className="today-btn" onClick={goToThisWeek}>이번 주차로 이동</button>
        </div>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="선생님 이름 검색"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Grade Filter */}
      <div className="filter-container">
        <button
          onClick={() => setFilterGradeId('all')}
          className={`filter-chip ${filterGradeId === 'all' ? 'active' : ''}`}
        >
          전체
        </button>
        {data?.grades?.map(grade => (
          <button
            key={grade.gradeId}
            onClick={() => setFilterGradeId(grade.gradeId)}
            className={`filter-chip ${filterGradeId === grade.gradeId ? 'active' : ''}`}
          >
            {grade.gradeName}
          </button>
        ))}
        <button
          onClick={() => setFilterGradeId('unassigned')}
          className={`filter-chip ${filterGradeId === 'unassigned' ? 'active' : ''}`}
        >
          미지정
        </button>
      </div>

      <div className="filter-buttons">
        <button
          className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
          onClick={() => setFilterType('all')}
        >
          전체 ({filteredTeachers.length}명)
        </button>
        <button
          className={`filter-btn ${filterType === 'attendance' ? 'active' : ''}`}
          onClick={() => setFilterType('attendance')}
        >
          출석 ({filteredTeachers.filter(t => {
            const weekData = teacherDailyData[t.id]?.[weekId]
            return weekData?.attendance
          }).length}명)
        </button>
        <button
          className={`filter-btn ${filterType === 'absent' ? 'active' : ''}`}
          onClick={() => setFilterType('absent')}
        >
          부재 ({filteredTeachers.filter(t => {
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
              student={teacher}
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
          student={selectedTeacher}
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
