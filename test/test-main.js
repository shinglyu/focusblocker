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
require("sdk/test").run(exports);
