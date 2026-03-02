import { useState } from 'react'
import { getNextWeek, getPreviousWeek, getTodayWeek, getWeekId } from '../utils/dataManager'

export default function useWeekNavigation() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const weekId = getWeekId(currentDate)

  const goToPrevWeek = () => setCurrentDate(getPreviousWeek(currentDate))
  const goToNextWeek = () => setCurrentDate(getNextWeek(currentDate))
  const goToThisWeek = () => setCurrentDate(getTodayWeek())

  return { weekId, currentDate, goToPrevWeek, goToNextWeek, goToThisWeek }
}
