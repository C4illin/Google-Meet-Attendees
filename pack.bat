COPY copy.simple.user.js gmeet-ext\js\
crx3 -p gmeet.pem gmeet-ext
DEL gmeet-ext\js\copy.simple.user.js
EXIT

REM with chrome ↓
REM "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --pack-extension=%CD%\gmeet-ext