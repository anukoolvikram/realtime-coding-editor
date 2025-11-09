/* eslint-disable react-hooks/exhaustive-deps */
// src/components/Editor.jsx
import React, { useRef, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { githubDark, githubLight } from '@uiw/codemirror-theme-github';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { xcodeDark, xcodeLight } from '@uiw/codemirror-theme-xcode';
import ACTIONS from '../utils/Actions';

// Language and Theme Maps
const themes = {
  github: githubLight,
  githubDark: githubDark,
  dracula: dracula,
  xcode: xcodeLight,
  xcodeDark: xcodeDark,
};

const languages = {
  javascript: () => javascript({ jsx: true }),
  python: () => python(),
  cpp: () => cpp(),
  java: () => java(),
};

export default function Editor({ 
  socketRef, 
  roomId, 
  onCodeChange, 
  language, 
  theme 
}) {
  const editorRef = useRef(null);
  const isSyncingRef = useRef(false); // Ref to prevent echo loops

  // --- Real-time Listener ---
  // This is the bug fix. It listens for incoming code.
  useEffect(() => {
    if (!socketRef.current) return;

    const handler = ({ code }) => {
      const editorView = editorRef.current?.view;
      if (editorView && code !== editorView.state.doc.toString()) {
        // Use a ref to prevent our own changes from being re-applied
        isSyncingRef.current = true;
        
        // Replace the entire document, but keep the cursor
        editorView.dispatch({
          changes: {
            from: 0,
            to: editorView.state.doc.length,
            insert: code,
          },
          // This is the magic: don't move the cursor on remote changes
          selection: editorView.state.selection, 
          userEvent: 'receive',
        });
        
        isSyncingRef.current = false;
      }
    };

    socketRef.current.on(ACTIONS.CODE_CHANGE, handler);

    // Clean up the listener
    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE, handler);
    };
  }, [socketRef.current]);

  // --- Send Code Changes ---
  // This function is called by CodeMirror on every keystroke.
  const handleCodeMirrorChange = (newCode, viewUpdate) => {
    // If the change was triggered by 'receive', don't re-emit it
    if (isSyncingRef.current) return;

    // Send the change to the parent (to update codeRef)
    onCodeChange(newCode);

    // Also emit the change to the socket for other users
    if (viewUpdate.docChanged) {
      socketRef.current?.emit(ACTIONS.CODE_CHANGE, {
        roomId,
        code: newCode,
      });
    }
  };

  const selectedTheme = themes[theme] || githubLight;
  const selectedLanguage = languages[language] || javascript;

  return (
    <CodeMirror
      ref={editorRef}
      className="h-full"
      style={{ height: '100%' }} // Ensure it fills the container
      value="" // Start with empty, it will be populated
      height="100%"
      extensions={[selectedLanguage()]}
      theme={selectedTheme}
      onChange={handleCodeMirrorChange}
    />
  );
}