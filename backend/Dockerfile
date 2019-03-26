from node:8-alpine 
expose 5000
workdir /usr/src/app
copy package*.json ./
run npm i
copy . .
cmd ["npm", "start"]