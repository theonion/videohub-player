var expect = require('chai').expect;
var subject = require('../../src/utils/string');

describe("String - Utility Methods", function() {
  var startsWith, endsWith, string = 'Some String';

  describe("#startsWith", function() {
    it("returns true if string starts with passed in string", function() {
      expect(string.startsWith('Some')).to.be.true;
    });

    it("returns false if string does not start with passed in string", function() {
      expect(string.startsWith('Foo')).to.be.false;
    });
  });

  describe("#endsWith", function() {
    it("returns true if string ends with passed in string", function() {
      expect(string.endsWith('String')).to.be.true;
    });

    it("returns false if string does not end with passed in string", function() {
      expect(string.endsWith('Bar')).to.be.false;
    });
  });

});
