import { useState, useMemo } from 'react'
import '../styles/DataManagement.css'
import { getWeekId } from '../utils/dataManager'

export default function DataManagement({ data, dailyData }) {
  const today = new Date()
  const [selectedYear, setSelectedYear] = useState(today.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1)
  const [selectedGradeId, setSelectedGradeId] = useState('all') // Default to 'all'

  // 연도 옵션 (현재 연도 기준 앞뒤 2년)
  const yearOptions = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i)
  // 월 옵션
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)

  // 연간 데이터 계산 (그래프용)
  const yearlyStats = useMemo(() => {
    if (!selectedGradeId) return []
    
    // Filter grades based on selection
    const targetGrades = selectedGradeId === 'all' 
      ? data.grades 
      : data.grades.filter(g => g.gradeId === selectedGradeId)

    if (targetGrades.length === 0) return []

    const stats = []

    for (let month = 1; month <= 12; month++) {
      // 해당 월의 주차 목록
      const weekIds = new Set()
      const firstDay = new Date(selectedYear, month - 1, 1)
      const lastDay = new Date(selectedYear, month, 0)
      
      for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
        weekIds.add(getWeekId(new Date(d)))
      }
      const weeks = Array.from(weekIds)

      let totalStudents = 0
      let presentCount = 0
      let weekCount = 0

      weeks.forEach(weekId => {
        let weekTotal = 0
        let weekPresent = 0
        
        targetGrades.forEach(grade => {
          grade.classes.forEach(classItem => {
            weekTotal += classItem.students.length
            classItem.students.forEach(student => {
              if (dailyData[student.studentId]?.[weekId]?.attendance) {
                weekPresent++
              }
            })
          })
        })

        if (weekTotal > 0) {
          totalStudents += weekTotal
          presentCount += weekPresent
          weekCount++
        }
      })

      // 월 평균 출석률
      const rate = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0
      stats.push({ month, rate: parseFloat(rate), hasData: weekCount > 0 })
    }
    return stats
  }, [selectedYear, selectedGradeId, data, dailyData])

  // 월별 주차 목록 생성
  const weeksInMonth = useMemo(() => {
    const weekIds = new Set()
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1)
    const lastDay = new Date(selectedYear, selectedMonth, 0)
    
    // 해당 월의 모든 날짜를 순회하며 주차 ID 수집
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      weekIds.add(getWeekId(new Date(d)))
    }
    
    // 문자열 정렬
    return Array.from(weekIds).sort()
  }, [selectedYear, selectedMonth])

  // 집계 데이터 계산
  const statistics = useMemo(() => {
    if (!selectedGradeId) return []

    const targetGrades = selectedGradeId === 'all' 
      ? data.grades 
      : data.grades.filter(g => g.gradeId === selectedGradeId)

    if (targetGrades.length === 0) return []

    return weeksInMonth.map(weekId => {
      let totalStudents = 0
      let presentCount = 0

      targetGrades.forEach(grade => {
        grade.classes.forEach(classItem => {
          totalStudents += classItem.students.length
          classItem.students.forEach(student => {
            if (dailyData[student.studentId]?.[weekId]?.attendance) {
              presentCount++
            }
          })
        })
      })

      return {
        weekId,
        total: totalStudents,
        present: presentCount,
        absent: totalStudents - presentCount,
        rate: totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0
      }
    })
  }, [selectedYear, selectedMonth, selectedGradeId, data, dailyData, weeksInMonth])

  // 차트 렌더링
  const renderChart = () => {
    const width = 600
    const height = 300
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Y축 눈금 (0, 20, 40, 60, 80, 100)
    const yTicks = [0, 20, 40, 60, 80, 100]

    // 데이터 포인트 좌표 계산
    const points = yearlyStats.map((stat, index) => {
      const x = padding + (index * (chartWidth / 11))
      const y = height - padding - (stat.rate / 100 * chartHeight)
      return { x, y, ...stat }
    })

    // SVG Path 생성
    const pathD = points.map((p, i) => 
      (i === 0 ? 'M' : 'L') + `${p.x},${p.y}`
    ).join(' ')

    return (
      <div className="chart-container">
        <svg viewBox={`0 0 ${width} ${height}`} className="attendance-chart">
          {/* Y축 그리드 라인 */}
          {yTicks.map(tick => {
            const y = height - padding - (tick / 100 * chartHeight)
            return (
              <g key={tick}>
                <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#e0e0e0" strokeDasharray="4" />
                <text x={padding - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#888">{tick}%</text>
              </g>
            )
          })}

          {/* X축 라벨 */}
          {points.map((p, i) => (
            <text key={i} x={p.x} y={height - padding + 20} textAnchor="middle" fontSize="12" fill="#666">
              {p.month}월
            </text>
          ))}

          {/* 그래프 라인 */}
          <path d={pathD} fill="none" stroke="#0071e3" strokeWidth="3" />

          {/* 데이터 포인트 */}
          {points.map((p, i) => (
            <g key={i} onClick={() => setSelectedMonth(p.month)} style={{ cursor: 'pointer' }}>
              <circle 
                cx={p.x} 
                cy={p.y} 
                r={selectedMonth === p.month ? 6 : 4} 
                fill={selectedMonth === p.month ? "#0071e3" : "white"} 
                stroke="#0071e3" 
                strokeWidth="2" 
              />
              {/* 툴팁 효과 (선택된 월만 값 표시) */}
              {selectedMonth === p.month && (
                <text x={p.x} y={p.y - 15} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0071e3">
                  {p.rate}%
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    )
  }

  return (
    <div className="data-management">
      <div className="data-info">
        <h4>데이터 구조</h4>
        <div className="stats-summary">
          <div className="stat-summary-item">
            <span>전체 반</span>
            <strong>
              {data.grades.reduce((sum, grade) => sum + grade.classes.length, 0)}개
            </strong>
          </div>
          <div className="stat-summary-item">
            <span>전체 학생</span>
            <strong>
              {data.grades.reduce((sum, grade) => 
                sum + grade.classes.reduce((classSum, classItem) => 
                  classSum + classItem.students.length, 0), 0
              )}명
            </strong>
          </div>
          <div className="stat-summary-item">
            <span>전체 교사</span>
            <strong>{data.teachers ? data.teachers.length : 0}명</strong>
          </div>
        </div>
      </div>

      <div className="attendance-stats-section">
        <h4>연간 출결 현황 ({selectedYear}년)</h4>
        
        <div className="filters">
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="filter-select"
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}년</option>
            ))}
          </select>

          <select 
            value={selectedGradeId} 
            onChange={(e) => setSelectedGradeId(e.target.value)}
            className="filter-select"
          >
            <option value="all">전체 학년</option>
            {data.grades.map(grade => (
              <option key={grade.gradeId} value={grade.gradeId}>{grade.gradeName}</option>
            ))}
          </select>
        </div>

        {renderChart()}

        <h4 style={{ marginTop: '30px' }}>{selectedMonth}월 상세 출결 집계</h4>
        
        <div className="filters">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="filter-select"
          >
            {monthOptions.map(month => (
              <option key={month} value={month}>{month}월</option>
            ))}
          </select>
        </div>

        <div className="stats-table-container">
          <table className="stats-table">
            <thead>
              <tr>
                <th>주차</th>
                <th>재적</th>
                <th>출석</th>
                <th>결석</th>
                <th>출석률</th>
              </tr>
            </thead>
            <tbody>
              {statistics.length > 0 ? (
                statistics.map(stat => (
                  <tr key={stat.weekId}>
                    <td>{stat.weekId}</td>
                    <td>{stat.total}명</td>
                    <td className="present-text">{stat.present}명</td>
                    <td className="absent-text">{stat.absent}명</td>
                    <td>{stat.rate}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-cell">데이터가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
