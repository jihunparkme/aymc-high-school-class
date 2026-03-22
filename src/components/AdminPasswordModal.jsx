
import { useState, useEffect } from 'react'
import '../styles/AdminPasswordModal.css'

export default function AdminPasswordModal({ onSuccess, onClose }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isShaking, setIsShaking] = useState(false)
  const [isFirstOpen, setIsFirstOpen] = useState(true)
  const PASSWORD_LENGTH = 4

  const handlePasswordSubmit = () => {
    const adminKey = import.meta.env.VITE_ADMIN_KEY
    if (password === adminKey) {
      setError('')
      setPassword('')
      onSuccess()
    } else {
      setError('관리자 암호가 다릅니다')
      setPassword('')
      setIsShaking(true)
      setIsFirstOpen(false) // 암호 오류 시 애니메이션 비활성화
      setTimeout(() => setIsShaking(false), 600)
    }
  }

  // 4자리 입력 시 자동 제출
  useEffect(() => {
    if (password.length === PASSWORD_LENGTH) {
      // setTimeout으로 감싸서 setState 경고 방지
      setTimeout(() => {
        handlePasswordSubmit()
      }, 0)
    }
    // eslint-disable-next-line
  }, [password])

  const handleKeyDown = (e) => {
    // 엔터키는 무시 (자동 제출)
    e.preventDefault()
  }

  const handleNumberClick = (num) => {
    if (password.length < PASSWORD_LENGTH) {
      setPassword(password + num)
    }
  }



  const handleClose = () => {
    setPassword('')
    setError('')
    setIsFirstOpen(true) // 모달 닫을 때는 다시 true로
    onClose()
  }

  return (
    <div className="password-modal-overlay">
      <div className={`password-modal${isFirstOpen ? ' modal-animate' : ''}${isShaking ? ' shake' : ''}`}> 
        <button className="close-button" onClick={handleClose}>
          ✕
        </button>

        <div className="password-header">
          <h2>관리자 모드</h2>
          <p>암호를 입력하세요</p>
        </div>

        <div className="password-display">
          <div className="password-dots">
            {Array.from({ length: PASSWORD_LENGTH }).map((_, i) => (
              <div
                key={i}
                className={`dot ${i < password.length ? 'filled' : ''}`}
              />
            ))}
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>

        <div className="keypad">
          <div className="keypad-row">
            <button onClick={() => handleNumberClick('1')}>1</button>
            <button onClick={() => handleNumberClick('2')}>2</button>
            <button onClick={() => handleNumberClick('3')}>3</button>
          </div>
          <div className="keypad-row">
            <button onClick={() => handleNumberClick('4')}>4</button>
            <button onClick={() => handleNumberClick('5')}>5</button>
            <button onClick={() => handleNumberClick('6')}>6</button>
          </div>
          <div className="keypad-row">
            <button onClick={() => handleNumberClick('7')}>7</button>
            <button onClick={() => handleNumberClick('8')}>8</button>
            <button onClick={() => handleNumberClick('9')}>9</button>
          </div>
          <div className="keypad-row">
            <button onClick={() => handleNumberClick('0')} className="zero-button">0</button>
          </div>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9]/g, '').slice(0, PASSWORD_LENGTH)
            setPassword(val)
          }}
          onKeyDown={handleKeyDown}
          placeholder="암호"
          className="hidden-input"
          inputMode="numeric"
          autoFocus
        />
      </div>
    </div>
  )
}
