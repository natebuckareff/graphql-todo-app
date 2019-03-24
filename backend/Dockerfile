from node:8-alpine 
workdir /usr/src/app
copy package*.json ./
run npm i
copy . .
expose 5000
cmd ["npm", "start"]