FROM node:16.15.1-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN if [ -f .env.production ]; then cp .env.production .env; elif [ -f .env.development ]; then cp .env.development .env; fi

RUN npm run build

CMD [ "npm", "run", "start:prod" ]