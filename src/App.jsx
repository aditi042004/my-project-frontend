import React, { useState, useEffect, useRef } from 'react';

// --- THIS IS THE NEW BACKEND URL ---
const API_URL = 'https://my-project-backend-wqyy.onrender.com';

// --- Page Navigation ---
const PAGES = { HOME: 'Home', NLP_TOOL: 'Toolkit', GAME: 'Game', CHATBOT: 'Chatbot', PROGRESS: 'Dashboard' };
const PAGE_COMPONENTS = { 'Home': 'home', 'Toolkit': 'nlp_tool', 'Game': 'game', 'Chatbot': 'chatbot', 'Dashboard': 'progress', 'Daily Challenge': 'daily_challenge' };

// --- Reusable Spinner Component ---
const Spinner = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// --- Header Component ---
const Header = ({ currentPage, navigateTo }) => (
    <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 z-10">
        <nav className="flex items-center justify-between">
            <div className="flex items-center cursor-pointer" onClick={() => navigateTo('home')}>
                <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                    SolveBot AI
                </h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
                {Object.values(PAGES).map((page) => (
                    <button
                        key={page}
                        onClick={() => navigateTo(PAGE_COMPONENTS[page])}
                        className={`text-lg font-medium transition-colors duration-200 ${
                            currentPage === PAGE_COMPONENTS[page]
                                ? 'text-purple-400'
                                : 'text-gray-300 hover:text-purple-300'
                        }`}
                    >
                        {page}
                    </button>
                ))}
            </div>
        </nav>
        <hr className="border-t border-gray-700/50 mt-4" />
    </header>
);

// --- Footer Component ---
const Footer = () => (
    <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 z-10">
        <p className="text-center text-gray-500 text-sm">
            © 2025 SolveBot. Built with React & Gemini.
        </p>
    </footer>
);

// --- Animated Background ---
const AuroraBackground = () => (
    <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
        <div className="absolute top-[-20%] left-[5%] w-[500px] h-[500px] bg-purple-600/20 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-pink-500/15 rounded-full filter blur-3xl animate-blob animation-delay-2"></div>
    </div>
);

// --- Main App Component ---
export default function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [gameData, setGameData] = useState(null);
    const [progressData, setProgressData] = useState({});

    useEffect(() => {
        try {
            const savedProgress = localStorage.getItem('progressData');
            if (savedProgress) setProgressData(JSON.parse(savedProgress));
        } catch (error) { console.error("Failed to load progress data:", error); }
    }, []);

    const updateProgressData = (missedWordObject) => {
        setProgressData(currentProgress => {
            const newProgress = { ...currentProgress };
            const word = missedWordObject.word;
            if (!newProgress[word]) {
                newProgress[word] = { ...missedWordObject, missedCount: 1, lastMissed: new Date().toISOString() };
            } else {
                newProgress[word].missedCount += 1;
                newProgress[word].lastMissed = new Date().toISOString();
            }
            localStorage.setItem('progressData', JSON.stringify(newProgress));
            return newProgress;
        });
    };

    const clearProgressData = () => {
        setProgressData({});
        localStorage.removeItem('progressData');
    };

    const navigateTo = (page) => setCurrentPage(page);

    const renderPage = () => {
        switch (currentPage) {
            case 'nlp_tool': return <NlpToolPage setGameData={setGameData} navigateTo={navigateTo} gameReady={!!gameData} />;
            case 'game': return <MeaningMatchGamePage navigateTo={navigateTo} gameData={gameData} updateProgressData={updateProgressData} />;
            case 'chatbot': return <ChatbotPage />;
            case 'progress': return <ProgressPage progressData={progressData} clearProgressData={clearProgressData} navigateTo={navigateTo}/>;
            case 'daily_challenge': return <DailyChallengePage navigateTo={navigateTo} />;
            default: return <HomePage navigateTo={navigateTo} />;
        }
    };

    return (
        <div className="min-h-screen bg-[#111827] text-white font-sans flex flex-col relative">
            <GlobalStyles />
            <AuroraBackground />
            <Header currentPage={currentPage} navigateTo={navigateTo} />
            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
                {renderPage()}
            </main>
            <Footer />
        </div>
    );
}

// --- Global Styles Component ---
const GlobalStyles = () => (
    <style>{`
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        .animate-blob { animation: blob 8s infinite ease-in-out; }
        .animation-delay-2 { animation-delay: -4s; }
        .card-main { width: 100%; max-width: 800px; padding: 2.5rem; border-radius: 1rem; background: rgba(26, 34, 51, 0.6); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(139, 92, 246, 0.2); box-shadow: 0 8px 32px 0 rgba(139, 92, 246, 0.15); }
        .btn { padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 600; transition: all 0.2s ease-in-out; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; }
        .btn-primary { background-color: #8b5cf6; color: white; }
        .btn-primary:hover { background-color: #7c3aed; transform: translateY(-2px); box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3); }
        .btn-secondary { background-color: transparent; color: #d1d5db; border: 1px solid #4b5563; }
        .btn-secondary:hover { background-color: #374151; border-color: #6b7280; }
        .select-custom { background-color: #374151; border: 1px solid #4b5563; border-radius: 0.75rem; padding: 0.75rem 2.5rem 0.75rem 1rem; color: white; -webkit-appearance: none; appearance: none; background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.5em 1.5em; cursor: pointer; }
        .feature-card { background-color: rgba(26, 34, 51, 0.6); border: 1px solid rgba(139, 92, 246, 0.2); padding: 2rem; border-radius: 1rem; text-align: left; cursor: pointer; transition: all 0.3s ease; }
        .feature-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(139, 92, 246, 0.2); border-color: rgba(139, 92, 246, 0.4); }
        .file-drop-zone { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; border: 2px dashed #4b5563; border-radius: 1rem; background-color: rgba(17, 24, 39, 0.5); cursor: pointer; transition: background-color 0.2s; }
        .file-drop-zone:hover { background-color: rgba(17, 24, 39, 0.8); }
    `}</style>
);

// --- Home Page Component (REDESIGNED with 4 cards) ---
const HomePage = ({ navigateTo }) => {
    const features = [
        { 
            page: 'nlp_tool', 
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>, 
            title: 'Custom Toolkit', 
            description: 'Upload a CSV file to analyze text or create a personalized vocabulary game.' 
        },
        { 
            page: 'daily_challenge', 
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>, 
            title: 'Daily Challenge', 
            description: 'Test your skills with 5 new questions every day. Can you get a perfect score?' 
        },
        { 
            page: 'chatbot', 
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>, 
            title: 'AI Chatbot', 
            description: 'Translate text, ask for word definitions, and get instant linguistic help from SolveBot.' 
        },
        { 
            page: 'progress', 
            icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>, 
            title: 'Learning Dashboard', 
            description: 'Track your progress, review challenging words, and take personalized practice quizzes.' 
        }
    ];

    return (
        <div className="w-full text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">NLP Toolkit</span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
                A suite of intelligent tools designed for linguistic analysis, vocabulary building, and personalized learning.
            </p>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                {features.map(feature => (
                    <div key={feature.page} className="feature-card" onClick={() => navigateTo(feature.page)}>
                        {feature.icon}
                        <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                        <p className="mt-2 text-gray-400">{feature.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- NLP Tool Page (Updated to include button to Game) ---
const NlpToolPage = ({ setGameData, navigateTo, gameReady }) => {
    const [csvFile, setCsvFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [nlpResult, setNlpResult] = useState(null);
    const [selectedAction, setSelectedAction] = useState('Lemmatization');

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setCsvFile(file); setFileName(file.name); setNlpResult(null); setError('');
        const formData = new FormData();
        formData.append('csvfile', file);
        fetch(`${API_URL}/api/load-game-data`, { method: 'POST', body: formData })
            .then(res => res.ok ? res.json() : Promise.reject('Failed to load game data.'))
            .then(data => setGameData(data.length > 0 ? data : null))
            .catch(() => { setGameData(null); setError('Could not prepare game data from this file.'); });
    };

    const handleProcess = async () => {
        if (!csvFile) return setError('Please choose a file first.');
        setIsLoading(true); setError(''); setNlpResult(null);
        const formData = new FormData();
        formData.append('csvfile', csvFile); formData.append('action', selectedAction);
        try {
            const response = await fetch(`${API_URL}/api/nlp`, { method: 'POST', body: formData });
            if (!response.ok) throw new Error(`Server error: ${response.statusText}`);
            const data = await response.json();
            setNlpResult({ title: selectedAction, data });
        } catch (err) { setError(`Failed to process the file.`); } finally { setIsLoading(false); }
    };

    return (
        <div className="flex-grow flex flex-col items-center justify-center w-full">
            <div className="card-main w-full">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-white">Custom Toolkit</h2>
                    <p className="text-gray-400 mt-2 mb-8">Upload a CSV file to analyze its content or play a game with its vocabulary.</p>
                </div>
                
                <input type="file" id="csv-upload" className="hidden" accept=".csv" onChange={handleFileChange} />
                <label htmlFor="csv-upload" className="file-drop-zone">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-4-4V7a4 4 0 014-4h4a4 4 0 014 4v5a4 4 0 01-4 4H7z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11v6m0 0l-3-3m3 3l3-3" /></svg>
                    <span className="text-purple-400 font-semibold">Click to upload</span>
                    <span className="text-gray-500 text-sm mt-1">or drag and drop</span>
                    {fileName && <p className="mt-4 text-green-400 font-semibold bg-green-500/10 px-3 py-1 rounded-full text-sm">{fileName}</p>}
                </label>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
                    <select value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)} className="select-custom w-full sm:w-auto">
                        <option>Tokenization</option><option>Lemmatization</option><option>Stemming</option>
                        <option>Stopword Removal</option><option>Morphological Analysis</option>
                    </select>
                    <button onClick={handleProcess} disabled={isLoading || !csvFile} className="btn btn-secondary w-full sm:w-auto disabled:bg-gray-600/50 disabled:cursor-not-allowed">
                        {isLoading ? <Spinner /> : 'Analyze Text'}
                    </button>
                    <button onClick={() => navigateTo('game')} disabled={!gameReady} className="btn btn-primary w-full sm:w-auto disabled:bg-gray-600/50 disabled:cursor-not-allowed">
                        Play Game
                    </button>
                </div>
                {error && <p className="mt-6 text-center text-red-400 font-semibold">{error}</p>}
            </div>

            {nlpResult && (
                <div className="card-main mt-8 w-full">
                    <h3 className="text-2xl font-bold mb-4 text-green-300">Analysis Results: {nlpResult.title}</h3>
                    <div className="max-h-96 overflow-y-auto pr-2 space-y-2">
                        {nlpResult.data.map((item, index) => (
                            <div key={index} className="bg-[#111827]/70 p-3 rounded-lg text-left">
                                <h4 className="font-bold text-lg text-purple-300 mb-1">{item.original}</h4>
                                <p className="text-sm text-gray-300 break-all">
                                    <span className="font-semibold text-gray-500">Processed: </span>
                                    {JSON.stringify(item.processed)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


// --- Other Components ---
const MeaningMatchGamePage = ({ navigateTo, gameData, updateProgressData }) => {
    // ... (Code for this component is unchanged)
    const [gameState, setGameState] = useState('difficultySelection'); const [difficulty, setDifficulty] = useState(null); const [score, setScore] = useState(0); const [highScore, setHighScore] = useState(0); const [level, setLevel] = useState(1); const [questionInLevel, setQuestionInLevel] = useState(0); const [correctInLevel, setCorrectInLevel] = useState(0); const [timeLeft, setTimeLeft] = useState(20); const [currentRound, setCurrentRound] = useState(null); const [options, setOptions] = useState([]); const [feedback, setFeedback] = useState(''); const [transitionMessage, setTransitionMessage] = useState({ title: '', body: '' }); const timerRef = useRef(null);
    const DIFFICULTIES = { easy: { name: 'Easy', time: 20 }, medium: { name: 'Medium', time: 15 }, hard: { name: 'Hard', time: 10 } };
    useEffect(() => { if (score > highScore) { setHighScore(score); if (difficulty) { localStorage.setItem(`highScore_${difficulty.name.toLowerCase()}`, score); } } }, [score, highScore, difficulty]);
    const setupRound = () => { setFeedback(''); setTimeLeft(difficulty.time); if (!gameData || gameData.length < 4) return; const correctIndex = Math.floor(Math.random() * gameData.length); const correctAnswer = gameData[correctIndex]; const wrongAnswers = []; const usedWords = [correctAnswer.word]; while (wrongAnswers.length < 3) { const wrongIndex = Math.floor(Math.random() * gameData.length); const potentialWrongAnswer = gameData[wrongIndex]; if (!usedWords.includes(potentialWrongAnswer.word)) { wrongAnswers.push(potentialWrongAnswer); usedWords.push(potentialWrongAnswer.word); } } setCurrentRound(correctAnswer); setOptions([correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5)); };
    useEffect(() => { if (gameState === 'playing' && difficulty) { setupRound(); } }, [gameState, level, difficulty]);
    useEffect(() => { if (gameState !== 'playing' || feedback) { clearInterval(timerRef.current); return; } timerRef.current = setInterval(() => { setTimeLeft(prev => { if (prev <= 1) { clearInterval(timerRef.current); setFeedback('incorrect'); if (currentRound) { updateProgressData(currentRound); } handleNextStep(); return 0; } return prev - 1; }); }, 1000); return () => clearInterval(timerRef.current); }, [gameState, feedback, currentRound]);
    const handleNextStep = () => { setTimeout(() => { if (questionInLevel >= 4) { if (correctInLevel >= 4) { setTransitionMessage({ title: `Level ${level} Complete!`, body: `You're advancing to Level ${level + 1}!` }); setLevel(prev => prev + 1); } else { setTransitionMessage({ title: `Level ${level}`, body: `You need 5 correct answers to advance. Let's try again!` }); } setGameState('levelTransition'); setQuestionInLevel(0); setCorrectInLevel(0); } else { setQuestionInLevel(prev => prev + 1); setupRound(); } }, 1500); };
    const handleOptionClick = (option) => { if (feedback) return; clearInterval(timerRef.current); const isCorrect = option.word === currentRound.word; if (isCorrect) { setScore(s => s + timeLeft); setCorrectInLevel(c => c + 1); setFeedback('correct'); } else { setFeedback('incorrect'); if (currentRound) { updateProgressData(currentRound); } } handleNextStep(); };
    const startGame = (diff) => { const selectedDifficulty = DIFFICULTIES[diff]; setDifficulty(selectedDifficulty); const savedHighScore = localStorage.getItem(`highScore_${selectedDifficulty.name.toLowerCase()}`) || 0; setHighScore(parseInt(savedHighScore, 10)); setLevel(1); setScore(0); setQuestionInLevel(0); setCorrectInLevel(0); setGameState('playing'); };
    if (!gameData || gameData.length < 4) { return ( <div className="card-main text-center"><h2 className="text-3xl font-bold text-red-400 mb-4">Game Data Missing!</h2><p className="text-lg text-gray-400 mb-8">Please go to the Custom Toolkit and upload a valid CSV file with at least 4 words.</p><button onClick={() => navigateTo('nlp_tool')} className="btn btn-secondary">&larr; Go to Toolkit</button></div>); }
    if (gameState === 'difficultySelection') { return ( <div className="card-main text-center"><h2 className="text-4xl font-bold mb-8">Choose Your Difficulty</h2><div className="space-y-4 w-full max-w-sm mx-auto"><button onClick={() => startGame('easy')} className="w-full text-xl font-bold p-4 rounded-lg bg-green-600 hover:bg-green-500 transition-colors">Easy <span className="block text-sm font-normal">20s per question</span></button><button onClick={() => startGame('medium')} className="w-full text-xl font-bold p-4 rounded-lg bg-yellow-600 hover:bg-yellow-500 transition-colors">Medium <span className="block text-sm font-normal">15s per question</span></button><button onClick={() => startGame('hard')} className="w-full text-xl font-bold p-4 rounded-lg bg-red-600 hover:bg-red-500 transition-colors">Hard <span className="block text-sm font-normal">10s per question</span></button></div></div> ); }
    if (gameState === 'levelTransition') { return ( <div className="card-main text-center"><h2 className="text-4xl font-bold mb-4">{transitionMessage.title}</h2><p className="text-xl text-gray-400 mb-8">{transitionMessage.body}</p><button onClick={() => setGameState('playing')} className="btn btn-primary text-xl">Continue</button></div>) }
    return (<div className="w-full max-w-3xl"><div className="flex justify-between items-center mb-4"><div className="text-left w-1/3"><p className="text-lg text-gray-400">Level {level} ({difficulty?.name})</p><p className="text-xl font-bold text-green-400">Question {questionInLevel + 1}/5</p></div><div className="text-center w-1/3"><button onClick={() => setGameState('difficultySelection')} className="btn btn-secondary">Restart Game</button></div><div className="text-right w-1/3"><p className="text-lg text-gray-400">Score</p><p className="text-3xl font-bold text-purple-400">{score}</p><p className="text-xs text-gray-500 -mt-1">High Score: {highScore}</p></div></div><div className="card-main text-center relative"><div className={`absolute top-4 right-4 text-5xl font-bold ${timeLeft <= 5 ? 'text-red-500 animate-ping' : 'text-yellow-300'}`}>{timeLeft}</div><p className="text-lg text-gray-400 mb-2">What is the meaning of...</p><h2 className="text-3xl md:text-4xl font-bold mb-8 h-24 flex items-center justify-center">{currentRound?.meaning}</h2><div className="grid grid-cols-2 gap-4">{options.map((option) => (<button key={option.word} onClick={() => handleOptionClick(option)} disabled={!!feedback} className={`p-4 rounded-lg text-xl font-bold transition-all duration-300 transform ${!feedback ? 'bg-gray-700 hover:bg-purple-600 hover:scale-105' : ''} ${feedback && option.word === currentRound.word ? 'bg-green-600 scale-105' : ''} ${feedback === 'incorrect' && option.word !== currentRound.word ? 'bg-red-800 opacity-50' : ''}`}>{option.word}</button>))}</div></div></div>);
};
const ChatbotPage = () => {
     const [language, setLanguage] = useState('en'); const [isLoading, setIsLoading] = useState(false); const [userInput, setUserInput] = useState(''); const [messages, setMessages] = useState([]); const chatContainerRef = useRef(null);
    const uiText = { en: { title: "NLP Chatbot", placeholder: "Translate a paragraph or ask for a word's meaning...", send: "Send", welcome: "Hello! I'm SolveBot. How can I help you today?", back: "Back to Home" }, hi: { title: "एनएलपी चैटबॉट", placeholder: "एक पैराग्राफ का अनुवाद करें या किसी शब्द का अर्थ पूछें...", send: "भेजें", welcome: "नमस्ते! मैं सॉल्वबॉट हूँ। मैं आज आपकी कैसे मदद कर सकता हूँ?", back: "होम पर वापस जाएं" } };
    useEffect(() => { setMessages([{ sender: 'bot', text: uiText[language].welcome }]); }, [language]);
    useEffect(() => { if(chatContainerRef.current) { chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight; } }, [messages]);
    const handleSendMessage = async (e) => { e.preventDefault(); if (!userInput.trim() || isLoading) return; const newUserMessage = { sender: 'user', text: userInput }; setMessages(prev => [...prev, newUserMessage]); setUserInput(''); setIsLoading(true); try { const response = await fetch(`${API_URL}/api/chatbot`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: userInput, language }), }); const data = await response.json(); const newBotMessage = { sender: 'bot', text: data.reply, isDefinition: data.isDefinition, word: data.word }; setMessages(prev => [...prev, newBotMessage]); } catch (error) { setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I'm having trouble connecting." }]); } finally { setIsLoading(false); } };
    const base64ToArrayBuffer = (base64) => { const binaryString = window.atob(base64); const len = binaryString.length; const bytes = new Uint8Array(len); for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); } return bytes.buffer; };
    const pcmToWav = (pcmData, sampleRate) => { const numChannels = 1; const bitsPerSample = 16; const blockAlign = (numChannels * bitsPerSample) / 8; const byteRate = sampleRate * blockAlign; const dataSize = pcmData.byteLength; const buffer = new ArrayBuffer(44 + dataSize); const view = new DataView(buffer); view.setUint32(0, 0x52494646, false); view.setUint32(4, 36 + dataSize, true); view.setUint32(8, 0x57415645, false); view.setUint32(12, 0x666d7420, false); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, numChannels, true); view.setUint32(24, sampleRate, true); view.setUint32(28, byteRate, true); view.setUint16(32, blockAlign, true); view.setUint16(34, bitsPerSample, true); view.setUint32(36, 0x64617461, false); view.setUint32(40, dataSize, true); const pcm16 = new Int16Array(pcmData); for (let i = 0; i < pcm16.length; i++) { view.setInt16(44 + i * 2, pcm16[i], true); } return new Blob([view], { type: 'audio/wav' }); };
    const handlePronounce = async (word) => { try { const response = await fetch(`${API_URL}/api/tts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: word }), }); const data = await response.json(); if (data.audioContent) { const pcmData = base64ToArrayBuffer(data.audioContent); const wavBlob = pcmToWav(pcmData, 24000); const audioUrl = URL.createObjectURL(wavBlob); const audio = new Audio(audioUrl); audio.play(); } } catch (error) { console.error("Pronunciation error:", error); } };
    return ( <div className="flex flex-col h-[80vh] w-full max-w-4xl bg-[#1a2233] rounded-lg border border-purple-500/20 shadow-lg"> <div className="p-4 border-b border-gray-700 flex justify-between items-center"><div className="flex items-center space-x-2 bg-gray-800 p-1 rounded-lg"> <button onClick={() => setLanguage('en')} className={`px-3 py-1 text-sm font-bold rounded-md ${language === 'en' ? 'bg-purple-600' : ''}`}>EN</button> <button onClick={() => setLanguage('hi')} className={`px-3 py-1 text-sm font-bold rounded-md ${language === 'hi' ? 'bg-purple-600' : ''}`}>HI</button> </div> </div> <div ref={chatContainerRef} className="flex-grow p-4 overflow-y-auto space-y-4"> {messages.map((msg, index) => ( <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}> <div className={`max-w-lg p-3 rounded-xl ${msg.sender === 'user' ? 'bg-purple-700 text-white' : 'bg-gray-700 text-gray-200'}`}> <p className="whitespace-pre-wrap">{msg.text}</p> {msg.isDefinition && ( <button onClick={() => handlePronounce(msg.word)} className="mt-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-full px-3 py-1 inline-flex items-center"> <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M7 4a1 1 0 011.707-.707l6 6a1 1 0 010 1.414l-6 6A1 1 0 017 16V4z" /></svg> Pronounce </button> )} </div> </div> ))}
        {isLoading && <div className="flex justify-start"><div className="p-3 rounded-xl bg-gray-700 text-gray-200"><Spinner /></div></div>}
        </div> <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 flex"> <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder={uiText[language].placeholder} className="flex-grow bg-gray-800 border border-gray-700 rounded-l-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500" /> <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-r-lg">Send</button> </form> </div> );
};
const ProgressPage = ({ navigateTo, progressData, clearProgressData }) => {
    const [isQuizActive, setIsQuizActive] = useState(false);
    const handlePronounce = async (word) => { try { const response = await fetch(`${API_URL}/api/tts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: word }), }); const data = await response.json(); if (data.audioContent) { const base64ToArrayBuffer = (base64) => { const b = window.atob(base64); const l = b.length; const u = new Uint8Array(l); for (let i = 0; i < l; ++i) { u[i] = b.charCodeAt(i); } return u.buffer; }; const pcmToWav = (pcm, rate) => { const d = pcm.byteLength; const b = new ArrayBuffer(44 + d); const v = new DataView(b); v.setUint32(0, 0x52494646, false); v.setUint32(4, 36 + d, true); v.setUint32(8, 0x57415645, false); v.setUint32(12, 0x666d7420, false); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, rate, true); v.setUint32(28, rate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); v.setUint32(36, 0x64617461, false); v.setUint32(40, d, true); new Int16Array(b, 44).set(new Int16Array(pcm)); return new Blob([v], { type: 'audio/wav' }); }; const pcmData = base64ToArrayBuffer(data.audioContent); const wavBlob = pcmToWav(pcmData, 24000); const audioUrl = URL.createObjectURL(wavBlob); new Audio(audioUrl).play(); } } catch (error) { console.error("Pronunciation error:", error); } };
    const trackedWords = Object.values(progressData).sort((a, b) => b.missedCount - a.missedCount || new Date(b.lastMissed) - new Date(a.lastMissed));
    const totalMistakes = trackedWords.reduce((sum, word) => sum + word.missedCount, 0);
    const handleClearProgress = () => { if (window.confirm("Are you sure you want to delete all your progress? This action cannot be undone.")) { clearProgressData(); } };
    if (isQuizActive) { return <PracticeQuiz wordsToPractice={trackedWords} onQuizEnd={() => setIsQuizActive(false)} />; }
    return (
        <div className="card-main w-full">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6"><div><h2 className="text-3xl font-bold text-green-300">Your Learning Dashboard</h2><p className="text-gray-400">Review your progress and practice the words you've found challenging.</p></div></div>
            {trackedWords.length === 0 ? (<div className="text-center py-12"><h3 className="text-2xl font-semibold text-gray-300">No Progress Tracked Yet</h3><p className="text-gray-500 mt-2">Play the 'Word Challenge' game to start building your personalized learning path.</p><button onClick={() => navigateTo('nlp_tool')} className="mt-6 btn btn-primary">Go to Custom Toolkit &rarr;</button></div>) : (<>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"><div className="stat-card bg-gray-800/50 p-4 text-center rounded-lg"><p className="text-4xl font-bold text-purple-400">{trackedWords.length}</p><p className="text-gray-400">Words to Master</p></div><div className="stat-card bg-gray-800/50 p-4 text-center rounded-lg"><p className="text-4xl font-bold text-red-400">{totalMistakes}</p><p className="text-gray-400">Total Mistakes</p></div><div className="bg-gray-800/50 p-4 text-center rounded-lg flex flex-col justify-center">{trackedWords.length >= 4 ? (<button onClick={() => setIsQuizActive(true)} className="btn btn-primary bg-green-600 hover:bg-green-500">Start Practice Quiz</button>) : (<p className="text-center text-gray-500">Need at least 4 missed words to start a quiz.</p>)}</div></div>
            <div className="flex justify-between items-center mb-4"><h3 className="text-2xl font-semibold text-purple-300">Practice List</h3><button onClick={handleClearProgress} className="btn btn-secondary !bg-red-800/50 hover:!bg-red-700/50">Clear All Progress</button></div>
            <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-3">{trackedWords.map((data) => (<div key={data.word} className="bg-black/20 p-4 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-3"><div className="flex-1"><h4 className="font-bold text-xl text-purple-300">{data.word}</h4><p className="text-gray-400">{data.meaning}</p></div><div className="flex items-center gap-4 w-full sm:w-auto"><div className="text-center"><p className="font-bold text-lg text-red-400">{data.missedCount}</p><p className="text-xs text-gray-500">Missed</p></div><div className="text-center flex-1 sm:flex-auto"><p className="font-semibold text-sm text-gray-300">{formatRelativeTime(data.lastMissed)}</p><p className="text-xs text-gray-500">Last Missed</p></div><button onClick={() => handlePronounce(data.word)} title="Pronounce word" className="p-3 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.5a.75.75 0 01.75.75v11.5a.75.75 0 01-1.5 0V4.25A.75.75 0 0110 3.5zM5.5 6.5a.75.75 0 016.25 7.25v5.5a.75.75 0 01-1.5 0V7.25A.75.75 0 015.5 6.5zM14.5 6.5a.75.75 0 01.75.75v5.5a.75.75 0 01-1.5 0V7.25A.75.75 0 0114.5 6.5z" /></svg></button></div></div>))}</div></>)}
        </div>
    );
};
const PracticeQuiz = ({ wordsToPractice, onQuizEnd }) => {
    const [questions, setQuestions] = useState([]); const [currentQ, setCurrentQ] = useState(0); const [score, setScore] = useState(0); const [feedback, setFeedback] = useState('');
    useEffect(() => { const shuffled = [...wordsToPractice].sort(() => 0.5 - Math.random()); const quizQuestions = shuffled.slice(0, Math.min(5, wordsToPractice.length)).map(correctAnswer => { const distractors = wordsToPractice.filter(w => w.word !== correctAnswer.word).sort(() => 0.5 - Math.random()).slice(0, 3); const options = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random()); return { question: correctAnswer.meaning, options, answer: correctAnswer.word }; }); setQuestions(quizQuestions); }, [wordsToPractice]);
    const handleOptionClick = (selectedWord) => { if (feedback) return; if (selectedWord === questions[currentQ].answer) { setScore(s => s + 1); setFeedback('correct'); } else { setFeedback('incorrect'); } };
    const handleNext = () => { setFeedback(''); setCurrentQ(q => q + 1); }
    if (questions.length === 0) return <div className="p-10"><Spinner/> <p>Generating quiz...</p></div>;
    if (currentQ >= questions.length) { return (<div className="flex flex-col items-center justify-center min-h-screen p-4"><div className="card-main text-center w-full max-w-lg"><h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2><p className="text-5xl font-bold my-6">{score} <span className="text-2xl text-gray-400">/ {questions.length}</span></p><p className="text-xl text-green-400 mb-8">You're on your way to mastering these words!</p><button onClick={onQuizEnd} className="btn btn-primary">Back to Dashboard</button></div></div>)}
    const { question, options, answer } = questions[currentQ];
    return (<div className="flex flex-col items-center justify-center min-h-screen p-4"><div className="w-full max-w-2xl"><div className="text-center mb-4"><p className="text-2xl font-bold text-green-400">Practice Quiz: Question {currentQ + 1}/{questions.length}</p><p className="text-xl text-gray-400">Score: {score}</p></div><div className="card-main text-center"><p className="text-lg text-gray-400 mb-2">What is the meaning of...</p><h2 className="text-3xl md:text-4xl font-bold mb-8 h-24 flex items-center justify-center">{question}</h2><div className="grid grid-cols-2 gap-4">{options.map((opt) => (<button key={opt.word} onClick={() => handleOptionClick(opt.word)} disabled={!!feedback} className={`p-4 rounded-lg text-xl font-bold transition-all duration-300 transform ${!feedback ? 'bg-gray-700 hover:bg-purple-600 hover:scale-105' : ''} ${feedback && opt.word === answer ? 'bg-green-600 scale-105' : ''} ${feedback === 'incorrect' && opt.word !== answer ? 'bg-red-800 opacity-50' : ''}`}>{opt.word}</button>))}</div>{feedback && (<div className="mt-6 text-center"><button onClick={handleNext} className="btn btn-primary">Next Question &rarr;</button></div>)}</div></div></div>);
};
const CURATED_WORDS = [ { word: 'ambiguous', meaning: 'Open to more than one interpretation' }, { word: 'benevolent', meaning: 'Well meaning and kindly' }, { word: 'candid', meaning: 'Truthful and straightforward' }, { word: 'diligent', meaning: 'Showing care and conscientiousness in one\'s work' }, { word: 'ephemeral', meaning: 'Lasting for a very short time' }, { word: 'fortitude', meaning: 'Courage in pain or adversity' }, { word: 'gregarious', meaning: 'Fond of company; sociable' }, { word: 'ubiquitous', meaning: 'Present, appearing, or found everywhere' }, { word: 'truncate', meaning: 'To shorten by cutting off the top or the end' }, { word: 'resilient', meaning: 'Able to withstand or recover quickly from difficult conditions' } ];
const DailyChallengePage = ({ navigateTo }) => {
    const [hasCompleted, setHasCompleted] = useState(true); const [questions, setQuestions] = useState([]); const [currentQ, setCurrentQ] = useState(0); const [score, setScore] = useState(0); const [feedback, setFeedback] = useState(''); const [isLoading, setIsLoading] = useState(true);
    useEffect(() => { const today = new Date().toISOString().split('T')[0]; const lastCompletion = localStorage.getItem('dailyChallengeCompletion'); if (lastCompletion === today) { setHasCompleted(true); } else { setHasCompleted(false); const shuffled = [...CURATED_WORDS].sort(() => 0.5 - Math.random()); const quizQuestions = shuffled.slice(0, 5).map(correctAnswer => { const distractors = CURATED_WORDS.filter(w => w.word !== correctAnswer.word).sort(() => 0.5 - Math.random()).slice(0, 3); const options = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random()); return { question: correctAnswer.meaning, options, answer: correctAnswer.word }; }); setQuestions(quizQuestions); } setIsLoading(false); }, []);
    const handleOptionClick = (selectedWord) => { if (feedback) return; if (selectedWord === questions[currentQ].answer) { setScore(s => s + 1); setFeedback('correct'); } else { setFeedback('incorrect'); } };
    const handleNext = () => { if (currentQ === questions.length - 1) { const today = new Date().toISOString().split('T')[0]; localStorage.setItem('dailyChallengeCompletion', today); } setFeedback(''); setCurrentQ(q => q + 1); }
    if (isLoading) { return <div className="flex items-center gap-4"><Spinner /> <span className="text-xl">Loading Challenge...</span></div>; }
    if (hasCompleted) { return (<div className="card-main text-center"><h2 className="text-3xl font-bold mb-4 text-green-400">Challenge Completed!</h2><p className="text-xl text-gray-300 mb-6">You've already completed today's challenge. Come back tomorrow for new questions!</p><button onClick={() => navigateTo('home')} className="btn btn-primary">Back to Home</button></div>); }
    if (currentQ >= questions.length) { return (<div className="card-main text-center w-full max-w-lg"><h2 className="text-3xl font-bold mb-4">Daily Challenge Complete!</h2><p className="text-5xl font-bold my-6">{score} <span className="text-2xl text-gray-400">/ {questions.length}</span></p><p className="text-xl text-green-400 mb-8">Great job! See you tomorrow for the next one.</p><button onClick={() => navigateTo('home')} className="btn btn-primary">Back to Home</button></div>)}
    const { question, options, answer } = questions[currentQ];
    return (<div className="flex-grow flex flex-col items-center justify-center w-full max-w-2xl"><div className="text-center mb-4"><p className="text-2xl font-bold text-yellow-400">Daily Challenge: Question {currentQ + 1}/{questions.length}</p><p className="text-xl text-gray-400">Score: {score}</p></div><div className="card-main text-center"><p className="text-lg text-gray-400 mb-2">What is the meaning of...</p><h2 className="text-3xl md:text-4xl font-bold mb-8 h-24 flex items-center justify-center">{question}</h2><div className="grid grid-cols-2 gap-4">{options.map((opt) => (<button key={opt.word} onClick={() => handleOptionClick(opt.word)} disabled={!!feedback} className={`p-4 rounded-lg text-xl font-bold transition-all duration-300 transform ${!feedback ? 'bg-gray-700 hover:bg-purple-600 hover:scale-105' : ''} ${feedback && opt.word === answer ? 'bg-green-600 scale-105' : ''} ${feedback === 'incorrect' && opt.word !== answer ? 'bg-red-800 opacity-50' : ''}`}>{opt.word}</button>))}</div>{feedback && (<div className="mt-6 text-center"><button onClick={handleNext} className="btn btn-primary">Next &rarr;</button></div>)}</div></div>);
};
function formatRelativeTime(isoDate) {
    const date = new Date(isoDate); const now = new Date(); const seconds = Math.round((now - date) / 1000); const minutes = Math.round(seconds / 60); const hours = Math.round(minutes / 60); const days = Math.round(hours / 24);
    if (seconds < 60) return "just now"; if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`; if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`; return `${days} day${days > 1 ? 's' : ''} ago`;
}