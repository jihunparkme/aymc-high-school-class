const DEFAULT_WEEK_DATA = () => ({
  prayerRequests: '',
  notes: '',
  attendance: false
})

/**
 * Creates a deep clone of dailyData with the target id+weekId
 * initialized to defaults if missing, then applies the updater.
 * Returns the new data object.
 */
export function applyOptimisticUpdate(dailyData, id, weekId, updater) {
  const newData = structuredClone(dailyData)
  if (!newData[id]) {
    newData[id] = {}
  }
  if (!newData[id][weekId]) {
    newData[id][weekId] = DEFAULT_WEEK_DATA()
  }
  updater(newData[id][weekId])
  return newData
}