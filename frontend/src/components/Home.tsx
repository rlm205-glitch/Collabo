import { Link } from "react-router-dom"

function HomePage() {
  return (
    <div>
      <p>Home Page Yay!</p>
      <Link to="/login">Login Page</Link>
    </div>
  )
}

export default HomePage
