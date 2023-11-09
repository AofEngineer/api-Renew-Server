FROM node:18

WORKDIR /app

RUN mkdir files

COPY package*.json ./

COPY . .

RUN npm ci
 
EXPOSE 5000

CMD ["npm","run", "start"]