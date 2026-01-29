import './App.css'
import { Routes, Route } from 'react-router-dom'
import LoginPage from './components/Login.tsx'
import HomePage from './components/Home.tsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  )
}

export default App
