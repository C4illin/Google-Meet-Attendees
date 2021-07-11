DEL chrome-ext.zip
copy ..\copy.simple.user.js chrome\js\copy.simple.user.js
powershell Compress-Archive chrome\. chrome-ext.zip

REM Ugly copying but it works
xcopy chrome\_locales microsoft\_locales\ /E /Y
xcopy chrome\html microsoft\html\ /Y
xcopy chrome\icons microsoft\icons\ /Y
xcopy chrome\js microsoft\js\ /Y

xcopy chrome\html firefox\html\ /Y
xcopy chrome\icons firefox\icons\ /Y
xcopy chrome\js firefox\js\ /Y
@REM xcopy chrome\_locales firefox\_locales\ /E /Y

DEL microsoft-ext.zip
powershell Compress-Archive microsoft\. microsoft-ext.zip

@REM DEL firefox-ext.xpi
@REM powershell Compress-Archive firefox\* firefox-ext.zip
@REM REN firefox-ext.zip firefox-ext.xpi
EXIT

REM cat chrome-ext.zip | crx3 -p chrome-ext.pem
REM DEL gmeet-ext\js\copy.simple.user.js
REM with chrome ↓
REM "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --pack-extension=%CD%\gmeet-ext