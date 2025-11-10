/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import ACTIONS from '../utils/Actions';
import { initSocket } from '../utils/socket';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import { executeCode, executeCodeStreaming } from '../utils/api';

// Import your components
import Sidebar from '../components/Sidebar';
import Editor from '../components/Editor';
import MobileHeader from '../components/MobileHeader';
import RunBar from '../components/RunBar';
import OutputPanel from '../components/OutputPanel';

const getUsername = (location) => {
  const fromState = location?.state?.username;
  if (fromState) {
    try {
      localStorage.setItem('username', fromState);
    } catch (e) {
      console.log(e);
    }
    return fromState;
  }
  try {
    return localStorage.getItem('username');
  } catch (e) {
    return null;
  }
};

export default function EditorPage() {
  const socketRef = useRef(null);
  const codeRef = useRef('');
  const location = useLocation();
  const { roomId } = useParams();
  const navigate = useNavigate();

  const username = getUsername(location);

  // All hooks must be called before any conditional returns
  const [clients, setClients] = useState([]);
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('github');
  const [running, setRunning] = useState(false);
  const [execResult, setExecResult] = useState(null);

  useEffect(() => {
    if (!username || !roomId) {
      console.log('⏸️ Skipping socket init - missing username or roomId');
      return;
    }
    let mounted = true;

    const initializeSocket = () => {
      socketRef.current = initSocket();

      const handleConnect = () => {
        if (!mounted) return;

        socketRef.current.emit(ACTIONS.JOIN, {
          roomId,
          username,
        });
      };

      const handleConnectError = (error) => {
        if (!mounted) return;
        toast.error('Connection failed. Please try again.');
      };

      const handleJoined = ({ clients: joinedClients, username: joinedUsername, socketId }) => {
        if (!mounted) return;
        if (joinedUsername !== username) {
          toast.success(`${joinedUsername} joined the room.`);
        }
        setClients(joinedClients || []);
        if (socketRef.current) {
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId
          });
        }
      };

      const handleDisconnected = ({ socketId, username: leftUsername }) => {
        if (!mounted) return;
        console.log('👋 User disconnected:', leftUsername);
        toast.success(`${leftUsername} left the room.`);
        setClients(prev => prev.filter(client => client.socketId !== socketId));
      };

      const handleLanguageChange = ({ language: newLang }) => {
        if (mounted && newLang) {
          console.log('🌐 Language change received:', newLang);
          setLanguage(newLang);
        }
      };

      const handleThemeChange = ({ theme: newTheme }) => {
        if (mounted && newTheme) {
          console.log('🎨 Theme change received:', newTheme);
          setTheme(newTheme);
        }
      };

      const handleCodeChange = ({ code: newCode }) => {
        if (mounted && newCode !== null) {
          codeRef.current = newCode; 
        }
      };

      const handleSyncCode = ({ code: syncedCode }) => {
        if (mounted && syncedCode !== null) {
          codeRef.current = syncedCode;
        }
      };

      // Set up event listeners
      socketRef.current.on('connect', handleConnect);
      socketRef.current.on('connect_error', handleConnectError);
      socketRef.current.on(ACTIONS.JOINED, handleJoined);
      socketRef.current.on(ACTIONS.DISCONNECTED, handleDisconnected);
      socketRef.current.on(ACTIONS.LANGUAGE_CHANGE, handleLanguageChange);
      socketRef.current.on(ACTIONS.THEME_CHANGE, handleThemeChange);
      socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);
      socketRef.current.on(ACTIONS.SYNC_CODE, handleSyncCode);
    };
    initializeSocket();

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('connect_error');
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
        socketRef.current.off(ACTIONS.LANGUAGE_CHANGE);
        socketRef.current.off(ACTIONS.THEME_CHANGE);
        socketRef.current.off(ACTIONS.CODE_CHANGE);
        socketRef.current.off(ACTIONS.SYNC_CODE);

        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId, username]);

  // Event handlers
  const onLanguageChange = useCallback((newLanguage) => {
    setLanguage(newLanguage);
    if (socketRef.current) {
      socketRef.current.emit(ACTIONS.LANGUAGE_CHANGE, { roomId, language: newLanguage });
    }
  }, [roomId]);

  const onThemeChange = useCallback((newTheme) => {
    setTheme(newTheme);
    if (socketRef.current) {
      socketRef.current.emit(ACTIONS.THEME_CHANGE, { roomId, theme: newTheme });
    }
  }, [roomId]);

  const onCodeChange = useCallback((code) => {
    codeRef.current = code;
    if (socketRef.current) {
      socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
    }
  }, [roomId]);

  // Enhanced handleRun with better error handling
  const handleRun = useCallback(async (stdin) => {    
    setRunning(true);
    setExecResult({ 
      stdout: '', 
      stderr: '', 
      exitCode: null, 
      isStreaming: true,
      time: null,
      memory: null
    });

    try {
      await executeCodeStreaming({
        language,
        code: codeRef.current || '',
        stdin,
        onData: (data) => {          
          switch (data.type) {
            case 'stdout':
              setExecResult(prev => ({
                ...prev,
                stdout: prev.stdout + data.content,
              }));
              break;
              
            case 'stderr':
              setExecResult(prev => ({
                ...prev,
                stderr: prev.stderr + data.content,
              }));
              break;
              
            case 'complete':
              console.log('✅ Execution complete. Exit code:', data.exitCode);
              setExecResult(prev => ({
                ...prev,
                exitCode: data.exitCode,
                time: data.time,
                memory: data.memory,
                isStreaming: false,
              }));
              break;
              
            case 'error':
              console.error('❌ Execution error:', data.content);
              setExecResult(prev => ({
                ...prev,
                stderr: prev.stderr + '\n' + data.content,
                exitCode: -1,
                isStreaming: false,
              }));
              toast.error('Execution failed: ' + data.content);
              break;
          }
        }
      });
    } catch (e) {
      console.error('❌ Run error:', e);
      setExecResult({ 
        stdout: '', 
        stderr: String(e.message || e), 
        exitCode: -1, 
        isStreaming: false 
      });
      toast.error('Execution failed');
    } finally {
      setRunning(false);
      console.log('🏁 Run completed');
    }
  }, [language]);

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID copied to clipboard.');
    } catch (err) {
      toast.error('Failed to copy room ID.');
    }
  };

  const leaveRoom = () => {
    try {
      localStorage.removeItem('username');
    } catch (e) {
      console.log(e);
    }
    navigate('/');
  };

  const downloadCode = () => {
    const blob = new Blob([codeRef.current || ''], { type: 'text/plain;charset=utf-8' });
    const extensions = {
      javascript: 'js',
      python: 'py',
      'c++': 'cpp',
      c: 'c',
      java: 'java',
      ruby: 'rb',
      go: 'go',
      rust: 'rs',
      typescript: 'ts',
    };
    const ext = extensions[language] || 'txt';
    const fileName = `code.${ext}`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Code downloaded.');
  };

  // Early return AFTER all hooks have been called
  if (!username) {
    console.log('➡️ Redirecting to home - no username');
    return <Navigate to="/" replace />;
  }

  console.log('🎨 Rendering EditorPage UI');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
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
      <div className="flex-1 flex flex-col min-h-screen md:h-screen overflow-hidden">
        <MobileHeader clients={clients} copyRoomId={copyRoomId} leaveRoom={leaveRoom} />
        <div className="flex-1 min-h-0">
          <Editor
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={onCodeChange}
            language={language}
            theme={theme}
          />
        </div>
        <div className="flex-shrink-0 border-t border-gray-200">
          <RunBar running={running} language={language} onLanguageChange={onLanguageChange} onRun={handleRun} />
          <OutputPanel result={execResult} />
        </div>
      </div>
    </div>
  );
}