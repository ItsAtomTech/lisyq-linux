// =================================
// Aismover plugin v1.0.0
// by Atomtech 
// =================================

var timing = 30; //30 ms
var template_data = [];
var amb_length;
var amb_seconds = 1;

var click_on_stab = false;
var clicktimes = 1;
var coords = 0;
var mode;

var aismover_time_line = aismover.time_line;
var selected_stabs;
var idf;


let MAX_PAN = 540;//degress
let MAX_TILT = 270;//degress


//Preview
var is_preview = false;
var preview_play = false;

var static_play = setInterval(playon, 30);

//Utilities

try{
	if(_ == null){
	function _(ghf){
		return document.getElementById(ghf);
	}

	}
}catch(e){
		
function _(ghf){
		return document.getElementById(ghf);
	}	
		
}

function decople(dat){
	let dataTo;
	
	try{
		dataTo = structuredClone(dat);
	}catch(e){
		dataTo = JSON.parse(JSON.stringify(dat));

	}
	
	return dataTo; 
}


function change_secs_sacle(s){
	
	amb_seconds = parseFloat(s);
	
	if(amb_seconds > 60){
		z = 60;	
	}else if(amb_seconds < 0){
		amb_seconds = 0;		
	}
	
	refresh_timeline();
	
}

function test(){
	sendTo("test_","Datas");
}

function handh(){

sendTo("handshake",true);

}

var hand = handh();

function sendTo(fn,data){
	window.parent.postMessage({
    'func': fn,
    'message': data
}, "*");

}

if (window.addEventListener) {
    window.addEventListener("message", onMessage, false);        
} 
else if (window.attachEvent) {
    window.attachEvent("onmessage", onMessage, false);
}

function onMessage(event) {
    // Check sender origin to be trusted
    //if (event.origin !== "http://example.com") return;

    var data = event.data;

    if (typeof(window[data.func]) == "function") {
        window[data.func].call(null, data.message);
    }
}

function click_on_time_con(t){
	
	if(event.target.classList[0] != "keyframe_con"){
			return;
	}
		
	
	coords = (event.offsetX);
	start_at_prev(coords);
	
}

_("keyframe_container").addEventListener("contextmenu", context_menu);

//context menu
let context_view = _("ct_menu");
function context_menu(e){
	e.preventDefault();
	clicktimes = 1;
	
	let context_menu_width = context_view.getBoundingClientRect().width;
	
	let coords_x = (event.clientX);
	let coords_y = (event.clientY);
	let visible_view_x = window.innerWidth;
	
	let context_x = coords_x;
	let context_y = coords_y;
	
	if(coords_x + context_menu_width > visible_view_x){
		
		context_x = visible_view_x - context_menu_width;
		
	}else if(coords_x < context_menu_width){
		
		context_x = 0;
		
	};
	
	context_view.style.top = context_y + "px";
	context_view.style.left = context_x + "px";
	context_view.style.pointerEvents = "all";
	context_view.style.visibility = "visible";
		
	window.addEventListener("mousedown",window_click);
	
}

function hide_context(){
	
	context_view.style.visibility = "hidden";
	context_view.style.pointerEvents = "none";
	
}

function window_click(){
	
	let source = event.srcElement;
	
	//Hiding Context menu
	
	if(source.classList[0] != "context_menu" && source.classList[0] != "context_items"){
		
		hide_context();
		
	}

	
	//Others
	
}

//context menu end

function click_on_time_bar(t){
	if(click_on_stab == true){		
		click_on_stab = false;		
				
		return;
	}

 coords = (event.offsetX);
	start_at_prev(coords);
	

	
	if(clicktimes >= 2){				
		console.log("double click");
		
		show_keyframe_man("timeline");
		

		
	}
	clicktimes++;	
	setTimeout(reset_clicks, 440);
	// console.log(event);
	
}

function reset_clicks(){	
	clicktimes = 1;	
}

function add_time_stab(crds,width,id){
	
	if(crds == undefined){
		crds = 0;
		
	}
	
	var line_key_time = _("line_key_time");
	
	var key_stab = document.createElement("div");
		key_stab.classList.add("keyframe_stab");
		key_stab.setAttribute("onmousedown","click_on_stabs(this)");
		key_stab.style.left = crds+"px";
		key_stab.style.width = width+"px";
		key_stab.setAttribute("key_id",id);
		key_stab.setAttribute("tabindex",0);
		
		//Generate keyframe handles here
		
		key_stab.appendChild(makeKeyHandle(0));
		key_stab.appendChild(makeKeyHandle(1));
		
		
		line_key_time.appendChild(key_stab);
		
		function makeKeyHandle(num = 0){
			let handle = document.createElement("span");
				handle.classList.add("key_handle");
				handle.classList.add("num_"+num);
				handle.setAttribute("key",num);
				handle.setAttribute("onmousemove","adjustKeyByMove(this)");
				handle.setAttribute("onmousedown","initKeyByMove(this)");
				handle.setAttribute("onmouseup","deboundKeyByMove(this)");
				handle.setAttribute("onmouseleave","deboundKeyByMove(this)");
				
			return handle;
		}
		
	
}


let isDraggingKey = false;
let activeElm = null;

function adjustKeyByMove(elm) {
	
	
	if (!isDraggingKey || !activeElm) return;
	
  const parent = elm.parentElement;
  const rect = parent.getBoundingClientRect();
  const key = elm.getAttribute("key");

  if (key === "0") {
    const mouseX = event.clientX - rect.left;
    const newLeft = mouseX - 5;
    elm.style.left = `${newLeft}px`;
    elm.style.right = ''; // Clear right if previously set
  } else {
    const mouseX = event.clientX - rect.left;
    const newRight = (parent.offsetWidth - mouseX) - 5;
    elm.style.right = `${newRight}px`;
    elm.style.left = ''; // Clear left if previously set
  }
}


function initKeyByMove(elm) {
  isDraggingKey = true;
  activeElm = elm;
}


function deboundKeyByMove(elm){
	
	activeElm = null;
	
	if(!isDraggingKey){
		return;
	}
	
	let stabCoord = (event.clientX - _("line_key_time").getBoundingClientRect().left);
	
	let skey = elm.getAttribute("key");
	
	if(skey == 0){
		selected_stabs.start_at = gen_time(stabCoord);
	}else{
		selected_stabs.end_at = gen_time(stabCoord);
	}
	
	isDraggingKey = false;
	
	refresh_timeline();
}



function click_on_stabs(t){	
	click_on_stab = true;	

	idf = t.getAttribute("key_id");
	
	selected_stabs = aismover_time_line[idf];
	
	if(event.target.classList.contains("key_handle")){
		return;
	};
	
	show_keyframe_man("stabs");
	
}

function gen_coords(z){
	
	if(z > amb_seconds){
		z = amb_seconds;	
	}else if(z < 0){
		z = 0;		
	}
	
	var x = _("line_key_time").getBoundingClientRect().width;
	var y = amb_seconds;
	
	return (x / y ) * z;
	
}

function cap(z){
	
	if(z > amb_seconds){
		z = amb_seconds;	
	}else if(z < 0){
		z = 0;		
	}
	return z;
	
}

function save_key(){
	positionKeyData.position_set = decople(positionsSets);	
	
	if(mode == "add"){
		
		var start = gen_coords(_("s_start").value);
		var end = gen_coords(_("s_end").value);
		
		var width = end - start;
			positionKeyData.enabled = _("movement_enabled").checked;
		
		var key_frame = {
			"start_at": cap(_("s_start").value),
			"end_at": cap(_("s_end").value),
			"color_start": (_("c_start").value).replace(/#/gi, ""),
			"color_end": (_("c_end").value).replace(/#/gi, ""),
			"bypass_global_effect": _("effect_bypass").checked,
			"keyframe_aismover_effect": _("keyframe_effect_selector").value,
			"keyframe_aismover_effect_len": _("keyframe_seconds_len_effect").value * 33	,
			"position_data": decople(positionKeyData),
		}
		
		add_time_stab(start,width,aismover_time_line.length);
		
		
		aismover_time_line.push(key_frame);	
		
	}else if(mode == "edit"){
			positionKeyData.enabled = _("movement_enabled").checked;
			
		var key_frame = {
			
			"start_at": cap(_("s_start").value),
			"end_at": cap(_("s_end").value),
			"color_start": (_("c_start").value).replace(/#/gi, ""),
			"color_end": (_("c_end").value).replace(/#/gi, ""),
			"bypass_global_effect": _("effect_bypass").checked,
			"keyframe_aismover_effect": _("keyframe_effect_selector").value,
			"keyframe_aismover_effect_len": _("keyframe_seconds_len_effect").value * 33,
			"position_data": decople(positionKeyData),
			
		}
		
		positionKeyData.enabled = _("movement_enabled").checked;
		aismover_time_line[idf] = key_frame;
		
		refresh_timeline();
	}
	
	is_preview = true;
	generate_template();
	
	save_prev_colors([_("c_start").value , _("c_end").value])
	
	aismover.time_line = aismover_time_line;
	
	
	close_key_man();
	positionsSets.length;
}

function remove_key(){
	
	aismover_time_line.splice(idf,1);
	refresh_timeline();
	close_key_man();
	
}

function refresh_timeline(){
	
	var line_key_time = _("line_key_time");
		line_key_time.innerHTML = "";
		
		for(al = 0;al < aismover_time_line.length;al++){
			
			var start = gen_coords(aismover_time_line[al].start_at);
			var end = gen_coords(aismover_time_line[al].end_at);
			var width = end - start;
		
			add_time_stab(start,width,al);			
					
		}
		
		preview_head(at_point);
		
	
}

function show_keyframe_man(fr){
	
	_("key_man").style.display = "initial";
	
	var x = _("line_key_time").getBoundingClientRect().width;
	var s = amb_seconds;
	var c = coords;
	
	if(fr == "timeline"){
		
		_("s_start").value = ((c / x) * s).toFixed(2);
		_("s_end").value = gen_end_val(_("duration_").value);	
		_("s_start").setAttribute("max",s);
		_("s_end").setAttribute("max",s);	
		_("s_end").setAttribute("min",((c / x) * s).toFixed(2));
		_("duration_").setAttribute("max",s);
		
		_("keyframe_effect_selector").value = "none";
		_("keyframe_seconds_len_effect").value = 0.1;
		_("effect_bypass").checked = false;
		
		mode = "add";
		
		_("r_button").style.display = "none";
		_("copy_frame").style.display = "none";
		
		
		// Position Pad
		
		
		setPosition(50,50);
		setPositionPoint(0);
		setPositionPoint(1);
		
	}else if(fr == "stabs"){
		
		_("s_start").value = selected_stabs.start_at;
		_("s_end").value = selected_stabs.end_at;	
		_("s_start").setAttribute("max",s);
		_("s_end").setAttribute("max",s);	
		_("s_end").setAttribute("min",(selected_stabs.start_at));
		
		_("c_start").value = "#"+selected_stabs.color_start;
		_("c_end").value = "#"+selected_stabs.color_end;
		
		_("r_button").style.display = "flex";
		_("copy_frame").style.display = "flex";
		
				
		_("keyframe_effect_selector").value = selected_stabs.keyframe_aismover_effect;
		_("keyframe_seconds_len_effect").value = selected_stabs.keyframe_aismover_effect_len / 33;
		_("effect_bypass").checked = selected_stabs.bypass_global_effect;
		
		mode = "edit";
		
		//Position pad load to view
		loadPosFromData();
		
		
		
		
	}else{
		
		_("s_start").value = 0;
		_("s_end").value = gen_end_val(_("duration_").value);	
		_("s_start").setAttribute("max",s);
		_("s_end").setAttribute("max",s);	
			
		_("s_end").setAttribute("min",((c / x) * s).toFixed(2));
		
	}
	
}

function close_key_man(){
	_("key_man").style.display = "none";
	color_options('hide');
	pos_options('hide');
	
	hasPosChanges = false;
	prevSelectedPosIndex = 0;
	_("movement_enabled").checked = true;
	
	
}

// var colors_array = [];
// var pixel_length;	

function generate_template(){
	// console.clear();
	
	aismover.fade_amount = 1;
	aismover.fade_counter = 1;
	aismover.keyframe_fade_counter = 1;
	aismover.keyframe_fade_amount = 1;
	aismover.beating_effect.reset_clk();
	
	aismover.pixel_length = amb_seconds * 33;
	
	aismover.colors_array.length = 0;
	
	aismover.calculate_data();

	
	var tm_data = {
						
		"length":aismover.colors_array.length,
		"type":"aismover",
		"content": aismover.colors_array,
		"name": _("template_name").value,
		"color": _("panel_color").value,
		"misc": {
			"raw_data_points": JSON.stringify(aismover_time_line),
			"seconds_length": amb_seconds,
			"effect": _("effect_selector").value,
			"effect_len": aismover.effect_len
			
		}
				
	}
	
	template_data = tm_data;
	
	// console.log(colors_array);
	
	if(is_preview){
		
		is_preview = false;
		return false;
		
	}
	
	sendTo("template_data",template_data);
	sendTo("stop_media_prev");
	sendTo('close_plugin','');
	
}

var at_point = 0;

function play_template(){
	is_preview = true;
	generate_template();
	
	preview_play = true;
	
	sendTo("media_prev",at_point);
	
}

function stop_template(){
	is_preview = false;
	preview_play = false;	
	preview_head(0);
	at_point = 0;
	sendTo("stop_media_prev");
	
}

function pause_template(){
	is_preview = true;
	preview_play = false;	
	sendTo("stop_media_prev");
}

function preview_head(coords){
	
	_("preview_head").style.transform = "translateX("+ parseFloat(gen_coords(at_point/33.33)+2)+"px)";
	
}

function start_at_prev(coords){
	
	var x = _("line_key_time").getBoundingClientRect().width;
	var s = amb_seconds;
	var c = coords;
	
		_("preview_head").style.transform = "translateX("+ parseFloat(coords +2)+"px)";

		at_point = (parseInt(((c / x) * s).toFixed(2)*33.33)+2);
	
	if(preview_play){
		sendTo("media_prev",at_point);
	}
	
}

function playon(){
	
	if(preview_play){
		
		try{
			let playData = aismover.colors_array[at_point] ? aismover.colors_array[at_point].split(":"): false;
		
			if(aismover.colors_array[at_point]){
				updateLightColor("#"+playData[0]);
				
				let convertedPan =  parseInt(playData[1],16) / 255 * MAX_PAN;
				updatePan3D(convertedPan);		
				
				let convertedTilt =  parseInt(playData[2],16) / 255 * MAX_TILT;
				updateTilt3D(convertedTilt);
				
			}	
		}catch(e){
			//---
		}
		

		
		
		preview_head(at_point);
		
		at_point++;
	}
	
	if(at_point > aismover.colors_array.length){
		preview_play = false;
		at_point = 0;
		sendTo("stop_media_prev");
		
	}
	
}

//Extras

function show_time(){
		
		var x = _("line_key_time").getBoundingClientRect().width;
		var s = amb_seconds;
		var c = event.offsetX;
		
		if(!event.target.classList.contains("line_key_time")){
			return;
		}
		let calculated = ((c / x) * s).toFixed(2);
		
		_("keyframe_details").innerHTML = "Position: " + calculated + "s";
	return ;
	}



function gen_time(coords){
		
		var x = _("line_key_time").getBoundingClientRect().width;
		var s = amb_seconds;
		var c = coords;
		
	 return ((c / x) * s).toFixed(2);
		
	}

function empty_display(){
	
	_("keyframe_details").innerHTML = "---";
	
}

function set_end_at(vd){
	
	_("s_end").value = parseFloat(_("s_start").value) +  parseFloat(vd);
	
}

function gen_end_val(rd){
	
	if(parseFloat(rd) > 0){
		
		return parseFloat(rd);
		
	}else{
		return amb_seconds;
	}

}

//Pasting keyframe

function paste_key(){
	
	if(key_to_copy == null || key_to_copy == undefined){
		return;
	}
	
	let width = key_to_copy.end_at -  key_to_copy.start_at;
	
	key_to_copy.start_at = parseFloat(gen_time(coords));
	key_to_copy.end_at = cap(parseFloat(gen_time(coords)) + parseFloat(width));
	

	
	let to_paste_ = JSON.parse(JSON.stringify(key_to_copy));
	
	aismover_time_line.push(to_paste_);
	
	hide_context();
	refresh_timeline();
	
}

//Copying

let key_to_copy;

function copy_frame(){
	
	key_to_copy = JSON.parse(JSON.stringify(selected_stabs));
	
}

//Prev Color picks sections
var selected_input;
var history_list;
var max_history_items = 20;

let rddrx = setTimeout(hide_prev_color, 50);

function prev_colors(mode,elm){
	
	if(mode == "show"){
		selected_input = elm;
		
		load_prev_colors();
		clearTimeout(rddrx);
		
		_("color_drawer").style.display = "flex";
		
	}else{
		clearTimeout(rddrx);
		rddrx = setTimeout(hide_prev_color, 90);
		
	}
	
	return elm;
}

function hide_prev_color(){
	
	_("color_drawer").style.display = "none";
}

function load_prev_colors(){

	try{
		var color_history = localStorage.getItem("amb_color_history").split(",");	
	}catch(e){
		//	
		return;
	}
	
	_("color_drawer").innerHTML = "";
	try{
		_("color_drawer").replaceChildren();
	}catch(e){
		//
	}
	
	for(colors in color_history){
		
		var color_div = document.createElement("div");
			color_div.classList.add('color_dip_');
			color_div.style.backgroundColor = color_history[colors];
			color_div.title = color_history[colors];
			color_div.setAttribute("onclick",'color_dip("'+color_history[colors]+'")')
			_("color_drawer").appendChild(color_div);
			
		
	}
	
}

function color_dip(color){
	selected_input.value = color;
}

function save_prev_colors(arrs){
	//localStorage.setItem("amb_color_history");
	if(typeof(arrs) != 'object'){
		return console.warn("Type error: ","Param must be array, provided: "+ typeof(arrs));
	}
	
	for(color in arrs){
		
		add_history(arrs[color]);
		
	}

	
}

function init_history(){
	var history = localStorage.getItem('amb_color_history');
	
	if(history == null || history == undefined){
		localStorage.setItem('amb_color_history','');
		history_list = localStorage.getItem('amb_color_history').split(',');
	}else{
		history_list = localStorage.getItem('amb_color_history').split(',');
	}
	
	//console.log(amb_color_history);
	
}

function add_history(obj){
	//Add history item, and removes the first item if more than max items
	try{
		if(arguments.callee.caller.name != "save_prev_colors"){
			return false;
		}
	}catch(e){
		return false;	
	}
	
	if(history_list.indexOf(obj) >= 0){
		return {"type":"message", "message": "found duplicate!, not added to history."};
	};
	
	if(history_list.length < max_history_items){	
		if(history_list[0] == ''){
			
			history_list[0] = obj;
			
		}else{
			history_list.push(obj);
		}
	
		
	}else{
		
		//if the entry at the end of the history is same as current, ignore.
		if(history_list[history_list.length - 1] == obj){		
			return;		
		}
		
		history_list.push(obj);
		history_list.shift();		
	}
	localStorage.setItem('amb_color_history',history_list);
	
}

init_history();

//Color history end

//Color Options Start

function color_options(m){
	
	if(m == "show"){
		_("color_options").style.display = "flex";
	}else{
		_("color_options").style.display = "none";
	}
	
}

function color_command(c){
		let a_b_color = [_("c_start").value , _("c_end").value];

		
		switch(c){
			
			case "a":
				_("c_end").value = a_b_color[0];
			break;	
			
			case "b":
				_("c_start").value = a_b_color[1];
			break;
						
			case "swap":
				_("c_start").value = a_b_color[1];
				_("c_end").value = a_b_color[0];
			break;
			
		}
		
	

	color_options('hide');
}


function pos_command(c){
	let posData = positionKeyData.position_set;
		switch(c){		
			case "a":
				posData[1] = posData[0];
			break;	
			
			case "b":
				posData[0] = posData[1];
			break;
						
			case "swap":
				posData.reverse();
			break;		
		}	
	setPositionPoint(selectedPositionPoint);
	pos_options("hide");
}

//pos options

function pos_options(m){
	
	if(m == "show"){
		_("pos_options").style.display = "flex";
	}else{
		_("pos_options").style.display = "none";
	}
	
} 



//Extras End

	
 function toHex(str) {
 
	var arr1 = [];
	for (var n = 0, l = str.length; n < l; n ++) 
     {
		var hex = Number(str.charCodeAt(n)).toString(16);
		arr1.push(hex);
	 }
	return arr1.join('');
   }

function change_effect_len(g){
	
	aismover.effect_len =  parseFloat(g) * 33;
	
}

//Recieve for edit

function load_from_host(df){
	
	amb_seconds = df.misc.seconds_length;
	aismover.time_line = JSON.parse(df.misc.raw_data_points);
	aismover_time_line = JSON.parse(df.misc.raw_data_points);
	
	_("seconds_len").value = amb_seconds;
	_("template_name").value = df.name;
	_("panel_color").value = df.color;
	aismover.activate_effect(df.misc.effect);
	_("seconds_len_effect").value = df.misc.effect_len / 33;
	change_effect_len(df.misc.effect_len/33);
	
	setTimeout(refresh_timeline, 130);
	
}

// ==========================
// Position Pad and Related 
// ==========================
let pad = _("position_pad");
let crosshair = _("pos_crosshair");

let isDragging = false;

let crosshairPercent = { x: 0, y: 0 }; // 💚 Percentage position

let positionsSets = [];
let selectedPositionPoint = 0;
let positionMode = "raw"
let positionEnabled = true;


let positionKeyData = {"mode":positionMode, "position_set": positionsSets, "effect": "",enabled:positionEnabled,}

let hasPosChanges = false;

function updateCrosshairFromCoords(x, y) {
    let rect = pad.getBoundingClientRect();
    let relX = x - rect.left;
    let relY = y - rect.top;

    // Clamp within bounds
    relX = Math.max(0, Math.min(relX, rect.width));
    relY = Math.max(0, Math.min(relY, rect.height));

    let crosshairWidth = crosshair.offsetWidth;
    let crosshairHeight = crosshair.offsetHeight;

    let drawX = relX - crosshairWidth / 2;
    let drawY = relY - crosshairHeight / 2;

    // Clamp drawing position so crosshair stays fully inside
    drawX = Math.max(0, Math.min(drawX, rect.width - crosshairWidth));
    drawY = Math.max(0, Math.min(drawY, rect.height - crosshairHeight));

    crosshair.style.position = "absolute";
    crosshair.style.left = (drawX - 2)+"px";
    crosshair.style.top =  (drawY - 2) +"px";

    crosshairPercent.x = (relX / rect.width) * 100;
    crosshairPercent.y = (relY / rect.height) * 100;
	
	setDisptext(crosshairPercent.x, crosshairPercent.y);
	hasPosChanges = true;
    // console.log(`% X: ${crosshairPercent.x.toFixed(2)}, % Y: ${crosshairPercent.y.toFixed(2)}`);
}


pad.addEventListener("mousedown", function (event) {
    isDragging = true;
    updateCrosshairFromCoords(event.clientX, event.clientY);
	
});

pad.addEventListener("mousemove", function (event) {
    if (isDragging) {
        updateCrosshairFromCoords(event.clientX, event.clientY);
    }
});

document.addEventListener("mouseup", function () {
    isDragging = false;
});

// Touch support
pad.addEventListener("touchstart", function (event) {
    isDragging = true;
    let touch = event.touches[0];
    updateCrosshairFromCoords(touch.clientX, touch.clientY);
});

pad.addEventListener("touchmove", function (event) {
    if (isDragging) {
        let touch = event.touches[0];
        updateCrosshairFromCoords(touch.clientX, touch.clientY);
    }
});

document.addEventListener("touchend", function () {
    isDragging = false;
});




function setCrosshairByPercent(xPercent, yPercent) {
    let rect = pad.getBoundingClientRect();

    // Clamp percentages between 0–100
    xPercent = Math.max(0, Math.min(xPercent, 100));
    yPercent = Math.max(0, Math.min(yPercent, 100));

    let x = (xPercent / 100) * rect.width;
    let y = (yPercent / 100) * rect.height;

    let crosshairWidth = crosshair.offsetWidth;
    let crosshairHeight = crosshair.offsetHeight;

    let drawX = x - crosshairWidth / 2;
    let drawY = y - crosshairHeight / 2;

    drawX = Math.max(0, Math.min(drawX, rect.width - crosshairWidth));
    drawY = Math.max(0, Math.min(drawY, rect.height - crosshairHeight));

    crosshair.style.position = "absolute";
    crosshair.style.left = `${drawX}px`;
    crosshair.style.top = `${drawY}px`;

    crosshairPercent.x = xPercent;
    crosshairPercent.y = yPercent;

	setDisptext(crosshairPercent.x, crosshairPercent.y);

    // console.log(`Moved crosshair to % X: ${xPercent.toFixed(2)}, % Y: ${yPercent.toFixed(2)}`);
}


function setPosition(xprct, yprct){
	setCrosshairByPercent(xprct, yprct);
}


function setDisptext(perx, pery){
	let pan_value = parseInt(perx * MAX_PAN / 100);
	_("pan_slider").max = MAX_PAN;
	_("pan_disp").innerText = pan_value;
	_("pan_slider").value = pan_value;
	
	let tilt_value = parseInt(pery * MAX_TILT / 100);
	_("tilt_slider").max = MAX_TILT;
	_("tilt_disp").innerText = tilt_value;
	_("tilt_slider").value = tilt_value;
}


function updateFromRange(){
	
	let panValue = parseInt(_("pan_slider").value);
	let tiltValue = parseInt(_("tilt_slider").value);
	let perPan = (panValue / MAX_PAN) * 100;
	let perTilt = (tiltValue / MAX_TILT) * 100;
	
	setPosition(perPan, perTilt);
	hasPosChanges = true;
	
}



let prevSelectedPosIndex = 0;
function setPositionPoint(index){
	selectedPositionPoint = index;
	let targetButton = event.target;
	
	for(each of document.getElementsByClassName("pos_buttons")){
		each.classList.remove("active");
	}
	
	if(positionsSets[index] && hasPosChanges == false){
		setPosition(positionsSets[index].pan, positionsSets[index].tilt);
	}
	
	if(index == prevSelectedPosIndex){
		positionsSets[index] = decople({"pan":crosshairPercent.x, "tilt": crosshairPercent.y});
		
		if(targetButton.classList.contains("pos_buttons")){
			targetButton.classList.add("active");
		}
			
	}

	prevSelectedPosIndex = index;
	hasPosChanges = false;
}



function loadPosFromData(index=0){
		positionKeyData = decople(selected_stabs.position_data);
		positionsSets = positionKeyData.position_set;
	let positions = positionKeyData.position_set[index];
	
		//console.log(positionKeyData);
	try{
		setPosition(positions.pan, positions.tilt);
	}catch(e){
		setPosition(50, 50); //Put to center if no position data is present
	}
	
	
	if(positionKeyData.effect || positionKeyData.effect.length > 0){
		_("effect_selection").value = positionKeyData.effect;
		_("effect_speed").value = positionKeyData.speed;
		_("effect_size").value = positionKeyData.size;		
		_("effect_speed_disp").innerText = positionKeyData.speed;
		_("effect_size_disp").innerText = positionKeyData.size;
		_("movement_enabled").checked = positionKeyData.enabled;
	}else{
		_("effect_selection").value = "";
		_("effect_speed").value = 0;
		_("effect_size").value = 0;		
		
		_("effect_speed_disp").innerText = 0;
		_("effect_size_disp").innerText = 0;
		_("movement_enabled").checked = positionKeyData.enabled;
	}
	
	
}


function effectChange(elm){
	let valueofEff = elm.value;
	positionKeyData.effect = valueofEff;
}

const listOfParams = ["size", "speed"];
function updateEffectParams(elm, disp){
	let svalue = parseInt(elm.value);
	try{
		_(disp).innerText = svalue;
	}catch(e){
		//--
	}
	let partype = (elm.getAttribute("partype"));
	if(listOfParams.includes(partype)){
		positionKeyData[partype] = svalue;
	}
}


function modeChange(){
	console.log("Mode Change Triggered");
	return;
}

function resetToCenter(){
	setPosition(50, 50);
	hasPosChanges = true;
}


// Shorcuts

	
	
//=================
// 3D Display Prev
//=================


function updateLightColor(hexColor) {
  const styleEl = document.getElementById("color_display_data");
  if (!styleEl) return;

  // Replace the
  styleEl.innerHTML = styleEl.innerHTML.replace(
    /--color_light:\s*#[0-9a-fA-F]{3,6}/,
    `--color_light: ${hexColor}`
  );
}	
	

function updatePan3D(deg) {
  const el = document.getElementById("pan_3d");
  
  deg = deg - 270;
  
  const updateTransform = (transform) => {
    return transform
      .split(" ")
      .filter(part => !part.startsWith("rotateY"))
      .join(" ") + ` rotateY(${deg}deg)`;
  };

  const currentTransform = el.style.transform || "";
  const currentWebkitTransform = el.style.webkitTransform || "";

  el.style.transform = updateTransform(currentTransform);
  el.style.webkitTransform = updateTransform(currentWebkitTransform);
}


function updateTilt3D(deg) {
  const el = document.getElementById("tilt_3d");

  deg = 135  - deg;

  const updateTransform = (transform) => {
    return transform
      .split(" ")
      .filter(part => !part.startsWith("rotateX"))
      .join(" ") + ` rotateX(${deg}deg)`;
  };

  const currentTransform = el.style.transform || "";
  const currentWebkitTransform = el.style.webkitTransform || "";

  el.style.transform = updateTransform(currentTransform);
  el.style.webkitTransform = updateTransform(currentWebkitTransform);
}





	
setPosition(50, 50); //Default pos


//Dummmy test

let intervals = 0;


let dummySize = 20;
let dummySpeed = 0.25;


//oval Pattern
function testPatternsOval() {
    // console.log(intervals);
    intervals++;
    if (intervals >= 50) intervals = 0;

    let ovalWidth = 30;   // Horizontal stretch
    let ovalHeight = 15;  // Vertical stretch
    let speed = dummySpeed; // Keep your speed value

    let pans = (Math.cos(intervals * speed) * ovalWidth) + 50;
    let tilt = (Math.sin(intervals * speed) * ovalHeight) + 50;

    setPosition(pans, tilt); // Muku moves it gracefully 💫
}


function testPatternsDiamond() {
    // console.log(intervals);
    
    // Increment using dummySpeed
    intervals += dummySpeed;
    if (intervals >= 100) intervals = 0;

    const centerX = 50;
    const centerY = 50;
    const halfSize = dummySize;
    const phase = intervals % 100;

    // Determine the raw point on the square path (before rotation)
    let rawX, rawY;

    if (phase < 25) {
        // Right
        rawX = -halfSize + (phase / 25) * (halfSize * 2);
        rawY = -halfSize;
    } else if (phase < 50) {
        // Down
        rawX = halfSize;
        rawY = -halfSize + ((phase - 25) / 25) * (halfSize * 2);
    } else if (phase < 75) {
        // Left
        rawX = halfSize - ((phase - 50) / 25) * (halfSize * 2);
        rawY = halfSize;
    } else {
        // Up
        rawX = -halfSize;
        rawY = halfSize - ((phase - 75) / 25) * (halfSize * 2);
    }

    // Apply rotation (angle also depends on intervals and speed)
    let angle = (intervals / 100) * 5 * Math.PI; // 0 to 2π rotation
    let rotatedX = rawX * Math.cos(angle) - rawY * Math.sin(angle);
    let rotatedY = rawX * Math.sin(angle) + rawY * Math.cos(angle);

    // Shift back to center
    let pans = centerX + rotatedX;
    let tilt = centerY + rotatedY;

    setPosition(pans, tilt); // A square that twirls through space~ 🌌
}

function starPattern() {
    // console.log(intervals);

    intervals++;
    if (intervals >= 33) intervals = 0;

    const centerX = 50;
    const centerY = 50;
    const radius = dummySize;
    const points = 5;

    // Star vertex index path (for 5-pointed star)
    const path = [0, 2, 4, 1, 3, 0];
    const totalSegments = path.length - 1;
    
    const phase = ((intervals * dummySpeed) / 100) * totalSegments;
    const currentSegment = Math.floor(phase);
    const t = phase - currentSegment; // Interpolation factor

    // Get start and end points of current star segment
    const i1 = path[currentSegment];
    const i2 = path[currentSegment + 1];

    const angle1 = (2 * Math.PI / points) * i1 - Math.PI / 2;
    const angle2 = (2 * Math.PI / points) * i2 - Math.PI / 2;

    const x1 = centerX + radius * Math.cos(angle1);
    const y1 = centerY + radius * Math.sin(angle1);
    const x2 = centerX + radius * Math.cos(angle2);
    const y2 = centerY + radius * Math.sin(angle2);

    // Interpolate between the two points
    const pans = x1 + (x2 - x1) * t;
    const tilt = y1 + (y2 - y1) * t;

    setPosition(pans, tilt); 
}


// function startTest(){
	// window.setInterval(testPatterns(), 33);
// }


