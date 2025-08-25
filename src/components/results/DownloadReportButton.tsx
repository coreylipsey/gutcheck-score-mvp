'use client';
import { useState } from 'react';

export function DownloadReportButton({ partner, cohort }: {
  partner: string;
  cohort: string;
}) {
  const [url, setUrl] = useState<string|undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|undefined>();

  async function onDownload() {
    setLoading(true);
    setError(undefined);
    
    // Analytics: Log report generation attempt
    console.log('Analytics: Report generation clicked', { partner, cohort });
    
    try {
      const r = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partner, cohort })
      });
      
      if (!r.ok) {
        throw new Error(`HTTP ${r.status}: ${r.statusText}`);
      }
      
      const { url } = await r.json();
      setUrl(url);
      
      // Analytics: Log successful report generation
      console.log('Analytics: Report generated successfully', { url });
    } catch (error) {
      console.error('Failed to generate report:', error);
      setError('Failed to generate report. Please try again.');
      
      // Analytics: Log report generation failure
      console.log('Analytics: Report generation failed', { error: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button 
        disabled={loading} 
        onClick={onDownload} 
        data-testid="download-report"
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Generating…' : 'Download Funder Report (PDF)'}
      </button>
      {url && (
        <a 
          href={url} 
          target="_blank" 
          rel="noreferrer"
          className="text-green-600 hover:text-green-700 underline"
        >
          Open Report
        </a>
      )}
      {error && (
        <span className="text-red-600 text-sm">
          {error}
        </span>
      )}
    </div>
  );
}
