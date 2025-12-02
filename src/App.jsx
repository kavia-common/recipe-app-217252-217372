// PUBLIC_INTERFACE
export default function App() {
  /** Main React application component rendering a visible homepage message. */
  const apiUrl = import.meta.env.VITE_API_URL || 'Not configured'
  return (
    <div style={{fontFamily:'system-ui, sans-serif', padding: 24}}>
      <h1>Recipe App Frontend running</h1>
      <p>Backend API URL: {apiUrl === 'Not configured' ? <em>placeholder - set VITE_API_URL in .env</em> : apiUrl}</p>
    </div>
  )
}
