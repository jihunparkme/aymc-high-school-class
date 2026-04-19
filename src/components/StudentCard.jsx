import '../styles/StudentCard.css'

export default function StudentCard({ 
  student, 
  dayData,
  onPrayerClick, 
  onNotesClick, 
  onAttendanceClick
}) {
  const handleAttendanceClick = () => {
    const nextAttendanceText = dayData?.attendance ? '결석' : '출석'

    if (!window.confirm(`'${student.name}'을 '${nextAttendanceText}'으로 변경할까요?`)) {
      return
    }

    onAttendanceClick()
  }

  return (
    <div className={`student-card ${dayData?.attendance ? '' : 'absent'}`}>
      <div className="student-header">
        <div className="student-info">
          <h3>{student.name}</h3>
          <span className="gender-emoji">
            {student.gender === '남' ? '🙋🏼‍♂️' : '🙋🏻‍♀️'}
          </span>
          {student.assignedText && (
            <span>
              {student.assignedText}
            </span>
          )}
        </div>
        <button
          className={`attendance-btn ${dayData?.attendance ? 'present' : 'absent'}`}
          onClick={handleAttendanceClick}
          title={dayData?.attendance ? '출석' : '부재'}
        >
          {dayData?.attendance ? '출석' : '결석'}
        </button>
      </div>

      <div className="student-actions">
        <button 
          className={`action-btn prayer-btn ${dayData?.prayerRequests?.length > 0 ? 'active' : ''}`}
          onClick={onPrayerClick}
        >
          📖 기도제목 {dayData?.prayerRequests?.length > 0 ? '✓' : ''}
        </button>
        <button 
          className={`action-btn notes-btn ${dayData?.notes ? 'active' : ''}`}
          onClick={onNotesClick}
        >
          📝 특이사항 {dayData?.notes ? '✓' : ''}
        </button>
      </div>

    </div>
  )
}
