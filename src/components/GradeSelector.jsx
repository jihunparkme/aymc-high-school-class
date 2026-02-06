import '../styles/GradeSelector.css'

export default function GradeSelector({ data, onSelectGrade, onAdminClick }) {
  return (
    <div className="grade-selector">
      <header className="header">
        <h1>진리로 예배하는 고등부</h1>
        <p className="today-date">
          {new Date().toISOString().split('T')[0]}
        </p>
      </header>

      <div className="grades-container">
        <h2>학년을 선택하세요.</h2>
        <div className="grades-grid">
          {data.grades.map(grade => (
            <button
              key={grade.gradeId}
              className="grade-button"
              onClick={() => onSelectGrade(grade)}
            >
              <span className="grade-name">{grade.gradeName}</span>
            </button>
          ))}
        </div>
      </div>

      <button className="admin-button" onClick={onAdminClick}>
        ⚙️ 관리자
      </button>
    </div>
  )
}
