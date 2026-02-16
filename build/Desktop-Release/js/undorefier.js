// ─── Undo/Redo System v1.2 ───
// Supports multiple selections

var undo_stack = [];
var redo_stack = [];
let unredoType = "default";

/**
 * Adds a new action to the undo stack and clears the redo stack.
 * @param {Object} data - Action data to be stored for undo.
 */
function add_undo(data) {
    if (data == undefined) {
        return console.warn("Trying to add undefined to undo stack");
    }
    undo_stack.push(data);
    redo_stack.length = 0; // Clear redo stack on new undo entry
}

/**
 * Retrieves the last undo item and pushes it to the redo stack.
 * @returns {Object|boolean} - The undo data or false if empty.
 */
function get_undo() {
    if (undo_stack.length <= 0) {
        console.log("No undo item left");
        try { showToast("No Undo item left"); } catch (e) {}
        return false;
    }

    var undo_data = undo_stack.pop();
    redo_stack.push(undo_data);
    return undo_data;
}

/**
 * Retrieves the last redo item and pushes it to the undo stack.
 * @returns {Object|boolean} - The redo data or false if empty.
 */
function get_redo() {
    if (redo_stack.length <= 0) {
        console.log("No redo item left");
        try { showToast("No Redo item left"); } catch (e) {}
        return false;
    }

    var redo_data = redo_stack.pop();
    undo_stack.push(redo_data);
    return redo_data;
}

/**
 * Clears both undo and redo stacks.
 */
function reset_undo_redo() {
    redo_stack.length = 0;
    undo_stack.length = 0;
    return true;
}

// ─── Main Undo Operation ───
function undo() {
    var undo_data = get_undo();
    if (undo_data == false) return false;

    if (undo_data.type == 'subtrack') {
        switch (undo_data.data.type_of_action) {
            case "add":
                if (typeof undo_data.data.index == 'object') {
                    let exIndex = 0;
                    let idxfliped = decople_data(undo_data.data.index).reverse();
                    let data_fliped = decople_data(undo_data.data.subtrack_index).reverse();

                    for (idx of idxfliped) {
                        selected_track_index = idx;
                        remove_content(data_fliped[exIndex], 'undo');
                        exIndex++;
                    }
                } else {
                    selected_track_index = undo_data.data.index;
                    remove_content(undo_data.data.subtrack_index, 'undo');
                }
                break;

            case "delete":
                if (typeof undo_data.data.index == 'object') {
                    let exIndex = 0;
                    for (idx of undo_data.data.index) {
                        selected_track_index = idx;
                        if (unredoType == "nested") {
                            addToNestTimeline(undo_data.data, 'undo', 'insert', sub_track_index);
                        } else {
                            var sub_track_index = undo_data.data.subtrack_index[exIndex];
                            add_sub_tracks(undo_data.data.track_data[[exIndex]], 'undo', 'insert', sub_track_index);
                        }
                        exIndex++;
                    }
                } else {
                    selected_track_index = undo_data.data.index;
                    if (unredoType == "nested") {
                        addToNestTimeline(undo_data.data, 'undo', 'insert');
                    } else {
                        var sub_track_index = parseInt(undo_data.data.subtrack_index);
                        add_sub_tracks(undo_data.data.track_data, 'undo', 'insert', sub_track_index);
                    }
                }
                break;

            case "edit":
                if (typeof undo_data.data.index == 'object') {
                    let exIndex = 0;
                    for (idx of undo_data.data.index) {
                        selected_track_index = idx;
                        var parent_node = parentTrack(idx);
                        selected_content = parent_node.querySelector('[content_id="' + undo_data.data.subtrack_index[exIndex] + '"]');
                        if (unredoType == "nested") {
                            modifySubtract(undo_data.data, "undo");
                        } else {
                            modify_sub_track(undo_data.data.track_data[exIndex], 'undo');
                        }
                        exIndex++;
                    }
                } else {
                    selected_track_index = undo_data.data.index;
                    var parent_node = parentTrack(undo_data.data.index);
                    selected_content = parent_node.querySelector('[content_id="' + undo_data.data.subtrack_index + '"]');
                    if (unredoType == "nested") {
                        modifySubtract(undo_data.data, "undo");
                    } else {
                        modify_sub_track(undo_data.data.track_data, 'undo');
                    }
                }
                break;
        }

    } else if (undo_data.type == 'track') {
        switch (undo_data.data.type_of_action) {
            case "add":
                selected_track_index = undo_data.data.index;
                remove_track(undo_data.data.index, 'redo');
                break;

            case "delete":
                selected_track_index = undo_data.data.index;
                add_track(undo_data.data.index, 'undo');
                timeline_data[undo_data.data.index] = undo_data.data.track_data;
                refresh_track(undo_data.data.index);
                break;

            case "edit":
                selected_track_index = undo_data.data.index;
                timeline_data[undo_data.data.index] = undo_data.data.track_data;
                refresh_track(undo_data.data.index);
                break;
        }
    }
}

// ─── Main Redo Operation ───
function redo() {
    var redo_data = get_redo();
    if (redo_data == false) return false;

    if (redo_data.type == 'subtrack') {
        switch (redo_data.data.type_of_action) {
            case "add":
                if (typeof redo_data.data.index == 'object') {
                    let exIndex = 0;
                    for (idx of redo_data.data.index) {
                        selected_track_index = idx;
                        if (unredoType != "nested") {
                            var sub_track_index = redo_data.data.subtrack_index[exIndex];
                            add_sub_tracks(redo_data.data.track_data[[exIndex]], 'redo', 'insert', sub_track_index);
                        }
                        exIndex++;
                    }
                } else {
                    selected_track_index = redo_data.data.index;
                    var sub_track_index = redo_data.data.subtrack_index;
                    if (unredoType == "nested") {
                        addToNestTimeline(redo_data.data, 'redo', 'insert', sub_track_index);
                    } else {
                        add_sub_tracks(redo_data.data.track_data, 'redo', 'insert', sub_track_index);
                    }
                }
                break;

            case "delete":
                if (typeof redo_data.data.index == 'object') {
                    let exIndex = 0;
                    let idxfliped = decople_data(redo_data.data.index).reverse();
                    let data_fliped = decople_data(redo_data.data.subtrack_index).reverse();

                    for (idx of idxfliped) {
                        selected_track_index = idx;
                        remove_content(data_fliped[exIndex], 'undo');
                        exIndex++;
                    }
                } else {
                    selected_track_index = redo_data.data.index;
                    remove_content(redo_data.data.subtrack_index, 'redo');
                }
                break;

            case "edit":
                if (typeof redo_data.data.index == 'object') {
                    let exIndex = 0;
                    for (idx of redo_data.data.index) {
                        selected_track_index = idx;
                        var parent_node = parentTrack(idx);
                        selected_content = parent_node.querySelector('[content_id="' + redo_data.data.subtrack_index[exIndex] + '"]');
                        modify_sub_track(redo_data.data.track_data[exIndex], 'undo');
                        exIndex++;
                    }
                } else {
                    selected_track_index = redo_data.data.index;
                    var parent_node = parentTrack(redo_data.data.index);
                    selected_content = parent_node.querySelector('[content_id="' + redo_data.data.subtrack_index + '"]');
                    if (unredoType == "nested") {
                        modifySubtract(redo_data.data, "redo");
                    } else {
                        modify_sub_track(redo_data.data.track_data, 'redo');
                    }
                }
                break;
        }

    } else if (redo_data.type == 'track') {
        switch (redo_data.data.type_of_action) {
            case "add":
                selected_track_index = redo_data.data.index;
                add_track(redo_data.data.index, 'undo');
                timeline_data[redo_data.data.index] = redo_data.data.track_data;
                refresh_track(redo_data.data.index);
                break;

            case "delete":
                selected_track_index = redo_data.data.index;
                remove_track(redo_data.data.index, 'redo');
                break;

            case "edit":
                selected_track_index = redo_data.data.index;
                timeline_data[redo_data.data.index] = redo_data.data.track_data;
                refresh_track(redo_data.data.index);
                break;
        }
    }
}

// ─── Helper: Format Data for Undo System ───

function undo_format_data(type, data) {
    return {
        type: type,
        data: decople_data(data)
    };
}

function track_undo_format(action_command, index, track) {
    return {
        type_of_action: action_command,
        index: index,
        track_data: track
    };
}

function subtrack_undo_format(action_command, index, track, subtrack_index) {
    return {
        type_of_action: action_command,
        index: index,
        subtrack_index: subtrack_index,
        track_data: track
    };
}

/**
 * Pushes an undo operation onto the stack.
 * @param {string} type - 'track' or 'subtrack'
 * @param {string} action_command - 'add', 'edit', or 'delete'
 * @param {number|array} index - affected index/indices
 * @param {object|array} data - data of the affected item(s)
 * @param {number|array} subtrack_index - subtrack index (optional for subtrack)
 */
function push_undo(type, action_command, index, data, subtrack_index) {
    var udata;
    switch (type) {
        case "track":
            udata = undo_format_data(type, track_undo_format(action_command, index, data));
            break;
        case "subtrack":
            udata = undo_format_data(type, subtrack_undo_format(action_command, index, data, subtrack_index));
            break;
        default:
            return false;
    }
    add_undo(udata);
    
    optimizedData=false;
}