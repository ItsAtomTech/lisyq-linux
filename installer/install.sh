#!/usr/bin/env bash

INSTALLER_NAME="LiSyQ_Installer.run"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALLER="$SCRIPT_DIR/$INSTALLER_NAME"

if [ "$(id -u)" -eq 0 ]; then
    echo "Please run this script as a normal user, not with sudo."
    echo "It will ask for your password only when needed."
    exit 1
fi

if [ ! -f "$INSTALLER" ]; then
    echo "Could not find $INSTALLER_NAME next to this script."
    exit 1
fi

chmod +x "$INSTALLER"

APT_PACKAGES=(
    libxkbcommon-x11-0
    libxcb-cursor0
    libxcb-icccm4
    libxcb-image0
    libxcb-keysyms1
    libxcb-render-util0
    libxcb-xinerama0
    libxcb-xkb1
    libxcb-shape0
    libxcb-randr0
    libopengl0
    libgl1
    libegl1
    libfontconfig1
    libdbus-1-3
)

DNF_PACKAGES=(
    libxkbcommon-x11
    xcb-util-cursor
    xcb-util-wm
    xcb-util-image
    xcb-util-keysyms
    xcb-util-renderutil
    libglvnd-opengl
    libglvnd-egl
    mesa-libGL
)

PACMAN_PACKAGES=(
    libxkbcommon-x11
    xcb-util-cursor
    xcb-util-wm
    xcb-util-image
    xcb-util-keysyms
    xcb-util-renderutil
    libglvnd
)

install_apt() {
    local missing=()
    local pkg

    for pkg in "${APT_PACKAGES[@]}"; do
        if ! dpkg -s "$pkg" >/dev/null 2>&1; then
            missing+=("$pkg")
        fi
    done

    if [ ${#missing[@]} -eq 0 ]; then
        echo "All required libraries are already installed."
        return
    fi

    echo "Missing libraries: ${missing[*]}"
    sudo apt-get update

    for pkg in "${missing[@]}"; do
        if apt-cache show "$pkg" >/dev/null 2>&1; then
            sudo apt-get install -y "$pkg" || echo "Failed to install $pkg, continuing."
        else
            echo "Package $pkg is not available on this system, skipping."
        fi
    done
}

install_dnf() {
    sudo dnf install -y "${DNF_PACKAGES[@]}" || echo "Some packages failed to install, continuing."
}

install_pacman() {
    sudo pacman -S --needed --noconfirm "${PACMAN_PACKAGES[@]}" || echo "Some packages failed to install, continuing."
}

echo "Checking dependencies for LiSyQ installer..."

if command -v apt-get >/dev/null 2>&1; then
    install_apt
elif command -v dnf >/dev/null 2>&1; then
    install_dnf
elif command -v pacman >/dev/null 2>&1; then
    install_pacman
else
    echo "Unknown package manager. Please install the Qt xcb libraries manually."
fi

echo "Starting LiSyQ installer..."
"$INSTALLER" "$@"
