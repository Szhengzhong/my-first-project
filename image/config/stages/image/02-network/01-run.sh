#!/bin/bash -e

on_chroot <<EOF
rm /etc/resolv.conf
ln -sf /lib/systemd/resolv.conf /etc/resolv.conf
echo -e "nameserver 8.8.8.8\n" >> /etc/resolv.conf
EOF
