import { useState, useEffect } from 'react';

function App() {
  const [serverStatus, setServerStatus] = useState('Checking...');

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setServerStatus(data.message))
      .catch(() => setServerStatus('Server not connected'));
  }, []);

  return (
    <div className="app">
      <h1>Starting Point</h1>
      <p>Server Status: {serverStatus}</p>
    </div>
  );
}

export default App;
