mkdir release
rm -r release/*
cp -r \
  background.js \
  manifest.json \
  options.html \
  options.js \
  release

mkdir release/data
cp -r \
  data/block.js \
  data/noicon-16.png \
  data/noicon-128.png \
  release/data

cd release
# rm release.zip
zip -r release.zip *
