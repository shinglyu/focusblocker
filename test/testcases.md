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
