#!/bin/bash -e

echo "blockone" > "${ROOTFS_DIR}/etc/hostname"
echo "127.0.1.1		blockone" >> "${ROOTFS_DIR}/etc/hosts"

on_chroot << EOF
	SUDO_USER="blockone" raspi-config nonint do_net_names 1
EOF
