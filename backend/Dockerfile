from node:11-alpine
expose 5000
workdir /usr/src/app
copy package*.json ./
run npm i
copy ./src .
copy ./codegen.yml .
cmd ["npm", "start"]