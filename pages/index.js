import Head from 'next/head';
import { useState } from 'react';
import styles from '../public/style.css';

export default function Home() {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState('direct');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    if (mode === 'direct') {
      // 直接访问模式
      window.open(url, '_blank');
    } else {
      // 代理访问模式
      setLoading(true);
      try {
        const response = await fetch(`/api/proxy?url=${encodeURIComponent(url)}`);
        const result = await response.json();
        setResult(result);
      } catch (error) {
        setResult({
          error: '代理请求失败',
          message: error.message
        });
      }
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>URL访问工具</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>URL访问工具</h1>
        
        {/* 模式选择 */}
        <div className="mode-selector">
          <button 
            className={`mode-btn ${mode === 'direct' ? 'active' : ''}`}
            onClick={() => setMode('direct')}
          >
            直接访问
          </button>
          <button 
            className={`mode-btn ${mode === 'proxy' ? 'active' : ''}`}
            onClick={() => setMode('proxy')}
          >
            代理访问
          </button>
        </div>
        
        {/* 表单 */}
        <form onSubmit={handleSubmit} className="input-group">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? '处理中...' : '访问'}
          </button>
        </form>
        
        {/* 结果展示 */}
        {result && (
          <div className="result-container">
            <div className="result-header">
              <h2>代理访问结果</h2>
              <small>目标URL: <a href={url} target="_blank" rel="noopener noreferrer">{url}</a></small>
            </div>
            
            {result.error ? (
              <div className="error">
                <h3>{result.error}</h3>
                <p>{result.message}</p>
              </div>
            ) : (
              <>
                <div className="result-meta">
                  <p><strong>状态码:</strong> {result.status}</p>
                  <p><strong>内容类型:</strong> {result.contentType}</p>
                  <p><strong>大小:</strong> {Math.round(result.contentLength / 1024)} KB</p>
                </div>
                
                <div className="preview-options">
                  <button 
                    className={`preview-btn ${result.viewMode === 'text' ? 'active' : ''}`}
                    onClick={() => setResult({...result, viewMode: 'text'})}
                  >
                    文本预览
                  </button>
                  <button 
                    className={`preview-btn ${result.viewMode === 'html' ? 'active' : ''}`}
                    onClick={() => setResult({...result, viewMode: 'html'})}
                  >
                    HTML预览
                  </button>
                </div>
                
                {result.viewMode === 'text' ? (
                  <pre className="content-preview">{result.content}</pre>
                ) : (
                  <iframe 
                    srcDoc={result.content}
                    title="代理内容预览"
                    className="content-iframe"
                    sandbox="allow-same-origin allow-scripts"
                  />
                )}
              </>
            )}
          </div>
        )}
      </main>

      <footer>
        <p>© {new Date().getFullYear()} URL访问工具 - 部署于Vercel</p>
      </footer>
    </div>
  );
}