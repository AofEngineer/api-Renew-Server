FROM node:18

WORKDIR /usr/expressdocker

COPY package*.json ./

COPY . .

RUN npm ci
 
EXPOSE 5000

CMD ["npm", "start"]