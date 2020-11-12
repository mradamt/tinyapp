const { assert } = require('chai');

const { generateRandomString, lookupUserByKey, urlsForUser } = require('../helpers');

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
const testURLs = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", user_id: "aaaa"},
  "9sm5xK": {longURL: "http://www.google.com", user_id: "aaaa"}
};


describe('generateRandomString', function () {
  it('should return a string of length requested', function () {
    const generatedLength = generateRandomString(6).length
    const expectedOutput = 6
    assert.equal(generatedLength, expectedOutput);
  });
})

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

describe('urlsForUser', function () {
  it('should return a list of URLs when given an id that owns URLs', function () {
    const user = urlsForUser(testURLs, 'aaaa')
    const expectedOutput = testURLs
    assert.deepEqual(user, expectedOutput);
  });

  it('should return an empty object when given an id that owns no URLs', function () {
    const user = urlsForUser(testUsers, 'bbbb')
    const expectedOutput = {}
    assert.deepEqual(user, expectedOutput);
  });
})

