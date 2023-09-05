#빌드 스테이지
## 베이스 이미지 지정
FROM node:18 AS build-stage
COPY package*.json ./
## 필요한 모듈 가져옴
RUN npm install
RUN npm run build


#실행 스테이지

## 포트지정
EXPOSE 3001
## 이미지 안 작업 디렉토리 생성
## 컨테이너 시작 시 실행할 명령어
CMD ["node", "server.js"]