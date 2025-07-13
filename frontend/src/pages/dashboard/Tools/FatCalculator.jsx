import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, animate as framerAnimate } from "framer-motion";
import { Sparkles, Zap, PersonStanding, Cake, Weight, Ruler, BarChart2, HeartPulse, Scale, BrainCircuit, Droplet, Zap as Lightning } from "lucide-react";

// --- Corrected & Improved Helper Components ---

// CRITICAL FIX: The useEffect dependency and the animate function call are now correct.
const AnimatedNumber = ({ value }) => {
    const [displayValue, setDisplayValue] = useState(0);
    useEffect(() => {
        const controls = framerAnimate(displayValue, value, {
            type: "spring", mass: 0.8, stiffness: 100, damping: 20,
            onUpdate: (latest) => setDisplayValue(Math.round(latest)),
        });
        return () => controls.stop();
    }, [value]); // Only depends on the target value, preventing infinite loops.

    return <>{displayValue}</>;
};

const GenderToggle = ({ selected, setSelected }) => (
    <div>
        <label className="flex items-center gap-2 font-medium text-[#546E7A] mb-2"><PersonStanding size={20} /> Gender</label>
        <div className="flex w-full bg-[#FFFFFF] rounded-full p-1 border border-[#ECEFF1]">
            {["male", "female"].map((option) => (
                <button key={option} onClick={() => setSelected(option)} className="relative w-1/2 rounded-full py-2.5 text-sm font-semibold capitalize transition-colors">
                    <span className={`relative z-10 transition-colors ${selected === option ? 'text-white' : 'text-[#546E7A] hover:text-[#263238]'}`}>{option}</span>
                    {selected === option && (<motion.div layoutId="gender-toggle-highlight" className="absolute inset-0 rounded-full bg-[#FF7043]" transition={{ type: "spring", stiffness: 300, damping: 30 }}/>)}
                </button>
            ))}
        </div>
    </div>
);

const CustomSlider = ({ label, value, onChange, min, max, unit, icon }) => {
    const progress = ((value - min) / (max - min)) * 100;
    return (
        <div>
            <label className="flex items-center justify-between font-medium text-[#546E7A] mb-2">
                <span className="flex items-center gap-2">{icon} {label}</span>
                <span className="font-semibold text-[#263238]">{value} {unit}</span>
            </label>
            <div className="relative h-2">
                <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb
                    [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:h-2
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:-mt-1.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#FF7043]"
                    style={{ background: `linear-gradient(to right, #FF7043 ${progress}%, #ECEFF1 ${progress}%)` }} />
            </div>
        </div>
    );
};

const NumberStepper = ({ label, value, onChange, icon }) => (
    <div>
        <label className="flex items-center gap-2 font-medium text-[#546E7A] mb-2">{icon} {label}</label>
        <div className="flex items-center justify-between w-full bg-[#FFFFFF] rounded-xl p-1.5 border border-[#ECEFF1]">
            <button onClick={() => onChange(value > 1 ? value - 1 : 1)} className="size-8 rounded-lg text-[#546E7A] grid place-items-center font-bold text-xl hover:bg-[#FAF3EB] active:scale-95 transition-all">-</button>
            <span className="w-16 text-center font-bold text-lg text-[#263238]">{value}</span>
            <button onClick={() => onChange(value + 1)} className="size-8 rounded-lg text-[#546E7A] grid place-items-center font-bold text-xl hover:bg-[#FAF3EB] active:scale-95 transition-all">+</button>
        </div>
    </div>
);

// NEW: A component for tips on the calculator card to balance height.
const GeneralTips = () => {
    const tips = [
        { icon: <Droplet size={18} className="text-[#546E7A]"/>, text: "Stay hydrated throughout the day for accurate results." },
        { icon: <Lightning size={18} className="text-[#546E7A]"/>, text: "Measurements can vary; consistency is more important than a single number." },
        { icon: <Scale size={18} className="text-[#546E7A]"/>, text: "For best results, weigh yourself in the morning before eating." },
    ];
    return (
        <div className="mt-6 space-y-3">
            {tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 text-sm p-3 bg-white/60 rounded-lg border border-[#ECEFF1]">
                    <div className="flex-shrink-0 mt-0.5">{tip.icon}</div>
                    <p className="text-[#546E7A]">{tip.text}</p>
                </div>
            ))}
        </div>
    );
};

const ResultRangesChart = ({ gender, result }) => {
    const ranges = gender === 'male' 
        ? [{l:'E',m:5,c:'bg-blue-400'},{l:'A',m:13,c:'bg-sky-400'},{l:'F',m:17,c:'bg-green-400'},{l:'Ac',m:24,c:'bg-yellow-400'},{l:'O',m:40,c:'bg-red-400'}]
        : [{l:'E',m:13,c:'bg-blue-400'},{l:'A',m:20,c:'bg-sky-400'},{l:'F',m:24,c:'bg-green-400'},{l:'Ac',m:31,c:'bg-yellow-400'},{l:'O',m:45,c:'bg-red-400'}];
    const totalMax = ranges[ranges.length - 1].m;
    const pointerPosition = (result / totalMax) * 100;

    return (
        <motion.div className="w-full mt-6" variants={{ visible: { transition: { staggerChildren: 0.1 }}}}>
            <div className="relative h-4 w-full flex rounded-full overflow-hidden border border-[#ECEFF1]">
                {ranges.map((range, i) => {
                    const prevMax = i > 0 ? ranges[i-1].m : 0;
                    return <div key={range.l} style={{width:`${((range.m - prevMax)/totalMax)*100}%`}} className={`h-full ${range.c}`} />;
                })}
            </div>
            <div className="relative h-4 w-full mt-1">
                <motion.div className="absolute top-0 transform -translate-x-1/2" initial={{left:'0%'}} animate={{left:`${Math.min(pointerPosition, 100)}%`}} transition={{type:'spring',stiffness:100,damping:15,delay:1}}>
                    <div className="font-bold text-xs text-white bg-[#263238] rounded-full px-2 py-0.5 whitespace-nowrap">You</div>
                    <div className="mx-auto mt-0.5 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-[#263238]"/>
                </motion.div>
            </div>
        </motion.div>
    );
};

const NextSteps = () => {
    const steps = [
        {t:'Nutrition Focus',i:<Scale size={24}/>,d:'Balanced meals support a healthy body.'},
        {t:'Consistent Activity',i:<HeartPulse size={24}/>,d:'Regular exercise is key for managing fat.'},
        {t:'Expert Advice',i:<BrainCircuit size={24}/>,d:'A professional can offer personalized guidance.'},
    ];
    return (
        <motion.div className="w-full mt-8" variants={{ visible: { transition: { staggerChildren: 0.2 }}}}>
            <h3 className="font-bold text-[#263238] text-lg text-center mb-4">Recommended Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {steps.map(s=><motion.div key={s.t} variants={{hidden:{opacity:0,y:20},visible:{opacity:1,y:0}}} className="bg-[#B3E5FC]/40 p-4 rounded-lg text-center"><div className="text-[#263238] w-12 h-12 bg-white/50 rounded-full mx-auto flex items-center justify-center">{s.i}</div><h4 className="font-semibold text-[#263238] mt-3">{s.t}</h4><p className="text-xs text-[#546E7A] mt-1">{s.d}</p></motion.div>)}
            </div>
        </motion.div>
    );
};

// --- Main Component ---

export default function FatCalculator() {
    const [gender, setGender] = useState("male");
    const [height, setHeight] = useState(170);
    const [age, setAge] = useState(25);
    const [weight, setWeight] = useState(70);
    const [result, setResult] = useState(null);

    const getFatCategory = (p, g) => {
        const style=(c,s)=>({c,s});const male=(p<6?style('Essential Fat','text-blue-600 bg-blue-100/50'):p<=13?style('Athletic','text-sky-600 bg-sky-100/50'):p<=17?style('Fit','text-green-600 bg-green-100/50'):p<=24?style('Acceptable','text-yellow-600 bg-yellow-100/50'):style('Obese','text-red-600 bg-red-100/50'));
        const female=(p<14?style('Essential Fat','text-blue-600 bg-blue-100/50'):p<=20?style('Athletic','text-sky-600 bg-sky-100/50'):p<=24?style('Fit','text-green-600 bg-green-100/50'):p<=31?style('Acceptable','text-yellow-600 bg-yellow-100/50'):style('Obese','text-red-600 bg-red-100/50'));
        return g === 'male' ? male : female;
    };
    
    const calculateFat = () => {
        setResult(null);
        const bmi = weight / Math.pow(height / 100, 2);
        const fat = gender === "male" ? 1.2 * bmi + 0.23 * age - 16.2 : 1.2 * bmi + 0.23 * age - 5.4;
        setTimeout(() => setResult(Math.max(0, parseFloat(fat.toFixed(1)))), 150);
    };

    const resultCategory = result !== null ? getFatCategory(result, gender) : null;
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };

    return (
        <div className="min-h-screen w-full bg-[#FFFDF9] flex flex-col items-center font-sans p-4 sm:p-8">
             <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]"><div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_50%_200px,#FFFDF9,transparent)]"></div></div>

            <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center mb-10 w-full max-w-2xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold text-[#263238]">Body Composition <span className="text-[#FF7043]">Estimator</span></h1>
                <p className="text-lg text-[#546E7A] mt-2">Get a quick estimate of your body fat percentage to guide your fitness journey.</p>
            </motion.header>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                <motion.div initial="hidden" animate="visible" variants={itemVariants} className="lg:col-span-2 flex flex-col bg-[#FAF3EB] p-8 rounded-2xl border border-[#ECEFF1] shadow-lg shadow-gray-200/50">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-[#263238] flex items-center gap-3"><Sparkles className="text-[#FF7043]" /> Enter Your Details</h2>
                        <GenderToggle selected={gender} setSelected={setGender} />
                        <CustomSlider label="Height" value={height} onChange={setHeight} min={100} max={220} unit="cm" icon={<Ruler size={20} />} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <NumberStepper label="Age" value={age} onChange={setAge} icon={<Cake size={20} />} />
                            <NumberStepper label="Weight" value={weight} onChange={setWeight} icon={<Weight size={20} />} />
                        </div>
                        <motion.button onClick={calculateFat} whileHover={{ y: -3, boxShadow: '0 10px 20px -5px rgba(255, 112, 67, 0.4)' }} whileTap={{ scale: 0.98, y: 0 }} className="w-full bg-[#FF7043] hover:bg-[#F4511E] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#FF7043]/30 transition-all">
                            <Zap /> Calculate Estimate
                        </motion.button>
                    </div>
                    <div className="mt-auto pt-6">
                        <GeneralTips />
                    </div>
                </motion.div>

                <motion.div initial="hidden" animate="visible" variants={itemVariants} transition={{ delay: 0.2 }} className="lg:col-span-3 flex flex-col items-center justify-center text-center bg-[#AED581]/20 p-8 rounded-2xl border border-[#ECEFF1] h-full">
                    <AnimatePresence mode="wait">
                        {result !== null ? (
                            <motion.div key="result" initial="hidden" animate="visible" exit={{ opacity: 0, scale: 0.95 }} transition={{ staggerChildren: 0.2 }} className="flex flex-col items-center w-full">
                                <motion.div variants={itemVariants} className="relative size-40">
                                    <svg className="w-full h-full" viewBox="0 0 100 100" transform="rotate(-90 50 50)"><circle cx="50" cy="50" r="45" stroke="#ECEFF1" strokeWidth="10" fill="none" /><motion.circle cx="50" cy="50" r="45" stroke="#FF7043" strokeWidth="10" fill="none" strokeLinecap="round" initial={{ strokeDasharray: `0, ${2*Math.PI*45}` }} animate={{ strokeDasharray: `${2*Math.PI*45 * Math.min(result/40, 1)}, ${2*Math.PI*45}` }} transition={{ duration: 1.5, ease: "circOut" }} /></svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-[#263238]"><span className="text-4xl font-extrabold"><AnimatedNumber value={result} /><span className="text-3xl">%</span></span></div>
                                </motion.div>
                                <motion.div variants={itemVariants} className={`font-semibold text-lg py-1 px-4 rounded-full mt-4 ${resultCategory?.s}`}>{resultCategory?.c}</motion.div>
                                <ResultRangesChart gender={gender} result={result} />
                                <NextSteps />
                            </motion.div>
                        ) : (
                            <motion.div key="placeholder" initial="hidden" animate="visible" exit={{ opacity: 0 }} variants={itemVariants} className="text-[#546E7A] flex flex-col items-center gap-3">
                                <BarChart2 className="size-16 opacity-40" />
                                <h3 className="text-xl font-semibold text-[#263238]">Your Results Dashboard</h3>
                                <p className="text-sm max-w-xs">Fill in your details to see your estimated body fat, visual charts, and next steps.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}