document.body.addEventListener("keypress", shortcuts);
document.body.addEventListener("keyup", shortcuts_keyup);

var editing_shortcuts = true;

function shortcuts(e) {
    if (e.code === "KeyS" && e.ctrlKey) {
        save_to_file_nt();
    }

    if (e.target.tagName !== "INPUT") {
        e.preventDefault();
    } else {
        if (e.target.getAttribute('noauto')) {
            // Skip processing if input has 'noauto'
        }
        return;
    }



    // File operations
    if (e.code === "KeyO" && e.ctrlKey) {
        window.chrome.webview.hostObjects.NativeObject.Open_File();
    }

    if (e.code === "KeyQ" && e.ctrlKey) {
        window.chrome.webview.hostObjects.NativeObject.OpenPorts();
    }

    if (e.code === "KeyV" && e.ctrlKey) {
        // paste_content();
    }

    if (e.code === "KeyC" && e.ctrlKey) {
        // copy_content();
    }

    // Play/Pause
    if (e.code === "Space") {
        if (TLplaying) {
            pauseTL();
        } else {
            playTL();
        }
    }

    // Editing-related shortcuts
    if (editing_shortcuts) {
        if (e.code === "KeyZ" && e.ctrlKey) {
            if (shown) return;
            TimelineUndo();
        }

        if (e.code === "KeyY" && e.ctrlKey) {
            if (shown) return;
            TimelineRedo();
        }


        // Timeline scaling
        if (e.code === "KeyG") {
            createDialogue("time_jump");
        }

        // Timeline scaling
        if (e.code === "Equal" && e.shiftKey) {
            zoomTimeline("+");
        }

        if (e.code === "Minus" && e.shiftKey) {
            zoomTimeline("-");
        }
    }
}

function shortcuts_keyup(e) {
    if (e.target.tagName === "INPUT") return;

    try {
        if (!e.ctrlKey) {
            let keypress = e.key.toUpperCase();
            //
        }
    } catch (er) {
        console.log(er);
        // console.log(e.key.toUpperCase());
    }
}
