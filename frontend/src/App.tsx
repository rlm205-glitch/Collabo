import './App.css'
import { Routes, Route } from 'react-router-dom'
import LoginPage from './components/Login.tsx'
import HomePage from './components/Home.tsx'
import CreateAccount from "./components/CreateAccount";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<CreateAccount />} />
    </Routes>
  )
}

export default App
