// =================================
// Ambient light controller plugin v1.0.2
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

var ambient_time_line = [];
var selected_stabs;
var idf;


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
		
		
		line_key_time.appendChild(key_stab);
	
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
	
	
	selected_stabs = ambient_time_line[idf];
	
		
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
	
	if(mode == "add"){
		
		var start = gen_coords(_("s_start").value);
		var end = gen_coords(_("s_end").value);
		
		var width = end - start;
		
		
		var key_frame = {
			
			"start_at": cap(_("s_start").value),
			"end_at": cap(_("s_end").value),
			"color_start": (_("c_start").value).replace(/#/gi, ""),
			"color_end": (_("c_end").value).replace(/#/gi, ""),
			"bypass_global_effect": _("effect_bypass").checked,
			"keyframe_ambient_effect": _("keyframe_effect_selector").value,
			"keyframe_ambient_effect_len": _("keyframe_seconds_len_effect").value * 33	
			
			
		}
		
		add_time_stab(start,width,ambient_time_line.length);
		
		ambient_time_line.push(key_frame);	
		
	}else if(mode == "edit"){
				
		var key_frame = {
			
			"start_at": cap(_("s_start").value),
			"end_at": cap(_("s_end").value),
			"color_start": (_("c_start").value).replace(/#/gi, ""),
			"color_end": (_("c_end").value).replace(/#/gi, ""),
			"bypass_global_effect": _("effect_bypass").checked,
			"keyframe_ambient_effect": _("keyframe_effect_selector").value,
			"keyframe_ambient_effect_len": _("keyframe_seconds_len_effect").value * 33
			
			
			
		}
		
		ambient_time_line[idf] = key_frame;
		
		
		refresh_timeline();
	}
	
	is_preview = true;
	generate_template();
	
	save_prev_colors([_("c_start").value , _("c_end").value])
	
	close_key_man();
	
}

function remove_key(){
	
	ambient_time_line.splice(idf,1);
	refresh_timeline();
	close_key_man();
	
}


function refresh_timeline(){
	
	var line_key_time = _("line_key_time");
		line_key_time.innerHTML = "";
		
		
		for(al = 0;al < ambient_time_line.length;al++){
			
			var start = gen_coords(ambient_time_line[al].start_at);
			var end = gen_coords(ambient_time_line[al].end_at);
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
		
				
		_("keyframe_effect_selector").value = selected_stabs.keyframe_ambient_effect;
		_("keyframe_seconds_len_effect").value = selected_stabs.keyframe_ambient_effect_len / 33;
		_("effect_bypass").checked = selected_stabs.bypass_global_effect;
		
		mode = "edit";
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
	
}

// var colors_array = [];
// var pixel_length;	

function generate_template(){
	// console.clear();
	
	ambient_fade_amount = 1;
	ambient_fade_counter = 1;
	keyframe_ambient_fade_counter = 1;
	keyframe_ambient_fade_amount = 1;
	beating_ambient_effect.reset_clk();
	
	
	
	ambient_pixel_length = amb_seconds * 33;
	
	colors_array.length = 0;
	
	
	ambient_calculate_data();

	
	
	var tm_data = {
						
		"length":colors_array.length,
		"type":"ambient",
		"content": colors_array,
		"name": _("template_name").value,
		"color": _("panel_color").value,
		"misc": {
			"raw_data_points": JSON.stringify(ambient_time_line),
			"seconds_length": amb_seconds,
			"effect": _("effect_selector").value,
			"effect_len": ambient_effect_len
			
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
		
		
		
		_("preview").style.backgroundColor = "#"+colors_array[at_point];
		
		
		
		preview_head(at_point);
		
		at_point++;
	}
	
	if(at_point > colors_array.length){
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
		
		if(event.target.classList[0] != "line_key_time"){
			return;
		}
		
		
		_("keyframe_details").innerHTML = "Position: " + ((c / x) * s).toFixed(2) + "s";
		
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
	
	ambient_time_line.push(to_paste_);
	
	
	
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
	
	ambient_effect_len =  parseFloat(g) * 33;
	
	
}



//Recieve for edit


function load_from_host(df){
	
	
	amb_seconds = df.misc.seconds_length;
	ambient_time_line = JSON.parse(df.misc.raw_data_points);
	
	_("seconds_len").value = amb_seconds;
	_("template_name").value = df.name;
	_("panel_color").value = df.color;
	ambient_activate_effect(df.misc.effect);
	_("seconds_len_effect").value = df.misc.effect_len / 33;
	change_effect_len(df.misc.effect_len/33);
	
	
	setTimeout(refresh_timeline, 130);
	
	
}




// Shorcuts


	



