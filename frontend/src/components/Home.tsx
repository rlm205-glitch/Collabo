import { Link } from "react-router-dom"
import {useEffect, useState} from "react"
function HomePage() {
    const [backendMessage, setBackendMessage] = useState<string>("Loading...")

  useEffect(() => {
    fetch("http://127.0.0.1:8000/apicall/print_hello_world")
      .then(res => res.json())
      .then(data => setBackendMessage(data.message))
      .catch(() => setBackendMessage("Backend not reachable"))
  }, [])

  return (
    <div>
      <p>Home Page Yay!</p>
      <p>Backend says: {backendMessage}</p>
      <Link to="/login">Login Page</Link>
    </div>
  )
}

export default HomePage
