FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy frontend files
COPY WebPage.html /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/
COPY Main.html /usr/share/nginx/html/
COPY mainPage.js /usr/share/nginx/html/

