FROM node:18 as build

WORKDIR /app
COPY package*.json ./

COPY . .

RUN npm install react-router-dom
RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80


CMD ["nginx", "-g", "daemon off;"]