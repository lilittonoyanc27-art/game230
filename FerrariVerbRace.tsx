import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Flag, 
  Timer, 
  User, 
  Tractor as Car, 
  ChevronRight,
  RotateCcw,
  Volume2,
  Zap,
  Gauge
} from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Types ---

interface Question {
  sentence: string;
  options: string[];
  correct: string;
  translation: string;
}

// --- Data ---

const QUESTIONS: Question[] = [
  { sentence: "Mi hermano ___ en una oficina.", options: ["trabaja", "funciona"], correct: "trabaja", translation: "Իմ եղբայրը աշխատում է գրասենյակում:" },
  { sentence: "El ordenador no ___ bien.", options: ["trabaja", "funciona"], correct: "funciona", translation: "Համակարգիչը լավ չի աշխատում:" },
  { sentence: "Ella ___ como arquitecta.", options: ["trabaja", "funciona"], correct: "trabaja", translation: "Նա աշխատում է որպես ճարտարապետ:" },
  { sentence: "Esta lavadora ya no ___.", options: ["trabaja", "funciona"], correct: "funciona", translation: "Այս լվացքի մեքենան այլևս չի աշխատում:" },
  { sentence: "Los domingos nadie ___.", options: ["trabaja", "funciona"], correct: "trabaja", translation: "Կիրակի օրերին ոչ ոք չի աշխատում:" },
  { sentence: "El plan de marketing ___ perfectamente.", options: ["trabaja", "funciona"], correct: "funciona", translation: "Մարքեթինգային պլանը հիանալի աշխատում է:" },
  { sentence: "¿En qué empresa ___ tú?", options: ["trabajas", "funcionas"], correct: "trabajas", translation: "Ո՞ր ընկերությունում ես դու աշխատում:" },
  { sentence: "Mi coche es viejo pero ___.", options: ["trabaja", "funciona"], correct: "funciona", translation: "Իմ մեքենան հին է, բայց աշխատում է:" },
  { sentence: "Ellos ___ desde casa.", options: ["trabajan", "funcionan"], correct: "trabajan", translation: "Նրանք աշխատում են տնից:" },
  { sentence: "El ascensor no ___ hoy.", options: ["trabaja", "funciona"], correct: "funciona", translation: "Վերելակն այսօր չի աշխատում:" },
  { sentence: "Quiero ___ en el extranjero.", options: ["trabajar", "funcionar"], correct: "trabajar", translation: "Ուզում եմ աշխատել արտերկրում:" },
  { sentence: "Este mando a distancia no ___.", options: ["trabaja", "funciona"], correct: "funciona", translation: "Այս հեռակառավարման վահանակը չի աշխատում:" },
  { sentence: "Nosotros ___ ocho horas al día.", options: ["trabajamos", "funcionamos"], correct: "trabajamos", translation: "Մենք աշխատում ենք օրական ութ ժամ:" },
  { sentence: "La calefacción ___ por la noche.", options: ["trabaja", "funciona"], correct: "funciona", translation: "Ջեռուցումը աշխատում է գիշերը:" },
  { sentence: "Si no estudias, no ___ tu mente.", options: ["trabaja", "funciona"], correct: "funciona", translation: "Եթե չսովորես, միտքդ չի աշխատի:" }
];

// --- Utilities ---

const speak = (text: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }
};

// --- Components ---

const Ferrari = ({ color, name, progress }: { color: string, name: string, progress: number }) => {
  return (
    <motion.div 
      animate={{ x: `${progress}%` }}
      transition={{ type: 'spring', stiffness: 50 }}
      className="relative flex flex-col items-center group"
    >
      <div className={`absolute -top-12 bg-white text-black px-4 py-1 rounded-full font-black text-xs border-2 border-${color}-600 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity`}>
        {name}
      </div>
      <div className="relative">
         {/* Simple Ferrari-like Shape */}
         <div className={`w-32 h-12 ${color === 'red' ? 'bg-red-600' : 'bg-yellow-500'} rounded-t-[40px] rounded-b-xl shadow-2xl relative border-t-4 border-white/20`}>
            {/* Windshield */}
            <div className="absolute top-1 left-12 w-12 h-6 bg-cyan-400/40 rounded-t-lg skew-x-12 border-l border-white/30" />
            
            {/* Racing Stripes */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-black/10" />

            {/* Wheels */}
            <div className="absolute -bottom-2 left-4 w-6 h-6 bg-stone-900 rounded-full border-2 border-stone-700">
               <div className="w-1.5 h-1.5 bg-silver m-auto mt-1.5 rounded-full" />
            </div>
            <div className="absolute -bottom-2 right-4 w-6 h-6 bg-stone-900 rounded-full border-2 border-stone-700">
               <div className="w-1.5 h-1.5 bg-silver m-auto mt-1.5 rounded-full" />
            </div>

            {/* Spoiler */}
            <div className={`absolute -left-2 top-0 w-4 h-6 ${color === 'red' ? 'bg-red-700' : 'bg-yellow-600'} rounded-l-md -skew-y-12`} />
         </div>
         
         {/* Dust Effect when moving */}
         <motion.div 
            animate={{ opacity: [0, 0.5, 0], scale: [1, 1.5, 2], x: [-10, -30] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute left-0 bottom-0 w-4 h-4 bg-white/20 rounded-full blur-md"
         />
      </div>
    </motion.div>
  );
};

export default function FerrariVerbRace() {
  const [view, setView] = useState<'intro' | 'game' | 'finish'>('intro');
  const [turn, setTurn] = useState<'Gor' | 'Gayane'>('Gor');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [progress, setProgress] = useState({ Gor: 0, Gayane: 0 });
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'wrong'>('none');
  const [winner, setWinner] = useState<string | null>(null);

  const currentQ = QUESTIONS[currentIdx];

  const handleAnswer = (opt: string) => {
    if (feedback !== 'none') return;
    
    if (opt === currentQ.correct) {
      setFeedback('correct');
      speak(currentQ.sentence.replace('___', opt));
      
      const newProgress = { ...progress, [turn]: progress[turn] + 100 / 8 }; // Reach finish in 8 correct answers
      setProgress(newProgress);

      if (newProgress[turn] >= 100) {
        setWinner(turn);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => setView('finish'), 1500);
      } else {
        setTimeout(() => {
          setTurn(turn === 'Gor' ? 'Gayane' : 'Gor');
          setCurrentIdx((prev) => (prev + 1) % QUESTIONS.length);
          setFeedback('none');
        }, 1500);
      }
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setTurn(turn === 'Gor' ? 'Gayane' : 'Gor');
        setCurrentIdx((prev) => (prev + 1) % QUESTIONS.length);
        setFeedback('none');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans overflow-hidden flex flex-col selection:bg-red-500/30">
      
      <AnimatePresence mode="wait">
        
        {view === 'intro' && (
          <motion.div 
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-12 relative"
          >
             {/* Background glow */}
             <div className="absolute inset-0 bg-radial-[at_50%_50%] from-red-600/20 to-transparent pointer-events-none" />
             
             <div className="space-y-4">
                <motion.div 
                   animate={{ rotate: [0, 2, -2, 0] }}
                   transition={{ duration: 4, repeat: Infinity }}
                   className="w-24 h-24 bg-red-600 rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.4)] border-2 border-white/20"
                >
                   <Flag size={48} className="text-white" />
                </motion.div>
                <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase leading-none">
                  FERRARI <br /><span className="text-red-500">VERB RACE</span>
                </h1>
                <p className="text-stone-500 font-bold uppercase tracking-[0.3em] text-xs max-w-md mx-auto">
                   Trabajar vs Funcionar. <br /> Մրցավազք Գոռի և Գայանեի միջև:
                </p>
             </div>

             <div className="flex gap-20">
                <div className="flex flex-col items-center gap-4">
                   <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center border-4 border-white/10 shadow-xl">
                      <User size={32} />
                   </div>
                   <p className="font-black italic uppercase tracking-widest text-sm">Gor</p>
                </div>
                <div className="flex flex-col items-center gap-4">
                   <div className="w-16 h-16 rounded-full bg-yellow-500 flex items-center justify-center border-4 border-white/10 shadow-xl">
                      <User size={32} />
                   </div>
                   <p className="font-black italic uppercase tracking-widest text-sm">Gayane</p>
                </div>
             </div>

             <button 
                onClick={() => setView('game')}
                className="px-16 py-6 border-2 border-white text-white font-black uppercase tracking-widest text-sm hover:bg-white hover:text-black transition-all rounded-full shadow-2xl"
             >
                Start Engines
             </button>
          </motion.div>
        )}

        {view === 'game' && (
          <motion.div 
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col"
          >
             {/* Race Track Header */}
             <div className="relative h-[400px] w-full bg-stone-900 border-b-8 border-yellow-500 overflow-hidden px-10 flex flex-col justify-center gap-16 pb-20">
                {/* Track Markings */}
                <div className="absolute top-1/2 left-0 w-full h-2 border-t-4 border-dashed border-white/20 -translate-y-1/2 pointer-events-none" />
                <div className="absolute right-20 top-0 bottom-0 w-8 bg-white/10 flex items-center justify-center">
                   <Flag size={24} className="text-white/20" />
                </div>

                <div className="flex flex-col gap-20 max-w-6xl mx-auto w-full">
                   <Ferrari name="Gor" color="red" progress={progress.Gor} />
                   <Ferrari name="Gayane" color="yellow" progress={progress.Gayane} />
                </div>
             </div>

             {/* UI Controls */}
             <div className="flex-1 bg-black p-10 flex flex-col items-center justify-center gap-12">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={turn}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`flex items-center gap-4 px-8 py-3 rounded-full border-2 ${turn === 'Gor' ? 'border-red-600 bg-red-600/10' : 'border-yellow-500 bg-yellow-500/10'}`}
                  >
                    <User size={20} className={turn === 'Gor' ? 'text-red-500' : 'text-yellow-500'} />
                    <span className="font-black italic uppercase tracking-widest leading-none">Turno de: {turn}</span>
                  </motion.div>
                </AnimatePresence>

                <div className="max-w-3xl w-full space-y-12 text-center">
                   <div className="space-y-4">
                      <h2 className="text-4xl md:text-5xl font-black italic tracking-tight leading-tight">
                        {currentQ.sentence.split('___')[0]}
                        <span className="px-6 py-1 bg-white/5 border-b-4 border-stone-800 rounded-xl inline-block mx-4 min-w-[200px] align-middle"></span>
                        {currentQ.sentence.split('___')[1]}
                      </h2>
                      <p className="text-stone-500 font-bold uppercase tracking-widest text-sm italic">{currentQ.translation}</p>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                      {currentQ.options.map((opt) => (
                        <motion.button
                          key={opt}
                          whileHover={{ scale: 1.05, y: -5 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleAnswer(opt)}
                          disabled={feedback !== 'none'}
                          className={`p-10 rounded-3xl border-4 font-black text-3xl uppercase italic transition-all ${
                            feedback === 'correct' && opt === currentQ.correct
                              ? 'bg-emerald-600 border-white text-white shadow-3xl'
                              : feedback === 'wrong' && opt !== currentQ.correct
                              ? 'bg-red-600 border-white text-white'
                              : 'bg-stone-900 border-white/5 hover:border-white/40 text-stone-400 hover:text-white'
                          }`}
                        >
                          {opt}
                        </motion.button>
                      ))}
                   </div>
                </div>

                {/* Progress Bar overall */}
                <div className="w-full max-w-xl h-1 bg-stone-900 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentIdx + 1) / QUESTIONS.length) * 100}%` }}
                    className="h-full bg-white/20"
                   />
                </div>
             </div>
          </motion.div>
        )}

        {view === 'finish' && (
          <motion.div 
            key="finish"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-12"
          >
             <div className="space-y-6">
                <div className={`w-40 h-40 rounded-[3rem] mx-auto flex items-center justify-center shadow-3xl border-4 border-white/20 ${winner === 'Gor' ? 'bg-red-600' : 'bg-yellow-500'}`}>
                   <Trophy size={80} className="text-white animate-bounce" />
                </div>
                <h1 className="text-7xl font-black italic uppercase tracking-tighter leading-none">
                  ¡GANADOR!<br />
                  <span className={winner === 'Gor' ? 'text-red-500' : 'text-yellow-500'}>{winner}</span>
                </h1>
                <p className="text-stone-500 font-bold uppercase tracking-widest text-sm">
                   Դու վարպետորեն տիրապետում ես Trabajar և Funcionar բայերին։
                </p>
             </div>

             <button 
                onClick={() => {
                  setView('intro');
                  setProgress({ Gor: 0, Gayane: 0 });
                  setCurrentIdx(0);
                }}
                className="px-12 py-5 bg-white text-black font-black uppercase tracking-widest text-sm rounded-full hover:bg-red-600 hover:text-white transition-all shadow-2xl"
             >
                Reiniciar Carrera
             </button>
          </motion.div>
        )}

      </AnimatePresence>

      <footer className="p-8 border-t border-white/5 flex justify-center opacity-20">
         <div className="flex items-center gap-4">
            <Gauge size={16} />
            <p className="text-[10px] font-black uppercase tracking-[1em]">Racing Academy v3.2</p>
         </div>
      </footer>
    </div>
  );
}
