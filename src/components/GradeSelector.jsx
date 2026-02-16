import '../styles/GradeSelector.css'

export default function GradeSelector({ data, onSelectGrade, onAdminClick, onTeacherClick }) {
  const getGradeIcon = (gradeId) => {
    switch(gradeId) {
      case '1': return '🌱';
      case '2': return '🌿';
      case '3': return '🌳';
      default: return '🏫';
    }
  }

  const getGradeDescription = (gradeId) => {
    switch(gradeId) {
      case '1': return '새로운 시작, 1학년';
      case '2': return '성장하는 믿음, 2학년';
      case '3': return '세상의 빛, 3학년';
      default: return '학생 관리';
    }
  }

  return (
    <div className="grade-selector">
      <div className="grade-content-wrapper">
        <header className="header">
          <div className="logo-area">
            <span className="logo-icon">⛪️</span>
          </div>
          <h1>진리로 예배하는<br/>고등부</h1>
          <div className="date-badge">
            {new Date().toLocaleDateString('ko-KR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric', 
              weekday: 'long' 
            })}
          </div>
        </header>

        <div className="grades-container">
          <p className="section-title">담당 학년을 선택해주세요</p>
          <div className="grades-list">
            {data.grades.map(grade => (
              <button
                key={grade.gradeId}
                className="grade-card"
                onClick={() => onSelectGrade(grade)}
              >
                <div className="grade-icon-wrapper">
                  {getGradeIcon(grade.gradeId)}
                </div>
                <div className="grade-info">
                  <span className="grade-name">{grade.gradeName}</span>
                  <span className="grade-desc">{getGradeDescription(grade.gradeId)}</span>
                </div>
                <div className="grade-arrow">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18L15 12L9 6" stroke="#C7C7CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </button>
            ))}
            
            {/* Teacher Button */}
            <button
              className="grade-card"
              onClick={onTeacherClick}
            >
              <div className="grade-icon-wrapper">
                👨‍🏫
              </div>
              <div className="grade-info">
                <span className="grade-name">교사</span>
                <span className="grade-desc">교사 출결 및 관리</span>
              </div>
              <div className="grade-arrow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18L15 12L9 6" stroke="#C7C7CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      <footer className="footer">
        <button className="admin-link" onClick={onAdminClick}>
          <span>관리자 모드</span>
        </button>
        <p className="copyright">© 2026 AYMC High School</p>
      </footer>
    </div>
  )
}
