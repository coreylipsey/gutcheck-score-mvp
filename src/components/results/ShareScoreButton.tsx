'use client';
import { useState } from 'react';

export function ShareScoreButton({ score, stars, partner, cohort, userId }:{
  score:number; stars:number; partner:string; cohort:string; userId:string;
}) {
  const [url, setUrl] = useState<string|undefined>();
  const [loading, setLoading] = useState(false);

  async function onShare() {
    setLoading(true);
    
    // Analytics: Log badge generation attempt
    console.log('Analytics: Badge generation clicked', { score, stars, partner, cohort, userId });
    
    try {
      const r = await fetch('/api/badge', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ score, stars, partner, cohort, userId })
      });
      const { url } = await r.json();
      setUrl(url);
      
      // Analytics: Log successful badge generation
      console.log('Analytics: Badge generated successfully', { url });
    } catch (error) {
      console.error('Failed to generate badge:', error);
      
      // Analytics: Log badge generation failure
      console.log('Analytics: Badge generation failed', { error: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button 
        disabled={loading} 
        onClick={onShare} 
        data-testid="share-badge"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Generating…' : 'Share My Score'}
      </button>
      {url && (
        <a 
          href={url} 
          target="_blank" 
          rel="noreferrer"
          className="text-blue-600 hover:text-blue-700 underline"
        >
          Open Badge
        </a>
      )}
    </div>
  );
}
