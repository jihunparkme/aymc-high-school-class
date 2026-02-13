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

  // 브라우저 히스토리 관리
  useEffect(() => {
    // 초기 상태를 히스토리에 저장 (replaceState 사용)
    window.history.replaceState({ appState: 'gradeSelect', selectedGrade: null, selectedClass: null }, '')

    const handlePopState = (event) => {
      if (event.state) {
        setAppState(event.state.appState)
        setSelectedGrade(event.state.selectedGrade)
        setSelectedClass(event.state.selectedClass)
      } else {
        // 상태가 없는 경우 초기 화면으로
        setAppState('gradeSelect')
        setSelectedGrade(null)
        setSelectedClass(null)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // 화면 전환 함수 (히스토리 추가)
  const navigateTo = (newState, grade = null, classItem = null) => {
    setAppState(newState)
    setSelectedGrade(grade)
    setSelectedClass(classItem)
    window.history.pushState({ appState: newState, selectedGrade: grade, selectedClass: classItem }, '')
  }

  // 뒤로가기 함수 (히스토리 뒤로가기)
  const goBack = () => {
    window.history.back()
  }

  // 홈으로 이동 함수 (히스토리 초기화 또는 홈으로 이동)
  const goHome = () => {
    // 홈으로 이동할 때는 히스토리를 쌓지 않고 초기 상태로 돌아가는 것이 좋을 수 있음
    // 하지만 여기서는 pushState로 홈 상태를 추가하여 히스토리를 유지
    navigateTo('gradeSelect', null, null)
  }

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
            navigateTo('classSelect', grade, null)
          }}
          onAdminClick={() => navigateTo('admin', null, null)}
        />
      )}

      {appState === 'classSelect' && (
        <ClassSelector
          data={data}
          selectedGrade={selectedGrade}
          onSelectClass={(classItem) => {
            navigateTo('studentList', selectedGrade, classItem)
          }}
          onBack={goBack}
          onHome={goHome}
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
          onBack={goBack}
          onHome={goHome}
        />
      )}

      {appState === 'admin' && (
        <AdminPanel
          data={data}
          setData={setData}
          dailyData={dailyData}
          setDailyData={setDailyData}
          onBack={goBack}
          onHome={goHome}
        />
      )}
      
      <ScrollToTopButton />
    </div>
  )
}

export default App
