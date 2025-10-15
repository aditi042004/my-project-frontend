import React, { useState, useEffect, useRef } from 'react';
const API_URL = 'https://my-project-backend-wqyy.onrender.com';
// --- Page Navigation ---
const PAGES = { HOME: 'home', NLP_TOOL: 'nlp_tool', GAME: 'game', CHATBOT: 'chatbot', DASHBOARD: 'dashboard' };

// --- Reusable Spinner Component ---
const Spinner = () => (
    <svg className="animate-spin h-6 w-6 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// --- FIX #2: Centralized API URL ---
// This will use your environment variable. Make sure to create the .env.local file!
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// --- Main App Component ---
export default function App() {
  const [currentPage, setCurrentPage] = useState(PAGES.HOME);
  const [gameData, setGameData] = useState(null);
  const [quizMode, setQuizMode] = useState('normal'); 

  const [userProgress, setUserProgress] = useState(() => {
    try {
      const savedProgress = localStorage.getItem('solveBotUserProgress');
      return savedProgress ? JSON.parse(savedProgress) : { weakWords: [], quizHistory: [] };
    } catch (error) {
      console.error("Could not load user progress:", error);
      return { weakWords: [], quizHistory: [] };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('solveBotUserProgress', JSON.stringify(userProgress));
    } catch (error) {
      console.error("Could not save user progress:", error);
    }
  }, [userProgress]);


  const navigateTo = (page) => setCurrentPage(page);

  const startCustomQuiz = () => {
    if (userProgress.weakWords.length < 4) {
      alert("You need at least 4 words in your practice list to start a custom quiz. Play the normal game to add more!");
      return;
    }
    setQuizMode('custom');
    navigateTo(PAGES.GAME);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case PAGES.NLP_TOOL:
        return <NlpToolPage />;
      case PAGES.GAME:
        return gameData ? <GamePage allGameData={gameData} quizMode={quizMode} setQuizMode={setQuizMode} userProgress={userProgress} setUserProgress={setUserProgress} /> : <FileLoader forGame={true} setGameData={setGameData} navigateToGame={() => navigateTo(PAGES.GAME)} />;
      case PAGES.CHATBOT:
        return <ChatbotPage />;
      case PAGES.DASHBOARD:
        return <DashboardPage userProgress={userProgress} startCustomQuiz={startCustomQuiz} />;
      case PAGES.HOME:
      default:
        return <HomePage navigateTo={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <div className="container mx-auto p-4 md:p-8">
        <Header navigateTo={navigateTo} />
        <main className="mt-8 bg-gray-800/50 p-6 rounded-2xl shadow-2xl backdrop-blur-lg border border-gray-700">
          {renderCurrentPage()}
        </main>
        <Footer />
      </div>
    </div>
  );
}

const Header = ({ navigateTo }) => (
  <header className="flex flex-col sm:flex-row justify-between items-center pb-4 border-b-2 border-purple-500/30">
    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 cursor-pointer" onClick={() => navigateTo(PAGES.HOME)}>
      SolveBot AI
    </h1>
    <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4 sm:mt-0">
      <button onClick={() => navigateTo(PAGES.NLP_TOOL)} className="nav-button">NLP Tool</button>
      <button onClick={() => navigateTo(PAGES.GAME)} className="nav-button">Game</button>
      <button onClick={() => navigateTo(PAGES.CHATBOT)} className="nav-button">Chatbot</button>
      <button onClick={() => navigateTo(PAGES.DASHBOARD)} className="nav-button">Dashboard</button>
    </nav>
  </header>
);

const Footer = () => (
    <footer className="text-center mt-8 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} SolveBot. Built with React & Gemini.</p>
    </footer>
);


const HomePage = ({ navigateTo }) => (
    <div className="text-center">
        <h2 className="text-3xl font-semibold text-gray-200 mb-4">Welcome to Your Personal Language Toolkit</h2>
        <p className="max-w-2xl mx-auto text-gray-400 mb-8">
            Analyze text, play vocabulary games, and chat with an advanced AI. SolveBot is here to help you master language. Choose a tool to get started.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard title="NLP Analysis Tool" description="Upload a CSV to perform tasks like tokenization, stemming, and sentiment analysis." onClick={() => navigateTo(PAGES.NLP_TOOL)} />
            <FeatureCard title="Guess the Meaning" description="Test your vocabulary with an interactive quiz based on your own word lists." onClick={() => navigateTo(PAGES.GAME)} />
            <FeatureCard title="SolveBot Chat" description="Ask questions, get definitions, translate text, and even find videos with our AI assistant." onClick={() => navigateTo(PAGES.CHATBOT)} />
        </div>
    </div>
);

const FeatureCard = ({ title, description, onClick }) => (
    <div onClick={onClick} className="bg-gray-800 p-6 rounded-lg shadow-lg cursor-pointer transition-all duration-300 hover:shadow-purple-500/20 hover:scale-105 border border-gray-700">
        <h3 className="text-xl font-bold text-purple-400 mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);

const FileLoader = ({ forGame, setGameData, navigateToGame }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setError('');
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file first.');
            return;
        }
        setLoading(true);
        setError('');
        const formData = new FormData();
        formData.append('csvfile', file);

        try {
            const response = await fetch(`${API_BASE_URL}/api/load-game-data`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setGameData(data);
            if (navigateToGame) {
                navigateToGame();
            }
        } catch (err) {
            setError('Failed to upload or process file. Please ensure it is a valid CSV.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="text-center">
             <h2 className="text-2xl font-semibold mb-4">Upload Your Word List</h2>
             <p className="text-gray-400 mb-6">Please upload a CSV file with 'Word', 'Base Form', and 'Meaning' columns to begin.</p>
            <div className="flex flex-col items-center gap-4">
                <input type="file" onChange={handleFileChange} accept=".csv" className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500" />
                <button onClick={handleUpload} disabled={loading} className="action-button w-48 h-12">
                    {loading ? <Spinner /> : 'Start Game'}
                </button>
                {error && <p className="text-red-400 mt-4">{error}</p>}
            </div>
        </div>
    );
};

const NlpToolPage = () => {
    const [file, setFile] = useState(null);
    const [action, setAction] = useState('Tokenization');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const actions = ['Tokenization', 'Lemmatization', 'Stemming', 'Stopword Removal', 'Morphological Analysis', 'Sentiment Analysis'];

    const handleFileChange = (e) => setFile(e.target.files[0]);
    
    const handleProcess = async () => {
        if (!file) {
            setError("Please select a file first.");
            return;
        }
        setLoading(true);
        setError('');
        setResults(null);
        const formData = new FormData();
        formData.append('csvfile', file);
        formData.append('action', action);

        try {
            const response = await fetch(`${API_BASE_URL}/api/nlp`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error('Failed to process the file.');
            const data = await response.json();
            setResults(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4 text-center">NLP Analysis Tool</h2>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center mb-6">
                <input type="file" onChange={handleFileChange} accept=".csv" className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500" />
                <select value={action} onChange={(e) => setAction(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-lg p-2">
                    {actions.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <button onClick={handleProcess} disabled={loading} className="action-button w-40 h-11">
                    {loading ? <Spinner /> : 'Process'}
                </button>
            </div>
            {error && <p className="text-red-400 text-center">{error}</p>}
            {results && (
                 <div className="mt-6 bg-gray-900/50 p-4 rounded-lg">
                    <h3 className="text-xl font-bold mb-4 text-purple-400">{action} Results</h3>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th className="p-3">Original Word</th>
                                    {Object.keys(results[0].processed).map(key => <th key={key} className="p-3">{key}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((item, index) => (
                                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-800">
                                        <td className="p-3 font-medium">{item.original}</td>
                                        {Object.values(item.processed).map((value, i) => <td key={i} className="p-3">{String(value)}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

const GamePage = ({ allGameData, quizMode, setQuizMode, userProgress, setUserProgress }) => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    useEffect(() => {
        if (quizMode === 'custom') {
            const weakWordsData = userProgress.weakWords
                .map(word => allGameData.find(item => item.word === word))
                .filter(Boolean); 
            generateQuestions(weakWordsData, 10);
        } else {
            generateQuestions(allGameData, 10);
        }
    }, [allGameData, quizMode]);

    const generateQuestions = (sourceData, numQuestions) => {
        const shuffled = [...sourceData].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, numQuestions);

        const newQuestions = selected.map(correctAnswer => {
            const distractors = [...allGameData]
                .filter(item => item.word !== correctAnswer.word)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3)
                .map(item => item.word);
            
            const options = [correctAnswer.word, ...distractors].sort(() => 0.5 - Math.random());
            
            return {
                meaning: correctAnswer.meaning,
                options: options,
                correctWord: correctAnswer.word,
            };
        });
        setQuestions(newQuestions);
        resetGameState();
    };

    const handleAnswer = (selectedWord) => {
        const correct = selectedWord === questions[currentQuestionIndex].correctWord;
        setIsCorrect(correct);
        if (correct) {
            setScore(prev => prev + 1);
        } else {
            const incorrectWord = questions[currentQuestionIndex].correctWord;
            setUserProgress(prev => {
                const newWeakWords = new Set([...prev.weakWords, incorrectWord]);
                return { ...prev, weakWords: Array.from(newWeakWords) };
            });
        }
        setShowFeedback(true);
    };

    const handleNext = () => {
        setShowFeedback(false);
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            setGameOver(true);
            setUserProgress(prev => ({
                ...prev,
                quizHistory: [...prev.quizHistory, { score, total: questions.length, date: new Date().toISOString() }]
            }));
        }
    };
    
    const resetGameState = () => {
        setCurrentQuestionIndex(0);
        setScore(0);
        setShowFeedback(false);
        setIsCorrect(false);
        setGameOver(false);
    };

    const restartGame = (mode) => {
        setQuizMode(mode);
        if (mode === 'custom') {
            const weakWordsData = userProgress.weakWords
                .map(word => allGameData.find(item => item.word === word))
                .filter(Boolean);
            generateQuestions(weakWordsData, 10);
        } else {
            generateQuestions(allGameData, 10);
        }
    };

    if (questions.length === 0) {
        return <div className="text-center p-8"><Spinner /> <p className="mt-2">Generating Quiz...</p></div>;
    }

    if (gameOver) {
        return (
            <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
                <p className="text-xl text-purple-400 mb-6">Your final score: {score} / {questions.length}</p>
                <div className="flex justify-center gap-4">
                    <button onClick={() => restartGame('normal')} className="action-button">Play Again (Normal)</button>
                    <button onClick={() => restartGame('custom')} className="action-button bg-pink-600 hover:bg-pink-500">Practice Weak Words</button>
                </div>
            </div>
        );
    }
    
    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div>
            <h2 className="text-2xl font-semibold text-center mb-2">Guess the Meaning</h2>
            <p className="text-center text-gray-400 mb-6">Question {currentQuestionIndex + 1} of {questions.length} • Score: {score}</p>
            <div className="bg-gray-900/60 p-6 rounded-lg text-center shadow-lg">
                <p className="text-lg md:text-xl italic text-gray-300">"{currentQuestion.meaning}"</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {currentQuestion.options.map((option, index) => {
                    let buttonClass = "option-button";
                    if (showFeedback) {
                        if (option === currentQuestion.correctWord) {
                            buttonClass += " bg-green-500/80";
                        } else {
                            buttonClass += " bg-red-500/80";
                        }
                    }
                    return (
                        <button key={index} onClick={() => handleAnswer(option)} disabled={showFeedback} className={buttonClass}>
                            {option}
                        </button>
                    );
                })}
            </div>
            {showFeedback && (
                <div className="mt-6 text-center">
                    <p className={`text-xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {isCorrect ? 'Correct!' : `Not quite! The answer was "${currentQuestion.correctWord}".`}
                    </p>
                    <button onClick={handleNext} className="action-button mt-4">
                        {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    </button>
                </div>
            )}
        </div>
    );
};

const ChatbotPage = () => {
    const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hello! Ask me for a definition, a translation, or a summary.' }]);
    const [input, setInput] = useState('');
    const [language, setLanguage] = useState('en');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/chatbot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input, language }),
            });
            const data = await response.json();
            const botMessage = { 
                sender: 'bot', 
                text: data.reply,
                isDefinition: data.isDefinition,
                word: data.word,
                videos: data.videos
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage = { sender: 'bot', text: "Sorry, I'm having trouble connecting. Please try again later." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handlePronounce = async (word) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: word }),
            });
            const data = await response.json();
            if (data.audioContent) {
                const audio = new Audio("data:audio/mpeg;base64," + data.audioContent);
                audio.play();
            }
        } catch (error) {
            console.error("TTS error:", error);
        }
    };

    return (
        <div className="flex flex-col h-[70vh]">
            <h2 className="text-2xl font-semibold text-center mb-4">Chat with SolveBot</h2>
            <div className="flex-grow bg-gray-900/50 p-4 rounded-lg overflow-y-auto mb-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-lg p-3 rounded-xl shadow-md ${msg.sender === 'user' ? 'bg-purple-700 text-white' : 'bg-gray-700 text-gray-200'}`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                            {msg.isDefinition && (
                                <button onClick={() => handlePronounce(msg.word)} className="mt-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-full px-3 py-1 inline-flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.5a.75.75 0 01.75.75v11.5a.75.75 0 01-1.5 0V4.25A.75.75 0 0110 3.5zM5.5 6.5A.75.75 0 016.25 7.25v5.5a.75.75 0 01-1.5 0V7.25A.75.75 0 015.5 6.5zM14.5 6.5a.75.75 0 01.75 7.25v5.5a.75.75 0 01-1.5 0V7.25A.75.75 0 0114.5 6.5z" /></svg>
                                    Pronounce
                                </button>
                            )}
                             {msg.videos && msg.videos.length > 0 && (
                                <div className="mt-3">
                                    {msg.videos.map((video, vIndex) => (
                                        <a key={vIndex} href={video.url} target="_blank" rel="noopener noreferrer" className="flex items-center bg-gray-800 p-2 rounded-lg mb-2 hover:bg-gray-700">
                                            <img src={video.thumbnail} alt={video.title} className="w-16 h-10 object-cover rounded mr-3"/>
                                            <div className="text-left">
                                                <p className="text-sm font-semibold leading-tight">{video.title}</p>
                                                <p className="text-xs text-gray-400">{video.duration}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {loading && <div className="flex justify-start"><div className="p-3 rounded-xl bg-gray-700"><Spinner /></div></div>}
                <div ref={chatEndRef} />
            </div>
             <div className="flex gap-2">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="Type your message..." className="flex-grow bg-gray-700 border-gray-600 rounded-lg p-3 focus:ring-purple-500 focus:border-purple-500" />
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-gray-700 border-gray-600 rounded-lg p-3">
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                </select>
                <button onClick={handleSend} disabled={loading} className="action-button px-6">Send</button>
            </div>
        </div>
    );
};

const DashboardPage = ({ userProgress, startCustomQuiz }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-center mb-6">Your Learning Dashboard</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-900/50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-purple-400 mb-4">Words to Practice</h3>
          {userProgress.weakWords.length > 0 ? (
            <div>
              <p className="text-gray-400 mb-4">These are words you've struggled with. Click the button below to start a quiz focused on them!</p>
              <ul className="flex flex-wrap gap-2 mb-4">
                {userProgress.weakWords.map(word => (
                  <li key={word} className="bg-gray-700 text-gray-200 px-3 py-1 rounded-full text-sm">{word}</li>
                ))}
              </ul>
              <button onClick={startCustomQuiz} className="action-button w-full">
                Start Practice Quiz
              </button>
            </div>
          ) : (
            <p className="text-gray-400">You haven't missed any words yet! Play the 'Guess the Meaning' game to build your practice list.</p>
          )}
        </div>
        <div className="bg-gray-900/50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-purple-400 mb-4">Quiz History</h3>
          {userProgress.quizHistory.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {userProgress.quizHistory.slice().reverse().map((quiz, index) => (
                <div key={index} className="bg-gray-800 p-3 rounded-md flex justify-between items-center">
                  <div>
                    <span className="font-bold text-lg">{quiz.score} / {quiz.total}</span>
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${quiz.score / quiz.total >= 0.7 ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'}`}>
                      {Math.round((quiz.score / quiz.total) * 100)}%
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {new Date(quiz.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No quiz history yet. Complete a game to see your scores here.</p>
          )}
        </div>
      </div>
    </div>
  );
};