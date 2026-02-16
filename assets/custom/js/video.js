
function format_video_time(seconds) {
    minutes = Math.floor(seconds / 60);
    minutes = (minutes >= 10) ? minutes : "0" + minutes;
    seconds = Math.floor(seconds % 60);
    seconds = (seconds >= 10) ? seconds : "0" + seconds;
    return minutes + ":" + seconds;
}
function bind_video_events(video_selector) {

    var $video = video_selector;

    $(document).off('click', '#video-btn-play');
    $(document).off('click', '#video-btn-pause');
    $(document).off('click', '#video-btn-restart');
    $(document).off('click', '#video-btn-prev');
	$(document).off('click', '#video-btn-next');
	$(document).off('click', '#video-btn-backward');
    $(document).off('click', '#video-btn-forward');
    $(document).off('click', '#scenario-video-btn-next');

    $video.off('canplaythrough');
    $video.off('ended');
    $video.off('timeupdate');
    $video.off('seeking');
    $video.off('loadedmetadata');
    $video.off('progress');

    /*$video.on('canplaythrough', $video, function() {

        $('#video-current-time').html(format_video_time($video.currentTime));
        $('#video-total-time').html(format_video_time($video.duration));

        $('#video-timerange').show();
        $('#video-btn-play').click();
        
        $video.play();       
    });*/

    $video.on('ended', function() {

       
       	if( $('#video-btn-next').length ) {

            current_slide = get_current_slide();

       if(current_slide.auto_forward == true){
           next_slide = get_next_slide();
       
           bootstrap_slide(next_slide, function() { });    
       }
       		
       		var videonextbtn =  $('#video-btn-next');
       	
       	} else if ( $('#scenario-video-btn-next').length) { 
       			
       			videonextbtn =  $('#scenario-video-btn-next');
       		
       	}
       	
       	//console.log(videonextbtn);
       	
        videonextbtn.removeClass('disabled');
      	videonextbtn.attr("disabled", false);
		$('#video-btn-forward').removeClass('disabled');
		$('#video-btn-forward').attr("disabled", false);
        
        videonextbtn.clearQueue().stop();
      	
      	for (var i = 0; i < 10; i++ ) {
      		
        	videonextbtn
            	.animate( {opacity: 0.5}, {duration :500, start : function () {videonextbtn.css('background-color', '#66ff66')}} )
        	    .animate( {opacity: 1}, {duration :500, complete : function () {videonextbtn.css('background-color', 'none')}})
   		}  

		slideDown_toolbars();
		
		clearTimeout(autohide_timeout);		
		config_style();
        
       $(document).off('mousemove', '#module-video-content');
       
          	

        $('#video-btn-play').show();
        $('#video-btn-pause').hide();
        
        if(is_phone_safari_or_uiwebview) { 
        
        	$('#video-btn-play').hide();
        	$('#video-btn-pause').hide();
        	//$video.addClass('hidden');

        
        }
    });

    $video.on('timeupdate', function() {
        $('#video-current-time').html(format_video_time($video.currentTime()));
       
        var played_per = ($video.currentTime() / $video.duration())*100;
  		$('#played').width(played_per+'%');
    });

    $video.on('seeking', function() {
        return false;
    });

    $video.on('loadedmetadata', function() {
        $('#video-current-time').html(format_video_time($video.currentTime()));
        $('#video-total-time').html(format_video_time($video.duration()));

        $('#video-timerange').show();
    });

    $(document).on('click', '#video-btn-play', function() {

        $('#video-btn-pause').show();
        $('#video-btn-play').hide();

		if(is_phone_safari_or_uiwebview) { 
        
        	$('#video-btn-play').hide();
        	$('#video-btn-pause').hide();
        
        }

        $video.play();
    });

    $(document).on('click', '#video-btn-pause', function() {

        $('#video-btn-play').show();
        $('#video-btn-pause').hide();
        
        if(is_phone_safari_or_uiwebview) { 
        
        	$('#video-btn-play').hide();
        	$('#video-btn-pause').hide();
        
        }

        $video.pause();
    });

    $(document).on('click', '#video-btn-restart', function() {

		$('video').removeClass('hidden');		
	
        $('#video-btn-pause').show();
        $('#video-btn-play').hide();
        
        if(is_phone_safari_or_uiwebview) { 
        
        	$('#video-btn-play').hide();
        	$('#video-btn-pause').hide();
        
        }
        
       	clearTimeout(autohide_timeout);		
		$(document).off('mousemove', '#module-video-content');
        
        $(document).on('mousemove', '#module-video-content', function() {
			
				if(ctrls_hidden) {
					slideDown_toolbars();
					clearTimeout(autohide_timeout);
					autohide_timeout = setTimeout(slideUp_toolbars, module_config.autohide_time*2);
				}
			
			});
            
        if(!is_phone_safari_or_uiwebview) { 
            	setTimeout(slideUp_toolbars, module_config.autohide_time);
		}

        $video.load();
        $video.play();
    });
     $(document).on('click', '#video-btn-prev', function() {
			
        	$('#video-btn-prev').addClass('disabled');

			if($current_video !== null) {
            	$current_video.dispose();
        	}

        	prev_slide = get_prev_slide();

        	if(!prev_slide) {
            	return false;
        	}

        	bootstrap_slide(prev_slide, function() {});
    	});
		
		$(document).on('click', '#video-btn-backward', function() {
			if($current_video.currentTime() < 10) {
				$current_video.currentTime(0);
			}
			else {
				$current_video.currentTime($current_video.currentTime() - 10)
			}
			
		});
		$(document).on('click', '#video-btn-forward', function() {
				$current_video.currentTime($current_video.currentTime() + 10);
		});

    	$(document).on('click', '#video-btn-next', function() {
    	
        	$('#video-btn-next').addClass('disabled');
        	
        	if($current_video !== null) {
            	$current_video.dispose();
        	}

        	next_slide = get_next_slide();

        	if(!next_slide) {
            	return false;
        	}

        	bootstrap_slide(next_slide, function() { });
    	});
    	
    	$(document).on('click', '#scenario-video-btn-next', function() {
    	
        	$('#scenario-video-btn-next').addClass('disabled');
        	
        	if($current_video !== null) {
            	$current_video.dispose();
        	}

			var goto = $('#scenario-video-btn-next').data( "goto-id" );

        	//next_slide = get_next_slide();

        	//if(!next_slide) {
            //	return false;
        	//}

			scenario_goto(goto);

        	//bootstrap_slide(next_slide, function() { });
    	});
    
	$video.on('progress', function() {
  		
  		var loaded_per = $video.bufferedPercent()*100;
  		
  		//console.log(loaded_per);
  		
  		$('#loaded').width(loaded_per+'%');
	});

    $('#video-btn-play').show();
    $('#video-btn-pause').hide();
    
    if(is_phone_safari_or_uiwebview) { 
        
        	$('#video-btn-play').hide();
        	$('#video-btn-pause').hide();
        	
        	$('#module-video-progress').hide();
        	
    }

    $video.load();
    
      $('#video-btn-play').click();
    
}
