import { useState } from 'react'
import '../styles/ClassManagement.css' // Reusing styles for consistency
import { addTeacher, updateTeacher, removeTeacher, loadFromSupabase } from '../utils/dataManager'

export default function TeacherManagement({ data, onDataUpdate }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [teacherName, setTeacherName] = useState('')
  const [editingTeacherId, setEditingTeacherId] = useState(null)
  const [filter, setFilter] = useState({ type: 'all', id: null }) // { type: 'grade' | 'team' | 'unassigned' | 'all', id: gradeId | teamId }

  const teachers = data?.teachers || []
  const teams = data?.teams || []

  const handleFilterClick = (type, id = null) => {
    if (filter.type === type && filter.id === id) {
      setFilter({ type: 'all', id: null }) // Toggle off
    } else {
      setFilter({ type, id })
    }
  }

  // Filter teachers based on the current filter state
  const filteredTeachers = teachers.filter(teacher => {
    switch (filter.type) {
      case 'all':
        return true
      
      case 'grade':
        const grade = data.grades.find(g => g.gradeId === filter.id)
        if (!grade) return false
        return grade.classes.some(cls => cls.teacherIds && cls.teacherIds.includes(teacher.id))

      case 'team':
        if (filter.id === 'all_teams') {
          return teacher.teamIds && teacher.teamIds.length > 0
        }
        return teacher.teamIds && teacher.teamIds.includes(filter.id)

      case 'unassigned':
        const isAssignedToClass = data.grades.some(grade => 
          grade.classes.some(cls => cls.teacherIds && cls.teacherIds.includes(teacher.id))
        )
        const isAssignedToTeam = teacher.teamIds && teacher.teamIds.length > 0
        return !isAssignedToClass && !isAssignedToTeam

      default:
        return true
    }
  })

  const openAddModal = () => {
    setModalMode('add')
    setTeacherName('')
    setEditingTeacherId(null)
    setIsModalOpen(true)
  }

  const openEditModal = (teacher) => {
    setModalMode('edit')
    setEditingTeacherId(teacher.id)
    setTeacherName(teacher.name)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!teacherName.trim()) {
      alert('선생님 이름을 입력해주세요.')
      return
    }

    let success = false
    if (modalMode === 'add') {
      const newTeacher = await addTeacher(teacherName)
      success = !!newTeacher
    } else {
      success = await updateTeacher(editingTeacherId, teacherName)
    }

    if (success) {
      setIsModalOpen(false)
      const { data: newData } = await loadFromSupabase()
      if (newData) onDataUpdate(newData)
    } else {
      alert('저장에 실패했습니다.')
    }
  }

  const handleDelete = async (teacherId) => {
    if (window.confirm('정말 이 선생님을 삭제하시겠습니까? 담당하고 있는 반 또는 팀 정보에서 선생님 정보가 해제됩니다.')) {
      const success = await removeTeacher(teacherId)
      if (success) {
        const { data: newData } = await loadFromSupabase()
        if (newData) onDataUpdate(newData)
      } else {
        alert('삭제 실패')
      }
    }
  }

  const getAssignmentText = (teacher) => {
    const assignments = [teacher.assignedClasses, teacher.assignedTeams].filter(Boolean).join(', ')
    return assignments || '없음'
  }

  return (
    <div className="class-management">
      <div className="filter-container">
        {data?.grades?.map(grade => (
          <button
            key={grade.gradeId}
            onClick={() => handleFilterClick('grade', grade.gradeId)}
            className={`filter-chip ${filter.type === 'grade' && filter.id === grade.gradeId ? 'active' : ''}`}
          >
            {grade.gradeName}
          </button>
        ))}
        <button
          onClick={() => handleFilterClick('team', 'all_teams')}
          className={`filter-chip ${filter.type === 'team' ? 'active' : ''}`}
        >
          기타
        </button>
        <button
          onClick={() => handleFilterClick('unassigned')}
          className={`filter-chip ${filter.type === 'unassigned' ? 'active' : ''}`}
        >
          미지정
        </button>
      </div>

      {filter.type === 'team' && (
        <div className="filter-container sub-filter-container">
          {teams.map(team => (
            <button
              key={team.id}
              onClick={() => handleFilterClick('team', team.id)}
              className={`filter-chip ${filter.id === team.id ? 'active' : ''}`}
            >
              {team.name}
            </button>
          ))}
        </div>
      )}

      <div className="grade-card-section">
        <div className="grade-header">
          <h3>교사 목록 ({filteredTeachers.length}명)</h3>
          <button 
            onClick={openAddModal}
            className="btn-add-class"
          >
            + 교사 추가
          </button>
        </div>
        
        <div className="class-grid">
          {filteredTeachers.map(teacher => (
            <div key={teacher.id} className="class-item-card">
              <h4>{teacher.name}</h4>
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '4px' }}>
                담당: {getAssignmentText(teacher)}
              </p>
              <div className="card-actions">
                <button onClick={() => openEditModal(teacher)} className="btn-card-edit">✏️</button>
                <button onClick={() => handleDelete(teacher.id)} className="btn-card-delete">🗑️</button>
              </div>
            </div>
          ))}
          {filteredTeachers.length === 0 && <p className="empty-text">해당 조건의 교사가 없습니다.</p>}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{modalMode === 'add' ? '교사 추가' : '교사 정보 수정'}</h3>
            
            <div className="form-group">
              <label>선생님 이름</label>
              <input 
                type="text" 
                value={teacherName} 
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="이름 입력"
                autoFocus
              />
            </div>

            <div className="modal-actions">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="btn-modal-cancel"
              >
                취소
              </button>
              <button 
                onClick={handleSave}
                className="btn-modal-save"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
