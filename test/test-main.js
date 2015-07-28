var main = require("./main");

/*
exports["test main"] = function(assert) {
  assert.pass("Unit test running!");
};

exports["test main async"] = function(assert, done) {
  assert.pass("async Unit test running!");
  done();
};
*/

/*
exports["test timed block"] = function(assert, done) {
  var mockBlock = function() {
    assert.pass('mock_block called')
    done();
  }

  //main.block = mockBlock;
  var time = 1 //sec
  main.timed_block(time, mockBlock);
  //main.block();
}
*/

exports["test parse blacklist"] = function(assert, done) {
  var blacklist =  "*.facebook.com,https://twitter.com/*,*.cheezburger.com,http://feedly.com/*"
  var expected = [
    '*.facebook.com', 
    'https://twitter.com/*', 
    '*.cheezburger.com', 
    'http://feedly.com/*',
  ]
  //main.block = mockBlock;
  var parsed = main.parseBlacklist(blacklist);
  assert.equal(parsed.length, expected.length, "Same length")
  assert.deepEqual(parsed, expected, "blacklist is parsed as array")
  //main.block();
  done()
}
require("sdk/test").run(exports);
