var can_move;


var elms;
var prev_pos;
var prev_pos_

var body_height = document.body.getBoundingClientRect().height;
var col_1 = 150;
var col_2 = 0;

function devider_rep(elm){
	if(!can_move){ return };
	
	
	differ = ((parseInt(prev_pos) - parseInt(event.clientY)));
	// prev_pos = (event.screenY);
	elm.style.top = bouded((prev_pos_ - differ))+ "px";
	
	col_1 =  bouded(prev_pos_ - differ);
	col_2 = body_height - col_1;
	
	_("col_1").style.height = col_1-2+"px";
	_("col_2").style.height = (col_2 - 60)+"px";
	


	
}

function init_resize(){
	body_height = document.body.getBoundingClientRect().height;
	
	col_2 = body_height - col_1;
	_("col_2").style.height = (col_2 - 60)+"px";
	
	
}

function devider_(bl,th){
	
	can_move = bl;
	prev_pos = (event.clientY);
	prev_pos_ = th.getBoundingClientRect().top;
	
	/* console.log(prev_pos); */
	
	if(bl == false){
					
		try{
			autoHide();
		}catch(e){
			//
		}
	}
	
}


var fg = init_resize();

window.addEventListener("resize",init_resize());


function bouded(r){
	
	if(r >= body_height*0.40){
		
		return parseInt(body_height*0.40);
	}else if(r <=  150){
		return 150;
	}else{
		return r;
	}
	
}

