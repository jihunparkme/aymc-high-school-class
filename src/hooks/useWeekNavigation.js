import { useState } from 'react'
import { getNextWeek, getPreviousWeek, getTodayWeek, getWeekId, getWeekBoundaries } from '../utils/dataManager'

const formatDate = (d) => `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`

export default function useWeekNavigation() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const weekId = getWeekId(currentDate)
  const { start, end } = getWeekBoundaries(currentDate)
  const weekDateRange = `${formatDate(start)} ~ ${formatDate(end)}`

  const goToPrevWeek = () => setCurrentDate(getPreviousWeek(currentDate))
  const goToNextWeek = () => setCurrentDate(getNextWeek(currentDate))
  const goToThisWeek = () => setCurrentDate(getTodayWeek())

  return { weekId, weekDateRange, currentDate, goToPrevWeek, goToNextWeek, goToThisWeek }
}
