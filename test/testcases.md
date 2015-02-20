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
