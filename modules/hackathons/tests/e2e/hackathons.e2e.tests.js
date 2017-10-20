'use strict';

describe('Hackathons E2E Tests:', function () {
  describe('Test Hackathons page', function () {
    it('Should report missing credentials', function () {
      browser.get('http://localhost:3001/hackathons');
      expect(element.all(by.repeater('hackathon in hackathons')).count()).toEqual(0);
    });
  });
});
