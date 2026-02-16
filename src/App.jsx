import { useState, useEffect } from 'react'
import './App.css'
import GradeSelector from './components/GradeSelector'
import ClassSelector from './components/ClassSelector'
import StudentList from './components/StudentList'
import TeacherList from './components/TeacherList' // Import TeacherList
import AdminPanel from './components/AdminPanel'
import ScrollToTopButton from './components/ScrollToTopButton'
import { loadFromSupabase } from './utils/dataManager'

function App() {
  const [appState, setAppState] = useState('gradeSelect')
  const [data, setData] = useState(null)
  const [dailyData, setDailyData] = useState({})
  const [teacherDailyData, setTeacherDailyData] = useState({}) // Add teacherDailyData state
  const [selectedGrade, setSelectedGrade] = useState(null)
  const [selectedClass, setSelectedClass] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const loaded = await loadFromSupabase()
        setData(loaded.data)
        setDailyData(loaded.dailyData)
        setTeacherDailyData(loaded.teacherDailyData || {}) // Set teacherDailyData
      } catch (error) {
        console.error('Failed to load data:', error)
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
          onTeacherClick={() => navigateTo('teacherList', null, null)} // Add onTeacherClick
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

      {appState === 'teacherList' && ( // Add TeacherList route
        <TeacherList
          data={data}
          teacherDailyData={teacherDailyData}
          setTeacherDailyData={setTeacherDailyData}
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
