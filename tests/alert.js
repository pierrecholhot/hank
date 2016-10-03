var chai = require('chai');
var assert = chai.assert;

describe('Alert logic', function () {

  var server;

  before(function(){
    server = require('../server');
  });

  it('should raise an alert on high load average', function() {
    var r = server.checkForAlert(5, new Date().getTime());
    assert.equal(r.highUsage, true);
  });

  it('should recover', function() {
    var r = server.checkForAlert(0.5, new Date().getTime());
    assert.equal(r.highUsage, false);
  });

  after(function () {
    server.kill();
  });

});
