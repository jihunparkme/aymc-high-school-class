import '../styles/DataManagement.css'

export default function DataManagement({ data, dailyData }) {
  
  return (
    <div className="data-management">
      <div className="data-info">
        <h4>데이터 구조</h4>
        <div className="stats">
          <div className="stat">
            <span>학년</span>
            <strong>{data.grades.length}개</strong>
          </div>
          <div className="stat">
            <span>전체 반</span>
            <strong>
              {data.grades.reduce((sum, grade) => sum + grade.classes.length, 0)}개
            </strong>
          </div>
          <div className="stat">
            <span>전체 학생</span>
            <strong>
              {data.grades.reduce((sum, grade) => 
                sum + grade.classes.reduce((classSum, classItem) => 
                  classSum + classItem.students.length, 0), 0
              )}명
            </strong>
          </div>
          <div className="stat">
            <span>기도제목</span>
            <strong>
              {Object.keys(dailyData).reduce((sum, studentId) => {
                return sum + Object.keys(dailyData[studentId]).reduce((dateSum, date) => {
                  return dateSum + (dailyData[studentId][date].prayerRequests?.length || 0)
                }, 0)
              }, 0)}개
            </strong>
          </div>
        </div>
      </div>
    </div>
  )
}
