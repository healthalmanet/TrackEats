// src/pages/Home.jsx

import React, { useState, useEffect } from 'react';
import { FaLightbulb, FaMobileAlt, FaChartLine, FaUtensils, FaHeartbeat, FaStethoscope, FaHandHoldingWater, FaComment, FaGlobeAsia, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion, useAnimation, useInView } from 'framer-motion';
import { useSpring, animated } from '@react-spring/web';

// Asset Imports
import elevated from "../assets/banner img.png";
import logo from "../assets/logo.png";
import din from "../assets/dinner.png";
import explore1 from "../assets/explore 1.png";
import explore2 from "../assets/explore 2.png";
import explore3 from "../assets/explore 3.png";
import explore4 from "../assets/explore4.png";
import lunch from "../assets/lunch.png";
import healthy from "../assets/healthy.jpg";
import flat from "../assets/flat.jpg";

// Component Imports
import ModalWrapper from '../components/components/ModalWrapper';
import Login from './Login';
import Register from './Register';
import Footer from "../components/components/Footer";
import Navbar from '../components/components/Navbar';

// Animated Number Component
const AnimatedNumber = ({ n, isFloat = false }) => {
    const { number } = useSpring({
        from: { number: 0 },
        number: n,
        delay: 300,
        config: { mass: 1, tension: 20, friction: 10 },
    });
    return <animated.span>{number.to((val) => isFloat ? val.toFixed(1) : Math.floor(val))}</animated.span>;
};

// Reusable Section Component for scroll-triggered animations
const AnimatedSection = ({ children, className }) => {
    const ref = React.useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });
    const controls = useAnimation();

    useEffect(() => {
        if (isInView) {
            controls.start("visible");
        }
    }, [isInView, controls]);

    return (
        <motion.div
            ref={ref}
            className={className}
            initial="hidden"
            animate={controls}
            variants={{
                visible: { transition: { staggerChildren: 0.2 } },
                hidden: {}
            }}
        >
            {children}
        </motion.div>
    );
};

const itemFadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 12 } },
};

const Home = () => {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const openLogin = () => { setShowRegisterModal(false); setShowLoginModal(true); };
  const openRegister = () => { setShowLoginModal(false); setShowRegisterModal(true); };
  const closeModals = () => { setShowLoginModal(false); setShowRegisterModal(false); };

  const blogItems = [
    { img: explore2, title: 'Perfect Avocado Toast', desc: 'A simple yet nutritious breakfast packed with healthy fats and protein.', time: '10 min', cal: '320 cal' },
    { img: din, title: 'Mindful Eating Practice', desc: 'Learn to eat slowly and pay attention to hunger cues for better digestion.', author: 'Almanet' },
    { img: explore1, title: 'Green Smoothie Bowl', desc: 'Antioxidant-rich smoothie bowl with fresh berries and superfoods.', time: '10 min', cal: '320 cal' },
    { img: explore3, title: 'The Rainbow Diet Guide', desc: 'Understand how different colored foods provide unique nutritional benefits.', time: '5 min read', cal: "Nutrition" },
    { img: explore4, title: 'Quinoa Power Salad', desc: 'Complete protein salad with fresh vegetables and a zesty tahini dressing.', time: '10 min', cal: '320 cal' },
    { img: lunch, title: 'Pre-Workout Nutrition', desc: 'Fuel your workout with this simple yet powerful pre-workout meal.', time: '5 min', cal: '300 cal' },
  ];
  
  const features = [
    { 
        img: healthy,
        points: [
            { icon: FaUtensils, title: "Smart Meal Logging", text: "Snap a photo, and our AI instantly identifies food items and calculates nutrition.", colorClass: "bg-[var(--color-success-text)]" },
            { icon: FaHeartbeat, title: "Personalized Recommendations", text: "Get meal suggestions based on your dietary preferences and health goals.", colorClass: "bg-[var(--color-primary)]" },
            { icon: FaStethoscope, title: "Health Monitoring", text: "Track blood sugar, weight, and other vital health metrics in one place.", colorClass: "bg-[var(--color-accent-1-text)]" }
        ],
        reverse: false
    },
    { 
        img: flat,
        points: [
            { icon: FaHandHoldingWater, title: "Water Intake Tracker", text: "Stay hydrated by easily tracking water intake throughout your day.", colorClass: "bg-[var(--color-info-text)]" },
            { icon: FaGlobeAsia, title: "Custom Goals", text: "Define your own daily goals tailored to your lifestyle and preferences.", colorClass: "bg-[var(--color-primary)]" },
            { icon: FaComment, title: "Community Support", text: "Join a growing community for tips, motivation, and sharing healthy habits.", colorClass: "bg-[var(--color-accent-2-text)]" }
        ],
        reverse: true
    }
  ];
  
  return (
    <div id="home" className="min-h-screen font-[var(--font-secondary)] text-[var(--color-text-default)] bg-[var(--color-bg-app)] overflow-x-hidden">
      <Navbar
        logo={<img src={logo} alt="logo" className="h-10 w-auto" />}
        align="right"
        links={[
          { label: "Home", to: "#home" }, { label: "About", to: "#about" }, { label: "Features", to: "#features" },
          { label: "Blogs", to: "#blogs" }, { label: "Contact", to: "#contact" },
        ]}
        rightContent={
          <button onClick={openRegister} className="ml-5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-on-primary)] font-semibold px-5 py-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-primary-glow">
            Sign In
          </button>
        }
      />

      {/* Hero Section */}
      <main className="w-full flex items-center min-h-[90vh] px-6 lg:px-8 py-20 lg:py-24 relative">
        <div className="absolute inset-0 opacity-40 blur-3xl">
            <div className="absolute top-0 -left-16 w-72 h-72 bg-[var(--color-primary-bg-subtle)] rounded-full mix-blend-multiply animate-pulse-slow"></div>
            <div className="absolute top-1/2 -right-16 w-72 h-72 bg-[var(--color-accent-2-bg-subtle)] rounded-full mix-blend-multiply animate-pulse-slow animation-delay-2000"></div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-16 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="flex-1 md:w-1/2 space-y-6 text-center md:text-left">
            <motion.h1 variants={itemFadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold !leading-tight text-[var(--color-text-strong)]">
              Your <span className="text-[var(--color-primary)]">smart</span> companion for <span className="text-[var(--color-accent-2-text)]">everyday</span> healthy <span className="text-[var(--color-primary)]">eating</span>
            </motion.h1>
            <motion.p variants={itemFadeUp} className="text-lg sm:text-xl text-[var(--color-text-default)] leading-relaxed max-w-lg mx-auto md:mx-0">
              TrackEats is your nutrition buddy — log meals, track water, and reach health goals every day with joy.
            </motion.p>
            <motion.div variants={itemFadeUp} className="flex flex-wrap gap-4 mt-8 justify-center md:justify-start">
              <button onClick={openRegister} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-on-primary)] px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover:shadow-primary-glow transition-all duration-300 hover:scale-105">
                Get Started
              </button>
              <button onClick={openLogin} className="border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-bg-subtle)] px-6 py-3 rounded-full font-semibold transition duration-300 hover:scale-105">
                Login
              </button>
            </motion.div>
            <motion.div variants={itemFadeUp} className="flex space-x-10 mt-12 justify-center md:justify-start text-center">
              <div className="hover:scale-110 transition-transform"><h4 className="text-2xl font-bold text-[var(--color-accent-2-text)]"><AnimatedNumber n={50} />K+</h4><p className="text-sm text-[var(--color-text-muted)]">Users</p></div>
              <div className="hover:scale-110 transition-transform"><h4 className="text-2xl font-bold text-[var(--color-primary)]"><AnimatedNumber n={4.9} isFloat={true} />★</h4><p className="text-sm text-[var(--color-text-muted)]">Rating</p></div>
              <div className="hover:scale-110 transition-transform"><h4 className="text-2xl font-bold text-[var(--color-accent-1-text)]"><AnimatedNumber n={1} />M+</h4><p className="text-sm text-[var(--color-text-muted)]">Meals Logged</p></div>
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 80, delay: 0.5 }} className="flex-1 md:w-1/2 relative z-10 mt-12 md:mt-0">
            <div className="relative max-w-md mx-auto animate-float">
              <div className="bg-[var(--color-bg-surface)] p-4 rounded-3xl shadow-2xl transition-transform hover:scale-105 duration-500">
                <img src={elevated} alt="Healthy Meal" className="rounded-2xl w-full h-auto" />
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Why Choose Section */}
      <section id="about" className="bg-[var(--color-bg-surface-alt)] py-20 lg:py-24 px-6 lg:px-8 text-center">
        <AnimatedSection className="max-w-7xl mx-auto">
            <motion.h2 variants={itemFadeUp} className="text-4xl md:text-5xl font-bold mb-6 text-[var(--color-text-strong)]">Why Choose <span className="text-[var(--color-primary)]">TrackEats</span>?</motion.h2>
            <motion.p variants={itemFadeUp} className="text-lg text-[var(--color-text-default)] max-w-3xl mx-auto mb-16">We’re revolutionizing nutrition tracking with smart technology that adapts to your lifestyle, making healthy eating effortless and enjoyable.</motion.p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                  { icon: FaLightbulb, color: "var(--color-accent-2-text)", title: "AI-Powered Insights", text: "Smart algorithms analyze your eating patterns and provide personalized recommendations." },
                  { icon: FaMobileAlt, color: "var(--color-primary)", title: "Easy Tracking", text: "Log meals instantly with photo recognition and barcode scanning technology." },
                  { icon: FaChartLine, color: "var(--color-accent-1-text)", title: "Progress Tracking", text: "Visualize your nutrition journey with detailed analytics and progress reports." }
              ].map((card, i) => (
                  <motion.div key={i} variants={itemFadeUp} className="group relative bg-[var(--color-bg-surface)] p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-400 hover:!scale-[1.03]">
                      <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
                      <div className="relative z-10">
                          <div className="flex justify-center mb-5 transition-transform duration-300 group-hover:scale-110"><card.icon style={{ color: card.color }} className="text-5xl" /></div>
                          <h3 className="font-semibold text-xl mb-3 text-[var(--color-text-strong)]">{card.title}</h3>
                          <p className="text-[var(--color-text-muted)]">{card.text}</p>
                      </div>
                  </motion.div>
              ))}
            </div>
        </AnimatedSection>
      </section>
      
      {/* MERGED: Powerful Features Section */}
// MERGED & FIXED: Powerful Features Section
<section id="features" className="bg-[var(--color-bg-app)] py-20 lg:py-24 px-6 lg:px-8 space-y-16">
  <AnimatedSection className="text-center">
      <motion.h2 variants={itemFadeUp} className="text-4xl md:text-5xl font-bold mb-4 text-[var(--color-text-strong)]">
          Powerful <span className="text-[var(--color-primary)]">Features</span>
      </motion.h2>
      <motion.p variants={itemFadeUp} className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
          Everything you need to maintain a healthy lifestyle
      </motion.p>
  </AnimatedSection>
  
  {features.map((feature, index) => (
      <AnimatedSection key={index} className="max-w-7xl mx-auto">
          <div className={`flex flex-col ${feature.reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 lg:gap-20`}>
              <motion.div variants={itemFadeUp} className="md:w-1/2 space-y-6">
                  {feature.points.map((point, pIndex) => {
                      const Icon = point.icon;
                      
                      return (
                          <div key={pIndex} className="group flex items-start gap-4 p-4 rounded-lg hover:bg-[var(--color-bg-surface)] transition-colors duration-300">
                              {/* 
                                  THE FIX IS HERE: 
                                  We move `point.colorClass` into the className string
                                  and remove the incorrect `style` attribute.
                              */}
                              <div className={`flex-shrink-0 mt-1 p-3 rounded-full shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${point.colorClass}`}>
                                  <Icon className="text-xl text-[var(--color-text-on-primary)]" />
                              </div>
                              <div>
                                  <h4 className="font-semibold text-lg text-[var(--color-text-strong)]">{point.title}</h4>
                                  <p className="text-[var(--color-text-muted)] mt-1">{point.text}</p>
                              </div>
                          </div>
                      );
                  })}
              </motion.div>
              <motion.div variants={itemFadeUp} className="md:w-1/2 group relative overflow-hidden rounded-2xl shadow-2xl">
                  <img src={feature.img} alt="Feature" className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute top-0 left-[-100%] h-full w-[50%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-700 ease-in-out group-hover:left-[150%]"></div>
              </motion.div>
          </div>
      </AnimatedSection>
  ))}
</section>

      {/* Blog Section */}
      <section id="blogs" className="bg-[var(--color-bg-surface-alt)] py-20 lg:py-24 px-6 lg:px-8">
        <AnimatedSection className="max-w-7xl mx-auto">
          <motion.div variants={itemFadeUp} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[var(--color-text-strong)] font-[var(--font-primary)] relative inline-block">
              Explore <span className="text-[var(--color-primary)]">Our Picks</span>
              <span className="block w-2/3 h-1 bg-[var(--color-primary)] mx-auto mt-3 rounded-full"></span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {blogItems.map((item, index) => (
              <motion.div key={index} variants={itemFadeUp} className="group bg-[var(--color-bg-surface)] rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden border border-[var(--color-border-subtle)] hover:border-[var(--color-primary-border)]">
                <div className="overflow-hidden relative">
                  <img src={item.img} alt={item.title} className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6 flex flex-col min-h-[230px]">
                  <h3 className="text-xl font-semibold text-[var(--color-text-strong)] font-[var(--font-primary)] transition-colors duration-200 group-hover:text-[var(--color-primary)] mb-2">{item.title}</h3>
                  <p className="text-[var(--color-text-muted)] mb-4 flex-grow">{item.desc}</p>
                  
                  <div className="mt-auto pt-4 border-t border-[var(--color-border-subtle)]">
                      {item.author ? (
                          <p className="text-sm text-[var(--color-text-subtle)] italic">By {item.author}</p>
                      ) : (
                          <div className="flex justify-between items-center text-xs text-[var(--color-text-subtle)]">
                              <span>{item.time}</span>
                              <div className="relative h-4 w-28 text-right overflow-hidden">
                                  <span className="absolute inset-0 transition-all duration-300 group-hover:opacity-0 group-hover:-translate-x-4">
                                      {item.cal}
                                  </span>
                                  <span className="absolute inset-0 flex items-center justify-end gap-1 opacity-0 transition-all duration-300 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0">
                                      Read More <FaArrowRight />
                                  </span>
                              </div>
                          </div>
                      )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* Final CTA Section */}
      <section className="w-full bg-[var(--color-bg-app)] py-24 lg:py-32 px-6 lg:px-8 text-center flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-br from-[var(--color-accent-1-bg-subtle)] to-transparent opacity-30 blur-3xl -translate-x-1/3"></div>
        <div className="absolute bottom-0 right-0 w-1/2 h-full bg-gradient-to-tl from-[var(--color-primary-bg-subtle)] to-transparent opacity-30 blur-3xl translate-x-1/3"></div>
        <div className="relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight text-[var(--color-text-strong)]">Ready to Transform Your <br /><span className="text-[var(--color-success-text)]">Health Journey</span><span className="text-[var(--color-danger-text)]">?</span></h2>
          <p className="text-lg text-[var(--color-text-muted)] mb-10 max-w-2xl mx-auto">Join thousands of users who have already improved their nutrition and wellness with <strong className="font-semibold text-[var(--color-primary)]">TrackEats</strong>.</p>
          <button 
             onClick={openRegister} 
             className="bg-[var(--color-primary)] text-[var(--color-text-on-primary)] font-semibold py-4 px-10 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-primary-glow"
          >
            Start Your Free Trial
          </button>
        </div>
        <ModalWrapper isOpen={showRegisterModal} onClose={closeModals}>
          <Register onClose={closeModals} onSwitchToLogin={openLogin} />
        </ModalWrapper>
        <ModalWrapper isOpen={showLoginModal} onClose={closeModals}>
          <Login onSwitchToRegister={openRegister} onClose={closeModals} />
        </ModalWrapper>
      </section>
      
      <div id="contact">
        <Footer />
      </div>
    </div>
  );
};

export default Home;
