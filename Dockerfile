FROM node:9

WORKDIR /app
COPY package.json .
RUN npm install

COPY dist dist
COPY .env.example .

ENTRYPOINT [ "npm", "start" ]
