#!/bin/bash

postinst()
{
	ROOT=$1
	SDCARD=$2
	RELEASE=$3

	# this is the autostart file it runs when openbox starts it will start the kiosk app
	display_alert "Configuring OpenBox" "" "info"
	install -d "${SDCARD}/etc/xdg"
	install -d "${SDCARD}/etc/xdg/openbox"
	install -m 755 "${ROOT}/recipes/blockone-cast/autostart" "${SDCARD}/etc/xdg/openbox/"

	# this configures linux to auto login the blockone user on the first terminal
	display_alert "Configuring autologin" "" "info"
	install -d "${SDCARD}/etc/systemd/system/getty@tty1.service.d"
	install -m 644 "${ROOT}/recipes/blockone-cast/autologin.conf" "${SDCARD}/etc/systemd/system/getty@tty1.service.d/"

	# bashrc needed to be stored in the temp folder remove it
	rm -f "${SDCARD}/tmp/.bashrc"

	# the pre install script copied the deb files to temp remove them
	display_alert "Removing software payload" "" "info"
	rm -f "${SDCARD}/tmp/blockone-portal.deb"
	rm -f "${SDCARD}/tmp/blockone-cockpit.deb"
	rm -f "${SDCARD}/tmp/blockone-kiosk-armhf.deb"
	rm -f "${SDCARD}/tmp/blockone-kiosk-arm64.deb"
	rm -f "${SDCARD}/tmp/blockone-nvr.deb"
}

export -f postinst
