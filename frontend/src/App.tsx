import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPageHeader from './components/shared/MainPageHeader';
import { AboutPage, DashboardPage } from './pages/Index';

function App() {
  return (
    <div>

    <BrowserRouter>

    <MainPageHeader/>

    <main className="container">
      <Routes>
        <Route path='/' element={<DashboardPage/>}></Route>
        <Route path='about' element={<AboutPage/>}></Route>
      </Routes>
    </main>

    </BrowserRouter>

    </div>
  );
}

export default App;