let zoom_val = 1;
let zoom_limit_min = 0.6;
let zoom_limit_max = 2;

function applyScale(n){
	n = Math.abs(parseFloat(n));
	
	if((n*1).toString() == "NaN"){
		n = 1;
	}
	
	if(n < zoom_limit_min){	
		n = zoom_limit_min;	
	}else if(n > zoom_limit_max){	
		n = zoom_limit_max;
	}
	
	
	_("dyna_scaler").innerHTML = ":root {--scale: "+n+";}";
	zoom_scale = n;
	
	gen_ruler();
	
		_("timeline_container").scrollTo((time * zoom_scale)-(_("timeline_container").getBoundingClientRect().width * 0.5),_("timeline_container").scrollTop);
	//play_head((time - 11 ) * zoom_scale);


	_("zoom_disp").value = zoom_scale;
	zoom_val = zoom_scale;
}



function zoomTimeline(d){
	
	
	if(d == "+"){
		zoom_val = zoom_val+0.1;
		
	}else if(d == "-"){
		zoom_val = zoom_val-0.1;
	}
	
	
	if(zoom_val < zoom_limit_min){	
		zoom_val = zoom_limit_min;	
	}else if(zoom_val > zoom_limit_max){	
		zoom_val = zoom_limit_max;
	}
	
	applyScale(zoom_val);
	
}

