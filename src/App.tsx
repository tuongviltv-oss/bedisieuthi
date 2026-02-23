import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  ShoppingCart, 
  Timer, 
  Trophy, 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  RotateCcw, 
  Lightbulb,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  X,
  Lock
} from 'lucide-react';
import { QUESTIONS, Question, COSMETICS, Cosmetic } from './constants';
import { audioService } from './services/audioService';

type GameState = 'START' | 'PLAYING' | 'END' | 'INVENTORY';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [collectedItems, setCollectedItems] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);
  const [flyingItem, setFlyingItem] = useState<string | null>(null);
  const [newlyUnlockedItem, setNewlyUnlockedItem] = useState<Cosmetic | null>(null);

  // Cosmetic State
  const [unlockedCosmetics, setUnlockedCosmetics] = useState<string[]>([]);
  const [equippedHat, setEquippedHat] = useState<string | null>(null);
  const [equippedCart, setEquippedCart] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = QUESTIONS[currentQuestionIndex];

  // Load cosmetics from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('be-di-sieu-thi-cosmetics');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setUnlockedCosmetics(data.unlocked || []);
        setEquippedHat(data.equippedHat || null);
        setEquippedCart(data.equippedCart || null);
      } catch (e) {
        console.error("Failed to load cosmetics", e);
      }
    }
  }, []);

  // Save cosmetics to localStorage
  useEffect(() => {
    localStorage.setItem('be-di-sieu-thi-cosmetics', JSON.stringify({
      unlocked: unlockedCosmetics,
      equippedHat,
      equippedCart
    }));
  }, [unlockedCosmetics, equippedHat, equippedCart]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(20);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleWrongAnswer();
          return 0;
        }
        if (prev <= 4) {
          audioService.playTick();
        }
        return prev - 1;
      });
    }, 1000);
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (gameState === 'PLAYING') {
      startTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentQuestionIndex, startTimer]);

  const handleStartGame = () => {
    if (!name.trim()) return;
    setGameState('PLAYING');
    audioService.startBGM();
  };

  const handleMuteToggle = () => {
    const newMute = !isMuted;
    setIsMuted(newMute);
    audioService.setMute(newMute);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD93D', '#FF8400', '#4ADE80', '#F472B6', '#60A5FA']
    });
  };

  const checkUnlocks = (currentScore: number, itemsCount: number) => {
    const newUnlocks: string[] = [...unlockedCosmetics];
    let unlockedAny = false;
    let latestUnlocked: Cosmetic | null = null;

    const tryUnlock = (id: string) => {
      if (!newUnlocks.includes(id)) {
        newUnlocks.push(id);
        unlockedAny = true;
        latestUnlocked = COSMETICS.find(c => c.id === id) || null;
      }
    };

    if (currentScore >= 20) tryUnlock('glasses');
    if (currentScore >= 25) tryUnlock('dots');
    if (currentScore >= 30) tryUnlock('cap');
    if (currentScore >= 35) tryUnlock('ribbon');
    if (currentScore >= 40) tryUnlock('stripes');
    if (currentScore >= 45) tryUnlock('rainbow');
    if (currentScore >= 50) tryUnlock('crown');
    if (itemsCount >= 5) tryUnlock('golden');

    if (unlockedAny) {
      setUnlockedCosmetics(newUnlocks);
      if (latestUnlocked) {
        setNewlyUnlockedItem(latestUnlocked);
        audioService.playFanfare();
        triggerConfetti();
      }
    }
  };

  const handleCorrectAnswer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const pointsToAdd = attempts === 0 ? 10 : 5;
    const newScore = score + pointsToAdd;
    const newItems = [...collectedItems, currentQuestion.reward];
    
    setScore(newScore);
    setFeedback('CORRECT');
    audioService.playSuccess();
    triggerConfetti();
    
    setFlyingItem(currentQuestion.reward);
    
    setTimeout(() => {
      setCollectedItems(newItems);
      setFlyingItem(null);
      setFeedback(null);
      
      checkUnlocks(newScore, newItems.length);

      if (currentQuestionIndex < QUESTIONS.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setAttempts(0);
        setShowHint(false);
      } else {
        handleEndGame();
      }
    }, 1500);
  };

  const handleWrongAnswer = () => {
    audioService.playFailure();
    setFeedback('WRONG');
    setIsShaking(true);
    
    setTimeout(() => {
      setIsShaking(false);
      setFeedback(null);
      
      setAttempts(prev => prev + 1);
      setShowHint(true);
      startTimer(); // Restart timer for next attempt
    }, 1000);
  };

  const handleOptionClick = (option: string) => {
    if (feedback) return;
    audioService.playTing();
    if (option === currentQuestion.correctAnswer) {
      handleCorrectAnswer();
    } else {
      handleWrongAnswer();
    }
  };

  const handleEndGame = () => {
    setGameState('END');
    if (timerRef.current) clearInterval(timerRef.current);
    if (score >= 50 || collectedItems.length === 5) {
      audioService.playVictory();
      triggerConfetti();
    }
  };

  const handleRestart = () => {
    if (window.confirm('Bé có muốn chơi lại từ đầu không?')) {
      handlePlayAgain();
    }
  };

  const handlePlayAgain = () => {
    setGameState('START');
    setCurrentQuestionIndex(0);
    setScore(0);
    setCollectedItems([]);
    setAttempts(0);
    setShowHint(false);
    setName('');
    setClassName('');
  };

  const getTitle = () => {
    if (score >= 50) return { text: "👑 Siêu khách hàng vàng", color: "text-yellow-500" };
    if (score >= 30) return { text: "🌟 Người mua hàng thông minh", color: "text-orange-500" };
    return { text: "💪 Cố gắng thêm nhé", color: "text-stone-500" };
  };

  const toggleEquip = (item: Cosmetic) => {
    if (!unlockedCosmetics.includes(item.id)) return;
    audioService.playTing();
    if (item.type === 'HAT') {
      setEquippedHat(equippedHat === item.id ? null : item.id);
    } else {
      setEquippedCart(equippedCart === item.id ? null : item.id);
    }
  };

  const getHatIcon = () => {
    const hat = COSMETICS.find(c => c.id === equippedHat);
    return hat ? hat.icon : null;
  };

  const getCartClass = () => {
    if (equippedCart === 'stripes') return 'cart-pattern-stripes';
    if (equippedCart === 'dots') return 'cart-pattern-dots';
    if (equippedCart === 'rainbow') return 'cart-pattern-rainbow';
    if (equippedCart === 'golden') return 'cart-pattern-golden';
    return '';
  };

  return (
    <div className={`h-screen supermarket-bg flex flex-col items-center justify-center p-2 sm:p-4 relative ${isShaking ? 'animate-shake' : ''}`}>
      {/* Audio Toggle */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex gap-2 z-50">
        {gameState === 'PLAYING' && (
          <button 
            onClick={handleRestart}
            className="p-2 sm:p-3 bg-white rounded-full shadow-lg hover:bg-stone-100 transition-colors flex items-center gap-2 text-primary-orange font-bold text-xs sm:text-sm"
          >
            <RotateCcw size={18} /> <span className="hidden sm:inline">CHƠI LẠI</span>
          </button>
        )}
        {gameState === 'START' && (
          <button 
            onClick={() => setGameState('INVENTORY')}
            className="p-2 sm:p-3 bg-white rounded-full shadow-lg hover:bg-stone-100 transition-colors"
          >
            <ShoppingBag className="text-primary-pink" size={20} />
          </button>
        )}
        <button 
          onClick={handleMuteToggle}
          className="p-2 sm:p-3 bg-white rounded-full shadow-lg hover:bg-stone-100 transition-colors"
        >
          {isMuted ? <VolumeX className="text-stone-400" size={20} /> : <Volume2 className="text-primary-orange" size={20} />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {newlyUnlockedItem && (
          <motion.div
            key="unlock-celebration"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center border-4 border-primary-yellow shadow-2xl relative overflow-hidden">
              {/* Sparkle background elements */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 animate-pulse text-yellow-400">✨</div>
                <div className="absolute bottom-4 right-4 animate-pulse text-yellow-400 delay-75">✨</div>
                <div className="absolute top-1/2 left-8 animate-pulse text-yellow-400 delay-150">✨</div>
                <div className="absolute top-1/4 right-8 animate-pulse text-yellow-400 delay-300">✨</div>
              </div>

              <h2 className="text-2xl font-black text-primary-orange mb-2">QUÀ TẶNG MỚI! 🎁</h2>
              <p className="text-stone-500 mb-6 font-medium">Bé đã mở khóa được một món đồ mới!</p>
              
              <div className="bg-stone-50 w-24 h-24 rounded-2xl flex items-center justify-center text-6xl mx-auto mb-6 border-2 border-stone-100 shadow-inner">
                {newlyUnlockedItem.icon}
              </div>
              
              <h3 className="text-xl font-bold text-stone-700 mb-1">{newlyUnlockedItem.name}</h3>
              <p className="text-sm text-stone-400 mb-8 italic">"{newlyUnlockedItem.requirement}"</p>
              
              <button
                onClick={() => setNewlyUnlockedItem(null)}
                className="w-full bg-primary-orange text-white py-4 rounded-2xl text-lg font-bold shadow-lg hover:bg-orange-600 transition-all"
              >
                TUYỆT VỜI!
              </button>
            </div>
          </motion.div>
        )}

        {gameState === 'START' && (
          <motion.div 
            key="start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center border-4 border-primary-yellow"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-primary-orange mb-2">🌟 BÉ ĐI SIÊU THỊ 🌟</h1>
            <p className="text-stone-500 mb-6 text-sm sm:text-base">Chào mừng bé đến với siêu thị vui nhộn!</p>
            
            <div className="space-y-3 mb-6">
              <div className="text-left">
                <label className="block text-xs font-semibold text-stone-600 mb-1 ml-1">Họ và tên của bé</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên bé..."
                  className="w-full px-4 py-2 rounded-xl border-2 border-stone-200 focus:border-primary-orange outline-none transition-all text-base"
                />
              </div>
              <div className="text-left">
                <label className="block text-xs font-semibold text-stone-600 mb-1 ml-1">Lớp</label>
                <input 
                  type="text" 
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Nhập lớp (ví dụ: 2A)..."
                  className="w-full px-4 py-2 rounded-xl border-2 border-stone-200 focus:border-primary-orange outline-none transition-all text-base"
                />
              </div>
            </div>

            <button 
              onClick={handleStartGame}
              disabled={!name.trim()}
              className="w-full bg-primary-orange text-white py-3 rounded-2xl text-lg font-bold shadow-lg hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              BẮT ĐẦU CHƠI <ArrowRight size={20} />
            </button>
          </motion.div>
        )}

        {gameState === 'INVENTORY' && (
          <motion.div 
            key="inventory"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white p-6 rounded-3xl shadow-2xl max-w-lg w-full border-4 border-primary-pink max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-primary-pink flex items-center gap-2">
                <ShoppingBag /> TỦ ĐỒ CỦA BÉ
              </h2>
              <button 
                onClick={() => setGameState('START')}
                className="p-1 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X size={24} className="text-stone-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {COSMETICS.map((item) => {
                const isUnlocked = unlockedCosmetics.includes(item.id);
                const isEquipped = equippedHat === item.id || equippedCart === item.id;
                
                return (
                  <div 
                    key={item.id}
                    onClick={() => toggleEquip(item)}
                    className={`inventory-item ${!isUnlocked ? 'locked' : 'unlocked'} ${isEquipped ? 'equipped' : ''}`}
                  >
                    <div className="text-3xl mb-1">
                      {isUnlocked ? item.icon : <Lock className="text-stone-300" size={24} />}
                    </div>
                    <p className="text-xs font-bold text-stone-700">{item.name}</p>
                    <p className="text-[9px] text-stone-400 text-center leading-tight">
                      {isUnlocked ? (isEquipped ? 'Đang dùng' : 'Sẵn sàng') : item.requirement}
                    </p>
                  </div>
                );
              })}
            </div>

            <p className="text-center text-stone-400 text-xs italic">
              * Chơi game và đạt điểm cao để mở khóa thêm nhiều đồ mới nhé!
            </p>
          </motion.div>
        )}

        {gameState === 'PLAYING' && (
          <motion.div 
            key="playing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-5xl flex flex-col gap-3 sm:gap-4 max-h-full overflow-y-auto"
          >
            {/* Header Stats */}
            <div className="flex justify-between items-center bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-sm border-b-4 border-primary-yellow">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-primary-yellow p-1.5 rounded-lg">
                  <Trophy className="text-white" size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Điểm</p>
                  <p className="text-lg font-bold text-primary-orange">{score}</p>
                </div>
              </div>

              <div className="flex-1 max-w-[150px] sm:max-w-xs mx-4">
                <div className="flex justify-between text-[10px] font-bold text-stone-500 mb-1">
                  <span>TIẾN TRÌNH</span>
                  <span>{currentQuestionIndex + 1}/5</span>
                </div>
                <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary-green"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentQuestionIndex + 1) / 5) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`p-1.5 rounded-lg transition-colors ${timeLeft <= 5 ? 'bg-red-500 animate-pulse' : 'bg-primary-orange'}`}>
                  <Timer className="text-white" size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Thời gian</p>
                  <p className={`text-lg font-bold ${timeLeft <= 5 ? 'text-red-500' : 'text-primary-orange'}`}>{timeLeft}s</p>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Question Card */}
              <div className="lg:col-span-3 space-y-3 sm:space-y-4">
                <div className="bg-white p-5 sm:p-6 rounded-3xl shadow-lg border-4 border-primary-yellow relative overflow-hidden min-h-[150px] sm:min-h-[200px] flex flex-col justify-center">
                  {feedback === 'CORRECT' && (
                    <motion.div 
                      initial={{ scale: 0 }} 
                      animate={{ scale: 1 }} 
                      className="absolute inset-0 bg-primary-green/20 flex items-center justify-center z-10"
                    >
                      <CheckCircle2 size={80} className="text-primary-green" />
                    </motion.div>
                  )}
                  {feedback === 'WRONG' && (
                    <motion.div 
                      initial={{ scale: 0, rotate: -20 }} 
                      animate={{ scale: 1, rotate: 0 }} 
                      className="absolute inset-0 bg-red-500/10 flex flex-col items-center justify-center z-10"
                    >
                      <span className="text-8xl mb-2">🐰</span>
                      <p className="text-red-500 font-black text-xl">Bé thử lại nhé!</p>
                    </motion.div>
                  )}

                  <h2 className="text-lg sm:text-xl font-bold text-stone-700 leading-snug">
                    {currentQuestion.text}
                  </h2>
                  
                  {showHint && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 p-3 bg-yellow-50 border-2 border-dashed border-primary-yellow rounded-xl flex items-start gap-2"
                    >
                      <Lightbulb className="text-primary-yellow shrink-0 mt-0.5" size={16} />
                      <p className="text-xs text-stone-600 italic font-medium">Gợi ý: {currentQuestion.hint}</p>
                    </motion.div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {currentQuestion.options.map((option, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleOptionClick(option)}
                      className={`py-4 px-3 rounded-2xl text-lg sm:text-xl font-bold shadow-sm transition-all border-b-4 
                        ${feedback === 'CORRECT' && option === currentQuestion.correctAnswer ? 'bg-primary-green text-white border-green-700' : 
                          feedback === 'WRONG' && option !== currentQuestion.correctAnswer ? 'bg-white text-stone-700 border-stone-200' :
                          'bg-white text-stone-700 border-stone-200 hover:border-primary-orange hover:text-primary-orange'}`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Character & Cart */}
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-3xl shadow-lg border-4 border-primary-pink flex flex-col flex-1 relative overflow-hidden">
                  <div className="flex items-center gap-4 mb-4">
                    {/* Character in circle */}
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-primary-pink bg-pink-50 overflow-hidden shadow-md flex items-center justify-center relative">
                        <img 
                          src="https://api.dicebear.com/7.x/fun-emoji/svg?seed=Baby" 
                          alt="Cartoon Baby" 
                          className="w-full h-full object-cover"
                        />
                        {getHatIcon() && (
                          <motion.div 
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="absolute -top-2 left-1/2 -translate-x-1/2 text-3xl sm:text-4xl drop-shadow-md z-10"
                          >
                            {getHatIcon()}
                          </motion.div>
                        )}
                      </div>
                    </div>

                    {/* Cart Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-primary-pink mb-1">
                        <ShoppingCart size={20} />
                        <span className="font-bold text-sm uppercase tracking-wider">GIỎ HÀNG</span>
                      </div>
                      <p className="text-[10px] text-stone-400 font-medium">Bé đã mua được {collectedItems.length}/5 món</p>
                    </div>
                  </div>
                  
                  {/* Cart Slots Area */}
                  <div className={`p-3 rounded-2xl border-2 border-primary-pink/20 flex-1 flex flex-col justify-center ${getCartClass()}`}>
                    <div className="grid grid-cols-5 gap-2 w-full">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="cart-slot">
                          {collectedItems[i] || ''}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Flying Item Animation */}
                  <AnimatePresence>
                    {flyingItem && (
                      <motion.div
                        initial={{ scale: 1, x: -200, y: -100, rotate: 0 }}
                        animate={{ 
                          scale: [1, 2, 1], 
                          x: 0, 
                          y: 50, 
                          rotate: 360 
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                        className="absolute text-4xl sm:text-5xl z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      >
                        {flyingItem}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {gameState === 'END' && (
          <motion.div 
            key="end"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl max-w-lg w-full text-center border-4 border-primary-green max-h-[95vh] overflow-y-auto"
          >
            <div className="mb-4 flex justify-center">
              <div className="bg-primary-green/10 p-4 rounded-full">
                <Trophy size={60} className="text-primary-green" />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-stone-800 mb-1 leading-tight">CHÚC MỪNG BÉ!</h2>
            <p className="text-base text-stone-500 mb-6">Bé đã hoàn thành chuyến đi siêu thị rồi!</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-stone-50 p-4 rounded-2xl border-2 border-stone-100">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">BÉ & LỚP</p>
                <p className="text-lg font-bold text-stone-700 truncate">{name}</p>
                <p className="text-sm font-medium text-stone-500">{className}</p>
              </div>
              <div className="bg-stone-50 p-4 rounded-2xl border-2 border-stone-100">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">ĐIỂM</p>
                <p className="text-4xl font-black text-primary-orange">{score}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">DANH HIỆU</p>
              <p className={`text-xl font-bold ${getTitle().color}`}>{getTitle().text}</p>
            </div>

            <div className="mb-8">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">MÓN ĐỒ THU THẬP</p>
              <div className="flex justify-center gap-2">
                {collectedItems.map((item, i) => (
                  <div key={i} className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-yellow/20 rounded-xl flex items-center justify-center text-2xl border-2 border-primary-yellow">
                    {item}
                  </div>
                ))}
                {collectedItems.length === 0 && <p className="text-stone-400 text-xs italic">Chưa có món nào...</p>}
              </div>
            </div>

            <button 
              onClick={handlePlayAgain}
              className="w-full bg-primary-green text-white py-4 rounded-2xl text-xl font-bold shadow-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={24} /> CHƠI LẠI
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Branding */}
      <div className="absolute bottom-2 text-stone-400 text-[10px] font-medium">
        © 2024 Bé Đi Siêu Thị - Học Toán Vui Nhộn
      </div>
    </div>
  );
}
