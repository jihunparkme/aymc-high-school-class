import { useState, useEffect } from 'react'
import '../styles/InputModal.css'

export default function InputModal({ student, modalType, currentContent, onClose, onSave }) {
  const [input, setInput] = useState('')

  useEffect(() => {
    if (modalType === 'notes' && typeof currentContent === 'string') {
      setInput(currentContent)
    }
  }, [modalType, currentContent])

  const handleSubmit = () => {
    if (input.trim()) {
      onSave(input.trim())
      setInput('')
    }
  }

  const title = modalType === 'prayer' ? '기도제목 추가' : '특이사항 입력'
  const placeholder = modalType === 'prayer' 
    ? '기도해주실 내용을 입력하세요...'
    : '특이사항을 입력하세요...'

  const prayerList = modalType === 'prayer' && Array.isArray(currentContent) && currentContent.length > 0 
    ? currentContent 
    : []

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </header>

        <div className="modal-body">
          <p className="student-name">{student.name}</p>
          
          {prayerList.length > 0 && (
            <div className="existing-items">
              <h4>기도제목 목록</h4>
              <ul>
                {prayerList.map((prayer, idx) => (
                  <li key={idx}>{prayer}</li>
                ))}
              </ul>
            </div>
          )}

          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={placeholder}
            rows="4"
            autoFocus
          />
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>취소</button>
          <button 
            className="btn-save" 
            onClick={handleSubmit}
            disabled={!input.trim()}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
