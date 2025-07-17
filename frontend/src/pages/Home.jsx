// src/pages/Home.jsx

import React, { useState } from 'react';
import { FaLightbulb, FaMobileAlt, FaChartLine, FaUtensils, FaHeartbeat, FaStethoscope, FaHandHoldingWater, FaComment, FaGlobeAsia } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
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
import ModalWrapper from '../components/components/ModalWrapper';
import Login from './Login';
import Register from './Register';
import Footer from "../components/components/Footer";
import Navbar from '../components/components/Navbar';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const openLogin = () => { setShowRegisterModal(false); setShowLoginModal(true); };
  const openRegister = () => { setShowLoginModal(false); setShowRegisterModal(true); };
  const closeModals = () => { setShowLoginModal(false); setShowRegisterModal(false); };

  const items = [
    { img: explore2, title: 'Perfect Avocado Toast', desc: 'A simple yet nutritious breakfast packed with healthy fats and protein', time: '10 min', cal: '320 cal' },
    { img: din, title: 'Mindful Eating Practice', desc: 'Learn how to eat slowly and pay attention to hunger cues for better digestion', author: 'Almanet' },
    { img: explore1, title: 'Green Smoothie Bowl', desc: 'Antioxidant-rich smoothie bowl with fresh berries and superfoods', time: '10 min', cal: '320 cal' },
    { img: explore3, title: 'The Rainbow Diet Guide', desc: 'Understanding how different colored foods provide unique nutritional benefits', time: '5 min read' },
    { img: explore4, title: 'Quinoa Power Salad', desc: 'Complete protein salad with fresh vegetables and tahini dressing', time: '10 min', cal: '320 cal' },
    { img: lunch, title: 'Pre-Workout Nutrition', desc: 'A simple yet nutritious breakfast packed with healthy fats and protein', time: '5 min', cal: '300 cal' },
  ];
  
  const featureVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };
  
  return (
    <div id="home" className="min-h-screen font-[var(--font-secondary)] text-[var(--color-text-default)] bg-[var(--color-bg-app)]">
      <Navbar
        logo={<img src={logo} alt="logo" className="h-10 w-30" />}
        align="right"
        links={[
          { label: "Home", to: "#home" }, { label: "About", to: "#about" }, { label: "Features", to: "#features" },
          { label: "Blogs", to: "#blogs" }, { label: "Contact", to: "#contact" },
        ]}
        rightContent={
          <button onClick={openRegister} className="ml-5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-on-primary)] font-semibold px-5 py-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-105">
            Sign In
          </button>
        }
      />

      {/* Hero Section */}
      <main className="w-full min-h-[85vh] overflow-y-auto bg-[var(--color-bg-app)] px-4 sm:px-8 py-12 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12 md:gap-20">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="flex-1 space-y-4 z-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-snug text-[var(--color-text-strong)]">
              Your <span className="text-[var(--color-primary)]">smart</span> companion for <span className="text-[var(--color-accent-2-text)]">everyday</span> healthy <span className="text-[var(--color-primary)]">eating</span>
            </h1>
            <p className="text-base sm:text-lg text-[var(--color-text-default)] leading-relaxed max-w-md">
              TrackEats is your nutrition buddy — log meals, track water, and reach health goals every day with joy.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <button onClick={openRegister} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-on-primary)] px-5 py-2.5 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                Get Started
              </button>
              <button onClick={openLogin} className="border-2 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-bg-subtle)] px-5 py-2.5 rounded-full font-semibold transition duration-300 hover:scale-105">
                Login
              </button>
            </div>
            <div className="flex space-x-8 mt-6 text-sm">
              <div className="hover:scale-105 transition-transform"><h4 className="text-xl font-bold text-[var(--color-accent-2-text)]">50K+</h4><p className="text-[var(--color-text-muted)]">Users</p></div>
              <div className="hover:scale-105 transition-transform"><h4 className="text-xl font-bold text-[var(--color-primary)]">4.9★</h4><p className="text-[var(--color-text-muted)]">Rating</p></div>
              <div className="hover:scale-105 transition-transform"><h4 className="text-xl font-bold text-[var(--color-accent-1-text)]">1M+</h4><p className="text-[var(--color-text-muted)]">Meals</p></div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 100 }} className="flex-1 relative z-10">
            <div className="bg-[var(--color-bg-surface)] p-4 rounded-3xl shadow-2xl transition-transform hover:scale-105 duration-300 max-w-sm mx-auto animate-float">
              <img src={elevated} alt="Healthy Meal" className="rounded-xl w-full" />
            </div>
          </motion.div>
        </div>
      </main>

      {/* Why Choose Section */}
      <section id="about" className="bg-[var(--color-bg-surface-alt)] py-16 px-4 text-center">
        <h2 className="text-4xl font-bold mb-6 text-[var(--color-text-strong)]">Why Choose <span className="text-[var(--color-primary)]">TrackEats</span>?</h2>
        <p className="text-[var(--color-text-default)] max-w-2xl mx-auto mb-12 text-base sm:text-lg">We’re revolutionizing nutrition tracking with smart technology that adapts to your lifestyle, making healthy eating effortless and enjoyable.</p>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={{ visible: { transition: { staggerChildren: 0.15 } } }} className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <motion.div variants={featureVariants} className="bg-[var(--color-bg-surface)] p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-[var(--color-border-default)]"><div className="flex justify-center mb-4"><FaLightbulb className="text-[var(--color-accent-2-text)] text-4xl" /></div><h3 className="font-semibold text-lg mb-2 text-[var(--color-text-strong)]">AI-Powered Insights</h3><p className="text-[var(--color-text-muted)] text-sm">Smart algorithms analyze your eating patterns and provide personalized recommendations.</p></motion.div>
          <motion.div variants={featureVariants} className="bg-[var(--color-bg-surface)] p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-[var(--color-border-default)]"><div className="flex justify-center mb-4"><FaMobileAlt className="text-[var(--color-primary)] text-4xl" /></div><h3 className="font-semibold text-lg mb-2 text-[var(--color-text-strong)]">Easy Tracking</h3><p className="text-[var(--color-text-muted)] text-sm">Log meals instantly with photo recognition and barcode scanning technology.</p></motion.div>
          <motion.div variants={featureVariants} className="bg-[var(--color-bg-surface)] p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-[var(--color-border-default)]"><div className="flex justify-center mb-4"><FaChartLine className="text-[var(--color-accent-1-text)] text-4xl" /></div><h3 className="font-semibold text-lg mb-2 text-[var(--color-text-strong)]">Progress Tracking</h3><p className="text-[var(--color-text-muted)] text-sm">Visualize your nutrition journey with detailed analytics and progress reports.</p></motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 md:px-20 bg-[var(--color-bg-app)]">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 text-[var(--color-text-strong)]">Powerful <span className="text-[var(--color-primary)]">Features</span></h2>
        <p className="text-center text-[var(--color-text-muted)] text-sm mb-10">Everything you need to maintain a healthy lifestyle</p>
        <div className="flex flex-col md:flex-row items-center justify-between gap-16">
          <div className="space-y-6 w-full md:w-1/2">
            <div className="flex items-start gap-4 group hover:scale-[1.02] transition-all duration-300"><FaUtensils className="text-[var(--color-text-on-primary)] text-4xl p-2 bg-[var(--color-success-text)] rounded-md shadow-lg group-hover:shadow-xl" /><div><h4 className="font-semibold text-lg text-[var(--color-text-strong)]">Smart Meal Logging</h4><p className="text-[var(--color-text-muted)] text-sm">Snap a photo and our AI instantly identifies food items and calculates nutrition values.</p></div></div>
            <div className="flex items-start gap-4 group hover:scale-[1.02] transition-all duration-300"><FaHeartbeat className="text-[var(--color-text-on-primary)] text-4xl p-2 bg-[var(--color-primary)] rounded-md shadow-lg mt-1 group-hover:shadow-xl" /><div><h4 className="font-semibold text-lg text-[var(--color-text-strong)]">Personalized Recommendations</h4><p className="text-[var(--color-text-muted)] text-sm">Get meal suggestions based on your dietary preferences and health goals.</p></div></div>
            <div className="flex items-start gap-4 group hover:scale-[1.02] transition-all duration-300"><FaStethoscope className="text-[var(--color-text-on-primary)] text-4xl p-2 bg-[var(--color-accent-1-text)] rounded-md shadow-lg mt-1 group-hover:shadow-xl" /><div><h4 className="font-semibold text-lg text-[var(--color-text-strong)]">Health Monitoring</h4><p className="text-[var(--color-text-muted)] text-sm">Track blood sugar, weight, and other vital health metrics in one place.</p></div></div>
          </div>
          <div className="w-full md:w-1/2"><img src={healthy} alt="Healthy Lifestyle" className="w-[450px] rounded-xl shadow-2xl transition-transform duration-300 hover:scale-105" /></div>
        </div>
      </section>

      {/* Tracker Section */}
      <section className="py-16 px-4 md:px-20 bg-[var(--color-bg-app)]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-16">
          <div className="w-full md:w-1/2"><img src={flat} alt="Tracking Visual" className="w-[450px] rounded-xl shadow-2xl transition-transform duration-300 hover:scale-105" /></div>
          <div className="space-y-6 w-full md:w-1/2">
            <div className="flex items-start gap-4 group hover:scale-[1.02] transition-all duration-300"><FaHandHoldingWater className="text-[var(--color-text-on-primary)] text-4xl p-2 bg-[var(--color-info-text)] rounded-md shadow-lg group-hover:shadow-xl" /><div><h4 className="font-semibold text-lg text-[var(--color-text-strong)]">Water Intake Tracker</h4><p className="text-[var(--color-text-muted)] text-sm">Stay hydrated by easily tracking water intake throughout your day.</p></div></div>
            <div className="flex items-start gap-4 group hover:scale-[1.02] transition-all duration-300"><FaGlobeAsia className="text-[var(--color-text-on-primary)] text-4xl p-2 bg-[var(--color-primary)] rounded-md shadow-lg mt-1 group-hover:shadow-xl" /><div><h4 className="font-semibold text-lg text-[var(--color-text-strong)]">Custom Goals</h4><p className="text-[var(--color-text-muted)] text-sm">Define your own daily goals tailored to your lifestyle and preferences.</p></div></div>
            <div className="flex items-start gap-4 group hover:scale-[1.02] transition-all duration-300"><FaComment className="text-[var(--color-text-on-primary)] text-4xl p-2 bg-[var(--color-accent-1-text)] rounded-md shadow-lg mt-1 group-hover:shadow-xl" /><div><h4 className="font-semibold text-lg text-[var(--color-text-strong)]">Community Support</h4><p className="text-[var(--color-text-muted)] text-sm">Join a growing community for tips, motivation, and healthy habits.</p></div></div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <div id="blogs" className="min-h-screen overflow-x-hidden bg-[var(--color-bg-surface-alt)] flex flex-col items-center px-4 sm:px-8 py-16 font-[var(--font-secondary)]">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-text-strong)] font-[var(--font-primary)] mb-12 text-center relative after:content-[''] after:block after:w-24 after:h-1 after:mx-auto after:mt-3 after:bg-[var(--color-primary)]">
          Explore <span className="text-[var(--color-primary)]">Our Picks</span>
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-6xl">
          {items.map((item, index) => (
            <div key={index} className="group bg-[var(--color-bg-surface)] rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden relative" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="absolute top-0 left-0 h-1.5 w-0 bg-[var(--color-primary)] transition-all duration-300 group-hover:w-full"></div>
              <img src={item.img} alt={item.title} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="p-5">
                <h2 className="text-lg font-semibold text-[var(--color-text-strong)] font-[var(--font-primary)] transition-colors duration-200 group-hover:text-[var(--color-primary)]">{item.title}</h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-2">{item.desc}</p>
                {item.author && <p className="text-sm text-[var(--color-text-subtle)] mt-2 italic">By {item.author}</p>}
                {(item.time || item.cal) && ( <div className="flex justify-between text-xs text-[var(--color-text-subtle)] mt-4"><span>{item.time}</span><span>{item.cal}</span></div>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="w-full bg-[var(--color-bg-app)] py-20 px-4 text-center flex flex-col items-center relative overflow-hidden">
        <div className="absolute top-[-40px] left-[-40px] w-36 h-36 bg-[var(--color-accent-1-bg-subtle)] rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-[-40px] right-[-40px] w-32 h-32 bg-[var(--color-primary-bg-subtle)] rounded-full blur-2xl animate-pulse-slow"></div>
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight text-[var(--color-text-strong)] z-10">Ready to Transform Your <br /><span className="text-[var(--color-success-text)]">Health Journey</span><span className="text-[var(--color-danger-text)]">?</span></h1>
        <p className="text-[var(--color-text-muted)] text-base md:text-lg mb-8 max-w-xl z-10">Join thousands of users who have already improved their nutrition and wellness with <strong className="text-[var(--color-primary)]">TrackEats</strong>.</p>
        <div className="flex gap-4 flex-wrap justify-center z-10">
          <button onClick={openRegister} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-text-on-primary)] font-semibold py-3 px-7 rounded-full shadow-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:brightness-110">
            Start Free Trial
          </button>
        </div>
        <ModalWrapper isOpen={showRegisterModal} onClose={closeModals}>
          <Register onClose={closeModals} onSwitchToLogin={openLogin} />
        </ModalWrapper>
        <ModalWrapper isOpen={showLoginModal} onClose={closeModals}>
          <Login onSwitchToRegister={openRegister} onClose={closeModals} />
        </ModalWrapper>
      </div>
      
      <div id="contact">
        <Footer />
      </div>
    </div>
  );
};

export default Home;