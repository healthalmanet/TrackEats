import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, Smartphone, BarChart3, Utensils, HeartPulse, Activity, HandHelping } from 'lucide-react'; // Better, more consistent icons
import offer from "../assets/lunch.png";
import elevated from "../assets/banner img.png";
import explore2 from "../assets/explore 2.png";
import din from "../assets/dinner.png";
import explore1 from "../assets/explore 1.png";
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

const Home = () => {
  const navigate = useNavigate();
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const openLogin = () => { setShowRegisterModal(false); setShowLoginModal(true); };
  const openRegister = () => { setShowLoginModal(false); setShowRegisterModal(true); };
  const closeModals = () => { setShowLoginModal(false); setShowRegisterModal(false); };

  const exploreItems = [
    { img: explore2, title: 'Perfect Avocado Toast', desc: 'A simple yet nutritious breakfast packed with healthy fats.', time: '10 min', cal: '320 cal' },
    { img: din, title: 'Mindful Eating Practice', desc: 'Learn to eat slowly and pay attention to hunger cues.', author: 'Almanet' },
    { img: explore1, title: 'Green Smoothie Bowl', desc: 'Antioxidant-rich bowl with fresh berries and superfoods.', time: '10 min', cal: '320 cal' },
    { img: explore3, title: 'The Rainbow Diet Guide', desc: 'How different colored foods provide unique benefits.', time: '5 min read' },
    { img: explore4, title: 'Quinoa Power Salad', desc: 'Complete protein salad with fresh vegetables and tahini.', time: '10 min', cal: '320 cal' },
    { img: lunch, title: 'Pre-Workout Nutrition', desc: 'Fuel your workout with these simple, effective snacks.', time: '5 min', cal: '300 cal' },
  ];

  return (
    <div id="home" className="min-h-screen bg-main font-['Poppins'] text-body">
      {/* Themed Navbar for the landing page */}
      <Navbar
        align="right"
        links={[
          { to: "#home", label: "Home" },
          { to: "#about", label: "About" },
          { to: "#features", label: "Features" },
          { to: "#blogs", label: "Blogs" },
          { to: "#contact", label: "Contact" },
        ]}
        rightContent={
          <button onClick={openRegister} className="ml-5 bg-primary hover:bg-primary-hover text-light font-semibold px-5 py-2.5 rounded-full shadow-soft transition-all duration-300 hover:scale-105">
            Sign In
          </button>
        }
      />

      {/* Hero Section */}
      <main className="w-full min-h-[85vh] bg-section px-4 sm:px-8 py-12 relative overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12 md:gap-20">
          <div className="flex-1 space-y-4 z-10 animate-fade-in-up">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-['Lora'] font-extrabold leading-snug text-heading">
              Your <span className="text-primary">smart</span> companion for <span className="text-primary">everyday</span> healthy eating
            </h1>
            <p className="text-base sm:text-lg text-body leading-relaxed max-w-md">
              TrackEats is your nutrition buddy — log meals, track water, and reach health goals every day with joy.
            </p>
            <div className="flex flex-wrap gap-4 mt-4">
              <button onClick={openRegister} className="bg-primary hover:bg-primary-hover text-light px-6 py-3 rounded-full font-semibold shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105">
                Get Started
              </button>
              <button onClick={openLogin} className="border border-primary text-primary hover:shadow-soft hover:scale-105 hover:bg-primary/10 px-6 py-3 rounded-full font-semibold transition duration-300">
                Login
              </button>
            </div>
            <div className="flex space-x-8 mt-6 text-sm">
              <div className="hover:scale-105 transition-transform"><h4 className="text-xl font-bold text-heading">50K+</h4><p className="text-body/80">Users</p></div>
              <div className="hover:scale-105 transition-transform"><h4 className="text-xl font-bold text-heading">4.9★</h4><p className="text-body/80">Rating</p></div>
              <div className="hover:scale-105 transition-transform"><h4 className="text-xl font-bold text-heading">1M+</h4><p className="text-body/80">Meals</p></div>
            </div>
          </div>
          <div className="flex-1 relative z-10">
            <div className="bg-section p-4 rounded-3xl shadow-lg transition-transform hover:scale-105 duration-300 max-w-sm mx-auto animate-float">
              <img src={elevated} alt="Healthy Meal" className="rounded-xl w-full" />
            </div>
          </div>
        </div>
      </main>
      
      {/* Why Choose TrackEats Section */}
      <section id="about" className="bg-main py-16 px-4 text-center">
        <h2 className="text-4xl font-['Lora'] font-bold mb-6 text-heading">Why Choose <span className="text-primary">TrackEats</span>?</h2>
        <p className="text-body max-w-2xl mx-auto mb-12 text-base sm:text-lg">We’re revolutionizing nutrition tracking with smart technology that adapts to your lifestyle, making healthy eating effortless and enjoyable.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-section p-6 rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105 border border-custom">
            <div className="flex justify-center mb-4"><div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center"><Lightbulb className="text-primary text-3xl" /></div></div>
            <h3 className="font-semibold text-lg mb-2 text-heading">AI-Powered Insights</h3><p className="text-body/80 text-sm">Smart algorithms analyze your eating patterns and provide personalized recommendations.</p>
          </div>
          <div className="bg-section p-6 rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105 border border-custom">
            <div className="flex justify-center mb-4"><div className="w-14 h-14 bg-accent-orange/10 rounded-full flex items-center justify-center"><Smartphone className="text-accent-orange text-3xl" /></div></div>
            <h3 className="font-semibold text-lg mb-2 text-heading">Easy Tracking</h3><p className="text-body/80 text-sm">Log meals instantly with our streamlined and intuitive interface.</p>
          </div>
          <div className="bg-section p-6 rounded-2xl shadow-soft hover:shadow-lg transition-all duration-300 hover:scale-105 border border-custom">
            <div className="flex justify-center mb-4"><div className="w-14 h-14 bg-accent-yellow/10 rounded-full flex items-center justify-center"><BarChart3 className="text-accent-yellow text-3xl" /></div></div>
            <h3 className="font-semibold text-lg mb-2 text-heading">Progress Tracking</h3><p className="text-body/80 text-sm">Visualize your nutrition journey with detailed analytics and progress reports.</p>
          </div>
        </div>
      </section>

      {/* Features Sections */}
      <section id="features" className="py-16 px-4 md:px-20 bg-section">
        <h2 className="text-3xl md:text-4xl font-['Lora'] font-bold text-center mb-2 text-heading">Powerful <span className="text-primary">Features</span></h2>
        <p className="text-center text-body text-lg mb-16">Everything you need to maintain a healthy lifestyle</p>
        <div className="flex flex-col md:flex-row items-center justify-between gap-16 mb-16">
          <div className="space-y-8 w-full md:w-1/2">
            <div className="flex items-start gap-4"><div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0"><Utensils className="text-primary text-2xl"/></div><div><h4 className="font-semibold text-lg text-heading">Smart Meal Logging</h4><p className="text-body/80 text-sm">Quickly log your meals with our extensive food database and intuitive search.</p></div></div>
            <div className="flex items-start gap-4"><div className="w-12 h-12 bg-accent-orange/10 rounded-lg flex items-center justify-center flex-shrink-0"><HeartPulse className="text-accent-orange text-2xl"/></div><div><h4 className="font-semibold text-lg text-heading">Personalized Recommendations</h4><p className="text-body/80 text-sm">Get meal suggestions based on your dietary preferences and health goals.</p></div></div>
            <div className="flex items-start gap-4"><div className="w-12 h-12 bg-accent-yellow/10 rounded-lg flex items-center justify-center flex-shrink-0"><Activity className="text-accent-yellow text-2xl"/></div><div><h4 className="font-semibold text-lg text-heading">Health Monitoring</h4><p className="text-body/80 text-sm">Track weight, water, and other vital health metrics in one place.</p></div></div>
          </div>
          <div className="w-full md:w-1/2"><img src={healthy} alt="Healthy Lifestyle" className="rounded-xl shadow-lg transition-transform duration-300 hover:scale-105"/></div>
        </div>
      </section>

      {/* Explore/Blogs Section */}
      <div id="blogs" className="min-h-screen bg-main flex flex-col items-center px-4 sm:px-8 py-16">
        <h1 className="text-3xl md:text-4xl font-['Lora'] font-bold text-heading mb-12 text-center relative after:content-[''] after:block after:w-24 after:h-1 after:mx-auto after:mt-3 after:bg-primary">Explore <span className="text-primary">Our Picks</span></h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-6xl">
          {exploreItems.map((item, index) => (
            <div key={index} className="group bg-section rounded-2xl shadow-soft hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 overflow-hidden relative border border-custom hover:border-primary">
              <img src={item.img} alt={item.title} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"/>
              <div className="p-5">
                <h2 className="text-lg font-semibold text-heading transition-colors duration-200 group-hover:text-primary">{item.title}</h2>
                <p className="text-sm text-body mt-2">{item.desc}</p>
                {item.author && (<p className="text-sm text-body/70 mt-2 italic">By {item.author}</p>)}
                {(item.time || item.cal) && (<div className="flex justify-between text-xs text-body/70 mt-4">{item.time && <span>{item.time}</span>}{item.cal && <span>{item.cal}</span>}</div>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="w-full bg-section py-20 px-4 text-center flex flex-col items-center">
        <h1 className="text-3xl md:text-5xl font-['Lora'] font-extrabold mb-4 leading-tight text-heading">Ready to Transform Your <br /><span className="text-primary">Health Journey</span>?</h1>
        <p className="text-body text-base md:text-lg mb-8 max-w-xl">Join thousands of users who have already improved their nutrition with <strong className="text-heading">TrackEats</strong>.</p>
        <div className="flex gap-4 flex-wrap justify-center">
          <button onClick={openRegister} className="bg-primary hover:bg-primary-hover text-light font-semibold py-3 px-7 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105">
            Start Your Journey
          </button>
        </div>
      </div>

      <ModalWrapper isOpen={showRegisterModal} onClose={closeModals}><Register onClose={closeModals} onSwitchToLogin={openLogin} /></ModalWrapper>
      <ModalWrapper isOpen={showLoginModal} onClose={closeModals}><Login onSwitchToRegister={openRegister} onClose={closeModals} /></ModalWrapper>
      
      <div id="contact"><Footer /></div>
    </div>
  );
};

export default Home;