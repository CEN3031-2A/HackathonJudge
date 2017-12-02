# Hackathon Judging App

### Deployed Site:
https://hackathonjudge.herokuapp.com/

### Dev Team:
+ Steven Yildirim - Scrum Master - steveny@ufl.edu
+ Anthony Brugal - tonybrugal@ufl.edu
+ Reid Mollway - Product Manager - rmollway@ufl.edu
+ Tim Mai - shiperl@ufl.edu

### Features
This is a Judging app for the Ultimate Software Hackathon.
The judging will be done using a blockchain which will help ensure that there
is one vote per judge.
There will be:
+ Live results
+ Ways to add hackathons
+ Ways to view and vote on each project
+ Ways to take notes on each project

### Chain Structure
![Alt text](/public/chainstructure.png?raw=true)

We use a chain structure that does not have a proof-of-work. Therefore, it does not feature the decentralized safety 
properties that typical blockchain concepts have. However the fundamental structure is there and proof-of-work can 
be implemented later.

### P2P Connection (using Socket.io)
![alt text](/public/portstructure.png?raw=true)

### Credits:
+ ChartJS
+ AngularJS
+ Bootstrap

### How to run locally:
+ Clone Repository
+ Go into the repository and npm install
+ Navigate to config/env and duplicate development.js, renaming it local-development.js
+ Within local-development.js replace all code with:
	```
	'use strict';

	module.exports = {
		db: {
			uri: 'mongodb://<dbuser>:<dbpassword>@{db link}',
		}
	};
	```
+ Navigate to modules/hackathons/client/config
+ add file "aws.json", within this file include the code:
	```
	{ 
    "accessKeyId": "{access key id}", 
    "secretAccessKey": "{secret access key}", 
    "region": "{region}",
    "email": "{email}"
	}
	```
+ Navigate to modules/hackathons/client/controllers and open hackathons.client.controller.js
+ Starting on line 70 you will see:
```
    // Get AWS credentials and email from aws.json - this is 
    // $http.get('modules/hackathons/client/config/aws.json').then(function (data) {
    //   json = data;
    //   json = json.data;
    // });

    var headers = {"Authorization": "Basic cm1vbGx3YXlAdWZsLmVkdTpSTTkyMTEwNA==", "Accept": "application/vnd.heroku+json; version=3"};
    $http.get('https://api.heroku.com/apps/hackathonjudge/config-vars', {headers: headers}).then(function(data){
      json = data;
      json = json.data;
      console.log(JSON.stringify(json));
    });
```
+ To run the app locally the commented code must be uncommented, and the uncommented code should be commented.
+ To run the app open terminal and run:
```
    node server.js
```
+ On your browser navigate to localhost:3000
