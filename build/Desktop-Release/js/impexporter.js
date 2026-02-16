


const impexp = {
	selected_items: [],
	all_items: [],
	init:async function(){
		
		
   _('templates_file_picker').addEventListener('change', function() {
              
            var fr=new FileReader();
            fr.onload=function(){
			  impexp.loadImport(fr.result);
            }
		  
			fr.readAsText(this.files[0]);
           
			 //
        })
		
		
	},
	
	
	
	
	choose_file_import: function(){
		
		if(window.isEnterKey(event) == false){	
			return;		
		};
		
		_("templates_file_picker").click();
		
		
		
	},
	

	generate_templates_blocks: function(tl_data,id){
	
		
		var template_thumb = document.createElement("div");
			template_thumb.classList.add("template_thumb");
			template_thumb.style.backgroundColor = tl_data.color+"d5";
			template_thumb.title = tl_data.name + "\nType:" + tl_data.type ;
			template_thumb.setAttribute("template_id",id);
			template_thumb.setAttribute("onclick","impexp.selection("+id+",this)");
			
			
			
		var template_thumb_name = document.createElement("div");
			template_thumb_name.classList.add("plug_thumb_name");
			template_thumb_name.innerHTML = tl_data.name;
			template_thumb.appendChild(template_thumb_name);
			
		
		_("content_con_import").appendChild(template_thumb);
		
	},


	loadImport: function(ef){
		_("content_con_import").innerHTML = "";
		this.selected_items.length = 0;
		this.all_items.length = 0;
		let file_load;
		
		
		try{
			file_load = JSON.parse(ef);
						// JSON parse after getData and decoded
			file_load = JSON.parse(decode(file_load.templates));
		}catch(e){
						// JSON parse after Decoded then getData
			file_load = (JSON.parse(decode(ef)).templates);
		}

	
			this.all_items = file_load;
			
		for(plg = 0; plg < file_load.length;plg++){
			
			impexp.generate_templates_blocks(file_load[plg],plg);
			// console.log(plg);
		}

	},
	
	
	selection: function(id,elm){
		//Selecting elm from templates importer
		let isSelected = elm.classList.toggle("selected");
		
		// console.log(isSelected);
		
		
		
	},
	selectAll: function(){
		if(window.isEnterKey(event) == false){	
			return;		
		};
		
		let ttmb = _("content_con_import").getElementsByClassName("template_thumb");
		
		for(th of ttmb){
			
			//select only visible (eg. search results only)
			if(th.checkVisibility()){
				th.classList.add("selected");
			}
			
			
		}
		
		
		
		
	},
	clearAll: function(){
		if(window.isEnterKey(event) == false){	
			return;		
		};
		
		
		let ttmb = _("content_con_import").getElementsByClassName("template_thumb");
		
		for(th of ttmb){
			
			th.classList.remove("selected");
		}
		
		
	},
	
	//Import the selection into Templates
	importNow: function(){
		let selections = _("content_con_import").getElementsByClassName("selected");
		
		
		
		if(window.isEnterKey(event) == false){
			return;
		}
		this.selected_items.length = 0;
		
		for (item of selections){
			let sel_id = item.getAttribute("template_id");
			
			this.all_items[sel_id].content = this.all_items[sel_id].data;
			this.selected_items.push(this.all_items[sel_id]);	
			add_to_templates(this.all_items[sel_id]);
		}
		
		destroy_dia();
		
	}
	
	
}


function isEnterKey(evw){

	if(evw.type == 'keypress' && evw.code == 'Enter'){
		return true;
	}else if(evw.type != 'keypress'){
		return true;
	}
	return false;
}


async function openImportTemplates(){
	
	let das = 
"<div class='importer_main_con'>"+
	"<div class='search_bar importtime_templates_search'>"+		
			"<input type='search' class='search_input primary_background primary_color' placeholder='Search...' id='_ttemp' onchange='decup(event)' oninput='indexer.timeline_templates_import(this)'>"+
	"</div>"+

	"<div class='window_title small'> Import Templates </div>"+

	"<div class='row_devide_importer'>"+
	
		"<div id='content_con_import' class='content_con'></div>"+
		"<div id='' class='content_con_options'>"+
			"<input type='file' id='templates_file_picker' class='hidden' accept='.lsys, .txt, .json, .lytemp' title='Open an lsys file'/>"+
			
			"<div class='button_box choose_file' onclick='impexp.choose_file_import()' onkeypress='impexp.choose_file_import()' tabindex='0'>  Choose File </div>"+
			
			
			
			"<hr class='dashed'>"+
				
					"<div class='button_box choose_file' onclick='impexp.selectAll()' onkeypress='impexp.selectAll()'  tabindex='0'>  Select All </div>"+
					
					"<div class='button_box choose_file' onclick='impexp.clearAll()' onkeypress='impexp.clearAll()'  tabindex='0'>Clear Sel.</div>"+
				
			"<hr class='dashed'>"+
		
				"<div class='button_box choose_file big' onclick='impexp.importNow()'  onkeypress='impexp.importNow()'  tabindex='0'>  Import </div>"+
				
		"</div>"+	
	"</div>"+
"</div>";

	
	
	await createDialogue('custom',das);	
	impexp.init();
	
	
}
