import { useState } from 'react'
import useWeekNavigation from '../hooks/useWeekNavigation'
import { updateAttendance, updateTeacherAttendance } from '../utils/dataManager'
import '../styles/AttendanceManagement.css'

export default function AttendanceManagement({ data, dailyData, setDailyData, teacherDailyData, setTeacherDailyData }) {
  const { weekId, goToPrevWeek, goToNextWeek, goToThisWeek } = useWeekNavigation()
  const [selectedGradeId, setSelectedGradeId] = useState('all') // 'all', 'teachers', 또는 특정 gradeId
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    studentId: null,
    studentName: null,
    currentStatus: null,
    newStatus: null,
    isTeacher: false
  })

  const handleFilterClick = (gradeId) => {
    // 이미 선택된 필터를 다시 클릭하면 'all'로 설정 (선택 해제)
    if (selectedGradeId === gradeId) {
      setSelectedGradeId('all')
    } else {
      setSelectedGradeId(gradeId)
    }
  }

  // 학생 이름 클릭 핸들러
  const handleStudentClick = (studentId, studentName, currentStatus) => {
    const newStatus = !currentStatus // 토글
    setConfirmModal({
      isOpen: true,
      studentId,
      studentName,
      currentStatus,
      newStatus,
      isTeacher: false
    })
  }

  // 교사 이름 클릭 핸들러
  const handleTeacherClick = (teacherId, teacherName, currentStatus) => {
    const newStatus = !currentStatus
    setConfirmModal({
      isOpen: true,
      studentId: teacherId,
      studentName: teacherName,
      currentStatus,
      newStatus,
      isTeacher: true
    })
  }

  // 확인 버튼 클릭
  const handleConfirmYes = async () => {
    const { studentId, newStatus, isTeacher } = confirmModal
    
    if (isTeacher) {
      await updateTeacherAttendance(studentId, weekId, newStatus)
      // 교사 데이터 업데이트
      setTeacherDailyData(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [weekId]: {
            ...prev[studentId]?.[weekId],
            attendance: newStatus
          }
        }
      }))
    } else {
      await updateAttendance(studentId, weekId, newStatus)
      // 학생 데이터 업데이트
      setDailyData(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [weekId]: {
            ...prev[studentId]?.[weekId],
            attendance: newStatus
          }
        }
      }))
    }
    
    setConfirmModal({ ...confirmModal, isOpen: false })
  }

  // 취소 버튼 클릭
  const handleConfirmNo = () => {
    setConfirmModal({ ...confirmModal, isOpen: false })
  }

  const filteredGrades = selectedGradeId === 'all' 
    ? data.grades 
    : selectedGradeId === 'teachers'
      ? [] // 교사만 선택 시 학년 데이터는 빈 배열
      : data.grades.filter(grade => grade.gradeId === selectedGradeId)

  const showTeachers = selectedGradeId === 'all' || selectedGradeId === 'teachers'

  return (
    <div className="attendance-management">
      <div className="header-section">
        <h2>주간 출결 현황</h2>
        <div className="week-info">{weekId}</div>
      </div>

      <div className="date-navigation">
        <button onClick={goToPrevWeek}>← 이전주</button>
        <button className="today-btn" onClick={goToThisWeek}>오늘</button>
        <button onClick={goToNextWeek}>다음주 →</button>
      </div>

      <div className="filter-container">
        {data.grades.map(grade => (
          <button
            key={grade.gradeId}
            onClick={() => handleFilterClick(grade.gradeId)}
            className={`filter-chip ${selectedGradeId === grade.gradeId ? 'active' : ''}`}
          >
            {grade.gradeName}
          </button>
        ))}
        <button
          onClick={() => handleFilterClick('teachers')}
          className={`filter-chip ${selectedGradeId === 'teachers' ? 'active' : ''}`}
        >
          교사
        </button>
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
                      <div 
                        key={student.studentId} 
                        className={`student-tag ${isPresent ? 'present' : 'absent'}`}
                        onClick={() => handleStudentClick(student.studentId, student.name, isPresent)}
                        style={{ cursor: 'pointer' }}
                      >
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

      {showTeachers && data.teachers && (
        <div className="grade-section">
          <h3>교사</h3>
          <div className="class-section">
            {(() => {
              const teachers = data.teachers
              const total = teachers.length
              const present = teachers.filter(t => teacherDailyData?.[t.id]?.[weekId]?.attendance).length
              const absent = total - present
              
              return (
                <>
                  <h4>전체 교사<br/>출석: {present}명 / 결석: {absent}명</h4>
                  <div className="student-attendance-list">
                    {teachers.map(teacher => {
                      const isPresent = teacherDailyData?.[teacher.id]?.[weekId]?.attendance
                      return (
                        <div 
                          key={teacher.id} 
                          className={`student-tag ${isPresent ? 'present' : 'absent'}`}
                          onClick={() => handleTeacherClick(teacher.id, teacher.name, isPresent)}
                          style={{ cursor: 'pointer' }}
                        >
                          {teacher.name}
                        </div>
                      )
                    })}
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* 출결 상태 변경 확인 모달 */}
      {confirmModal.isOpen && (
        <ConfirmAttendanceModal
          studentName={confirmModal.studentName}
          currentStatus={confirmModal.currentStatus}
          newStatus={confirmModal.newStatus}
          onConfirm={handleConfirmYes}
          onCancel={handleConfirmNo}
        />
      )}
    </div>
  )
}

// 출결 상태 변경 확인 모달 컴포넌트
function ConfirmAttendanceModal({ studentName, currentStatus, newStatus, onConfirm, onCancel }) {
  const currentStatusText = currentStatus ? '출석' : '결석'
  const newStatusText = newStatus ? '출석' : '결석'

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>출결 상태 변경</h2>
        </div>
        <div className="modal-body">
          <p>{studentName}의 출결 상태를 {newStatusText}으로 변경하시겠습니까?</p>
          <p className="status-info">
            현재: <span className={currentStatus ? 'status-present' : 'status-absent'}>{currentStatusText}</span> 
            → <span className={newStatus ? 'status-present' : 'status-absent'}>{newStatusText}</span>
          </p>
        </div>
        <div className="modal-buttons">
          <button className="btn-yes" onClick={onConfirm}>예</button>
          <button className="btn-no" onClick={onCancel}>아니오</button>
        </div>
      </div>
    </div>
  )
}
