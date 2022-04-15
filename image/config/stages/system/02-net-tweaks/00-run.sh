#!/bin/bash -e

echo "encompass" > "${ROOTFS_DIR}/etc/hostname"
echo "127.0.1.1		encompass" >> "${ROOTFS_DIR}/etc/hosts"

on_chroot << EOF
	SUDO_USER="encompass" raspi-config nonint do_net_names 1
EOF
