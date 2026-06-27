import { Link } from 'react-router-dom'

export default function Studio() {
  return (
    <div className="simple-page">
      <h1>natyama / Studio</h1>
      <p>Information Design · Editorial</p>
      <p>n@natyama.com</p>
      <p>
        <Link to="/">← back</Link>
      </p>
    </div>
  )
}
