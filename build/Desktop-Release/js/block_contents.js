var plugin_handshake = false;

var regenerators = [];

var plugins = [{
	"plugin_name": "Ambient Light v1",
	"plugin_src": "ambient/ambient_v1.html",
	"type_name": "ambient",
	"thumbnail_src": "ambient/images/amb_v1.png",
	"default_value": "000000",
	"regenerator_src": "plugins/ambient/js/generator.js"
},{
	"plugin_name": "Aipexil Plugin v0.1",
	"plugin_src": "aipexil/aipexil.html",
	"type_name": "aipexil",
	"thumbnail_src": "aipexil/images/rgb_plug_square.jpg",
	"default_value": "0",
	"regenerator_src": "plugins/aipexil/js/generator.js",
	"regen_function": "regen_f3e9cc2243ff902c80b908829745750d",
},{
	"plugin_name": "Aismover Plugin v1",
	"plugin_src": "aismover/aismover.html",
	"type_name": "aismover",
	"thumbnail_src": "aismover/images/aismover_thumb.webp",
	"default_value": "000000:~:~",
	"regenerator_src": "plugins/aismover/js/generator.js",
	"regen_function": "regen_82943e2512849395c30065395b94669a",
}];



var templates = [];
var selected_template;

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



//Loop trough the form inputs' id
function gen_seconds_input(inputs){
var nums = [];
nums.legend = 0;

	 for (ts = 0; ts < inputs.length; ts++) {
	  //put all Elements values to the array	 
		if(_(inputs[ts]).value > parseInt(_(inputs[ts]).max)){
			nums.push(_(inputs[ts]).max);
			//cap to max
		}else if(_(inputs[ts]).value < parseInt(_(inputs[ts]).min)){
			nums.push(_(inputs[ts]).min);
			//cap to min
		}else{		
			nums.push(_(inputs[ts]).value);
		}
	}


return gen_seconds(nums);

}


//Generate seconds from array of numbers, first one being the seconds and so on
function gen_seconds(times) {
var multipliers = [1, 60, (60*60)];
var input_count = times.length;
var consolidated_seconds = 0;

    //loop trough the input
	  for (ts = 0; ts < input_count; ts++) {		
			consolidated_seconds  = consolidated_seconds + (validate_number(times[ts]) * multipliers[ts]);					
	  } 
  return consolidated_seconds;
}


//Validate time input if valid 
function validate_number(inpt){	
	if(parseInt(inpt).toString() == 'NaN'){
		return 0;
	}	
	return parseInt(inpt);
	
}





//Iframe bridge


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

// Function to be called from iframe
function parentFunc(message) {
    alert(message);
}

function test_(srt){
	
	alert(srt);
	
}


function handshake(data){
	
	plugin_handshake = data;

	
}


function test_handshake(){
	
	if(plugin_handshake == true){
		_("plugin").classList.add("show_");
		setTimeout(t_s, 100); //Transfer Data to plugin if Available
	}
	
}

function init_handshake(){
	setTimeout(test_handshake, 300);
}


function template_data(d){
	
	add_to_templates(d);
}

function close_plugin(){
	plugin_handshake = false;
	_("plugin").classList.remove("show_");
	_("plugin").src = "";
	
	current_mode = "add";
}


function sendToI(fn,data){
	_("plugin").contentWindow.postMessage({
    'func': fn,
    'message': data
}, "*");

}



function show_plugins_list(){
	
	_("plugin_lists") && (_("plugin_lists").innerHTML = "");
	regenerators.length = 0;
	
	let prefs = (typeof prefixRoot !== 'undefined') ? prefixRoot : undefined;
	
	
	for(plg = 0; plg < plugins.length;plg++){	
		generate_plugins(plugins[plg],plg,prefs);
	}
	
	
}

function generate_plugins(pl_data,id,prefix=''){
	
	
	
	var plug_thumb = document.createElement("div");
		plug_thumb.classList.add("plug_thumb");
		plug_thumb.title = pl_data.plugin_name;
		plug_thumb.setAttribute("plugin_id",id);
		plug_thumb.setAttribute("onclick","open_plugin("+id+",'open')");
		
	var plug_thumb_image = document.createElement("img");
		plug_thumb_image.classList.add("plug_thumb_image");
		
		plug_thumb_image.src = prefix+"plugins/"+ pl_data.thumbnail_src;
		plug_thumb.appendChild(plug_thumb_image);
		
	var plug_thumb_name = document.createElement("div");
		plug_thumb_name.classList.add("plug_thumb_name");
		plug_thumb_name.innerHTML = pl_data.plugin_name;
		plug_thumb.appendChild(plug_thumb_name);
		
	
	_("plugin_lists") && _("plugin_lists").appendChild(plug_thumb);
	
	var regen_script = document.createElement("script");
		regen_script.src = prefix+pl_data.regenerator_src;
		regen_script.id = pl_data.type_name+id;
		document.head.appendChild(regen_script);
		
		if(pl_data.regen_function == undefined || pl_data.regen_function == null){
			regenerators.push(pl_data.type_name+"_main");
			console.log("No such regen specified for "+ pl_data.plugin_name +", this plugin Uses default regen function");
		}else{
			regenerators.push(pl_data.regen_function);
			
		}
		
		
		
	
}



var init_lugs = show_plugins_list();



function open_plugin(elm, type){
	var plugin_datas = plugins[elm];
	
	
	_("plugin").src = "plugins/"+plugin_datas.plugin_src;
	
	if(type == "open"){
		current_mode = "add";
	}
	
	if(playMode == "manual" && type == "open"){
		
		current_mode = "add_manual_template";
	}
	
}

var dfg;
var issending;
function send_data_to_plugin(df){
	
	dfg = df;
	
	// setTimeout(t_s, 300);
	issending = true;
}

function t_s(){
	if(issending == true){
		sendToI("load_from_host",dfg);
	}
	
	issending = false;
}



//finding the index of plugin by type
function find_plug(nm){
	
		
		
	for(plg = 0; plg < plugins.length;plg++){
		
		
		if(plugins[plg].type_name == nm){
			
			return plg;
			
		}
		
		
		
	}
	
	//return undefined if not found at all
	return undefined;
	
}





//Template Management


function generate_templates(tl_data,id){
	
	
	
	var template_thumb = document.createElement("div");
		template_thumb.classList.add("template_thumb");
		template_thumb.style.backgroundColor = tl_data.color+"d5";
		template_thumb.title = tl_data.name + "\nType:" + tl_data.type ;
		template_thumb.setAttribute("template_id",id);
		template_thumb.setAttribute("onclick","add_to_timeline("+id+")");
		
		
		
	var template_thumb_name = document.createElement("div");
		template_thumb_name.classList.add("plug_thumb_name");
		template_thumb_name.innerHTML = tl_data.name;
		template_thumb.appendChild(template_thumb_name);
		
	
	_("content_con").appendChild(template_thumb);
	
}






function add_to_templates(data){
	
	var template_block_contents = {
			"content_length":data.content.length,
			"type":data.type,
			"data": data.content,			
			"name": data.name,
			"color":data.color,		
			"misc" : data.misc
			
		}
	
		
	if(current_mode == "add"){
		//add to timline templates
		templates.push(template_block_contents);
		load_all_templates();
		
	}else if(current_mode == "edit"){
		//modifying template contents on the timeline
		modify_sub_track(template_block_contents);
		
	}else if(current_mode == "edit_template"){
		//Modify a template on template contianer
		templates[selected_template] = template_block_contents;	
		load_all_templates();
		
	}else if(current_mode == "add_manual_template"){
		//adding to manual template container
		
		template_player.templates.push(template_block_contents);
		manual_template_manager.load_to_view();
		
		
	}else if(current_mode == "edit_manual_template"){
		//Modifying manual template
		template_player.templates[selected_template] = template_block_contents;	
		manual_template_manager.load_to_view();
		manual_template_manager.load_triggers();
		
	}
	
}


function remove_template(){
	
	if(editFrom == "manual"){
		template_player.removeTemplate(selected_template);
		
		return;
	}
	
	
	
	templates.splice(parseInt(selected_template), 1);

	
	selected_template = null;
	load_all_templates();
}



function load_all_templates(){
	
	if(_("content_con") == null){
		return;
	}
	
	
	_("content_con").innerHTML = "";
	
	
	for(plg = 0; plg < templates.length;plg++){
	
		generate_templates(templates[plg],plg);
		
		// console.log(plg);
	}
	
	_("content_con").addEventListener("contextmenu", function context_menu_templates (e) {
		
		e.preventDefault();
		e.stopPropagation();
		
		if(e.target.classList[0] == "template_thumb"){
			
			selected_template = e.target.getAttribute('template_id');
			
			current_mode = "edit_template";
			editFrom = "timeline";
			
			console.log("Open Context Menu for Template");
	
			
			set_coords_context(e.screenX,e.screenY);
			
			window.chrome.webview.hostObjects.NativeObject.Show_template_menu();
			
		}
		
	},
	
	false
	
	)
	
	
}

var load_all_templates_ = load_all_templates();




//Adding Template to Timeline at Head
function add_to_timeline(idf){
	
	var tds = templates[idf];
	
	// console.log(tds);
	
		var to_add = {
			"start_at":time,
			"content_length":tds.content_length,
			"end_at":0,
			"type":tds.type,
			"name": tds.name,
			"color":tds.color,		
			"misc":tds.misc,
			"data": tds.data	
		}
	
	
	add_sub_tracks(to_add);
	
	
}


//Adding Into Templates from Timeline
function sendToTimelineTemplates(){
	if(!selected_content && selected_contents.length <= 1){
		return false;
	}else if(selected_contents.length > 1){
		//multiple add
		
		if(selected_contents.length > 10){
			
			alert("Please Select no more than 10 content blocks for this!");
			
			return ;
			
		}
		
		
		
		let extID = 0;
		for(sel of selected_contents){
			
				var to_send = timeline_data[selected_track_indexes[extID]].sub_tracks[sel.getAttribute("content_id")];
	
			let dataSend = JSON.parse(JSON.stringify(to_send));
				dataSend.content = dataSend.data;
			
				current_mode = "add";
				add_to_templates(dataSend);
			
			extID++;
		}
		
		
		return;
	}
	
	var to_send = timeline_data[selected_track_index].sub_tracks[selected_content.getAttribute("content_id")];
	
	let dataSend = JSON.parse(JSON.stringify(to_send));
		dataSend.content = dataSend.data;

	
	current_mode = "add";
	add_to_templates(dataSend);
}

//Adding From Timeline Templates to Manual Templates
function sendToManualTemplates(){
	if(!selected_template){
		return false;
	}
	
	let to_send = templates[selected_template];
	let dataSend = JSON.parse(JSON.stringify(to_send));
		dataSend.content = dataSend.data;
	console.log(dataSend);
	current_mode = "add_manual_template";
	add_to_templates(dataSend);
}

//Adding From Manual Templates to Timeline Templates 
function sendToTimeTemplates(){
	if(!selected_template){
		return false;
	}
	
	let to_send = template_player.templates[selected_template];
	let dataSend = JSON.parse(JSON.stringify(to_send));
		dataSend.content = dataSend.data;
	console.log(dataSend);
	current_mode = "add";
	add_to_templates(dataSend);
}




function  edit_template(){
	if(editFrom == "timeline"){
		open_edit_for(templates[selected_template],"edit_template");
	}else if(editFrom == "manual"){
		open_edit_for(template_player.templates[selected_template],"edit_template");		
	}

}

function set_coords_context(x,y){//This function sets the X,Y coords for Native Context Menu
	try{
		window.chrome.webview.hostObjects.NativeObject.set_mouse_coords(x,y);
	}catch(e){
		console.log("This is not supported in this browser")
	}
	
	
}


//Regeneration of Data on load


function regen_from_plugin(plug_id,data){

	// console.log(plug_id);
	// console.log(data)
	return window[regenerators[plug_id]].call(null, JSON.stringify(data));

}


// ==========================
// DMX Configurator Functions
// ==========================

function close_configurator(){
	_("dmx_config").remove();
	
}


function openDMXConfig(l, timeout=1500) {
	let conf = make("iframe");
	conf.classList.add("plugin_view", "show_");
	conf.src = l || "views/dmx_configurator.html";
	conf.setAttribute("id", "dmx_config");

	let didLoad = false;

	conf.onload = function () {
		didLoad = true;
	};

	conf.addEventListener('error', function () {
		console.log("Config Window Open Error (caught via error event)");
		close_configurator(); 
	});

	//Its Fallback timeout in case error doesn't fire
	setTimeout(function () {
		if (!didLoad) {
			console.log("The config iframe might not have loaded...");
			close_configurator(); 
		}
	}, timeout); // Adjust the timeout if needed

	document.body.appendChild(conf);
}






