FROM node:14 as base

WORKDIR /app
COPY package*.json /app/

FROM base as production
ENV NODE_ENV=production
RUN npm ci
COPY . /app
CMD ["node", "server.js"]

FROM base as dev
ENV NODE_ENV=development
RUN npm install -g nodemon && npm install
COPY . /app
CMD ["nodemon", "server.js"]