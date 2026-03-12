var not_empty = false;


var wasPlayingBefore = false;


function scanOptimized(){
	var total_time = main_timeline.scrollWidth;
	wasPlayingBefore = false;
	
	console.time("Optimized");

	scanned_data = [[[]],[[]]];
	
	if(playing == true){
		playing = false;
		wasPlayingBefore = true;
	}
	
	
	
	
	
	
	for(i = 0;i <=  total_time;i++){
		
		scan_to_optimize(i);
		
		
	}
	
	
//Would be removed soon, only here for debugging -
/* 	for(zx = 0;zx < scanned_data.length;zx++){
		
		try{
			scanned_data[zx] = scanned_data[zx].filter(Boolean);
					 len = scanned_data[zx].length;
		 
			for(i = 0; i < len; i++ ){
				
				if(scanned_data[zx][i].length > 0){
					scanned_data[zx].push(scanned_data[zx][i]);  // copy non-empty values to the end of the array
				}
				
			}
			scanned_data[zx].splice(0 , len);
			
		}catch(e){
			//
		}

		
	
	
	} */


	optimizedData = true;
	
	if(wasPlayingBefore){
		playing = true;
	}
	console.timeEnd("Optimized");
}




function scan_to_optimize(time_index_){//Scan through all track and content blocks at current time
let time_index = parseInt(time_index_); 

not_empty = false;

	//Loop through tracks
	for(tr = 0;tr < timeline_data.length;tr++){
		try{
			var port_chan = 0;
			
			if(timeline_data[tr].port_channel != undefined){
				port_chan = timeline_data[tr].port_channel;
				
			}
			
			//track target channel data
			let ch_track;

			if(timeline_data[tr].target_channel != undefined){
				ch_track = timeline_data[tr].target_channel;
			}else{	
				ch_track = 0;
			}

			
			try{			
				//output[port_chan][tr] = timeline_data[tr].default_value;			
				if(timeline_data[tr].muted != true){
					to_consolidator(ch_track,port_chan,timeline_data[tr].default_value,timeline_data[tr].default_value, time_index,tr);				
				}
				
			}catch(e){
				//output[port_chan] = [];
				//output[port_chan][tr] = timeline_data[tr].default_value;	
			}
			
			for(str = 0;str < timeline_data[tr].sub_tracks.length;str++){
					var subtracks = timeline_data[tr].sub_tracks[str];
					
				try{
					if(subtracks.start_at <= time_index && time_index <= subtracks.end_at){
						
						// console.log("Track #"+ tr +", content block #"+ str +" : "+ time + "\n content_index: " + (time - subtracks.start_at));
						if(timeline_data[tr].muted != true){
										
			to_consolidator(ch_track,port_chan,timeline_data[tr].sub_tracks[str].data[parseInt(time_index - subtracks.start_at)],timeline_data[tr].default_value, time_index,tr);
							}
						
						not_empty = true;

						
					}else{
						
						// Something in the future
						
					}
				}catch(e){

				}
				
			}
		
	
		
	}catch(e){

	}	
		
		
	}

	if(not_empty == false){
		
		//send_to_port();
		
	}else{
		//send_to_port();
	}
	
}

var scanned_data = [[[]],[[]]];


function to_consolidator(track,chport,data_f,def,time_index,tr_id){
	
		not_empty = true;
		
		var channel_port = validate_number(chport);
		
		//provide index for the port_channel array if not present
		if(scanned_data[channel_port] == undefined){
			scanned_data[channel_port] = [[]];		
		}
		
		if(scanned_data[channel_port][track] == undefined){
			scanned_data[channel_port][track] = [];		
		}
		
		
		if(timeline_data[tr_id].muted == true){
			return;
		}
		
		
		if(data_f == undefined || data_f ==  ""){
			//set to default value if no data
			
			scanned_data[chport][track][time_index] = def;			
		}else{
			//set to value 
			scanned_data[chport][track][time_index] = data_f;	
		}
	

	
	
	
}


function play_on_optimized(){
	
	//to_output(tr,chp,df,def);
	
	let timeFixed =  parseInt(time);

	port_channels = scanned_data.length;
	var time_delay = 0;
	if(playing == true){	
		time_delay = parseInt(delay);
		/* console.log(time_delay); */
	}
	
	
	for(p_c = 0; p_c < port_channels;p_c++){
		//Loop trough port channels
		try{
			for(trc = 0;trc < scanned_data[p_c].length;trc++){
				//Loop trough tracks and get content at current time
				
				try{		
					let dataf = scanned_data[p_c][trc][timeFixed - time_delay];
					to_output(trc,p_c,dataf,"");
				}catch(e){
					to_output(trc,p_c,'',"");
				}
				
			}
		}catch(e){
			//optimizedData = false;
			//scanned_data.length = 0;
			//return optimizedData;
		}
		
	}
	
	send_to_port();
	
	
	
}




//Hiding Tracks not Visible to the user
let timer1 = {
	prevTime: 0,
	currentTime: 0,
	TimeLapsed: function(tm){
		timer1.currentTime = tm;	
	},
	isTimeout: function(ms){
		if(this.prevTime+ms > this.currentTime){	
			return false;
		}else{
			this.prevTime = this.currentTime;
			return true;
		}
	}
}



var auto_hide = true;
var autoHideTick = 0;
async function autoHide(){
	
	window.requestAnimationFrame(timer1.TimeLapsed);
	let timeOut = timer1.isTimeout(300);
	
	
	if(!auto_hide){
		return;
	}	
	if(autoHideTick <= 2){
		autoHideTick++;
		
		if(!timeOut){
			return;
		}
			
	};
		
	if(timeOut){
	autoHideTick = 0;
	}
	
	await hideHiddenTracks();
	
}

let autoHideActive = true; 

function disableAutoHide(){
	autoHideActive = false;
	
	
}

function enableAutoHide(){
	autoHideActive = true;
	
	
}

function hideHiddenTracks(){
	var  track_collections = document.getElementsByClassName("track_con");
		



	for(tracks of track_collections){
		//console.log(tracks);		
		
		if(tracks.getBoundingClientRect().y - (col_1 - 50) < 0 || tracks.getBoundingClientRect().y - (col_1 - 10) >= col_2){			
		

			if(autoHideActive == true){
				tracks.classList.add("track_not_in_view");	
			}

			
		}else{
			//if visible
			tracks.classList.remove("track_not_in_view");		
		};
		
	} 
	
	
}





