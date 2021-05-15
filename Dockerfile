FROM node:14-alpine as base
WORKDIR /app
COPY package*.json /app/

FROM base as prod
ENV NODE_ENV=production
RUN npm ci
COPY . /app
CMD ["node", "server/app.js"]

FROM base as dev
ENV NODE_ENV=development
RUN npm install -g nodemon && npm install
COPY . /app
CMD ["npm", "run", "start:dev"]