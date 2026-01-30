// App.jsx
import { Outlet } from 'react-router-dom'
import { NavBar } from './components/shared/NavBar';

function App() {
  return (
    <div>
      <NavBar />
      <main>
        <Outlet /> 
      </main>
    </div>
  );
}

export default App;
