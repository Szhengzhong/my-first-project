#!/bin/bash

preinst()
{
	ROOT=$1
	SDCARD=$2
	RELEASE=$3

	# copy the software from the sub projects to the temp folder these will be called when chroot happens
	display_alert "Copying software payload" "" "info"
	cp "${ROOT}/portal/builds/encompass-portal.deb" "${SDCARD}/tmp/encompass-portal.deb"
	cp "${ROOT}/cockpit/builds/blockone-cockpit.deb" "${SDCARD}/tmp/blockone-cockpit.deb"
	cp "${ROOT}/nvr/builds/encompass-nvr.deb" "${SDCARD}/tmp/encompass-nvr.deb"
}

export -f preinst
