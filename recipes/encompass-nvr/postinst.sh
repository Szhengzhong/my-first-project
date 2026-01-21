#!/bin/bash

postinst()
{
	ROOT=$1
	SDCARD=$2
	RELEASE=$3

	# this configures linux to auto login the encompass user on the first terminal
	display_alert "Configuring autologin" "" "info"
	install -d "${SDCARD}/etc/systemd/system/getty@tty1.service.d"
	install -m 644 "${ROOT}/recipes/encompass-cast/autologin.conf" "${SDCARD}/etc/systemd/system/getty@tty1.service.d/"

	# the pre install script copied the deb files to temp remove them
	display_alert "Removing software payload" "" "info"
	rm -f "${SDCARD}/tmp/encompass-portal.deb"
	rm -f "${SDCARD}/tmp/blockone-cockpit.deb"
	rm -f "${SDCARD}/tmp/encompass-nvr.deb"
}

export -f postinst
