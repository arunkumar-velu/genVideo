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
			videoTags.parent().find(".playBtn").show();
			videoTags.parent().find(".pause").hide();
			$(".genVideo").hover(function(){
    			$('.playerCtrl').fadeIn();
			},function(){
			    $('.playerCtrl').fadeOut();
			});
			//$(".playBtn").on('click',this.play);
			

		},
		ended : function(e){
			var videoTagsEl = $(e.target.parentNode);
			videoTagsEl.find(".playBtn").show();
			videoTagsEl.find(".pause").hide();
			genVideo._pause = true;
		},
		durationchange : function(e){
			var videoTagsEl = $(e.target);
			//videoTagsEl[0].volume = 0.25;
			//moveVolProgressBar(0.25);
			//videoTagsEl.siblings(".durationCls").html(videoTagsEl[0].currentTime +" / "+ videoTagsEl[0].duration);
			
		},
		fullScreen : function(e){
			var currentElement = $(e.target).parents().find("video")[0];
			
			if (currentElement.requestFullscreen) {
				if(currentElement.displayingFullscreen){
					currentElement.exitFullscreen();
					genVideo.exitScreenStyle(e);
				}else{
					currentElement.requestFullscreen();
					genVideo.fullScreenStyle(e);
				}
			} else if (currentElement.msRequestFullscreen) {
				if(currentElement.msDisplayingFullscreen){
					currentElement.msExitFullscreen();
					genVideo.exitScreenStyle(e);
				}else{
					currentElement.msRequestFullscreen();
					genVideo.fullScreenStyle(e);
				}
			  
			} else if (currentElement.mozRequestFullScreen) {
				if(currentElement.mozDisplayingFullscreen){
					currentElement.mozExitFullScreen();
					genVideo.exitScreenStyle(e);
				}else{
					currentElement.mozRequestFullScreen();
					genVideo.fullScreenStyle(e);
				}
			} else if (currentElement.webkitRequestFullscreen) {
				if(currentElement.webkitDisplayingFullscreen){
					currentElement.webkitExitFullscreen();
					genVideo.exitScreenStyle(e);
				}else{
					currentElement.webkitRequestFullscreen();
					genVideo.fullScreenStyle(e);					
				}
			  
			}
		},
		fullScreenStyle : function(e){
			var currentVideoCtrl = $(e.target).parents().find(".playerCtrl");
			genVideo.originalWidth = $(e.target).parents().find(".genVideo").css("width");
			$(e.target).parents().find(".genVideo").css({ width:"auto",marginTop : screen.height});
			currentVideoCtrl.css({width : "250px"});
		},
		exitScreenStyle : function(e){
			var currentVideoCtrl = $(e.target).parents().find(".playerCtrl");
			$(e.target).parents().find(".genVideo").css({ width:genVideo.originalWidth,marginTop : "0px"});
			currentVideoCtrl.css({width : "160px"});

		},
		timeUpdate : function(e){
			var currentElement = $(this)[0];
			genVideo.durationchange(e);
			genVideo.moveProgressBar(currentElement.currentTime/currentElement.duration)
			genVideo.moveBufferProgressBar(genVideo.timeRangesToString(currentElement.buffered)/currentElement.duration)
		},
		seek : function(e){
			console.log($(e.target.parentNode).has("video").length);
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
			console.log(currentTime,getProgressWrapWidth,currentElement.duration,leftOffset)
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
				//$(this).html("Pause");
				$(this).find(".pause").show();
				$(this).find(".playBtn").hide();
				genVideo._pause = false;	
			}else{
				currentElement.pause();
				//$(this).html("Play");
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
					console.log("others")
					break;
			}
			genVideo.moveVolProgressBar(currentElement.volume)
		},
		el : function(selector){
		},//Attach video tag to 
		attachVideoTag : function(el){
			
		},
		// Buffer timer calculation 

	    timeRangesToString : function(r) {
		  var log = "";
		  for (var i=0; i<r.length; i++) {
		    log = r.end(i);
		  }
		  return log;
		},
		moveProgressBar : function(progress) {
        //var getPercent = ($('.progress-wrap').data('progress-percent') / 100);
	        var getPercent = progress;
	        var getProgressWrapWidth = $('.progress-wrap').width();
	        var progressTotal = getPercent * getProgressWrapWidth;
	        //var animationLength = (progress*400);
	        
	        // on page load, animate percentage bar to data percentage length
	        // .stop() used to prevent animation queueing
	        $('.progress-buffer').stop().animate({
	            left: progressTotal
	        });
    	},
    	moveVolProgressBar : function(progress) {
	        //var getPercent = ($('.progress-wrap').data('progress-percent') / 100);
	        var getPercent = progress;
	        var getProgressWrapWidth = $('.vol-progress-wrap').width();
	        var progressTotal = getPercent * getProgressWrapWidth;
	        //var animationLength = (progress*400);
	        
	        // on page load, animate percentage bar to data percentage length
	        // .stop() used to prevent animation queueing
	        $('.vol-progress-bar').stop().animate({
	            left: progressTotal
	        });
    	},
    	moveBufferProgressBar : function(progress) {
	        //var getPercent = ($('.progress-wrap').data('progress-percent') / 100);
	        var getPercent = progress;
	        var getProgressWrapWidth = $('.progress-wrap').width();
	        var progressTotal = getPercent * getProgressWrapWidth;
	        //var animationLength = (progress*400);
	        
	        // on page load, animate percentage bar to data percentage length
	        // .stop() used to prevent animation queueing
	        $('.progress-bar').stop().animate({
	            left: progressTotal
	        });
	    }

		}
	})(window);
	console.log(genVideo)
	genVideo.init();
	// on page load...
    genVideo.moveProgressBar(0);
    // on browser resize...
    $(window).resize(function() {
        genVideo.moveProgressBar(0);
    });

    