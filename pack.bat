DEL gmeet-ext.zip
COPY copy.simple.user.js gmeet-ext\js\
powershell Compress-Archive gmeet-ext\. gmeet-ext.zip
crx3 -p gmeet.pem gmeet-ext
DEL gmeet-ext\js\copy.simple.user.js
EXIT

REM 
REM with chrome ↓
REM "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --pack-extension=%CD%\gmeet-ext