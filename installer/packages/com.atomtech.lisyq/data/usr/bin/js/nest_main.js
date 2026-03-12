var time_per_pexil = 30; //1 pexil = 30... milisecond for this program
						//33 pexils = 1 sec.

var time = 0;
let playlistTime = 0;


//Play States
var playing = false;
var PLplaying = false;
var loop = false;
var is_preview = false;
var delay = 0;

var zoom_scale = 1;


var timeline_data = [];

var player_start = setInterval(rails, time_per_pexil);

let vResizer1 = vertical_resizer.clone();
let vResizer2 = vertical_resizer.clone();
let hResizer1 = horizontal_resizer.clone();
let hResizer2 = horizontal_resizer.clone();

let prefixRoot = '../';

let playlistData = [];
let playlistList = {
	'name': 'No Playlist Name',
	'playlists': [],
	
};

let currentPlayingIndex = null;

let plnomedia = true;
let tlnomedia = true;


// Timeline Vars
let TimelineData = [];//Timeline Templates
let TimelineSequence = [];//Timeline Sequences 

let click_on_track;
var pl = _("playhead");

let timeline_time = 0; //Time index for nested timeline
let tm_playing = false;
let TLplaying = false;
let tm_player_seeked = false;

var origin_sub;
var origin_sub_pos = [];
var can_move_track = true;
var follow_playhead = true;
var context_menu = false;

let multiple_selected;
let selected_script_index;

let PROGRESS_SAVED = false;

let left_margin = 0;

function inits(){
	
	vResizer1.min = 50;
	vResizer1.max = 75;
	vResizer1.initSize(_('v_rez1'));
	
	vResizer2.min = 40;
	vResizer2.max = 60;
	vResizer2.view1 = 'v2_con_1';
	vResizer2.view2 = 'v2_con_2';
	vResizer2.initSize(_('v_rez2'));
	
	
	hResizer1.min = 30;
	hResizer1.max = 45;
	hResizer1.initSize(_('h_rez1'));

	hResizer2.min = 30;
	hResizer2.max = 65;
	hResizer2.view1 = 'h2_con_1';
	hResizer2.view2 = 'h2_con_2';
	hResizer2.initSize(_('h_rez2'));



}

inits();


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



async function loadToPlaylist(){
	
	let decodedData = JSON.parse(loadedFile);
	let timelineData = JSON.parse(decode(decodedData.timeline));
	let timelineOptions = decodedData.options ? JSON.parse(decode(decodedData.options)) : {};
	let maxEnd = undefined;
		
	if(loadmode == 'single'){
		maxEnd = regen_empty_data(timelineData);
	}

	
	let playitem = {
		'timeline': timelineData,
		'options': timelineOptions,
		'filePath': loadedFilePath,
		
	}
	
	if(loadmode == 'single'){
		playitem.maxTime = maxEnd;
	}else{
		stopPL();
		currentPlayingIndex = 0;
	}
	
	playlistData.push(playitem.clone());
	
	//refresh list on view
	generatePListView();
	loadmode = "";	
}

//Generate pl element for list
function genPLItem(name="No name",id=undefined){
	let plitem = make('div');
		plitem.setAttribute('class', 'list_item_pl');
		var plitem_DIV = make('div');
		let spanText = make("span");
			spanText.innerText = name;
		plitem_DIV.setAttribute('class', 'saved_name small');
		plitem_DIV.appendChild(spanText);
		plitem.appendChild(plitem_DIV);
		
		var plitem_DIV = make('div');
		plitem_DIV.setAttribute('class', 'saved_actions small');
			  var plitem_DIV_DIV = make('div');
			  
			  plitem_DIV_DIV.setAttribute('class', 'button_box button_xz');
			  plitem_DIV_DIV.setAttribute('onclick', 'playPLItem('+id+')');
			  plitem_DIV_DIV.appendChild(document.createTextNode(' Play '));
		plitem_DIV.appendChild(plitem_DIV_DIV);
		
			  var plitem_DIV_DIV = make('div');
			  plitem_DIV_DIV.setAttribute('class', 'button_box button_xz');
			  plitem_DIV_DIV.setAttribute('onclick', 'removePLItem('+id+')');
			  plitem_DIV_DIV.appendChild(document.createTextNode(' Remove '));
		plitem_DIV.appendChild(plitem_DIV_DIV);

			  var plitem_DIV_DIV = make('div');
			  plitem_DIV_DIV.setAttribute('class', 'button_box button_xz');
			  plitem_DIV_DIV.setAttribute('onclick', 'showPLOptions('+id+')');
			  plitem_DIV_DIV.appendChild(document.createTextNode(' ... '));
		plitem_DIV.appendChild(plitem_DIV_DIV);

		plitem.appendChild(plitem_DIV);

	return plitem;	

}


function generatePListView(){
	//Generate Playlist list view and data here

	let extId = 0;
		_("playlistView").innerHTML = "";
	for(each of playlistData){
		let fileName = replaceBackslashes(each.filePath).split("/");
			fileName = fileName[fileName.length - 1];
		let item = genPLItem(fileName, extId);
		
		if(currentPlayingIndex == extId){
			item.classList.add('currentPlaying');
		}
		
		_("playlistView").appendChild(item);
		extId++;
	}
	
}

let savingData;
async function generatePLSave() {
    return new Promise((resolve) => {
        let lists = playlistList.playlists;
        lists.length = 0;

        let extId = 0;
        for (each of playlistData) {
            let data = { 'filePath': each.filePath };
            lists.push(data);
            extId++;
        }

        savingData = JSON.stringify(playlistList);

        // Resolve the promise once everything is done
        resolve();
    });
}



// Regeneration Handler
function regen_empty_data(input_timeline_data=undefined) {
  let used_timeline_data = input_timeline_data || timeline_data; //use default if timeline object is not passed
  let max_time = 0;

  for (let tmsd = 0; tmsd < used_timeline_data.length; tmsd++) {
    for (let sbsd = 0; sbsd < used_timeline_data[tmsd].sub_tracks.length; sbsd++) {
		let dat = used_timeline_data[tmsd].sub_tracks[sbsd];
		let endingAt = dat.end_at;
		
		if(endingAt > max_time){
			max_time = endingAt;
		}
		
      if (dat.content_length != dat.data.length) {
        if (find_plug(dat.type) == undefined) {
          console.log("Plugin " + dat.type + " not installed!");
          return;
        }

        used_timeline_data[tmsd].sub_tracks[sbsd].data = JSON.parse(
          JSON.stringify(regen_from_plugin(find_plug(dat.type), used_timeline_data[tmsd].sub_tracks[sbsd].misc))
        );
      }
    }
  }
  
  return max_time; //returns the greatest end time found while regenerating each;
}



//End regen function here



// Loading Files Logic Start

let loadedFile = "";
let loadedFilePath = "";
let loadFilemode = "playlist";

//callback from the Native Host
function load_from_file(fileData, filePath, extra={}){
	// console.log(fileData, filePath);
	loadedFile = fileData;
	loadedFilePath = filePath;
	
	if(loadFilemode == "playlist"){
		try{
			loadToPlaylist(extra);
		}catch(e){
			console.log(e);
		}

	}else if(loadFilemode == "timeline"){
		//Load it to Somewhere
		try{
			loadToNestTimeline(extra);
		}catch(e){
			console.log(e);
		}

		
		
	}
	
}


// Load Lsys to playlist helper function
let loadmode; //indicate if only loading one sequence file
function openLsysFilePL(){
	loadmode = 'single';
	loadFilemode = "playlist";
	openFile();
	
}


async function load_pl_from_file(data){
	//Load the Passed Data to Playlist
	let pl_data = JSON.parse(JSON.parse(decode(data)));
	let pl_len = pl_data.playlists.length;
	let pl_list = pl_data.playlists;	
	
	playlistData.length = 0;
	
	for(i = 0; i < pl_len;i++){
		show_loading(pl_len, i, "Loading Files...");
		let path = pl_list[i].filePath;
		try{
			let fContents = await openFilePath(replaceBackslashes(path));
			load_from_file(fContents,path);
		}catch(e){
			console.log("Failed loading: "+ path);
		}

	}
	console.log(pl_data);
	regenDatas();
	
	
}

async function regenDatas(){
	
	let pllen = playlistData.length;
	show_loading(pllen-1, 1, "Regenerating Timeline data...");
	for(z = 0; z < pllen; z++){
		show_loading(pllen-1, z, "Regenerating Timeline data...");
		let maxEnd = regen_empty_data(playlistData[z].timeline);
		playlistData[z].maxTime = maxEnd;
		
		await sleep(1);
	}
	
	finish_loading();	
}



// Native Bridge
function openFile(){
	try{
		window.chrome.webview.hostObjects.NativeObject.Open_File();
	}catch(e){
		//--
	}	
}

function OpenFilePL(){
	try{
		window.chrome.webview.hostObjects.NativeObject.Open_File_PL();
	}catch(e){
		//--
	}	
}



async function save_pl_to_file(){
	let sd_d = await generatePLSave();
	try{	
		var to_transfer = encode(JSON.stringify(savingData));	
		window.chrome.webview.hostObjects.NativeObject.put_pl_data(to_transfer);
	}catch(e){
		//-
	}
	command_save_pl();
}




function command_save_pl(){
		try{				
		window.chrome.webview.hostObjects.NativeObject.Save_File_PL();
		}catch(e){
		alert(e);				
	}
}


// Loading Files Logic End


// Media Player Logic

let plvid = _("thisvidpl");


plvid.oncanplay = function() {
	// console.log(this_vid.currentTime);
	plnomedia = false;
}

plvid.onerror = function() {
	// console.log(this_vid.currentTime);
	plnomedia = true;
}


plvid.onseeking = function() {
	//console.log(this_vid.currentTime);
	player_seeked = true;
	if (playing == false) {
		time = parseInt(plvid.currentTime * 33.33);
		setTimeDisplay(time+10, 'time_display_pl');
	}
}

plvid.onplay = function() {
	// console.log(this_vid.paused);
	if (is_preview) {
		playing = false;
		is_preview = false;
		return;
	}
	if (playing == false) {
		playPL(true);
	}
}

plvid.onpause = function() {
	// console.log(this_vid.currentTime);
	pausePL(true);
}

plvid.onended = function() {
	// console.log(this_vid.currentTime);
	plprocessonend()
}



//=================================
// Timeline Media Player Logic
// Binding Functions


let tlvid = _("thisvidtm");


tlvid.oncanplay = function() {
	// console.log(this_vid.currentTime);
	tlnomedia = false;
}

tlvid.onerror = function() {
	// console.log(this_vid.currentTime);
	tlnomedia = true;
}


tlvid.onseeking = function() {
	//console.log(this_vid.currentTime);
	tm_player_seeked = true;
	if (tm_playing == false) {
		timeline_time = parseInt(tlvid.currentTime * 33.33);
		console.log(timeline_time);
		
		setTimeDisplay(timeline_time+10, 'time_display_tl');
	}
}

tlvid.onplay = function() {
	// console.log(this_vid.paused);
	if (is_preview) {
		tm_playing = false;
		is_preview = false;
		return;
	}
	if (tm_playing == false) {
		playTL(true);
	}
}

tlvid.onpause = function() {
	// console.log(this_vid.currentTime);
	pauseTL(true);
}

tlvid.onended = function() {
	// console.log(this_vid.currentTime);
	tlprocessonend();
}



//Playback for playlist

function playPL(from_player){
	PLplaying = true;
	
	if(from_player){
		return true;
	}
	
	if(plvid.paused ){	
		try{
			plvid.play();	
		}catch(e){
			//-
		}
	}
}

function pausePL(from_player){
	PLplaying = false;
	
	if(from_player){
		return true;
	}
	
	if(plvid.paused == false){
		try{
		plvid.pause();
		}catch(e){
			//-
		}
	}
}


function stopPL(){
	PLplaying = false;
	time = 0;
	
	//clearAllBuffer();
	
	plvid.currentTime = 0;
	plvid.pause();
	
}



function set_delay(val){	
	let local = localStorage.getItem('play_delay_plyls');	
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
		localStorage.setItem('play_delay_plyls',val);		
		if((val == "" || val == null) || val.length == 0){				
			localStorage.setItem('play_delay_plyls',0);			
		}			
		let set = parseInt(localStorage.getItem('play_delay_plyls'));		
		delay = (set*0.001)*33.333;		
		optimizedData = false;			
	}
}


function playPLItem(index=undefined){
	if(index==undefined){
		return false;
	}
	let maxL = playlistData.length;
	if(index >= maxL){
		index = 0;
	}else if(index < 0){
		index = maxL-1;
	}
	timeline_data = playlistData[index].timeline;
	let mediaLink = undefined;
	
	try{
		mediaLink = playlistData[index].options.link_file;
	}catch(e){
		//
	}
	currentPlayingIndex = index;
	
	time = 0;
	playPL();
	if(mediaLink != undefined){
		loadMediaFromPath(mediaLink, 'thisvidpl');
	}else{
		plvid.src = createSilentAudio(parseInt(playlistData[index].maxTime / 33.33));//create silent track if nothing found
		plnomedia = false;
	}
	generatePListView();
}

function removePLItem(index){	
	let flr = window.confirm("Are you sure to remove this?");
	if(!flr){
		return;
	}	
	playlistData.splice(index,1);
	if(index == currentPlayingIndex){
		try{
			playPLItem(index);
		}catch(e){
			//-
		}
		
	}

	generatePListView();
	
	
}



function nextPL(){
	let next = currentPlayingIndex + 1;
	playPLItem(next);
}


function prevPL(){
	let prev = currentPlayingIndex - 1;
	playPLItem(prev);
}

let repeatPL = false;

//Loop Event for playing
let offsets = 0;
let offsets2 = 0;
function rails(){

	// for Plalist Playing rail
	if(PLplaying == true){
		play_on_current();
	
		time++;
		
		if(offsets >= 3){
			setTimeDisplay(time+10, 'time_display_pl');
			offsets = 0;
		}else{
			offsets++;
		}
	
		
			if(time < parseInt((plvid.currentTime * 33.33333) - 2) || time >  parseInt((plvid.currentTime * 33.33333) + 2)){
			if(plnomedia == false && player_seeked == false){//only when media is playing
					time = parseInt(plvid.currentTime * 33.33333);
				 plvid.play();
			}
		}
		
		player_seeked = false;
		
		try{
			let plEnd = playlistData[currentPlayingIndex].maxTime;
			if(time > plEnd){
				plprocessonend();
			}
		
		}catch(e){
			//--
		}

	}
	
	
	if(TLplaying == true){
		railInTimeline();
		timeline_time++;
		
		
		if(offsets2 >= 3){
			setTimeDisplay(timeline_time+10, 'time_display_tl');
			offsets2 = 0;
			
		}else{
			offsets2++;
		}
		
		
		if(offsets2 == 1){
			let event_time = (timeline_time);
			let calculated_time = (event_time / (20 / 3))
			play_head(calculated_time + (8 / zoom_scale));
		}
		
		
				
		if(timeline_time < (tlvid.currentTime * 33.333333333) || timeline_time >  (tlvid.currentTime * 33.333333333)){
			if(tlnomedia == false && tm_player_seeked == false){//only when media is playing
					timeline_time = parseInt(tlvid.currentTime * 33.333333333);
				 tlvid.play();
			}
		}
		
		
		tm_player_seeked = false;

		//To-Do: implement timeline playing states


			if(follow_playhead == true){
				userScroll = false;
				scroll_timeline();			
			}
		
		return;
	}
	
}

var follow_mode = "";//settings.get('followMode');
var followTick = 0;
let prevScrollLeft;
let TIME_SCALE = (20 / 3);
function scroll_timeline(){
	
			
			if(follow_mode == "page"){		
				//follow scrolling by page 
				
				limitThreshold = 2;
				
				if((_("timeline_container").scrollLeft + get_size(_("timeline_container"))[0]) <= (timeline_time+10) * zoom_scale){
					
					_("timeline_container").scrollTo(timeline_time, _("timeline_container").scrollTop);
					
				}else if(_("playhead").getBoundingClientRect().left < 0 && follow_playhead == true){
					_("timeline_container").scrollTo(timeline_time * zoom_scale, _("timeline_container").scrollTop);
				}
				
			}else{
				//follow scrolling with the playhead at center
				
				if(followTick < 1){
					followTick++;
					return;
				}
				
				_("timeline_container").scrollTo(((timeline_time / TIME_SCALE)  * zoom_scale)-(_("timeline_container").getBoundingClientRect().width * 0.5),_("timeline_container").scrollTop);
				
				
				
				if(_("timeline_container").scrollLeft != prevScrollLeft){//adjust scroll Interval if not scrolling horizontally			
					limitThreshold = 3;
				}else{
					limitThreshold = 2;
				}
				
				prevScrollLeft = _("timeline_container").scrollLeft;
				followTick = 0;
			
			}
	
}


//Handle Click on ruler
function click_on_ruler(){
	
	if(follow_playhead == true){
		play_head((event.clientX - ( 2 + left_margin) + _("timeline_container").scrollLeft) / zoom_scale);
		timeline_time = (((event.clientX) - (10+ left_margin) + _("timeline_container").scrollLeft ) * TIME_SCALE) / zoom_scale;
		
		_("thisvidtm").currentTime = ((timeline_time-2)/ 33.33333);
		player_seeked = true;
		
		play_on_current();
	
	}else if(follow_playhead == false && TLplaying == false){
		play_head((event.clientX - (2 + left_margin) + _("timeline_container").scrollLeft)/ zoom_scale);
		timeline_time = (((event.clientX) - (10+ left_margin) + _("timeline_container").scrollLeft ) * TIME_SCALE) / zoom_scale;
	
		
		_("thisvidtm").currentTime = ((timeline_time-2)/ 33.33333);
		player_seeked = true;
		
		play_on_current();
		
	}
	follow_playhead = true;
	_("ruler_view").style.opacity = 1;
	
	_("ruler_view").title = "Follow head is On";
	
	setTimeDisplay(timeline_time, 'time_display_tl');
	
}


function plprocessonend(){
	if(repeatPL && currentPlayingIndex >= playlistData.length - 1){
		nextPL();
	}else if(currentPlayingIndex < playlistData.length - 1){
		nextPL();
	}
}

function tlprocessonend(){
	//What happens if the media sampler for timeline ends
	
	
}



// ===================================
// Timeline Logic  ===================
// ===================================


var prev_wi = 0;

//Generate Ruler with its params and sizing config
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
		// Do Something here
	}
	prev_scroll = _("timeline_container").scrollTop;
}



// Load Lsys to playlist helper function
function openLsysFileNS(){
	loadmode = 'single';
	loadFilemode = "timeline";
	openFile();
	
}
var fRuler = gen_ruler()//init the Ruler 



async function loadToNestTimeline(extra){
	
	let decodedData = JSON.parse(loadedFile);
	let timelineData = JSON.parse(decode(decodedData.timeline));
	let timelineOptions = decodedData.options ? JSON.parse(decode(decodedData.options)) : {};
	let markers = decodedData.markers ? JSON.parse(decode(decodedData.markers)) : {};
	let maxEnd = undefined;
	let uid;
	
	if(extra.id){
		uid = extra.id; //Supplied from Opening a Project file if present
	}else{
		uid = crypto.randomUUID();	
	}
	
	if(loadmode == 'single'){
		maxEnd = regen_empty_data(timelineData);
	}
	
	
	let playitem = {
		'timeline': timelineData,
		'options': timelineOptions,
		'markers': markers,
		'filePath': loadedFilePath,
		'id':uid,
		'max': maxEnd,
		
	}
	

	
	TimelineData.push(playitem.clone());
	
	//refresh scripts list
	generateTimelineListView();
	loadmode = "";	
}


function generateTimelineListView(){
		//Generate Timeline list view and data here
	let extId = 0;
		_("script_main").innerHTML = "";
	for(each of TimelineData){
		let fileName = replaceBackslashes(each.filePath).split("/");
			fileName = fileName[fileName.length - 1];
			each.name = fileName;			
			let config = {
				'name': fileName,
				'config': {'color': '#fafafa'},
				
			}
			
			//Add the Custom Color to Script Stub
			if(each.options.color && each.options.color != ""){
				config.config.color = each.options.color;
			}
			
		let item = genNSTItem(config, extId, each.id);
		 _("script_main").appendChild(item);
		extId++;
	}
}



//generate Nest Item list
function genNSTItem(tl_data,id,uuid){

	var template_thumb = document.createElement("div");
		template_thumb.classList.add("template_thumb");
		template_thumb.style.backgroundColor = tl_data.config.color+"d5";
		// template_thumb.title = tl_data.name + "\nType:" + tl_data.type ;
		template_thumb.setAttribute("template_id",id);
		template_thumb.setAttribute("onclick","add_to_nesttimeline('"+uuid+"')");
		template_thumb.setAttribute("oncontextmenu","cotextmenu_scriptstub('"+uuid+"')");
		template_thumb.setAttribute("title",tl_data.name);
		
	var template_thumb_name = document.createElement("div");
		template_thumb_name.classList.add("plug_thumb_name");
		template_thumb_name.innerHTML = tl_data.name;
		template_thumb.appendChild(template_thumb_name);
		
	
	return template_thumb;
	
}


function cotextmenu_scriptstub(uuid){
	// console.log(event.target);
	selected_script_index = findIndexByUUID(uuid);
	
	set_coords_context(event.screenX,event.screenY);
	window.chrome.webview.hostObjects.NativeObject.Show_template_scriptmenu();
	
}

function content_context_menu(){
	set_coords_context(event.screenX,event.screenY);
	window.chrome.webview.hostObjects.NativeObject.Show_content_menu();
}





let _lastUID = "";
let _lastFoundId;
function findIndexByUUID(uuid) {
	//optimized for repeated search
	if(_lastUID == uuid){
		if(TimelineData[_lastFoundId].id == uuid){
				return _lastFoundId;
		}
	}
	
	
    for (let i = 0; i < TimelineData.length; i++) {
        if (TimelineData[i].id === uuid) {
			_lastFoundId = i;
			_lastUID = uuid;
            return i;
        }
    }

    return -1; // Return -1 if the UUID is not found
}



//Function to add a script template into the nest timeline
function add_to_nesttimeline(id,com,raw_data=undefined){
	let foundIdex = findIndexByUUID(id);
	if(foundIdex <= -1){
		return console.warn("ID: ", id, "Not found on loaded script list");
	}
	
	let contentData = {
		uid: id, //uuid of the lysis content  
		length: TimelineData[foundIdex].max,//length of the content derived from the content
		offset: parseInt(timeline_time),   //location of this content as offset. 
	}
	
	if(typeof(raw_data) == "object"){
		
		contentData.uid = raw_data.id;
		contentData = raw_data;
	}
	
	TimelineSequence.push(contentData);
	console.log(TimelineSequence);
	
	let content_id = TimelineSequence.length-1;
		
	if(com == undefined){
		push_undo("subtrack", "add", 0, contentData,content_id);
	}
	
	revoke_selections();
	loadTimeline();
	isOptimized = false;
}


//generate Timeline view and events
function loadTimeline(){
	let timeline_tracks = _("timeline_container").getElementsByClassName("track_con");
	
	// console.log(timeline_tracks);
	
	for(z = 0; z < timeline_tracks.length;z++){
		timeline_tracks[z].innerHTML = "";
		timeline_tracks[z].addEventListener("mousedown",timeline_click_event);
		nestLoadTracksContents(z, timeline_tracks[z]);
	}

	
}


//Load all contents of a nest timeline track
function nestLoadTracksContents(id = undefined, targettrack){
	if(id == undefined){
		return false;
	}
	
	for(i = 0; i < TimelineSequence.length;i++){

		
		TimelineSequence[i].content_id = i;
		let strack = generateTMcontentblock(TimelineSequence[i]);
		targettrack.appendChild(strack);
		
	}
	
}


function generateTMcontentblock(data){
		//Visualy create the content to the timeline as an element

		var sub_track = document.createElement("div");
			sub_track.classList.add("sub_track","larger_subtrack");
			sub_track.addEventListener("mousedown",set_track_node);
			sub_track.setAttribute("content_id", data.content_id);
			sub_track.setAttribute("oncontextmenu", "content_context_menu()");
			
			
			
		var calculated_offset = (data.offset / (20 / 3));	
		var calculated_lentime = (data.length / (20 / 3));	
			
			sub_track.style.left = "calc(var(--scale) *"+ (calculated_offset)+"px)";
			sub_track.style.width = "calc(var(--scale) *"+ calculated_lentime +"px)";
			
		let content_data = TimelineData[findIndexByUUID(data.uid)];
		let colorCode = "#afafaf"; //default gray	
		var div_details = document.createElement("div");	
			div_details.innerText = "No Name";		
			try{
				if(content_data.options.color != undefined){
					colorCode = content_data.options.color;
				}
				div_details.innerText = content_data.name;
				
			}catch(e){
				console.log("Problimatic Timeline Data: "+ data.uid);
				sub_track.title = "This Timeline Block is having Loading Problems: uuid - "+ data.uid;
				console.log(e);
			}
			
			sub_track.style.backgroundColor = colorCode+"50";
			// sub_track.addEventListener("contextmenu", function (e){}, false);
			// console.log(content_data);

			div_details.classList.add("content_details_inline");

			
			//Add the Markers to the Stab
			
			if(content_data.markers){
				for(let m=0; m < content_data.markers.length;m++){
				let mark = content_data.markers[m];
				
				let markElm = make("div");
					markElm.title = mark.name;
					markElm.classList.add("marker_on_stab");
					markElm.style.borderColor = mark.color+"fe";
					
				let calculated_mark = (mark.time / (20 / 3));	
					
					markElm.style.left = "calc(var(--scale) *"+ (calculated_mark)+"px)";
					
				let markerCircle = make("span");
					markerCircle.classList.add("markercircle");
					markerCircle.style.borderColor = mark.color+"fe";
					markElm.appendChild(markerCircle);
				sub_track.appendChild(markElm);
				}
			}
			

			
			
			
			sub_track.appendChild(div_details);
		
		return sub_track;
}



function timeline_click_event(){//clicked on timeline track
		var scrolled = _("timeline_container").scrollLeft;
	
	let on_tracks = (event.srcElement.classList.contains("track_con") || event.srcElement.classList.contains("sub_track"));
	
	let condition = (click_on_track == true && event.shiftKey == true && event.buttons == 1);
	
	
	if(condition || TLplaying == false){
		if(on_tracks){
			play_head((event.clientX+scrolled - (2)) / zoom_scale);
			event_time = ((event.clientX - (10))+scrolled ) / zoom_scale;
		
			timeline_time = (event_time * 20 / 3);
			
			_("thisvidtm").currentTime = ((timeline_time-2)/33.333); 
			setTimeDisplay(timeline_time, 'time_display_tl');
			player_seeked = true;
		}
		if(TLplaying == true){
			_("thisvidtm").play();
		}
	}
	
	
	// play_on_current();
	selected_track_index = parseInt(this.getAttribute("tracks_id"));
	

	
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


//subtracks Function
let content_id_block;
let prev_content;
let selected_content;
let selected_contents = [];

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
	
	//set_coords_context(event.screenX,event.screenY); //for context menu location
	
	var e = event;
	// console.log(e);	
	movement = 0;
	this.parentNode.addEventListener("mousemove", reposition_subtrack);
	this.parentNode.addEventListener("mouseup", remove_onmove);
	this.parentNode.addEventListener("mouseleave", remove_onmove);
	
	content_id_block = this;
	initial_pos_sub_track = [e.clientX, e.clientY];		
	selected_content = this;

	revoke_selections("force");
	this.classList.add("selected_content");
		
	
	//If the selected object was clicked again
	if(prev_content == selected_content){
		// console.log("same");
		revoke_selections("force");
		this.classList.add("selected_content");
		selected_contents.length = 0;
	}
	prev_content = selected_content;
	
	if(this.style.left.length > 0){
		origin_sub = this.style.left.replace(/[^\d.]/gi, "");
		ds = this;
	}else{
		origin_sub = this.getBoundingClientRect().x;
	}
}



//draging a sub_tracks to mouse postion
function reposition_subtrack(){
		
		if(can_move_track == false || event.buttons >= 2){
			// set_coords_context(event.screenX,event.screenY);
			return;
		}		
				

		//For Multiple Selections 
		// if(selected_contents.length > 1){
			// prev_content = null;
			// multiple_moves();
			// return;
		// }
		
		
		try{
			selection.disable();	
			enableAutoHide();			
		}catch(e){
			//--
		}
		
		
		
	try{
		var selected_item = selected_content.getAttribute('content_id');
	
		if(movement <= 0){
			
			TimelineSequence
			
			
			
			
			push_undo("subtrack", "edit", selected_track_index, decople_data(TimelineSequence[selected_item]), selected_item);
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

		var content_lengths = TimelineSequence[content_ids].length;

		TimelineSequence[content_ids].offset = calculated_position * (20 / 3);
		
		TimelineSequence[content_ids].end_at = (calculated_position * (20 / 3))+content_lengths;
		
		// set_coords_context(event.screenX,event.screenY);
		
		//This pushes to undo when user is done moving selected elm
	
		event.target.onmouseup = (function(){
					
			// push_undo("subtrack", "edit", selected_track_index, decople_data(timeline_data[selected_track_index].sub_tracks[selected_item]), selected_item);
		
		});	
		event.target.onmouseleave = (function(){
					
			// push_undo("subtrack", "edit", selected_track_index, decople_data(timeline_data[selected_track_index].sub_tracks[selected_item]), selected_item);
		
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



function modify_sub_track(data, action=undefined){
	
	console.log(data);
	
	
	
}


function remove_onmove(){
	can_move_track = true;	
	var my_selected_track_ = document.getElementsByClassName("track_con")[selected_track_index];
	my_selected_track_.style.width = _("timeline_container").scrollWidth - 10 + "px";	//resizes the track width after mouse user click
	this.removeEventListener("mousemove",reposition_subtrack);	

	gen_ruler();
	
}


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

// To-Do: Remove Script and its items on the Timeline

function remove_scriptstub(id=undefined){
	let script_id = (id != undefined) ? id : selected_script_index ;
	if(id == undefined && selected_script_index == undefined){
		return console.warn("No selected index found for this item");
	}
	
	let confirms = confirm("Are you sure you want remove this script content? \nIt will also remove entries from the timeline that is using this script.");
	if(!confirms){
		return false;
	}
	
	
	let uuid = TimelineData[script_id].id;
		_lastUID = ""; //clear prevs
		_lastFoundId = "";
	
	//we start from the last
	for(let ts =  TimelineSequence.length; ts >= 0; ts--){
		let each = TimelineSequence[ts-1];
		try{
			if(each.uid == uuid){
				TimelineSequence.splice(ts-1, 1);
		 }				
		}catch(e){
			//--
		}
	}
	
	
	let removedElement = TimelineData.splice(script_id, 1);
	
	isOptimized = false;
	
	generateTimelineListView();
	loadTimeline();
	optimizeTimelinePlayback();
	
	
	return removedElement;
}


function remove_subtrack(id=undefined,com=undefined,silent=false){
	let subtrack_id = id;
	if(id == undefined && selected_content != undefined){
		subtrack_id = parseInt(selected_content.getAttribute('content_id'));
	}
	
	if(subtrack_id == undefined){
		return false;
	};
	
	if(!silent){
		let confirms = confirm("Are you sure you want remove this content?");
		if(!confirms){
			return false;
		}
	}
	

	
	let removedElement = TimelineSequence.splice(subtrack_id, 1);
	loadTimeline();
	
	isOptimized = false;
		
	console.log(removedElement);
		
		
	if(com == undefined){
		push_undo("subtrack", "delete", 0, removedElement,subtrack_id);
	}
	
	return removedElement;
	
}


//Timeline Playback
//================


function playTL(from_player){
	TLplaying = true;
	
	if(from_player){
		return true;
	}
	
	if(tlvid.paused ){	
		try{
			tlvid.play();	
		}catch(e){
			//-
		}
	}
}

 
function pauseTL(from_player){
	TLplaying = false;
	
	if(from_player){
		return true;
	}
	
	if(tlvid.paused == false){
		try{
		tlvid.pause();
		}catch(e){
			//-
		}
	}
}


function stopTL(){
	TLplaying = false;
	timeline_time = 0;
	
	//clearAllBuffer();
	
	tlvid.currentTime = 0;
	tlvid.pause();
	
}

// =======================
// Nested Timeline Functions
// =======================

// Get Timeline Object Index based on given time, would return the most closet top match 
function getTimelineContentOnTime(time=0){
	let topMostIndex = -1;
	let closestIndex = -1;
	
	let lowestOffset = -1;
	
	for(let t=0;t<TimelineSequence.length;t++){
		let endAt = TimelineSequence[t].offset + TimelineSequence[t].length;
		let len = TimelineSequence[t].length;
		let startAt = TimelineSequence[t].offset;
		
		if(startAt <= time && time <= endAt){
			topMostIndex = t;
		}
		
		if(time <= endAt ){
			if(startAt <= lowestOffset || lowestOffset <= -1){
				lowestOffset = startAt;
				closestIndex = t;
			}
		}
		
		
		
	}
	
	if(topMostIndex < 0){
		return closestIndex;
	}
	
	return topMostIndex;
	
}



let currentPlayingTimeline = undefined;
let optimizedGrouping = []; //contains an array of grouped array of timeline contents, if any overlap is found for optimization
let isOptimized = false;



function railInTimeline(){
	let contentIndex = 0;

	if(isOptimized){
		playOptimized();
	}else{
		contentIndex = getTimelineContentOnTime(timeline_time);
		if(contentIndex < 0){
			return;
		}
		
		currentPlayingTimeline = TimelineData[
								findIndexByUUID(TimelineSequence[contentIndex].uid)
								];
		
		playNoOptimized(contentIndex);
	}
	
}

function playNoOptimized(contentId=undefined){
	let customTime = parseInt(timeline_time -  TimelineSequence[contentId].offset);
	
	try{
		play_on_current(customTime, currentPlayingTimeline.timeline);		
	}catch(e){
		//--
	}
	
}



let optimizedNest = undefined;
let maxOffseto = 0;
let minOffseto = -1;

function playOptimized() {
    // Check if optimizedNest is undefined
    if (optimizedNest === undefined) {
        const targetIndex = getTimelineContentOnTime(timeline_time);
        if (targetIndex < 0) {
            return;
        }
        optimizedNest = optimizedGrouping[targetIndex];
    }

    let currentContentId = 0;
    let customTime;

    // Recheck timeline bounds
    if (maxOffseto < timeline_time || minOffseto > timeline_time) {
        const targetIndex = getTimelineContentOnTime(timeline_time);
        if (targetIndex < 0) {
            return;
        }
        optimizedNest = optimizedGrouping[targetIndex];
    }

    // If optimizedNest is an array (object in JS terms)
    if (typeof optimizedNest === "object") {
        let maxOffset = 0;
        let minOffset = -1;

        for (let zf = 0; zf < optimizedNest.length; zf++) {
            const offsets = TimelineSequence[optimizedNest[zf]].offset;
            const seqLength = TimelineSequence[optimizedNest[zf]].length;

            // Calculate max and min offsets
            if (offsets + seqLength > maxOffset) {
                maxOffset = offsets + seqLength;
                maxOffseto = maxOffset;
            }

            if (minOffset === -1 || offsets < minOffset) {
                minOffset = offsets;
                minOffseto = minOffset;
            }

            // Check if the content is within the current timeline time
            const startAt = offsets;
            const endAt = offsets + seqLength;

            if (startAt <= timeline_time && timeline_time <= endAt) {
                currentContentId = optimizedNest[zf];
            }
        }

        // Set the currently playing timeline and custom time
        currentPlayingTimeline = TimelineData[findIndexByUUID(TimelineSequence[currentContentId].uid)];
        customTime = parseInt(timeline_time - TimelineSequence[currentContentId].offset);
        
    } else {
        // optimizedNest is a single value (not an array)
        const offsets = TimelineSequence[optimizedNest].offset;
        const seqLength = TimelineSequence[optimizedNest].length;

        let maxOffset = offsets + seqLength;
        let minOffset = offsets;

        maxOffseto = maxOffset;
        minOffseto = minOffset;

        // Set the currently playing timeline and custom time
        currentPlayingTimeline = TimelineData[findIndexByUUID(TimelineSequence[optimizedNest].uid)];
        customTime = parseInt(timeline_time - TimelineSequence[optimizedNest].offset);
    }

    // Play the current timeline with the calculated custom time
	try{
		play_on_current(customTime, currentPlayingTimeline.timeline);		
	}catch(e){
		//--
	}
}


function optimizeTimelinePlayback() {
    // Clear the existing optimizedGrouping
    optimizedGrouping.length = 0;
    
    // Find intersecting groups in the timeline sequence
    const grouped = findIntersectingGroups(TimelineSequence);
    
    // Loop through each group
    for (let zf = 0; zf < grouped.length; zf++) {
        if (typeof grouped[zf] === 'object') {
            // If the current group is an array, map each element to its respective group
            for (let zg = 0; zg < grouped[zf].length; zg++) {
                optimizedGrouping[grouped[zf][zg]] = grouped[zf];
            }
        } else {
            // Otherwise, assign the group directly to its index
            optimizedGrouping[grouped[zf]] = grouped[zf];
        }
    }

    // Set optimization flag to true and return it
    return isOptimized = true;
}



function parentTrack(id){
	
	var parent = document.getElementsByClassName('track_con')[id];
	return parent;
	
	
}



//Playhead Function
function play_head(time){
		time_ex = time * zoom_scale;
	
	if(time <= _("timeline_container").scrollWidth / zoom_scale){
		//pl.style.left = (time)+"px";
		//pl.style.transform =  "translateX("+time+"px)";		
		window.requestAnimationFrame(pl_trans);
	}
	
	function pl_trans(){
		pl.style.transform =  "translateX("+time_ex+"px)";
	}
		
	// setTimeDisplay(time, );
}


function jump_to_time(){
	
	let raw_time = gen_seconds_input(['jump_s','jump_m','jump_h']);
	var time_jump = (raw_time) * (5);
	var my_selected_track_ = document.getElementsByClassName("track_con")[0];
	
	if (get_size(my_selected_track_)[0] < time_jump){
		my_selected_track_.style.width = ((zoom_scale * time_jump) + 10 )+"px";
		gen_ruler();
	};
	
	//If following, play at this time
	if(follow_playhead){
		timeline_time = (raw_time * 33.334) + 10;
		play_head(time_jump + 10);
		setTimeDisplay(timeline_time, 'time_display_tl');
	}
	
	
	//scroll time to view
	_("timeline_container").scrollTo(((time_jump * zoom_scale) - (_("timeline_container").getBoundingClientRect().width * 0.5)),_("timeline_container").scrollTop);
	destroy_dia();
	
}





//Saving Functions


let stateForSaving = "";

//Sets and Also returns the stringified JSON of the current Nest.in Project
function saveCurrentTimelineProject(){
	let timelineCollections = [];
	let trackData = TimelineSequence.clone();

	for(l = 0;l < TimelineData.length; l++){
		let playitem = TimelineData[l].clone();
			playitem.timeline = {};
			timelineCollections.push(playitem);
	}
	
	
	//Project Save structure to use
	let DataForSaving = {
		'timelines': timelineCollections,
		'track_data': trackData,
	}
	
	return stateForSaving = encode(JSON.stringify(DataForSaving));
}


function save_to_file_nt(){
	try{	
		window.chrome.webview.hostObjects.NativeObject.put_data_nt(saveCurrentTimelineProject());	
	}catch(e){
		//-
	}
	command_save_nt();
	optimizeTimelinePlayback();
	
}

//for some reason, data and function call needs to be in separate call for the native side
function command_save_nt(){
		try{				
			window.chrome.webview.hostObjects.NativeObject.Save_File_NT();
		}catch(e){
		alert(e);				
	}
	
	
}





//Implements loading from file logic
let projectDataRawNT;

async function loadTimelineProject(){
	
	if(TimelineSequence.length > 0 && !PROGRESS_SAVED){
		let cf = confirm("Current Project Progress would be replaced by loaded data, (save any Progress before doing so or you might loose your current work) \nLoad Data Now?");
		if(!cf){
			return;
		}
	}

	
	let TimelineDataRaw = projectDataRawNT.timelines;
	TimelineData.length = 0;
	TimelineSequence = projectDataRawNT.track_data;
	
	let tl_len = TimelineDataRaw.length;
	loadFilemode = "timeline";
		
	for (let i = 0; i < tl_len; i++) {
		show_loading(tl_len, i + 1, "Loading Project Files...");
		let path = TimelineDataRaw[i].filePath;

		try {
			let fContents = await openFilePath(replaceBackslashes(path));
			load_from_file(fContents, path, TimelineDataRaw[i]);

			
			
			
			
			
		} catch (e) {
			console.log("Failed loading: " + path);
		}
	}
	
	
	//Regenerate All Empty
	
	for(let i = 0; i < TimelineData.length ;i++){
		show_loading(TimelineData.length, i+1, "Regenerating Data of Project Files...");
		TimelineData[i].max = regen_empty_data(TimelineData[i].timeline);
		
		await sleep(20);
	}
	finish_loading();
	
	reset_undo_redo();
	
	//Generate Views and UI
	generateTimelineListView();
	loadTimeline();
	optimizeTimelinePlayback();
	
}




//loads a nested saved file from the passed data param 
function load_from_file_nt(data){
	let nest_data = JSON.parse(replaceBackslashes(decode(data)));
	projectDataRawNT = nest_data;

	loadTimelineProject();
}




//Helper functions
//======================
function findIntersectingGroups(array) {
    let groups = [];
    let visited = new Set();

    for (let i = 0; i < array.length; i++) {
        if (visited.has(i)) continue; // Skip if already part of a group

        let group = [i];
        let obj1 = array[i];
        let obj1End = obj1.end_at || obj1.offset + obj1.length;

        for (let j = i + 1; j < array.length; j++) {
            let obj2 = array[j];
            let obj2End = obj2.end_at || obj2.offset + obj2.length;

            // Check for intersection with any item in the current group
            let intersects = group.some(index => {
                let groupObj = array[index];
                let groupObjEnd = groupObj.end_at || groupObj.offset + groupObj.length;
                return (
                    (groupObj.offset < obj2End && groupObjEnd > obj2.offset) || 
                    (obj2.offset < groupObjEnd && obj2End > groupObj.offset)
                );
            });

            if (intersects) {
                group.push(j);
                visited.add(j); // Mark as visited
            }
        }

        if (group.length > 1) {
            groups.push(group);
        } else {
            groups.push(group[0]);
        }

        visited.add(i); // Mark as visited
    }

    // Sort each group by their offset
    groups.forEach(group => {
        if (Array.isArray(group)) {
            group.sort((a, b) => array[a].offset - array[b].offset);
        }
    });

    // Sort the entire result by the offset of the first item in each group
    groups.sort((a, b) => {
        let offsetA = Array.isArray(a) ? array[a[0]].offset : array[a].offset;
        let offsetB = Array.isArray(b) ? array[b[0]].offset : array[b].offset;
        return offsetA - offsetB;
    });

    return groups;
}



// Delay Helper Function

function set_delay_timeline(val){
	
	let local = localStorage.getItem('play_delay_tl');
	
	if(val == undefined||val == null){
		_("delay_disp_tl").value = parseInt(local);
	
		let set = parseInt(local);
			if(set.toString() == "NaN"){
				set = 0;
			}
		time_delay = delay = (set*0.001)*33.333;		
		return;
	}else{
		localStorage.setItem('play_delay_tl',val);		
		if((val == "" || val == null) || val.length == 0){				
			localStorage.setItem('play_delay_tl',0);			
		}			
		let set = parseInt(localStorage.getItem('play_delay_tl'));		
		delay = (set*0.001)*33.333;		
		
	}

}

set_delay_timeline();

// ==============================
// Undo Redo Section =============
// ==============================

function TimelineUndo(){
	undo();
	showToast("Undid Previus Changes");
}


function TimelineRedo(){
	redo();
	showToast("Restored Undone Prev. Changes");

}



function remove_content(data, com){
	
	remove_subtrack(data,com,silent=true);
	// console.log(data);
}


function addToNestTimeline(data, com=undefined, type){
	let contentId;

	if(com == "undo"){
		contentId = data.track_data[0].uid;
		add_to_nesttimeline(contentId,"undo",data.track_data[0]);
	}else{
		contentId = data.track_data.uid;
		add_to_nesttimeline(contentId,"redo",data.track_data);
		
	}
	

	// console.log(contentId);
	
}

function modifySubtract(data, com, type){
	let subIndex = parseInt(data.subtrack_index);
	
	if(subIndex < 0){
		return;
	}
	let dataSub = data.track_data;
	TimelineSequence[subIndex] = decople_data(dataSub);
		// console.log(data, data.subtrack_index);
	loadTimeline();
	
}



