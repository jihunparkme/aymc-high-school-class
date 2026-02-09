import { useState } from 'react'
import '../styles/StudentManagement.css'
import { addStudent, removeStudent, updateStudent } from '../utils/dataManager'

export default function StudentManagement({ data, onDataUpdate }) {
  const [selectedGrade, setSelectedGrade] = useState(data.grades[0].gradeId)
  const [selectedClass, setSelectedClass] = useState(data.grades[0].classes[0].classId)
  const [newStudentName, setNewStudentName] = useState('')
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
      prayerRequests: [],
      notes: '',
      attendance: true
    }

    const newData = addStudent(data, selectedGrade, selectedClass, newStudent)
    onDataUpdate(newData)
    setNewStudentName('')
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
                  <th>기도제목</th>
                  <th>특이사항</th>
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
                    <td>{student.prayerRequests?.length || 0}개</td>
                    <td>{student.notes ? '✓' : '-'}</td>
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
