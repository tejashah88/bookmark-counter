if exist export.zip del export.zip

tar -a -c -f export.zip ^
    manifest.json ^
    background.js ^
    icons\icon-48.png ^
    icons\icon-128.png
