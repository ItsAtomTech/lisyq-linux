var active;
let template_player = {
	
	templates:[], //Tempates are loaded into here
	playerTabs:[],//Play Tabs collection
	
	timers: [], //Timer counter array for every playing Que
	playingQue: [], //Playing Ques data 
	
	opened_selected_save_id: null,
// ================ 	

	playOn:function(){
				
		let index_timer = 0;
		output.length = 0;
		let allRemoved = false;
	
		for(targets of this.playingQue){
			
			try{
				
				let max = targets.content_length;
				
				let play_mode = targets.playMode;
				let repeat_mode = targets.repeatMode;
				
				
				if(this.timers[index_timer] == undefined || this.timers[index_timer] == null){
					
					this.timers[index_timer] = 0;
		
				}
				
				
				
				if(targets["isReversing"] == true){
					//if isReversing == true, removeQue if index reaches 0		
					if(this.timers[index_timer] <= 1){
						delete targets.isReversing;
						allRemoved = this.removeQue(index_timer);			
						
							if(allRemoved){
								output.length = 0;
								return false;
							}						
					}
					
					if(this.timers[index_timer] > 1){
						this.timers[index_timer]--;	
					}
					
					
				}else{
					//normal playing through
					this.timers[index_timer]++;
				}
				
				
				
				if(this.timers[index_timer] >= max){
					
			
					if(targets.repeat == "once"){
						
						//Play through the end once
						this.timers[index_timer] = max-1;
						
					}else if(targets.repeat == "alternate"){
						
						this.timers[index_timer] = (max-1) * -1;
						
					}else{
						//start all over again
						this.timers[index_timer] = 0;
					}
					
					
					
					
				}

				
				for(ports of targets.target_port){
					for(chan of targets.target_channel){						
						try{						
						if(output[ports] == undefined){							
							output[ports] = [];				  
						}
			
						if(active){ //only output if active toggle is true
						
						
						
							if(this.timers[index_timer] < 0){
								//Handles Negative Value to + val
								let absoluteV = Math.abs(this.timers[index_timer]);
								output[ports][chan] = targets.data[absoluteV];
							}else{
						
								output[ports][chan] = targets.data[this.timers[index_timer]];
								
							}
						
						
						}
						
						}catch(e){
							
							//
							
						}
					}					
					
				}											
			}catch(e){
			
				//Do something if outbound index, but better nothing at all
				
			}
			
		
			index_timer++;
			
			
			
		}
		
	
		

		
	},
	
	//add to Playing Que
	addQue: function(data,index){
			
		this.playingQue[index] = data;
		this.timers[index] = 0;
		return true;
				
		
	},
	
	removeQue: function(index){
		let rvq = (this.playingQue[index] = null);
		let allEmpty = true;
		for(playQue of template_player.playingQue){
			if(playQue != null){
				allEmpty = false;
			}
		}
		//Makes it empty if there are all null
		if(allEmpty){
			template_player.playingQue.length = 0;
			return true;
		}
		return false;
	}, 
	
	
	addReversing: function(index){
		//It returns true if the playQue is already has isReversing set to true
		
		if(this.playingQue[index].isReversing == true){
	
			return true;
		}
		
		this.timers[index] = Math.abs(this.timers[index]);
		
		this.playingQue[index].isReversing = true;
		return false;
		
	},
	
	update_channels: function(val, index){
		let values = val.value.split(",");
		
		template_player.playerTabs[index].target_channel = values;
		
		
	},	
	update_ports: function(val, index){
		let values = val.value.split(",");
		
		template_player.playerTabs[index].target_port = values;
		
		
	},
	
	update_hotkey: function(val, index){
		let keys = val.value.toUpperCase();
		
		template_player.playerTabs[index].hotkey = keys;
		manual_template_manager.update_trigger(index);
		
	},
	
	removeTemplate: function(id){
			
		let prm = window.confirm("Are you sure to delete this Template? Can't be removed while being used!");
		
		if(prm == false){
			return;
		}
		let canRemove = true;
		//scan for usage: 
		
		for(trigs of this.playerTabs){		
			if(trigs.data == parseInt(id)){			
				let node = "<center><div> Template in use! <br> can't be deleted. </div></center>";				
				createDialogue("error",node);
				canRemove = false;	
			};	
		}
		
		
		if(canRemove){
			
			template_player.templates.splice(id,1);
			manual_template_manager.load_to_view();
			
		}
		
		
	}
	
	
	
	
}

var test_data;

function test(id){	
	let index = 0;
	if(id != undefined){		
		index = id;		
	}
		
	let my_data = {
		
		"content_length":34,
		
		"data" : ['ffff1f','ffffff','f2ffff','ffffff','f3ffff','ffffff','ffff4f','ffffff','f5ffff','ffffff','ffff6f','ffffff','ffff8f','ffffff','ffff9f','fff5ff','ffffff','ff4fff','ffffff','fff3ff','ffffff','ffff2f','ffffff','ffff1f','f0ffff','ffff1f','fff4ff','ffffff','ffffff','ffffff','ffffff','ffffff','0000ff','fff0ff']		
		
		
	}
	
	
	my_data.target_port = [0,1];
	my_data.target_channel = [0,1,2];

	template_player.addQue(my_data,index);

}



let manual_template_manager = {
	firstTime: true,
	selectedTabIndex: null,
	tab_selected: null,
	

	
	generate_template:function(tl_data,id){	
		
		var template_thumb = document.createElement("div");
			template_thumb.classList.add("template_thumb");
			template_thumb.style.backgroundColor = tl_data.color+"b9";
			template_thumb.title = tl_data.name + "\nType:" + tl_data.type ;
			template_thumb.setAttribute("template_id",id);
			template_thumb.setAttribute("onclick","manual_template_manager.add_to_triggers("+id+")");
			
			
			
		var template_thumb_name = document.createElement("div");
			template_thumb_name.classList.add("plug_thumb_name");
			template_thumb_name.innerHTML = tl_data.name;
			template_thumb.appendChild(template_thumb_name);
			
		
		_("manual_templates_con").appendChild(template_thumb);
		
		this.firstTime = false;
		
	},
	


	//Load all templates to view
	load_to_view: function(){
		_("manual_templates_con").innerHTML = "";
		
		for(plg = 0; plg < template_player.templates.length;plg++){
		
			manual_template_manager.generate_template(template_player.templates[plg],plg);
			
			// console.log(plg);
		}
			
		
		
		_("manual_templates_con").addEventListener("contextmenu", function context_menu_templates (e) {
		
		e.preventDefault();
		e.stopPropagation();
		
			if(e.target.classList[0] == "template_thumb"){
				
				selected_template = e.target.getAttribute('template_id');
				
				current_mode = "edit_template";
				editFrom = "manual";
				
				console.log("Open Context Menu for Manual Template");
		
				
				set_coords_context(e.screenX,e.screenY);
				
				window.chrome.webview.hostObjects.NativeObject.Show_manual_template_menu();
				
			}
			
		},
		
		false
		
		)
		
		
		
		
	},
	
	
	add_to_triggers: function(id){
		let index = 0;

		if(id != undefined){
			
			index = id;
			
		}		
		
		
		var my_data = {
			

			"content_length":index,
			"data" : index,				
			"type": template_player.templates[index].type,				
			"name": index,
			"color": index
				
			
		}
		
		
		my_data.target_port = [0];
		my_data.target_channel = [0];
		my_data.hotkey = "";
		my_data.isPlaying = false;
			
		template_player.playerTabs.push(my_data);
		
		manual_template_manager.load_triggers();
		
		
	},
	
	
	// Trigger function
	
	
	generate_trigger: function(data,index,isSingle = false){
	

		let trigger_blocks = "<div class='trigger_option'> <div class='options_live_open_button' onclick='manual_template_manager.openOptionPane(this)' tabdindex='"+index+"'> </div> <div class='option_input'><span class='seamless_label'> Target ch(s): </span><input onchange='template_player.update_channels(this,"+index+")' class='seamless_input primary_color' placeholder='0,1,2..' trigger='"+index+"' value='"+data.target_channel+"'/> </div><div class='option_input'><span class='seamless_label'> Target Port(s): </span><input class='seamless_input primary_color' trigger='"+index+"' placeholder='0,1,2..' value='"+data.target_port+"' onchange='template_player.update_ports(this,"+index+")'/> </div></div><div class='trigger_details' style='background-color:"+template_player.templates[data.color].color+"a5';><div onclick='manual_template_manager.simpleClick("+index+")' class='template_details'><span>"+template_player.templates[data.name].name+"</span> <span>"+data.type+"</span> "+ genInfoStrip(data) + 
		
		"<div class='simple_options_pane'> <div class='channels_live_open_button button' onclick='manual_template_manager.openChannelPane(this)' tabdindex='"+index+"' title='Tab Channel Configuration'> </div> <div class='options_live_open_button button' onclick='manual_template_manager.openOptionPane(this)' tabdindex='"+index+"' title='Tab Configuration'> </div> </div>"+
		
		
		" </div></div><div class='trigger_actions'><div class='option_input' onclick='manual_template_manager.remove("+index+")'>Remove</div>"+
		"<div class='option_input play_stop' onclick='manual_template_manager.play("+index+")' >Play/Stop</div>"+
		"<div class='option_input hot_key_option'>Hotkey: <input class='seamless_input primary_color' trigger='"+index+"' placeholder='A' value='"+data.hotkey+"' onchange='template_player.update_hotkey(this,"+index+")' maxlength='1'/></div></div>";
	
	
		let trigger_con = document.createElement("div");
			trigger_con.classList.add("trigger_con");
			trigger_con.setAttribute("id","trigger_"+index);
	
		if(data.isPlaying == true){
			trigger_con.classList.add('current_playing');
			
		}
		
		if(isSingle == true){
			
			// returns the generated trigger contents instead of appeding it to the main container
			
			return trigger_blocks;
		}
		
		
		trigger_con.innerHTML = trigger_blocks;
		
		_("triggers_con").appendChild(trigger_con);
	
	
	},
	
	
	
	load_triggers:function(){
		_("triggers_con").innerHTML = "";
		
		for(plg = 0; plg < template_player.playerTabs.length;plg++){
		
			manual_template_manager.generate_trigger(template_player.playerTabs[plg],plg);
			
			// console.log(plg);
		}
		
		
	}, 
	
	update_trigger: function(index){
		//Updating a single trigger of its visual elements; accepts index of the trigger.

		let player_tabExisting = template_player.playerTabs[index];
		
		let generatedUpdatedTab = manual_template_manager.generate_trigger(player_tabExisting,index, true);
		
		_("trigger_"+index).innerHTML = "";
		_("trigger_"+index).innerHTML = generatedUpdatedTab;
		
		
		
	},
	
	simpleClick: function(index){
		//play on simple View when clicked on the tab, accepts the index
		let isButton = (event.target.classList.contains("button"));
		let isSimple = (_("triggers_con").classList.contains('simple'));
		if(!isButton && isSimple){
			manual_template_manager.play(index);
		}
	},
	
	
	play: function(index, keyup){
		
		
		let keyed_tab = (template_player.playerTabs[index]);
		let shouldToggle = true;
		let isReversing = false;

		
		if((keyed_tab.activation == 'press_hold' && !keyup) && event.type != 'click'){
			//allows long keypress, disables rapid toggle on press, but not for click event (mouse)
			shouldToggle = false;
		}else if(keyup && keyed_tab.activation != 'press_hold'){
			return;
		}
		
		
		try{
			// remove isReversing property from playQue tab
			delete template_player.playingQue[index].isReversing;
		}catch(e){
			//--
		}
		
		//Stop if already playing
		if((template_player.playingQue[index] != undefined || template_player.playingQue[index] != null) && shouldToggle == true){
			
		
			//Stoping Mode for Playtabs
			if(keyed_tab.playMode == "reverse"){
				
				isReversing = template_player.addReversing(index);
				
			}else{
				template_player.removeQue(index);
			}
			
			
			// console.log("Removed");
			_("trigger_"+index).classList.remove("current_playing");
			template_player.playerTabs[index].isPlaying = false;
					
			return false;
			
			
		}
		// otherwise procced on playing the tab
		
		
		let dt = JSON.parse(JSON.stringify(template_player.playerTabs[index]));
		try{
			dt.data = template_player.templates[dt.data].data;
		}catch(e){
			dt.data.length = dt.content_length;			
		}
		dt.content_length = template_player.templates[dt.content_length].content_length;	
		_("trigger_"+index).classList.add("current_playing");
		
		
		//add and initialize once
		if(template_player.playingQue[index] == undefined || template_player.playingQue[index] == null){
			template_player.addQue(dt,index);
		}
		
		template_player.playerTabs[index].isPlaying = true;
	
		
	},
	
	remove: function(id, confirmValue){
		
		if(confirmValue == null){
			
			let confirmData = {
				message: "Are you sure to remove this play Tab?",
				tabID: id
			}
			
			createDialogue('confirmRemove', confirmData);
			return;
		}
		
		if(!isEnterKey(event)){//shortcut enter key
			return;
		}
		
		
		template_player.removeQue(id);
		template_player.playerTabs.splice(id,1);
		
		manual_template_manager.load_triggers();
		
		
		
		
	},
	
	//Plays or Stop a trigger based on the Hot Key Assigned
	playOnKey:function(key, keyup){
		
		
		let index_ref = 0;
		for (trigger of template_player.playerTabs){
			
				if(trigger.hotkey == key){
					
					manual_template_manager.play(index_ref, keyup);
					// console.log("Triggering "+ index_ref);
					
					if(false){
						//put logic to check auto scroll is allowed
						_("trigger_"+index_ref).scrollIntoView();
					}
					
					
				}
				index_ref++;
			
		}
		
		
		
		
	},
	
	save: function(){
		let save_data = {
			templates: template_player.templates,
			playerTabs: template_player.playerTabs	
		}
		
		localStorage.setItem("local_save", JSON.stringify(save_data));
		
		
	},
	load: function(predata=null){
		
		
		if(!this.firstTime){
			let prm = window.confirm("This will Overwrite current unsaved triggers? Continue");
			if(!prm){return};
		}
		
		
		
		
		let saves = localStorage.getItem("local_save");
		
		
		
		if(predata){
			
			let saved_name = JSON.parse(predata).name || "No name";
				saves = predata;
				
			
				
				_("local_save_name").value=saved_name;
		}
		
		try{
			saves = JSON.parse(saves);
			
			template_player.templates = saves.templates;
			template_player.playerTabs = saves.playerTabs;
			template_player.playingQue.length = 0;
			
			
			manual_template_manager.load_triggers();
			manual_template_manager.load_to_view();
			
			destroy_dia();
			
			this.firstTime = false;
			
		}catch(e){
			console.log("Problem loading saved");
			
		}
		
		
		
	},
	
	
	//Live_player_saves
	

	generate_save_tab: function(id, name){
		let frm = "<div class='saved_tab'>"+
			"<div class='saved_name'> "+ name.toLocaleString() +" </div> "+
			"<div class='saved_actions small'> "+
				"<div class='button_box button_xz' onclick=open_saved('"+id+"') > Open </div> "+ 
				"<div class='button_box button_xz' onclick=remove_saved_liveplayer('"+id+"')> Remove </div> "+
			"</div>"+
		"</div>";
		
		return frm;
	},
	
	saveToLocal: function(id=null){
		
		let save_data = {
			templates: template_player.templates,
			playerTabs: template_player.playerTabs,
			name: _("local_save_name").value,
		}
		
		let tosave =  JSON.stringify(save_data);
		
		
		
		if(id == undefined || id == null){
			live_player_saves.saves.push(tosave);
			localStorage.setItem("localSaves", JSON.stringify(live_player_saves));
			return;
		}
			
			live_player_saves.saves[id] = tosave;
			localStorage.setItem("localSaves", JSON.stringify(live_player_saves));
			return;
		
	},
	
	
	openOptionPane: async function(elm){
		//accepts the element who called the function 
		
		
		let playTabOptionCustom = "<div class='tab_player_options_main' id='playtabconfigOptions_' tabindex='0'>"+
		   "<div class='title_label big'>Play Tab Options </div>"+
		   "<hr class='dashed'>"+
		   "<div class='option_items_con'>"+
			  "<div class='big items_header'> Playback Modes: </div>"+
			  "<label for='playback_live_options'> Mode:  </label>"+
			  "<select class='plane_input primary_background primary_color' id='playback_live_options'>"+
				 "<option value='normal'> Normal </option>"+
				 "<option value='reverse' > Reverse on Stop </option>"+
			  "</select>"+
			  "<br />"+
			  "<label for='activation_live_options'> Activation:  </label>"+
			  "<select class='plane_input primary_background primary_color' id='activation_live_options'>"+
				 "<option value='toggle'> Toggle Key</option>"+
				 "<option value='press_hold'> Press and Hold Key </option>"+
			  "</select>"+
		   "</div>"+
		   "<div class='option_items_con'>"+
			  "<div class='big items_header'> Repeat Mode: </div>"+
			  "<label for='repeat_live_options'> Mode:  </label>"+
			  "<select class='plane_input primary_background primary_color' id='repeat_live_options'>"+
				 "<option value='loopstart'> Loop to start </option>"+
				 "<option value='once'> Play once </option>"+
				 "<option value='alternate'> Alternate </option>"+
			  "</select>"+
			  "<br />"+
		   "</div>"+
		   "<div class='option_items_con flexed'>"+
			  "<button class='button_box plane_input primary_color' onkeypress='manual_template_manager.saveConfig();destroy_dia();' onclick='manual_template_manager.saveConfig();destroy_dia();'> Save </button>"+
			  "<button class='button_box plane_input primary_color' onclick='destroy_dia()'> Cancel </button>"+
		   "</div>"+
		"</div>";
			
			let optwait = await createDialogue('custom', playTabOptionCustom);
			
			if(!optwait){
				console.warn("Error opening option panes");
				return false;
			}
			
			let indexOfStab = elm.getAttribute('tabdindex');
			this.selectedTabIndex = parseInt(indexOfStab);
			
			
			this.tab_selected = decople_data(template_player.playerTabs[this.selectedTabIndex]);
			
			
			if(this.tab_selected.playMode){
				_("playback_live_options").value = this.tab_selected.playMode;
			}		
			if(this.tab_selected.activation){
				_("activation_live_options").value = this.tab_selected.activation;
			}		
			if(this.tab_selected.repeat){
				_("repeat_live_options").value = this.tab_selected.repeat;
			}
			
			_("playtabconfigOptions_").focus();
			
			console.log("Tab Selected: ", indexOfStab);
			
			
		
		
	},
	
	
	openChannelPane: async function(elm){
		//accepts the element who called the function 
		
		
		let playTabOptionCustom = "<div class='tab_player_options_main' id='playtabconfigOptions_' tabindex='0'>"+
		   "<div class='title_label big'>Tab Channels Options </div>"+
		   "<hr class='dashed'>"+
		   "<div class='option_items_con'>"+
			  "<div class='big items_header'> Channel and Port: </div>"+
			  "<label for='channels_live_options'> Target Channels:  </label>"+
			  "<input type='text' class='plane_input primary_background primary_color' id='channels_live_options' placeholder='0,1,2..'/>"+
				
			  "<br />"+
			  "<label for='ports_live_options'> Target Port:  </label>"+
			  "<input type='text' class='plane_input primary_background primary_color' id='ports_live_options' placeholder='0,1,2..'/>"+
		   "</div>"+
		   "<div class='option_items_con'>"+
			  "<div class='big items_header'> Hot Key: </div>"+
			  "<label for='hotkey_live_options'> Key:  </label>"+
			  "<input type='text' class='plane_input primary_background primary_color' id='hotkey_live_options' placeholder='A'  maxlength='1'/>"+
			  "<br />"+
		   "</div>"+
		   "<div class='option_items_con flexed'><div class='button_box plane_input primary_color'>"+
			  "<div class='option_input' onclick='manual_template_manager.remove("+parseInt(elm.getAttribute('tabdindex'))+")'>Remove</div>"+
			  "<br />"+
		   "</div></div>"+
		   "<div class='option_items_con flexed'>"+
			  "<button class='button_box plane_input primary_color' onkeypress='manual_template_manager.saveChannelsConfig();destroy_dia();' onclick='manual_template_manager.saveChannelsConfig();destroy_dia();'> Save </button>"+
			  "<button class='button_box plane_input primary_color' onclick='destroy_dia()'> Cancel </button>"+
		   "</div>"+
		"</div>";
			
			let optwait = await createDialogue('custom', playTabOptionCustom);
			
			if(!optwait){
				console.warn("Error opening option panes");
				return false;
			}
			
			let indexOfStab = elm.getAttribute('tabdindex');
			this.selectedTabIndex = parseInt(indexOfStab);
			
			
			this.tab_selected = decople_data(template_player.playerTabs[this.selectedTabIndex]);
			
			
			if(this.tab_selected.target_channel.toString()){
				_("channels_live_options").value = this.tab_selected.target_channel;
			}		
			if(this.tab_selected.target_port.toString()){
				_("ports_live_options").value = this.tab_selected.target_port;
			}		
			if(this.tab_selected.hotkey.toString()){
				_("hotkey_live_options").value = this.tab_selected.hotkey;
			}
			
			_("playtabconfigOptions_").focus();
			
			console.log("Tab Selected: ", indexOfStab);
			
			
	
		
	},
	
	saveConfig: function(){
		//saves changes to the tab option config object
		
		if(!isEnterKey(event)){//shortcut enter key
			return;
		}
		
		this.tab_selected.playMode = _("playback_live_options").value;
		this.tab_selected.activation = _("activation_live_options").value;
		this.tab_selected.repeat = _("repeat_live_options").value;
		
		
		template_player.playerTabs[this.selectedTabIndex] = decople_data(this.tab_selected);
		
		manual_template_manager.update_trigger(this.selectedTabIndex);
		

		
		this.tab_selected = null;
		this.selectedTabIndex = null;
		
	},

	saveChannelsConfig: function(){
		//saves changes to the tab channels config object
		
		if(!isEnterKey(event)){//shortcut enter key
			return;
		}
		
		this.tab_selected.target_channel = _("channels_live_options").value;
		this.tab_selected.target_port = _("ports_live_options").value;
		this.tab_selected.hotkey = _("hotkey_live_options").value;
		
		
		template_player.playerTabs[this.selectedTabIndex] = decople_data(this.tab_selected);
		
		manual_template_manager.update_trigger(this.selectedTabIndex);
		
		
		this.tab_selected = null;
		this.selectedTabIndex = null;
		
	},

	
}

var live_player_saves;

function init_saves_live_player(){
	let saved_items = localStorage.getItem("localSaves");
	if(saved_items == null || saved_items == undefined){
		let localSaveTemplate = {'saves': []};
		localStorage.setItem("localSaves", JSON.stringify(localSaveTemplate));
		saved_items = localStorage.getItem("localSaves");
	}
	live_player_saves = JSON.parse(saved_items);
}



Object.seal(template_player);

let custom_form_lls = "<div class='live_player_load_main'> "+
	"<div class='title_label big'>Load Local Saves </div> "+
	"<div class='saved_tabs_con' id='saved_local_con'> "+
	"</div>"+
 "</div>";


//Open the Load List saves
async function openLocalSaves(refresh=false){
	if(!refresh){
		await createDialogue('custom', custom_form_lls);
	}
	
	let saves = live_player_saves.saves;
	let extId = 0;
	_("saved_local_con").innerHTML = "";
	for (item of saves){
		
		try{
		
		thisname = JSON.parse(item).name || "No name";
		
		_("saved_local_con").innerHTML += manual_template_manager
		.generate_save_tab(extId, thisname);
		
		}catch(e){
			
			console.log("Live Player-Local save: ", extId, "Seems to be empty, ignored." );
		}
		
		extId++;
	}

	
}



//Open The Selected Save
function open_saved(id){
	
	let saveData = live_player_saves.saves[id];
	
	if(saveData){
		
		manual_template_manager.load(saveData);
		template_player.opened_selected_save_id = id; //assign the id ref.
		command_reset_FilePath();
	}else{
		createDialogue('error', "<center>There is an error opening saved Data</center>");
		
	}
	
	
	
}


//Save the active Live Player to saves
function saveLocalTemplate(){
	
	if(template_player.templates.length <= 0){
			createDialogue('error', "<center>Live player is empty!</center>");
		console.log("No data to save!");
		return;
	}
	
	if(template_player.opened_selected_save_id >= 0){
		manual_template_manager.saveToLocal(template_player.opened_selected_save_id);
		
		createDialogue('info', "<center>Saved!</center>");
		return
	}
	
	manual_template_manager.saveToLocal();
	createDialogue('info', "<center>Saved!</center>");
	return
	
}

// The remove Logic for a saves
function remove_saved_liveplayer(id){
	if(!id){
		return false;
	}
	
	let cnf = window.confirm("Are you sure to remove this Save?");
	if(!cnf){return};
	
	live_player_saves.saves.splice(id,1);
	
	//removes orphan indexes
	live_player_saves.saves = live_player_saves.saves.filter(Boolean);
	localStorage.setItem("localSaves", JSON.stringify(live_player_saves));
	
	openLocalSaves(true);
	return;
	
	
	
}



init_saves_live_player();


//var temp_rail = setInterval(t_rail, 30) //Outputs 33 times a second;

let hasSentLast = false;
async function t_rail(){
	
	await template_player.playOn();
	
	if (!active){return};
	
	my_output = (output.join("|"));
	
	//Send it to the port
	

	
	//sendPort(0,my_output);
	//console.log(my_output);
	
	
}



// Extra


function activate_player(elm){
	
	if(active){
		active = false;
		
		elm.classList.remove("tog_active");
		elm.title = "Player not Active";
		
		elm.childNodes[1].innerText = "Off";
		
		
	}else{
		active= true;
		elm.classList.add("tog_active");
		elm.title = "Player is Active";
		elm.childNodes[1].innerText = "Active";
	}
		
	
}


// ========
// Extra End
// ========


//Helper Function for changing layout of the tabs
function layoutChange(){
	
	_("triggers_con").classList.toggle("simple");
	
	
}


//Helper Function for changing layout of the whole live panel
let isLiveFullScreen = false;
function layoutLiveFull(){
	
	isLiveFullScreen = _("v_con_2").classList.toggle("full_view_live");
	
	
}


//Generate info strip for data passed
function genInfoStrip(data){
	
	function make(elm){
		return document.createElement(elm);
	}
	
	let infoStrip = make("div");
		infoStrip.classList.add("info_strip");
		
		
		// Activation Icons
		
	let activations = make("div");
		activations.classList.add("data_icon");
		
		if(data["activation"] == 'press_hold'){
			activations.classList.add("press_icon");
			activations.title = "Activation: Stop on Key Release";
			
		}else{
			activations.classList.add("toggle_icon");
			activations.title = "Activation: Toggle Mode";
		}
		
			infoStrip.appendChild(activations);		
		
		// Playmode Icons
		
	let playModesIcon = make("div");
		playModesIcon.classList.add("data_icon");
		
		if(data["playMode"] == 'reverse'){
			playModesIcon.classList.add("play_reverse");
			playModesIcon.title = "Play Mode: Reverse on Stop";
			
		}else{
			playModesIcon.classList.add("play_normal");
			playModesIcon.title = "Play Mode: Normal";
		}
		
			infoStrip.appendChild(playModesIcon);		
			
			
		// repeatMode Icons
		
	let repeatModesIcon = make("div");
		repeatModesIcon.classList.add("data_icon");
		
		if(data["repeat"] == 'once'){
			repeatModesIcon.classList.add("repeate_once");
			repeatModesIcon.title = "Repeate Mode: Play Once";
			
		
		}else if(data["repeat"] == 'alternate'){
			repeatModesIcon.classList.add("play_alternate");
			repeatModesIcon.title = "Repeate Mode: Alternate";
			
		}else{
			repeatModesIcon.classList.add("play_tostart");
			repeatModesIcon.title = "Repeate Mode: Loop to Start";
		}
		
			infoStrip.appendChild(repeatModesIcon);		
			
			
			
		// Hotkey
		
	let hotkeys = make("div");
		hotkeys.classList.add("data_icon_hotkey");
		hotkeys.innerText = "Key: " + data.hotkey;
		hotkeys.title = "Hotkey: " + data.hotkey;
			
		
			infoStrip.appendChild(hotkeys);
		
	return infoStrip.outerHTML.toString();
}


//Open an Live Player Template File
function openLiveFile(){
		try{				
			window.chrome.webview.hostObjects.NativeObject.Open_File_LVjs();
		}catch(e){
		alert(e);				
	}
}



//Save Live Template Player to File
function save_LV_to_file(){
	
		let save_data = {
			templates: template_player.templates,
			playerTabs: template_player.playerTabs,
			name: _("local_save_name").value
		}
		
	try{	
		let to_transfer = encode(JSON.stringify(save_data));

			
		window.chrome.webview.hostObjects.NativeObject.put_data(to_transfer);	
		
	}catch(e){
				
		
	}
	
	command_save_LV();
	
}


//JS native interface 
function load_LV_from_file(file){
	try{
		let decoded = (decode(file));
		
		manual_template_manager.load(decoded);
		
	}catch(e){
		console.error(e);
	}
	

}


//Helper Function for saving to file
function command_save_LV(){
		try{				
			window.chrome.webview.hostObjects.NativeObject.Save_File_LVjs();
		}catch(e){
		alert(e);				
	}

	
}

//Helper Function for file path reset
function command_reset_FilePath(){
		try{				
			window.chrome.webview.hostObjects.NativeObject.resetPathLV();
		}catch(e){
				
	}

	
}




//Legacy content retriever helper
function retContVarOld(){
	let oldcon = localStorage.getItem("local_save");
	if(oldcon){
		
			live_player_saves.saves.push(oldcon);
			localStorage.setItem("localSaves", JSON.stringify(live_player_saves));
			localStorage.removeItem("local_save");
			console.log("Old saves loaded to new engine");
			return;	
	}
}

retContVarOld();


