# healthcare-backend
Healthcare backend API - WhatBytes Internship Assignment  
A backend application for managing patient,doctor and their assignements using Node.js, PostgreSql , express.js and prismaORM with error handling.  

Features:  
1-User registration and login with JWT authentication.  
2-Patient and Doctor CRUD operations.  
3-Manage doctor assignemnt to patients.  
4-Input validation and centralised error handling.  
5-Password hashing using bcrypt.  
6-PostgreSql database with prisma ORM.  
7-Environment based configuration.

Tech Stack:
Node.js, Express.js, PostgreS, Prisma, JSON Web Tokens (JWT), bcryptjs, Postman  

API Testing:  
All endpoints were tested using Postman covering registration,login , dictor and patient management , doctor patient assignements and errors.  

Steps to start:  
1-Clone the repo : git clone https://github.com/VagiSingh/healthcare-backend.git  
  cd healthcare-backend  

2-Install dependencies : npm install  

3-Create .env in project root: sample file provides.  

4-Set up Database : Make sure postgreSql is running and database exists then run:--  
  npx prisma generate
  npx prisma migrate deploy  

5-Start the server: npm run dev.  

6-All APIs will be available for use.


