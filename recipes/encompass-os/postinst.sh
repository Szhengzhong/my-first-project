#!/bin/bash

postinst()
{
	ROOT=$1
	SDCARD=$2
	RELEASE=$3

	# the pre install script copied the deb files to temp remove them
	display_alert "Removing software payload" "" "info"
	rm -f "${SDCARD}/tmp/encompass-portal.deb"
	rm -f "${SDCARD}/tmp/encompass-cockpit.deb"
}

export -f postinst
