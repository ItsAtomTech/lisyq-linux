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



       // Add LD_LIBRARY_PATH to ~/.bashrc permanently
        component.addOperation("Execute",
            "bash", "-c",
            "echo 'export LD_LIBRARY_PATH=@TargetDir@/usr/lib:$LD_LIBRARY_PATH' >> @HomeDir@/.bashrc"
        );



    component.addOperation("CreateDesktopEntry",
        "@HomeDir@/.local/share/applications/LiSyQ.desktop",
        "Type=Application\nName=LiSyQ\nExec=bash -c 'export LD_LIBRARY_PATH=@TargetDir@/usr/lib:$LD_LIBRARY_PATH && @TargetDir@/usr/bin/LiSyQ \"$1\"' -- %f\nIcon=@TargetDir@/usr/share/icons/hicolor/256x256/apps/logo.png\nCategories=Utility\nMimeType=application/x-lisyq;"
    );

    // Register MIME type

    //Some Distros need this
    component.addOperation("Mkdir",
        "@HomeDir@/.local/share/mime/packages");

    component.addOperation("Copy",
        "@TargetDir@/usr/share/mime/packages/lisyq.xml",
        "@HomeDir@/.local/share/mime/packages/lisyq.xml");

    component.addOperation("Execute", "update-mime-database",
        "@HomeDir@/.local/share/mime");

    // Register desktop file
    component.addOperation("Execute", "update-desktop-database",
        "@HomeDir@/.local/share/applications");
        
    }
}
