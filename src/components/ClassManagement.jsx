import { useState } from 'react'
import '../styles/ClassManagement.css'
import { addClass, removeClass, updateClass } from '../utils/dataManager'

export default function ClassManagement({ data, onDataUpdate }) {
  const [selectedGrade, setSelectedGrade] = useState(data.grades[0].gradeId)
  const [newClassName, setNewClassName] = useState('')
  const [newTeacherName, setNewTeacherName] = useState('')
  const [editingClassId, setEditingClassId] = useState(null)

  const grade = data.grades.find(g => g.gradeId === selectedGrade)
  const classes = grade.classes

  const handleAddClass = () => {
    if (!newClassName.trim() || !newTeacherName.trim()) {
      alert('반 이름과 담임선생님 이름을 입력하세요.')
      return
    }

    const newClassId = `${selectedGrade}-${classes.length + 1}`
    const newClass = {
      classId: newClassId,
      className: newClassName,
      teacherName: newTeacherName,
      students: []
    }

    const newData = addClass(data, selectedGrade, newClass)
    onDataUpdate(newData)
    setNewClassName('')
    setNewTeacherName('')
  }

  const handleDeleteClass = (classId) => {
    if (confirm('정말 이 반을 삭제하시겠습니까? 학생 데이터도 함께 삭제됩니다.')) {
      const newData = removeClass(data, selectedGrade, classId)
      onDataUpdate(newData)
    }
  }

  const handleUpdateClass = (classId, className, teacherName) => {
    if (!className.trim() || !teacherName.trim()) {
      alert('반 이름과 담임선생님 이름을 입력하세요.')
      return
    }

    const newData = updateClass(data, selectedGrade, classId, {
      className,
      teacherName
    })
    onDataUpdate(newData)
    setEditingClassId(null)
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
                          defaultValue={classItem.className}
                          onChange={e => {
                            const newName = e.target.value
                            const newData = updateClass(data, selectedGrade, classItem.classId, {
                              className: newName
                            })
                            onDataUpdate(newData)
                          }}
                        />
                      ) : (
                        classItem.className
                      )}
                    </td>
                    <td>
                      {editingClassId === classItem.classId ? (
                        <input
                          type="text"
                          defaultValue={classItem.teacherName}
                          onChange={e => {
                            const newName = e.target.value
                            const newData = updateClass(data, selectedGrade, classItem.classId, {
                              teacherName: newName
                            })
                            onDataUpdate(newData)
                          }}
                        />
                      ) : (
                        classItem.teacherName
                      )}
                    </td>
                    <td>{classItem.students.length}명</td>
                    <td className="actions">
                      {editingClassId === classItem.classId ? (
                        <button 
                          onClick={() => setEditingClassId(null)}
                          className="btn-save"
                        >
                          완료
                        </button>
                      ) : (
                        <button 
                          onClick={() => setEditingClassId(classItem.classId)}
                          className="btn-edit"
                        >
                          수정
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteClass(classItem.classId)}
                        className="btn-delete"
                      >
                        삭제
                      </button>
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
