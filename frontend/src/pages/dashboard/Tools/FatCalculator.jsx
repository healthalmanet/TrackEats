import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, animate as framerAnimate } from "framer-motion";
import { Sparkles, Zap, PersonStanding, Cake, Weight, Ruler, BarChart2, HeartPulse, Scale, BrainCircuit, Droplet } from "lucide-react";

// --- Themed & Corrected Helper Components ---

const AnimatedNumber = ({ value }) => {
    const [displayValue, setDisplayValue] = useState(0);
    useEffect(() => {
        const controls = framerAnimate(displayValue, value, {
            type: "spring", mass: 0.8, stiffness: 100, damping: 20,
            onUpdate: (latest) => setDisplayValue(Math.round(latest)),
        });
        return () => controls.stop();
    }, [value]);
    return <>{displayValue}</>;
};

const GenderToggle = ({ selected, setSelected }) => (
    <div>
        <label className="flex items-center gap-2 font-medium text-heading mb-2"><PersonStanding size={20} /> Gender</label>
        <div className="flex w-full bg-section rounded-full p-1 border border-custom">
            {["male", "female"].map((option) => (
                <button key={option} onClick={() => setSelected(option)} className="relative w-1/2 rounded-full py-2.5 text-sm font-semibold capitalize transition-colors">
                    <span className={`relative z-10 transition-colors ${selected === option ? 'text-light' : 'text-body hover:text-heading'}`}>{option}</span>
                    {selected === option && (<motion.div layoutId="gender-toggle-highlight" className="absolute inset-0 rounded-full bg-primary" transition={{ type: "spring", stiffness: 300, damping: 30 }}/>)}
                </button>
            ))}
        </div>
    </div>
);

const CustomSlider = ({ label, value, onChange, min, max, unit, icon }) => {
    const progress = ((value - min) / (max - min)) * 100;
    return (
        <div>
            <label className="flex items-center justify-between font-medium text-heading mb-2">
                <span className="flex items-center gap-2">{icon} {label}</span>
                <span className="font-semibold text-heading">{value} {unit}</span>
            </label>
            <div className="relative h-2">
                <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))}
                    className="w-full h-2 bg-transparent appearance-none cursor-pointer slider-thumb
                    [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:h-2
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:-mt-1.5 [&::-webkit-slider-thumb]:bg-section [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary"
                    style={{ background: `linear-gradient(to right, var(--color-primary-accent) ${progress}%, var(--color-bg-light) ${progress}%)` }} />
            </div>
        </div>
    );
};

const NumberStepper = ({ label, value, onChange, icon }) => (
    <div>
        <label className="flex items-center gap-2 font-medium text-heading mb-2">{icon} {label}</label>
        <div className="flex items-center justify-between w-full bg-section rounded-xl p-1.5 border border-custom">
            <button onClick={() => onChange(value > 1 ? value - 1 : 1)} className="size-8 rounded-lg text-body grid place-items-center font-bold text-xl hover:bg-light active:scale-95 transition-all">-</button>
            <span className="w-16 text-center font-bold text-lg text-heading">{value}</span>
            <button onClick={() => onChange(value + 1)} className="size-8 rounded-lg text-body grid place-items-center font-bold text-xl hover:bg-light active:scale-95 transition-all">+</button>
        </div>
    </div>
);

const GeneralTips = () => {
    const tips = [
        { icon: <Droplet size={18} className="text-body"/>, text: "Stay hydrated throughout the day for accurate results." },
        { icon: <Zap size={18} className="text-body"/>, text: "Measurements can vary; consistency is more important than a single number." },
        { icon: <Scale size={18} className="text-body"/>, text: "For best results, weigh yourself in the morning before eating." },
    ];
    return (
        <div className="mt-6 space-y-3">
            {tips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3 text-sm p-3 bg-light/60 rounded-lg border border-custom">
                    <div className="flex-shrink-0 mt-0.5">{tip.icon}</div>
                    <p className="text-body">{tip.text}</p>
                </div>
            ))}
        </div>
    );
};

const ResultRangesChart = ({ gender, result }) => {
    const ranges = gender === 'male' 
        ? [{l:'E',m:5,c:'bg-accent-yellow'},{l:'A',m:13,c:'bg-primary/70'},{l:'F',m:17,c:'bg-primary'},{l:'Ac',m:24,c:'bg-accent-orange'},{l:'O',m:40,c:'bg-red'}]
        : [{l:'E',m:13,c:'bg-accent-yellow'},{l:'A',m:20,c:'bg-primary/70'},{l:'F',m:24,c:'bg-primary'},{l:'Ac',m:31,c:'bg-accent-orange'},{l:'O',m:45,c:'bg-red'}];
    const totalMax = ranges[ranges.length - 1].m;
    const pointerPosition = (result / totalMax) * 100;

    return (
        <motion.div className="w-full mt-6" variants={{ visible: { transition: { staggerChildren: 0.1 }}}}>
            <div className="relative h-4 w-full flex rounded-full overflow-hidden border border-custom">
                {ranges.map((range, i) => {
                    const prevMax = i > 0 ? ranges[i-1].m : 0;
                    return <div key={range.l} style={{width:`${((range.m - prevMax)/totalMax)*100}%`}} className={`h-full ${range.c}`} />;
                })}
            </div>
            <div className="relative h-4 w-full mt-1">
                <motion.div className="absolute top-0 transform -translate-x-1/2" initial={{left:'0%'}} animate={{left:`${Math.min(pointerPosition, 100)}%`}} transition={{type:'spring',stiffness:100,damping:15,delay:1}}>
                    <div className="font-bold text-xs text-light bg-heading rounded-full px-2 py-0.5 whitespace-nowrap">You</div>
                    <div className="mx-auto mt-0.5 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-heading"/>
                </motion.div>
            </div>
        </motion.div>
    );
};

const NextSteps = () => {
    const steps = [
        {t:'Nutrition Focus',i:<Scale size={24}/>,d:'Balanced meals support a healthy body.', bg: 'bg-primary/10'},
        {t:'Consistent Activity',i:<HeartPulse size={24}/>,d:'Regular exercise is key for managing fat.', bg: 'bg-accent-orange/10'},
        {t:'Expert Advice',i:<BrainCircuit size={24}/>,d:'A professional can offer personalized guidance.', bg: 'bg-accent-yellow/10'},
    ];
    return (
        <motion.div className="w-full mt-8" variants={{ visible: { transition: { staggerChildren: 0.2 }}}}>
            <h3 className="font-bold text-heading text-lg text-center mb-4">Recommended Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {steps.map(s=><motion.div key={s.t} variants={{hidden:{opacity:0,y:20},visible:{opacity:1,y:0}}} className={`${s.bg} p-4 rounded-lg text-center`}><div className="text-heading w-12 h-12 bg-section/50 rounded-full mx-auto flex items-center justify-center">{s.i}</div><h4 className="font-semibold text-heading mt-3">{s.t}</h4><p className="text-xs text-body mt-1">{s.d}</p></motion.div>)}
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

    // This function now returns CSS classes from the theme
    const getFatCategory = (p, g) => {
        const style=(c,s)=>({category: c, styleClasses: s});
        const male=(p<6?style('Essential Fat','text-accent-yellow bg-accent-yellow/10'):p<=13?style('Athletic','text-primary bg-primary/10'):p<=17?style('Fit','text-primary bg-primary/10'):p<=24?style('Acceptable','text-accent-orange bg-accent-orange/10'):style('Obese','text-red bg-red/10'));
        const female=(p<14?style('Essential Fat','text-accent-yellow bg-accent-yellow/10'):p<=20?style('Athletic','text-primary bg-primary/10'):p<=24?style('Fit','text-primary bg-primary/10'):p<=31?style('Acceptable','text-accent-orange bg-accent-orange/10'):style('Obese','text-red bg-red/10'));
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
        <div className="min-h-screen w-full bg-main flex flex-col items-center font-['Poppins'] p-4 sm:p-8">
            <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center mb-10 w-full max-w-2xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-['Lora'] font-bold text-heading">Body Composition <span className="text-primary">Estimator</span></h1>
                <p className="text-lg text-body mt-2">Get a quick estimate of your body fat percentage to guide your fitness journey.</p>
            </motion.header>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                <motion.div initial="hidden" animate="visible" variants={itemVariants} className="lg:col-span-2 flex flex-col bg-section p-8 rounded-2xl border border-custom shadow-soft">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-['Lora'] font-bold text-heading flex items-center gap-3"><Sparkles className="text-primary" /> Enter Your Details</h2>
                        <GenderToggle selected={gender} setSelected={setGender} />
                        <CustomSlider label="Height" value={height} onChange={setHeight} min={100} max={220} unit="cm" icon={<Ruler size={20} />} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <NumberStepper label="Age" value={age} onChange={setAge} icon={<Cake size={20} />} />
                            <NumberStepper label="Weight (kg)" value={weight} onChange={setWeight} icon={<Weight size={20} />} />
                        </div>
                        <motion.button onClick={calculateFat} whileHover={{ y: -3, boxShadow: 'var(--shadow-soft)' }} whileTap={{ scale: 0.98, y: 0 }} className="w-full bg-primary hover:bg-primary-hover text-light font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-soft transition-all">
                            <Zap /> Calculate Estimate
                        </motion.button>
                    </div>
                    <div className="mt-auto pt-6">
                        <GeneralTips />
                    </div>
                </motion.div>

                <motion.div initial="hidden" animate="visible" variants={itemVariants} transition={{ delay: 0.2 }} className="lg:col-span-3 flex flex-col items-center justify-center text-center bg-section p-8 rounded-2xl border border-custom h-full shadow-soft">
                    <AnimatePresence mode="wait">
                        {result !== null ? (
                            <motion.div key="result" initial="hidden" animate="visible" exit={{ opacity: 0, scale: 0.95 }} transition={{ staggerChildren: 0.2 }} className="flex flex-col items-center w-full">
                                <motion.div variants={itemVariants} className="relative size-40">
                                    <svg className="w-full h-full" viewBox="0 0 100 100" transform="rotate(-90 50 50)"><circle cx="50" cy="50" r="45" stroke="var(--color-bg-light)" strokeWidth="10" fill="none" /><motion.circle cx="50" cy="50" r="45" stroke="var(--color-primary-accent)" strokeWidth="10" fill="none" strokeLinecap="round" initial={{ strokeDasharray: `0, ${2*Math.PI*45}` }} animate={{ strokeDasharray: `${2*Math.PI*45 * Math.min(result/40, 1)}, ${2*Math.PI*45}` }} transition={{ duration: 1.5, ease: "circOut" }} /></svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-heading"><span className="text-4xl font-extrabold"><AnimatedNumber value={result} /><span className="text-3xl">%</span></span></div>
                                </motion.div>
                                <motion.div variants={itemVariants} className={`font-semibold text-lg py-1 px-4 rounded-full mt-4 ${resultCategory?.styleClasses}`}>{resultCategory?.category}</motion.div>
                                <ResultRangesChart gender={gender} result={result} />
                                <NextSteps />
                            </motion.div>
                        ) : (
                            <motion.div key="placeholder" initial="hidden" animate="visible" exit={{ opacity: 0 }} variants={itemVariants} className="text-body flex flex-col items-center gap-3">
                                <BarChart2 className="size-16 opacity-40" />
                                <h3 className="text-xl font-semibold text-heading">Your Results Dashboard</h3>
                                <p className="text-sm max-w-xs">Fill in your details to see your estimated body fat, visual charts, and next steps.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}