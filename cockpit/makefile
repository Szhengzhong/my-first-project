cockpit: clean paths metadata package deploy vue modules
	dpkg-deb --build dist
	cp dist.deb builds/blockone-cockpit.deb
	rm -f dist.deb
	rm -fR dist
	rm -fR interface

paths:
	mkdir -p interface
	mkdir -p builds
	mkdir -p dist
	mkdir -p dist/DEBIAN
	mkdir -p dist/usr
	mkdir -p dist/usr/lib
	mkdir -p dist/usr/lib/cockpit
	mkdir -p dist/usr/lib/systemd
	mkdir -p dist/usr/lib/systemd/system
	mkdir -p dist/usr/bin

metadata:
	cat control | \
	sed "s/__VERSION__/$(shell ./project version)/" | \
	sed "s/__ARCH__/all/" > dist/DEBIAN/control

package:
	node -e 'const pjson = require("./package.json"); delete pjson.devDependencies; require("fs").writeFileSync("dist/usr/lib/cockpit/package.json", JSON.stringify(pjson, null, 4));'

deploy:
	cp -R main dist/usr/bin/cockpit
	cp -R cli.js dist/usr/lib/cockpit/
	cp -R api.js dist/usr/lib/cockpit/
	cp -R lib dist/usr/lib/cockpit/
	cp -R cockpit.service dist/usr/lib/systemd/system/cockpit.service
	cp -R postinst dist/DEBIAN/postinst

vue:
	rm -fR ./interface/*
	./node_modules/.bin/vue-cli-service build --modern
	cp -R interface dist/usr/lib/cockpit/

modules:
	(cd dist/usr/lib/cockpit && npm_config_loglevel=silent npm install --no-audit)

clean:
	rm -fR dist
	rm -fR interface
