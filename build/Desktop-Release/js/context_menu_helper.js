//Maker Context Menu

let markerMENU = [
	  {
		"text": "Delete Marker",                         // Text to display
		"icon": '<img class="context_item" src="images/trash_can.png" />', // Icon to display next to the text
		//Trash can icons created by Freepik - Flaticon</a>
		"events":{
			"click": function(e){
				markerRemoveOnContext(e);
			  },
		}
	  },
	  {
		"type": ContextMenu.DIVIDER              
	  },
	  {
		"text": "Cancel",
		"events": {
		  "click": function(e){
			return;
		  },
		}
	  }
];


let marker_menu = new ContextMenu(markerMENU);
	marker_menu.changeOption("close_on_click",true);
	marker_menu.reload();


	
//init Makarker menu on Marker lib
Marker_Maker.contextMenuHandler = openContextMenuMarker;
	
	
function openContextMenuMarker(elm){
	marker_menu.display(event);
	Marker_Maker.selectMarker(elm);
	
}

function markerRemoveOnContext(){
	removeMarker();
}	
	