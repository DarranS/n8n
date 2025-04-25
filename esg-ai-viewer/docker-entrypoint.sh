#!/bin/sh

# Create the env.js file with build information
mkdir -p /usr/share/nginx/html/assets
cat > /usr/share/nginx/html/assets/env.js << EOF
(function(window) {
    window.__BUILD_TAG__ = '${BUILD_TAG:-"not set"}';
    window.__ENVIRONMENT__ = '${ENVIRONMENT:-"Development"}';
})(window);
EOF

# Start nginx
exec nginx -g "daemon off;" 