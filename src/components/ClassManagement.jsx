import { useState } from 'react'
import '../styles/ClassManagement.css'
import { addClass, removeClass, updateClass } from '../utils/dataManager'

export default function ClassManagement({ data, onDataUpdate }) {
  const [selectedGrade, setSelectedGrade] = useState(data.grades[0].gradeId)
  const [newClassName, setNewClassName] = useState('')
  const [newTeacherName, setNewTeacherName] = useState('')
  const [editingClassId, setEditingClassId] = useState(null)
  const [tempClassName, setTempClassName] = useState('')
  const [tempTeacherName, setTempTeacherName] = useState('')

  const grade = data.grades.find(g => g.gradeId === selectedGrade)
  const classes = grade.classes

  const handleAddClass = async () => {
    if (!newClassName.trim() || !newTeacherName.trim()) {
      alert('반 이름과 담임선생님 이름을 입력하세요.')
      return
    }

    const newClass = {
      className: newClassName,
      teacherName: newTeacherName,
      students: []
    }

    const createdClass = await addClass(selectedGrade, newClass)
    
    if (createdClass) {
      const newData = JSON.parse(JSON.stringify(data))
      const targetGrade = newData.grades.find(g => g.gradeId === selectedGrade)
      
      const newClassForState = {
        classId: String(createdClass.id),
        className: createdClass.name,
        teacherName: createdClass.teacher_name,
        students: []
      }
      
      targetGrade.classes.push(newClassForState)
      onDataUpdate(newData)
      
      setNewClassName('')
      setNewTeacherName('')
    } else {
      alert('반 추가에 실패했습니다.')
    }
  }

  const handleDeleteClass = async (classItem) => {
    if (confirm(`${grade.gradeName} ${classItem.className}을(를) 삭제하시겠습니까? 학생 데이터도 함께 삭제됩니다.`)) {
      const success = await removeClass(classItem.classId)
      
      if (success) {
        const newData = JSON.parse(JSON.stringify(data))
        const targetGrade = newData.grades.find(g => g.gradeId === selectedGrade)
        targetGrade.classes = targetGrade.classes.filter(c => c.classId !== classItem.classId)
        onDataUpdate(newData)
      } else {
        alert('반 삭제에 실패했습니다.')
      }
    }
  }

  const handleEditStart = (classItem) => {
    setEditingClassId(classItem.classId)
    setTempClassName(classItem.className)
    setTempTeacherName(classItem.teacherName)
  }

  const handleEditSave = async (classId) => {
    if (!tempClassName.trim() || !tempTeacherName.trim()) {
      alert('반 이름과 담임선생님 이름을 입력하세요.')
      return
    }

    const updates = {
      className: tempClassName,
      teacherName: tempTeacherName
    }

    const success = await updateClass(classId, updates)

    if (success) {
      const newData = JSON.parse(JSON.stringify(data))
      const targetGrade = newData.grades.find(g => g.gradeId === selectedGrade)
      const targetClass = targetGrade.classes.find(c => c.classId === classId)
      targetClass.className = tempClassName
      targetClass.teacherName = tempTeacherName
      onDataUpdate(newData)
      
      setEditingClassId(null)
    } else {
      alert('반 수정에 실패했습니다.')
    }
  }

  const handleEditCancel = () => {
    setEditingClassId(null)
    setTempClassName('')
    setTempTeacherName('')
  }

  return (
    <div className="class-management">
      <div className="section">
        <h3>학년 선택</h3>
        <select 
          value={selectedGrade}
          onChange={e => {
            setSelectedGrade(e.target.value)
            setEditingClassId(null)
          }}
        >
          {data.grades.map(g => (
            <option key={g.gradeId} value={g.gradeId}>
              {g.gradeName}
            </option>
          ))}
        </select>
      </div>

      <div className="section">
        <h3>새 반 추가</h3>
        <div className="input-group">
          <input
            type="text"
            placeholder="반 이름 (예: 1반)"
            value={newClassName}
            onChange={e => setNewClassName(e.target.value)}
          />
          <input
            type="text"
            placeholder="담임선생님 이름"
            value={newTeacherName}
            onChange={e => setNewTeacherName(e.target.value)}
          />
          <button onClick={handleAddClass} className="btn-primary">
            추가
          </button>
        </div>
      </div>

      <div className="section">
        <h3>반 목록</h3>
        <div className="classes-table">
          {classes.length === 0 ? (
            <p className="empty-message">등록된 반이 없습니다.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>반 이름</th>
                  <th>담임선생님</th>
                  <th>학생 수</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {classes.map(classItem => (
                  <tr key={classItem.classId}>
                    <td>
                      {editingClassId === classItem.classId ? (
                        <input
                          type="text"
                          value={tempClassName}
                          onChange={e => setTempClassName(e.target.value)}
                        />
                      ) : (
                        classItem.className
                      )}
                    </td>
                    <td>
                      {editingClassId === classItem.classId ? (
                        <input
                          type="text"
                          value={tempTeacherName}
                          onChange={e => setTempTeacherName(e.target.value)}
                        />
                      ) : (
                        classItem.teacherName
                      )}
                    </td>
                    <td>{classItem.students.length}명</td>
                    <td className="actions">
                      {editingClassId === classItem.classId ? (
                        <>
                          <button 
                            onClick={() => handleEditSave(classItem.classId)}
                            className="btn-save"
                            title="저장"
                          >
                            ✅
                          </button>
                          <button 
                            onClick={handleEditCancel}
                            className="btn-save" // 스타일 재사용
                            title="취소"
                          >
                            ❌
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleEditStart(classItem)}
                            className="btn-edit"
                            title="수정"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDeleteClass(classItem)}
                            className="btn-delete"
                            title="삭제"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
