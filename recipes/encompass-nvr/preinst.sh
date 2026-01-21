#!/bin/bash

preinst()
{
	ROOT=$1
	SDCARD=$2
	RELEASE=$3

	# copy the software from the sub projects to the temp folder these will be called when chroot happens
	display_alert "Copying software payload" "" "info"
	cp "${ROOT}/portal/builds/blockone-portal.deb" "${SDCARD}/tmp/blockone-portal.deb"
	cp "${ROOT}/cockpit/builds/blockone-cockpit.deb" "${SDCARD}/tmp/blockone-cockpit.deb"
	cp "${ROOT}/nvr/builds/blockone-nvr.deb" "${SDCARD}/tmp/blockone-nvr.deb"
}

export -f preinst
