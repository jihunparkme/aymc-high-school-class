import { useState } from 'react'
import '../styles/InputModal.css'

export default function InputModal({ student, modalType, currentContent, onClose, onSave }) {
  const [input, setInput] = useState(typeof currentContent === 'string' ? currentContent : '')


  const handleSubmit = () => {
    if (input.trim()) {
      onSave(input.trim())
    }
  }

  const title = modalType === 'prayer' ? '기도제목 입력' : '특이사항 입력'
  const placeholder = modalType === 'prayer' 
    ? '기도제목을 입력하세요...'
    : '특이사항을 입력하세요...'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <header className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </header>

        <div className="modal-body">
          <p className="student-name">{student.name}</p>


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
