'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function AudioDebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  async function testAudioGeneration() {
    setLoading(true);
    setLogs(['Starting audio generation test...']);
    
    try {
      const response = await fetch('/api/debug/test-audio-generation', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLogs(prev => [...prev, 
          '✅ Audio generation successful',
          `🔍 Audio URL: ${data.audioUrl}`,
          ...data.logs
        ]);
        setAudioUrl(data.audioUrl);
      } else {
        setLogs(prev => [...prev, 
          '❌ Audio generation failed',
          `Error: ${data.error}`,
          ...data.logs
        ]);
      }
    } catch (error) {
      setLogs(prev => [...prev, 
        '❌ Request failed',
        `Error: ${error instanceof Error ? error.message : String(error)}`
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Audio Generation Debug</h1>
      
      <div className="mb-6">
        <Button 
          onClick={testAudioGeneration} 
          disabled={loading}
          className="mb-2"
        >
          {loading ? 'Testing...' : 'Test Audio Generation'}
        </Button>
        
        {audioUrl && (
          <div className="mt-4 p-4 border rounded-md">
            <p className="mb-2 font-bold">Generated Audio:</p>
            <audio controls src={audioUrl} className="w-full"></audio>
            <p className="text-xs mt-2 break-all">{audioUrl}</p>
          </div>
        )}
      </div>
      
      <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm">
        <h2 className="text-white mb-2 font-bold">Debug Logs:</h2>
        <div className="whitespace-pre-wrap">
          {logs.map((log, i) => (
            <div key={i} className={`mb-1 ${log.startsWith('❌') ? 'text-red-400' : log.startsWith('✅') ? 'text-green-400' : ''}`}>
              {log}
            </div>
          ))}
          {loading && <div className="blink">_</div>}
        </div>
      </div>
    </div>
  );
} 