import { Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage.jsx';


function App() {
  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />

    </Routes>
  );
}

export default App;