#빌드 스테이지
FROM node:18.16.1 AS build
WORKDIR /srcapp
COPY package*.json ./
#RUN npm cache clean -f
#RUN npm install --legacy-peer-deps
#RUN npm install -g npm@latest
RUN npm install
COPY . .
RUN npm run build
#RUN npm install -g serve

#CMD ["serve", "-s", "build", "-l", "3001"]

# #실행 스테이지
# ## 포트지정
# FROM node:18
# COPY --from=build-stage /srcapp/build /srcapp
# WORKDIR /srcapp
EXPOSE 3001
# ## 이미지 안 작업 디렉토리 생성
# ## 컨테이너 시작 시 실행할 명령어
# #CMD ["node", "server.js"]
CMD ["npm", "start"]
