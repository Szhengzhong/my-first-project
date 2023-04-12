#!/bin/bash -e

preinst "${SRC}/.." "${ROOTFS_DIR}" $RELEASE

install -v -m 755 "${RECIPE}/install.sh" "${ROOTFS_DIR}/tmp/"

on_chroot << EOF
/bin/bash -c "/tmp/install.sh $RELEASE $NODE_REPO"
EOF

postinst "${SRC}/.." "${ROOTFS_DIR}" $RELEASE

rm -f "${ROOTFS_DIR}"/tmp/install.sh
rm -f "${ROOTFS_DIR}"/etc/update-motd.d/*
rm -f "${ROOTFS_DIR}"/etc/issue
rm -f "${ROOTFS_DIR}"/etc/motd
rm -f "${ROOTFS_DIR}"/etc/update-motd.d/10-uname

install -m 644 "${SRC}/config/motd/issue" "${ROOTFS_DIR}/etc/issue"
install -m 644 "${SRC}/config/motd/motd" "${ROOTFS_DIR}/etc/motd"
install -m 755 "${SRC}/config/motd/10-uname" "${ROOTFS_DIR}/etc/update-motd.d/10-uname"
install -m 755 "${SRC}/config/motd/20-network" "${ROOTFS_DIR}/etc/update-motd.d/20-network"
