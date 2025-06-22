import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ 
      error: '缺少URL参数',
      message: '请提供要访问的URL'
    });
  }
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      return res.status(response.status).json({
        error: `目标服务器返回错误: ${response.status}`,
        message: response.statusText
      });
    }
    
    const contentType = response.headers.get('content-type') || 'text/plain';
    const contentLength = response.headers.get('content-length') || '0';
    const content = await response.text();
    
    res.status(200).json({
      status: response.status,
      contentType,
      contentLength,
      content,
      viewMode: contentType.includes('text/html') ? 'html' : 'text'
    });
    
  } catch (error) {
    res.status(500).json({
      error: '代理请求失败',
      message: error.message
    });
  }
}