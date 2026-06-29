import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import './App.css'
import Navbar      from './components/Navbar'
import HeroSection from './components/HeroSection'
import { AuthPage } from './components/ui/animated-characters-login-page'

function Layout() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      <Navbar />
      <Outlet />
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HeroSection />} />
        </Route>
        <Route path="/login" element={<AuthPage mode="signin" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
      </Routes>
    </Router>
  )
}

export default App
