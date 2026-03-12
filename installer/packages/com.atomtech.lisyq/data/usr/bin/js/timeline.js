var time_per_pexil = 30; //1 pexil = 30... milisecond for this program
						//33 pexils = 1 sec.

var time = 0;
var selected_track_index = 0;
var selected_track_indexes = [];
var initial_pos_sub_track = [];
var play_start = setInterval(rails, time_per_pexil);
var selected_content;

var selected_contents = [];
var selected_contents_data = [];
var selected_contents_indexes = [];

var loaded_from_data = false;
var sub_data_id;

var zoom_scale = 1;
var move_sensitivity = 1;
var content_id = 0;
var tracks_id = 0;
var has_moved;

var current_mode = "add";
var editFrom = "timeline";
var default_stream = "00000";
var optimizedData = false;


// Elements
var main_timeline = _("timeline_");
let timeline_container = _("timeline_container");
var origin_sub;
var origin_sub_pos = [];
var can_move_track = true;
var click_on_track;
var follow_playhead = false;
var context_menu = false;
var left_margin = 0;


//Play States
var playing = false;
var loop = false;
var is_preview = false;
var delay = 0;


var playMode = 'timeline'; //values: timeline, manual, both



//Save_type
var include_data = settings.get('includeData');
let fileOptions = {}; //storing the config values for this script

//Animating and playing

let lastTime
var delta;
var f_time = true;
let limitThreshold = 2;




//Misc
var markers = [];
var copied;
var copies = [];


//Utilities
function _(elm){
	return document.getElementById(elm);
}





 function get_size(elm){ //getting the size of an element	
	var refh = elm;
	var size = ['',''];

try{
	if(refh.offsetHeight){
		
		size[1] = refh.offsetHeight;
		size[0] = refh.offsetWidth;
		
	}else if(refh.style.pixelHeight){
		size[1] = refh.style.pixelHeight
		size[0] = refh.style.pixelWidth
		
	}
	
	}catch(e){
		console.log("Invalid Element");
	}
	return size;
}

function capInput(ipt,min,max){
	if(ipt > max){
		return max;		
	}else if(ipt < min){
		return min;
	}
	return ipt;
}


function parentTrack(id){
	
	var parent = document.getElementsByClassName('track_con')[id];
	return parent;
	
	
}


function locateNode(parentID, childID){
	//unfinished
	
	var parent = document.getElementsByClassName('track_con')[parentID];
	return parent;
	
}

if(typeof make !== 'function'){
   window.make = function(elm){ return document.createElement(elm);};
}

//create the track bound info bar 
function createTrackBound(data){
	let track_port;
	let channel;
		
		
	if(timeline_data[data.track_id] != undefined){
		let track_data_ = timeline_data[data.track_id];
		try{
			track_port = track_data_.port_channel;
			channel = track_data_.target_channel;
		}catch(e){
			//-
		}
		
	}
	
	
	
let trackInfo = make('div');
	trackInfo.setAttribute('class', 'track_info_bound');
	trackInfo.setAttribute('tabindex',1);
	trackInfo.setAttribute('parent_track',data.track_id);
	trackInfo.setAttribute('title',"Channel: "+ channel + "\n Port: "+track_port);
	
		var trackInfo_SPAN = make('span');
		trackInfo_SPAN.setAttribute('class', 'info_con');

			var trackInfo_SPAN_SPAN = make('span');
			trackInfo_SPAN_SPAN.setAttribute('class', 'track_num');
			trackInfo_SPAN_SPAN.innerText = data.track_id;
		trackInfo_SPAN.appendChild(trackInfo_SPAN_SPAN);

	trackInfo.appendChild(trackInfo_SPAN);

		var trackInfo_SPAN = make('span');
		trackInfo_SPAN.setAttribute('class', 'options_con_');

			var trackInfo_SPAN_SPAN = make('span');
			trackInfo_SPAN_SPAN.setAttribute('class', 'data_icon button_box mute_icon');
			trackInfo_SPAN_SPAN.setAttribute('onclick', 'mute_track('+data.track_id+')');
			trackInfo_SPAN_SPAN.setAttribute('title', 'Mute track output');

		trackInfo_SPAN.appendChild(trackInfo_SPAN_SPAN);

			var trackInfo_SPAN_SPAN = make('span');
			trackInfo_SPAN_SPAN.setAttribute('class', 'data_icon button_box solo_icon');
			trackInfo_SPAN_SPAN.setAttribute('onclick', 'solo_track('+data.track_id+')');
			trackInfo_SPAN_SPAN.setAttribute('title', 'Solo track output');

		trackInfo_SPAN.appendChild(trackInfo_SPAN_SPAN);
		
			var trackInfo_SPAN_SPAN = make('span');
			trackInfo_SPAN_SPAN.setAttribute('class', 'data_icon button_box resize_icon');
			trackInfo_SPAN_SPAN.setAttribute('onclick', 'minimize_track('+data.track_id+')');
			trackInfo_SPAN_SPAN.setAttribute('title', 'Minimize Track View');

		trackInfo_SPAN.appendChild(trackInfo_SPAN_SPAN);
		trackInfo.appendChild(trackInfo_SPAN);

		return trackInfo;
	
}

//Update all track info bound, index = specify one track or pass nothing for all
function updateTrackBounds(index=undefined){
let all_bounds = document.querySelectorAll('.track_info_bound');

	function update_this_tub(bd, data){
		bd.outerHTML = createTrackBound({'track_id':data.track_id}).outerHTML;
		
		if(data.muted == true){
			parentTrack(data.track_id).classList.add('muted');
			parentTrack(data.track_id).setAttribute('title','Track is Muted');
		}		
		if(data.solo == true){
			parentTrack(data.track_id).classList.add('solo');
		}		
		if(data.minimize == true){
			parentTrack(data.track_id).classList.add('minimize');
		}

		
	}
	if(index == undefined){
		for(tb=0;tb < all_bounds.length;tb++){
			let this_bound = all_bounds[tb];
			let track_of = (this_bound.parentNode.getAttribute('tracks_id'));

			update_this_tub(this_bound,timeline_data[track_of]);
		}		
	}else{
		let track_of = (all_bounds[index].parentNode.getAttribute('tracks_id'));
		update_this_tub(all_bounds[index],timeline_data[track_of]);
	}
}


//Utilities End

// Timeline


var timeline_data = [];


function push_data(){	
	var block_contents = {
		"start_at":0,
		"end_at":0,
		"type":"general",
		"data": ""	
	}		
	timeline_data.push(block_contents)
}


var ds;

function see_event(){//clicked on track ?
	var scrolled = _("timeline_container").scrollLeft;
	
	let on_tracks = (event.srcElement.classList.contains("track_con") || event.srcElement.classList.contains("sub_track"));
	
	
	if((click_on_track == true && event.shiftKey == true && event.buttons == 1) || playing == false){
		if(on_tracks){
			play_head((event.clientX+scrolled - (2 + left_margin)) / zoom_scale);
			time = ((event.clientX - (10 + left_margin))+scrolled ) / zoom_scale;
			_("thisvid").currentTime = ((time-2)/33.333);
			player_seeked = true;
		}
		if(playing == true){
			_("thisvid").play();
		}
	}
	try{
		if(event.ctrlKey){
			selection.enable();
		}else if(event.ctrlKey == false){
			selection.disable();				
			enableAutoHide();
		}
	}catch(e){
		//--
	}
	
	
	play_on_current();
	selected_track_index = parseInt(this.getAttribute("tracks_id"));
	
	_("track_disp").value = selected_track_index;
	_("total_tracks").innerHTML = timeline_data.length;
	
	if(on_tracks){
		follow_playhead = false;
	}
	

	limitThreshold = 2;
	_("ruler_view").style.opacity = 0.75;
	_("ruler_view").title = "";
	click_on_track = true;
	
	for(s_tr = 0; s_tr < timeline_data.length;s_tr++){
		this.parentNode.getElementsByClassName("track_con")[s_tr].classList.remove("selected_track");
	}
	
	this.classList.add("selected_track");
	this.classList.remove("track_not_in_view");
	
	var my_selected_track_ = document.getElementsByClassName("track_con")[selected_track_index];
	my_selected_track_.style.width = _("timeline_container").scrollWidth - 10 + "px";	//resizes the track width after mouse user click
	
	
}


function add_track(data,com,mode){
	var tracks_len = timeline_data.length;
	
	data = capInput(data,0,tracks_len);
	if(mode == undefined){
		mode = "normal";
	}
	
	
	var track = document.createElement("div");
		track.classList.add("track_con");
		track.setAttribute("tracks_id", tracks_len);
		track.addEventListener("mousedown",see_event);
		track.style.width = _("timeline_container").scrollWidth;
		track.addEventListener("contextmenu", context_menu_track, false);
		
	var track_data = {
		"track_id":tracks_len,
		"sub_tracks":[],
		"default_value": 0,
		"port_channel": 0
	}	
	
		
	
		
		
	
		
		//something more here
		
		if(data == undefined || data == null){
			
			timeline_data[tracks_len] = track_data;

			_("timeline_").appendChild(track);
			
			
			
			
		}else{
			
			//trigger a warning here for: channel shift
			
			
			if(data > timeline_data.length){
				console.warn('Outbound! track');
				return false;
			}
			
			
			tracks_len = data;
			
			var index_of_add = parseInt(data);	
			
				track.setAttribute("tracks_id", capInput(index_of_add,0,timeline_data.length));
				
				if(com != undefined){
					//For invistigation? probably for updating the subtrack index on array
					track.setAttribute("tracks_id", capInput(index_of_add,0,timeline_data.length));				
				}
				
				
				
				track_data.track_id = index_of_add;
			
				for(stad = parseInt(index_of_add);stad < timeline_data.length;stad++){//Cascade tracks_id list shifted by +1
					try{
						_("timeline_").getElementsByClassName("track_con")[stad].setAttribute("tracks_id",stad+1);
						
						timeline_data[stad].track_id = stad+1;
					}catch(e){
						//-
					}
				}
			
			timeline_data.splice(index_of_add,0,track_data);
				
			_("timeline_").insertBefore(track, _("timeline_").childNodes[index_of_add+1]);	
			
			
		}
		
		_("playhead").style.height = (_("timeline_container").scrollHeight)+"px";
		
		_("dyna_height").innerText = (':root {--overall-height:' +_("timeline_container").scrollHeight + "px; }");
		
		if(loaded_from_data == false){
			
			track.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
				inline: 'center'
			});
		
		track.classList.add("selected_track");
		selected_track_index = tracks_len;
		
			_("track_disp").value = selected_track_index;
			_("total_tracks").innerHTML = timeline_data.length;
		
			if(com == undefined){
				
				if(mode == 'normal'){	
						push_undo("track", "add", tracks_len, timeline_data[tracks_len], '');
				}else if(mode == "duplicate"){
					
					//
					
				}
				
			}
		
		}
		tracks_id = timeline_data.length;
	track.appendChild(createTrackBound({'track_id':tracks_len}));
	autoHide();
	
	return capInput(parseInt(data,0,timeline_data.length));
}




function context_menu_track(e){
	e.preventDefault();
	e.stopPropagation();
	
	if(e.target.classList[0] == 'track_con'){
		
		
		
		
		set_coords_context(e.screenX,e.screenY);
		
		try{
			window.chrome.webview.hostObjects.NativeObject.Show_track_menu();
			context_menu = true;
			can_move_track = false;
		}catch(e){
			//
		}
		
		// console.log("show_context_for track");

		
	}else if(e.target.classList[0] == 'sub_track'){
		
		set_coords_context(e.screenX,e.screenY);
		
		try{
			window.chrome.webview.hostObjects.NativeObject.Show_content_menu();
			context_menu = true;
			can_move_track = false;
		}catch(e){
			//
		}
		
		
		
		// console.log("show context for content block");
		
	};
	
	context_menu = true;
}


function add_sub_tracks(data,com,mode,sub_index){
	
	if(mode == undefined){
		mode = 'normal';
		
	}
	
	var selected_track_ = document.getElementsByClassName("track_con")[selected_track_index];
	
			//something more here
		
	if(data == undefined || data == null){
		var block_contents = {
			"start_at":time,
			"content_length":33,
			"end_at":0,
			"type":"general",
			"data": []	
		}
	}else{
		var block_contents = data;
		
	}
	
	
	if(selected_track_index == null){
		
		return;
		
	}
	
	
	block_contents.end_at = block_contents.start_at + block_contents.content_length;
	
	

	
	
	if(loaded_from_data == false){
	
		content_id = timeline_data[selected_track_index].sub_tracks.length;
	
		//add data to timeline
		
		if(mode == 'normal'){
		
			timeline_data[selected_track_index].sub_tracks[content_id] = block_contents;
		
		}else if(mode == 'insert'){
			//insert content data at specified index on timeline.
			timeline_data[selected_track_index].sub_tracks.splice(sub_index, 0,block_contents);
			
		}
		
		//set def value of the track to this plugin's def.
		timeline_data[selected_track_index].default_value = plugins[find_plug(block_contents.type)].default_value;
		
		if(com == undefined){
			
			push_undo("subtrack", "add", selected_track_index, block_contents,content_id);
		}
		
	
	}else{
		content_id = sub_data_id;
		
		if(sub_data_id == undefined){
			content_id = timeline_data[selected_track_index].sub_tracks.length;
		}	
		
		
	}
	

	if(mode == 'normal'){

			//Visualy create the content to the timeline as an element
		var sub_track = document.createElement("div");
			sub_track.classList.add("sub_track");
			sub_track.addEventListener("mousedown",set_track_node);
			sub_track.setAttribute("content_id", content_id);
			
			sub_track.style.left = "calc(var(--scale) *"+ (block_contents.start_at)+"px)";
			sub_track.style.width = "calc(var(--scale) *"+ block_contents.content_length+"px)";
			
			
			sub_track.style.backgroundColor = block_contents.color+"50";
			sub_track.addEventListener("contextmenu", function (e){}, false);
		
			
		var div_details = document.createElement("div");
			div_details.classList.add("content_details_inline");
			div_details.innerHTML = block_contents.name;
			
			sub_track.title = block_contents.name;
			sub_track.appendChild(div_details);
			
		selected_track_.appendChild(sub_track);
		
			selected_content = parentTrack(selected_track_index).querySelector('[content_id="'+content_id+'"]'); 
			has_moved = true;
		
		if(com == 'multiple'){
			selected_contents_indexes.push(content_id);

			sub_track.classList.add("selected_content");
			
		}
		
		
		
		
	
	}else if(mode == 'insert'){
		
		refresh_track(selected_track_index);
		
		
	}
	
	content_id++;
	optimizedData = false;
	
	gen_ruler();
}

function modify_sub_track(data,com){
	
	var data_id = selected_content.getAttribute("content_id");
	
	var selected_item = selected_content.getAttribute('content_id');
	

	if(com == undefined){
		push_undo("subtrack", "edit", selected_track_index, decople_data(timeline_data[selected_track_index].sub_tracks[data_id]),data_id);
	}
	
	var tm_data = timeline_data[selected_track_index].sub_tracks[data_id];
		tm_data.misc = data.misc;
		tm_data.data = data.data;
		tm_data.content_length = data.content_length;
		tm_data.name =  data.name,
		tm_data.color = data.color,		
		tm_data.end_at = tm_data.start_at + data.content_length;

	selected_content.getElementsByClassName("content_details_inline")[0].innerHTML = data.name;
	
	selected_content.style.width = "calc(var(--scale) *" + tm_data.content_length + "px)";
	selected_content.style.backgroundColor = tm_data.color + "50";
	
	if(com != undefined){
		selected_content.style.left = "calc(var(--scale) *" + data.start_at + "px)";
		tm_data.start_at = data.start_at;
	
	}
	
		
	if(com == undefined){
		push_undo("subtrack", "edit", selected_track_index, decople_data(timeline_data[selected_track_index].sub_tracks[data_id]),data_id);
	}
	
}


var content_id_block;
let multiple_selected = false;
let prev_content;
let sameSelection = true;

function set_track_node(){//gets the content block selected
	
	if(prev_content == selected_content){
		
		sameSelection = true;
	}else{
		sameSelection = false;
	}
	
	
	click_on_track = false;
	follow_playhead = false;
	limitThreshold = 2;
	
	has_moved = false;
	
	_("ruler_view").style.opacity = 0.75;
	_("ruler_view").title = "";
	
	set_coords_context(event.screenX,event.screenY);
	
	var e = event;
	// console.log(e);	
	movement = 0;
	this.parentNode.addEventListener("mousemove", reposition_subtrack);
	this.parentNode.addEventListener("mouseup", remove_onmove);
	this.parentNode.addEventListener("mouseleave", remove_onmove);


	if(e.ctrlKey){
		multiple_selected = true;
		selection.cancel();
	}else{
		multiple_selected = false;
		//if user clicks on not selected content, remove all selections
		if(selected_contents.indexOf(this) <= -1){
			revoke_selections("force");
			revoke_selections("force");
		}
		
		
	}
	
	
	content_id_block = this;
	initial_pos_sub_track = [e.clientX, e.clientY];		
	selected_content = this;
	
	
	if(can_move_track == false){
		return;
	}
	
		
	//remove all selection visually
	revoke_selections(this);
	
	
	//for multiple select if the item was selected or removed
	var content_selected;
	
	if(multiple_selected){
		content_selected = (this.classList.toggle("selected_content"));
		
		 push_to_selections(prev_content);
		
		//push or remove content from multiple selections array
		if(content_selected){
			push_to_selections(this);
		}else{
			remove_on_selections(this)
		}
		
		prev_content = null;
	}else{
		this.classList.add("selected_content");
		
		//If the selected object was clicked again
		if(prev_content == selected_content){
			
			// console.log("same");
			
			if(selected_contents.length){
				revoke_selections("force");
				revoke_selections("force");
				this.classList.add("selected_content");
			}
			selected_contents.length = 0;
			
		}
		
		prev_content = selected_content;
		
	}	
	
	
	click_on_content(selected_content.getAttribute("content_id"));
	
	selected_track_indexes.length = 0;
	selected_contents_data.length = 0;
	
	if(this.style.left.length > 0){
		origin_sub = this.style.left.replace(/[^\d.]/gi, "");
		ds = this;
		
		//multiple selections
		if(selected_contents.length){
			
			let ext = 0;
			for(cons of selected_contents){
				
				origin_sub_pos[ext] = cons.style.left.replace(/[^\d.]/gi, "");
				
				
				var sel_tr_i = cons.parentNode.getAttribute("tracks_id");
				var sel_sub_i = cons.getAttribute("content_id");
				
				
		
				selected_track_indexes[ext] = sel_tr_i;
				
				
				selected_contents_data[ext] = timeline_data[sel_tr_i].sub_tracks[sel_sub_i];
				
				selected_contents_indexes[ext] = decople_data(sel_sub_i);
				
				
				ext++;
			}
		}
		
		
	}else{
		origin_sub = this.getBoundingClientRect().x;
	}
}

//Multiple selections helper

function revoke_selections(elm){		
	//remove all selection visually
	
	
	for(s_tr = 0; s_tr < document.getElementsByClassName("selected_content").length;s_tr++){	
	
		let current_selected_con = selected_contents.indexOf(document.getElementsByClassName("selected_content")[s_tr]);
	
		if(!multiple_selected && (current_selected_con <= -1)){
			
			document.getElementsByClassName("selected_content")[s_tr].classList.remove("selected_content");	
			selected_contents.length = 0;
			
		}
		

	
	}
	
	if(elm == "force"){
		try{
			let sel_block = document.querySelectorAll(".selected_content");	
			
			for(selects of sel_block){
				
				selects.classList.remove("selected_content");
				
			}
			
			selected_contents.length = 0;
		}catch(e){
			//--
		}
	}
	
}

	
function push_to_selections(elm){	
		if(!elm){
			return;
		}
	
		let onSelection = (selected_contents.indexOf(elm));		
		if(onSelection <= -1){
			selected_contents.push(elm);
		}
}
	
function remove_on_selections(elm){
		let elm_to_remove = (selected_contents.indexOf(elm));
		selected_contents.splice(elm_to_remove, 1);
		// selected_contents.push(elm);		
}






var movement = 0;

//@ move_subtrack
//@ move subtrack
//draging a sub_tracks to mouse postion
function reposition_subtrack(){
		
		if(can_move_track == false || event.buttons >= 2){
			set_coords_context(event.screenX,event.screenY);
			return;
		}		
				
		
		// console.log(event);
		
				
		if(selected_contents.length > 1){
			prev_content = null;
			
			multiple_moves();
			
			return;
		}
		
		
			
		try{
			selection.disable();	
			enableAutoHide();			
		}catch(e){
			//--
		}
		
		
		
	try{
		var selected_item = selected_content.getAttribute('content_id');
	
		if(movement <= 0){
			push_undo("subtrack", "edit", selected_track_index, decople_data(timeline_data[selected_track_index].sub_tracks[selected_item]), selected_item);
		}
	
	
	
		var the_element = content_id_block;
		var current_position = event.clientX;
		var scrolled_c = _("timeline_container").scrollLeft;
		
		var changes = (current_position - initial_pos_sub_track[0]);	
		var calculated_position = (parseInt(origin_sub)+(changes) / zoom_scale);
		var content_ids = the_element.getAttribute("content_id");
		
		if(calculated_position <= 0){		
			content_id_block.style.left = 0;
			
		}else{
			content_id_block.style.left = "calc(var(--scale) *" + calculated_position+"px)";
		}

		var content_lengths = timeline_data[selected_track_index].sub_tracks[content_ids].content_length;

		timeline_data[selected_track_index].sub_tracks[content_ids].start_at = calculated_position;
		
		timeline_data[selected_track_index].sub_tracks[content_ids].end_at = calculated_position+content_lengths;
		
		set_coords_context(event.screenX,event.screenY);
		
		//This pushes to undo when user is done moving selected elm
	
		event.target.onmouseup = (function(){
					
			push_undo("subtrack", "edit", selected_track_index, decople_data(timeline_data[selected_track_index].sub_tracks[selected_item]), selected_item);
		
		});	
		event.target.onmouseleave = (function(){
					
			push_undo("subtrack", "edit", selected_track_index, decople_data(timeline_data[selected_track_index].sub_tracks[selected_item]), selected_item);
		
		});
	
		
		
		if(movement <= 0 || movement%6 == 0){
			//
		}
		
		has_moved = true;
		select_count = 0;
		
		movement++;
	}catch(e){
		
		//
	}

}

let extIndex = 0;
function multiple_moves(){
	try{
		var selected_item = selected_content.getAttribute('content_id');
	
	// TO-DO: Add logic for UNDO on multiple edit - DONE
		
	
		if(movement <= 0){
			push_undo("subtrack", "edit", selected_track_indexes,decople_data(selected_contents_data), selected_contents_indexes);
		}

	 
	extIndex = 0;
	for(contents of selected_contents){
	
	
		var the_element = contents;
		var the_parent = contents.parentNode.getAttribute("tracks_id")
		var current_position = event.clientX;
		var scrolled_c = _("timeline_container").scrollLeft;
		
		var changes = (current_position - initial_pos_sub_track[0]);	
		var calculated_position = (parseInt(origin_sub_pos[extIndex])+(changes) / zoom_scale);
		var content_ids = the_element.getAttribute("content_id");
		
		if(calculated_position <= 0){		
			contents.style.left = 0;
			
		}else{
			contents.style.left = "calc(var(--scale) *" + calculated_position+"px)";
		}

		var content_lengths = timeline_data[the_parent].sub_tracks[content_ids].content_length;

		timeline_data[the_parent].sub_tracks[content_ids].start_at = calculated_position;
		
		timeline_data[the_parent].sub_tracks[content_ids].end_at = calculated_position+content_lengths;
		
		set_coords_context(event.screenX,event.screenY);
		
	extIndex++;
		
	}
			
		if(movement <= 0 || movement%6 == 0){
			
			
		} 
		
		//Push to undo stack after moving
		
		event.target.onmouseup = (function(){

			push_undo("subtrack", "edit", selected_track_indexes,selected_contents_data, selected_contents_indexes);
		
		});	
		event.target.onmouseleave = (function(){
					
			push_undo("subtrack", "edit", selected_track_indexes,selected_contents_data, selected_contents_indexes);
		
		});
		
		
		
		has_moved = true;
		select_count = 0;
		
		movement++;
	}catch(e){
		
		console.log(e);
	}
	
	
	
	
}



function remove_onmove(){
	can_move_track = true;	
	var my_selected_track_ = document.getElementsByClassName("track_con")[selected_track_index];
	my_selected_track_.style.width = _("timeline_container").scrollWidth - 10 + "px";	//resizes the track width after mouse user click
	this.removeEventListener("mousemove",reposition_subtrack);	

	gen_ruler();
	
}



	

//Clear all Pending Buffers on Com Ports etc.
function clearAllBuffer(){

	try{
		window.chrome.webview.hostObjects.NativeObject.clearAllBuffer();
	}catch(e){
	//
	}
}





//Zooming

//--








//Playback

function play(from_player){
	playing = true;
	
	if(from_player){
		return true;
	}
	
	if(_("thisvid").paused ){	
		try{
			_("thisvid").play();	
		}catch(e){
			//-
		}
	}
}

function pause(from_player){
	playing = false;
	
	if(from_player){
		return true;
	}
	
	if(_("thisvid").paused == false){
		try{
		_("thisvid").pause();
		}catch(e){
			//-
		}
	}
}

function stop(){
	playing = false;
	time = 0;
	play_head(10);
	
	//clearAllBuffer();
	
	
	_("thisvid").currentTime = 0;
	_("thisvid").pause();
	
}


function set_delay(val){
	
	let local = localStorage.getItem('play_delay');
	
	if(val == undefined||val == null){
		_("delay_disp").value = parseInt(local);
		
		
		let set = parseInt(local);
					
			if(set.toString() == "NaN"){
				
				set = 0;
				
			}
			
			
		
		delay = (set*0.001)*33.333;		
		optimizedData = false;
		
		return;
	}else{
				
		localStorage.setItem('play_delay',val);		
		if((val == "" || val == null) || val.length == 0){				
			localStorage.setItem('play_delay',0);			
		}			
		let set = parseInt(localStorage.getItem('play_delay'));		
		delay = (set*0.001)*33.333;		
		optimizedData = false;	
		
	}

}



var pl = _("playhead");
var time_ex;

function play_head(time){
		time_ex = time * zoom_scale;
	
	if(time <= _("timeline_container").scrollWidth / zoom_scale){
		//pl.style.left = (time)+"px";
		//pl.style.transform =  "translateX("+time+"px)";		
		window.requestAnimationFrame(pl_trans);
		
	}
	
		
	setTimeDisplay(time);
	
}


function pl_trans(){
	pl.style.transform =  "translateX("+time_ex+"px)";
}






//playback end


//Time Jump
function jump_to_time(){
	
	var time_jump = gen_seconds_input(['jump_s','jump_m','jump_h']) * 33.333;
	var my_selected_track_ = document.getElementsByClassName("track_con")[selected_track_index];
	
	if (get_size(my_selected_track_)[0] < time_jump){
		my_selected_track_.style.width = (zoom_scale * time_jump)+"px";
		gen_ruler();
	};
	
	//If following, play at this time
	if(follow_playhead){
		time = time_jump;
		play_head(time_jump+10 / zoom_scale);
	}
	
	
	//scroll time to view
	_("timeline_container").scrollTo(((time_jump * zoom_scale) - (_("timeline_container").getBoundingClientRect().width * 0.5)),_("timeline_container").scrollTop);
	
	
	destroy_dia();
	

}

//Edit Track Options
async function edit_track_option(option){
	
	if(option == undefined){
		
		option = null;
	}
	
	var data = {
		'port': validate_number(timeline_data[selected_track_index].port_channel),
		'channel': validate_number(timeline_data[selected_track_index].target_channel),
		'option': option
		
	}
	
	let optionShown = await createDialogue('edit_track',data);
	if(optionShown){
		
		if(option == 'channel'){		
			_('t_channel_input').focus();
			_('t_channel_input').select();

		}else if(option == 'port'){
			_('p_channel_input').focus();
			_('p_channel_input').select();
		}

		
	}
	
}


function save_port_conf(){
	
	push_undo("track", "edit", selected_track_index, timeline_data[selected_track_index], '');
	
	var port_val = validate_number(_('p_channel_input').value);
	var cha_val = validate_number(_('t_channel_input').value);

	timeline_data[selected_track_index].port_channel = port_val;
	timeline_data[selected_track_index].target_channel = cha_val;
	
	optimizedData = false;
	updateTrackBounds(selected_track_index);
	
	
	destroy_dia();
	
}

//Jump to Track

function set_selected_track(val){
	
	if(val > timeline_data.length){
		
		return;
		
	}
	
	
	for(s_tr = 0; s_tr < timeline_data.length;s_tr++){
		
		_('timeline_').getElementsByClassName("track_con")[s_tr].classList.remove("selected_track");
		
		if(s_tr == parseInt(val)){
			
			var sdfgg = _('timeline_').getElementsByClassName("track_con")[s_tr];
			
			sdfgg.classList.add("selected_track");
			
			sdfgg.scrollIntoView({
				behavior: 'smooth',
				block: 'nearest',
				inline: 'nearest'
			});
				
			
			
		}
		
	}
	
	
	
}



//ruler
var prev_wi = 0;

function gen_ruler(){
	
	var width_ref = parseInt((_("timeline_container").scrollWidth)/((1000/30) ));
	
	
	
	var  rv = _("ruler_view");
	     rv.addEventListener("mousedown",click_on_ruler);
	
	rv.style.width = (_("timeline_container").scrollWidth)+"px";
	
	_("timeline_container").addEventListener("scroll",move_ruler);
	
	try{
		rulerWidth = get_size(document.body)[0];
		canvas.setAttribute("width", rulerWidth);
		clear_ruler();
		paint_ruler();
	}catch(e){
		//--
		
	}
	
	

	
	
	if(prev_wi == width_ref){
		return;
	}
	
	prev_wi = width_ref;
	

	
	
	
}


var prev_scroll;
function move_ruler(){
	//var  rv = _("ruler_view");
	//rv.style.transform = "translateX(-"++"px)";
	
	
	zeroScaleLinePosX = (_("timeline_container").scrollLeft) * -1;
	clear_ruler();paint_ruler();
	
	var scr = _("timeline_container").scrollLeft;
	

	
	
	if(prev_scroll != _("timeline_container").scrollTop){
		//on scrolling hide hidden tracks
		autoHide();
		
	}
	
	prev_scroll = _("timeline_container").scrollTop;
	
}

function click_on_ruler(){
	
	if(follow_playhead == true){
		play_head((event.clientX - ( 2 + left_margin) + _("timeline_container").scrollLeft) / zoom_scale);
		time = (event.clientX - (10+ left_margin) + _("timeline_container").scrollLeft) / zoom_scale;
		
	
		
		_("thisvid").currentTime = ((time-2)/33.333);
		player_seeked = true;
		
		play_on_current();
	
	}else if(follow_playhead == false && playing == false){
		play_head((event.clientX - (2 + left_margin) + _("timeline_container").scrollLeft)/ zoom_scale);
		time = (event.clientX - (10 + left_margin) + _("timeline_container").scrollLeft ) / zoom_scale;
	
		
		_("thisvid").currentTime = (((time-2)/33.333));
		player_seeked = true;
		
		play_on_current();
		
	}
	follow_playhead = true;
	_("ruler_view").style.opacity = 1;
	
	_("ruler_view").title = "Follow head is On";

}


//removing content blocks and tracks
function remove_content(id,com){
	select_count = 0;
	
	//removes from dragselections as well
	selection.clearSelection(true, true);
	
	if(selected_contents.length > 0 && com == undefined){
		
		remove_multiple();
		return;
	}
	
	if(!selected_content && id == undefined){
		console.log("No selection");
		return false;
	}
	
		
	if(id == undefined){
		var parent_node = selected_content.parentNode	
		var data_id = selected_content.getAttribute("content_id");
	}else{
		var data_id = id;
		var parent_node = parentTrack(selected_track_index);
		selected_content = parent_node.querySelector('[content_id="'+data_id+'"]')
		
		
	}
	
	
	if(com == undefined){
		//if com is undefined (which means not internal commands such as undo, add to undo stack)
		
		push_undo("subtrack", "delete", selected_track_index, timeline_data[selected_track_index].sub_tracks[data_id],data_id);
		
	}
	
	
	timeline_data[selected_track_index].sub_tracks.splice(data_id,1);
	
	
		selected_content.removeEventListener("mousemove",reposition_subtrack);	
		selected_content.removeEventListener("mousedown",set_track_node);
			// selected_content.removeEventListener("mousedown",set_track_node);
		selected_content.remove();	
	
	

	
	// selected_content.removeEventListener("mousedown",set_track_node);
	// selected_content.remove();	
		
	
	for(sta = parseInt(data_id);sta < timeline_data[selected_track_index].sub_tracks.length;sta++){
		parent_node.getElementsByClassName("sub_track")[sta].setAttribute("content_id",sta);
		
	}
	

	
	selected_content = null;
	selected_contents.length = 0;
	
	
	optimizedData = false;
	
	return timeline_data;
	
	
}

//removing multiple content blocks and tracks
function remove_multiple(com,id){
	select_count = 0;
	

	
	let extId = 0;
	for(contents  of selected_contents)	{
			
		var data_id = contents.getAttribute("content_id");
		
					
		selected_track_index = selected_track_indexes[extId];
		var parent_node = parentTrack(selected_track_index);
		
		timeline_data[selected_track_index].sub_tracks.splice(data_id,1);
		
		contents.removeEventListener("mousemove",reposition_subtrack);	
		contents.removeEventListener("mousedown",set_track_node);	
		// selected_content.removeEventListener("mousedown",set_track_node);
		contents.remove();	
			
		
		for(sta = parseInt(data_id);sta < timeline_data[selected_track_index].sub_tracks.length;sta++){
			parent_node.getElementsByClassName("sub_track")[sta].setAttribute("content_id",sta);
			
		}
	
		extId++;
	}
		if(com == undefined){
			push_undo("subtrack", "delete", selected_track_indexes,decople_data(selected_contents_data), selected_contents_indexes);
		}
		

	
		
		selected_content = null;
		selected_contents.length = 0;
		
		optimizedData = false;
		
		return timeline_data;
		

}




function remove_track(id,com){
	if(selected_track_index == undefined){
		console.log("No track selection");
		return false;
	}
	
		//removes from dragselections as well
	selection.clearSelection(true, true);
	
	var trc = document.getElementsByClassName("track_con")[selected_track_index];
	
	trc.removeEventListener("mousedown",see_event);
	
	for(trc_sta = 0;trc_sta < trc.getElementsByClassName("sub_track").length;trc_sta++){
	
		var dc = trc.getElementsByClassName("sub_track")[trc_sta];
		dc.removeEventListener("mousemove",reposition_subtrack);	
		dc.removeEventListener("mousedown",set_track_node);
		dc.removeEventListener("context_menu",context_menu_track);
	
	
	}
		if(com == undefined){
			push_undo("track", "delete", selected_track_index, timeline_data[selected_track_index], '');
		}

	timeline_data.splice(selected_track_index,1);
	
		trc.remove();	
		
	for(stad = parseInt(selected_track_index);stad < timeline_data.length;stad++){
		
		timeline_data[stad].track_id = stad;
		_("timeline_").getElementsByClassName("track_con")[stad].setAttribute("tracks_id",stad);
		
		
	}
	
	updateTrackBounds();
	
	selected_track_index = null;
	_("track_disp").value = 0;
	_("total_tracks").innerHTML = timeline_data.length;
	
	optimizedData = false;
	
	return timeline_data;
	
	
	
	
}

//Content of the subtrack

var prev_track;
var prev_id;
var select_count = 0;

var sdf = setTimeout(reset_select_count, 300);

function click_on_content(df){
	
	
	if(context_menu == true){
		context_menu = false;		
		select_count = 1;
		
		return;		
	}else if(has_moved == true){	
		select_count = 1;		
		return;
	}
	
	if(event.buttons <= 1){
		select_count++;	
	}
	
	
	sdf = setTimeout(reset_select_count, 300)
	
	if(select_count > 1 && (prev_id == df && prev_track == selected_track_index) && multiple_selected == false){
		
		open_edit_for(timeline_data[selected_track_index].sub_tracks[df],"edit");
		
	}else if(prev_track != selected_track_index){
		
		
		window.clearTimeout(reset_select_count);
		select_count = 1;
		
	}
	
	prev_id = df;
	prev_track = selected_track_index;
	
}

function reset_select_count(){
	select_count = 0;
}



//sending data for edit on specified plugin
function open_edit_for(dt,type){
	
	
	current_mode = "edit";
	
	if(type == "edit_template"){
		
		current_mode = "edit_template";
		
	}
	//add more options here
	
	//Overide for Manual Player
	if(playMode == "manual"){
		
		current_mode = "edit_manual_template";
	}
	
	
	// console.log(dt);
	
	var plugin_id = find_plug(dt.type);
	
	if(plugin_id == undefined){
		
		console.warn("Plugin for :", type, "Not Found!");
		return;
		
	}
	
	open_plugin(plugin_id,"edit");
	send_data_to_plugin(dt);
}



//Copying and duplicating

function copy_content(){
	if(!selected_content){
		return false;
	}
	
	copies.length = 0;
	
	if(selected_contents.length > 0){
		
		let temp_copies = [];
		
		let extIndex = 0;
		for(selections of selected_contents_data){
			
			let no_track_data = decople_data(selections);
			no_track_data.track_id =  selected_track_indexes[extIndex];
			temp_copies[extIndex] = no_track_data;
			extIndex++;
		}
		copies = normalize_copies(temp_copies);
		copied = null;
		return;
		
	}
	
	
	var to_copy = timeline_data[selected_track_index].sub_tracks[selected_content.getAttribute("content_id")];
	
	copied = JSON.parse(JSON.stringify(to_copy));
			
	return true;
}

function normalize_copies(dta){
	
	//normalizing track_ids
	let base_track_id;
	dta.sort(function(a,b){return parseInt(a.track_id) - parseInt(b.track_id) });
	base_track_id = dta[0].track_id;
	
	for(z=0;z < dta.length;z++){
	
		dta[z].track_distance = dta[z].track_id - base_track_id;
		delete  dta[z].track_id;
	}
	
	
	//normalizing subtrack_starting distances
	let base_subtract_start;
	
	dta.sort(function(a,b){return parseInt(a.start_at) - parseInt(b.start_at) });
	base_subtract_start = dta[0].start_at;
		
	for(z=0;z < dta.length;z++){
	
		dta[z].start_distance = dta[z].start_at - base_subtract_start;
		//delete  dta[z].track_id;
	}
	
	
	return dta;
	
	// console.log(dta, base_track_id);
}


function paste_content(){
	
	var to_paste = JSON.parse(JSON.stringify(copied));	
	if(!to_paste && copies.length <= 0){
		return false;
	}else if(copies.length > 0){
		
		let last_selected_index = selected_track_index;
		
		let start_at_track = decople_data(selected_track_index);
		
		revoke_selections('force');
		revoke_selections('force');
		
		let pasting_copies = [];
		selected_track_indexes.length = 0;
		selected_contents_indexes.length = 0;

		
		let extId = 0;
		for(tps of copies){
			
			topaste = decople_data(tps);
			
			topaste.start_at = topaste.start_distance + time;
			topaste.end_at = topaste.start_at + topaste.content_length;
			selected_track_index = start_at_track + topaste.track_distance;
			
			pasting_copies[extId] = topaste;
			
			// console.log(selected_track_index);
				
				//dont overlap of available tracks
				
			let base_track_id_;
			
			let getLast = decople_data(copies);
			
			getLast.sort(function(a,b){return parseInt(b.track_distance) - parseInt(a.track_distance) });
			
			base_track_id_ = getLast[0].track_distance;
				
			if(document.querySelectorAll("[tracks_id='"+selected_track_index+"']").length <= 0){

				add_track();
				
				// alert("Pasting on Outbound tracks, not allowed!");
				// return;				
			}
			
				selected_track_indexes[extId] = selected_track_index;
				
				//remove the extra data from normalized copies
				delete pasting_copies[extId].start_distance;
				delete pasting_copies[extId].track_distance;
			
					add_sub_tracks(pasting_copies[extId], 'multiple');
				
				
				let this_track = document.querySelector('[tracks_id="'+selected_track_index+'"]').querySelector('[content_id="'+selected_contents_indexes[extId]+'"]')
				
				
				//seems like decopling produces a bug
				//selected_contents[extId] = decople_data(this_track);

				selected_contents[extId] = this_track;
				
				extId++;
		}
		
				
		prev_content = null;
		
		
		push_undo("subtrack", "add", selected_track_indexes,decople_data(pasting_copies), selected_contents_indexes);
	
		selected_track_index = last_selected_index; //revert selected track after pasting into previus before pasting
		
		return true;
	}
	
	to_paste.start_at = time;
	to_paste.end_at = to_paste.start_at + to_paste.content_length;
	
	add_sub_tracks(to_paste);
	
}



function duplicate_track(index,destination){
	//index : source index of track
	//destination : index where to insert track
	
	var dest_index;
	var source_data = decople_data(timeline_data[index]);
	
	
	if(destination == undefined){
			
		dest_index = timeline_data.length;
			
	}else if(destination == "before"){
		dest_index = capInput(index, 0, timeline_data.length);
		
	}else if(destination == "after"){
		dest_index = capInput(index + 1, 0, timeline_data.length);
		
	}else if(typeof(destination) == 'number'){
		dest_index = destination;
	}else{
		dest_index = timeline_data.length;
	}
	
	//add an empty track
	var insert_at = add_track(dest_index,undefined,"duplicate");
	
	if(insert_at === false){
		return insert_at;
	}
	
	
	//copy selected track into the new track
	
	
	source_data.track_id = insert_at;
	
	timeline_data[insert_at] = source_data;
	refresh_track(insert_at);
	
	//Push an Undo Entry for this duplication
	push_undo("track", "add", insert_at, timeline_data[insert_at], '');
	
	
	
	return insert_at;
	
}


//duplicate_track adapter
function duplicateTrack(destination_option){
	return duplicate_track(selected_track_index, destination_option);
}

// ===============
// Muting And Solo Track Logic
// ===============

// To-Do: Just do it (Done)

function mute_track(id,toggle=true,unmute=false){
	if(timeline_data[id] == undefined){
		return;
	}
	let trselect = timeline_data[id];

	if(trselect.muted && toggle == true){
		trselect.muted = false;
		parentTrack(id).classList.remove("muted");
		parentTrack(id).setAttribute("title", '');
		
		
	}else if(unmute){
		trselect.muted = false;
		parentTrack(id).classList.remove("muted");
		parentTrack(id).setAttribute("title", '');
		
	}else{
		trselect.muted = true;
		parentTrack(id).classList.add("muted");
		parentTrack(id).setAttribute("title", 'Track is Muted');
		trselect.solo = false;
		parentTrack(id).classList.remove("solo");
	}
	
	
	optimizedData = false;
	
}


function solo_track(id){
	function mute_all(unmute){
		for(trs = 0; trs <= timeline_data.length; trs++){
			if(trs == id){
				mute_track(id,false,true);
				continue;
			}
			mute_track(trs,false,unmute);
			
		}
		
	}
	
	let trselect = timeline_data[id];

	if(trselect.solo){
		trselect.solo = false;
		parentTrack(id).classList.remove("solo");
		mute_all(true);
	}else{
		trselect.solo = true;
		parentTrack(id).classList.add("solo");
		mute_all(false);
	}
	
}


// Other Similar Functions

function minimize_track(id){
	if(timeline_data[id] == undefined){
		return;
	}
	let trselect = timeline_data[id];

	if(trselect.minimize){
		trselect.minimize = false;
		parentTrack(id).classList.remove("minimize");
		
	}else{
		trselect.minimize = true;
		parentTrack(id).classList.add("minimize");

	}
	
	autoHide();
	
}


//helper function for adding marker
function addMarker(t=time){
	Marker_Maker.addMarker(time);
}

function removeMarker(){
	Marker_Maker.removeMarker(Marker_Maker.selectedMarker);

}


// ===============
// Muting And Solo Track Logic End
// ===============



//Load From Datas

var dummy_data = localStorage.getItem("data_dummy");
var dummy_templates = localStorage.getItem("data_templates");
var dummy_options = localStorage.getItem("options");

function load_saved(data){
	
	loaded_from_data = true;
	
	data = dummy_data;
	
	data = JSON.parse(data);
	fileOptions = {};
	try{
		fileOptions = JSON.parse(dummy_options);
	}catch(e){
		//-
	}
	
	
	//_("timeline_").innerHTML = "";
	
	
	const myNode = _("timeline_");
		while (myNode.lastElementChild) {
			myNode.removeChild(myNode.lastElementChild);
	}
	
	
	timeline_data = [];
	templates = [];
	
	for(dtracks = 0;dtracks < data.length;dtracks++){
		add_track();		
		selected_track_index = dtracks;
		
		for(dft = 0;dft < data[dtracks].sub_tracks.length;dft++){
			sub_data_id = dft;
			add_sub_tracks(data[dtracks].sub_tracks[dft]);
			
			
		}
	}
	
	templates = JSON.parse(dummy_templates);
		
	timeline_data = data;
	loaded_from_data = false;	
	regen_empty_data();	
	load_all_templates();
	
	scanOptimized();
	updateTrackBounds();
	
}

function test_(df){
	
	alert(df);
}






async function load_from_file(df){
	
	var project_data = JSON.parse(df);
		
	
	loaded_from_data = true;	
	timeline_data = [];
	templates = [];
	markers = [];
	
	
	var ftemplates = JSON.parse(decode(project_data.templates));
	templates = ftemplates;
	
	
	
	load_all_templates();	
	var timeline_data_ = JSON.parse(decode(project_data.timeline));
	
	try{
		fileOptions = {};
		fileOptions = JSON.parse(decode(project_data.options));
		
		//load markers if applicable
		markers = JSON.parse(decode(project_data.markers));
		
	}catch(e){
		//-
	}
	
			
	
	// _("timeline_").innerHTML = "";
	
	const myNode = _("timeline_");
		while (myNode.lastElementChild) {
    myNode.removeChild(myNode.lastElementChild);
  }
	
	
		for(dtracks = 0;dtracks < timeline_data_.length;dtracks++){
			
			
			// Loading Display Logic here...
			
			show_loading(timeline_data_.length, dtracks+1, "Loading tracks");
			
			await sleep(1);
			
			
			add_track();		
			selected_track_index = dtracks;
			
			for(dft = 0;dft < timeline_data_[dtracks].sub_tracks.length;dft++){
				sub_data_id = dft;
				add_sub_tracks(timeline_data_[dtracks].sub_tracks[dft]);
				
				
			}
			
			
		}
		


	_("total_tracks").innerHTML = timeline_data.length;
	//Hides the Progress 

	
	
	timeline_data = timeline_data_;
	
	show_loading(3, 1, "Regenerating Data...");
	await sleep(2);
	
	regen_empty_data();
	
	
	show_loading(3, 2, "Cleaning stacks...");
	await sleep(2);
	reset_undo_redo();
	
	show_loading(3, 3, "Optimizing playback...");
	await sleep(2);
	loaded_from_data = false;
	
	Marker_Maker.clearAll();
	Marker_Maker.renderMarkers();
	
	scanOptimized();	
	finish_loading();
	updateTrackBounds();
	
	try{		
		loadLinkedMedia(fileOptions); //Try to load any linked media to this file
	}catch(e){
		//-
	}
	
	
	selected_content = null; //remove selection for the newly loaded timeline
	return;
	
}


//Clear Current Timeline Project
function new_refresh(noConfirm = false){
	if(!noConfirm){
		let isOkay = window.confirm("Clear Current Project Data?");
		if(!isOkay){
			return false;
		}
			
	}
	
	loaded_from_data = false;	
	timeline_data = [];
	templates = [];
	markers = [];
	fileOptions = {};
	
	load_all_templates();	
	reset_undo_redo();
	
		
	const myNode = _("timeline_");
		while (myNode.lastElementChild) {
    myNode.removeChild(myNode.lastElementChild);
  }
  
  add_track();
	
}


function refresh_track(tr_id){
	if(tr_id >= timeline_data.length || tr_id == null){
		
		console.warn("Track id out of bound!");
		return false;
	}
	
	loaded_from_data = true;
	parentTrack(tr_id).innerHTML = "";
	parentTrack(tr_id).appendChild(createTrackBound({'track_id':tr_id}));
	
	selected_track_index = tr_id;
	
		for(dft = 0;dft < timeline_data[tr_id].sub_tracks.length;dft++){
			sub_data_id = dft;
			add_sub_tracks(timeline_data[tr_id].sub_tracks[dft]);
		}
	
	loaded_from_data = false;
	updateTrackBounds();
	_("total_tracks").innerHTML = timeline_data.length;
	
}




function regen_empty_data(){
	
	
	for(tmsd = 0;tmsd < timeline_data.length;tmsd++){
		
		for(sbsd = 0; sbsd < timeline_data[tmsd].sub_tracks.length; sbsd++){
			
			var dat = timeline_data[tmsd].sub_tracks[sbsd];
			
			if(dat.content_length != dat.data.length){
				
				if(find_plug(dat.type) == undefined){
					console.log("Plugin "+ dat.type + " not installed!");
					return;
					
				}
				
				timeline_data[tmsd].sub_tracks[sbsd].data = JSON.parse(JSON.stringify(regen_from_plugin(find_plug(dat.type), timeline_data[tmsd].sub_tracks[sbsd].misc)));
				
			}
			
			
		}
		
		
	}
	
}




function save_dummy(){
	var datas = JSON.stringify(timeline_data);
	var templates_ = JSON.stringify(templates);
	localStorage.setItem("data_dummy",datas);	
	localStorage.setItem("data_templates",templates_);	
	localStorage.setItem("options",JSON.stringify(fileOptions));	
	localStorage.setItem("markers",JSON.stringify(markers));	
}





//Saving Project Into a File

var regenerative;



function comulate_timeline(){	
	regenerative = JSON.parse(JSON.stringify(timeline_data));		
	for(tm = 0;tm < regenerative.length;tm++){				
		for(sb = 0; sb < regenerative[tm].sub_tracks.length; sb++){			
			var dat = regenerative[tm].sub_tracks[sb];						
			if(include_data == false){								
				regenerative[tm].sub_tracks[sb].data.length = 0;
								
			}						
		}		
	}	
	
	return regenerative;
	
}




function save_to_file(){
	
	var rec_project = {
		"templates":encode(JSON.stringify(templates)),
		"timeline":encode(JSON.stringify(comulate_timeline())),	
		"options": encode(JSON.stringify(fileOptions)),
		"markers": encode(JSON.stringify(markers)),
	}
	
	try{	
		var to_transfer = JSON.stringify(rec_project);	
		window.chrome.webview.hostObjects.NativeObject.put_data(to_transfer);	
		
	}catch(e){
		//-
	}
	command_save();
}

function command_save(){
		try{				
		window.chrome.webview.hostObjects.NativeObject.Save_To_File();
		}catch(e){
		alert(e);				
	}

	scanOptimized();
	
}


//Preview media from plugin



function media_prev(f){
	if(current_mode != "edit"){
		return;
		
	}
	
	is_preview = true;
	
	
	
	var current_at_point = timeline_data[selected_track_index].sub_tracks[selected_content.getAttribute("content_id")];
	

	this_vid.currentTime = (parseFloat(current_at_point.start_at+f)/33.333);
		this_vid.play();
	
}



function stop_media_prev(){
	
	if(current_mode != "edit"){
		return;
		
	}
	
	this_vid.pause();

}





//Internal Time
var userScroll = false;
var counter_for_limit = 0;
let prevPortsCount = 0;

function rails(){
	
	//For Template Player Rail
	try{
		t_rail();
	}catch(e){
		return;
		//--
	}
	
	
	
	if(playing == true){
		// console.log(time);
		
		
		
		
		if(optimizedData){
			play_on_optimized();
		}else{
			play_on_current();
		}
		
		
		time++;
	
	
		if(time < parseInt((this_vid.currentTime * 33.333) - 2) || time >  parseInt((this_vid.currentTime * 33.333) + 2)){
			if(nomedia == false && player_seeked == false){//only when media is playing

					time = parseInt(this_vid.currentTime * 33.333);
				
				 this_vid.play();
			}
		}
		
		player_seeked = false;
		
	
		// console.log("currentTime: "+ time +"\nvid time: "+ parseInt(this_vid.currentTime * 33.333));
	
		if(time+10 <= (_("timeline_container").scrollWidth) / zoom_scale){
						
			if(counter_for_limit > limitThreshold){	
			
				//interval for updating play GUIs
				play_head(time+10);				
				counter_for_limit = 1;				
			}
			
			// _("playhead").scrollIntoView();
			if(follow_playhead == true){
				userScroll = false;
		
				scroll_timeline();
			
				
			}
		
			
		}
	
	}else if(playing == false && active == true){
		
		//Play from template player if active

		if(template_player.playingQue.length <= 0){
		
			if(!hasSentLast){
	
				//sendPort(0,output);
				
				output.length = prevPortsCount;
				
				//clearAllBuffer();
				
				send_to_port();
				
				hasSentLast = true;
				prevPortsCount = 0;
			}
			
			
			return;
		
		}else{
			prevPortsCount = output.length;
			send_to_port();
			hasSentLast = false;
		}
	
	


		
		
	}

		
	if(time+10 >= (_("timeline_container").scrollWidth - 3) / zoom_scale){
		
		//console.log("Ended at: "+ parseInt((time/33.33))+"s" );
		
			stop();
		
		if(loop == true){
			
			play();
			
		}
		
		
	}
	
	if(counter_for_limit > 10){
		counter_for_limit = 0;	
	}
	
	counter_for_limit++;
}



//Timeline Auto Scrolling
var follow_mode = settings.get('followMode');
var followTick = 0;
let prevScrollLeft;
function scroll_timeline(){
	
			
			if(follow_mode == "page"){		
				//follow scrolling by page 
				
				limitThreshold = 2;
				
				if((_("timeline_container").scrollLeft + get_size(_("timeline_container"))[0]) <= (time+10) * zoom_scale){
					
					_("timeline_container").scrollTo(time, _("timeline_container").scrollTop);
					
				}else if(_("playhead").getBoundingClientRect().left < 0 && follow_playhead == true){
					_("timeline_container").scrollTo(time * zoom_scale, _("timeline_container").scrollTop);
				}
				
			}else{
				//follow scrolling with the playhead at center
				
				if(followTick < 1){
					followTick++;
					return;
				}
				
				_("timeline_container").scrollTo((time * zoom_scale)-(_("timeline_container").getBoundingClientRect().width * 0.5),_("timeline_container").scrollTop);
				
				if(_("timeline_container").scrollLeft != prevScrollLeft){//adjust scroll Interval if not scrolling horizontally			
					limitThreshold = 3;
				}else{
					limitThreshold = 2;
				}
				
				prevScrollLeft = _("timeline_container").scrollLeft;
				followTick = 0;
			
			}
	
}



//Helper Function to Select Play Mode
function modeSelect(mode){
	
	if(mode == 'manual'){
		_("timeline_container").style.visibility = "hidden";
		_("template_player_container").style.display = "flex";
		current_mode = "add_manual_template";
		playMode = "manual";
		editing_shortcuts = false;
		
		
	}else{
		_("timeline_container").style.visibility = "visible";
		_("template_player_container").style.display = "none";
		current_mode = "add";
		playMode = "timeline";
		editing_shortcuts = true;
		
	}
	
	
	
	
}



/* Extra */


//Helper Function for initializing and setting Data Inclusion preference 
function dataIncluded(val){
	settings.set('includeData',val);
	include_data = val;
	
}


function projectScriptColor(val){
	fileOptions.color = val;
	
}


// Send Ready to Native Host

try{
	window.chrome.webview.hostObjects.NativeObject.Onready();

	}catch(e){
	console.log('No native host found');
}



var f = gen_ruler(); //add_sub_tracks();   // -- during first opening;