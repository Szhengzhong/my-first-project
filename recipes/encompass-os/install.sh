#!/bin/bash

RELEASE=$1
NODE_REPO=$2

message()
{
	local tmp=""

	[[ -n $2 ]] && tmp="[\e[0;33m $2 \x1B[0m]"

	case $3 in
		err)
			echo -e "[\e[0;31m error \x1B[0m] $1 $tmp"
			;;

		wrn)
			echo -e "[\e[0;35m warn \x1B[0m] $1 $tmp"
			;;

		ext)
			echo -e "[\e[0;32m o.k. \x1B[0m] \e[1;32m$1\x1B[0m $tmp"
			;;

		info)
			echo -e "[\e[0;32m o.k. \x1B[0m] $1 $tmp"
			;;

		*)
			echo -e "[\e[0;32m .... \x1B[0m] $1 $tmp"
			;;
	esac
}

alternates() {
	if [ "|${RELEASE}|" == "|${1}|" ]; then
		RELEASE="${2}"
	fi
}

reset() {

	# remove keys and source files ensures a clean install
	rm -f /usr/share/keyrings/nodesource.gpg > /dev/null 2>&1
	rm -f /usr/share/keyrings/yarnkey.gpg > /dev/null 2>&1

	rm -f /etc/apt/sources.list.d/nodesource.list > /dev/null 2>&1
	rm -f /etc/apt/sources.list.d/yarn.list > /dev/null 2>&1
}

validate() {
	if $(uname -m | grep -Eq ^armv6); then
		message "device specifies an unsupported architecture" "armv6" "err"

		exit 1
	fi

	# map debian spins to the debian code name
	alternates "solydxk-9" "stretch"
	alternates "sana" "jessie"
	alternates "kali-rolling" "bullseye"
	alternates "Tyche" "stretch"
	alternates "Nibiru" "buster"
	alternates "Horizon" "stretch"
	alternates "Continuum" "stretch"
	alternates "patito feo" "buster"
	alternates "maya" "precise"
	alternates "qiana" "trusty"
	alternates "rafaela" "trusty"
	alternates "rebecca" "trusty"
	alternates "rosa" "trusty"
	alternates "sarah" "xenial"
	alternates "serena" "xenial"
	alternates "sonya" "xenial"
	alternates "sylvia" "xenial"
	alternates "tara" "bionic"
	alternates "tessa" "bionic"
	alternates "tina" "bionic"
	alternates "tricia" "bionic"
	alternates "ulyana" "focal"
	alternates "ulyssa" "focal"
	alternates "uma" "focal"
	alternates "betsy" "jessie"
	alternates "cindy" "stretch"
	alternates "debbie" "buster"
	alternates "luna" "precise"
	alternates "freya" "trusty"
	alternates "loki" "xenial"
	alternates "juno" "bionic"
	alternates "hera" "bionic"
	alternates "odin" "focal"
	alternates "toutatis" "precise"
	alternates "belenos" "trusty"
	alternates "flidas" "xenial"
	alternates "etiona" "bionic"
	alternates "lugalbanda" "xenial"
	alternates "anokha" "wheezy"
	alternates "anoop" "jessie"
	alternates "drishti" "stretch"
	alternates "unnati" "buster"
	alternates "bunsen-hydrogen" "jessie"
	alternates "helium" "stretch"
	alternates "lithium" "buster"
	alternates "chromodoris" "jessie"
	alternates "green" "sid"
	alternates "amber" "buster"
	alternates "jessie" "jessie"
	alternates "ascii" "stretch"
	alternates "beowulf" "buster"
	alternates "ceres" "sid"
	alternates "panda" "sid"
	alternates "unstable" "sid"
	alternates "stable" "buster"
	alternates "onyedi" "stretch"
	alternates "lemur-3" "stretch"
	alternates "orel" "stretch"
	alternates "dolcetto" "stretch"
	alternates "jammy" "bullseye"

	if [ "|${RELEASE}|" == "|debian|" ]; then
		FOUND=$([ -e /etc/debian_version ] && cut -d/ -f1 < /etc/debian_version)

		if [ "|${NEWRELEASE}|" != "||" ]; then
			RELEASE=$FOUND
		fi
	fi
}

availability() {

	# check to see if there is a nodesource repo for this distro
	bash -c "curl -sLf -o /dev/null 'https://deb.nodesource.com/${NODE_REPO}/dists/${RELEASE}/Release'"

	if [[ $? != 0 ]]; then
		message "device specifies an unsupported operating system" "" "err"

		exit 1
	fi
}

prerequisites() {

	# these are required to run node npm and register with mdns
	PREREQUISITES=" ca-certificates libgnutls30 git make gcc g++ avahi-daemon avahi-utils ntp"

	if [ ! -e /usr/lib/apt/methods/https ]; then
		PREREQUISITES="${PREREQUISITES} apt-transport-https"
	fi

	if [ ! -x /usr/bin/lsb_release ]; then
		PREREQUISITES="${PREREQUISITES} lsb-release"
	fi

	if [ ! -x /usr/bin/curl ]; then
		PREREQUISITES="${PREREQUISITES} curl"
	fi

	if [ ! -x /usr/bin/gpg ]; then
		PREREQUISITES="${PREREQUISITES} gnupg"
	fi

	if [ "|${PREREQUISITES}|" != "||" ]; then
		bash -c "apt-get update && apt-get install -y${PREREQUISITES}"
	fi
}

setup() {

	# download and install required gpg keys for the nodesource and yarn repos
	curl -ks https://deb.nodesource.com/gpgkey/nodesource.gpg.key | gpg --dearmor | tee /usr/share/keyrings/nodesource.gpg > /dev/null
	curl -ks https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | tee /usr/share/keyrings/yarnkey.gpg > /dev/null

	# configure the nodesource repo
	echo "deb [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/${NODE_REPO} ${RELEASE} main" | tee /etc/apt/sources.list.d/nodesource.list > /dev/null 2>&1
	echo "deb-src [signed-by=/usr/share/keyrings/nodesource.gpg] https://deb.nodesource.com/${NODE_REPO} ${RELEASE} main" | tee -a /etc/apt/sources.list.d/nodesource.list > /dev/null 2>&1
	echo "" | tee -a /etc/apt/sources.list.d/nodesource.list > /dev/null 2>&1

	# configure the yarn repo
	echo "deb [signed-by=/usr/share/keyrings/yarnkey.gpg] https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list > /dev/null 2>&1
	echo "" | tee -a /etc/apt/sources.list.d/yarn.list > /dev/null 2>&1

	# make sure the software sources is up to date after this change
	apt-get update
}

users() {
	message "Adding Encompass user" "" "info"

	# the encompass user is added earlier in some build configs only add it if it doesn't exist
	if ! id -u encompass > /dev/null 2>&1; then
		adduser --gecos encompass --disabled-password encompass > /dev/null 2>&1
	fi

	# make sure the encompass user can use the sudo command
	adduser encompass sudo > /dev/null 2>&1
	echo "encompass:loadsheet" | chpasswd > /dev/null 2>&1

	# don't want root to be able to login
	message "Locking root account" "" "info"
	passwd -l root 2>&1
}

software() {
	message "Installing required packages" "" "info"

	# these are needed to run the wifi portal
	apt-get update
	apt-get install -y nodejs network-manager dnsmasq hostapd

	# this is the wifi portal package
	message "Installing WiFi portal" "" "info"
	dpkg -i /tmp/blockone-portal.deb

	# this is the web interface that allows users to remotely reboot this device
	message "Installing Device Control" "" "info"
	dpkg -i /tmp/blockone-cockpit.deb
}

watchdog() {
	message "Installing watchdog" "" "info"

	# watchdog ensures that this device continues to run
	apt-get update
	apt-get install -y watchdog
	update-rc.d watchdog defaults

	# configure watchdog to reboot the device if it detects a crash
	echo "watchdog-device = /dev/watchdog" | tee /etc/watchdog.conf > /dev/null 2>&1
	echo "watchdog-timeout = 15" | tee -a /etc/watchdog.conf > /dev/null 2>&1
	echo "max-load-1 = 24" | tee -a /etc/watchdog.conf > /dev/null 2>&1
	echo "min-memory = 1" | tee -a /etc/watchdog.conf > /dev/null 2>&1
	echo "" | tee -a /etc/watchdog.conf > /dev/null 2>&1

	# watchdog is a service it needs to be enabled
	systemctl enable watchdog > /dev/null 2>&1
}

# validate if node can be installed fail if not
message "Validating NodeSource repository" "${RELEASE}" "info"
validate

# reset and install required packages
message "Installing required packages" "" "info"
reset
prerequisites

# check to see if there is a nodesource repo fail if not
message "Checking if NodeSource release is available" "${RELEASE}" "info"
availability

# main install function calls
message "Configuring extra apt repos" "" "info"
setup
users
software
watchdog
