'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Hackathon = mongoose.model('Hackathon'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  hackathon;

/**
 * Hackathon routes tests
 */
describe('Hackathon CRUD tests', function () {

  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new Hackathon
    user.save(function () {
      hackathon = {
        name: 'Hackathon name'
      };

      done();
    });
  });

  it('should be able to save a Hackathon if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Hackathon
        agent.post('/api/hackathons')
          .send(hackathon)
          .expect(200)
          .end(function (hackathonSaveErr, hackathonSaveRes) {
            // Handle Hackathon save error
            if (hackathonSaveErr) {
              return done(hackathonSaveErr);
            }

            // Get a list of Hackathons
            agent.get('/api/hackathons')
              .end(function (hackathonsGetErr, hackathonsGetRes) {
                // Handle Hackathons save error
                if (hackathonsGetErr) {
                  return done(hackathonsGetErr);
                }

                // Get Hackathons list
                var hackathons = hackathonsGetRes.body;

                // Set assertions
                (hackathons[0].user._id).should.equal(userId);
                (hackathons[0].name).should.match('Hackathon name');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an Hackathon if not logged in', function (done) {
    agent.post('/api/hackathons')
      .send(hackathon)
      .expect(403)
      .end(function (hackathonSaveErr, hackathonSaveRes) {
        // Call the assertion callback
        done(hackathonSaveErr);
      });
  });

  it('should not be able to save an Hackathon if no name is provided', function (done) {
    // Invalidate name field
    hackathon.name = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Hackathon
        agent.post('/api/hackathons')
          .send(hackathon)
          .expect(400)
          .end(function (hackathonSaveErr, hackathonSaveRes) {
            // Set message assertion
            (hackathonSaveRes.body.message).should.match('Please fill Hackathon name');

            // Handle Hackathon save error
            done(hackathonSaveErr);
          });
      });
  });

  it('should be able to update an Hackathon if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Hackathon
        agent.post('/api/hackathons')
          .send(hackathon)
          .expect(200)
          .end(function (hackathonSaveErr, hackathonSaveRes) {
            // Handle Hackathon save error
            if (hackathonSaveErr) {
              return done(hackathonSaveErr);
            }

            // Update Hackathon name
            hackathon.name = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing Hackathon
            agent.put('/api/hackathons/' + hackathonSaveRes.body._id)
              .send(hackathon)
              .expect(200)
              .end(function (hackathonUpdateErr, hackathonUpdateRes) {
                // Handle Hackathon update error
                if (hackathonUpdateErr) {
                  return done(hackathonUpdateErr);
                }

                // Set assertions
                (hackathonUpdateRes.body._id).should.equal(hackathonSaveRes.body._id);
                (hackathonUpdateRes.body.name).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of Hackathons if not signed in', function (done) {
    // Create new Hackathon model instance
    var hackathonObj = new Hackathon(hackathon);

    // Save the hackathon
    hackathonObj.save(function () {
      // Request Hackathons
      request(app).get('/api/hackathons')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single Hackathon if not signed in', function (done) {
    // Create new Hackathon model instance
    var hackathonObj = new Hackathon(hackathon);

    // Save the Hackathon
    hackathonObj.save(function () {
      request(app).get('/api/hackathons/' + hackathonObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('name', hackathon.name);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single Hackathon with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/hackathons/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Hackathon is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single Hackathon which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent Hackathon
    request(app).get('/api/hackathons/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No Hackathon with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an Hackathon if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new Hackathon
        agent.post('/api/hackathons')
          .send(hackathon)
          .expect(200)
          .end(function (hackathonSaveErr, hackathonSaveRes) {
            // Handle Hackathon save error
            if (hackathonSaveErr) {
              return done(hackathonSaveErr);
            }

            // Delete an existing Hackathon
            agent.delete('/api/hackathons/' + hackathonSaveRes.body._id)
              .send(hackathon)
              .expect(200)
              .end(function (hackathonDeleteErr, hackathonDeleteRes) {
                // Handle hackathon error error
                if (hackathonDeleteErr) {
                  return done(hackathonDeleteErr);
                }

                // Set assertions
                (hackathonDeleteRes.body._id).should.equal(hackathonSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an Hackathon if not signed in', function (done) {
    // Set Hackathon user
    hackathon.user = user;

    // Create new Hackathon model instance
    var hackathonObj = new Hackathon(hackathon);

    // Save the Hackathon
    hackathonObj.save(function () {
      // Try deleting Hackathon
      request(app).delete('/api/hackathons/' + hackathonObj._id)
        .expect(403)
        .end(function (hackathonDeleteErr, hackathonDeleteRes) {
          // Set message assertion
          (hackathonDeleteRes.body.message).should.match('User is not authorized');

          // Handle Hackathon error error
          done(hackathonDeleteErr);
        });

    });
  });

  it('should be able to get a single Hackathon that has an orphaned user reference', function (done) {
    // Create orphan user creds
    var _creds = {
      username: 'orphan',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create orphan user
    var _orphan = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'orphan@test.com',
      username: _creds.username,
      password: _creds.password,
      provider: 'local'
    });

    _orphan.save(function (err, orphan) {
      // Handle save error
      if (err) {
        return done(err);
      }

      agent.post('/api/auth/signin')
        .send(_creds)
        .expect(200)
        .end(function (signinErr, signinRes) {
          // Handle signin error
          if (signinErr) {
            return done(signinErr);
          }

          // Get the userId
          var orphanId = orphan._id;

          // Save a new Hackathon
          agent.post('/api/hackathons')
            .send(hackathon)
            .expect(200)
            .end(function (hackathonSaveErr, hackathonSaveRes) {
              // Handle Hackathon save error
              if (hackathonSaveErr) {
                return done(hackathonSaveErr);
              }

              // Set assertions on new Hackathon
              (hackathonSaveRes.body.name).should.equal(hackathon.name);
              should.exist(hackathonSaveRes.body.user);
              should.equal(hackathonSaveRes.body.user._id, orphanId);

              // force the Hackathon to have an orphaned user reference
              orphan.remove(function () {
                // now signin with valid user
                agent.post('/api/auth/signin')
                  .send(credentials)
                  .expect(200)
                  .end(function (err, res) {
                    // Handle signin error
                    if (err) {
                      return done(err);
                    }

                    // Get the Hackathon
                    agent.get('/api/hackathons/' + hackathonSaveRes.body._id)
                      .expect(200)
                      .end(function (hackathonInfoErr, hackathonInfoRes) {
                        // Handle Hackathon error
                        if (hackathonInfoErr) {
                          return done(hackathonInfoErr);
                        }

                        // Set assertions
                        (hackathonInfoRes.body._id).should.equal(hackathonSaveRes.body._id);
                        (hackathonInfoRes.body.name).should.equal(hackathon.name);
                        should.equal(hackathonInfoRes.body.user, undefined);

                        // Call the assertion callback
                        done();
                      });
                  });
              });
            });
        });
    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Hackathon.remove().exec(done);
    });
  });
});
