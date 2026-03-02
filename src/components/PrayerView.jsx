import WeeklyListView from './WeeklyListView'

const extractPrayers = (weekData) => {
  if (weekData.prayerRequests && weekData.prayerRequests.length > 0) {
    return weekData.prayerRequests
  }
  return []
}

export default function PrayerView(props) {
  return (
    <WeeklyListView
      {...props}
      title="주간 기도제목"
      emptyMessage="이번 주 기도제목이 없습니다."
      countLabel="전체 기도제목"
      itemClassName="prayer-item"
      extractItems={extractPrayers}
    />
  )
}
