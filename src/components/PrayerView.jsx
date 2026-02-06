import '../styles/PrayerView.css'

export default function PrayerView({ data, dailyData }) {
  const allPrayers = []

  data.grades.forEach(grade => {
    grade.classes.forEach(classItem => {
      classItem.students.forEach(student => {
        // dailyData에서 모든 날짜의 기도제목 수집
        if (dailyData[student.studentId]) {
          Object.entries(dailyData[student.studentId]).forEach(([date, dayData]) => {
            if (dayData.prayerRequests && dayData.prayerRequests.length > 0) {
              dayData.prayerRequests.forEach(prayer => {
                allPrayers.push({
                  gradeName: grade.gradeName,
                  className: classItem.className,
                  studentName: student.name,
                  prayer: prayer,
                  date: date
                })
              })
            }
          })
        }
      })
    })
  })

  return (
    <div className="prayer-view">
      <h2>전체 기도제목 ({allPrayers.length}개)</h2>
      
      {allPrayers.length === 0 ? (
        <p className="empty-message">기도제목이 없습니다.</p>
      ) : (
        <div className="prayers-list">
          {allPrayers.map((item, idx) => (
            <div key={idx} className="prayer-item">
              <div className="prayer-header">
                <span className="grade-class">{item.gradeName} {item.className}</span>
                <span className="student-name">{item.studentName}</span>
                <span className="prayer-date">{item.date}</span>
              </div>
              <p className="prayer-text">{item.prayer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
