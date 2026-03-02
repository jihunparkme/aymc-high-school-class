import WeeklyListView from './WeeklyListView'

const extractNotes = (weekData) => {
  if (weekData.notes && weekData.notes.length > 0) {
    return [weekData.notes]
  }
  return []
}

export default function NotesView(props) {
  return (
    <WeeklyListView
      {...props}
      title="주간 특이사항"
      emptyMessage="이번 주 특이사항이 없습니다."
      countLabel="전체 특이사항"
      itemClassName="notes-item"
      extractItems={extractNotes}
    />
  )
}
