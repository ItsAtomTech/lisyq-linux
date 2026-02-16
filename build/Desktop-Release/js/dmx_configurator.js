// DMX Configurator JS 
// Writen by Atomtech @ 2025
// v0.1

// =================
// Utilities
// =================

if(typeof(_) == 'undefined'){
   function _(elm){
		return document.getElementById(elm);
	}
}

if(typeof(make) == 'undefined'){
   function make(elm){
		return document.createElement(elm);
	}
}



function clone(obj) {
  try {
    return structuredClone(obj);
  } catch (e) {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (jsonError) {
      console.warn(jsonError);
    }
  }
}



//Main Vars 
let configs = [];
let options = {};

let SAVES = []; //stores the saves data
let selectedIndex = 0;
let selectedSaveIndex = undefined;

let hasChanges = true;

// ========================
//Constant data structure
// ========================

const CONFIG_DATA = {
	channel: 0,
	dmx_config:[],
} 


const OPTIONS_DATA = {
	name : "No name",
	date : undefined,
	type: "DX_CONFIG",
}

//====================
//Constants Ends here
//====================




const DMX_CONF = {
	mode: "add",
	loadAllSaved: function(){
		let saves = localStorage.getItem("DMX_SAVES");
		if(saves == null || saves.length <= 0){
			return;
		}
		
		try{
			SAVES.length = 0;
			SAVES = JSON.parse(saves);
		}catch(e){
			//
		}
		if(SAVES.length <= 0){
			console.log("Saves are empty.");
			return false;
		}
		
		this.loadSaveList();
		
		
	},
	
	//Add data to save items
	addToSaves: function(silent=false){
		let DataOptions = clone(OPTIONS_DATA);
		let configsData = clone(CONFIG_DATA);
		
		let data = {
			options: DataOptions,
			configs: configsData,
		}
		
		
		data.options.name = _("conf_save_name").value;
		data.configs = configs;
		
		
		if(selectedSaveIndex == undefined){
			SAVES.push(data);
		}else{
			SAVES[selectedSaveIndex] = data;
		}
		
		let saves = localStorage.setItem("DMX_SAVES", JSON.stringify(SAVES));
		silent == false ? createDialogue("info","<center> Changes Saved! </center>"): false;
		hasChanges = false;
		
		return selectedSaveIndex || SAVES.length;
	},
	
	//Will load a selected Saved data into list view and working variables.
	loadConfig: function(index){
		let targetIndex = undefined;
		if(typeof(index) == "object"){
			targetIndex = index.parentNode.getAttribute("index");
		}
		
		
		if(hasChanges && configs.length > 0){
			let cf = confirm("Are you sure to load another save? Unsaved changes would be lost.");
			if(!cf){
				return console.log("Load Aborted!");
			}
		}
		
		configs = clone(SAVES[targetIndex].configs);
		options = clone(SAVES[targetIndex].options);
		
		_("conf_save_name").value = options.name;
		
		this.renderConfigs();
		this.clearAllEditTabs();
		
		selectedSaveIndex = targetIndex;
		
		showLoadList(true);
		
	},
	
	renderConfigs: function(){
		
		_("configs_tab_section").innerHTML = "";
		
		for(let z = 0; z < configs.length;z++){
			let confData = configs[z];
			let config_tab_template = _("config_tab_template").cloneNode(true).content;
			
			if(!confData){
				return false;
			}
			
			let channel_config = (config_tab_template.querySelector('[tag="channel_config"]'));
			
			let dmx_config = (config_tab_template.querySelector('[tag="dmx_config"]'));
			
			let remove_thistab = (config_tab_template.querySelector('[tag="remove_thistab"]'));
			
			
			channel_config.innerText = confData.channel;
			
			for(each of confData.dmx_config){
				let pods = make('span');
					pods.innerText = each.type + each.target;
					pods.title = this.getFeatureNameByChar(each.type);
					dmx_config.appendChild(pods);
			}
			
			remove_thistab.setAttribute("index", z);
			dmx_config.setAttribute("index", z);
			
			_("configs_tab_section").appendChild(config_tab_template);
			
			
		}
		
		
	},
	
	removeThisConfig: function(index){
		let targetIndex = undefined;
		if(typeof(index) == "object"){
			targetIndex = index.parentNode.getAttribute("index");
		}
		
		if(
			!window.confirm("Are you sure to remove this Config?")
		){
			return;
		}
		SAVES.splice(targetIndex,1);
		this.loadSaveList();
		localStorage.setItem("DMX_SAVES", JSON.stringify(SAVES));
		
	},
	
	
	removeThistab: function(elm){
		let ownindex = elm.getAttribute("index");
		
		let confirmDelete = confirm("Are you sure to remove this item?");
		if(!confirmDelete){
			return;
		}
		configs.splice(ownindex,1);
		this.renderConfigs();
		hasChanges = true;
	},
	
	//helper function for position
	getFeatureNameByChar: function (char) {
		const featureMap = {
			c: "Color",
			p: "Position",
			f: "Fader",
			a: "Feature A",
			b: "Feature B",
			d: "Feature D",
			e: "Feature E",
			g: "Feature G",
			h: "Feature H",
			i: "Feature I",
			j: "Feature J",
			k: "Feature K"
		};

		return featureMap[char] || "Unknown Feature";
	},
		
		
	// ===============================	
	//Configurator Logic Goes Down here
	// ===============================	
	
	openConfigWindow: function(edit=false){
		_("configModal").showModal();
		_("configModal").addEventListener("cancel", this.closeDefaultModal);
		if(edit){
			this.mode = "edit";
		}else{
			this.mode = "add";
		}
		
	},
	
	openForEdit: function(elm){
		let index = elm.getAttribute("index");
		selectedIndex = index;
		let confData = configs[selectedIndex];
		
		this.clearAllEditTabs();
		for(each of confData.dmx_config){
			this.addConfigEdit(each);
		}
		
		this.openConfigWindow(true);
		_("conf_channel").value = confData.channel;
		
	},
	
	
	closeDefaultModal: function(){
		console.log("Cancel event triggered");
		event.target.close();
	},	
	
	
	closeModal: function(){
		_("configModal").close();		
	},
	
	// Save or Add the Config data into Config array
	save_ConfigEdits: function(){
		let stab_container = _('configs_input');
		let elm_collections = (stab_container.getElementsByClassName("config_div"));
		let configData = clone(CONFIG_DATA);
		
		for(each of elm_collections){
			
			let select_type = each.querySelector('[tag="ctype"]');
			let targetc = each.querySelector('[tag="target"]');
			let channel = _("conf_channel");
			
				configData.channel = channel.value;
			
			
			let objectConf = {
				type: select_type.value,
				target: targetc.value,
			}
			
			configData.dmx_config.push(objectConf);
		}
		
				
		if(this.mode == "add"){
			configs.push(configData);
		}else{
			configs[selectedIndex] = configData;
		}
		
		_("conf_channel").value = 0;
		this.renderConfigs();
		this.clearAllEditTabs();
		this.closeModal();
		hasChanges = true;
		
	},
	
	resetAsNew: function(){
				
		if(hasChanges && configs.length > 0){
			let cf = confirm("Are you sure to make a new one? Unsaved changes would be lost.");
			if(!cf){
				return console.log("Load Aborted!");
			}
		}
		
		configs.length = 0;
		options = clone(OPTIONS_DATA);
		
		this.renderConfigs();
		this.clearAllEditTabs();
		_("conf_save_name").value = options.name;
		selectedSaveIndex = undefined;
		
		
	},
	
	
	// ===========================
	//Config Editor Section
	// ===========================
	
	
	//Adds the Config tab into the editor, if data is passed, it puts the value as well
	addConfigEdit: function(data){
		let tabs_container = _("configs_input");
		let configs_input_template = _("configs_input_template").cloneNode(true);
			if(data !=undefined){
				
				let select_type = (configs_input_template.content.querySelector('[tag="ctype"]'));
				let target = (configs_input_template.content.querySelector('[tag="target"]'));
				
				if(data.type) select_type.value = data.type;
				if(data.target) target.value = data.target;				
			}
		tabs_container.appendChild(configs_input_template.content);
	},
	
	
	removeInputTabSelf: function(elm){
		elm.parentNode.remove();
	},
	
	
	clearAllEditTabs: function(){
		let tabs_container = _("configs_input");
		tabs_container.innerHTML = "";
		
	},
	
	
	// =====================
	// Config Loader Logics
	// =====================
	
	loadSaveList: function(){
		
		let saved_container = _("saved_local_con");
		saved_container.innerHTML = "";
		for(let s = 0; s < SAVES.length; s++){
			let save_tab_template = _("save_tab_template").cloneNode(true).content;
			
				let save_name = (save_tab_template.querySelector('[tag="save_name"]'));
				save_name.innerText = SAVES[s].options.name
				
				let index_refrence = (save_tab_template.querySelector('[tag="index_refrence"]'));
				index_refrence.setAttribute("index", s);
			
			saved_container.appendChild(save_tab_template);
			
		}
		

		
	},
	
	
	//===============================
	//Importing and Exporting Saves	
	//===============================
	
	
	exportConfig: function(){
		
		let data = {
			'options': options,
			'configs': configs,
		}
		
		if(!configs.length >= 1){
			return;
		}
		
		
		data = JSON.stringify(data);
		let filename = options.name + ".dmxp"; 

		let blob = new Blob([data], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		
		link.href = url;
		link.download = filename;
		document.body.appendChild(link); // necessary for Firefox
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url); // clean up
		console.log("Data have been Exported");
	},
	
	
	//import data from a save file
	importConfig: function() {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".dmxp,.json"; 

		input.onchange = function(event) {
			const file = event.target.files[0];
			if (!file) return;

			const reader = new FileReader();
			reader.onload = function(e) {
				const content = e.target.result;
				console.log("File Content Loaded!");
				
				try{
					let data = JSON.parse(content);
					selectedSaveIndex = undefined;					
					configs = data.configs;
					options = data.options;
					_("conf_save_name").value = options.name;
					
					selectedSaveIndex = SAVES.length;
					
					DMX_CONF.addToSaves(true);
		
					DMX_CONF.renderConfigs();
					DMX_CONF.clearAllEditTabs();
					
				}catch(e){
					//--
					console.log(e);
				}
				console.log(content);
				
			};
			reader.readAsText(file);
		};
		input.click(); // trigger the file picker
	},
	
	
	
}




const CONFIG_WRITER = {
	
	port: undefined,
	writer: undefined, // <- store the writer
	encoder: undefined, // <- store encoder for reuse
	isUploading: false,
	
  connectPort: async function (elm) {
	if (!("serial" in navigator)) {
	  alert("Web Serial API not supported in this browser.");
	  return;
	}
	
	//If already connected, prompt.
	
	if (this.port && this.port.readable && this.port.writable) {
	  const shouldDisconnect = window.confirm("Disconnect and select another?");
	  if (shouldDisconnect) {
			await this.port.forget();
	  }else{
		  return false;
	  }
	}
				
				
	try {
	  this.port = await navigator.serial.requestPort();
	  await this.port.open({ baudRate: 115200 });

	  console.log("Connected to serial port at 115200 baud!");
	if(typeof(elm) == "object"){
		elm.title = "Connected to a port";
	}
		
	  // Set up writer ONCE
	  this.encoder = new TextEncoderStream();
	  this.encoder.readable.pipeTo(this.port.writable);
	  this.writer = this.encoder.writable.getWriter();

	  // Reader (optional)
	  const textDecoder = new TextDecoderStream();
	  this.port.readable.pipeTo(textDecoder.writable);
	  const reader = textDecoder.readable.getReader();

	  while (true) {
		const { value, done } = await reader.read();
		if (done) break;
		if (value) this.receiver(value);
		
		
		
	  }

	  reader.releaseLock();
	} catch (err) {
	  console.error("Error:", err);
	}
  },


  sendData: async function (data) {
	if (!this.writer) {
	  console.error("Writer not available! Connect to the port first.");
	  return;
	}

	await this.writer.write(data + "\n");
	console.log("->:", data);
  },
  
  
  
  receiver: function(data){
	console.log(data);

	if(data.indexOf("ER-Config") >= 0 && this.isUploading){
		console.log("Error uploading");
		createDialogue("info", "<center> Failed to upload Config! </center>");
		this.isUploading = false;

	}else if(data.indexOf("Saving:" && this.isUploading)){
		createDialogue("info", "<center> Config have been written </center>");
		this.isUploading = false;
	}

	  
	  
	  
  },
	
	
		
	// ========================	
	// Config Generator Logics	
	// ========================	
		
	uploadConfig: function(){
		let confData = this.generateDXCommand();
		if(confData){
			this.isUploading = true;
		}
		
		this.sendData(confData);
	},	
	
	 generateDXCommand: function(){
		const channelList = [];
		const configStrings = [];
		let configCounts = 0;

		if(configs.length <= 0){
				return false;
		}


		for (const item of configs) {
		channelList.push(item.channel);

		const configPart = item.dmx_config
		  .map(cfg => `${cfg.type}${cfg.target}`)
		  .join('|');

		configStrings.push(configPart);
		configCounts = configs.length;
		}

		const dxString = `DX-${channelList.join(',')}:${configStrings.join(',')}:${configCounts}`;
		return dxString;
	}	
};



//Misc function

function showLoadList(hide = false){
	if(hide){
		DMX_CONF.loadAllSaved();
		_("saves_loader").classList.add("hidden");
	}else{
		_("saves_loader").classList.remove("hidden");
		
	}
}


function closeConfigurator(){
	
	  if(hasChanges && configs.length > 0){
		  let cf = confirm("Are you sure to exit? Unsaved changes would be lost.");
		  if(!cf){
			  return console.log("Exit Aborted!");
		  }
	  }
  
	if(CONFIG_WRITER.port){CONFIG_WRITER.port.forget();
	};
	sendTo("close_configurator","");
	
}




//For Communicating into LiSyQ main
function sendTo(fn,data){
	window.parent.postMessage({
    'func': fn,
    'message': data
}, "*");

} 



//Try load all saves to list and Memory
DMX_CONF.loadAllSaved();


// DMX_CONF.openConfigWindow();
DMX_CONF.addConfigEdit();







