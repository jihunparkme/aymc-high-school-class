import { useState } from 'react'
import '../styles/AdminPasswordModal.css'

export default function AdminPasswordModal({ onSuccess, onClose }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isShaking, setIsShaking] = useState(false)

  const handlePasswordSubmit = () => {
    const adminKey = import.meta.env.VITE_ADMIN_KEY || process.env.ADMIN_KEY

    if (password === adminKey) {
      setError('')
      setPassword('')
      onSuccess()
    } else {
      setError('관리자 암호가 다릅니다')
      setPassword('')
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 600)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit()
    }
  }

  const handleNumberClick = (num) => {
    if (password.length < 6) {
      setPassword(password + num)
    }
  }

  const handleBackspace = () => {
    setPassword(password.slice(0, -1))
  }

  const handleClose = () => {
    setPassword('')
    setError('')
    onClose()
  }

  return (
    <div className="password-modal-overlay">
      <div className={`password-modal ${isShaking ? 'shake' : ''}`}>
        <button className="close-button" onClick={handleClose}>
          ✕
        </button>

        <div className="password-header">
          <h2>관리자 모드</h2>
          <p>암호를 입력하세요</p>
        </div>

        <div className="password-display">
          <div className="password-dots">
            {Array.from({ length: 4 }).map((_, i) => (
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
            <button onClick={() => handleNumberClick('0')} className="zero-button">
              0
            </button>
            <button onClick={handleBackspace} className="backspace-button">
              ⌫
            </button>
          </div>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value.slice(0, 6))}
          onKeyPress={handleKeyPress}
          placeholder="암호"
          className="hidden-input"
        />

        <button
          className="submit-button"
          onClick={handlePasswordSubmit}
          disabled={password.length === 0}
        >
          입장
        </button>
      </div>
    </div>
  )
}
