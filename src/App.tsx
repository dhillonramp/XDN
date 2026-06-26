import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Award, 
  Download, 
  CheckCircle, 
  Circle, 
  Play, 
  RotateCcw, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Smile, 
  BookOpen,
  ArrowRight,
  HelpCircle,
  Trophy
} from 'lucide-react';
import { modules, Module, Lesson } from './data';

export interface MistakeItem {
  id: string;
  lessonId: string;
  lessonTitle: string;
  gameType: string;
  questionText: string;
  explanation: string;
  userAnswer: string | number;
  answer: string | number;
  timestamp: number;
  questionData: any;
}

export default function App() {
  // Navigation & UI States
  const [activeModule, setActiveModule] = useState<Module>(modules[0]);
  const [activeLesson, setActiveLesson] = useState<Lesson>(modules[0].lessons[0]);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>("m1");
  const [showIframe, setShowIframe] = useState<boolean>(false);
  const [mobileMenuOpen, setShowMobileMenu] = useState<boolean>(false);
  
  // Mistakes Collection & Review States
  const [mistakes, setMistakes] = useState<MistakeItem[]>(() => {
    try {
      const saved = localStorage.getItem('pep_math_mistakes');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [reviewItem, setReviewItem] = useState<MistakeItem | null>(null);
  const [reviewMode, setReviewMode] = useState<'retry' | 'analogy'>('retry');
  const [reviewAnalogyData, setReviewAnalogyData] = useState<any>(null);
  const [reviewUserAnswer, setReviewUserAnswer] = useState<any>(null);
  const [reviewShowExplanation, setReviewShowExplanation] = useState<boolean>(false);
  const [reviewIsCorrect, setReviewIsCorrect] = useState<boolean | null>(null);
  const [reviewFeedbackMsg, setReviewFeedbackMsg] = useState<string>("");

  // Progress Persistence State
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('pep_math_progress');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Sound and Fun effects
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [earnedFlowers, setEarnedFlowers] = useState<number>(0);

  // Sync progress with local storage and update flowers count
  useEffect(() => {
    localStorage.setItem('pep_math_progress', JSON.stringify(completedLessons));
    // Calculate total flowers (1 completed lesson = 1 flower)
    const count = Object.values(completedLessons).filter(Boolean).length;
    setEarnedFlowers(count);
  }, [completedLessons]);

  // Total lessons count
  const totalLessonsCount = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedCount = Object.values(completedLessons).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalLessonsCount) * 100);

  // Listen to postMessage from game-runner iframe
  useEffect(() => {
    const handleGameMessage = (event: MessageEvent) => {
      if (event.data) {
        if (event.data.type === 'LESSON_COMPLETE') {
          const { lessonId } = event.data;
          markLessonComplete(lessonId);
        } else if (event.data.type === 'LESSON_MISTAKE') {
          const { lessonId, lessonTitle, gameType, question } = event.data;
          
          setMistakes(prev => {
            // Check if this exact mistake with same userAnswer and question text already exists to avoid redundant logging
            const exists = prev.some(m => m.lessonId === lessonId && m.questionText === question.questionText && m.userAnswer === question.userAnswer);
            if (exists) return prev;

            const newMistake: MistakeItem = {
              id: Math.random().toString(36).substr(2, 9),
              lessonId,
              lessonTitle,
              gameType,
              questionText: question.questionText,
              explanation: question.explanation,
              userAnswer: question.userAnswer,
              answer: question.answer,
              timestamp: question.timestamp || Date.now(),
              questionData: question
            };
            const updated = [newMistake, ...prev];
            localStorage.setItem('pep_math_mistakes', JSON.stringify(updated));
            return updated;
          });
        }
      }
    };
    window.addEventListener('message', handleGameMessage);
    return () => window.removeEventListener('message', handleGameMessage);
  }, []);

  const markLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => {
      const updated = { ...prev, [lessonId]: true };
      return updated;
    });
    // Optional audio tone feedback inside parent app
    playParentSucessTone();
  };

  const toggleLessonStatus = (lessonId: string) => {
    setCompletedLessons(prev => {
      const updated = { ...prev, [lessonId]: !prev[lessonId] };
      return updated;
    });
  };

  const resetAllProgress = () => {
    if (window.confirm("确定要重置所有探险进度吗？进度重置后，点亮的星星和小红花会消失哦。")) {
      setCompletedLessons({});
    }
  };

  const playParentSucessTone = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // ignore
    }
  };

  // MISTAKES REVIEW ACTIONS
  const generateAnalogyQuestion = (item: MistakeItem) => {
    const emojisList = ["🐿️", "🐰", "🌻", "🎈", "🐒", "🍑", "🍌", "🍎", "🐱", "🐼", "🐤", "🍬", "🍩"];
    const type = item.gameType;

    if (type === 'count') {
      const itemEmoji = emojisList[Math.floor(Math.random() * emojisList.length)];
      const targetNum = Math.floor(Math.random() * 8) + 3; // 3 to 10
      return {
        type: 'count',
        itemEmoji,
        answer: targetNum,
        questionText: `数数大挑战：这里有几个 ${itemEmoji}？`,
        explanation: `跟着聪聪用手指从1开始，每一个 ${itemEmoji} 只数一次哦：1、2、3... 正确答案是：${targetNum} 个。`
      };
    } else if (type === 'compare') {
      const emojiLeft = emojisList[Math.floor(Math.random() * emojisList.length)];
      let emojiRight = emojisList[Math.floor(Math.random() * emojisList.length)];
      if (emojiLeft === emojiRight) {
        emojiRight = emojisList[(emojisList.indexOf(emojiLeft) + 1) % emojisList.length];
      }
      const numLeft = Math.floor(Math.random() * 6) + 2; // 2 to 7
      let numRight = Math.floor(Math.random() * 6) + 2;
      if (numLeft === numRight && Math.random() > 0.4) {
        numRight += 1;
      }
      let ans = "=";
      if (numLeft > numRight) ans = ">";
      if (numLeft < numRight) ans = "<";
      return {
        type: 'compare',
        numLeft,
        numRight,
        emojiLeft,
        emojiRight,
        answer: ans,
        questionText: `比大小：${numLeft}个 ${emojiLeft} 比 ${numRight}个 ${emojiRight}`,
        explanation: `${numLeft}个 ${emojiLeft} 比 ${numRight}个 ${emojiRight} ${ans === '>' ? '多' : (ans === '<' ? '少' : '一样多')}，所以应该填“${ans}”哦！`
      };
    } else if (type === 'split') {
      const total = Math.floor(Math.random() * 5) + 5; // 5 to 9
      const numLeft = Math.floor(Math.random() * (total - 2)) + 1; // 1 to total-1
      const ans = total - numLeft;
      return {
        type: 'split',
        total,
        numLeft,
        answer: ans,
        questionText: `数字分与合：${total} 可以分成 ${numLeft} 和几？`,
        explanation: `${total} 可以分成 ${numLeft} 和 ${ans}，它们加起来刚好是 ${total} 哟！`
      };
    } else if (type === 'shape') {
      const shapes = [
        { name: '长方体', icon: '📦', desc: '长长方方的，有6个平平的面，不容易滚动。' },
        { name: '正方体', icon: '🧊', desc: '方方正正，每一个面都一模一样大。' },
        { name: '圆柱', icon: '🥫', desc: '直直的，两头圆圆的，躺下来可以滚来滚去。' },
        { name: '球', icon: '🏀', desc: '圆溜溜的，可以往所有的方向飞快滚动！' }
      ];
      const prevName = item.questionData ? item.questionData.answer : "";
      const filtered = shapes.filter(s => s.name !== prevName);
      const chosen = filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : shapes[0];
      return {
        type: 'shape',
        icon: chosen.icon,
        answer: chosen.name,
        desc: chosen.desc,
        questionText: `立体图形：${chosen.icon} 是什么形状？`,
        explanation: `这个漂亮的玩具是【${chosen.name}】！特征：${chosen.desc}`
      };
    } else {
      // math
      const isAdd = Math.random() > 0.5;
      let num1 = 0, num2 = 0, ans = 0, op = "+";
      let explanation = "";
      if (isAdd) {
        num1 = Math.floor(Math.random() * 6) + 2; // 2 to 7
        num2 = Math.floor(Math.random() * (10 - num1)) + 1;
        ans = num1 + num2;
        op = "+";
        explanation = `加法是把两堆合起来。左边有 ${num1} 个，右边有 ${num2} 个，全部加起来一共是 ${ans} 个！`;
      } else {
        num1 = Math.floor(Math.random() * 5) + 6; // 6 to 10
        num2 = Math.floor(Math.random() * (num1 - 2)) + 1;
        ans = num1 - num2;
        op = "-";
        explanation = `减法是在大数里面拿走一部分。从 ${num1} 里面去掉 ${num2} 个，剩下的正好就是 ${ans} 个！`;
      }
      return {
        type: 'math',
        num1,
        num2,
        op,
        answer: ans,
        questionText: `口算闯关：${num1} ${op} ${num2} = ?`,
        explanation
      };
    }
  };

  const handleReviewMistake = (item: MistakeItem, mode: 'retry' | 'analogy') => {
    setReviewItem(item);
    setReviewMode(mode);
    setReviewUserAnswer(null);
    setReviewShowExplanation(false);
    setReviewIsCorrect(null);
    setReviewFeedbackMsg("");

    if (mode === 'analogy') {
      const generated = generateAnalogyQuestion(item);
      setReviewAnalogyData(generated);
    } else {
      setReviewAnalogyData(null);
    }
  };

  const handleDeleteMistake = (id: string) => {
    setMistakes(prev => {
      const updated = prev.filter(m => m.id !== id);
      localStorage.setItem('pep_math_mistakes', JSON.stringify(updated));
      return updated;
    });
  };

  const checkReviewAnswer = (ans: any) => {
    setReviewUserAnswer(ans);
    const correctAnswer = reviewMode === 'retry' ? reviewItem?.answer : reviewAnalogyData?.answer;
    
    if (String(ans) === String(correctAnswer)) {
      setReviewIsCorrect(true);
      setReviewShowExplanation(true);
      setReviewFeedbackMsg("🏆 真棒！答对啦！你太聪明了！");
      playParentSucessTone();
    } else {
      setReviewIsCorrect(false);
      setReviewFeedbackMsg("🐾 呀，回答错了，别气馁！再仔细数一数或算一算，你可以的！");
    }
  };

  const handleResolveMistake = () => {
    if (reviewItem) {
      handleDeleteMistake(reviewItem.id);
    }
    setReviewItem(null);
  };

  // Export unfinished lessons to CSV
  const exportUncompletedTasksCSV = () => {
    const unfinishedList: Array<{ moduleTitle: string; lessonTitle: string; suggestion: string }> = [];
    
    modules.forEach(m => {
      m.lessons.forEach(l => {
        if (!completedLessons[l.id]) {
          unfinishedList.push({
            moduleTitle: m.title,
            lessonTitle: l.title,
            suggestion: l.description
          });
        }
      });
    });

    if (unfinishedList.length === 0) {
      alert("太棒了！你已经完成了所有的数学探险，没有未完成的任务啦！🎖️");
      return;
    }

    // CSV header and rows (using BOM to ensure Excel opens correctly with Chinese characters)
    let csvContent = "\uFEFF";
    csvContent += "模块单元,知识点任务,学习建议\n";
    unfinishedList.forEach(row => {
      // Escape commas & quotes
      const cleanMod = row.moduleTitle.replace(/"/g, '""');
      const cleanLes = row.lessonTitle.replace(/"/g, '""');
      const cleanSugg = row.suggestion.replace(/"/g, '""');
      csvContent += `"${cleanMod}","${cleanLes}","${cleanSugg}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "小学数学一年级上册-未完成探险任务.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLessonSelect = (mod: Module, les: Lesson) => {
    setActiveModule(mod);
    setActiveLesson(les);
    setShowIframe(true);
    setShowMobileMenu(false);
    
    // Automatically set expanded module to match
    setExpandedModuleId(mod.id);

    // Scroll to active area on mobile
    if (window.innerWidth < 768) {
      setTimeout(() => {
        document.getElementById('tablet-display')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const startFirstUnfinished = () => {
    // Find first unfinished lesson
    for (let m of modules) {
      for (let l of m.lessons) {
        if (!completedLessons[l.id]) {
          handleLessonSelect(m, l);
          return;
        }
      }
    }
    // If all completed, open first lesson
    handleLessonSelect(modules[0], modules[0].lessons[0]);
  };

  return (
    <div id="math-app-root" class="min-h-screen bg-[#FFFDF9] flex flex-col font-sans text-slate-800 antialiased selection:bg-orange-200">
      
      {/* Decorative Cloud Background elements */}
      <div class="fixed top-20 left-10 text-slate-200/40 text-7xl pointer-events-none select-none floating-item opacity-40">☁️</div>
      <div class="fixed bottom-20 right-10 text-slate-200/40 text-8xl pointer-events-none select-none floating-item opacity-30" style={{ animationDelay: '1.5s' }}>☁️</div>
      <div class="fixed top-1/2 right-12 text-slate-200/40 text-6xl pointer-events-none select-none floating-item opacity-30" style={{ animationDelay: '0.8s' }}>☁️</div>

      {/* TOP BRAND NAV BAR */}
      <header id="header-nav" class="bg-white/95 backdrop-blur-md sticky top-0 z-30 border-b-4 border-dashed border-[#FFE0B2] shadow-sm px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-11 h-11 bg-gradient-to-r from-amber-300 to-orange-400 rounded-2xl flex items-center justify-center text-2xl shadow-md border-b-4 border-orange-600/30">
            🎒
          </div>
          <div>
            <h1 class="text-xl lg:text-2xl font-black text-orange-600 tracking-wide flex items-center">
              数学一年级上册
              <span class="ml-2 text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                幼儿园提前学
              </span>
            </h1>
            <p class="text-[10px] lg:text-xs text-slate-400 font-medium mt-0.5">
              💡 顶尖儿童教育设计 · 激发宝贝的数学乐趣 🚀
            </p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div class="hidden md:flex items-center space-x-3">
          {/* Audio toggle button */}
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            class={`p-2.5 rounded-2xl border-2 transition-all flex items-center justify-center ${
              soundEnabled 
                ? "bg-amber-50 border-amber-200 text-amber-700" 
                : "bg-slate-50 border-slate-200 text-slate-400"
            }`}
            title={soundEnabled ? "关闭声音" : "开启声音"}
          >
            <span class="text-lg">{soundEnabled ? "🔊 声音开" : "🔇 静音中"}</span>
          </button>

          {/* Reset progress */}
          <button 
            onClick={resetAllProgress}
            class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm rounded-2xl border-2 border-slate-200 flex items-center space-x-2 transition-all"
          >
            <RotateCcw class="w-4 h-4" />
            <span>重置进度</span>
          </button>

          {/* Export Unfinished Button */}
          <button 
            onClick={exportUncompletedTasksCSV}
            class="px-5 py-2.5 bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white font-extrabold text-sm rounded-2xl shadow-sm border-b-4 border-amber-700 flex items-center space-x-2 transition-all hover:scale-102 active:scale-98"
          >
            <Download class="w-4 h-4" />
            <span>导出未完成任务</span>
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div class="flex items-center md:hidden space-x-2">
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            class="p-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl text-sm"
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>
          <button 
            onClick={() => setShowMobileMenu(!mobileMenuOpen)}
            class="p-2 bg-slate-100 text-slate-700 rounded-xl border border-slate-200"
          >
            {mobileMenuOpen ? <X class="w-6 h-6" /> : <Menu class="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* MOBILE COLLAPSED DRAWER MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            class="md:hidden bg-white border-b-4 border-orange-100 p-4 flex flex-col space-y-3 z-20 shadow-lg"
          >
            <div class="grid grid-cols-2 gap-2 text-center">
              <button 
                onClick={exportUncompletedTasksCSV}
                class="bg-amber-100 text-amber-900 border border-amber-300 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1"
              >
                <Download class="w-4 h-4" />
                <span>导出未完成任务</span>
              </button>
              <button 
                onClick={resetAllProgress}
                class="bg-slate-100 text-slate-700 border border-slate-300 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1"
              >
                <RotateCcw class="w-4 h-4" />
                <span>重置所有进度</span>
              </button>
            </div>
            
            <div class="text-xs text-slate-500 font-bold pt-2 border-t border-slate-100">
              请在下方选择知识点开始学习大冒险！
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO DASHBOARD BANNER */}
      <section id="hero-dashboard" class="px-4 lg:px-8 py-6 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left Side: Stats and Big Button */}
        <div class="md:col-span-8 bg-gradient-to-r from-[#FFF8E1] to-[#FFF3E0] rounded-3xl p-6 lg:p-8 border-4 border-dashed border-[#FFE0B2] shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="space-y-4 text-center md:text-left">
            <div class="inline-flex items-center space-x-2 bg-white/90 border border-amber-300 px-3 py-1.5 rounded-full text-xs font-bold text-amber-800 shadow-inner">
              <span>🌟</span>
              <span>跟著人工智能聪聪一起学数学</span>
            </div>
            <h2 class="text-2xl lg:text-3xl font-black text-amber-900 leading-tight">
              第一步：开启探险大门！
            </h2>
            <p class="text-sm text-amber-700 leading-relaxed max-w-lg">
              精心挑选的22个重要数学知识点。完成每一个通关小游戏，点亮星星并赢取小红花 🌸，培养小朋友受用一生的数学逻辑思维吧！
            </p>
            <div class="pt-2 flex flex-wrap justify-center md:justify-start gap-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startFirstUnfinished}
                class="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-lg px-8 py-4 rounded-2xl shadow-lg shadow-orange-300/40 border-b-6 border-orange-700 transition-all flex items-center space-x-3 cursor-pointer"
              >
                <Play class="w-6 h-6 fill-white" />
                <span>开始探险（进入目录）</span>
              </motion.button>
            </div>
          </div>

          {/* Gamification Stats: Red Flowers Box */}
          <div class="flex flex-col items-center bg-white/90 p-5 rounded-2xl border-2 border-orange-100 w-full max-w-[200px] shadow-sm select-none">
            <div class="text-5xl mb-2 floating-item">🌸</div>
            <div class="text-2xl font-black text-rose-500">{earnedFlowers} 朵</div>
            <div class="text-xs text-slate-400 font-bold mt-1">已得小红花</div>
            <div class="flex mt-3 space-x-1">
              {Array.from({ length: Math.min(5, Math.max(1, Math.floor(earnedFlowers / 4) + 1)) }).map((_, i) => (
                <span key={i} class="text-sm text-yellow-400">👑</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Total Circular Progress Indicator */}
        <div class="md:col-span-4 bg-white rounded-3xl p-6 border-4 border-[#E0F2F1] shadow-sm flex flex-col items-center justify-center relative overflow-hidden select-none">
          <div class="text-sm font-black text-[#00796B] tracking-widest mb-4">全书通关总进度</div>

          <div class="relative w-36 h-36 flex items-center justify-center">
            {/* SVG Circular Ring */}
            <svg class="absolute inset-0 w-full h-full transform -rotate-90">
              <circle 
                cx="72" 
                cy="72" 
                r="60" 
                stroke="#E0F2F1" 
                stroke-width="12" 
                fill="transparent" 
              />
              <motion.circle 
                cx="72" 
                cy="72" 
                r="60" 
                stroke="#009688" 
                stroke-width="12" 
                fill="transparent" 
                stroke-dasharray={2 * Math.PI * 60}
                initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 60 * (1 - progressPercent / 100) }}
                transition={{ duration: 1, ease: "easeOut" }}
                stroke-linecap="round"
              />
            </svg>
            {/* Mascot Center emoji */}
            <div class="text-center flex flex-col items-center z-10">
              <span class="text-4xl filter drop-shadow-sm mb-1">{progressPercent === 100 ? "👑" : "🤖"}</span>
              <span class="text-2xl font-black text-slate-800">{progressPercent}%</span>
            </div>
          </div>

          <div class="mt-4 text-xs font-bold text-slate-500 text-center leading-relaxed">
            <span>已点亮 <b>{completedCount}</b> / {totalLessonsCount} 个探险关卡</span>
            <br />
            <span class="text-[#00796B]/80">{progressPercent === 100 ? "🎉 全书大满贯，你太棒啦！" : "💪 加油！继续去挑战吧！"}</span>
          </div>
        </div>

      </section>

      {/* MAIN TWO-COLUMN EXPLORATION CONTAINER */}
      <main id="main-content" class="px-4 lg:px-8 py-4 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 flex-grow">
        
        {/* LEFT COLUMN: MODULE NAVIGATION INDEX (6-CORE MODULES) */}
        <div class="md:col-span-5 flex flex-col space-y-4">
          <div class="flex items-center justify-between px-2">
            <h3 class="text-lg font-black text-slate-800 flex items-center space-x-2">
              <BookOpen class="w-5 h-5 text-orange-500" />
              <span>📚 PEP 一年级数学探险地图</span>
            </h3>
            <span class="text-xs font-bold text-slate-400">点击目录卡片展开</span>
          </div>

          {/* List of 6 Core Modules as expandable/collapsible cards */}
          <div class="space-y-4 overflow-y-auto max-h-[640px] pr-1">
            {modules.map((mod, index) => {
              const isExpanded = expandedModuleId === mod.id;
              
              // Calculate module progress
              const totalModLessons = mod.lessons.length;
              const completedModLessons = mod.lessons.filter(l => completedLessons[l.id]).length;
              const modPercent = Math.round((completedModLessons / totalModLessons) * 100);

              return (
                <div 
                  key={mod.id}
                  id={`module-card-${mod.id}`}
                  class={`rounded-3xl border-3 transition-all ${
                    isExpanded 
                      ? `${mod.borderColor} shadow-md bg-white` 
                      : "border-slate-100 hover:border-slate-200 bg-white hover:shadow-sm"
                  }`}
                >
                  {/* Module Card Header */}
                  <div 
                    onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                    class={`p-4 flex items-center justify-between cursor-pointer select-none rounded-t-3xl ${mod.cardBg} transition-all`}
                  >
                    <div class="flex items-center space-x-3">
                      {/* Round Module Index tag */}
                      <div class="w-9 h-9 rounded-full bg-white flex items-center justify-center text-sm font-black shadow-inner border border-slate-200/50" style={{ color: mod.textColor.match(/#[0-9a-fA-F]+/)?.[0] || 'inherit' }}>
                        {mod.numStr}
                      </div>
                      <div class="text-left">
                        <h4 class={`text-sm lg:text-base font-black ${mod.textColor} leading-snug`}>
                          {mod.title}
                        </h4>
                        
                        {/* Mini progress text */}
                        <div class="flex items-center space-x-2 mt-1">
                          <div class="w-20 bg-slate-200/70 h-1.5 rounded-full overflow-hidden">
                            <div class={`h-full ${mod.textColor.replace("text-", "bg-")}`} style={{ width: `${modPercent}%` }}></div>
                          </div>
                          <span class="text-[10px] text-slate-400 font-bold">进度 {completedModLessons}/{totalModLessons}</span>
                        </div>
                      </div>
                    </div>

                    <div class="text-slate-400">
                      {isExpanded ? <ChevronUp class="w-5 h-5" /> : <ChevronDown class="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Collapsible Lesson List inside Module */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        class="overflow-hidden border-t border-slate-100 bg-white rounded-b-3xl"
                      >
                        <div class="p-3.5 space-y-2">
                          {mod.lessons.map(les => {
                            const isCompleted = !!completedLessons[les.id];
                            const isActive = activeLesson.id === les.id;

                            return (
                              <div 
                                key={les.id}
                                id={`lesson-item-${les.id}`}
                                class={`p-3 rounded-2xl flex items-center justify-between border-2 transition-all cursor-pointer group ${
                                  isActive 
                                    ? "bg-amber-50/50 border-amber-300 shadow-sm" 
                                    : "border-slate-50 hover:border-amber-100 bg-white hover:bg-amber-50/10"
                                }`}
                                onClick={() => handleLessonSelect(mod, les)}
                              >
                                <div class="flex items-center space-x-3 text-left">
                                  {/* Lesson Icon badge */}
                                  <div class="w-9 h-9 rounded-xl bg-slate-50 group-hover:bg-amber-50 flex items-center justify-center text-xl shadow-inner border border-slate-100 transition-colors">
                                    {les.emoji}
                                  </div>
                                  <div>
                                    <h5 class={`text-xs lg:text-sm font-bold tracking-wide ${isActive ? "text-amber-800" : "text-slate-700"}`}>
                                      {les.title}
                                    </h5>
                                    <p class="text-[10px] text-slate-400 mt-0.5 max-w-[200px] lg:max-w-[260px] truncate">
                                      {les.description}
                                    </p>
                                  </div>
                                </div>

                                {/* Checkbox with illumination state */}
                                <div class="flex items-center space-x-2">
                                  {/* Star indicating completed state */}
                                  {isCompleted ? (
                                    <motion.span 
                                      initial={{ scale: 0.5 }}
                                      animate={{ scale: [1, 1.2, 1] }}
                                      class="text-amber-400 text-lg"
                                    >
                                      ⭐
                                    </motion.span>
                                  ) : (
                                    <span class="text-slate-200 text-lg">☆</span>
                                  )}

                                  {/* Custom Checkbox */}
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation(); // prevent triggering click event of parent div
                                      toggleLessonStatus(les.id);
                                    }}
                                    class="p-1 text-slate-400 hover:text-amber-500 transition-colors"
                                  >
                                    {isCompleted ? (
                                      <CheckCircle class="w-5 h-5 text-emerald-500 fill-emerald-50" />
                                    ) : (
                                      <Circle class="w-5 h-5 text-slate-200" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE QUIZ AREA & IFRAME CONTROLLER */}
        <div id="tablet-display" class="md:col-span-7 flex flex-col space-y-4">
          
          <div class="flex items-center justify-between px-2">
            <h3 class="text-lg font-black text-slate-800 flex items-center space-x-2">
              <Award class="w-5 h-5 text-[#4CAF50]" />
              <span>🎮 数学探险大平版电脑</span>
            </h3>
            <span class="text-xs text-slate-400 font-bold flex items-center">
              已选关卡: <span class="text-orange-500 font-extrabold ml-1">{activeLesson.id}</span>
            </span>
          </div>

          {/* Simulated Tablet Container */}
          <div class="bg-slate-900 rounded-3xl p-3 md:p-5 shadow-xl border-t-8 border-slate-700/80 relative">
            
            {/* Camera dot inside border */}
            <div class="absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-slate-600 z-10"></div>
            
            {/* Tablet screen wrapper */}
            <div class="bg-gradient-to-b from-sky-50 to-amber-50 rounded-2xl overflow-hidden flex flex-col min-h-[500px] border border-slate-800 relative">
              
              {/* ADDRESS BAR / TAB HEADER */}
              <div class="bg-slate-200/90 border-b border-slate-300 p-2.5 flex items-center justify-between gap-2">
                {/* Browser buttons */}
                <div class="flex space-x-1.5 pl-1 shrink-0">
                  <div class="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <div class="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                  <div class="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                </div>

                {/* Simulated Address Bar showing virtual html paths requested by the user */}
                <div class="bg-white/80 border border-slate-300/80 rounded-lg px-3 py-1 flex items-center justify-between text-[11px] text-slate-500 font-bold flex-grow max-w-sm truncate select-none">
                  <div class="flex items-center space-x-1 truncate">
                    <span class="text-amber-500">🌐</span>
                    <span class="truncate font-mono">./knowledge/{activeModule.title}-{activeLesson.title}.html</span>
                  </div>
                  <span class="text-[9px] bg-slate-100 text-slate-400 px-1 py-0.5 rounded ml-1 scale-90">HTML5 Game</span>
                </div>

                {/* Refresh indicator */}
                <button 
                  onClick={() => {
                    const iframe = document.getElementById('lesson-game-iframe') as HTMLIFrameElement;
                    if (iframe) iframe.src = iframe.src;
                  }}
                  class="p-1 hover:bg-slate-300 rounded text-slate-500 transition-all shrink-0 active:scale-90"
                  title="重新加载当前游戏"
                >
                  <RotateCcw class="w-3.5 h-3.5" />
                </button>
              </div>

              {/* ACTIVE LESSON BANNER HEADER */}
              <div class="bg-[#FFF9C4]/40 border-b border-[#FFF9C4]/80 p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left select-none">
                <div class="flex items-center space-x-3.5">
                  <div class="text-4xl filter drop-shadow-sm floating-item">{activeLesson.emoji}</div>
                  <div>
                    <div class="flex items-center justify-center md:justify-start space-x-1.5">
                      <span class="text-[10px] bg-amber-200 text-amber-900 font-black px-1.5 py-0.5 rounded">一年级上册</span>
                      <span class="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">一年级标准</span>
                    </div>
                    <h4 class="text-base font-extrabold text-slate-800 mt-1">
                      {activeLesson.title}
                    </h4>
                    <p class="text-xs text-slate-400 mt-0.5">
                      {activeLesson.description}
                    </p>
                  </div>
                </div>

                <div class="flex items-center space-x-2 shrink-0">
                  {/* Manual trigger checkbox indicator */}
                  <span class="text-xs text-slate-400 font-medium">状态:</span>
                  <button 
                    onClick={() => toggleLessonStatus(activeLesson.id)}
                    class={`px-3 py-1.5 rounded-full text-xs font-black shadow-sm transition-all border flex items-center space-x-1 ${
                      completedLessons[activeLesson.id]
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : "bg-amber-100 text-amber-900 border-amber-300"
                    }`}
                  >
                    <span>{completedLessons[activeLesson.id] ? "🌟 已点亮" : "🎯 未点亮"}</span>
                  </button>
                </div>
              </div>

              {/* IFRAME / GAME LAUNCHER VIEWPORT */}
              <div class="flex-grow flex flex-col relative bg-gradient-to-br from-[#FFFDE7]/20 to-[#E3F2FD]/20">
                {showIframe ? (
                  <iframe 
                    id="lesson-game-iframe"
                    src={`./knowledge/game-runner.html?id=${activeLesson.id}&type=${activeLesson.gameType}&data=${encodeURIComponent(JSON.stringify(activeLesson.gameData))}`}
                    class="w-full h-full flex-grow border-0 min-h-[460px] rounded-b-2xl bg-transparent"
                    sandbox="allow-scripts allow-same-origin"
                  ></iframe>
                ) : (
                  <div class="flex-grow flex flex-col items-center justify-center text-center p-8 min-h-[460px]">
                    <div class="text-8xl mb-4 floating-item select-none">🗺️</div>
                    <h5 class="text-xl font-black text-amber-900">数学探险小岛等待你！</h5>
                    <p class="text-xs text-slate-400 max-w-sm mt-2 mb-6">
                      小朋友们排好队！点击左侧目录中任何一个你最喜欢的知识点，大屏幕上就能立刻传送去好玩的数学小游戏地图哦！
                    </p>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startFirstUnfinished}
                      class="px-8 py-3.5 bg-gradient-to-r from-orange-400 to-amber-500 text-white font-extrabold text-base rounded-2xl shadow-md border-b-4 border-amber-700 transition-all flex items-center space-x-2"
                    >
                      <span>开启第一个关卡</span>
                      <ArrowRight class="w-5 h-5" />
                    </motion.button>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ⭐ 星光错题集 ⭐ */}
          <div class="bg-rose-50/50 rounded-3xl p-5 border-4 border-dashed border-rose-200/60 shadow-sm flex flex-col space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <span class="text-2xl">📔</span>
                <h4 class="text-base font-black text-rose-900">聪聪星光错题本</h4>
              </div>
              <span class="text-[10px] font-extrabold bg-rose-100 text-rose-800 px-2.5 py-1 rounded-full border border-rose-200">
                已收集 {mistakes.length} 道错题
              </span>
            </div>

            {mistakes.length === 0 ? (
              <div class="bg-white/80 rounded-2xl p-6 text-center border border-rose-100/50 select-none">
                <span class="text-4xl filter drop-shadow-sm block mb-2">🎉</span>
                <h5 class="text-xs font-bold text-slate-700">现在没有错题记录哟！</h5>
                <p class="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  宝贝太厉害啦，闯关全对或者还没有遇到错题哦。继续去小岛探险并获得更多小红花吧！
                </p>
              </div>
            ) : (
              <div class="space-y-3">
                <p class="text-[11px] text-rose-700 font-medium">
                  💡 做错的题目会自动落在这里。点击下面的错题可进行<b>原题复练</b>或<b>举一反三</b>，通关即可消灭错题哦！
                </p>

                {/* List of active mistakes */}
                <div class="max-h-[220px] overflow-y-auto space-y-2.5 pr-1">
                  {mistakes.map(item => (
                    <div 
                      key={item.id}
                      class="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-left transition-all hover:border-rose-300"
                    >
                      <div class="space-y-1">
                        <div class="flex items-center space-x-1.5">
                          <span class="text-[9px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">
                            {item.lessonTitle}
                          </span>
                          <span class="text-[9px] text-slate-400 font-mono">
                            {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <h5 class="text-xs font-bold text-slate-700">
                          {item.questionText}
                        </h5>
                        <div class="text-[10px] flex items-center space-x-3 mt-1">
                          <span class="text-rose-500 font-semibold">❌ 你的回答: {item.userAnswer}</span>
                          <span class="text-emerald-600 font-semibold">✨ 正确答案: {item.answer}</span>
                        </div>
                      </div>

                      <div class="flex items-center space-x-2 shrink-0 self-end md:self-auto">
                        <button 
                          onClick={() => handleReviewMistake(item, 'retry')}
                          class="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-black rounded-xl border border-amber-300 transition-all active:scale-95 flex items-center space-x-1 cursor-pointer"
                        >
                          <span>✏️ 错题重做</span>
                        </button>
                        <button 
                          onClick={() => handleReviewMistake(item, 'analogy')}
                          class="px-2.5 py-1.5 bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white text-[10px] font-black rounded-xl border-b-2 border-amber-700 shadow-sm transition-all active:scale-95 flex items-center space-x-1 cursor-pointer"
                        >
                          <span>🚀 举一反三</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteMistake(item.id)}
                          class="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                          title="删除错题"
                        >
                          <X class="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div class="pt-1 flex justify-end">
                  <button 
                    onClick={() => {
                      if (window.confirm("确定要清空所有的错题集吗？")) {
                        setMistakes([]);
                      }
                    }}
                    class="text-[10px] text-slate-400 hover:text-rose-500 font-bold transition-all cursor-pointer"
                  >
                    🗑️ 清空所有错题
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Instructions and tips box */}
          <div class="bg-amber-50 rounded-2xl p-4 border border-amber-200/50 flex items-start space-x-3 text-left shadow-sm">
            <span class="text-xl filter drop-shadow-sm select-none">💡</span>
            <div class="space-y-1">
              <h5 class="text-xs font-bold text-amber-900">一年级提前学探险攻略：</h5>
              <p class="text-[11px] text-slate-500 leading-relaxed">
                1. <b>全书总进度</b> 达到 100% 即可获得一年级数学荣誉勋章 🎖️。
                <br />
                2. 小游戏闯关时，答对 3 道题即可点亮星星，并自动传送回 parent 进度盘！
                <br />
                3. 如果某个关卡太难，可以点击“跳过此关”或直接点击上方的“已完成/未完成”徽章手动更改进度。
              </p>
            </div>
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer id="main-footer" class="bg-white border-t-4 border-dashed border-[#FFE0B2] py-6 px-4 text-center mt-12 select-none">
        <div class="max-w-xl mx-auto space-y-2">
          <div class="flex justify-center space-x-4 text-2xl">
            <span>🐿️</span>
            <span>🦊</span>
            <span>🐼</span>
            <span>🐱</span>
            <span>🦁</span>
            <span>🐨</span>
          </div>
          <p class="text-xs text-slate-400 font-medium">
            © 2026-2027 一年级数学提前学 · 幼儿提前学早教系统
          </p>
          <p class="text-[10px] text-slate-400/80">
            专为幼小衔接、学前/幼儿园适龄幼儿定制，符合教育部《义务教育数学课程标准（2022年版）》精神
          </p>
        </div>
      </footer>

      {/* 🎒 INTERACTIVE REVIEW MODAL (错题消消乐 & 举一反三) */}
      <AnimatePresence>
        {reviewItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              class="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border-4 border-[#FFA726] flex flex-col relative"
            >
              {/* Cute top orange ribbon header */}
              <div class="bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-4 flex items-center justify-between text-white border-b-4 border-orange-600/20">
                <div class="flex items-center space-x-2">
                  <span class="text-2xl">🎒</span>
                  <div class="text-left">
                    <h4 class="text-lg font-black tracking-wide">
                      {reviewMode === 'retry' ? "聪聪星光错题重做" : "聪聪智能举一反三"}
                    </h4>
                    <p class="text-[10px] text-amber-50 font-bold">
                      {reviewMode === 'retry' ? "重新挑战这道做错的小题目吧！" : "挑战一道同类型的全新小魔法题！"}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setReviewItem(null)}
                  class="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                >
                  <X class="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Modal scroll content */}
              <div class="p-6 overflow-y-auto max-h-[75vh] flex flex-col items-center space-y-6">
                
                {/* Mode description badge */}
                <span class={`px-3 py-1 rounded-full text-xs font-extrabold shadow-sm ${
                  reviewMode === 'retry' ? "bg-amber-100 text-amber-800 border border-amber-300" : "bg-purple-100 text-purple-800 border border-purple-200"
                }`}>
                  {reviewMode === 'retry' ? "✏️ 原题复练" : "🚀 魔法举一反三"}
                </span>

                {/* Question Details Wrapper */}
                <div class="w-full bg-slate-50 border border-slate-200/60 rounded-3xl p-5 flex flex-col items-center text-center">
                  <div class="text-xs bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded mb-3">
                    所属关卡：{reviewItem.lessonTitle}
                  </div>
                  <h3 class="text-base font-extrabold text-slate-800 leading-relaxed mb-4">
                    {reviewMode === 'retry' ? reviewItem.questionText : reviewAnalogyData?.questionText}
                  </h3>

                  {/* Render Visual Question Elements */}
                  {/* TYPE: COUNT */}
                  {((reviewMode === 'retry' ? reviewItem.gameType : reviewAnalogyData?.type) === 'count') && (
                    <div class="flex flex-wrap items-center justify-center gap-3 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 max-w-xs w-full min-h-[100px]">
                      {Array.from({ length: Number(reviewMode === 'retry' ? reviewItem.answer : reviewAnalogyData?.answer) }).map((_, i) => (
                        <span key={i} class="text-3xl filter drop-shadow-sm select-none animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                          {reviewMode === 'retry' ? reviewItem.questionData.itemEmoji : reviewAnalogyData?.itemEmoji}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* TYPE: COMPARE */}
                  {((reviewMode === 'retry' ? reviewItem.gameType : reviewAnalogyData?.type) === 'compare') && (
                    <div class="flex items-center justify-center gap-3 w-full">
                      {/* Left */}
                      <div class="bg-green-50/50 rounded-2xl p-3 border border-green-200 flex flex-wrap gap-1.5 justify-center items-center max-w-[100px] aspect-square">
                        {Array.from({ length: Number(reviewMode === 'retry' ? reviewItem.questionData.numLeft : reviewAnalogyData?.numLeft) }).map((_, i) => (
                          <span key={i} class="text-lg filter drop-shadow-sm">
                            {reviewMode === 'retry' ? reviewItem.questionData.emojiLeft : reviewAnalogyData?.emojiLeft}
                          </span>
                        ))}
                      </div>
                      
                      {/* Middle Operator Box */}
                      <div class="w-12 h-12 bg-amber-100 text-amber-800 border-2 border-amber-300 rounded-xl flex items-center justify-center text-xl font-black">
                        {reviewUserAnswer ? reviewUserAnswer : "?"}
                      </div>

                      {/* Right */}
                      <div class="bg-blue-50/50 rounded-2xl p-3 border border-blue-200 flex flex-wrap gap-1.5 justify-center items-center max-w-[100px] aspect-square">
                        {Array.from({ length: Number(reviewMode === 'retry' ? reviewItem.questionData.numRight : reviewAnalogyData?.numRight) }).map((_, i) => (
                          <span key={i} class="text-lg filter drop-shadow-sm">
                            {reviewMode === 'retry' ? reviewItem.questionData.emojiRight : reviewAnalogyData?.emojiRight}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TYPE: SPLIT */}
                  {((reviewMode === 'retry' ? reviewItem.gameType : reviewAnalogyData?.type) === 'split') && (
                    <div class="flex flex-col items-center justify-center relative w-full max-w-[200px] p-4 bg-amber-50/30 rounded-2xl border border-amber-200">
                      {/* Top bubble */}
                      <div class="w-12 h-12 bg-amber-200 text-amber-800 border-3 border-amber-400 rounded-full text-xl font-extrabold flex items-center justify-center shadow-sm mb-6">
                        {reviewMode === 'retry' ? reviewItem.questionData.total : reviewAnalogyData?.total}
                      </div>
                      
                      {/* Left and Right Bubble */}
                      <div class="flex justify-between w-full px-2">
                        <div class="w-10 h-10 bg-white text-slate-800 border-2 border-amber-300 rounded-full text-base font-bold flex items-center justify-center shadow-sm">
                          {reviewMode === 'retry' ? reviewItem.questionData.numLeft : reviewAnalogyData?.numLeft}
                        </div>
                        <div class="w-10 h-10 bg-amber-100 text-amber-700 border-2 border-dashed border-amber-400 rounded-full text-base font-bold flex items-center justify-center shadow-sm animate-bounce">
                          {reviewUserAnswer ? reviewUserAnswer : "?"}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TYPE: SHAPE */}
                  {((reviewMode === 'retry' ? reviewItem.gameType : reviewAnalogyData?.type) === 'shape') && (
                    <div class="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-200 rounded-2xl flex items-center justify-center border border-amber-200 shadow-inner select-none animate-pulse">
                      <span class="text-5xl filter drop-shadow-md">
                        {reviewMode === 'retry' ? (reviewItem.questionData.icon || '📦') : reviewAnalogyData?.icon}
                      </span>
                    </div>
                  )}

                  {/* TYPE: MATH */}
                  {((reviewMode === 'retry' ? reviewItem.gameType : reviewAnalogyData?.type) === 'math') && (
                    <div class="text-3xl font-black text-slate-800 tracking-wider bg-yellow-50/50 px-6 py-3 rounded-2xl border border-yellow-200">
                      {reviewMode === 'retry' ? (
                        `${reviewItem.questionData.num1} ${reviewItem.questionData.op} ${reviewItem.questionData.num2} = ${reviewUserAnswer ? reviewUserAnswer : '?'}`
                      ) : (
                        `${reviewAnalogyData?.num1} ${reviewAnalogyData?.op} ${reviewAnalogyData?.num2} = ${reviewUserAnswer ? reviewUserAnswer : '?'}`
                      )}
                    </div>
                  )}

                </div>

                {/* ANSWER BUTTONS SECTION */}
                {!reviewIsCorrect ? (
                  <div class="w-full flex flex-col items-center space-y-4">
                    <p class="text-xs text-slate-400 font-bold">请选出正确答案：</p>
                    <div class="flex flex-wrap items-center justify-center gap-3 max-w-md">
                      
                      {/* COUNT/SPLIT/MATH option buttons */}
                      {['count', 'split', 'math'].includes(reviewMode === 'retry' ? reviewItem.gameType : (reviewAnalogyData?.type || '')) && (() => {
                        const ansVal = Number(reviewMode === 'retry' ? reviewItem.answer : reviewAnalogyData?.answer);
                        // Generate safe options around the correct answer
                        const list = Array.from(new Set([ansVal, ansVal - 1, ansVal + 1, ansVal - 2, ansVal + 2]))
                          .filter(v => v >= 0)
                          .sort((a, b) => a - b);
                        
                        return list.map(opt => (
                          <button 
                            key={opt}
                            onClick={() => checkReviewAnswer(opt)}
                            class={`w-12 h-12 text-lg font-bold border-2 rounded-xl flex items-center justify-center shadow-sm transition-all active:scale-95 cursor-pointer ${
                              reviewUserAnswer === opt
                                ? "bg-rose-50 border-rose-300 text-rose-700"
                                : "bg-[#E3F2FD] hover:bg-sky-200 text-sky-800 border-sky-300"
                            }`}
                          >
                            {opt}
                          </button>
                        ));
                      })()}

                      {/* COMPARE option buttons */}
                      {((reviewMode === 'retry' ? reviewItem.gameType : reviewAnalogyData?.type) === 'compare') && (
                        ['<', '=', '>'].map(opt => (
                          <button 
                            key={opt}
                            onClick={() => checkReviewAnswer(opt)}
                            class={`w-14 h-12 text-xl font-bold border-2 rounded-xl flex items-center justify-center shadow-sm transition-all active:scale-95 cursor-pointer ${
                              reviewUserAnswer === opt
                                ? "bg-rose-50 border-rose-300 text-rose-700"
                                : "bg-[#E3F2FD] hover:bg-sky-200 text-sky-800 border-sky-300"
                            }`}
                          >
                            {opt}
                          </button>
                        ))
                      )}

                      {/* SHAPE option buttons */}
                      {((reviewMode === 'retry' ? reviewItem.gameType : reviewAnalogyData?.type) === 'shape') && (
                        ['长方体', '正方体', '圆柱', '球'].map(opt => (
                          <button 
                            key={opt}
                            onClick={() => checkReviewAnswer(opt)}
                            class={`px-4 py-2 text-sm font-bold border-2 rounded-xl flex items-center justify-center shadow-sm transition-all active:scale-95 cursor-pointer ${
                              reviewUserAnswer === opt
                                ? "bg-rose-50 border-rose-300 text-rose-700"
                                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
                            }`}
                          >
                            {opt}
                          </button>
                        ))
                      )}

                    </div>

                    {/* Temporary feedback feedback message (e.g. incorrect) */}
                    {reviewFeedbackMsg && (
                      <p class="text-xs font-bold text-rose-600 animate-bounce">{reviewFeedbackMsg}</p>
                    )}

                  </div>
                ) : (
                  // SUCCESS COMPLETED STATE
                  <div class="w-full flex flex-col items-center space-y-4 text-center select-none">
                    <span class="text-5xl animate-bounce">👑</span>
                    <h4 class="text-base font-black text-emerald-600">{reviewFeedbackMsg}</h4>
                    
                    {/* Cute Teacher Congcong Explanation box */}
                    <div class="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 max-w-sm text-left">
                      <p class="text-xs font-extrabold text-emerald-900 mb-1">💡 聪聪小老师悄悄话：</p>
                      <p class="text-xs text-slate-600 leading-relaxed">
                        {reviewMode === 'retry' ? reviewItem.explanation : reviewAnalogyData?.explanation}
                      </p>
                    </div>

                    {/* Trigger Success Action */}
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleResolveMistake}
                      class="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold rounded-2xl shadow-md border-b-4 border-emerald-700 transition-all flex items-center space-x-2 cursor-pointer"
                    >
                      <span>✨ 错题消灭！(回到错题本)</span>
                    </motion.button>
                  </div>
                )}

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
