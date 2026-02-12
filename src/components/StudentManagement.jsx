import { useState } from 'react'
import '../styles/StudentManagement.css'
import { addStudent, removeStudent, updateStudent } from '../utils/dataManager'

export default function StudentManagement({ data, onDataUpdate }) {
  const [selectedGrade, setSelectedGrade] = useState(data.grades[0].gradeId)
  const [selectedClass, setSelectedClass] = useState(data.grades[0].classes[0].classId)
  const [newStudentName, setNewStudentName] = useState('')
  const [newStudentGender, setNewStudentGender] = useState('남') // 기본값 '남'
  const [editingStudentId, setEditingStudentId] = useState(null)

  const grade = data.grades.find(g => g.gradeId === selectedGrade)
  const classItem = grade.classes.find(c => c.classId === selectedClass)
  const students = classItem.students

  const handleAddStudent = () => {
    if (!newStudentName.trim()) {
      alert('학생 이름을 입력하세요.')
      return
    }

    const newStudentId = `${selectedClass}-${students.length + 1}`
    const newStudent = {
      studentId: newStudentId,
      name: newStudentName,
      gender: newStudentGender,
      prayerRequests: [],
      notes: '',
      attendance: true
    }

    const newData = addStudent(data, selectedGrade, selectedClass, newStudent)
    onDataUpdate(newData)
    setNewStudentName('')
    setNewStudentGender('남') // 초기화
  }

  const handleDeleteStudent = (studentId) => {
    if (confirm('정말 이 학생을 삭제하시겠습니까?')) {
      const newData = removeStudent(data, selectedGrade, selectedClass, studentId)
      onDataUpdate(newData)
    }
  }

  const handleUpdateStudent = (studentId, newName) => {
    if (!newName.trim()) {
      alert('학생 이름을 입력하세요.')
      return
    }

    const newData = updateStudent(data, selectedGrade, selectedClass, studentId, newName)
    onDataUpdate(newData)
    setEditingStudentId(null)
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
                          defaultValue={student.name}
                          onBlur={(e) => handleUpdateStudent(student.studentId, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateStudent(student.studentId, e.currentTarget.value)
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
                        <button 
                          onClick={() => setEditingStudentId(null)}
                          className="btn-save"
                        >
                          취소
                        </button>
                      ) : (
                        <button 
                          onClick={() => setEditingStudentId(student.studentId)}
                          className="btn-edit"
                        >
                          수정
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteStudent(student.studentId)}
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
