Test Cases
==========================


TEST THAT a prompt asks the user to set a timer for block

WHEN Open www.facebook.com
THEN A prompt will popup to ask for when should the blocking start

WHEN Enter 0.5 minute, press OK

WHEN Open another tab with www.facebook.com immediately
THEN No prompt

WHEN Wait for 0.5 minute
THEN the two tabs are blocked 


-----------------------

TEST THAT the block/unblock function works

WHEN Go to addon setting, set timeout to 1 min

WHEN Open www.facebook.com 
THEN Should be prompted to set a timer

WHEN Set the timer to 0.1 min
THEN The page should be blocked within 0.1 minute

WHEN Try to open www.facebook.com 
THEN Should be blocked

WHEN Wait for 1 min, open www.facebook.com
THEN Should be unblocked

WHEN Click the "Start blocking" button
THEN The page should be blocked immediately

WHEN Try to open www.facebook.com 
THEN Should be blocked

WHEN Wait for 1 min, open www.facebook.com
THEN Should be unblocked

-------------------------

TEST THAT Restart the broweser will not affect the blocking
REQUIRES The addon to be installed into a fixed user profile (Not `cfx run`)

WHEN Go to addon setting, set timeout to 1 min

WHEN Open www.facebook.com 
THEN Should be prompted to set a timer

WHEN Set the timer to 0.1 min
THEN The page should be blocked within 0.1 minute

WHEN Try to open www.facebook.com 
THEN Should be blocked

WHEN Restart the browser, try to open www.facebook.com 
THEN Should be blocked

WHEN Wait for 1 min, open www.facebook.com
THEN Should be unblocked

-------------------------

TEST THAT state can be resumed -- 0

WHEN Set the block timeout to be 1 min

WHEN Disable then enable the addon
THEN log should go to 0:unblock

WHEN open www.facebook.com
THEN should prompt for timer input

---------------------------

TEST THAT state can be resumed -- 2

WHEN Set the block timeout to be 1 min

WHEN click the block

WHEN Open www.facebook.com
THEN should be blocked

WHEN Disable then enable the addon
THEN log should go to 2: block to old expiration

WHEN open www.facebook.com
THEN should be blocked

WHEN open wati for < 1 min
THEN should be unblocked

------------------------------

TEST THAT state can be resumed -- 3

WHEN Set the block timeout to be 1 min

(Optional) WHEN set block timer to 1 min

WHEN click the block

WHEN Open www.facebook.com
THEN should be blocked

WHEN Disable the addon

WHEN wait for 1 min

WHEN Enable the addon
THEN log should go to 3: unblocked

WHEN open www.facebook.com
THEN should prompt

------------------------------

TEST THAT state can be resumed -- 4

WHEN open www.facebook.com 
THEN should be prompted

WHEN Set the start timer to 1 min
THEN should be unblocked

WHEN Open feedly.com
THEN should not be prompted

WHEN Disable and then enable the addon
THEN should go to state 4: reset timeout

WHEN open www.facebook.com
THEN should be unblocked, no prompt

WHEN wait for < 1 min
THEN Should block

------------------------------

TEST THAT state can be resumed -- 5

WHEN open www.facebook.com 
THEN should be prompted

WHEN Set the start timer to 0.5 min
THEN should be unblocked

WHEN Disable the addon

WHEN Wait for ~0.5 min

WHEN Enable the addon
THEN should go to state 5: block from now

WHEN open www.facebook.com
THEN should be blocked

-----------------------------

TEST THAT The prompt will not show up when blocking

WHEN Click the "Start blocking"

WHEN open www.facebook.com
THEN should be blocked

WHEN go to https://tw.knowledge.yahoo.com/question/question?qid=1011110503414 //has embedded facebook page
THEN No prompt should show up


-----------------------------
TEST THAT The prompt can be disabled

WHEN In addon settings, disalbe the prompt

WHEN open www.facebook.com
THEN no prompt

WHEN In addon settings, enable the prompt
THEN existing facebook page will get a prompt

WHEN open new tab www.facebook.com
THEN get a prompt

-----------------------------
TEST THAT Unbloked even if the timer expired during system sleep

WHEN Start blocking

WHEN Let the computer sleep before the unblock timer is fired
--OR--
WHEN Set the expireTime to a earlier time

WHEN Wake the computer after the unblock timer is fired

WHEN Open www.facebook.com
THEN Should be unblocked, propmpt shows up

----------------------------
CHARTER
Test the custom blacklist function

TEST NOTE

Test the following areas:
  * Positive path
    * timed prompt
    * manual block
    * resume
    * reset default
  * Negative path
    * Bad format
    * Bad separation
  * Timing
    * Change
      * Before timer init
      * During timer countdown
      * Blocking

WHEN Wake the computer after the unblock timer is fired

WHEN Open www.facebook.com
THEN Should be unblocked, propmpt shows up
