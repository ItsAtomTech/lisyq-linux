var ambient_time_line = [];

var colors_array = [];//store generated data temp
var ambient_pixel_length;



//Effects Vars

var ambient_pulse_effect = false;
var ambient_strobe_effect = false;
var other_effect;


var	ambient_fade_counter = 1;
var	ambient_fade_amount = 1;
var ambient_effect_len = 1;


var	keyframe_ambient_fade_counter = 1;
var	keyframe_ambient_fade_amount = 1;
var keyframe_ambient_effect_len = 1;

//Effect Vars End


//called by the timeline for regeneration
function ambient_main(data){
	
	var delinked = JSON.parse(data);
	
	return ambient_generate_data(delinked);
}

//regeneration function
function ambient_generate_data(data){
	ambient_fade_amount = 1;
	ambient_fade_counter = 1;
	beating_ambient_effect.reset_clk();
	
	keyframe_ambient_fade_counter = 1;
	keyframe_ambient_fade_amount = 1;
	
	ambient_time_line = JSON.parse(data.raw_data_points);
	ambient_pixel_length = data.seconds_length * 33;
	ambient_effect_len = data.effect_len;
	ambient_activate_effect(data.effect);
	
	
	colors_array.length = 0;
	
	
	ambient_calculate_data();
	
	
	return colors_array;
}






	
function ambient_calculate_data(){
	
	for(sd = 0;sd <= ambient_pixel_length;sd++){
		
		colors_array[sd] = "000000";
		
		for(tl = 0;tl < ambient_time_line.length;tl++){
		
		
		
		
		if(ambient_time_line[tl].start_at*33 <= sd && sd <= ambient_time_line[tl].end_at*33){
						
		
				
				var start_color_array = ambient_split_solor(ambient_time_line[tl].color_start);
				var end_color_array = ambient_split_solor(ambient_time_line[tl].color_end);
						
				var keyframe_ambient_effect = "none";		
						
				var cind = 0;
				var calculated_color = 	[];
				while(cind < start_color_array.length){
					
					var x = parseInt(start_color_array[cind], 16);
					var y = parseInt(end_color_array[cind], 16);
					var w = sd - ambient_time_line[tl].start_at*33;
					var z = parseInt(ambient_time_line[tl].end_at*33) - ambient_time_line[tl].start_at*33;
					
					calculated_color[cind] = normalize_ambient(linear_flow(x,y,z,w));
					
					
					
					
										
					//keyframe effect is applied here
			try{	
					keyframe_ambient_effect = ambient_time_line[tl].keyframe_ambient_effect;
					
					
					
					keyframe_ambient_effect_len = parseFloat(ambient_time_line[tl].keyframe_ambient_effect_len);
					
					
						if(keyframe_ambient_effect == "pulse"){
						
							calculated_color[cind] = normalize_ambient(parseInt(calculated_color[cind]*pulsed_ambient(keyframe_ambient_effect_len,true)));
							
							
						
							
							
						
						}else if(keyframe_ambient_effect == "strobe"){
						
							calculated_color[cind] = parseInt(calculated_color[cind]*strobed_ambient(keyframe_ambient_effect_len,true));
						
						}				
					
					
	
					
					

					
					
				}catch(e){
						console.log(e);
				}		
					
					
					
					
					
					//global effects are applied here
					
					
					var bypass_global_effect = ambient_time_line[tl].bypass_global_effect;
					
				if(bypass_global_effect != true){
					
						if(ambient_pulse_effect == true){
						
							calculated_color[cind] = normalize_ambient(parseInt(calculated_color[cind]*pulsed_ambient(ambient_effect_len)));
						
						}else if(ambient_strobe_effect == true){
						
							calculated_color[cind] = parseInt(calculated_color[cind]*strobed_ambient(ambient_effect_len));
						
						}else if(other_effect == "beating"){
							
							calculated_color[cind] = parseInt(calculated_color[cind]*beating_ambient_effect.get_beat(ambient_effect_len/33));
							
							
							
						}
						
						
						// Add global effects at this chain
						
					}
					
					cind++;
				}
				
				colors_array[sd] = ambient_combined_hex(calculated_color);
										
					}		
			
		}
		

		//keyframe specific effects
						
				
		if(keyframe_ambient_effect == "pulse" || keyframe_ambient_effect == "strobe"){
			
			if(keyframe_ambient_fade_counter < 1 || keyframe_ambient_fade_counter > keyframe_ambient_effect_len){
				
				keyframe_ambient_fade_amount = -keyframe_ambient_fade_amount;
				
			}
			
			keyframe_ambient_fade_counter = keyframe_ambient_fade_counter+keyframe_ambient_fade_amount;
			
		}
	
		
		// global effect counters and tickers
		
		
		if(ambient_pulse_effect == true){
			
			if(ambient_fade_counter < 1 || ambient_fade_counter > ambient_effect_len){
				
				ambient_fade_amount = -ambient_fade_amount;
				
			}
		}
		
		
		if(ambient_strobe_effect == true){
			
			if(ambient_fade_counter < 1 || ambient_fade_counter > ambient_effect_len){
				
				ambient_fade_amount = -ambient_fade_amount;
				
			}
			
		}
		
		if(other_effect == "beating"){
			
			beating_ambient_effect.beat(ambient_effect_len/33);
			
		}
		
		
		

		
		
		
		ambient_fade_counter = ambient_fade_counter+ambient_fade_amount;
		
		
		
	}

	

}	






function linear_flow(x,y,z,w){
	return x+((y-x)*(w/z));		
}



function ambient_combined_hex(fg){	
	var bvx = 0;	
	var col_ar = [];
	while(bvx < fg.length){		
		col_ar[bvx] = ambient_format_zero(parseInt(fg[bvx]).toString(16));		
		bvx++;
	}
	return col_ar.join("");
}







function ambient_split_solor(cl){	
	var col_ar = [];	
	try{	
		for(cls = 0; cls < 3;cls++){		
			col_ar[cls] = cl[cls*2]+cl[(cls*2)+1]		
		}
		
	}catch(e){		
		col_ar = [00,00,00];		
	}	
	return col_ar;	
}
	








function ambient_format_zero(st){
	if(st.length < 2){
		
		return st = "0"+st;
		
	}else{
		return st;
	}
	
}



function normalize_ambient(num){
	if(parseInt(num) > 255){	
		return 255;	
	}else if(parseInt(num) < 0){
		return 0;
	}else{
		return num;
	}
	
}



// Effects




function pulsed_ambient(fade_length,keyframed){	
		
			
		if(keyframed){
						
			return keyframe_ambient_fade_counter/fade_length;
		}else{

			return ambient_fade_counter/fade_length;
		}
		

		
	
}



let beating_ambient_effect = {
	beat_time: 0,
	thresehold: 33,
	effect_amount: 35,
	
	beat: function(interval){
	
		
		this.beat_time = this.beat_time + (1 / interval);
		

	},	
	get_beat: function(){
	
		
		
		
		if(this.beat_time > this.thresehold){
			this.beat_time = 0;
		}
		
		
		return 1 - (((this.beat_time / this.thresehold) * this.effect_amount ) *0.01 );
	},
	
	
	auto_beat: function(inter){
		this.beat(inter);
		
		return this.get_beat()
		
	},
	
	
	
	reset_clk: function(){
		this.beat_time = 0
	}
	
}





function strobed_ambient(fade_length,keyframed){	
		
		var my_ambient_fade_amount;
			
		if(keyframed){
			my_ambient_fade_amount = keyframe_ambient_fade_amount;		
		}else{
			my_ambient_fade_amount = ambient_fade_amount;
		}

		if(my_ambient_fade_amount < 0){
			
			return 0;
		}else{
			return 1
		}
		

		
	
}



//activating global effect	
function ambient_activate_effect(f){
	if(f == "pulse"){
		ambient_pulse_effect = true;
		ambient_strobe_effect = false;
		ambient_beating_effect = false;
		
	}else if(f == "strobe"){
		ambient_pulse_effect = false;
		ambient_strobe_effect = true;
		ambient_beating_effect = false;
	}else if(f == "beating"){
		ambient_pulse_effect = false;
		ambient_strobe_effect = false;
		other_effect = 'beating';
	}else{
		ambient_pulse_effect = false;
		ambient_strobe_effect = false;
		other_effect = 'none';
	}
	
	try{
		_("effect_selector").value = f;
	}catch(e){
		
		//
		
	}
}

