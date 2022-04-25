FROM node:16-alpine
RUN mkdir /app
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json

RUN npm install --no-cache

# Node ENV
ENV NODE_ENV=development

COPY . /app
CMD ["npm", "run", "server"]
