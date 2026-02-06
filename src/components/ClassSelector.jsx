import '../styles/ClassSelector.css'

export default function ClassSelector({ data, selectedGrade, onSelectClass, onBack, onHome }) {
  const grade = data.grades.find(g => g.gradeId === selectedGrade.gradeId)

  return (
    <div className="class-selector">
      <header className="header">
        <div className="header-top">
          <button className="back-button" onClick={onBack}>← 뒤로가기</button>
          <button className="home-button" onClick={onHome}>🏠 홈</button>
        </div>
        <div className="header-content">
          <h1>{selectedGrade.gradeName}</h1>
        </div>
      </header>

      <div className="classes-container">
        <h2>반을 선택하세요</h2>
        <div className="classes-list">
          {grade.classes.map(classItem => (
            <button
              key={classItem.classId}
              className="class-button"
              onClick={() => onSelectClass(classItem)}
            >
              <div className="class-info">
                <span className="class-name">{classItem.className}</span>
                <span className="teacher-name">{classItem.teacherName}</span>
                <span className="student-count">학생 수: {classItem.students.length}명</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
