import { useRef } from 'react'
import '../styles/DataManagement.css'
import { exportToJSON, importFromJSON, saveToLocalStorage } from '../utils/dataManager'

export default function DataManagement({ data, dailyData, onDataUpdate, onDailyDataUpdate }) {
  const fileInputRef = useRef(null)

  const handleExport = () => {
    exportToJSON(data, dailyData)
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const importedData = await importFromJSON(file)
      if (confirm('데이터를 덮어쓰시겠습니까? 현재 데이터는 백업됩니다.')) {
        onDataUpdate(importedData.data || importedData)
        if (importedData.dailyData) {
          onDailyDataUpdate(importedData.dailyData)
        }
        saveToLocalStorage(importedData.data || importedData, importedData.dailyData || {})
        alert('데이터를 성공적으로 가져왔습니다.')
      }
    } catch (error) {
      alert('파일을 가져오는 중 오류가 발생했습니다: ' + error.message)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const backupInfo = (() => {
    const backupTime = new Date()
    return backupTime.toLocaleString('ko-KR')
  })()

  return (
    <div className="data-management">
      <div className="info-box">
        <h3>💾 데이터 관리</h3>
        <p>마지막 백업: {backupInfo}</p>
        <p className="info-text">
          • 모든 데이터는 1시간마다 자동으로 백업됩니다<br/>
          • 자정(00:00)마다 데이터가 새로 초기화됩니다<br/>
          • 언제든지 데이터를 다운로드하거나 업로드할 수 있습니다
        </p>
      </div>

      <div className="actions">
        <button onClick={handleExport} className="btn-download">
          📥 데이터 다운로드
        </button>
        <button onClick={handleImport} className="btn-upload">
          📤 데이터 업로드
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

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
