#!/bin/bash

preinst()
{
	ROOT=$1
	SDCARD=$2
	RELEASE=$3

	display_alert "Copying software payload" "" "info"

	# copy the software from the sub projects to the temp folder these will be called when chroot happens
	cp "${ROOT}/portal/builds/encompass-portal.deb" "${SDCARD}/tmp/encompass-portal.deb"
	cp "${ROOT}/cockpit/builds/encompass-cockpit.deb" "${SDCARD}/tmp/encompass-cockpit.deb"
	cp "${ROOT}/kiosk/builds/encompass-kiosk-armhf.deb" "${SDCARD}/tmp/encompass-kiosk-armhf.deb"
	cp "${ROOT}/kiosk/builds/encompass-kiosk-arm64.deb" "${SDCARD}/tmp/encompass-kiosk-arm64.deb"

	# bashrc needs to be moved and the permissions need to be set move it to temp for the install script
	cp "${ROOT}/recipes/encompass-cast/.bashrc" "${SDCARD}/tmp/.bashrc"
}

export -f preinst
