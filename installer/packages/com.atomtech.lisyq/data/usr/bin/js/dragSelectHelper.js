// Function Helper which the same on logic Click on Select from set_track_node func from timeline.js
function add_selected_drag() {
    selected_track_indexes.length = 0;
    selected_contents_data.length = 0;
    //multiple selections
    if (selected_contents.length) {
        let ext = 0;
        for (cons of selected_contents) {
            origin_sub_pos[ext] = cons.style.left.replace(/[^\d.]/gi, "");
            var sel_tr_i = cons.parentNode.getAttribute("tracks_id");
            var sel_sub_i = cons.getAttribute("content_id");
            selected_track_indexes[ext] = sel_tr_i;
            selected_contents_data[ext] = timeline_data[sel_tr_i].sub_tracks[sel_sub_i];
            selected_contents_indexes[ext] = decople_data(sel_sub_i);
            ext++;
        }
    }
}

const selection = new SelectionArea({
    // Class for the selection-area itself (the element).
    selectionAreaClass: 'selection-area',
    // Class for the selection-area container.
    selectionContainerClass: 'selection-area-container',
    // Query selector or dom-node to set up container for the selection-area element.
    container: _('timeline_container'),
    // document object - if you want to use it within an embed document (or iframe).
    // If you're inside of a shadow-dom make sure to specify the shadow root here.
    document: window.document,
    // Query selectors for elements which can be selected.
    selectables: [".sub_track"],
    // Query selectors for elements from where a selection can be started from.
    startareas: [".timeline_main_con"],
    // Query selectors for elements which will be used as boundaries for the selection.
    // The boundary will also be the scrollable container if this is the case.
    boundaries: ['.timeline_main_con'],
    // Behaviour related options.
    behaviour: {
        // Specifies what should be done if already selected elements get selected again.
        //   invert: Invert selection for elements which were already selected
        //   keep: Keep selected elements (use clearSelection() to remove those)
        //   drop: Remove stored elements after they have been touched
        overlap: 'invert',
        // On which point an element should be selected.
        // Available modes are cover (cover the entire element), center (touch the center) or
        // the default mode is touch (just touching it).
        intersect: 'touch',
        // px, how many pixels the point should move before starting the selection (combined distance).
        // Or specifiy the threshold for each axis by passing an object like {x: <number>, y: <number>}.
        startThreshold: 10,
        // Scroll configuration.
        scrolling: {
            // On scrollable areas the number on px per frame is devided by this amount.
            // Default is 10 to provide a enjoyable scroll experience.
            speedDivider: 10,
            // Browsers handle mouse-wheel events differently, this number will be used as 
            // numerator to calculate the mount of px while scrolling manually: manualScrollSpeed / scrollSpeedDivider.
            manualSpeed: 750,
            // This property defines the virtual inset margins from the borders of the container
            // component that, when crossed by the mouse/touch, trigger the scrolling. Useful for
            // fullscreen containers.
            startScrollMargins: {
                x: 25,
                y: 25
            }
        }
    },
    // Features.
    features: {
        // Enable / disable touch support.
        touch: true,
        // Range selection.
        range: false,
        // Configuration in case a selectable gets just clicked.
        singleTap: {
            // Enable single-click selection (Also disables range-selection via shift + ctrl).
            allow: false,
            // 'native' (element was mouse-event target) or 'touch' (element visually touched).
            intersect: 'native'
        }
    }
});
selection.on('stop', getSeleceted);

selection.on('move', disableAutoHide);


function getSeleceted() {
    let items = (selection.getSelection());
  
    if(selected_contents.length <= 0){
        revoke_selections();
        
        if(selected_content != null || selected_content != undefined){
            push_to_selections(selected_content);
            selected_content.classList.add("selected_content");
        }
        

    }
  
  
    multiple_selected = true;
    for (each of items) {
        each.classList.add("selected_content");
        push_to_selections(each);
    }
    try {
        add_selected_drag();
    } catch (e) {
        //--
    }
    selection.clearSelection(true, true);
    enableAutoHide();
}
//Drag Selection End