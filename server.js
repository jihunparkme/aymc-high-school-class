// This file is no longer used as we migrated to Supabase.
// Please use 'npm run dev' to start the client.

/*
import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001
const DATA_FILE = path.join(__dirname, 'data.json')

app.use(cors())
app.use(express.json())

// 데이터 파일 초기화 함수
const initializeDataFile = () => {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      data: {
        grades: []
      },
      dailyData: {}
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2))
  }
}

// 데이터 조회 API
app.get('/api/data', (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      initializeDataFile()
    }
    const fileContent = fs.readFileSync(DATA_FILE, 'utf8')
    const data = JSON.parse(fileContent)
    res.json(data)
  } catch (error) {
    console.error('Error reading data:', error)
    res.status(500).json({ error: 'Failed to read data' })
  }
})

// 데이터 저장 API
app.post('/api/data', (req, res) => {
  try {
    const { data, dailyData } = req.body
    const fileContent = {
      data,
      dailyData
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(fileContent, null, 2))
    res.json({ success: true })
  } catch (error) {
    console.error('Error saving data:', error)
    res.status(500).json({ error: 'Failed to save data' })
  }
})

initializeDataFile()

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
*/
