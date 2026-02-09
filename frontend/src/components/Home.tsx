import { Link } from "react-router-dom"

function HomePage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 p-8">
      <p>Home Page Yay!</p>
      <Link to="/login">
        Go to Login Page
      </Link>
    </div>
  )
}

export default HomePage
