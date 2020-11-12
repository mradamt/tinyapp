const { assert } = require('chai');

const { lookupUserByKey } = require('../helpers');

const testUsers = {
  "aaaa": {
    id: "aaaa",
    email: "a@a.com",
    password: "abcpw"
  },
  "bbbb": {
    id: "bbbb",
    email: "b@b.com",
    password: "abcpw"
  },
};


describe('lookupUserByKey', function () {
  it('should return a user when given a valid email', function () {
    const user = lookupUserByKey(testUsers, 'email', 'a@a.com')
    const expectedOutput = testUsers.aaaa
    assert.equal(user, expectedOutput);
  });

  it('should return undefined when given an invalid email', function () {
    const user = lookupUserByKey(testUsers, 'email', 'doesnotexist@a.com')
    const expectedOutput = undefined
    assert.equal(user, expectedOutput);
  });

  it('should return a user when given a valid userID', function () {
    const user = lookupUserByKey(testUsers, 'id', 'aaaa')
    const expectedOutput = testUsers.aaaa
    assert.equal(user, expectedOutput);
  });

  it('should return undefined when given an invalid id', function () {
    const user = lookupUserByKey(testUsers, 'id', 'abab')
    const expectedOutput = undefined
    assert.equal(user, expectedOutput);
  });
})

