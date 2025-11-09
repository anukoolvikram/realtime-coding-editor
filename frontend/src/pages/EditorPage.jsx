import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import ACTIONS from '../utils/Actions';
import { initSocket } from '../utils/socket';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import { executeCode } from '../utils/api';

// Import the new/improved components
import Sidebar from '../components/Sidebar';
import Editor from '../components/Editor';
import MobileHeader from '../components/MobileHeader';
import RunBar from '../components/RunBar';
import OutputPanel from '../components/OutputPanel';

export default function EditorPage() {
  const socketRef = useRef(null);
  const codeRef = useRef(''); // Use ref to sync code for new joiners
  const location = useLocation();
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);

  // Default to a clean, light theme
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('github');
  
  const [running, setRunning] = useState(false);
  const [execResult, setExecResult] = useState(null);

  // This effect handles all socket connection and event logic
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      socketRef.current = await initSocket();

      const onErr = (e) => {
        console.error('Socket error', e);
        toast.error('Socket connection failed, try again later.');
        navigate('/');
      };

      socketRef.current.on('connect_error', onErr);
      socketRef.current.on('connect_failed', onErr);

      // Emit the JOIN event with username
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      // --- Listen for events from server ---

      // A new user joined
      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
        if (!mounted) return;
        if (username !== location.state?.username) {
          toast.success(`${username} joined the room.`);
        }
        setClients(clients);
        // SYNC: Send the current code to the new user
        socketRef.current.emit(ACTIONS.SYNC_CODE, { 
          code: codeRef.current, 
          socketId 
        });
        // SYNC: Send the current language and theme
        socketRef.current.emit(ACTIONS.LANGUAGE_CHANGE, { roomId, language });
        socketRef.current.emit(ACTIONS.THEME_CHANGE, { roomId, theme });
      });

      // A user disconnected
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        if (!mounted) return;
        toast.success(`${username} left the room.`);
        setClients((prev) => prev.filter((c) => c.socketId !== socketId));
      });

      // A user changed the language
      socketRef.current.on(ACTIONS.LANGUAGE_CHANGE, ({ language }) => {
        if (mounted) setLanguage(language);
      });

      // A user changed the theme
      socketRef.current.on(ACTIONS.THEME_CHANGE, ({ theme }) => {
        if (mounted) setTheme(theme);
      });
    };

    init();

    // Cleanup logic
    return () => {
      mounted = false;
      if (!socketRef.current) return;
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.off('connect_error');
      socketRef.current.off('connect_failed');
      socketRef.current.off(ACTIONS.LANGUAGE_CHANGE);
      socketRef.current.off(ACTIONS.THEME_CHANGE);
      socketRef.current.disconnect();
    };
  }, [roomId, navigate, location.state?.username, language, theme]); // Added language/theme

  // --- Helper Functions ---

  async function handleRun(stdin) {
    setRunning(true);
    setExecResult(null); // Clear previous results
    try {
      const res = await executeCode({
        language,
        code: codeRef.current || '',
        stdin,
      });
      setExecResult(res);
    } catch (e) {
      setExecResult({ stdout: '', stderr: String(e), exitCode: -1 });
    } finally {
      setRunning(false);
    }
  }

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID copied to clipboard');
    } catch (err) {
      toast.error('Could not copy Room ID');
      console.error(err);
    }
  };

  const leaveRoom = () => navigate('/');

  const downloadCode = () => {
    const fileExtension = {
      javascript: 'js',
      python: 'py',
      cpp: 'cpp',
      c: 'c',
      java: 'java',
    }[language] || 'txt';
    
    const element = document.createElement('a');
    const file = new Blob([codeRef.current], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `code-${roomId.slice(0, 5)}.${fileExtension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Code downloaded');
  };

  // --- Event Handlers for Child Components ---

  const onCodeChange = (code) => {
    codeRef.current = code;
    socketRef.current?.emit(ACTIONS.CODE_CHANGE, { roomId, code });
  };

  const onLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    socketRef.current?.emit(ACTIONS.LANGUAGE_CHANGE, { roomId, language: newLanguage });
  };

  const onThemeChange = (newTheme) => {
    setTheme(newTheme);
    socketRef.current?.emit(ACTIONS.THEME_CHANGE, { roomId, theme: newTheme });
  };

  // If user lands here without state (e.g., direct URL), redirect to Home
  if (!location.state) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar (Desktop) */}
      <Sidebar
        clients={clients}
        copyRoomId={copyRoomId}
        leaveRoom={leaveRoom}
        downloadCode={downloadCode}
        language={language}
        theme={theme}
        onLanguageChange={onLanguageChange}
        onThemeChange={onThemeChange}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:h-screen overflow-hidden">
        {/* Mobile Header */}
        <MobileHeader
          clients={clients}
          copyRoomId={copyRoomId}
          leaveRoom={leaveRoom}
        />

        {/* Editor Wrapper (allows it to grow and shrink) */}
        <div className="flex-1 min-h-0">
          <Editor
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={onCodeChange}
            language={language}
            theme={theme}
          />
        </div>

        {/* Bottom Panel (Run Bar + Output) */}
        <div className="flex-shrink-0 border-t border-gray-200">
          <RunBar
            running={running}
            language={language}
            onLanguageChange={onLanguageChange}
            onRun={handleRun} // Pass the handleRun function directly
          />
          <OutputPanel result={execResult} />
        </div>
      </div>
    </div>
  );
}