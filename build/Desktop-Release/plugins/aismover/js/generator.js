let aismover = {
    time_line: [],
    colors_array: [],
    pixel_length: 0,

    pulse_effect: false,
    strobe_effect: false,
    other_effect: "none",

    fade_counter: 1,
    fade_amount: 1,
    effect_len: 1,

    keyframe_fade_counter: 1,
    keyframe_fade_amount: 1,
    keyframe_effect_len: 1,
    
    DEFAULT_POSITION: 50, //Percent
    
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

    main: function (data) {
        let delinked = JSON.parse(data);
        return this.generate_data(delinked);
    },

    generate_data: function (data) {
        this.fade_amount = 1;
        this.fade_counter = 1;
        this.beating_effect.reset_clk();

        this.keyframe_fade_counter = 1;
        this.keyframe_fade_amount = 1;

        this.time_line = JSON.parse(data.raw_data_points);
        this.pixel_length = data.seconds_length * 33;
        this.effect_len = data.effect_len;
        this.activate_effect(data.effect);

        this.colors_array.length = 0;

        this.calculate_data();

        return this.colors_array;
    },

    calculate_data: function () {
        const defaultData = ["000000","~","~"];
        for (let sd = 0; sd <= this.pixel_length; sd++) {
            this.colors_array[sd] = defaultData;
            let keyframe_effect = "none";

            for (let tl = 0; tl < this.time_line.length; tl++) {
                if (this.time_line[tl].start_at * 33 <= sd && sd <= this.time_line[tl].end_at * 33) {
                    let start_color_array = this.split_color(this.time_line[tl].color_start);
                    let end_color_array = this.split_color(this.time_line[tl].color_end);

                    
                    
                    keyframe_effect = "none";

                    let calculated_color = [];
                    
                    
                    let calculated_position;
                    calculated_position = this.generatePositionData(this.time_line[tl], sd);
                    
                    //loop through all 3 hex color value
                    for (let cind = 0; cind < start_color_array.length; cind++) {
                        let x = parseInt(start_color_array[cind], 16);
                        let y = parseInt(end_color_array[cind], 16);
                        let w = sd - this.time_line[tl].start_at * 33;
                        let z = parseInt(this.time_line[tl].end_at * 33) - this.time_line[tl].start_at * 33;

                        calculated_color[cind] = this.normalize_ambient(this.linear_flow(x, y, z, w));

                        try {
                            keyframe_effect = this.time_line[tl].keyframe_aismover_effect;
                            this.keyframe_effect_len = parseFloat(this.time_line[tl].keyframe_aismover_effect_len);

                            if (keyframe_effect === "pulse") {
                                calculated_color[cind] = this.normalize_ambient(
                                    parseInt(calculated_color[cind] * this.pulsed_ambient(this.keyframe_effect_len, true))
                                );
                            } else if (keyframe_effect === "strobe") {
                                calculated_color[cind] = parseInt(
                                    calculated_color[cind] * this.strobed_ambient(this.keyframe_effect_len, true)
                                );
                            }
                        } catch (e) {
                            console.log(e);
                        }

                        let bypass_global = this.time_line[tl].bypass_global_effect;
                        if (bypass_global !== true) {
                            if (this.pulse_effect) {
                                calculated_color[cind] = this.normalize_ambient(
                                    parseInt(calculated_color[cind] * this.pulsed_ambient(this.effect_len))
                                );
                            } else if (this.strobe_effect) {
                                calculated_color[cind] = parseInt(
                                    calculated_color[cind] * this.strobed_ambient(this.effect_len)
                                );
                            } else if (this.other_effect === "beating") {
                                calculated_color[cind] = parseInt(
                                    calculated_color[cind] * this.beating_effect.get_beat(this.effect_len / 33)
                                );
                            }
                        }
                    }

                    //Layering if top frame pos is disabled
                    if(calculated_position == false){
                        try{
                            if(typeof(this.colors_array[sd]) == "object"){
                                rawData = this.colors_array[sd];
                            }else{
                                rawData = this.colors_array[sd].split(":"); 
                            }
                            calculated_position = rawData[1];
                        }catch(e){
                            calculated_position = defaultData[1]+":"+defaultData[2];
                        }
                    }
                    
                    
                    this.colors_array[sd] = [this.combined_hex(calculated_color), calculated_position];                    
                    
                }
            }
            
            this.colors_array[sd] = this.colors_array[sd].join(":");
            
            if (["pulse", "strobe"].includes(keyframe_effect)) {
                if (this.keyframe_fade_counter < 1 || this.keyframe_fade_counter > this.keyframe_effect_len) {
                    this.keyframe_fade_amount = -this.keyframe_fade_amount;
                }
                this.keyframe_fade_counter += this.keyframe_fade_amount;
            }

            if (this.pulse_effect || this.strobe_effect) {
                if (this.fade_counter < 1 || this.fade_counter > this.effect_len) {
                    this.fade_amount = -this.fade_amount;
                }
            }

            if (this.other_effect === "beating") {
                this.beating_effect.beat(this.effect_len / 33);
            }

            this.fade_counter += this.fade_amount;
            
           
        }
    },
    
    
    //function that generates Position Data with Time Derivative
    generatePositionData: function(data,time){
        let position_data = data.position_data ? data.position_data : undefined;
        if(typeof(position_data) != "object"){
            return undefined;
        }
        let positionArrays = [];
        let isEnabled = position_data.enabled == undefined ? true: position_data.enabled;
        
        if(!isEnabled){
            return false;
        }
        
        let posStart = position_data.position_set[0] ? position_data.position_set[0]:
        {"pan": 50, "tilt": 50};
        
        let posEnd = position_data.position_set[1] ? position_data.position_set[1]:
         {"pan": 50, "tilt": 50};
        
        let w = time - data.start_at * 33;
        let z = parseInt(data.end_at * 33) - data.start_at * 33;

        let PAN = this.linear_flow(posStart.pan, posEnd.pan,z, w);
        let TILT = this.linear_flow(posStart.tilt, posEnd.tilt,z, w);

        //Applying Effects at this block
        
        let effectType = position_data.effect;
        if(effectType){
            let effected = this.applyEffect([PAN,TILT],effectType,position_data, time);
            PAN = effected[0];
            TILT = effected[1];
        }
        

        //Transform from percentage into hex
        PAN = this.normalize_ambient(parseInt(PAN * 2.55)).toString(16);
        TILT = this.normalize_ambient(parseInt(TILT * 2.55)).toString(16);
        
        PAN = this.format_zero(PAN);        
        TILT = this.format_zero(TILT);        
        
        let generated_data = (PAN+":"+TILT);
        
        
        return generated_data;
        // console.log(position_data, posStart, posEnd);
        
        
    },
    
    
    linear_flow: function (x, y, z, w) {
        return x + ((y - x) * (w / z));
    },

    combined_hex: function (fg) {
        return fg.map(val => this.format_zero(parseInt(val).toString(16))).join("");
    },

    split_color: function (cl) {
        try {
            return [cl.slice(0, 2), cl.slice(2, 4), cl.slice(4, 6)];
        } catch (e) {
            return ["00", "00", "00"];
        }
    },

    format_zero: function (st) {
        return st.length < 2 ? "0" + st : st;
    },

    normalize_ambient: function (num) {
        return Math.max(0, Math.min(255, parseInt(num)));
    },

    pulsed_ambient: function (fade_length, keyframed = false) {
        return keyframed
            ? this.keyframe_fade_counter / fade_length
            : this.fade_counter / fade_length;
    },

    strobed_ambient: function (fade_length, keyframed = false) {
        let fade = keyframed ? this.keyframe_fade_amount : this.fade_amount;
        return fade < 0 ? 0 : 1;
    },

    activate_effect: function (f) {
        this.pulse_effect = f === "pulse";
        this.strobe_effect = f === "strobe";
        this.other_effect = f === "beating" ? "beating" : "none";

        try {
            let el = _("effect_selector");
            if (el) el.value = f;
        } catch (e) {
            // UI element may not exist
        }
    },
    
    
    // ====================
    //movement effects Applying Helper function
    
    applyEffect: function(pos, type, data, time,invert=false){
        let speed = data.speed;
        let size = data.size;

        if(aimoveeffects[type]){
            let generatedOut = aimoveeffects[type](pos, size, speed, time,invert);
            return generatedOut;
        }else{
            return pos; //return original pos if effect is not found
        }
    }
    
    
};


//effects bank for that comes with aismover plugin
const aimoveeffects = {
    
    wave: function(coord=[0,0], size=1,speed=0.10,time=0, invert=false){
		let pans = coord[0];
		let tilt = (Math.sin(time * speed/100) * size) + coord[1];
        return [pans,tilt];
        
        
    },
    
    circle: function(coord=[0,0], size=1,speed=0.10,time=0, invert=false){
            let pans = (Math.cos(time * speed/100) * size) + coord[0];
            let tilt = (Math.sin(time * speed/100) * size) + coord[1];
            return [pans,tilt];
    },
    
    infinity: function(coord=[0,0], size=1,speed=0.10,time=0, invert=false){

            const centerX = coord[0];
            const centerY = coord[1];
            const A = size;
            const t = ((time * speed ) * Math.PI) / 180; // Convert to radians
            const x = A * Math.cos(t);
            const y = A * Math.sin(t) * Math.cos(t);

            const pans = centerX + x;
            const tilt = centerY + y;

            return [pans,tilt]; 
    },    
    
    
    square: function(coord=[0,0], size=1,speed=0.10,time=0, invert=false){

            const centerX = coord[0];
            const centerY = coord[1];

            let halfSize = size; // Square from center ± dummySize

            let phase = (time * (speed * 0.10)) % 100;//length of keyframe
            let pans, tilt;

            if (phase < 25) {
                // Move right
                pans = centerX - halfSize + (phase / 25) * (halfSize * 2);
                tilt = centerY - halfSize;
            } else if (phase < 50) {
                // Move down
                pans = centerX + halfSize;
                tilt = centerY - halfSize + ((phase - 25) / 25) * (halfSize * 2);
            } else if (phase < 75) {
                // Move left
                pans = centerX + halfSize - ((phase - 50) / 25) * (halfSize * 2);
                tilt = centerY + halfSize;
            } else {
                // Move up
                pans = centerX - halfSize;
                tilt = centerY + halfSize - ((phase - 75) / 25) * (halfSize * 2);
            }
            
            return [pans,tilt]; 
    },    
    
    oval: function(coord=[0,0], size=1,speed=0.10,time=0, invert=false){
            const centerX = coord[0];
            const centerY = coord[1];
            let ovalWidth = 15 * (size / 10);   // Horizontal stretch
            let ovalHeight = 7.5 * (size / 10);  // Vertical stretch
            let pans = (Math.cos(time * (speed / 100)) * ovalWidth) + centerX;
            let tilt = (Math.sin(time * (speed / 100)) * ovalHeight) + centerY;
            
            return [pans,tilt]; 
    },
    
}





//this is called by LiSyQ for data regen outside of namespace
function regen_82943e2512849395c30065395b94669a(data){
	return aismover.main(data);	
}
