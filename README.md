# Hackathon Judging App


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
