FROM node:17.6.0-alpine

WORKDIR /server

COPY ./package.json .
COPY ./lerna.json .
COPY ./yarn.lock .
ADD ./packages/real-time-collector/ ./packages/real-time-collector/
ADD ./packages/postgresql/ ./packages/postgresql/

RUN yarn install --production
RUN yarn global add lerna
RUN npx lerna bootstrap

WORKDIR /server/packages/postgresql/

RUN yarn build

WORKDIR /server/packages/real-time-collector/

RUN yarn build

EXPOSE 80

CMD ["sh", "deploy/start.sh"]
