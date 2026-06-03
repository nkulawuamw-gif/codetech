import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import { NotificationsProvider } from './context/NotificationsContext'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Services from './pages/Services'
import Domains from './pages/Domains'
import Hosting from './pages/Hosting'
import Demos from './pages/Demos'
import DemoRequest from './pages/DemoRequest'
import Contact from './pages/Contact'
import About from './pages/About'
import Notifications from './pages/Notifications'
import Cart from './pages/Cart'
import AdminLogin from './pages/AdminLogin'
import Admin from './pages/Admin'
import './styles/App.css'

function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <CartProvider>
          <div className="app-bg">
            <div className="grid-pattern" />
          </div>
          <ScrollToTop />
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/domains" element={<Domains />} />
              <Route path="/hosting" element={<Hosting />} />
              <Route path="/demos" element={<Demos />} />
              <Route path="/demos/request/:id" element={<DemoRequest />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          <Footer />
        </CartProvider>
      </NotificationsProvider>
    </AuthProvider>
  )
}

export default App
