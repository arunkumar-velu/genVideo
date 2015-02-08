(function(window,undefined){
		window.genVideo ={
		//Flags are identified by _(underscore)
		_pause : true, 
		init : function(selector){
			var videoTags = $("video");
			for(var i = 0; i < videoTags.length; i++){
				videoTags.on("timeupdate",this.timeUpdate);
				videoTags.load();
				videoTags.on("durationchange",this.durationchange);
				videoTags.on("ended",this.ended);
				videoTags.eq(i).wrap('<div class = "genVideo" data-fs = "false" style = "height : '+ videoTags[i].height+'px; width : '+ videoTags[i].width+'px"></div>').after('<div class="progress-wrap progress"> <div class = "progress-buffer progress"></div>'+
  					'<div class="progress-bar progress">  </div>'+
					'</div>'+
					'<div class = "playerCtrl"> <div class="playpauseBtn"><div class = "playBtn"><span class="play"><span></span></span></div><div class="pause"><span class="pauseBar"></span><span class="pauseBar"></span></div></div>'+
					'<div class = "volumeBtnGrp" ><div class= "volumeBtn"><span class="vol1"></span><span class="vol2 volumeBg"></span><span class="vol3 volumeBg"></span></div><div class="vol-progress-wrap vol-progress" data-progress-percent="25">  <div class="vol-progress-bar vol-progress"></div></div></div><div class = "fullScreenCls">'+
					'</div></div>');	
			}
			$(".playpauseBtn").on('click',this.play);
			$(".volumeBtn").on('click',this.volume);
			$(".vol-progress-wrap,.vol-progress-buffer").on('click',this.volumeSeek);
			$(".progress-wrap,.progress-buffer").on('click',this.seek);
			$(".fullScreenCls").on("click",this.fullScreen)
			$('video').bind('webkitfullscreenchange mozfullscreenchange fullscreenchange', this.fullScreenStyle);
			videoTags.parent().find(".playBtn").show();
			videoTags.parent().find(".pause").hide();
			$(".genVideo").hover(function(){
    			$('.playerCtrl').fadeIn();
			},function(){
			    $('.playerCtrl').fadeOut();
			});
			genVideo.moveProgressBar(0);
			$(window).resize(function() {
				genVideo.moveProgressBar(0);
			});
		},
		ended : function(e){
			var videoTagsEl = $(e.target.parentNode);
			videoTagsEl.find(".playBtn").show();
			videoTagsEl.find(".pause").hide();
			genVideo._pause = true;
		},
		durationchange : function(e){
			var videoTagsEl = $(e.target);
		},
		fullScreen : function(e) {
			var currentElement = $(e.target).parents().find("video")[0];
			if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  
				if (currentElement.requestFullscreen) {
				  currentElement.requestFullscreen();
				} else if (currentElement.msRequestFullscreen) {
				  currentElement.msRequestFullscreen();
				} else if (currentElement.mozRequestFullScreen) {
				  currentElement.mozRequestFullScreen();
				} else if (currentElement.webkitRequestFullscreen) {
				  currentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
				}
				
			} else {
				if (document.exitFullscreen) {
				  currentElement.exitFullscreen();
				} else if (document.msExitFullscreen) {
				  currentElement.msExitFullscreen();
				} else if (document.mozCancelFullScreen) {
				  currentElement.mozCancelFullScreen();
				} else if (document.webkitExitFullscreen) {
				  currentElement.webkitExitFullscreen();
				}				
			}
			genVideo.fullScreenStyle(e);
		},
		fullScreenStyle : function(e){
			var state = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
    		if(state){
    			var currentVideoCtrl = $(e.target).parents().find(".playerCtrl");
				genVideo.originalWidth = $(e.target).parents().find(".genVideo").css("width");
				$(e.target).parents().find(".genVideo").css({ width:"auto",marginTop : screen.height});
				currentVideoCtrl.css({width : "250px"});
    		}else{
    			var currentVideoCtrl = $(e.target).parents().find(".playerCtrl");
				$(e.target).parents().find(".genVideo").css({ width:genVideo.originalWidth,marginTop : "0px"});
				currentVideoCtrl.css({width : "160px"});
    		}			
		},
		timeUpdate : function(e){
			var currentElement = $(this)[0];
			genVideo.durationchange(e);
			genVideo.moveProgressBar(currentElement.currentTime/currentElement.duration)
			genVideo.moveBufferProgressBar(genVideo.timeRangesToString(currentElement.buffered)/currentElement.duration)
		},
		seek : function(e){
			if($(e.target.parentNode).has("video").length){
				var currentElement = $(e.target).siblings("video")[0];
				var previosLeft = 0;
			}else{
				var currentElement = $(e.target.parentNode).siblings("video")[0];
				var previosLeft = parseInt($(e.target).css("left"),10);
			}
			var leftOffset = parseInt(e.offsetX) + previosLeft;
			var getProgressWrapWidth = $('.progress-wrap').width();
			var currentTime = (leftOffset/getProgressWrapWidth)*currentElement.duration;
			currentElement.currentTime = currentTime;
		},
		volumeSeek:function(e){
			var previosLeft = 0;
			if($(e.target).hasClass("vol-progress-bar")){
				previosLeft = parseInt($(e.target).css("left"),10);
			}
			var currentElement = $(e.target).parents().find("video")[0]
			var leftOffset = parseInt(e.offsetX,10) + previosLeft;
			var getProgressWrapWidth = $('.vol-progress-wrap').width();
			var currentVolume = (leftOffset/getProgressWrapWidth);
			currentElement.volume = currentVolume;
			genVideo.moveVolProgressBar(currentVolume)
		},
		play : function(e){
			var currentElement = $(e.target).parents(".playerCtrl").siblings("video")[0];
			currentElement.volume = 0.33;
			$(e.target).removeClass("volumeBg");
			$(".vol2",".vol3").addClass("volumeBg");
			genVideo.moveVolProgressBar(currentElement.volume)
			if(genVideo._pause){
				currentElement.play();
				$(this).find(".pause").show();
				$(this).find(".playBtn").hide();
				genVideo._pause = false;	
			}else{
				currentElement.pause();
				$(this).find(".playBtn").show();
				$(this).find(".pause").hide();
				genVideo._pause = true;
			}
		},
		volume : function(e){
			var currentElement = $(e.target).parents(".playerCtrl").siblings("video")[0];
			var selectedVol = $(e.target).attr("class").split(" ")[0];
			switch (selectedVol) {
				case "vol1":
					if($(e.target).hasClass("volumeBg")){
						currentElement.volume = 0.33;
						$(e.target).removeClass("volumeBg");
						$(".vol2",".vol3").addClass("volumeBg");
					}
					else{
						currentElement.volume = 0;
						$(e.target).addClass("volumeBg");
						$(".vol2,.vol3").addClass("volumeBg");
					}
					break;
				case "vol2":
					if($(e.target).hasClass("volumeBg")){
						currentElement.volume = 0.67;
						$(e.target).removeClass("volumeBg");
						$(".vol1").removeClass("volumeBg");
						$(".vol3").addClass("volumeBg");
					}
					else{
						currentElement.volume = 0.33;
						$(e.target).addClass("volumeBg");
						$(".vol3").addClass("volumeBg");
					}
					break;
				case "vol3":
					if($(e.target).hasClass("volumeBg")){
						currentElement.volume = 1;
						$(e.target).removeClass("volumeBg")
						$(".vol1,.vol2").removeClass("volumeBg")
					}
					else{
						currentElement.volume = 0.67;
						$(e.target).addClass("volumeBg")
					}
					break;
				default:
					break;
			}
			genVideo.moveVolProgressBar(currentElement.volume)
		},
		el : function(selector){
		},
		attachVideoTag : function(el){
			
		},
		timeRangesToString : function(r) {
		  var log = "";
		  for (var i=0; i<r.length; i++) {
		    log = r.end(i);
		  }
		  return log;
		},
		moveProgressBar : function(progress) {
	        var getPercent = progress;
	        var getProgressWrapWidth = $('.progress-wrap').width();
	        var progressTotal = getPercent * getProgressWrapWidth;
	        $('.progress-buffer').stop().animate({
	            left: progressTotal
	        });
    	},
    	moveVolProgressBar : function(progress) {
	        var getPercent = progress;
	        var getProgressWrapWidth = $('.vol-progress-wrap').width();
	        var progressTotal = getPercent * getProgressWrapWidth;
	        $('.vol-progress-bar').stop().animate({
	            left: progressTotal
	        });
    	},
    	moveBufferProgressBar : function(progress) {
	         var getPercent = progress;
	        var getProgressWrapWidth = $('.progress-wrap').width();
	        var progressTotal = getPercent * getProgressWrapWidth;
	        $('.progress-bar').stop().animate({
	            left: progressTotal
	        });
	    }

		}
	})(window);
	genVideo.init();
	

    