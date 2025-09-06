// client/src/components/Editor.jsx
import React, { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/monokai.css';
import 'codemirror/theme/solarized.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/css/css';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../utils/Actions';

export default function Editor({ socketRef, roomId, onCodeChange, language, theme }) {
  const editorRef = useRef(null);
  const textareaRef = useRef(null);

  const getMode = (lang) => {
    switch (lang) {
      case 'javascript': return { name: 'javascript', json: true };
      case 'python': return 'python';
      case 'java': return 'text/x-java';
      case 'html': return 'htmlmixed';
      case 'css': return 'css';
      default: return { name: 'javascript', json: true };
    }
  };

  // init
  useEffect(() => {
    const editor = Codemirror.fromTextArea(textareaRef.current, {
      mode: getMode(language),
      theme,
      autoCloseTags: true,
      autoCloseBrackets: true,
      lineNumbers: true,
      lineWrapping: true,
      indentUnit: 2,
      tabSize: 2,
      indentWithTabs: false,
      electricChars: true,
      smartIndent: true,
    });
    editorRef.current = editor;
    editor.setSize('100%', '100%');

    const onChange = (instance, changes) => {
      const { origin } = changes || {};
      const code = instance.getValue();
      onCodeChange(code);
      if (origin !== 'setValue' && socketRef.current) {
        socketRef.current.emit(ACTIONS.CODE_CHANGE, { roomId, code });
      }
    };
    editor.on('change', onChange);

    const el = editor.getWrapperElement();
    el.classList.add('h-full', 'code-mirror-wrapper');

    return () => {
      editor.off('change', onChange);
      editor.toTextArea();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]); // room change → re-init

  // mode/theme updates
  useEffect(() => {
    editorRef.current?.setOption('mode', getMode(language));
  }, [language]);

  useEffect(() => {
    editorRef.current?.setOption('theme', theme);
  }, [theme]);

  // remote updates
  useEffect(() => {
    if (!socketRef.current) return;

    const handler = ({ code }) => {
      if (code != null && editorRef.current) {
        const current = editorRef.current.getValue();
        if (current !== code) editorRef.current.setValue(code);
      }
    };

    socketRef.current.on(ACTIONS.CODE_CHANGE, handler);
    return () => socketRef.current?.off(ACTIONS.CODE_CHANGE, handler);
  }, [socketRef, roomId]);

  return (
    <div className="h-full bg-slate-900 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
        <div className="text-xs text-slate-400">Language: <span className="text-slate-200">{language}</span></div>
        <div className="text-xs text-slate-400">Theme: <span className="text-slate-200">{theme}</span></div>
      </div>
      <textarea ref={textareaRef} />
    </div>
  );
}
