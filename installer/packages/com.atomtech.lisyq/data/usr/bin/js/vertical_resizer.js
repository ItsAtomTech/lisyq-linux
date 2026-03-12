const vertical_resizer = {
	can_move:false,
	min:30,
	max:60,
	
	view1:'v_con_1',
	view2:'v_con_2',
	
	//hideSizing if set to true, will prevent rezing on drag, only until droped will the resize is applied. (For performance improvement)
	isHidden: false,
	hiddenCalc: undefined,
	resize:function(elm,hideSizing=false){
		if(this.can_move == false){
			return;
		}
		
		this.isHidden = hideSizing;
		
		// console.log(event.type, event);
		
		
		let parent_width = elm.parentNode.getBoundingClientRect().width;
		
		
		let ev = event;
		let sliderWidth = elm.getBoundingClientRect().width;		
		let calculated_pos = ((ev.clientX - (sliderWidth * 0.50))  / parent_width  * 100);
		
		
		if(event.type == "touchmove"){
			let evtar = event.touches.length - 1;
			calculated_pos = ((ev.touches[evtar].clientX - (sliderWidth * 0.50))  / parent_width  * 100);
		}
		
		
		if(calculated_pos <= this.min || calculated_pos >= this.max){
			return;
		}
		
		if(hideSizing){
			this.hiddenCalc = calculated_pos;
			elm.style.left = calculated_pos+"%"
			
			_(this.view1).style.opacity = 0.2;
			_(this.view2).style.opacity = 0.2;
			
			return;
		}
		
		elm.style.left = calculated_pos+"%"
		
		_(this.view1).style.width = calculated_pos+"%"
		_(this.view2).style.width = (100 - calculated_pos)+"%"
		
		
		
	},
	
	dropSlider: function(elm){
		if(this.isHidden){
			let calculated_pos = this.hiddenCalc;
			_(this.view1).style.width = calculated_pos+"%"
			_(this.view2).style.width = (100 - calculated_pos)+"%"
			
		}
		
		
		this.can_move = false;
		_(this.view1).style.opacity = 1;
		_(this.view2).style.opacity = 1;
		
	},
	
	pickSlider:function(elm){
		this.can_move = true;
		
	},
	
	initSize: function(elm){
		
		let parent_width = elm.parentNode.getBoundingClientRect().width;
		let sliderWidth = elm.getBoundingClientRect().width;		
		
		_(this.view1).style.width = this.min+'%';
		_(this.view2).style.width = (100 - this.min)+'%';
		

		elm.style.left = (this.min)+"%";

	}
	
	
	
	
	
	
	
	
	
}