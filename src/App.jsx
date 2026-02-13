import { useState, useEffect } from 'react'
import './App.css'
import GradeSelector from './components/GradeSelector'
import ClassSelector from './components/ClassSelector'
import StudentList from './components/StudentList'
import AdminPanel from './components/AdminPanel'
import ScrollToTopButton from './components/ScrollToTopButton'
import { initializeData, initializeDailyData, saveToLocalStorage, loadFromLocalStorage, createDailyBackup } from './utils/dataManager'

function App() {
  const [appState, setAppState] = useState('gradeSelect')
  const [data, setData] = useState(null)
  const [dailyData, setDailyData] = useState({})
  const [selectedGrade, setSelectedGrade] = useState(null)
  const [selectedClass, setSelectedClass] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const loaded = await loadFromLocalStorage()
        setData(loaded.data || initializeData())
        setDailyData(loaded.dailyData || initializeDailyData())
      } catch (error) {
        console.error('Failed to load data:', error)
        setData(initializeData())
        setDailyData(initializeDailyData())
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // 데이터 변경 시 저장
  useEffect(() => {
    if (data && !isLoading) {
      saveToLocalStorage(data, dailyData)
    }
  }, [data, dailyData, isLoading])

  // 1시간마다 자동 백업
  useEffect(() => {
    if (!data || isLoading) return
    
    const backupInterval = setInterval(() => {
      saveToLocalStorage(data, dailyData)
    }, 60 * 60 * 1000)

    return () => clearInterval(backupInterval)
  }, [data, dailyData, isLoading])

  // 자정마다 백업 (데이터 초기화는 하지 않음 - 과거 데이터 보존)
  useEffect(() => {
    if (!data || isLoading) return

    const checkMidnight = () => {
      const now = new Date()
      const nextMidnight = new Date(now)
      nextMidnight.setHours(24, 0, 0, 0)
      const timeUntilMidnight = nextMidnight - now

      const midnightTimer = setTimeout(() => {
        // 자정이 되면 현재 상태를 백업
        createDailyBackup(data, dailyData)
        // 다음 자정 체크
        checkMidnight()
      }, timeUntilMidnight)

      return () => clearTimeout(midnightTimer)
    }

    return checkMidnight()
  }, [data, dailyData, isLoading])


  if (isLoading || !data) return <div className="loading">로딩중...</div>

  return (
    <div className="app">
      {appState === 'gradeSelect' && (
        <GradeSelector
          data={data}
          onSelectGrade={(grade) => {
            setSelectedGrade(grade)
            setAppState('classSelect')
          }}
          onAdminClick={() => setAppState('admin')}
        />
      )}

      {appState === 'classSelect' && (
        <ClassSelector
          data={data}
          selectedGrade={selectedGrade}
          onSelectClass={(classItem) => {
            setSelectedClass(classItem)
            setAppState('studentList')
          }}
          onBack={() => {
            setSelectedGrade(null)
            setAppState('gradeSelect')
          }}
          onHome={() => {
            setSelectedGrade(null)
            setAppState('gradeSelect')
          }}
        />
      )}

      {appState === 'studentList' && (
        <StudentList
          data={data}
          setData={setData}
          dailyData={dailyData}
          setDailyData={setDailyData}
          selectedGrade={selectedGrade}
          selectedClass={selectedClass}
          onBack={() => {
            setSelectedClass(null)
            setAppState('classSelect')
          }}
          onHome={() => {
            setSelectedClass(null)
            setSelectedGrade(null)
            setAppState('gradeSelect')
          }}
        />
      )}

      {appState === 'admin' && (
        <AdminPanel
          data={data}
          setData={setData}
          dailyData={dailyData}
          setDailyData={setDailyData}
          onBack={() => setAppState('gradeSelect')}
          onHome={() => setAppState('gradeSelect')}
        />
      )}
      
      <ScrollToTopButton />
    </div>
  )
}

export default App
