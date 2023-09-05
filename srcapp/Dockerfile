#빌드 스테이지
FROM node:18 AS build-stage
WORKDIR /srcapp
COPY package*.json ./
#RUN npm cache clean -f
RUN npm install
#RUN npm install -g npm@latest
COPY . .
RUN npm run build

#실행 스테이지
## 포트지정
FROM node:18
COPY --from=build-stage /srcapp/build /srcapp
WORKDIR /srcapp
EXPOSE 3001
## 이미지 안 작업 디렉토리 생성
## 컨테이너 시작 시 실행할 명령어
#CMD ["node", "server.js"]
CMD ["npm", "start"]
