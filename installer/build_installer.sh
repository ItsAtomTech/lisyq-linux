#!/bin/bash

echo "Starting LiSyQ installer build..."
echo "Using Qt Installer Framework: ~/Qt/Tools/QtInstallerFramework/4.10/bin"
echo ""

echo "[1/3] Validating config and packages..."
if [ ! -f "config/config.xml" ]; then
    echo "ERROR: config/config.xml not found!"
    exit 1
fi
if [ ! -d "packages" ]; then
    echo "ERROR: packages directory not found!"
    exit 1
fi
echo "      Config and packages OK."
echo ""

echo "[2/3] Running binarycreator..."
~/Qt/Tools/QtInstallerFramework/4.10/bin/binarycreator \
  --offline-only \
  -c config/config.xml \
  -p packages \
  LiSyQ_Installer.run
echo ""

if [ $? -eq 0 ]; then
    echo "[3/3] Build complete! Output: LiSyQ_Installer.run"
else
    echo "[3/3] Build FAILED. Check the output above for errors."
    exit 1
fi
