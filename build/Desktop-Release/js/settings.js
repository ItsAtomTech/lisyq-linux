
var s;

const settings = {
	
	//collections of settings defined, add settings at this object
	default_values:{
		includeData: false,
		followMode: 'normal', //values: normal, page
	},



		//Get the value of the settings stored
	get:function(name){
		let stored_settings = localStorage.getItem("settings");	
		if(stored_settings == null || stored_settings == ""){
			var ints = JSON.stringify(this.default_values);		
			localStorage.setItem("settings",ints);
			stored_settings = localStorage.getItem("settings");
		}
		
		stored_settings = JSON.parse(stored_settings);
		return stored_settings[name];

	},
	
		//Store the settings of 'name' with the value of 'val'
	set: function(name,val){
		let stored_settings = localStorage.getItem("settings");	
		if(stored_settings == null || stored_settings == ""){
			var ints = JSON.stringify(settings.default_values);	
			localStorage.setItem("settings",ints);
			stored_settings = localStorage.getItem("settings");
		}	
		
		if(settings.default_values[name] == undefined || settings.default_values[name] == null){
			
			return console.warn("Setting: ", name, "Is not Defined on values");
		}
		
		stored_settings = JSON.parse(stored_settings);
		
			
		stored_settings[name] = val;	
			
		var to_store = JSON.stringify(stored_settings);
		return localStorage.setItem("settings",to_store);	
	},




}

//Helper Functions

function returnChecked(bool){	

	if(bool == true){ return "checked" }else{ return "" };
	
}

function getColorCurrent(){
	let scriptColor =  fileOptions.color ? fileOptions.color : "";
	return scriptColor;
	
	
}




//Views

let Settingsdia =  {

	
	includeData: function(){ return "<div class='dai_title'><b>Project Options and Settings</b></div>"+
		"<hr class='dashed'>"+
		"<div class='option_row'>"+
			
			"<div class='option_title'>Include Generated Data on Save:  <input class='chk' type='checkbox' onchange='dataIncluded(this.checked)' "+
			
			 returnChecked(settings.get('includeData'))
			
			+"/> </div>"+
			"<div class='option_info small'> Generated data from Plugins would not be removed upon saving, this would incure larger file sizes in the process, but would make the Project usable even if plugins where not present on the playing device (for playing only), recomended to be off. </div>"+
			
		"</div>"+
		
		"<hr class='dashed'>"
		},
		
		
		
	colorScriptProfile: function(){ return "<div class='dai_title'><b>Project Configuration</b></div>"+
		"<hr class='dashed'>"+
		"<div class='option_row'>"+
			
			"<div class='option_title'>Script Custom Color:  <input class='clr' type='color' title='Option is Saved Upon selecting.' onchange='projectScriptColor(this.value)' value='"+
			
			 getColorCurrent()
			
			+"' /> </div>"+
			"<div class='option_info small'> This Color scheme will be used on Other Views like in the Nest.in Player to help distinguish script files or for customization </div>"+
			"<div class='option_info small'>Other option such as to use pictures or Album arts would be implemented soon, there are many things to consider for this before it can happen.</div>"+
			
		"</div>"+
		
		"<hr class='dashed'>"
		},
	

}


// Other Functions and Configurations

function showTimelineScriptOptions(){
	
	createDialogue('scriptsettings');
	

}




//Added

let shortcutsDia = {
	
	shortcutTips: function(){ return "<div class='dai_title'><b>Shortcut Key Tips </b></div>"+
		"<hr class='dashed'>"+
		"<div class='option_row clamped'>"
			
			
			+"<div class='medium center full_width'> Group and Selections </div> </br> "+
			"<div class='normal shortcut_con'>  "+
				"<b> Ctrl + Click </b> - Select Multiple." 
			+"</div> "+		
			
			"<div class='shortcut_con normal'>  "+
				"<b> Ctrl + Drag Click </b> - Start Drag Selection." 
			+"</div>"+	
			
			"<div class='shortcut_con normal'>  "+
				"<b> Shift + Click </b> - Select grouped items on current track." 
			+"</div>"+	

			
			"<div class='shortcut_con normal'>  "+
				"<b> Ctrl + Shift + Click </b> - Select grouped items on all the tracks." 
			+"</div>"+
			
	
			"<div class='option_info padded small'> * The above items are applicable on the Timeline editor</div>"+
			
			
			"<div class='medium center full_width'> File Operations </div> </br> "+

			"<div class='shortcut_con normal'>  "+
				"<b> Ctrl + S </b> - Save to file" 
			+"</div>"+

			"<div class='shortcut_con normal'>  "+
				"<b> Ctrl + O </b> - Open file" 
			+"</div>"+

			"<div class='shortcut_con normal'>  "+
				"<b> Ctrl + Q </b> - Open ports" 
			+"</div>"+

			"<div class='shortcut_con normal'>  "+
				"<b> Ctrl + V </b> - Paste content" 
			+"</div>"+

			"<div class='shortcut_con normal'>  "+
				"<b> Ctrl + C </b> - Copy content" 
			+"</div>"+


			"<div class='medium center full_width'> Playback </div> </br> "+

			"<div class='shortcut_con normal'>  "+
				"<b> Space </b> - Play / Pause" 
			+"</div>"+

			"<div class='shortcut_con normal'>  "+
				"<b> Any Key </b> - Manual play assigned template (Manual Player)" 
			+"</div>"+


			"<div class='medium center full_width'> Editing Shortcuts </div> </br> "+

			"<div class='shortcut_con normal'>  "+
				"<b> Ctrl + Z </b> - Undo an action on Timeline" 
			+"</div>"+

			"<div class='shortcut_con normal'>  "+
				"<b> Ctrl + Y </b> - Redo an action on Timeline" 
			+"</div>"+

			"<div class='shortcut_con normal'>  "+
				"<b> T </b> - Edit track channel" 
			+"</div>"+

			"<div class='shortcut_con normal'>  "+
				"<b> P </b> - Edit track port" 
			+"</div>"+

			"<div class='shortcut_con normal'>  "+
				"<b> Shift + M </b> - Add marker" 
			+"</div>"+

			"<div class='shortcut_con normal'>  "+
				"<b> Shift + = </b> - Zoom in on Timeline" 
			+"</div>"+

			"<div class='shortcut_con normal'>  "+
				"<b> Shift + - </b> - Zoom out on Timeline" 
			+"</div>"+
			
		"</div>"+
		
		"<hr class='dashed'>";
		
	},
	
	
	
	
}

function showShortcutTips(){
	createDialogue('shortcutTips');
	
	

}

