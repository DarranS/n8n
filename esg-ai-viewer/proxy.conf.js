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
    }
  }
};

module.exports = debugProxy;