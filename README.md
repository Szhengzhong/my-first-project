# Encompass OS Images
This project is where Encompass Cast and other ARM SBC based software lives.

## Setup
This project uses the Debian Build System, NodeJS and GNU Make. You need to setup your environment first. If you are not running this in Debian 11 (Bullseye), you will first need to create a VM for this to work.

Run this command from the project root.

```
bash project setup
```

> All workflows handle permission elevation, you should never have to use sudo directly.

## Development
Each sub-project is responsible for starting itself in development mode. Simply navigate to the sub-project.

```
cd cockpit
```

Then run the debug command

```
npm run debug
```

All sub-projects will have a "debug" command.

> Note: The kiosk project must be built in Debian, but it can't run since your Debian VM doesn't have a desktop. You can either install Gnome, or you can run the kiosk's development mode on Windows or macOS.

## Building
When you need to release a new OS image, run this command from the project root.

```
npm run build
```

> If you are following this readme, you may need to call `cd ..` first.

This will build all sub-projects first, then it will build the image. You will need to select the desired SOC, Linux kernel and NodeJS release.

## Recipes
This project makes it simple to customize SBC images. In the recipes folder, there are folders for each spin of Encompass OS. You can add a preinst.sh, postinst.sh and install.sh.

**preinst.sh**  
This runs on the host when building. You can transfer scripts, .deb packages and other files to the image being built.

Values available to the preinst.sh script.

| Variable | Description                                      |
| -------- | ------------------------------------------------ |
| ROOT     | This is the full path to the project root        |
| SDCARD   | This is the path on the host to the image's root |

**install.sh**  
This runs on the image being build. During the build process, the host will chroot into the image. This allows you to install any .deb file, or use apt-get to install packages from the internet.

Values available to the install.sh script.

| Variable  | Description                                     |
| --------- | ----------------------------------------------- |
| RELEASE   | This is the OS release code name, like bullseye |
| NODE_REPO | This is the NodeJS version to install           |

**postinst.sh**  
This runs on the host after chroot is done. It is used to remove any files that were added during the pre-install or the install scripts.

Values available to the postinst.sh script.

| Variable | Description                                      |
| -------- | ------------------------------------------------ |
| ROOT     | This is the full path to the project root        |
| SDCARD   | This is the path on the host to the image's root |

A recipe **must** include these three files, you build will fail if they are not there. Any other file you may need can also live in the recipe folder.

## Maintenance
This project generates a massive number of files, all of which should not be committed to version control.

This command will remove all folders that shouldn't be committed with exception to the main builds folder.

```
npm run clean
```

> This will remove sub-builds and node_modules.
