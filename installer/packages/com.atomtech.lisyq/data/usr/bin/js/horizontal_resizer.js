const horizontal_resizer = {
	can_move:false,
	min:30,
	max:40,
	
	view1:'h_con_1',
	view2:'h_con_2',
	
	
	resize:function(elm){
		if(this.can_move == false){
			return;
		}
		// console.log(event.type, event);
		
		let parent_width = elm.parentNode.getBoundingClientRect().height;
		
		
		let ev = event;
		let sliderWidth = elm.getBoundingClientRect().height;		
		let calculated_pos = ((ev.clientY - (sliderWidth * 0.60))  / parent_width  * 100);
		
		
		if(event.type == "touchmove"){
			let evtar = event.touches.length - 1;
			calculated_pos = ((ev.touches[evtar].clientY - (sliderWidth * 0.60))  / parent_width  * 100);
		}
		
		
		if(calculated_pos <= this.min || calculated_pos >= this.max){
			// console.log(calculated_pos <= this.min , calculated_pos >= this.max)
			return;
		}
		
		
		elm.style.top = calculated_pos+"%"
		_(this.view1).style.height = calculated_pos+"%"
		_(this.view2).style.height = (100 - calculated_pos)+"%";
		
	},
	
	dropSlider: function(elm){
		this.can_move = false;
		
		
	},
	
	pickSlider:function(elm){
		this.can_move = true;
		
	},
	
	initSize: function(elm){
		
		let parent_width = elm.parentNode.getBoundingClientRect().height;
		let sliderWidth = elm.getBoundingClientRect().height;		
		
		_(this.view1).style.height = this.min+'%';
		_(this.view2).style.height = (100 - this.min)+'%';
		elm.style.top = (this.min)+"%";

	}
	
	
	
	
	
	
	
	
	
}