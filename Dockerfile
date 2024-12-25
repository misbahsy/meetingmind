FROM node:latest

WORKDIR /app
COPY package.json .


RUN npm install --legacy-peer-deps

COPY . .

RUN npx prisma generate
RUN npx prisma migrate dev --name init

EXPOSE 3000
CMD npm run dev
