function Component() {}

Component.prototype.createOperations = function() {
    component.createOperations();
    if (systemInfo.productType === "windows") {
        // Windows shortcut if ever needed
    } else {
        // Install required system dependency
        component.addOperation("Execute",
            "bash", "-c",
            "apt-get install -y libxcb-cursor0 || true"
        );

        component.addOperation("CreateDesktopEntry",
            "@HomeDir@/.local/share/applications/LiSyQ.desktop",
            "Type=Application\nName=LiSyQ\nExec=@TargetDir@/usr/bin/LiSyQ\nIcon=@TargetDir@/usr/share/icons/hicolor/256x256/apps/logo.png\nCategories=Utility;"
        );
    }
}
