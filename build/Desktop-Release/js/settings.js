
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

