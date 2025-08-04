import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { home, videoSrc1, outburst, worship2, word, pastor1 } from '../assets/images';
import { EventCard, EventCardData } from '../components/EventCard';
import { EventUploadForm } from '../components/EventUploadForm';
import TakeNextStepSection from '../components/TakeNextStepSection';
import Footer from "../components/Footer";
import OptimizedImage from '../components/OptimizedImage';
import { RESPONSIVE_SIZES } from '../config/imageConfig';
import { useAuth } from '../features/auth/context/AuthContext';

export default function Home() {
  const [bannerActive, setBannerActive] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const { user } = useAuth();
  const [events, setEvents] = useState<EventCardData[]>([
    {
      date: '2025-08-03',
      title: 'Thanksgiving Sunday',
      location: 'New Creature in Christ Church',
      image: worship2,
    },
    {
      date: '2025-08-29',
      title: 'Worship Concert (Outburst 4.0)',
      location: 'New Creature in Christ Church',
      image: outburst,
    },
    {
      date: '2025-12-25',
      title: 'Love Campaign (Outreach to the less privileged)',
      location: 'New Creature in Christ Church',
      image: '/events/back-to-school.jpg',
    },
  ]);

  useEffect(() => {
    function handleBannerEvent(e: Event) {
      const customEvent = e as CustomEvent<boolean>;
      setBannerActive(customEvent.detail === true);
    }
    window.addEventListener('maintenance-banner', handleBannerEvent as EventListener);
    return () => window.removeEventListener('maintenance-banner', handleBannerEvent as EventListener);
  }, []);

  const handleAddEvent = (newEvent: EventCardData) => {
    setEvents(prev => [...prev, newEvent]);
    setShowUploadForm(false);
  };

  const handleCancelUpload = () => {
    setShowUploadForm(false);
  };

  return (
    <>
      {bannerActive && (
        <div className="bg-yellow-400 text-black text-center py-2 px-4 text-sm font-semibold">
          🚧 We're currently performing maintenance. Some features may be temporarily unavailable.
        </div>
      )}
      
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-blue-900 to-purple-900 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-6 md:space-y-8 text-center lg:text-left">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight">
                Welcome to<br />
                <span className="text-yellow-400">New Creature</span><br />
                in Christ Church
              </h1>
              <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                A diverse, family-driven, community-focused, and life-giving church in Baruwa, Ipaja, Lagos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/new-here" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-4 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 text-center">
                  New Here?
                </Link>
                <Link to="/about" className="border-2 border-white hover:bg-white hover:text-yellow-500 text-white font-bold px-8 py-4 rounded-lg transition-all duration-200 hover:scale-105 text-center">
                  Learn More
                </Link>
              </div>
            </div>
            
            {/* Right: Image Carousel */}
            <div className="relative">
              <HeroCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement Section */}
      <section className="w-full bg-white pt-8 pb-0">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-zinc-900 leading-tight mb-6">
            Love God.<br />
            Love People.<br />
            Change the World.
          </h2>
        </div>
      </section>

      {/* Video Box Section */}
      <section className="w-full bg-white pb-12">
        <div className="max-w-7xl mx-auto flex justify-center px-2 md:px-6">
          <div className="w-full max-w-3xl flex flex-col items-center">
            <div className="w-full rounded-2xl overflow-hidden shadow-lg bg-black aspect-video flex items-center justify-center mx-auto">
              <video src={videoSrc1} autoPlay muted loop className="w-full h-full object-contain" />
            </div>
            <Link to="/get-involved" className="mt-6 bg-zinc-700 hover:bg-yellow-500 text-white font-bold px-6 py-3 rounded shadow text-base transition-all duration-200 hover:scale-105">
              Get Involved
            </Link>
          </div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="w-full bg-white py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          <div className="text-left space-y-8">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-black leading-tight text-center md:text-left">
              Who We Are
            </h2>
            <p className="text-base md:text-xl text-black leading-relaxed max-w-2xl mx-auto md:mx-0 text-center md:text-left">
              We want to see people love God, reconciling the world to Himself.
            </p>
            {/* Carousel Section */}
            {(() => {
              const slides = [
                {
                  heading: 'Watchword for 2025',
                  content: (
                    <>
                      <p className="text-xl md:text-2xl text-gray-700 italic leading-relaxed">
                        "I will bless the Lord at all times, His praise shall continually be in my mouth"
                      </p>
                      <p className="text-sm text-gray-600 font-semibold mt-2">Psalm 34:1</p>
                    </>
                  ),
                },
                {
                  heading: 'Year 2025',
                  content: (
                    <>
                      <p className="text-xl md:text-2xl text-gray-700 italic leading-relaxed">
                        2025 is <span className="font-bold text-blue-700">"Our Year of Divine Turn Around."</span>
                      </p>
                    </>
                  ),
                },
              ];

              const [slideIndex, setSlideIndex] = useState(0);
              const [slideDirection, setSlideDirection] = useState(0);
              const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

              const slideVariants = {
                enter: (direction: number) => ({
                  x: direction > 0 ? 1000 : -1000,
                  opacity: 0
                }),
                center: {
                  zIndex: 1,
                  x: 0,
                  opacity: 1
                },
                exit: (direction: number) => ({
                  zIndex: 0,
                  x: direction < 0 ? 1000 : -1000,
                  opacity: 0
                })
              };

              const goPrev = () => {
                setSlideDirection(-1);
                setSlideIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
              };

              const goNext = () => {
                setSlideDirection(1);
                setSlideIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
              };

              const resetTimeout = () => {
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current);
                }
              };

              React.useEffect(() => {
                resetTimeout();
                timeoutRef.current = setTimeout(() => {
                  goNext();
                }, 5000);

                return () => {
                  resetTimeout();
                };
              }, [slideIndex]);

              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
                  {/* Left: Text Carousel */}
                  <div className="relative h-64 md:h-80">
                    <AnimatePresence custom={slideDirection} initial={false} mode="wait">
                      <motion.div
                        key={slideIndex}
                        custom={slideDirection}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.5, type: 'tween' }}
                        className="absolute inset-0 flex flex-col justify-center"
                      >
                        <h3 className="text-2xl md:text-3xl font-bold text-black mb-4">
                          {slides[slideIndex].heading}
                        </h3>
                        <div className="text-gray-700">
                          {slides[slideIndex].content}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                    {/* Navigation Arrows */}
                    <div className="absolute bottom-0 left-0 flex gap-2">
                      <button onClick={goPrev} className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-2 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button onClick={goNext} className="bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full p-2 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {/* Right: Image */}
                  <div className="flex justify-center lg:justify-end">
                    <div className="w-full max-w-xs sm:max-w-md aspect-[4/5] rounded-2xl shadow-xl overflow-hidden">
                      <OptimizedImage
                        src={pastor1}
                        alt="Pastor preaching"
                        className="w-full h-full object-cover"
                        sizes={RESPONSIVE_SIZES.card}
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="w-full bg-gray-50 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          <div className="text-center space-y-8 mb-12">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-black leading-tight">
              Upcoming Events
            </h2>
            <p className="text-base md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Join us for our upcoming events and be part of our community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {events.map((event, index) => (
              <EventCard key={index} {...event} />
            ))}
          </div>
          <div className="text-center mt-12">
            {user?.role === 'admin' || user?.role === 'pastor' ? (
              <button
                onClick={() => setShowUploadForm(true)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold px-8 py-3 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 mr-4"
              >
                Add Event
              </button>
            ) : null}
            <Link to="/events" className="border-2 border-yellow-600 hover:bg-yellow-600 hover:text-white text-yellow-600 font-bold px-8 py-3 rounded-lg transition-all duration-200 hover:scale-105">
              View All Events
            </Link>
          </div>
        </div>
      </section>

      <TakeNextStepSection />
      
      {showUploadForm && (
        <EventUploadForm
          onSubmit={handleAddEvent}
          onCancel={handleCancelUpload}
        />
      )}
      
      <Footer />
    </>
  );
}

// Hero Carousel Component
function HeroCarousel() {
  const images = [home, word, pastor1];
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const goPrev = () => {
    setDirection(-1);
    setCarouselIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goNext = () => {
    setDirection(1);
    setCarouselIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  React.useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      goNext();
    }, 4000);

    return () => {
      resetTimeout();
    };
  }, [carouselIndex]);

  return (
    <div className="relative flex justify-center md:justify-end w-full">
      <div className="w-full max-w-xs sm:max-w-xl aspect-[16/9] rounded-3xl shadow-lg overflow-hidden relative">
        <AnimatePresence custom={direction} initial={false} mode="wait">
          <motion.div
            key={carouselIndex}
            custom={direction}
            initial={{ x: direction > 0 ? 1000 : -1000, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction < 0 ? 1000 : -1000, opacity: 0 }}
            transition={{ duration: 0.5, type: 'tween' }}
            className="absolute inset-0"
          >
            <OptimizedImage
              src={images[carouselIndex]}
              alt="Church gathering"
              className="w-full h-full object-cover"
              sizes={RESPONSIVE_SIZES.hero}
              priority={carouselIndex === 0}
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Navigation Arrows */}
        <div className="absolute flex gap-2 md:flex-col md:gap-3 right-2 bottom-2 md:top-1/2 md:bottom-auto md:right-4 md:-translate-y-1/2 z-10">
          <button onClick={goPrev} className="bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button onClick={goNext} className="bg-white/80 hover:bg-white text-gray-700 rounded-full p-2 shadow transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Carousel Indicators */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-3 flex gap-2 z-10">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
                idx === carouselIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 