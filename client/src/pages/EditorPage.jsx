// client/src/pages/EditorPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import ACTIONS from '../utils/Actions';
import Editor from '../components/Editor';
import Sidebar from '../components/Sidebar';
import MobileHeader from '../components/MobileHeader';
import RunBar from '../components/RunBar';
import OutputPanel from '../components/OutputPanel';
import { initSocket } from '../utils/socket';
import { useLocation, useNavigate, Navigate, useParams } from 'react-router-dom';
import { executeCode } from '../utils/api';

export default function EditorPage() {
  const socketRef = useRef(null);
  const codeRef = useRef('');
  const location = useLocation();
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);

  // single source of truth
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('dracula');
  const [showSettings, setShowSettings] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const [running, setRunning] = useState(false);
  const [execResult, setExecResult] = useState(null);

  async function handleRun({ stdin }) {
    setRunning(true);
    try {
      const res = await executeCode({
        language,                  // <- use page state, not RunBar’s own
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

  useEffect(() => {
    let mounted = true;

    (async () => {
      socketRef.current = await initSocket();

      const onErr = (e) => {
        console.error('socket error', e);
        toast.error('Socket connection failed, try again later.');
        navigate('/');
      };

      socketRef.current.on('connect_error', onErr);
      socketRef.current.on('connect_failed', onErr);

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
        if (!mounted) return;
        if (username !== location.state?.username) {
          toast.success(`${username} joined the room.`);
        }
        setClients(clients);
        socketRef.current?.emit(ACTIONS.SYNC_CODE, { code: codeRef.current, socketId });
      });

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        if (!mounted) return;
        toast.success(`${username} left the room.`);
        setClients(prev => prev.filter(c => c.socketId !== socketId));
      });

      // OPTIONAL: if you want language/theme sync across users
      socketRef.current.on(ACTIONS.LANGUAGE_CHANGE, ({ language }) => setLanguage(language));
      socketRef.current.on(ACTIONS.THEME_CHANGE, ({ theme }) => setTheme(theme));
    })();

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
  }, [roomId, navigate, location.state?.username]);

  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      setIsCopied(true);
      toast.success('Room ID copied to clipboard');
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error('Could not copy Room ID');
      console.error(err);
    }
  };

  const leaveRoom = () => navigate('/');

  const downloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([codeRef.current], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `code-${roomId.slice(0, 5)}.${language === 'javascript' ? 'js' : language}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Code downloaded');
  };

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    socketRef.current?.emit(ACTIONS.LANGUAGE_CHANGE, { roomId, language: newLanguage });
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    socketRef.current?.emit(ACTIONS.THEME_CHANGE, { roomId, theme: newTheme });
  };

  if (!location.state) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col md:flex-row">
      <Sidebar
        roomId={roomId}
        clients={clients}
        copyRoomId={copyRoomId}
        leaveRoom={leaveRoom}
        isCopied={isCopied}
        language={language}
        theme={theme}
        changeLanguage={changeLanguage}
        changeTheme={changeTheme}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        downloadCode={downloadCode}
      />


      <div className="flex-1 flex flex-col">
        <MobileHeader
          roomId={roomId}
          copyRoomId={copyRoomId}
          leaveRoom={leaveRoom}
          isCopied={isCopied}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
        />

        <div className="flex-1 min-h-0">
          <Editor
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={(code) => (codeRef.current = code)}
            language={language}
            theme={theme}
          />
        </div>

        <RunBar
          running={running}
          language={language}
          onChangeLanguage={changeLanguage}
          onRun={({ stdin }) => handleRun({ stdin })}
        />

        {/* Make OutputPanel take up at most 1/3 of available space */}
        <div className="min-h-1/3 overflow-hidden">
          <OutputPanel result={execResult} />
        </div>
      </div>
    </div>
  );
}
