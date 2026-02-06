import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = 3001
const DATA_FILE = path.join(__dirname, 'data.json')

// Middleware
app.use(cors())
app.use(express.json())

// Initialize data file if it doesn't exist
const initializeDataFile = () => {
  if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
      data: {
        grades: [
          {
            gradeId: 'g1',
            gradeName: '고1',
            classes: [
              {
                classId: 'c1',
                className: '1반',
                teacherName: '선생님',
                students: [
                  { studentId: 's1', name: '학생1' },
                  { studentId: 's2', name: '학생2' }
                ]
              }
            ]
          },
          {
            gradeId: 'g2',
            gradeName: '고2',
            classes: [
              {
                classId: 'c2',
                className: '1반',
                teacherName: '선생님',
                students: [
                  { studentId: 's3', name: '학생3' },
                  { studentId: 's4', name: '학생4' }
                ]
              }
            ]
          },
          {
            gradeId: 'g3',
            gradeName: '고3',
            classes: [
              {
                classId: 'c3',
                className: '1반',
                teacherName: '선생님',
                students: [
                  { studentId: 's5', name: '학생5' },
                  { studentId: 's6', name: '학생6' }
                ]
              }
            ]
          }
        ]
      },
      dailyData: {}
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2))
  }
}

// API Routes
app.get('/api/data', (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      initializeDataFile()
    }
    const fileData = fs.readFileSync(DATA_FILE, 'utf8')
    const data = JSON.parse(fileData)
    res.json(data)
  } catch (error) {
    console.error('Error reading data:', error)
    res.status(500).json({ error: 'Failed to read data' })
  }
})

app.post('/api/data', (req, res) => {
  try {
    const { data, dailyData } = req.body
    const fileData = {
      data,
      dailyData
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(fileData, null, 2))
    res.json({ success: true, message: 'Data saved successfully' })
  } catch (error) {
    console.error('Error saving data:', error)
    res.status(500).json({ error: 'Failed to save data' })
  }
})

// Export data as JSON
app.get('/api/export', (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      initializeDataFile()
    }
    const fileData = fs.readFileSync(DATA_FILE, 'utf8')
    const data = JSON.parse(fileData)
    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', 'attachment; filename="student-data.json"')
    res.send(JSON.stringify(data, null, 2))
  } catch (error) {
    console.error('Error exporting data:', error)
    res.status(500).json({ error: 'Failed to export data' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' })
})

// Initialize and start server
initializeDataFile()

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
  console.log(`Data file: ${DATA_FILE}`)
})
