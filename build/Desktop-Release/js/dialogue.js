var shown = false;
var created = false;
function createDialogue(type,data){
	var body = document.body;
		if(shown){destroy_dia();};
	var dia = document.createElement('div');
		dia.className = "dialogue_con primary_color";
		dia.setAttribute('id','dai_con');
		
		
		
	var decor_con = document.createElement("div");
		decor_con.className = "decor_card_ secondary_background";
	var decor_1 = document.createElement("div");
		decor_1.className = "decor_1_bot secondary_background";
	var decor_2 = document.createElement("div");
		decor_2.className = "decor_2_bot secondary_background";
	decor_con.appendChild(decor_1);
	decor_con.appendChild(decor_2);

	dia.appendChild(decor_con);
		
		
		switch(type){
		
		case "time_jump":
				dia.innerHTML = "<div class='dialogue_box primary_background'><span class='close_dia primary_color' onclick='destroy_dia()'>&times;</span>"+ 
				 "<div class='dai_title'>Jump to Time: (HH:mm:ss) </div>"+
					"<hr class='dashed'>"+
				 "<div class='input_bar_con'>"+
					"<input type='number' class='time_input' min='00' max='3' value='00' id='jump_h'> : <input type='number' class='time_input' min='00' max='59' value='00' id='jump_m'> : <input type='number' min='00' max='59' value='00' class='time_input' id='jump_s'>"+ 
					
					"</div><div class='button_box go_button' onclick='jump_to_time()'> Go </div></div>";
		
			created = true;
		break;	


		
		case "edit_track":

		
			dia.innerHTML = "<div class='dialogue_box primary_background'><span class='close_dia primary_color' onclick='destroy_dia()'>&times;</span> <div class='dai_title primary_color'>"+" Track Options "+"</div> <hr class='dashed'>"+ 
			
			"<div class='option_item_con'> <b>Track #: </b><span class=''> "+selected_track_index+" </span> </div>"+
			
			"<b> Target Channel #. : </b> <input type='number' value="+data.channel+" max=2000 min=0 class='time_input' id='t_channel_input' onchange='this.value = capInput(parseInt(this.value), this.min,this.max);' onmousewheel='this.value'><hr>"+
				
			"<div class='option_item_con'><b> Port Channel #. : </b> <input type='number' value="+data.port+" max=254 min=0 class='time_input' id='p_channel_input' onchange='this.value = capInput(parseInt(this.value), this.min,this.max);' onmousewheel='this.value'>"+ 
			 
			"<hr class='dashed'> <div class='button_box go_button' onclick='save_port_conf()'> Apply </div>"+
			"<p><sub> <b>Port Channel</b> is the index of the COM port for which this track will send it's output to. <b>Target Channel</b> is the channel for which this track will send its output into.</sub></p></div>"
			
			+" </div>"
		
			created = true;
		break;		
		

				
		case "confirmRemove":
			
			
			let dataID = data.tabID;
			let message = data.message;
		
	
			dia.innerHTML = "<div class='dialogue_box primary_background'><span class='close_dia primary_color' onclick='destroy_dia()'>&times;</span> <span class='dai_title primary_color'>"+ "Confirm Remove" +"</span> <hr class='line_2'>"+ 
			"<div class='confirm_message_info'>"+message+"</div>"
			+"<div class='confirm_buttons_box'> <button class='button_box button_xz warn_background primary_color' onkeypress='manual_template_manager.remove(\""+dataID+"\", 1);destroy_dia();' onclick='manual_template_manager.remove(\""+dataID+"\", 1);destroy_dia();' selected> Delete </button>"
			+"<button class='button_box button_xz primary_background primary_color' onclick='destroy_dia()'> Cancel </button> </div>"
			
			+" </div>";		
			created = true;
		break;	


		
		
				case "wait":
		
			dia.innerHTML = "<div class='dialogue_box primary_background'><span class='close_dia primary_color' onclick='destroy_dia()'>&times;</span> <span class='dia_title primary_color'> Working ... Please wait</span> <hr class='line_2'> </div>"
		
			created = true;
		break;	
		case "error":
		
			dia.innerHTML = "<div class='dialogue_box primary_background '><span class='close_dia primary_color' onclick='destroy_dia()'>&times;</span> <span class='dia_title primary_color'> "+data+"</span> <hr class='line_2'> </div>"	
		case "info":
		
			dia.innerHTML = "<div class='dialogue_box primary_background '><span class='close_dia primary_color' onclick='destroy_dia()'>&times;</span> <span class='dia_title primary_color'> "+data+"</span> <hr class='line_2'> </div>"
		
			created = true;
		break;
		case "custom" :
		
			dia.innerHTML = "<div class='dialogue_box primary_background'><span class='close_dia primary_color' onclick='destroy_dia()'>&times;</span>  "+data+" </div>"	
				
			created = true;
		break;
		
		case "settings" :
		
			dia.innerHTML = "<div class='dialogue_box primary_background'><span class='close_dia primary_color' onclick='destroy_dia()'>&times;</span>  "+Settingsdia.includeData()+" </div>"	
				
			created = true;
		break;	
		
		case "scriptsettings" :
		
			dia.innerHTML = "<div class='dialogue_box primary_background'><span class='close_dia primary_color' onclick='destroy_dia()'>&times;</span>  "+Settingsdia.colorScriptProfile()+" </div>";	
				
			created = true;
		break;
		
		
		default:
			
			console.log(type + " dialog not known");
			setTimeout(destroy_dia, 500);
			return false;
		break;
		
		}
		
		
		
		
		
		if(created){
			shown = true;
			body.appendChild(dia);
		}
	
	return true;
}






function destroy_dia(){
	var dia = document.getElementById('dai_con');
	try{
		dia.remove();
		shown = false;
	}catch(e){
		//
	}
}