'use client';

import { useState, useEffect } from 'react';

interface DebugAudioInfo {
  original: string;
  isRelative: boolean;
  isAbsolute: boolean;
  isSupabaseUrl: boolean;
  urlStructure: string;
}

interface ContentItem {
  id: number;
  contentDate: string;
  verseRef: string;
  verseText: string;
  reflectionText: string;
  audioUrlFree: string | null;
  audioUrlPremium: string | null;
  audioUrlFree_debug?: DebugAudioInfo;
  audioUrlPremium_debug?: DebugAudioInfo;
}

export default function DebugPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/debug/daily-content');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setContent(data);
      } catch (err) {
        setError(`Error fetching data: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Daily Content Debug</h1>
      <div className="space-y-6">
        {content.map((item) => (
          <div key={item.id} className="border p-6 rounded-lg shadow-sm">
            <h2 className="font-semibold text-lg mb-2">Date: {item.contentDate}</h2>
            <p className="text-sm text-gray-500 mb-4">ID: {item.id}</p>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Free Audio URL</h3>
                {item.audioUrlFree ? (
                  <>
                    <div className="text-sm break-all bg-white p-2 rounded border mb-2">{item.audioUrlFree}</div>
                    {item.audioUrlFree_debug && (
                      <div className="text-xs space-y-1 text-gray-600">
                        <p>URL Structure: <span className="font-mono">{item.audioUrlFree_debug.urlStructure}</span></p>
                        <p>Relative Path: <span className={item.audioUrlFree_debug.isRelative ? "text-blue-500 font-bold" : "text-gray-500"}>{item.audioUrlFree_debug.isRelative ? "Yes" : "No"}</span></p>
                        <p>Absolute URL: <span className={item.audioUrlFree_debug.isAbsolute ? "text-green-500 font-bold" : "text-gray-500"}>{item.audioUrlFree_debug.isAbsolute ? "Yes" : "No"}</span></p>
                        <p>Supabase URL: <span className={item.audioUrlFree_debug.isSupabaseUrl ? "text-green-500 font-bold" : "text-red-500 font-bold"}>{item.audioUrlFree_debug.isSupabaseUrl ? "Yes" : "No"}</span></p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500">None</p>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-medium mb-2">Premium Audio URL</h3>
                {item.audioUrlPremium ? (
                  <>
                    <div className="text-sm break-all bg-white p-2 rounded border mb-2">{item.audioUrlPremium}</div>
                    {item.audioUrlPremium_debug && (
                      <div className="text-xs space-y-1 text-gray-600">
                        <p>URL Structure: <span className="font-mono">{item.audioUrlPremium_debug.urlStructure}</span></p>
                        <p>Relative Path: <span className={item.audioUrlPremium_debug.isRelative ? "text-blue-500 font-bold" : "text-gray-500"}>{item.audioUrlPremium_debug.isRelative ? "Yes" : "No"}</span></p>
                        <p>Absolute URL: <span className={item.audioUrlPremium_debug.isAbsolute ? "text-green-500 font-bold" : "text-gray-500"}>{item.audioUrlPremium_debug.isAbsolute ? "Yes" : "No"}</span></p>
                        <p>Supabase URL: <span className={item.audioUrlPremium_debug.isSupabaseUrl ? "text-green-500 font-bold" : "text-red-500 font-bold"}>{item.audioUrlPremium_debug.isSupabaseUrl ? "Yes" : "No"}</span></p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500">None</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 