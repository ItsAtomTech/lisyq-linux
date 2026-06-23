// var aipexil_time_line = [];
// aipexil v1.3
var timing = 33.33; //30 fps




const aipexil = {
	time_constant: 33.33,
	timelen: 1,
	seqData: [],
	key_frames: [],
	
	pulse_effect: false,
    strobe_effect: false,
    other_effect: "none",

    fade_counter: 1,
    fade_amount: 1,
    effect_len: 1,
	
	effect_banks: ["none", "strobe", "pulse", "beating"],
	
	aipexil_time_line:[],
	premade_effects_params:[],
	
	
	
//effects logics starts =======

  
    keyframe_fade_counter: 1,
    keyframe_fade_amount: 1,
    keyframe_effect_len: 1,
	keyframe_effect: "",

	beating_effect: {
	  beat_time: 0,
	  thresehold: 33,
	  effect_amount: 35,

	  beat: function (interval) {
		  this.beat_time += 1 / interval;
	  },

	  get_beat: function () {
		  if (this.beat_time > this.thresehold) this.beat_time = 0;
		  return 1 - ((this.beat_time / this.thresehold) * this.effect_amount * 0.01);
	  },

	  auto_beat: function (inter) {
		  this.beat(inter);
		  return this.get_beat();
	  },

	  reset_clk: function () {
		  this.beat_time = 0;
	  }
	  
  },


	// strobe effect	
	  strobed_ambient: function (fade_length, keyframed = false) {
		  let fade = keyframed ? this.keyframe_fade_amount : this.fade_amount;
		  return fade < 0 ? 0 : 1;
	  },	

	// pulse effect  
	  pulsed_ambient: function (fade_length, keyframed = false) {
		return keyframed
			? this.keyframe_fade_counter / fade_length
			: this.fade_counter / fade_length;
	  },
	
//effects ends here ===============	
	
	//here are the premade effects which we loop through to create forms from
	premade_effects_bin:{
					
		"color": {
			params: [
							{
								name:"Color",
								type: "color",
								min: 0,
								max: 255,
								default: "000000",
								animatable: true,
								toHex: false,
							},	
							
							{
								name:"Brightness",
								type: "slider",
								min: 0,
								max: 255,
								default: 255,
								animatable: true,
								toHex: true,
							},							
							{
								name:"Effects",
								type: "options",
								values: [
									["None", 0],
									["Strobe", 1],
									["Pulse", 2],
									["Beat", 3],
								],
								min: 0,
								max: 3,
								default: 0,
								animatable: false,
								toHex: false,
								excluded:true,
							},
							{
								name:"Effect threshold",
								type: "number",
								min: -1,
								max: 5,
								default: 0.5,
								animatable: false,
								toHex: false,
								excluded: true,
							},								
						],
					name: "Ocean (Pacifica)"	,			
			
		},	
		//Fire effects
		"fire": {
				params: [
							{
								name:"Cooling",
								type: "number",
								min: 0,
								max: 255,
								default: 100,
								animatable: true,
								toHex: true,
							},	
							{
								name:"Sparking",
								type: "number",
								min: 0,
								max: 255,
								default: 100,
								animatable: true,
								toHex: true,
							},	
							{
								name:"Reverse",
								type: "number",
								min: 0,
								max: 1,
								default: 0,
								animatable: false,
								toHex: false,
							}
							
						],
					name: "Fire Fx"	,
					
			
		},
		
		"ocean": {
			params: [
							{
								name:"Brightness",
								type: "slider",
								min: 0,
								max: 255,
								default: 120,
								animatable: true,
								toHex: true,
							},	
							
							
						],
					name: "Ocean (Pacifica)"	,		
		},		
		"tfox": {
			params: [
							{
								name:"Brightness",
								type: "slider",
								min: 0,
								max: 255,
								default: 120,
								animatable: true,
								toHex: true,
							},	
							
							
						],
					name: "Twinkle Fox"	,
			
			
			
		},
		
		"pallet": {
			params: [
					{
						name:"Pallet",
						type: "options",
						values: [
							["Rainbow Blended", 0],
							["Rainbow Strip", 1],
							["Rainbow Strip Blended", 2],
							["Purple and Green (Blended)", 3],
							["Random palette", 4],
							["Black and White (No Blend)", 5],
							["Black and White (Blended)", 6],
							["Cloud Colors (Blended)", 7],
							["Party Colors (Blended)", 8],
							["Red White (No Blend)", 9],
							["Red White (Blended)", 10],
							["Dev8 Colors", 11],
							["Dev8 Colors (Blended)", 12],
						
						],
						min: 0,
						max: 100,
						default: 0,
						animatable: false,
						toHex: false,
					},
					{
						name:"Speed",
						type: "slider",
						min: 0,
						max: 255,
						default: 127,
						animatable: true,
						toHex: true,
					},
					{
						name:"Brightness",
						type: "number",
						min: 0,
						max: 255,
						default: 100,
						animatable: true,
						toHex: true,
					},								
					
					
				],
			name: "Pallete Run"	,
	
	
			
		},
		
	
	},

	
	
	
	//Generate Data According to keyframes
	 generateData: function() {

		let limit = this.timelen * this.time_constant;
		this.seqData.length = 0;
		
		let prevVal;
		
		this.fade_amount = 1;
        this.fade_counter = 1;
		this.beating_effect.reset_clk();

        this.keyframe_fade_counter = 1;
        this.keyframe_fade_amount = 1;
		
		
	for(i=0; i<= limit; i++) {
		
		this.seqData[i] = " ";
		for(x=0; x < this.key_frames.length;x++){


				if (this.key_frames[x].time_start*this.time_constant <= i && this.key_frames[x].time_end*this.time_constant >= i){
					
					//time tick for this keyfrmae
					let time_tick = i - this.key_frames[x].time_start*this.time_constant;
					
					
					
					//For premade effects
					if(this.key_frames[x].type == "premade"){
						
						let params_ = this.key_frames[x].effect_params;
						
						let stringVal = "fx:"+ params_.fx_type;
						
						//hexfy values that needs it
						for(zg = 0; zg < params_.values.length;zg++){
							
							try{
							
							let param_val = params_.values[zg];
							
							//if param animatable and has dual value
							if(typeof(param_val) == 'object' && this.premade_effects_bin[params_.fx_type].params[zg].animatable && this.premade_effects_bin[params_.fx_type].params[zg].type != "color"){
								// console.log(aipexil.premade_effects_params);
							
								let start_val = parseInt(params_.values[zg][0]);
								let end_val = parseInt(params_.values[zg][1]);
								let zlen = parseInt(this.key_frames[x].time_end*this.time_constant) - this.key_frames[x].time_start*this.time_constant;
														
								param_val = parseInt(aipexil.linear_flow(start_val,end_val,zlen,time_tick));			
								
							//if param animatable amd is color
							}else if(typeof(param_val) == 'object' && (this.premade_effects_bin[params_.fx_type].params[zg].animatable && this.premade_effects_bin[params_.fx_type].params[zg].type == "color")){
									
								let start_val = (params_.values[zg][0]) || "000000";
								let end_val = (params_.values[zg][1]) || "000000"; 
								let zlen = parseInt(this.key_frames[x].time_end*this.time_constant) - this.key_frames[x].time_start*this.time_constant;
								let all_params = this.premade_effects_bin[params_.fx_type].params[zg];

								param_val = aipexil.processColor(start_val,end_val,zlen,time_tick,this.key_frames[x]);


							};

							
							

	
							//If param should be converted to hex
							if(this.premade_effects_bin[params_.fx_type].params[zg].toHex){					
								param_val = param_val.toString(16);								
							}							
							
							if(this.premade_effects_bin[params_.fx_type].params[zg].type == "color"){					
								param_val = this.removeSpecials(param_val);								
							}
							
							
							//if this param should not be added to the data string, will only add if the data is undefined or false.
							if(this.premade_effects_bin[params_.fx_type].params[zg].excluded != true){
								stringVal = stringVal+ ":" + param_val;
							}
							

							}catch(e){
								// console.error(e);
								// --
							}
											
						}
						
						this.seqData[i] = (stringVal);
						
						//onsole.log(this.key_frames[x].valueA);
						
					}else{
						
						
						
						
					}
					
				}
					
			}
			
			
			//calculate effect params for e.g colors etc.
			
			if (["pulse", "strobe"].includes(this.keyframe_effect)) {
                if (this.keyframe_fade_counter < 1 || this.keyframe_fade_counter > this.keyframe_effect_len) {
                    this.keyframe_fade_amount = -this.keyframe_fade_amount;
                }
                this.keyframe_fade_counter += this.keyframe_fade_amount;
            }


            if (this.keyframe_effect == "beating") {
                this.beating_effect.beat(this.keyframe_effect_len / 33);
            }
			
			
			
            this.fade_counter += this.fade_amount;  
		  
			
			
		}
	},
	
					

	split_solor: function(cl){	
	var col_ar = [];	
		try{	
			for(cls = 0; cls < 3;cls++){		
				col_ar[cls] = cl[cls*2]+cl[(cls*2)+1]		
			}
			
		}catch(e){		
			col_ar = ["00","00","00"];		
		}	
		return col_ar;	
	},

	normalize_ambient: function(num){
		if(parseInt(num) > 255){	
			return 255;	
		}else if(parseInt(num) < 0){
			return 0;
		}else{
			return num;
		}
	},

	ambient_format_zero: function(st){
		if(st.length < 2){
			return st = "0"+st;
			
		}else{
			return st;
		}
		
	},

	ambient_combined_hex: function(fg){	
		var bvx = 0;	
		var col_ar = [];
		while(bvx < fg.length){		
			col_ar[bvx] = this.ambient_format_zero(parseInt(fg[bvx]).toString(16));		
			bvx++;
		}
		return col_ar.join("");
	},


	removeSpecials: function(str = "") {
		let strs = str.toString();
		try {
			strs = strs.replace(/[^a-zA-Z0-9 ]/g, "");
		} catch(e) {
			// ---
		}
		return strs;
	},


	//Process the color hex into its split and calculate value
	processColor: function(start_val,end_val,zlen,time_tick,keyframe_params){
		let color_hex = "000000";
		let start_color_array = this.split_solor(this.removeSpecials(start_val));
		let end_color_array = this.split_solor(this.removeSpecials(end_val));
	
		let key_effect = aipexil.effect_banks[keyframe_params.effect_params.values[2]] || "none";
		let effect_thres = keyframe_params.effect_params.values[3] || 0;
	
		this.keyframe_effect_len = parseFloat(effect_thres) * 33;
		this.keyframe_effect = key_effect;
		
		
		let calculated_color = 	[];
			let cind = 0;
			while(cind < start_color_array.length){
					
					var x = parseInt(start_color_array[cind], 16);
					var y = parseInt(end_color_array[cind], 16);
					var w = time_tick;
					var z = zlen;
					
					calculated_color[cind] = this.normalize_ambient(this.linear_flow(x,y,z,w));

					//Apply Effect to calculated value.
					try {
                            if (key_effect == "pulse") {
                                calculated_color[cind] = this.normalize_ambient(
                                    parseInt(calculated_color[cind] * this.pulsed_ambient(this.keyframe_effect_len, true))
                                );
                            } else if (key_effect === "strobe") {
                                calculated_color[cind] = parseInt(
                                    calculated_color[cind] * this.strobed_ambient(this.keyframe_effect_len, true)
                                );
                            } else if (key_effect === "beating") {
                                calculated_color[cind] = parseInt(
                                    calculated_color[cind] * this.beating_effect.get_beat(this.keyframe_effect_len / 33)
                                );
                            }
							
						
							
					  } catch (e) {
						  // console.log(e);
					  }
					
					cind++;
			}

			
			
			// console.log(keyframe_params.effect_params.values, key_effect, effect_thres);

			
			// console.log(this.keyframe_fade_counter);

			color_hex = this.ambient_combined_hex(calculated_color);

		return color_hex;
	},
	
	
	//x - star value, y = end value, w = time tick , z = total length
	linear_flow: function(x,y,z,w){
		return x+((y-x)*(w/z));		
	},	
	
	
	//regenerator function
	regenerate: function(data){	
		let data_delinked = JSON.parse(data);			
		this.key_frames = JSON.parse(data_delinked.raw_data_points);
		this.timelen = data_delinked.seconds_length;
		this.seqData.length = 0;	
		

		aipexil.generateData();
		
		return this.seqData;
	}	
	
	
	
	
	
	
}

//this is called by LiSyQ for data regen outside of namespace
function regen_f3e9cc2243ff902c80b908829745750d(data){
	
	return aipexil.regenerate(data);
	
}







