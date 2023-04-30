FROM node:18-slim as pre-yarn
RUN apt-get update || : && apt-get install -y python3-pip build-essential ffmpeg libsm6 libxext6 libgl1-mesa-glx
RUN pip3 install --no-cache torch torchvision --index-url https://download.pytorch.org/whl/cpu
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