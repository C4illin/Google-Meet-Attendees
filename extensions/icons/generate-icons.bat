inkscape -z -w 128 -h 128 icon.svg -e icon128.png
inkscape -z -w 96 -h 96 icon.svg -e icon96.png
inkscape -z -w 48 -h 48 icon.svg -e icon48.png
inkscape -z -w 32 -h 32 icon.svg -e icon32.png
inkscape -z -w 16 -h 16 icon.svg -e icon16.png

for %%f in (*.png) do copy "%%f" ..\chrome\icons\

REM The icon can't have any inline styles