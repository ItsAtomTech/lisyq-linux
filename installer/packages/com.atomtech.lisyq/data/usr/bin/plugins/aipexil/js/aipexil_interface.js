// =================================
// Aipexil neopexil controller plugin v1.0.2
// by Atomtech 
// =================================

let aipexil_time_line = aipexil.key_frames;
let timelen = aipexil.timelen;

var click_on_stab = false;
var clicktimes = 1;
var coords = 0;
var mode = "add";


var selected_stabs;
var idf;


//Preview
var is_preview = false;
var preview_play = false;
let at_point = 0;

var static_play = setInterval(playon, aipexil.time_constant);
var click_on_stab = false;

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
//Handshake methods

function test(){
	sendTo("test_","Datas");
}

function handh(){

sendTo("handshake",true);

}

var hand = handh();





/* Communication Funcs to LiSyQ */


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




//Timeline Functions


	_("keyframe_container").addEventListener("contextmenu", context_menu);



//Save keyframe to Timeline
function save_key(){
	
	let effect_type = _("type_selector").value;
	
	if(mode == "add"){
		
		var start = gen_coords(_("s_start").value);
		var end = gen_coords(_("s_end").value);
		
		var width = end - start;
		
		
		
	
		
		//Here are the Params for keyframes goes
		var key_frame = {
			
			"time_start": cap(_("s_start").value),
			"time_end": cap(_("s_end").value),
			"type": effect_type, 
			effect_params: {}, //Parameter for this effect keyframe
			
			
		}
		
		
		//Determine type effect to sent to a factory function
		if(effect_type == "premade"){
			
			
			
			key_frame.effect_params = {fx_type: _("pre_efx_selector").value,
				
				"values": decople(aipexil.premade_effects_params),
			
			}
			
		}
		
		
		
		//After everthing, add this to the keyframe timeline 
		add_time_stab(start,width,aipexil_time_line.length);
		
		aipexil_time_line.push(key_frame);	
		
		
	}else if(mode == "edit"){
				

				
		var key_frame = {
			
			"time_start": cap(_("s_start").value),
			"time_end": cap(_("s_end").value),
			"type": effect_type, 
			effect_params: {}, //Parameter for this effect keyframe
			
			
		}
		
		
		//Determine type effect to sent to a factory function
		if(effect_type == "premade"){
			
				// console.log(decople(selected_stabs.effect_params.values));
			
			key_frame.effect_params = {fx_type: _("pre_efx_selector").value,
				
				"values": decople(selected_stabs.effect_params.values),
		
			}		
			
		}
			
		
		aipexil_time_line[idf] = key_frame;		
		refresh_timeline();
	}
	
	
	is_preview = true;
	aipexil.key_frames = aipexil_time_line;
	aipexil.generateData();
	
	
	
	
	
}












function click_on_time_con(t){
	
	if(event.target.classList[0] != "keyframe_con"){
			return;
	}
		
	
	
	coords = (event.offsetX);
	start_at_prev(coords);
	
}



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


//Update timeline when the length total is changed
function change_secs_sacle(s){
	
	timelen = parseFloat(s);
	
	
	if(timelen > 60){
		z = 60;	
	}else if(timelen < 0){
		timelen = 0;		
	}
	
	aipexil.timelen = timelen;
	
	refresh_timeline();
	
}


//remove a keyframe from timeline
function remove_key(){
	
	aipexil.key_frames.splice(idf,1);
	
	aipexil_time_line = aipexil.key_frames;
	
	refresh_timeline();
	open_keyframe_manager();
	
}



function refresh_timeline(){
	
	var line_key_time = _("line_key_time");
		line_key_time.innerHTML = "";
		
		
		for(al = 0;al < aipexil_time_line.length;al++){
			
			var start = gen_coords(aipexil_time_line[al].time_start);
			var end = gen_coords(aipexil_time_line[al].time_end);
			var width = end - start;
		
			add_time_stab(start,width,al);			
					
		}
		
		preview_head(at_point-4);
		
	
	
}



	//context menu end
//Change the Location of preview head on scale change
function preview_head(coords){
	
	
	_("preview_head").style.transform = "translateX("+ parseFloat(gen_coords(at_point/aipexil.time_constant)+2)+"px)";
	
	
	
}


function start_at_prev(coords){
	
	var x = _("line_key_time").getBoundingClientRect().width;
	var s = timelen;
	var c = coords;
	
		_("preview_head").style.transform = "translateX("+ parseFloat(coords +2)+"px)";

		at_point = (parseInt(((c / x) * s).toFixed(3)*aipexil.time_constant)+2);
	

	if(preview_play){
		sendTo("media_prev",at_point);
	}
	
}



function click_on_time_bar(t){
	if(click_on_stab == true){		
		click_on_stab = false;		
				
		return;
	}

	coords = (event.offsetX);
	start_at_prev(coords);

	
	if(clicktimes >= 2){				
		console.log("double click");
		
		
		open_keyframe_manager(null, "timeline")

		
	}
	clicktimes++;	
	setTimeout(reset_clicks, 440);
	// console.log(event);
	
	
	
}



function reset_clicks(){	
	clicktimes = 1;	
}


//Add keyframe tab to Timeline bar
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
		key_stab.setAttribute("id","key_"+id);
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
		selected_stabs.time_start = gen_time(stabCoord);
	}else{
		selected_stabs.time_end = gen_time(stabCoord);
	}
	
	isDraggingKey = false;
	//reflect changes to selected keyframe
	let kyID = (elm.parentElement.getAttribute("key_id"));
	open_keyframe_manager(kyID, "stabs");
	
	refresh_timeline();
}





//User clicked on a keyframe
let prev_id;
function click_on_stabs(t){	
	click_on_stab = true;		
	idf = t.getAttribute("key_id");
	
	if(prev_id != idf ){	
		
		refresh_timeline(); //refreshes if new id was detected
	}
	
	
	
	_("key_"+idf).classList.add("active_tabs");;
	
	prev_id = idf;		
	selected_stabs = aipexil_time_line[idf];
	
	if(event.target.classList.contains("key_handle")){
		return;
	};
	
	open_keyframe_manager(t, "stabs");
	
}





function open_keyframe_manager(elm, type){
	
	var x = _("line_key_time").getBoundingClientRect().width;
	var s = timelen;
	var c = coords;
	
	
	
	if(type == "timeline"){
		
		_("s_start").value = ((c / x) * s).toFixed(2);
		_("s_end").value = gen_end_val(_("duration_").value);	
		_("s_start").setAttribute("max",s);
		_("s_end").setAttribute("max",s);	
		_("s_end").setAttribute("min",((c / x) * s).toFixed(2));
		_("duration_").setAttribute("max",s);
		
		
		mode = "add";
		
		
		generate_type_inputs(_("type_selector").value);

		//refresh_timeline();
		
		
		 _("r_button").style.display = "none";
		 _("s_button").innerText = "Add";
		 
		_("copy_frame").style.display = "none";
	
		
	}else if(type == "stabs"){
		
		_("s_start").value = selected_stabs.time_start;
		_("s_end").value = selected_stabs.time_end;	
		_("s_start").setAttribute("max",s);
		_("s_end").setAttribute("max",s);	
		_("s_end").setAttribute("min",(selected_stabs.time_start));
		
		mode = "edit";
		

		
		generate_type_inputs(selected_stabs.type);
		
		_("r_button").style.display = "flex";
		 _("s_button").innerText = "Save Changes";
		_("copy_frame").style.display = "flex";
		
				

		
		
	}else{
		
		_("s_start").value = 0;
		_("s_end").value = gen_end_val(_("duration_").value);	
		_("s_start").setAttribute("max",s);
		_("s_end").setAttribute("max",s);	
			
		_("s_end").setAttribute("min",((c / x) * s).toFixed(2));
		
		generate_type_inputs(_("type_selector").value);
		refresh_timeline();
	}
	
	
	
	
}




//Genrating coords for the timeline based on time derived from keyframe timeline width
function gen_coords(z){
	
	if(z > timelen){
		z = timelen;	
	}else if(z < 0){
		z = 0;		
	}
	
	var x = _("line_key_time").getBoundingClientRect().width;
	var y = timelen;
	
	return (x / y ) * z;
	
	
}

//Returns 0 if negative
function cap(z){
	
	if(z > timelen){
		z = timelen;	
	}else if(z < 0){
		z = 0;		
	}
	return z;
	
}




function close_key_man(){
	_("key_man").style.display = "none";
	color_options('hide');
	
}



//Extras


function show_time(){
		
		
		
		var x = _("line_key_time").getBoundingClientRect().width;
		var s = timelen;
		var c = event.offsetX;
		
	
		if(event.target.classList[0] != "line_key_time"){
			return;
		}
		
		let calcu_time = ((c / x) * s).toFixed(2) ;
		event.target.title = "Position: " + calcu_time + "s";
		
		
			// console.log(calcu_time);
			
			
		
		return //remove this later when you implement the dom Elm
		
		_("keyframe_details").innerHTML = "Position: " + calcu_time + "s";
		
	
		
	}

function gen_time(coords){
		
		var x = _("line_key_time").getBoundingClientRect().width;
		var s = timelen;
		var c = coords;
		
		
	 return ((c / x) * s).toFixed(2);
		
	}

function empty_display(){
	try{
		_("keyframe_details").innerHTML = "---";
	}catch(e){
		//--
		
	}
	
	
}

function set_end_at(vd){
	
	_("s_end").value = parseFloat(_("s_start").value) +  parseFloat(vd);
	
}

function gen_end_val(rd){
	
	
	if(parseFloat(rd) > 0){
		
		return parseFloat(rd);
		
	}else{
		return timelen;
	}


}







function playon(){
	
	if(preview_play){
		
		
		
		// _("preview").style.backgroundColor = "#"+colors_array[at_point];
		
		//console.log(aipexil.seqData[at_point]);
		
		//To-DO: Interactive preview based on type detected
		
		_("preview_container").innerText = "No visual preview for this effect! \n" +aipexil.seqData[at_point];
		
		
		
		
		preview_head(at_point);
		
		at_point++;
		
				
		if(at_point > aipexil.seqData.length){
			preview_play = false;
			at_point = 0;
			sendTo("stop_media_prev");
			
		}
	}

	
	
	
}





function play_template(){
	is_preview = true;
	aipexil.generateData();
	
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




function change_params(index, values){
		
	if(typeof(aipexil.premade_effects_params[index]) == 'object'){
		
		return;
	};	
	try{
		if(typeof(selected_stabs.effect_params.values[index]) == 'object' && mode == "edit"){
		
		return;
		};	
	}catch(e){
				//-
	}
	
	if(mode == "edit"){
		
		selected_stabs.effect_params.values[index] = values;
		
	}else{
		aipexil.premade_effects_params[index] = values;
	}
}




function dual_value(elm,form_id, index){
	
	let pos = elm.getAttribute("position");
	let text = elm.getAttribute("textdata");
	
	if(pos == "from"){
		pos = 0;
		
	}else{
		pos = 1;
	}
	

	
	
	
	elm.innerText = text +  _(form_id).value;
	elm.setAttribute("value",  _(form_id).value);
	aipexil.premade_effects_params[index][pos] = _(form_id).value;
	
	
	if(mode == "edit"){
		
		
		if(typeof(selected_stabs.effect_params.values[index]) != 'object'){
			selected_stabs.effect_params.values[index] = [0,0];
		};
		
		selected_stabs.effect_params.values[index][pos] = _(form_id).value;
		
		
		
	}else{
		// aipexil.premade_effects_params[index] = values;
		if(typeof(aipexil.premade_effects_params[index]) != 'object'){
			aipexil.premade_effects_params[index] = [0,0];
		};
	
		
		aipexil.premade_effects_params[index][pos] = _(form_id).value;
	
	}
	
	
	//aipexil.premade_effects_params[index] = [];
	
	// console.log(aipexil.premade_effects_params);

}



// Form Generators



//Show the right keyframe forms for selected generator type
function generate_type_inputs(gtype){
	let def = "premade";
	
	
	if(gtype == "premade"){
		
		generate_premade_inputs();
		
		
	}else{
		
		_("type_selector").value = def;
	}
	
	
	
}



function generate_premade_inputs(type){
	
	
	if(type == undefined || type == null){
		
		type = "pallet";
		
		if(mode == "edit"){
			
			//set according to the type of the fx from keyframe
			type = selected_stabs.effect_params.fx_type;
			
		}
	}
	
	_("pre_efx_selector").value = type;
	
	let params = aipexil.premade_effects_bin[type].params;
	
	
	
	
	_("param_inputs").innerHTML = "";
	
	
	
	let indexes = 0;
	for(parameter of params){
		
		let genform = generate_form(parameter);
			genform.setAttribute("onclick","change_params("+indexes+",this.value)");
			genform.setAttribute("oninput","change_params("+indexes+",this.value)");
		
			if(mode == "edit"){
				var stored_val = selected_stabs.effect_params.values[indexes];
				
				
				genform.value = stored_val;
				
				if(typeof(stored_val) == "object"){
					
					genform.value = stored_val[0];
				}
				
				
			}
		
			genform.id = "param_"+ indexes;
		
		if(mode != "edit"){
			change_params(indexes, parameter.default);
			
		}
		
			
		
		let label = document.createElement("label");
			label.innerText = parameter.name + ": ";
			
			
		if(parameter.type == "slider"){
			
				
				genform.setAttribute("oninput","change_params("+indexes+",this.value); _('param_slide_"+indexes+"').innerText = this.value");
			
				
		}
			
		
		let form_con = document.createElement("div");
			form_con.appendChild(label);
			form_con.appendChild(genform);
		
		if(parameter.type == "slider"){
			let sliders_display = document.createElement("span");
					sliders_display.id = "param_slide_"+indexes;
			form_con.appendChild(sliders_display);
			
			if(mode == "edit" ){
				
				sliders_display.innerText = selected_stabs.effect_params.values[indexes];
				
			}
		
		}
		
		//Add from-to Buttons if this param is animatable
		if(parameter.animatable){
			
				let animatable_con = document.createElement("div");
				
			
				let from_ = document.createElement("button");
					from_.innerText = "From: ";
					from_.setAttribute("textData", "From: ");
					from_.setAttribute("position", "from");
					from_.classList.add("key_frame_button", "secondary_background","primary_color");
					
					from_.setAttribute("onclick", "dual_value(this,'param_"+indexes+"',"+indexes+")");
				
					if(mode == "edit" && typeof(selected_stabs.effect_params.values[indexes]) == "object"){
						
						from_.innerText =  "From: " + selected_stabs.effect_params.values[indexes][0];
						
					}
				
					
				let to_ = document.createElement("button");
					to_.innerText = "To: ";
					to_.setAttribute("textData", "To: ");
					to_.setAttribute("position", "to");
					to_.classList.add("key_frame_button", "secondary_background","primary_color");
					
					
					if(mode == "edit" && typeof(selected_stabs.effect_params.values[indexes]) == "object"){
						
						to_.innerText = "To: " + selected_stabs.effect_params.values[indexes][1];
						
					}
					
					to_.setAttribute("onclick", "dual_value(this,'param_"+indexes+"',"+indexes+")")
					
					animatable_con.appendChild(from_);
					animatable_con.appendChild(to_);
					
				form_con.appendChild(animatable_con);
				
		}
		
	
		
		
		
		_("param_inputs").appendChild(form_con);
		
		// console.log(form_con);
		indexes++;
		
	}
	
	
	
	
}


function generate_form(params){
	
	let form_type = "number";
	let in_form ;

	
	
	if(params.type == "number"){
		
		in_form = document.createElement("input");
		in_form.type = "number";
		in_form.min = params.min;
		in_form.max = params.max;
		in_form.value = params.default;
		in_form.setAttribute("value",params.default);
		
		
	}else if(params.type == "options"){
		in_form = document.createElement("select");
		in_form.setAttribute("value",params.default);
		
		for(vals = 0; vals < params.values.length; vals++){
			let options = document.createElement("option");
				options.innerText = params.values[vals][0];
				options.setAttribute("value",params.values[vals][1]);
			
			in_form.appendChild(options);
			
		}
		
		
	}else if(params.type == "slider"){
		

		in_form = document.createElement("input");
		in_form.type = "range";
		in_form.min = params.min;
		in_form.max = params.max;
		in_form.value = params.default;
		in_form.setAttribute("value",params.default);
		
		
	}else{
		
		console.log("type:"+ params.type + " is not coded to the system yet");
		return "None";
		
	}
	

	
	/* console.log(in_form); */
	
	
	return in_form;
	
	
}


//Un cople data from its source ref
function decople(data){
	
	let key_to_copy = JSON.parse(JSON.stringify(data));
	return key_to_copy;
	
	
}




//Copying

let key_to_copy;

function copy_frame(){
	
	key_to_copy = JSON.parse(JSON.stringify(selected_stabs));
	
	
	
}


//Pasting keyframe


function paste_key(){
	
	if(key_to_copy == null || key_to_copy == undefined){
		return;
	}
	
	let width = key_to_copy.time_end -  key_to_copy.time_start;
	
	
	key_to_copy.time_start = parseFloat(gen_time(coords));
	key_to_copy.time_end = cap(parseFloat(gen_time(coords)) + parseFloat(width));
	

	
	let to_paste_ = JSON.parse(JSON.stringify(key_to_copy));
	
	aipexil_time_line.push(to_paste_);
	
	
	
	hide_context();
	refresh_timeline();
	
}


//sending to LiSyQ

let template_data;

function generate_template(){
	// console.clear();
	
	
	aipexil.generateData()

	
	
	var tm_data = {
						
		"length":aipexil.seqData.length,
		"type":"aipexil",
		"content": aipexil.seqData,
		"name": _("template_name").value,
		"color": _("panel_color").value,
		"misc": {
			"raw_data_points": JSON.stringify(aipexil.key_frames),
			
			"seconds_length": timelen,
			
		}
				
	}
	
	
	template_data = tm_data;
	
	// console.log(colors_array);
	
	if(is_preview){
		
		is_preview = false;
		// return false;
		
	}
	
	
	sendTo("template_data",template_data);
	sendTo("stop_media_prev");
	sendTo('close_plugin','');
	
	
}


generate_type_inputs("premade");



//Recieve for edit from LiSyQ


function load_from_host(df){
	
	
	timelen = df.misc.seconds_length;
	aipexil.timelen = timelen;
	aipexil.key_frames = JSON.parse(df.misc.raw_data_points);
	aipexil_time_line = aipexil.key_frames;
	
	_("seconds_len").value = timelen;
	_("template_name").value = df.name;
	_("panel_color").value = df.color;


	// Others here
	
	generate_type_inputs("premade");
	setTimeout(refresh_timeline, 130);

	
}




