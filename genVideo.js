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
				videoTags.eq(i).wrap('<div class = "genVideo" style = "height : '+ videoTags[i].height+'px; width : '+ videoTags[i].width+'px"></div>').after('<div class="progress-wrap progress"> <div class = "progress-buffer progress"></div>'+
  					'<div class="progress-bar progress">  </div>'+
					'</div>'+
					'<div class = "playerCtrl"> <div class="playpauseBtn"><div class = "playBtn"><span class="play"><span></span></span></div><div class="pause"><span class="pauseBar"></span><span class="pauseBar"></span></div></div>'+
					'<div class = "volumeBtnGrp" ><div class= "volumeBtn"><span class="vol1"></span><span class="vol2"></span><span class="vol3"></span></div><div class="vol-progress-wrap vol-progress" data-progress-percent="25">  <div class="vol-progress-bar vol-progress"></div></div></div><div class = "fullScreenCls">'+
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
    			//$('.playerCtrl').fadeIn();
			},function(){
			   // $('.playerCtrl').fadeOut();
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
			  currentElement.requestFullscreen();
			} else if (currentElement.msRequestFullscreen) {
			  currentElement.msRequestFullscreen();
			} else if (currentElement.mozRequestFullScreen) {
			  currentElement.mozRequestFullScreen();
			} else if (currentElement.webkitRequestFullscreen) {
			  currentElement.webkitRequestFullscreen();
			}
			if (currentElement.f) {};
		},
		timeUpdate : function(e){
			var currentElement = $(this)[0];
			genVideo.durationchange(e);
			moveProgressBar(currentElement.currentTime/currentElement.duration)
			moveBufferProgressBar(timeRangesToString(currentElement.buffered)/currentElement.duration)
			console.log(timeRangesToString(currentElement.buffered))
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
			moveVolProgressBar(currentVolume)
		},
		play : function(e){
			var currentElement = $(e.target).parents(".playerCtrl").siblings("video")[0];
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
			console.log(e);
		},
		el : function(selector){
		},//Attach video tag to 
		attachVideoTag : function(el){
			
		}

		}
	})(window);
	console.log(genVideo)
	genVideo.init();
	// on page load...
    moveProgressBar(0);
    // on browser resize...
    $(window).resize(function() {
        moveProgressBar(0);
    });

    // Buffer timer calculation 

    function timeRangesToString(r) {
	  var log = "";
	  for (var i=0; i<r.length; i++) {
	    log = r.end(i);
	  }
	  return log;
	}


    // SIGNATURE PROGRESS
    function moveProgressBar(progress) {
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
    }
    function moveVolProgressBar(progress) {
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
    }
    function moveBufferProgressBar(progress) {
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