
var timeFormatTimer = function(raw_time){
		
		return parseInt((raw_time/60/60)%60) +":"+add_zero(parseInt((raw_time/60)%60))+":"+add_zero(parseInt(raw_time%60))+""+":"+add_zero(parseInt((raw_time*100)%100))+"";
		
};




var time_disp;
let customIdNest = undefined;
function setTimeDisplay(rt,customId=undefined){
	time_disp = timeFormatTimer((rt-10)/(33.333333333));
	
	customIdNest = customId;
	
	//samp.textContent = "00"
	window.requestAnimationFrame(update_time_display);
	
}

function update_time_display(){
	
	if(customIdNest){
		_(customIdNest).textContent = time_disp;
		return;
	}
	
	_("time_display_").textContent = time_disp;
	
	
}
