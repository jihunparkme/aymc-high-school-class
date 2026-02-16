import { useState } from 'react'
import '../styles/AdminPanel.css'
import PrayerView from './PrayerView'
import NotesView from './NotesView'
import AttendanceManagement from './AttendanceManagement'
import ClassManagement from './ClassManagement'
import TeacherManagement from './TeacherManagement'
import StudentManagement from './StudentManagement'
import DataManagement from './DataManagement'

export default function AdminPanel({ 
  data, 
  setData, 
  dailyData, 
  setDailyData, 
  teacherDailyData, 
  setTeacherDailyData, 
  onBack, 
  onHome 
}) {
  const [activeTab, setActiveTab] = useState('attendance') // 기본 탭을 출결로 설정

  const handleDataUpdate = (newData) => {
    setData(newData)
  }

  const handleDailyDataUpdate = (newDailyData) => {
    setDailyData(newDailyData)
  }

  const handleTeacherDailyDataUpdate = (newTeacherDailyData) => {
    setTeacherDailyData(newTeacherDailyData)
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
          className={`tab-btn ${activeTab === 'teacher' ? 'active' : ''}`}
          onClick={() => setActiveTab('teacher')}
        >
          👨‍🏫 교사 관리
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
        {activeTab === 'attendance' && (
          <AttendanceManagement 
            data={data} 
            dailyData={dailyData} 
            teacherDailyData={teacherDailyData} 
          />
        )}
        {activeTab === 'prayer' && (
          <PrayerView 
            data={data} 
            dailyData={dailyData} 
            teacherDailyData={teacherDailyData} 
          />
        )}
        {activeTab === 'notes' && (
          <NotesView 
            data={data} 
            dailyData={dailyData} 
            teacherDailyData={teacherDailyData} 
          />
        )}
        {activeTab === 'class' && (
          <ClassManagement data={data} onDataUpdate={handleDataUpdate} />
        )}
        {activeTab === 'teacher' && (
          <TeacherManagement data={data} onDataUpdate={handleDataUpdate} />
        )}
        {activeTab === 'student' && (
          <StudentManagement data={data} onDataUpdate={handleDataUpdate} />
        )}
        {activeTab === 'data' && (
          <DataManagement 
            data={data} 
            dailyData={dailyData} 
            teacherDailyData={teacherDailyData}
            onDataUpdate={handleDataUpdate} 
            onDailyDataUpdate={handleDailyDataUpdate} 
            onTeacherDailyDataUpdate={handleTeacherDailyDataUpdate}
          />
        )}
      </div>
    </div>
  )
}
