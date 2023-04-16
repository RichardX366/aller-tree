FROM node:18-alpine as pre-yarn
ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools
RUN pip3 install --no-cache ultralytics
WORKDIR /app
COPY package.json yarn.lock ./

FROM pre-yarn as pre-install
COPY .yarnrc.yml ./
COPY .yarn ./.yarn

FROM pre-install as prod-install
RUN yarn workspaces focus --production

FROM pre-install as build
RUN yarn --immutable
COPY . .
RUN yarn build-files

FROM pre-yarn as main
COPY --from=prod-install /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/python ./python
CMD ["yarn", "start"]