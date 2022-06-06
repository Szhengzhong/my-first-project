#!/bin/bash

preinst()
{
	ROOT=$1
	SDCARD=$2
	RELEASE=$3

	# copy the software from the sub projects to the temp folder these will be called when chroot happens
	display_alert "Copying software payload" "" "info"
	cp "${ROOT}/portal/builds/encompass-portal.deb" "${SDCARD}/tmp/encompass-portal.deb"
	cp "${ROOT}/cockpit/builds/encompass-cockpit.deb" "${SDCARD}/tmp/encompass-cockpit.deb"
}

export -f preinst
