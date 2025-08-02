import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './features/auth/context/AuthContext';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute';
import Home from './pages/Home';
import Login from './features/auth/components/Login';
import Register from './features/auth/components/Register';
import ProfileVerification from './features/auth/components/ProfileVerification';
import VideoPlayer from './components/VideoPlayer';
import NotFound from './pages/NotFound';
import AnimatedLogo from './components/AnimatedLogo';
import About from './pages/About'
import NewHere from './pages/NewHere'
import Sermons from './pages/Sermons'
import InHimSermon from './pages/InHimSermon'
import Events from './pages/Events'
import Contact from './pages/Contact'
import { preloadCriticalImages } from './utils/imagePreloader';
import { monitorWebVitals } from './utils/performanceMonitor';

function App() {
  useEffect(() => {
    // Initialize image preloading
    preloadCriticalImages();
    
    // Initialize performance monitoring
    monitorWebVitals();
    
    // Log performance report after 5 seconds
    setTimeout(() => {
      const { PerformanceMonitor } = require('./utils/performanceMonitor');
      PerformanceMonitor.logPerformanceReport();
    }, 5000);
  }, []);

  return (
    <AuthProvider>
      <AnimatedLogo />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<ProfileVerification />} />
        <Route path="/about" element={<About />} />
        <Route path="/new-here" element={<NewHere />} />
        <Route path="/sermons" element={<Sermons />} />
        <Route path="/sermons/in-him" element={<InHimSermon />} />
        <Route path="/in-him" element={<InHimSermon />} />
        <Route path="/events" element={<Events />} />
        <Route path="/contact" element={<Contact />} />
        
        <Route path="/video/:id" element={
          <ProtectedRoute>
            <VideoPlayer />
          </ProtectedRoute>
        } />
        
        
        {/* Fallback Routes */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
