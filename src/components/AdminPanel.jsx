import { useState } from 'react'
import '../styles/AdminPanel.css'
import PrayerView from './PrayerView'
import NotesView from './NotesView'
import AttendanceManagement from './AttendanceManagement' // AttendanceManagement import
import ClassManagement from './ClassManagement'
import StudentManagement from './StudentManagement'
import DataManagement from './DataManagement'
import { saveToLocalStorage } from '../utils/dataManager'

export default function AdminPanel({ data, setData, dailyData, setDailyData, onBack, onHome }) {
  const [activeTab, setActiveTab] = useState('attendance') // 기본 탭을 출결로 설정

  const handleDataUpdate = (newData) => {
    setData(newData)
    saveToLocalStorage(newData, dailyData)
  }

  const handleDailyDataUpdate = (newDailyData) => {
    setDailyData(newDailyData)
    saveToLocalStorage(data, newDailyData)
  }

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <div className="header-top">
          <button className="back-button" onClick={onBack}>← 뒤로가기</button>
          <button className="home-button" onClick={onHome}>🏠 홈</button>
        </div>
        <div className="header-content">
          <h1>⚙️ 관리자 메뉴</h1>
        </div>
      </header>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          📊 출결 관리
        </button>
        <button
          className={`tab-btn ${activeTab === 'prayer' ? 'active' : ''}`}
          onClick={() => setActiveTab('prayer')}
        >
          📖 기도제목
        </button>
        <button
          className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          📝 특이사항
        </button>
        <button
          className={`tab-btn ${activeTab === 'class' ? 'active' : ''}`}
          onClick={() => setActiveTab('class')}
        >
          📚 반 관리
        </button>
        <button
          className={`tab-btn ${activeTab === 'student' ? 'active' : ''}`}
          onClick={() => setActiveTab('student')}
        >
          👤 학생 관리
        </button>
        <button
          className={`tab-btn ${activeTab === 'data' ? 'active' : ''}`}
          onClick={() => setActiveTab('data')}
        >
          💾 데이터 관리
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'attendance' && <AttendanceManagement data={data} dailyData={dailyData} />}
        {activeTab === 'prayer' && <PrayerView data={data} dailyData={dailyData} />}
        {activeTab === 'notes' && <NotesView data={data} dailyData={dailyData} />}
        {activeTab === 'class' && (
          <ClassManagement data={data} onDataUpdate={handleDataUpdate} />
        )}
        {activeTab === 'student' && (
          <StudentManagement data={data} onDataUpdate={handleDataUpdate} />
        )}
        {activeTab === 'data' && (
          <DataManagement data={data} dailyData={dailyData} onDataUpdate={handleDataUpdate} onDailyDataUpdate={handleDailyDataUpdate} />
        )}
      </div>
    </div>
  )
}
