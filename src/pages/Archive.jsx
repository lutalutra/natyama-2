import { Link } from 'react-router-dom'

export default function Archive() {
  return (
    <div className="simple-page">
      <h1>Natsumi Sugiyama / Archive</h1>
      <p>Installations, research, and project notes.</p>
      <p>
        <Link to="/">← back</Link>
      </p>
    </div>
  )
}
