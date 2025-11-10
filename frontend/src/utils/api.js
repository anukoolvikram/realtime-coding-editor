export async function executeCode({ language, code, stdin = '' }) {
  const res = await fetch('/api/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language, code, stdin }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Execution failed: ${res.status} ${text}`);
  }
  return res.json();
}

// NEW: Streaming execution function (Corrected)
export async function executeCodeStreaming({ language, code, stdin, onData }) {
  const response = await fetch(`/api/execute-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ language, code, stdin }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Execution failed' }));
    throw new Error(errorData.error || 'Execution failed');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  // 1. Add a buffer to store partial lines
  let buffer = ''; 

  // Helper function to process a single, complete line
  const processLine = (line) => {
    if (line.startsWith('data: ')) {
      try {
        const data = JSON.parse(line.slice(6));
        onData(data); // Callback with each data chunk
      } catch (e) {
        console.error('Failed to parse SSE data:', line.slice(6), e);
      }
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    
    if (done) {
      // 4. If the stream is done, process any remaining data in the buffer
      if (buffer) {
        processLine(buffer);
      }
      break;
    }
    
    // 2. Append the new chunk (decoded to text) to the buffer
    buffer += decoder.decode(value, { stream: true });
    
    // 3. Process all *complete* lines in the buffer
    let lineEndIndex;
    while ((lineEndIndex = buffer.indexOf('\n')) >= 0) {
      // Extract the complete line
      const line = buffer.slice(0, lineEndIndex).trim(); 
      
      // Remove the processed line (and the '\n') from the buffer
      buffer = buffer.slice(lineEndIndex + 1);
      
      if (line) {
        processLine(line);
      }
    }
  }
}