import React, { useState } from 'react';
import { FaLightbulb, FaMobileAlt, FaChartLine, FaFacebook, FaUtensils, FaHeartbeat, FaStethoscope, FaWater, FaWaveSquare, FaHandHoldingWater, FaComment, FaGlobeAsia, FaTwitter, FaInstagram, FaRegMoneyBillAlt, FaStackpath, FaStar } from 'react-icons/fa';
import { useNavigate, } from 'react-router-dom';
import offer  from "../assets/lunch.png";
import elevated  from "../assets/banner img.png";
import banner  from "../assets/explore 1.png";
import logo from "../assets/logo.png";
import explore2 from "../assets/explore 2.png"
import din from "../assets/dinner.png"
import explore1 from "../assets/explore 1.png"
import explore3 from "../assets/explore 3.png"
import explore4 from "../assets/explore4.png"
import lunch from "../assets/lunch.png"
import ModalWrapper from '../components/components/ModalWrapper';
import Login from './Login';
import Register from './Register';
import healthy from "../assets/healthy.jpg"
import flat from "../assets/flat.jpg"
import Footer from "../components/components/Footer"
import Navbar from '../components/components/Navbar';

const Home = () => {
   const navigate = useNavigate();
   const [showRegisterModal, setShowRegisterModal] = useState(false);
   const [showLoginModal, setShowLoginModal] = useState(false);

   const openLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };
  const openRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };
  const closeModals = () => {
    setShowLoginModal(false);
    setShowRegisterModal(false);
  };
  const [isOpen, setIsOpen] = useState(false);

// explore contain hai yaha se
    const items = [
    {
      img: explore2,
      title: 'Perfect Avocado Toast',
      desc: 'A simple yet nutritious breakfast packed with healthy fats and protein',
      time: '10 min',
      cal: '320 cal',
    },
    {
      img: din,
      title: 'Mindful Eating Practice',
      desc: 'Learn how to eat slowly and pay attention to hunger cues for better digestion',
      author: 'Almanet',
    },
    {
      img: explore1,
      title: 'Green Smoothie Bowl',
      desc: 'Antioxidant-rich smoothie bowl with fresh berries and superfoods',
      time: '10 min',
      cal: '320 cal',
    },
    {
      img: explore3,
      title: 'The Rainbow Diet Guide',
      desc: 'Understanding how different colored foods provide unique nutritional benefits',
      time: '5 min read',
    },
    {
      img: explore4,
      title: 'Quinoa Power Salad',
      desc: 'Complete protein salad with fresh vegetables and tahini dressing',
      time: '10 min',
      cal: '320 cal',
    },
    {
      img: lunch,
      title: 'Pre-Workout Nutrition',
      desc: 'A simple yet nutritious breakfast packed with healthy fats and protein',
      time: '5 min',
      cal: '300 cal',
    },
  ];

{/* -----------------------------------------start Home page -------------------------------------------------------- */}
 
return (
  
    <div id="home" className="min-h-screen bg-gradient-to-br from-white to-[#f4fbf8] font-sans text-gray-800">
  <div className="relative z-0"></div>
      {/* Header Section */}
{!showRegisterModal && !showLoginModal && (
     <Navbar
  logo={<img src={logo} alt="logo" className="h-10 w-30" />}
  align="right"   // <- Add this line
  links={[
    { label: "Home", to: "#home" },
     { label: "About", to: "#about" },
    { label: "Features", to: "#features" },
     { label: "Blogs", to: "#blogs" },
    { label: "Contact", to: "#contact" },
  ]}

  rightContent={
    <button
      onClick={openRegister}
      className="ml-5 bg-[#FF6B3D] hover:bg-[#f45a26] hover:shadow-lg text-white font-semibold px-5 py-2.5 rounded-full shadow-sm transition-all duration-300 hover:scale-105"
    >
      Sign In
    </button>
  }
  
/> 
)}
  
      {/* ---------------------------imran---------------------------------------- */}

      {/* Main Content Section hai  */}
     {/* Hero Section */}
  <main className="w-full min-h-[85vh] overflow-y-auto bg-white px-4 sm:px-8 py-12 font-['Poppins'] relative overflow-hidden">
    <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-12 md:gap-20">
      
      {/* Left Content */}
      <div className="flex-1 space-y-4 z-10 animate-fade-in-up">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-snug text-[#263238]">
          Your <span className="text-[#FF7043]">smart</span> companion for <span className="text-[#5ED8D1]">everyday</span> healthy <span className="text-[#FF7043]">eating</span>
        </h1>

        <p className="text-base sm:text-lg text-[#4A4A4A] leading-relaxed max-w-md">
          TrackEats is your nutrition buddy — log meals, track water, and reach health goals every day with joy.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 mt-4">
          <button
            onClick={openRegister}
            className="bg-[#FF6B3D] hover:bg-[#e85c2a] hover:shadow-lg text-white px-5 py-2.5 rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            Get Started
          </button>
          <button
            onClick={openLogin}
            className="border border-[#FF6B3D] text-[#FF6B3D] hover:shadow-lg hover:scale-105 hover:bg-[#FFF1EB] px-5 py-2.5 rounded-full font-semibold transition duration-300"
          >
            Login
          </button>
        </div>

        {/* Stats */}
        <div className="flex space-x-8 mt-6 text-sm">
          <div className="hover:scale-105 transition-transform">
            <h4 className="text-xl font-bold text-[#5ED8D1]">50K+</h4>
            <p className="text-[#777]">Users</p>
          </div>
          <div className="hover:scale-105 transition-transform">
            <h4 className="text-xl font-bold text-[#FF6B3D]">4.9★</h4>
            <p className="text-[#777]">Rating</p>
          </div>
          <div className="hover:scale-105 transition-transform">
            <h4 className="text-xl font-bold text-[#FFD93D]">1M+</h4>
            <p className="text-[#777]">Meals</p>
          </div>
        </div>
      </div>

      {/* Right Image */}
      <div className="flex-1 relative z-10">
        <div className="bg-white p-4 rounded-3xl shadow-lg transition-transform hover:scale-105 duration-300 max-w-sm mx-auto animate-float">
          <img src={elevated} alt="Healthy Meal" className="rounded-xl w-full" />
        </div>
      </div>
    </div>
  </main>



    {/* new aera hai why choose tracking  */}

  
    <section
  id="about"
  className="bg-[#FFF8F0] py-16 px-4 text-center font-['Poppins']"
>
  <h2 className="text-4xl font-bold mb-6 text-[#263238]">
    Why Choose <span className="text-[#FF7043]">TrackEats</span>?
  </h2>

  <p className="text-[#4A4A4A] max-w-2xl mx-auto mb-12 text-base sm:text-lg">
    We’re revolutionizing nutrition tracking with smart technology that adapts to your lifestyle, making healthy eating effortless and enjoyable.
  </p>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
    {/* Card 1 */}
    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border border-[#E0F2F1]">
      <div className="flex justify-center mb-4">
        <FaLightbulb className="text-[#5ED8D1] text-4xl" />
      </div>
      <h3 className="font-semibold text-lg mb-2 text-[#263238]">
        AI-Powered Insights
      </h3>
      <p className="text-[#607D8B] text-sm">
        Smart algorithms analyze your eating patterns and provide personalized recommendations.
      </p>
    </div>

    {/* Card 2 */}
    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border border-[#FFD9C0]">
      <div className="flex justify-center mb-4">
        <FaMobileAlt className="text-[#FF7043] text-4xl" />
      </div>
      <h3 className="font-semibold text-lg mb-2 text-[#263238]">
        Easy Tracking
      </h3>
      <p className="text-[#607D8B] text-sm">
        Log meals instantly with photo recognition and barcode scanning technology.
      </p>
    </div>

    {/* Card 3 */}
    <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 border border-[#FFF3CD]">
      <div className="flex justify-center mb-4">
        <FaChartLine className="text-[#FFD93D] text-4xl" />
      </div>
      <h3 className="font-semibold text-lg mb-2 text-[#263238]">
        Progress Tracking
      </h3>
      <p className="text-[#607D8B] text-sm">
        Visualize your nutrition journey with detailed analytics and progress reports.
      </p>
    </div>
  </div>
</section>





{/* -----------------------new aera power full features---------------------------------- */}

    <section id="features" className="py-16 px-4 md:px-20 bg-white font-['Poppins']">
  <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 text-[#263238]">
    Powerful <span className="text-[#FF7043]">Features</span>
  </h2>
  <p className="text-center text-[#607D8B] text-sm mb-10">
    Everything you need to maintain a healthy lifestyle
  </p>

  <div className="flex flex-col md:flex-row items-center justify-between gap-16">
    {/* Left Feature List */}
    <div className="space-y-6 w-full md:w-1/2">
      {/* Feature 1 */}
      <div className="flex items-start gap-4 group hover:scale-[1.02] transition-all duration-300">
        <FaUtensils className="text-white text-4xl p-2 bg-[#4CAF50] rounded-md shadow-md group-hover:shadow-lg" />
        <div>
          <h4 className="font-semibold text-lg text-[#263238]">Smart Meal Logging</h4>
          <p className="text-[#607D8B] text-sm">
            Snap a photo and our AI instantly identifies food items and calculates nutrition values.
          </p>
        </div>
      </div>

      {/* Feature 2 */}
      <div className="flex items-start gap-4 group hover:scale-[1.02] transition-all duration-300">
        <FaHeartbeat className="text-white text-4xl p-2 bg-[#FF7043] rounded-md shadow-md mt-1 group-hover:shadow-lg" />
        <div>
          <h4 className="font-semibold text-lg text-[#263238]">Personalized Recommendations</h4>
          <p className="text-[#607D8B] text-sm">
            Get meal suggestions based on your dietary preferences and health goals.
          </p>
        </div>
      </div>

      {/* Feature 3 */}
      <div className="flex items-start gap-4 group hover:scale-[1.02] transition-all duration-300">
        <FaStethoscope className="text-white text-4xl p-2 bg-[#FFD93D] rounded-md shadow-md mt-1 group-hover:shadow-lg" />
        <div>
          <h4 className="font-semibold text-lg text-[#263238]">Health Monitoring</h4>
          <p className="text-[#607D8B] text-sm">
            Track blood sugar, weight, and other vital health metrics in one place.
          </p>
        </div>
      </div>
    </div>

    {/* Right Image */}
    <div className="w-full md:w-1/2">
      <img
        src={healthy}
        alt="Healthy Lifestyle"
        className="w-[450px] rounded-xl shadow-xl transition-transform duration-300 hover:scale-105"
      />
    </div>
  </div>
</section>

{/* Tracker Section */}
<section className="py-16 px-4 md:px-20 bg-white font-['Poppins']">
  <div className="flex flex-col md:flex-row items-center justify-between gap-16">
    {/* Right Image */}
    <div className="w-full md:w-1/2">
      <img
        src={flat}
        alt="Tracking Visual"
        className="w-[450px] rounded-xl shadow-xl transition-transform duration-300 hover:scale-105"
      />
    </div>

    {/* Left Feature List */}
    <div className="space-y-6 w-full md:w-1/2">
      {/* Feature 1 */}
      <div className="flex items-start gap-4 group hover:scale-[1.02] transition-all duration-300">
        <FaHandHoldingWater className="text-white text-4xl p-2 bg-[#4CAF50] rounded-md shadow-md group-hover:shadow-lg" />
        <div>
          <h4 className="font-semibold text-lg text-[#263238]">Water Intake Tracker</h4>
          <p className="text-[#607D8B] text-sm">
            Stay hydrated by easily tracking water intake throughout your day.
          </p>
        </div>
      </div>

      {/* Feature 2 */}
      <div className="flex items-start gap-4 group hover:scale-[1.02] transition-all duration-300">
        <FaGlobeAsia className="text-white text-4xl p-2 bg-[#FF7043] rounded-md shadow-md mt-1 group-hover:shadow-lg" />
        <div>
          <h4 className="font-semibold text-lg text-[#263238]">Custom Goals</h4>
          <p className="text-[#607D8B] text-sm">
            Define your own daily goals tailored to your lifestyle and preferences.
          </p>
        </div>
      </div>

      {/* Feature 3 */}
      <div className="flex items-start gap-4 group hover:scale-[1.02] transition-all duration-300">
        <FaComment className="text-white text-4xl p-2 bg-[#FFD93D] rounded-md shadow-md mt-1 group-hover:shadow-lg" />
        <div>
          <h4 className="font-semibold text-lg text-[#263238]">Community Support</h4>
          <p className="text-[#607D8B] text-sm">
            Join a growing community for tips, motivation, and healthy habits.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

{/* ------------------------------------------------------------------------------------------------- */}

<div
  id="blogs"
  className="min-h-screen overflow-x-hidden bg-[#FFF8F0] flex flex-col items-center px-4 sm:px-8 py-16 font-['Roboto']"
>
  <h1 className="text-3xl md:text-4xl font-bold text-[#263238] font-['Poppins'] mb-12 text-center relative after:content-[''] after:block after:w-24 after:h-1 after:mx-auto after:mt-3 after:bg-[#FF7043]">
    Explore <span className="text-[#FF7043]">Our Picks</span>
  </h1>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-6xl">
    {items.map((item, index) => (
      <div
        key={index}
        className="group bg-white rounded-2xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden relative animate-fade-up"
        style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
      >
        {/* Orange sliding line */}
        <div className="absolute top-0 left-0 h-1 w-0 bg-[#FF7043] transition-all duration-300 group-hover:w-full"></div>

        {/* Blog Image */}
        <img
          src={item.img}
          alt={item.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Blog Content */}
        <div className="p-5">
          <h2 className="text-lg font-semibold text-[#263238] font-['Poppins'] transition-colors duration-200 group-hover:text-[#FF7043]">
            {item.title}
          </h2>
          <p className="text-sm text-[#546E7A] mt-2">{item.desc}</p>

          {item.author && (
            <p className="text-sm text-[#90A4AE] mt-2 italic">By {item.author}</p>
          )}

          {(item.time || item.cal) && (
            <div className="flex justify-between text-xs text-[#90A4AE] mt-4">
              {item.time && <span>{item.time}</span>}
              {item.cal && <span>{item.cal}</span>}
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
</div>


{/* ------------------------------------------------------- */}
<div className="w-full bg-white py-20 px-4 text-center flex flex-col items-center font-['Poppins'] relative overflow-hidden">
  {/* Decorative Floating Blobs */}
  <div className="absolute top-[-40px] left-[-40px] w-36 h-36 bg-[#FFD93D] opacity-30 rounded-full blur-3xl animate-pulse-slow"></div>
  <div className="absolute bottom-[-40px] right-[-40px] w-32 h-32 bg-[#FF7043] opacity-20 rounded-full blur-2xl animate-pulse-slow"></div>

  <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight text-[#263238] z-10">
    Ready to Transform Your <br />
    <span className="text-[#4CAF50]">Health Journey</span><span className="text-[#FF6B6B]">?</span>
  </h1>

  <p className="text-[#607D8B] text-base md:text-lg mb-8 max-w-xl z-10">
    Join thousands of users who have already improved their nutrition and wellness with <strong className="text-[#FF7043]">TrackEats</strong>.
  </p>

  <div className="flex gap-4 flex-wrap justify-center z-10">
    <button
      onClick={openRegister}
      className="bg-[#FF7043] hover:bg-[#ff5733] text-white font-semibold py-3 px-7 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:brightness-110"
    >
      Start Free Trial
    </button>
  

     <ModalWrapper isOpen={showRegisterModal} onClose={closeModals}>
  <Register onClose={closeModals} onSwitchToLogin={openLogin} />
</ModalWrapper>

    </div> 
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








































