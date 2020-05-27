DEL chrome-ext.zip
powershell Compress-Archive chrome\. chrome-ext.zip
EXIT

REM crx3 -p chrome-ext.pem chrome-ext
REM DEL gmeet-ext\js\copy.simple.user.js
REM with chrome ↓
REM "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --pack-extension=%CD%\gmeet-ext