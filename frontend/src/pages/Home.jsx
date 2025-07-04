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
    <div  id = "home" className="min-h-screen   overflow-x-hidden bg-gradient-to-br from-white to-[#f4fbf8] font-sans text-gray-800">
      {/* Header Section */}

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
      className="bg-green-500 hover:bg-green-600 text-white  ml-5 px-5 py-2 rounded-full font-semibold"
    >
      Sign In
    </button>
  }
/>
  
      {/* ---------------------------imran---------------------------------------- */}

      {/* Main Content Section hai  */}
      <main  className="container mx-auto px-4 sm:px-6 py-8 md:py-15">
        <div   className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 md:gap-16">
          {/* Left Content */}
          <div className="w-full md:w-1/2 space-y-5">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 leading-tight ">
              Smart <span className="text-green-500 ">Nutrition</span><br />
              Tracking <span className='relative z-10'>Made</span>
              <div className="absolute left-80 top-64 w-20 h-20 bg-gray-200 rounded-full opacity-90"></div>

               <span className="text-orange-500"><br></br>Simple</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Transform your health journey with AI-powered meal tracking, personalized recommendations, and comprehensive nutrition insights.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button onClick={openRegister} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold">
               Get Started Free
              </button>

              
            </div>
            {/* ======================================================================== */}
              <div className="absolute left-27 flex justify-center align-start w-25 h-25 bg-orange-200 rounded-full opacity-70"></div>
            <div className='flex felx-inline space-x-8 mt-10'>
              <div className='z-20'> <span className='font-bold text-2xl text-green-500'>50K+</span><br />
              <p>Active Users</p></div>

              <div className='z-20'><span className='font-bold text-2xl text-red-400 '>1.9★ </span> <br />
              App Rating</div>

              <div className='z-20'><span className='font-bold text-2xl  text-amber-300'>1M+</span> <br />
              Meals Tracked</div>
              </div>
          </div>
            {/* ======================================================================== */}


          {/* Right Image */}
          <div className="w-full md:w-1/2 relative ">
            <div className="relative py-12">
              {/* Background decorative shapes */}
              <div className=" absolute top-0 right-25  w-25 h-25 bg-orange-300 rounded-full opacity-90"></div>
              <div className="absolute top-3 left-40 w-20 h-20 bg-yellow-300 rounded-full opacity-90"></div>
              <div className="absolute bottom-5 left-11 w-20 h-20 bg-orange-400 rounded-full opacity-90"></div>

              {/* Main white card */}
              <div className="relative bg-white rounded-3xl shadow-lg  smv  p-4 md:p-6 mx-auto max-w-md">
                {/* Image */}
                <img
                  src={elevated}
                  alt="Nutrition App UI"
                  className="rounded-lg w-full h-auto transition-transform duration-300 hover:scale-105"
                />

                {/* Green check */}
                <div className="absolute top-3 right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    {/* new aera hai why choose tracking  */}

  
       <section id='about' className=" bg-gray-50 py-12 px-4 text-center">
      <h2 className="text-4xl font-bold mb-5">
        Why Choose <span className="text-green-500">TrackEats</span>?
      </h2>
      <p className="text-gray-600 max-w-xl mx-auto mb-10">
        We’re revolutionizing nutrition tracking with smart technology that adapts to your lifestyle, making healthy eating effortless and enjoyable.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl  transition-transform duration-300 hover:scale-105">
          <div className="flex justify-center mb-4 ">
            <FaLightbulb className="text-green-500 text-4xl" />
          </div>
          <h3 className="font-semibold text-lg mb-2">AI-Powered Insights</h3>
          <p className="text-gray-600 text-sm">
            Smart algorithms analyze your eating patterns and provide personalized recommendations.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-transform duration-300 hover:scale-105">
          <div className="flex justify-center mb-4 ">
            <FaMobileAlt className="text-orange-500 text-4xl" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Easy Tracking</h3>
          <p className="text-gray-600 text-sm">
            Log meals instantly with photo recognition and barcode scanning technology.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl  transition-transform duration-300 hover:scale-105">
          <div className="flex justify-center mb-4">
            <FaChartLine className="text-yellow-500 text-4xl" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Progress Tracking</h3>
          <p className="text-gray-600 text-sm">
            Visualize your nutrition journey with detailed analytics and progress reports.
          </p>
        </div>
      </div>
    </section>


{/* -----------------------new aera power full features---------------------------------- */}

     <section id='features' className="py-10 px-4 md:px-35 bg-white">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">
        <span className="text-black">Powerful</span>{' '}
        <span className="text-orange-500">Features</span>
      </h2>
      <p className="text-center text-gray-700 text-12px mb-10">
        Everything you need to maintain a healthy lifestyle
      </p>

      <div className="flex flex-col md:flex-row items-center justify-between gap-25 ">
        {/* Left Feature List */}
        <div className="space-y-6 w-full md:w-1/2">
          <div className="flex items-start gap-3">
          
            <div  className="" />
            <FaUtensils className=" text-white text-4xl p-2 bg-green-500 rounded-sm" />

            <div>
              <h4 className="font-semibold text-lg"> Smart Meal Logging</h4>
              <p className="text-gray-600 text-sm">
                Snap a photo and our AI instantly identifies food items and calculates nutrition values.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="" />
            <FaHeartbeat className="text-white  text-4xl p-2 bg-orange-500 rounded-sm mt-1" />

            <div>
              <h4 className="font-semibold text-lg">Personalized Recommendations</h4>
              <p className="text-gray-600 text-sm">
                Get meal suggestions based on your dietary preferences and health goals.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="" />
            <FaStethoscope className="text-white  text-4xl p-2 bg-yellow-500 rounded-sm mt-1" />

            <div>
              <h4 className="font-semibold text-lg">Health Monitoring</h4>
              <p className="text-gray-600 text-sm">
                Track blood sugar, weight, and other vital health metrics in one place.
              </p>
            </div>
          </div>
        </div>

        {/* Right Image */}
        <div className="w-full md:w-1/2 sm:spacey-4">
        <img src={healthy} alt="" className="w-[450px] rounded-lg shadow-lg" />

        </div>
      </div>
    </section>

    {/* new aera hai traker ka */}
     <section className="py-10 px-4 md:px-35 bg-white">
     <div className=" container flex flex-col md:flex-row items-center justify-between gap-25">

       {/* Right Image */}
        <div className="w-full md:w-1/2">
          <img src={flat} alt="elevated"
           className="w-[450px] h-[full] rounded-lg shadow-lg " />
        </div>

       {/* Left Feature List */}
        <div className="space-y-6 w-full md:w-1/2">
          <div className="flex items-start gap-3">
          
            <div  className="" />
            <FaHandHoldingWater size={40} className="text-white text-4xl p-2 bg-green-500 rounded-sm" />

            <div>
              <h4 className="font-semibold text-lg">Water intake Tracker</h4>
              <p className="text-gray-600 text-sm">
                Snap a photo and our AI instantly identifies food items and calculates nutrition values.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="" />
            <FaGlobeAsia  className="text-white  text-4xl p-2 bg-orange-500 rounded-sm mt-1" />

            <div>
              <h4 className="font-semibold text-lg">Custom Goals</h4>
              <p className="text-gray-600 text-sm">
                Get meal suggestions based on your dietary preferences and health goals.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="" />
            <FaComment className="text-white text-4xl p-2 bg-yellow-500 rounded-sm mt-1" />

            <div>
              <h4 className="font-semibold text-lg">Community Support</h4>
              <p className="text-gray-600 text-sm">
                Track blood sugar, weight, and other vital health metrics in one place.
              </p>
            </div>
          </div>
        </div>
     </div>
</section>
{/* ------------------------------------------------------------------------------------------------- */}

 <div  id = "blogs" className="min-h-screen overflow-x-hidden bg-gray-50 flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-8">Explore</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {items.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow hover:shadow-md transition duration-300 overflow-hidden"
          >
            <img src={item.img} alt={item.title} className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105" />
            <div className="p-4">
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <p className="text-gray-600 text-sm mt-1">{item.desc}</p>
              {item.author && (
                <p className="text-sm text-gray-500 mt-2">{item.author}</p>
              )}
              {(item.time || item.cal) && (
                <div className="flex justify-between text-xs text-gray-500 mt-4">
                  <span>{item.time}</span>
                  <span>{item.cal}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>


{/* ------------------------------------------------------- */}
 <div className="w-full bg-gradient-to-r from-[#fefcea] to-[#f1f4f9] py-20 flex flex-col items-center
  px-4 text-center ">
      <h1 className="text-3xl md:text-5xl font-bold mb-4">
        Ready to Transform Your <span className="text-green-500">Health Journey</span><span className="text-black">?</span>
      </h1>
      <p className="text-gray-600 text-base md:text-lg mb-8 max-w-xl">
        Join thousands of users who have already improved their nutrition and wellness with TrackEats.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <button onClick={openRegister} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition-all duration-300">
        Start Free Trial
         </button>
       
        

      </div>
     <ModalWrapper isOpen={showRegisterModal} onClose={closeModals}>
  <Register onClose={closeModals} onSwitchToLogin={openLogin} />
</ModalWrapper>

    </div> 
      <ModalWrapper isOpen={showLoginModal} onClose={closeModals}>
      <Login onSwitchToRegister={openRegister} onClose={closeModals} />
      </ModalWrapper>

  <div id="contact">
  <Footer />
</div>

      

       
  

      </div>
        
  );
};
export default Home;








































