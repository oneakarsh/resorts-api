FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# If using Prisma, you might need to run prisma generate
# RUN npx prisma generate

EXPOSE 5001

CMD ["node", "server.js"]
