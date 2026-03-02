import { useState } from 'react'
import '../styles/StudentManagement.css'
import { addStudent, removeStudent, updateStudent } from '../utils/dataManager'

export default function StudentManagement({ data, onDataUpdate }) {
  const [selectedGrade, setSelectedGrade] = useState(data.grades[0].gradeId)
  const [selectedClass, setSelectedClass] = useState(data.grades[0].classes[0].classId)
  const [newStudentName, setNewStudentName] = useState('')
  const [newStudentGender, setNewStudentGender] = useState('남') // 기본값 '남'
  const [editingStudentId, setEditingStudentId] = useState(null)
  const [tempStudentName, setTempStudentName] = useState('')

  const grade = data.grades.find(g => g.gradeId === selectedGrade)
  const classItem = grade.classes.find(c => c.classId === selectedClass)
  const students = classItem.students

  const handleAddStudent = async () => {
    if (!newStudentName.trim()) {
      alert('학생 이름을 입력하세요.')
      return
    }

    const newStudent = {
      name: newStudentName,
      gender: newStudentGender,
      prayerRequests: [],
      notes: '',
      attendance: true
    }

    const createdStudent = await addStudent(selectedClass, newStudent)

    if (createdStudent) {
      const newData = structuredClone(data)
      const targetGrade = newData.grades.find(g => g.gradeId === selectedGrade)
      const targetClass = targetGrade.classes.find(c => c.classId === selectedClass)
      
      const newStudentForState = {
        studentId: String(createdStudent.id),
        name: createdStudent.name,
        gender: createdStudent.gender,
        prayerRequests: [],
        notes: '',
        attendance: false
      }
      
      targetClass.students.push(newStudentForState)
      onDataUpdate(newData)
      
      setNewStudentName('')
      setNewStudentGender('남') // 초기화
    } else {
      alert('학생 추가에 실패했습니다.')
    }
  }

  const handleDeleteStudent = async (student) => {
    if (confirm(`${grade.gradeName} ${classItem.className} ${student.name}을(를) 삭제하시겠습니까?`)) {
      const success = await removeStudent(student.studentId)
      
      if (success) {
        const newData = structuredClone(data)
        const targetGrade = newData.grades.find(g => g.gradeId === selectedGrade)
        const targetClass = targetGrade.classes.find(c => c.classId === selectedClass)
        targetClass.students = targetClass.students.filter(s => s.studentId !== student.studentId)
        onDataUpdate(newData)
      } else {
        alert('학생 삭제에 실패했습니다.')
      }
    }
  }

  const handleEditStart = (student) => {
    setEditingStudentId(student.studentId)
    setTempStudentName(student.name)
  }

  const handleEditSave = async (studentId) => {
    if (!tempStudentName.trim()) {
      alert('학생 이름을 입력하세요.')
      return
    }

    const success = await updateStudent(studentId, tempStudentName)

    if (success) {
      const newData = structuredClone(data)
      const targetGrade = newData.grades.find(g => g.gradeId === selectedGrade)
      const targetClass = targetGrade.classes.find(c => c.classId === selectedClass)
      const targetStudent = targetClass.students.find(s => s.studentId === studentId)
      targetStudent.name = tempStudentName
      onDataUpdate(newData)
      
      setEditingStudentId(null)
    } else {
      alert('학생 수정에 실패했습니다.')
    }
  }

  const handleEditCancel = () => {
    setEditingStudentId(null)
    setTempStudentName('')
  }

  return (
    <div className="student-management">
      <div className="section">
        <h3>학년 선택</h3>
        <select 
          value={selectedGrade}
          onChange={e => {
            setSelectedGrade(e.target.value)
            setSelectedClass(data.grades.find(g => g.gradeId === e.target.value).classes[0].classId)
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
        <h3>반 선택</h3>
        <select 
          value={selectedClass}
          onChange={e => setSelectedClass(e.target.value)}
        >
          {grade.classes.map(c => (
            <option key={c.classId} value={c.classId}>
              {c.className} ({c.teacherName})
            </option>
          ))}
        </select>
      </div>

      <div className="section">
        <h3>새 학생 추가</h3>
        <div className="input-group">
          <input
            type="text"
            placeholder="학생 이름"
            value={newStudentName}
            onChange={e => setNewStudentName(e.target.value)}
          />
          <div className="gender-select">
            <label className={`gender-option ${newStudentGender === '남' ? 'selected male' : ''}`}>
              <input 
                type="radio" 
                value="남" 
                checked={newStudentGender === '남'} 
                onChange={e => setNewStudentGender(e.target.value)} 
              /> 
              <span>🙋🏼‍♂️ 남</span>
            </label>
            <label className={`gender-option ${newStudentGender === '여' ? 'selected female' : ''}`}>
              <input 
                type="radio" 
                value="여" 
                checked={newStudentGender === '여'} 
                onChange={e => setNewStudentGender(e.target.value)} 
              /> 
              <span>🙋🏻‍♀️ 여</span>
            </label>
          </div>
          <button onClick={handleAddStudent} className="btn-primary">
            추가
          </button>
        </div>
      </div>

      <div className="section">
        <h3>학생 목록</h3>
        <p className="class-info">
          {grade.gradeName} {classItem.className} ({classItem.teacherName})
        </p>
        <div className="students-table">
          {students.length === 0 ? (
            <p className="empty-message">등록된 학생이 없습니다.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>번호</th>
                  <th>이름</th>
                  <th>성별</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, idx) => (
                  <tr key={student.studentId}>
                    <td>{idx + 1}</td>
                    <td>
                      {editingStudentId === student.studentId ? (
                        <input
                          type="text"
                          value={tempStudentName}
                          onChange={e => setTempStudentName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleEditSave(student.studentId)
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        student.name
                      )}
                    </td>
                    <td>{student.gender === '남' ? '🙋🏼‍♂️' : '🙋🏻‍♀️'}</td>
                    <td className="actions">
                      {editingStudentId === student.studentId ? (
                        <>
                          <button 
                            onClick={() => handleEditSave(student.studentId)}
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
                            onClick={() => handleEditStart(student)}
                            className="btn-edit"
                            title="수정"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDeleteStudent(student)}
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
