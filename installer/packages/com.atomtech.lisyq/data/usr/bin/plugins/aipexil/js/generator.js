// var aipexil_time_line = [];

var timing = 33.33; //30 fps




const aipexil = {
	time_constant: 33.33,
	timelen: 1,
	seqData: [],
	key_frames: [],
	
	
	aipexil_time_line:[],
	premade_effects_params:[],
	
	//here are the premade effects which we loop through to create forms from
	premade_effects_bin:{
		
		
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
							if(typeof(param_val) == 'object' && this.premade_effects_bin[params_.fx_type].params[zg].animatable){
								// console.log(aipexil.premade_effects_params);
							
								let start_val = parseInt(params_.values[zg][0]);
								let end_val = parseInt(params_.values[zg][1]);
								let zlen = parseInt(this.key_frames[x].time_end*this.time_constant) - this.key_frames[x].time_start*this.time_constant;
														
								param_val = parseInt(aipexil.linear_flow(start_val,end_val,zlen,time_tick));			
							
							};
	
							//If param should be converted to hex
							if(this.premade_effects_bin[params_.fx_type].params[zg].toHex){					
								param_val = param_val.toString(16);								
							}
			
							stringVal = stringVal+ ":" + param_val;
											

							}catch(e){
								
								// --
							}
											
						}
						
						this.seqData[i] = (stringVal);
						
						
						
						//onsole.log(this.key_frames[x].valueA);
						
					}else{
						
						
						
						
					}
					
				}
					
			}
			
		}
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
