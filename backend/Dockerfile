from node:11-alpine
expose 5000
workdir /usr/src/app
copy package*.json ./
run npm i
copy ./src ./src
copy ./codegen.yml .
copy ./tsconfig.json .
cmd ["npm", "run", "nodemon"]