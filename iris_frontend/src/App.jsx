import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import PipelineCards from './components/PipelineCards';
import StudioPage from './components/StudioPage';
import ReportModal from './components/ReportModal';
import IntroOverlay from './components/IntroOverlay';
import LoginPage from './components/LoginPage';
import FullCircleRetinaEye from './components/FullCircleRetinaEye';
import Footer from './components/Footer';
import { FUNDUS_PRESETS } from './assets/fundus-data';

export default function App() {
  const [showIntro, setShowIntro] = useState(true); // Shown BEFORE login only
  const [currentUser, setCurrentUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'studio'
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [activeReportData, setActiveReportData] = useState(null);
  const [selectedPreset, setSelectedPreset] = useState(FUNDUS_PRESETS[2]);

  // Load user from localStorage on mount & listen to hash changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem('iris_ai_user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse user session', e);
    }

    if (window.location.hash === '#studio') {
      setCurrentPage('studio');
    }

    const handleHashChange = () => {
      if (window.location.hash === '#studio') {
        setCurrentPage('studio');
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateToStudio = (preset = null) => {
    if (preset) setSelectedPreset(preset);
    setCurrentPage('studio');
    window.location.hash = 'studio';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    setCurrentPage('home');
    window.location.hash = 'home';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLaunchLiveDemo = () => {
    navigateToStudio();
  };

  const handleUploadClick = () => {
    navigateToStudio();
  };

  const handleExplorePipelineClick = () => {
    const el = document.getElementById('pipeline-cards');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Triggered when 3-step blur overlay finishes
  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  // Triggered when user enters credentials and verifies OTP 0000 -> lands on HOME page
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    setShowLoginModal(false);
    // After login, show the HOME page (not the live diagnostic page)
    navigateToHome();
  };

  const handleLogout = () => {
    localStorage.removeItem('iris_ai_user');
    setCurrentUser(null);
    navigateToHome();
  };

  const handleOpenReportModal = (reportPayload) => {
    setActiveReportData({
      ...reportPayload,
      doctorName: currentUser?.name || reportPayload.doctorName || 'Dr. Ananya Sharma, MD',
      doctorLocation: currentUser ? `${currentUser.district}, ${currentUser.state}` : reportPayload.phcLocation,
      patientName: currentUser?.patientName || reportPayload.patientName,
      patientId: currentUser?.patientId || reportPayload.patientId,
    });
    setReportModalOpen(true);
  };

  const handleCloseReportModal = () => {
    setReportModalOpen(false);
  };

  // If user is not logged in and intro is finished, or login is explicitly opened, render LoginPage
  const shouldRenderLoginPage = (!currentUser && !showIntro) || showLoginModal;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-900 relative overflow-x-hidden">
      
      {/* Background Full Circle Retina Eye (20% Width, 60-70% Opacity, Opens & Closes, NOT in blur window) */}
      <div className="fixed top-28 right-4 lg:right-12 z-0 pointer-events-none opacity-65 flex items-center justify-center">
        <FullCircleRetinaEye className="w-[20vw] min-w-[200px] max-w-[340px]" />
      </div>

      {/* 1. Interactive 3-Step Splash Blur Overlay (Shown BEFORE login only) */}
      {showIntro && (
        <IntroOverlay onComplete={handleIntroComplete} />
      )}

      {/* 2. Login Screen (Shown after blur windows if not logged in) */}
      {shouldRenderLoginPage && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-50">
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        </div>
      )}

      {/* 3. VIEW A: DEDICATED CLINICAL TRIAGE STUDIO PAGE (Separate Page when clicked) */}
      {currentPage === 'studio' ? (
        <StudioPage
          onBackToHome={navigateToHome}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenReportModal={handleOpenReportModal}
          selectedPreset={selectedPreset}
          onSelectPreset={setSelectedPreset}
        />
      ) : (
        /* 4. VIEW B: HOMEPAGE OVERVIEW & CLINICAL PIPELINE MODULES (Shown by default after login) */
        <>
          {/* Top Full-Width Clean Clinical Navigation Bar */}
          <div className="relative z-40">
            <Navbar 
              onLaunchDemo={handleLaunchLiveDemo}
              currentUser={currentUser}
              onLogout={handleLogout}
              onOpenLogin={() => setShowLoginModal(true)}
              onNavigateStudio={handleLaunchLiveDemo}
            />
          </div>

          {/* Main Content Area (Home Landing Page) */}
          <main className="flex-grow relative z-10">
            
            {/* Section A: High-Impact Clinical Hero Intro */}
            <HeroSection 
              onUploadClick={handleUploadClick}
              onExplorePipelineClick={handleExplorePipelineClick}
            />

            {/* Section B: The Core Sequential Pipeline Modules */}
            <PipelineCards 
              onSelectSandboxPreset={(preset) => {
                navigateToStudio(preset);
              }}
            />

          </main>

          {/* Section D: Clinical & Standards Compliant Footer */}
          <div className="relative z-10">
            <Footer />
          </div>
        </>
      )}

      {/* Modal: Official Clinical Tele-Ophthalmology Diagnostic Report */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={handleCloseReportModal}
        reportData={activeReportData}
      />

    </div>
  );
}
