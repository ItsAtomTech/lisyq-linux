const indexer = {
	
	timeline_templates: function(e){
		
		let keys  = (e.value);
		
		let all = _("content_con").children;
		
		for(cont of all){
			
			if(cont.title.toLowerCase().includes(keys.toLowerCase())){
				
				cont.style.display = "inline-block";
				
			}else{
				cont.style.display = "none";
				
			}
			
		}
		
		
		
		
	},		
	timeline_nested_scripts: function(e){
		
		let keys  = (e.value);
		
		let all = _("script_main").children;
		
		for(cont of all){
			
			if(cont.title.toLowerCase().includes(keys.toLowerCase())){
				
				cont.style.display = "inline-block";
				
			}else{
				cont.style.display = "none";
				
			}
			
		}
		
		
		
		
	},		
	timeline_templates_import: function(e){
		
		let keys  = (e.value);
		
		let all = _("content_con_import").children;
		
		for(cont of all){
			
			if(cont.title.toLowerCase().includes(keys.toLowerCase())){
				
				cont.style.display = "inline-block";
				
			}else{
				cont.style.display = "none";
				
			}
			
		}
		
		
		
		
	},	
	manual_templates: function(e){
		
		let keys  = (e.value);
		
		let all = _("manual_templates_con").children;
		
		for(cont of all){
			
			if(cont.title.toLowerCase().includes(keys.toLowerCase())){
				
				cont.style.display = "inline-block";
				
			}else{
				cont.style.display = "none";
				
			}
			
		}
		
		
		
		
	},
	
	
}





// Function Helper to disable native undo/redo to an input
function decup(e){
		let new_ =  e.target.cloneNode();
			let parent_N = e.target.parentNode;
				e.target.remove();
				parent_N.appendChild(new_);									
}


