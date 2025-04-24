const debugProxy = {
  '/webhook': {
    target: 'https://n8n.sheltononline.com',
    secure: true,
    changeOrigin: true,
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
      console.log('Proxy request:', {
        method: req.method,
        url: req.url,
        targetUrl: proxyReq.path,
        headers: proxyReq.getHeaders(),
        body: req.body
      });
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log('Proxy response:', {
        status: proxyRes.statusCode,
        headers: proxyRes.headers,
        url: req.url
      });
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
      res.writeHead(500, {
        'Content-Type': 'text/plain',
      });
      res.end('Something went wrong with the proxy request.');
    },
    proxyTimeout: 30000,
    timeout: 30000
  }
};

module.exports = debugProxy;