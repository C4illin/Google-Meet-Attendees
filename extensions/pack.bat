DEL chrome-ext.zip
powershell Compress-Archive chrome\. chrome-ext.zip
EXIT

REM cat chrome-ext.zip | crx3 -p chrome-ext.pem
REM DEL gmeet-ext\js\copy.simple.user.js
REM with chrome ↓
REM "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --pack-extension=%CD%\gmeet-ext