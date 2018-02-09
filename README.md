# SocketChatApp
A Chat app using nodeJS and socket.io

##Technology Used
* Node.js
* Postgres
* Socket.io
* jQuery
* Bootstrap

##Installation
```
npm install
npm install -g sequelize-cli
createdb chat_app
sequelize db:migrate
touch .env && echo "SESSION_SECRET=tacocat" >> .env
gem install foreman
foreman run nodemon
```
