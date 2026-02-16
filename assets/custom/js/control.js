/*register config data and setup init vars */
var module_config = null;
var $current_video = null;
var assess_ordered = false;
var autohide_timeout;
var bookmark = scorm.getvalue('cmi.location');
var is_phone_safari_or_uiwebview = /(iPhone|iPod|iosAcademyHQ_App)/i.test(navigator.userAgent);
var is_hudl2_chrome = /Hudl 2/.test(navigator.userAgent);
var ctrls_hidden = false;
var reporting = true;
var review = false;
var myMap = new Map();
var checked_value = [];
var itemArr = [];
var retry = 0;
var chances = 1;
var retryCount = 0;

$(function() {
	module_config = config;
	/*var row_frames = parent.document.getElementsByTagName('frameset')[ 0 ];

	if(row_frames) {

		row_frames.rows="*,0,0,0,0,0";
	}

	var row_cols = parent.parent.document.getElementsByTagName('frameset')[ 0 ];

	if(row_cols) {

		row_frames.cols="0,*,0";
	}*/
	//if(is_hudl2_chrome ) {
	if (module_config.fullscreen == true) {
		$(document.body).on('click', function() {
			var el = document.documentElement,
				rfs =
				el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen;
			rfs.call(el);
			//console.log("going fullscreen");
			//$(document.body).off('click');
		});
	}
	//}
	if (bookmark == '' || bookmark == undefined) {
		//console.log("resetting bookmark");
		scorm.setvalue('cmi.location', JSON.stringify({
			is_started: false,
			current: {
				section_id: 1,
				slide_id: 1
			},
			furthest: {
				section_id: 1,
				slide_id: 1
			}
		}));
		scorm.setvalue('cmi.completion_status', 'incomplete');
		scorm.commit();
	}
	bookmark = JSON.parse(scorm.getvalue('cmi.location'));
	//console.log(bookmark);
	//console.log("loaded bookmark : c "+bookmark.current.section_id+" / "+bookmark.current.slide_id+" | f "+bookmark.furthest.section_id+" / "+bookmark.furthest.slide_id+" / ");
	//$("button[data-toggle='tooltip']").each(function() {
	//	$(this).tooltip({container: 'body'});
	//});
	config_style();
	$('#module-header div h1').html(module_config.title);
	$('#module-header div h1').show();
	$('#module-content-loading').hide();
	if (bookmark.is_started == false) {
		$('#module-content').html(Mustache.to_html($('#module-start-template').html(), {
			"title": "Ready to begin?"
		}));
		$('#module-btn-start').show();
	}
	else {
		$('#module-content').html(Mustache.to_html($('#module-start-template').html(), {
			"title": "Ready to resume?"
		}));
		$('#module-btn-resume').show();
		$('#module-btn-resume-start').show();
	}
	/* Start/Resume Buttons */
	$(document).on('click', '#module-btn-start', function() {
		$('#module-header-nav').removeClass('disabled');
		$('#module-header-nav').attr("disabled", false);
		bookmark.is_started = true;
		scorm.setvalue('cmi.location', JSON.stringify(bookmark));
		scorm.commit();
		current_slide = get_current_slide();
		//$('module-alert').slideUp(250);
		bootstrap_slide(current_slide, function() {});
	});
	$(document).on('click', '#module-btn-resume', function() {
		$('#module-header-nav').removeClass('disabled');
		$('#module-header-nav').attr("disabled", false);
		bookmark.current.section_id = bookmark.furthest.section_id;
		bookmark.current.slide_id = bookmark.furthest.slide_id;
		current_slide = get_current_slide();
		//$('#module-alert').slideUp(250);
		bootstrap_slide(current_slide, function() {});
	});
	$(document).on('click', '#module-btn-resume-start', function() {
		$('#module-header-nav').removeClass('disabled');
		$('#module-header-nav').attr("disabled", false);
		bookmark.current.section_id = 1;
		bookmark.current.slide_id = 1;
		current_slide = get_current_slide();
		//$('module-alert').slideUp(250);
		bootstrap_slide(current_slide, function() {});
	});
	$(document).on('click', '#module-header-close', function() {
		$('#module-alert aside').html(Mustache.to_html($('#module-alert-response-content').html(), {
			"title": "Are you sure?",
			"textContent": "",
			"responses": [{
				"textContent": "Cancel"
			}, {
				"textContent": "Close"
			}]
		}));
		config_style();
		if (is_phone_safari_or_uiwebview) {
			$('#video-current').css('height', '0px');
		}
		$($('#module-alert .btn').get(1)).click(function() {
			$('module-alert').slideUp(250);
			scorm.terminate();
			if (window.opener) {
				window.close();
			}
			if ($current_video !== null) {
				$current_video.dispose();
			}
			$('#module-wrapper').slideUp(500);
		});
		$($('#module-alert .btn').get(0)).click(function() {
			$('#module-alert').slideUp(250);
			if (is_phone_safari_or_uiwebview) {
				$('#video-current').css('height', $('#module-content').height() - $('#module-header').height() - $('#module-footer').height() + 'px');
			}
		});
		$('#module-alert').slideDown(250);
	});
	$(document).on('click', '#module-header-nav', function() {
		//open nav
		$("nav").animate({
			left: "0%"
		}, 500, function() {});
		$("article").animate({
			left: "25%"
		}, 500, function() {});
	});
	$(document).on('click', '#module-nav-close', function() {
		//close nav
		$("nav").animate({
			left: "-25%"
		}, 500, function() {});
		$("article").animate({
			left: "0%"
		}, 500, function() {});
	});
	$(document).on('click', '.nav-module-slide', function() {
		current_slide = get_current_slide();
		if (current_slide.type == 'video') {
			//console.log($current_video);
			$current_video.dispose();
		}
		else if (current_slide.type == 'scenario') {
			//console.log("remove scenario");
			//console.log(current_slide.slides[bookmark.current.scenario_pos-1].type);
			if (current_slide.slides[bookmark.current.scenario_pos - 1].type == 'scenario-video') {
				$current_video.dispose();
			}
		}
		bookmark.current.section_id = $(this).data('section-id');
		bookmark.current.slide_id = $(this).data('slide-id');
		bookmark.current.question_id = undefined;
		bookmark.current.scenario_pos = undefined;
		current_slide = get_current_slide();
		bootstrap_slide(current_slide, function() {});
		$("nav").animate({
			left: "-25%"
		}, 500, function() {});
		$("article").animate({
			left: "0%"
		}, 500, function() {});
		return false;
	});
	$('#module-footer-reveal').bind('click', function() {
		slideDown_toolbars();
	});
	$(window).resize(function() {
		video_resize();
	});







	/* Knowledge Check--------with retry limit */
	$(document).on('change', 'input[name=module-knowledge-check-answer]', function() {
		$('#module-knowledge-check-submit-btn').removeClass('disabled')
		$('#module-knowledge-check-submit-btn').attr("disabled", false);
	});
	$(document).on('click', '#module-knowledge-check-submit-btn', function() {
		$('input[name=module-knowledge-check-answer]').attr('disabled', 'disabled');
		$current_question_id = $('#module-knowledge-check-content').data('question-id');
		$answer = $('input[name=module-knowledge-check-answer]:checked').val();
		current_slide = get_current_slide();
		if (current_slide.questions[$current_question_id - 1].answers[current_slide.questions[$current_question_id - 1].answer].text == $answer) {
			$('#knowledge-check-answer-correct').removeClass('hidden');
			if ($current_question_id < current_slide.questions.length) {
				$('#module-knowledge-check-next-question-btn').removeClass('hidden');
			}
			else {
				$('#module-knowledge-check-finish-btn').removeClass('hidden');
			}
		}
		else {
			$('#knowledge-check-answer-incorrect').addClass('hidden');
			
			if(retry > 1 || retry == 1){
				$('#knowledge-check-answer-retry-module').removeClass('hidden');
				$('#module-knowledge-check-finish-btn').removeClass('hidden');
				$('#module-knowledge-check-answers').addClass('hidden');
				$('#module-knowledge-check-question-title').addClass('hidden');
				$('#question_number').addClass('hidden');				
				$('#knowledge-check-answer-incorrect').removeClass('hidden');

			}
			else {
				
				$('#module-knowledge-check-retry-btn').removeClass('hidden');
				$('#knowledge-check-incorrect-retry').removeClass('hidden');
			}
		}
		$('#module-knowledge-check-submit-btn').addClass('hidden');
	});
	$(document).on('click', '#module-knowledge-check-next-question-btn', function() {
		retry = 0;
		chances = 2;
		current_slide = get_current_slide();
		bookmark.current.question_id += 1;
		bootstrap_slide(current_slide, function() {});
	});
	$(document).on('click', '#module-knowledge-check-finish-btn', function() {
		retry = 0;
		chances = 2;
		bookmark.current.question_id = undefined;
		next_slide = get_next_slide();
		if (!next_slide) {
			return false;
		}
		bootstrap_slide(next_slide, function() {});
	});
	$(document).on('click', '#module-knowledge-check-retry-btn', function() {
		retry++;
		chances--;
		//bookmark.current.question_id = undefined;
		current_slide = get_current_slide();
		bootstrap_slide(current_slide, function() {});
	});
	/*scenario options */
	$(document).on('change', 'input[name=module-scenario-options-check-answer]', function() {
		$('#module-scenario-option-continue-btn').removeClass('disabled')
		$('#module-scenario-option-continue-btn').attr("disabled", false);
	});
	$(document).on('click', '#module-scenario-option-continue-btn', function() {
		$('input[name=module-scenario-options-check-answer]').attr('disabled', 'disabled');
		$goto = $('input[name=module-scenario-options-check-answer]:checked').val();
		scenario_goto($goto);
	});
	$(document).on('change', 'input[name=module-assessment-answer]', function() {
		$('#module-assessment-submit-btn').removeClass('disabled');
		$('#module-assessment-submit-btn').attr("disabled", false);
	});
	$(document).on('click', '#module-assessment-submit-btn', function() {
		$('input[name=module-assessment-answer]').attr('disabled', 'disabled');
		$current_question_id = $('#module-assessment-content').data('question-id');
		$answer = $('input[name=module-assessment-answer]:checked').val();
		$assessment_answers[$current_question_id] = $answer;
		assessment_submit();
	});
	
	
	$(document).on('click', '#module-assessment-retry-btn', function() {
		bookmark.current.question_id = undefined;
		current_slide = get_current_slide();
		bootstrap_slide(current_slide, function() {});
	});
	$(document).on('click', '#module-assessment-retry-course-btn', function() {
		review = false;
		retryCount = 0;
		bookmark.current.section_id = 1;
		bookmark.current.slide_id = 1;
		current_slide = get_current_slide();
		//$('module-alert').slideUp(250);
		bootstrap_slide(current_slide, function() {});
	});
	$(document).on('click', '#module-assessment-finish-btn', function() {
		$('#module-wrapper').slideUp(500);
		scorm.terminate();
		if (window.opener) {
			window.close();
		}
	});

$(document).on('click', '#module-drag-drop-targets-submit-assessment-btn', function() {
		current_data = get_current_slide();
		var current_slide = current_data.questions[bookmark.current.question_id - 1];
		var correct = drag_drop_targets_tally(current_slide);
		$('#module-content').scrollTop(0);
		if (correct == true) {
			$assessment_answers[bookmark.current.question_id] = "correct";
		}
		else {
			$assessment_answers[bookmark.current.question_id] = "incorrect";
		}
		assessment_submit();
	});
$(document).on('click', '#module-drag-drop-targets-submit-btn', function() {
	current_slide = get_current_slide();

	var correct = drag_drop_targets_tally(current_slide);

	$('#module-content').scrollTop(0);
	if (correct == true) {
		$('#module-drag-drop-targets-content').addClass('hidden');
		$('#module-drag-drop-targets-results').removeClass('hidden');
		$('#drag-drop-targets-correct').removeClass('hidden');
		$('#module-drag-drop-targets-finish-btn').removeClass('hidden');
	}
	else {
		$('#module-drag-drop-targets-content').addClass('hidden');
		$('#module-drag-drop-targets-results').removeClass('hidden');
		$('#drag-drop-targets-incorrect').removeClass('hidden');
		$('#module-drag-drop-targets-retry-btn').removeClass('hidden');
		if (current_slide.retry_mode == 0) {
			$('#module-drag-drop-targets-finish-btn').removeClass('hidden');
		}
	}
});
$(document).on('click', '#module-drag-drop-targets-finish-btn', function() {
	//bookmark.current.question_id = undefined;
	next_slide = get_next_slide();
	if (!next_slide) {
		return false;
	}
	bootstrap_slide(next_slide, function() {});
});
$(document).on('click', '#module-drag-drop-targets-retry-btn', function() {
	//bookmark.current.question_id = undefined;
	current_slide = get_current_slide();
	bootstrap_slide(current_slide, function() {});
});

$(document).on('click', '#module-drag-drop-lists-submit-assessment-btn', function() {
		current_data = get_current_slide();
		var current_slide = current_data.questions[bookmark.current.question_id - 1];
		var correct = drag_drop_lists_tally(current_slide);
		$('#module-content').scrollTop(0);
		if (correct == true) {
			$assessment_answers[bookmark.current.question_id] = "correct";
		}
		else {
			$assessment_answers[bookmark.current.question_id] = "incorrect";
		}
		assessment_submit();
	});

var retryCountDragList = 0; 
$(document).on('click', '#module-drag-drop-lists-submit-btn', function() {
	current_slide = get_current_slide();

	var correct = drag_drop_lists_tally(current_slide);

	$('#module-content').scrollTop(0);
	if (correct == true) {
		$('#module-drag-drop-lists-content').addClass('hidden');
		$('#module-drag-drop-lists-results').removeClass('hidden');
		$('#drag-drop-lists-correct').removeClass('hidden');
		$('#module-drag-drop-lists-finish-btn').removeClass('hidden');
		retryCountDragList = 0;
	} else {
		$('#module-drag-drop-lists-content').addClass('hidden');
		$('#module-drag-drop-lists-results').removeClass('hidden');
		$('#drag-drop-lists-incorrect').removeClass('hidden');
		
		if(retryCountDragList == 0){
			$('#module-drag-drop-lists-retry-btn').removeClass('hidden');
			retryCountDragList++;
		} else {
			$('#drag-drop-lists-incorrect-desc').removeClass('hidden');
			$('#module-drag-drop-lists-finish-btn').removeClass('hidden');
			retryCountDragList = 0;
		}
		// if (current_slide.retry_mode == 0) {
		// 	$('#module-drag-drop-lists-finish-btn').removeClass('hidden');
		// }
	}
});
$(document).on('click', '#module-drag-drop-lists-finish-btn', function() {
	//bookmark.current.question_id = undefined;
	next_slide = get_next_slide();
	if (!next_slide) {
		return false;
	}
	bootstrap_slide(next_slide, function() {});
});
$(document).on('click', '#module-drag-drop-lists-retry-btn', function() {
	//bookmark.current.question_id = undefined;
	current_slide = get_current_slide();
	bootstrap_slide(current_slide, function() {});
});


$(document).on('click', '#module-drag-drop-puzzle-submit-assessment-btn', function() {
		current_data = get_current_slide();
		var current_slide = current_data.questions[bookmark.current.question_id - 1];
		var correct = drag_drop_puzzle_tally(current_slide);
		$('#module-content').scrollTop(0);
		if (correct == true) {
			$assessment_answers[bookmark.current.question_id] = "correct";
		}
		else {
			$assessment_answers[bookmark.current.question_id] = "incorrect";
		}
		assessment_submit();
	});
	$(document).on('click', '#module-drag-drop-puzzle-review-submit-assessment-btn', function() {
			assessment_submit();
		});
$(document).on('click', '#module-drag-drop-puzzle-submit-btn', function() {
	current_slide = get_current_slide();

	var correct = drag_drop_puzzle_tally(current_slide);

	$('#module-content').scrollTop(0);
	if (correct == true) {
		$('#module-drag-drop-puzzle-content').addClass('hidden');
		$('#module-drag-drop-puzzle-results').removeClass('hidden');
		$('#drag-drop-puzzle-correct').removeClass('hidden');
		$('#module-drag-drop-puzzle-finish-btn').removeClass('hidden');
	} else {
		$('#module-drag-drop-puzzle-content').addClass('hidden');
		$('#module-drag-drop-puzzle-results').removeClass('hidden');
		$('#drag-drop-puzzle-incorrect').removeClass('hidden');
		$('#module-drag-drop-puzzle-retry-btn').removeClass('hidden');
		if (current_slide.retry_mode == 0) {
			$('#module-drag-drop-puzzle-finish-btn').removeClass('hidden');
		}
	}
});
$(document).on('click', '#module-drag-drop-puzzle-finish-btn', function() {
	//bookmark.current.question_id = undefined;
	next_slide = get_next_slide();
	if (!next_slide) {
		return false;
	}
	bootstrap_slide(next_slide, function() {});
});
$(document).on('click', '#module-drag-drop-puzzle-retry-btn', function() {
	//bookmark.current.question_id = undefined;
	current_slide = get_current_slide();
	bootstrap_slide(current_slide, function() {});
});

$(document).on('change', '#checkboxes-answers input', function() {
	$.each($("#checkboxes-answers input"), function(index, item) {
	if($(item).prop('checked') == true ) {
		console.log('changed');
		$('#module-checkboxes-submit-btn').removeClass('disabled');
	};
  });
});



$(document).on('click', '#module-checkboxes-submit-assessment-btn', function() {
		current_data = get_current_slide();
		var current_slide = current_data.questions[bookmark.current.question_id - 1];
		var correct = checkboxes_tally(current_slide);
		$('#module-content').scrollTop(0);
		if (correct == true) {
			$assessment_answers[bookmark.current.question_id] = "correct";
		}
		else {
			$assessment_answers[bookmark.current.question_id] = "incorrect";
		}
		assessment_submit();
	});
	$(document).on('click', '#module-checkboxes-review-submit-assessment-btn', function() {
		assessment_submit();
	});
$(document).on('click', '#module-checkboxes-submit-btn', function() {
	current_slide = get_current_slide();

	var correct = checkboxes_tally(current_slide);


	

	$('#module-content').scrollTop(0);
	if (correct == true) {
		//$('#module-checkboxes-content').addClass('hidden');
		$('#module-checkboxes-submit-btn').addClass('hidden');
		$('#module-checkboxes-results').removeClass('hidden');
		$('#checkboxes-correct').removeClass('hidden');
		$('#module-checkboxes-finish-btn').removeClass('hidden');
	} else {
		//$('#module-checkboxes-content').addClass('hidden');
		$('#module-checkboxes-submit-btn').addClass('hidden');
		$('#module-checkboxes-results').removeClass('hidden');
		//$('#checkboxes-incorrect').removeClass('hidden');
		$('#module-checkboxes-retry-btn').removeClass('hidden');
		if(retry > 1 || retry == 1) {
			$('#module-checkboxes-retry-module-btn').removeClass('hidden');
			$('#module-checkboxes-retry-btn').addClass('hidden');
			$('#module-checkboxes-retry').addClass('hidden');
			$('#checkboxes-incorrect').removeClass('hidden');
			$('#module-checkboxes-finish-btn').removeClass('hidden');
			$('#module-checkboxes-content').addClass('hidden');
		}
		else {
			$('#module-checkboxes-retry').removeClass('hidden');
			//$('#module-checkboxes-retry').html('Incorrect! Please retry.');
			$('#checkboxes-incorrect-retry').removeClass('hidden');
		}
		
	}
});
$(document).on('click', '#module-checkboxes-finish-btn', function() {
	//bookmark.current.question_id = undefined;
	retry = 0;
	chances = 1;
	next_slide = get_next_slide();
	if (!next_slide) {
		return false;
	}
	bootstrap_slide(next_slide, function() {});
});
$(document).on('click', '#module-checkboxes-retry-btn', function() {
	retry++;
	chances--;
	//bookmark.current.question_id = undefined;
	current_slide = get_current_slide();
	bootstrap_slide(current_slide, function() {});
});

 $(document).on('click', '#image-highlight-btn-prev', function() {

        	$('#image-highlight-btn-prev').addClass('disabled');

        	prev_slide = get_prev_slide();

        	if(!prev_slide) {
            	return false;
        	}

        	bootstrap_slide(prev_slide, function() {});
    	});

$(document).on('click', '#image-highlight-btn-next', function() {

        	$('#image-highlight-btn-next').addClass('disabled');

        	next_slide = get_next_slide();

        	if(!next_slide) {
            	return false;
        	}

        	bootstrap_slide(next_slide, function() { });
    	});


$(document).on('click', '#module-outcome-submit-btn', function() {
	$current_outward_url = $('#module-outcome-content').data('outward-url');
	if ($current_outward_url != "") {
		var pos = $current_outward_url.indexOf("SLIDE:");
		if (pos == -1) {
			window.location.href = $current_outward_url;
		}
		else {
			//TODO slide navigation
		}
	}
});

$(document).on('click', '#fill-in-the-blanks-check-answer', function() {
	fillInTheBlanksCheckAnswers();
});

$(document).on('click', '#fill-in-the-blanks-submit-btn', function() {
	next_slide = get_next_slide();
	if(!next_slide) {
			return false;
	}
	bootstrap_slide(next_slide, function() { });
});

$(document).on('click', '#click-target-check-answer', function() {
	fillInTheBlanksCheckAnswers();
});

$(document).on('click', '#click-target-submit-btn', function() {
	next_slide = get_next_slide();
	if(!next_slide) {
			return false;
	}
	bootstrap_slide(next_slide, function() { });
});

$(document).on('click', '#module-scenario-outcome-submit-btn', function() {
	$goto = $('#module-scenario-outcome-submit-btn').data('goto-id');
	scenario_goto($goto);
});
$(document).on('click', '#module-scenario-outcome-back-btn', function() {
	$goto = $('#module-scenario-outcome-back-btn').data('goto-id');
	scenario_goto($goto);
});

});

function drag_drop_targets_tally(current_slide){

		var correct = true;

			$.each($(".dropable"), function(index, item) {
		var selected_id = $(item).attr("data-draggable");
		var id = $(item).attr("data-id");
		var answers = current_slide.targets[id].answers
		var in_answers = $.inArray(Number(selected_id) + 1, answers);
			if (in_answers == -1) {
				correct = false;
			}
		});

		return correct;

	}
function checkboxes_tally(current_slide){

		var correct = true;
		notchecked = true;

		$.each($("#checkboxes-answers input"), function(index, item) {

		var id = $(item).attr("data-id");

		if($(item).prop('checked') == true ) {
			var id = $(item).attr("data-id");
			checked_value.push(id)
			myMap.set(bookmark.current.question_id, checked_value);
			notchecked = false;
		}
		var answer = current_slide.answers[id].check;

		console.log($(item).prop('checked')+" / "+answer)

			if($(item).prop('checked') != answer) {
			//console.log("false");
				correct = false;
			}
		});
		checked_value = [];
		return correct;


	}
function drag_drop_lists_tally(current_slide){

		var correct_ids = 0;
		var incorrect_ids = 0;

		var answers = current_slide.target.answers

		$.each($("#drag-target li"), function(index, item) {

		var id = $(item).attr("data-id");

		//console.log($(item).text());

		var in_answers = $.inArray(Number(id) + 1, answers);
			if (in_answers == -1) {
				incorrect_ids++;
				var html_string = $('#drag-drop-lists-incorrect').html();
					html_string += current_slide.drags[id].answer;
				$('#drag-drop-lists-incorrect').html(html_string);
			} else {
				correct_ids++;
				html_string = $('#drag-drop-lists-correct').html();
				html_string += current_slide.drags[id].answer;
				// $('#drag-drop-lists-correct').html(html_string);
			}
		});

		if(correct_ids >= current_slide.target.required_answers && incorrect_ids == 0) {
			return true;
		} else {
			return false;
		}

	}

	function drag_drop_puzzle_tally(current_slide){

		var correct = true;

		$.each($("#drag_puzzle li"), function(index, item) {

		var id = $(item).attr("data-id");
		itemArr.push(item);
		myMap.set(bookmark.current.question_id, itemArr);
		//console.log($(item).text());

		if (index != current_slide.drags[id].answer-1 || $(item).attr("data-locked") != "1") {
				correct = false;
			}
		});

		itemArr = [];

		return correct;

	}

/* Assessment */
var $assessment_answers = {};
var $incorrect_text = "";

function tally_assessment_score() {
	current_slide = get_current_slide();
	correct_answers = 0;
	$incorrect_text = "";
	for (question_id in $assessment_answers) {
		if ($assessment_answers[question_id] == "correct") {
			correct_answers += 1;
		}
		else if ($assessment_answers[question_id] == "incorrect") {}
		else {
			current_question = current_slide.questions[question_id - 1];
			current_answer_id = current_question.answer;
			//current_answer = current_question.answers[current_answer_id].text;
			if ($assessment_answers[question_id] == current_answer_id) {
				correct_answers += 1;
			} else {
				if(current_slide.log_incorrect == "true") { 
					
					$incorrect_text += current_question.incorrectText+"<br/>";
				
				}
			}
		}
	}
	return (correct_answers / current_slide.questions.length).toFixed(2) * 100;
}

function assessment_submit() {
	current_slide = get_current_slide();
	if (bookmark.current.question_id == current_slide.questions.length) {
		//console.log(tally_assessment_score);
		score = tally_assessment_score();
		
		
		if (reporting == true) {
			if (score < current_slide.passing_score) {
				var fail = true;
				var pass = false;
				retryCount++;
				scorm.setvalue('cmi.score.min', '0');
				scorm.setvalue('cmi.score.max', '100');
				scorm.setvalue('cmi.score.scaled', score.toString());
				scorm.setvalue('cmi.score.raw', score.toString());
				scorm.commit();
			}
			else {
				var fail = false;
				var pass = true;
				scorm.setvalue('cmi.score.min', '0');
				scorm.setvalue('cmi.score.max', '100');
				scorm.setvalue('cmi.score.scaled', score.toString());
				scorm.setvalue('cmi.score.raw', score.toString());
				scorm.setvalue('cmi.completion_status', 'completed');
				scorm.setvalue('cmi.success_status', 'passed')
				scorm.commit();
			}
		}
		$('#module-content').html(
			Mustache.to_html($('#module-assessment-results-template').html(), {
				score: score,
				passing_score: current_slide.passing_score,
				pass: pass,
				fail: fail,
				incorrect: $incorrect_text,
				incorrect_title: current_slide.log_incorrect_title,
				incorrect_text: current_slide.log_incorrect_text
			}));
		if (pass) {
			$('#module-assessment-submit-btn').addClass("hidden");
			$('#module-assessment-retry-btn').removeClass("hidden");
			$('#module-assessment-finish-btn').removeClass("hidden");
		}
		else {
			if(retryCount < 3){
				$('#module-assessment-retry-btn').removeClass("hidden");
				normal = false;
			}
			else {
				$('#module-assessment-retry-btn').addClass("hidden");
				$('#module-assessment-finish-btn').addClass("hidden");
				$('#module-assessment-retry-course-btn').removeClass("hidden");
			}
			$('#module-assessment-submit-btn').addClass("hidden");
		}
		return false;
	}
	bookmark.current.question_id += 1;
	bootstrap_slide(current_slide, function() {});
}

function video_resize() {
	//console.log("resize");
	if (is_phone_safari_or_uiwebview) {
		$('#video-current').css('width', $('#module-content').css('width'));
		$('#video-current').css('height', $('#module-content').height() - $('#module-header').height() - $('#module-footer').height() + 'px');
	}
	else {
		$('#video-current').css('width', $('#module-content').css('width'));
		$('#video-current').css('height', $('#module-content').css('height'));
		$('#video-current').css('margin-top', null);
		$('#video-current video').css('width', $('#module-content').css('width'));
		$('#video-current video').css('height', $('#module-content').css('height'));
		$('#video-current video').css('margin-top', null);
	}
}

function regenerate_nav_permissions() {
	html = "";
	//console.log("build nav furthest : "+bookmark.furthest.section_id+" / "+bookmark.furthest.slide_id+"; ");
	//console.log(bookmark);
	for (var section_id in module_config.sections) {
		section = module_config.sections[section_id];
		section_id_string = parseInt(section_id) + 1;
		//console.log(section_id_string);
		html = html + "<li class='nav-module-head'><b>" + section_id_string + ": " + section.title + "</b> </li>";
		for (slide_id in section.slides) {
			slide = section.slides[slide_id];
			slide_id_string = parseInt(slide_id) + 1;
			slide_html = "<li class='nav-module-item'>";
			//console.log(slide_id_string);
			if (module_config.is_locked) {
				if (section_id < (bookmark.furthest.section_id - 1)) {
					slide_html += "<a class='nav-module-slide' data-section-id='" + section_id_string + "' data-slide-id='" + slide_id_string + "' href='#'>" + slide.title + "</a>";
				}
				else if (section_id == (bookmark.furthest.section_id - 1) && slide_id <= (bookmark.furthest.slide_id - 1)) {
					slide_html += "<a class='nav-module-slide' data-section-id='" + section_id_string + "' data-slide-id='" + slide_id_string + "' href='#'>" + slide.title + "</a>";
				}
				else {
					slide_html += "<span>" + slide.title + "</span>";
				}
			}
			else {
				slide_html += "<a class='nav-module-slide' data-section-id='" + section_id_string + "' data-slide-id='" + slide_id_string + "' href='#'>" + slide.title + "</a>";
			}
			//slide_html += "<a class='nav-module-slide' data-section-id='"+section_id_string+"' data-slide-id='"+slide_id_string+"' href='#'>"+slide.title+"</a>";
			slide_html += "<li>";
			//console.log("-------------------");
			html = html + slide_html;
		}
		html = html + "<li class='divider'><hr></li>";
	}
	$('.nav').html(html);
}

function get_section_count() {
	return module_config.sections.length;
}

function get_slide_count(section_id) {
	return module_config.sections[section_id - 1].slides.length;
}

function is_first_slide() {
	if (bookmark.current.section_id == 1 && bookmark.current.slide_id == 1) {
		return true;
	}
	return false;
}

function is_first_section_slide() {
	if (bookmark.current.slide_id == 1) {
		return true;
	}
	return false;
}

function is_last_slide() {
	if (bookmark.current.section_id >= get_section_count() &&
		bookmark.current.slide_id >= get_slide_count(bookmark.current.section_id)
	) {
		return true;
	}
	return false;
}

function get_last_slide() {
	last_section = module_config.sections[module_config.sections.length - 1];
	return last_section.slides[last_slide.slides.length - 1]
}

function get_current_slide() {
	return module_config.sections[bookmark.current.section_id - 1].slides[bookmark.current.slide_id - 1];
}

function get_prev_slide() {
	if (is_first_slide()) {
		return false;
	}
	if (bookmark.current.slide_id <= 1) {
		bookmark.current.section_id -= 1;
		bookmark.current.slide_id = get_slide_count(bookmark.current.section_id);
	}
	else {
		bookmark.current.slide_id -= 1;
	}
	return get_current_slide();
}

function get_next_slide() {
	if (is_last_slide()) {
		return false;
	}
	if (bookmark.current.slide_id >= module_config.sections[bookmark.current.section_id - 1].slides.length) {
		bookmark.current.section_id += 1;
		bookmark.current.slide_id = 1;
	}
	else {
		bookmark.current.slide_id += 1;
	}
	if (current_slide_is_further()) {
		bookmark.furthest.section_id = bookmark.current.section_id;
		bookmark.furthest.slide_id = bookmark.current.slide_id;
	}
	scorm.setvalue('cmi.location', JSON.stringify(bookmark));
	scorm.commit();
	return get_current_slide();
}


function has_further_slide() {
	//console.log("has_further_slide : "+bookmark.current.section_id+" / "+bookmark.current.slide_id+" | "+bookmark.furthest.section_id+" / "+bookmark.furthest.slide_id+" / ");
	if (bookmark.furthest.section_id > bookmark.current.section_id) {
		return true;
	}
	else if (bookmark.furthest.section_id == bookmark.current.section_id && bookmark.furthest.slide_id > bookmark.current.slide_id) {
		return true;
	}
	return false;
}

function current_slide_is_further() {
	//console.log("current_slide_is_further : "+bookmark.current.section_id+" / "+bookmark.current.slide_id+" | "+bookmark.furthest.section_id+" / "+bookmark.furthest.slide_id+" / ");
	if (bookmark.current.section_id == bookmark.furthest.section_id && bookmark.current.slide_id > bookmark.furthest.slide_id) {
		return true;
	}
	else if (bookmark.current.section_id > bookmark.furthest.section_id) {
		return true;
	}
	return false;
}

function bootstrap_slide(slide, callback) {
	regenerate_nav_permissions();
	hide_all_overlays();
	// Disable Current Video(s)
	$('#video-current').attr('src', '');
	$('audio-current').attr('src', '');
	$('#module-video-wrapper-content').remove();
	$('#module-content').css("background-image", "");
	$('#module-content').css("background-size", "");
	$('#module-content').removeClass('scroll');
	if (slide.type == 'video') {
		return bootstrap_video_slide(slide, function() {
			if (!is_first_slide()) {
				$('#video-btn-prev').removeClass('disabled');
				$('#video-btn-prev').attr("disabled", false);
			}
			if (!module_config.is_locked && !is_last_slide()) {
				$('#video-btn-next').removeClass('disabled');
				$('#video-btn-next').attr("disabled", false);
				$('#video-btn-forward').removeClass('disabled');
				$('#video-btn-forward').attr("disabled", false);
			}
			if (module_config.is_locked && has_further_slide()) {
				$('#video-btn-next').removeClass('disabled');
				$('#video-btn-forward').removeClass('disabled');
				$('#video-btn-next').attr("disabled", false);
				$('#video-btn-forward').attr("disabled", false);

			}
			if (!module_config.is_locked && is_last_slide()) {
				$('#video-btn-forward').removeClass('disabled');
				$('#video-btn-forward').attr("disabled", false);
			}
			return callback();
		});
	}
	else if (slide.type == 'knowledge-check') {
		return bootstrap_knowledge_check_slide(slide, function() {
			return callback();
		});
	}
	else if (slide.type == 'assessment') {
		return bootstrap_assessment_slide(slide, function() {
			return callback();
		});
	}
	else if (slide.type == 'outcome') {
		return bootstrap_outcome_slide(slide, function() {
			return callback();
		});
	}
	else if (slide.type == 'click-target') {
		return bootstrap_click_target(slide, function() {
			return callback();
		});
	}
	else if (slide.type == 'fill-in-the-blanks') {
		return bootstrap_fill_in_the_blanks_slide(slide, function() {
			return callback();
		});
	}
	else if (slide.type == 'scenario') {
		return bootstrap_scenario_slide(slide, function() {
			return callback();
		})
	}
	else if (slide.type == 'drag-drop-targets') {
		return bootstrap_drag_drop_target_slide(slide, function() {
			return callback();
		});
	}else if (slide.type == 'drag-drop-list') {
		return bootstrap_drag_drop_list_slide(slide, function() {
			return callback();
		});
	}else if (slide.type == 'drag-drop-puzzle') {
		return bootstrap_drag_drop_puzzle_slide(slide, function() {
			return callback();
		});
	}else if (slide.type == 'checkboxes') {
		return bootstrap_checkboxes_slide(slide, function() {
			return callback();
		});
	}else if (slide.type == 'image-highlight') {
		return bootstrap_image_highlight_slide(slide, function() {
			return callback();
		});
	}
	return callback();
}

function config_style() {
	$('.configBgColour').css('background-color', module_config.layout.bgColour);
	$('.configBborderColor').css('border-bottom-color', module_config.layout.borderColour[0]);
	$('.configTborderColor').css('border-top-color', module_config.layout.borderColour[1]);
	$('.configBborderColor').css('border-left-color', module_config.layout.borderColour[0]);
	$('.configTborderColor').css('border-right-color', module_config.layout.borderColour[1]);
	$('.configHLColor1').css('background-color', module_config.layout.highlightColour[0]);
	$('.configHLColor2').css('background-color', module_config.layout.highlightColour[1]);
	$('#config_styles').remove();
	$("<style type='text/css' id='config_styles'>" +
		".btn.btn-answer { color:" + module_config.layout.questionHighlightColour[0] + "; background-color:" + module_config.layout.questionBgColour[0] + "; border-color:" + module_config.layout.questionBorderColour[0] + ";} " +
		".btn.btn-answer.active{ color:" + module_config.layout.questionHighlightColour[1] + "; background-color:" + module_config.layout.questionBgColour[1] + "; border-color:" + module_config.layout.questionBorderColour[1] + ";} " +
		".dragable { color:" + module_config.layout.questionHighlightColour[0] + "; background-color:" + module_config.layout.questionBgColour[0] + "; border-color:transparent;} " +
		".dragable.active{ color:" + module_config.layout.questionHighlightColour[1] + "; background-color:" + module_config.layout.questionBgColour[1] + "; border-color:transparent;} " +
		".dropable { color:" + module_config.layout.questionHighlightColour[0] + "; background-color:transparent; border-color:" + module_config.layout.questionBorderColour[0] + ";} " +
		".dropable.active{ color:" + module_config.layout.questionHighlightColour[1] + "; background-color:transparent;; border-color:" + module_config.layout.questionBorderColour[1] + ";} " +
		".drop_label { color:" + module_config.layout.questionHighlightColour[0] + "; background-color:" + module_config.layout.questionBgColour[0] + "; border-color:" + module_config.layout.questionBorderColour[0] + ";} " +
		".puzzle_left_bg_color { color:" + module_config.layout.questionHighlightColour[0] + "; background-color:" + module_config.layout.questionBgColour[0] + "; border-color:" + module_config.layout.questionBorderColour[0] + ";} " +
		".drag_puzzle_item_bg_color { color:" + module_config.layout.questionHighlightColour[0] + "; background-color:" + module_config.layout.questionBgColour[0] + "; border-color:" + module_config.layout.questionBorderColour[0] + ";} " +
		".puzzle_left { color:" + module_config.layout.questionHighlightColour[0] + "; } " +
		".drag_puzzle_item { color:" + module_config.layout.questionHighlightColour[0] + "; }" +
		"input[type='checkbox']:checked + .indicator { background-color:" + module_config.layout.questionBgColour[1] + "; border-color:" + module_config.layout.questionBorderColour[1] + ";} " +
		"input[type='checkbox'] + .indicator { border-color:" + module_config.layout.questionBorderColour[1] + ";} " +
		".popover-content {  color:" + module_config.layout.questionHighlightColour[0] + "; background-color:" + module_config.layout.questionBgColour[0] + "; font-size: 1.15em; border-color:" + module_config.layout.questionBorderColour[1] + ";} " +
		".popover { background: " + module_config.layout.questionBgColour[0] + ";} "+
		".popover.bottom { margin-top: -4em; }"+
		".popover.top { margin-top: 4em; }"+
		".popover.left { margin-left: 4em; }"+
		".popover.right { margin-left: -4em; }"+
		".popover.bottom .arrow:after {border-bottom-color: "+ module_config.layout.questionBgColour[0] + ";}"+
		".popover.top .arrow:after {border-top-color: "+ module_config.layout.questionBgColour[0] + ";}"+
		".popover.left .arrow:after {border-left-color: "+ module_config.layout.questionBgColour[0] + ";}"+
		".popover.right .arrow:after {border-right-color: "+ module_config.layout.questionBgColour[0] + ";}"+

		"</style>").appendTo("head");
	//$("<style type='text/css'> .btn.btn-answer.active{ color:"+module_config.layout.questionHighlightColour[1]+"; background-color:"+module_config.layout.questionBgColour[1]+"; border-color"+module_config.layout.questionBorderColour[1]+";} </style>").appendTo("head");
}

function slideDown_toolbars() {


	$('#module-header-reveal').slideUp();
	$('#module-footer-reveal').slideUp();
	$('#module-header').animate({
		top: "0px"
	}, 500);
	$('#module-footer').animate({
		bottom: "0px"
	}, 500);

	ctrls_hidden = false;

}

function slideUp_toolbars() {

	if(module_config.controls_hide  != false) {


	var hheight = $('#module-header').height();
	var fheight = $('#module-footer').height();
	$('#module-header').animate({
		top: "-" + hheight + "px"
	}, 500, function() {
		$('#module-header-reveal').slideDown(500);
		ctrls_hidden = true;
	});
	$('#module-footer').animate({
		bottom: "-" + fheight + "px"
	}, 500, function() {
		$('#module-footer-reveal').slideDown(500)
	});
	}
}

function slideUp_header() {
	var hheight = $('#module-header').height();
	$('#module-header').animate({
		top: "-" + hheight + "px"
	}, 500, function() {
		$('#module-header-reveal').slideDown(500)
	});
}

function slideDown_header() {
	$('#module-footer-reveal').slideUp();
	$('#module-footer').animate({
		bottom: "0px"
	}, 500, function() {});
}

function slideUp_footer() {
	var fheight = $('#module-footer').height();
	$('#module-footer').animate({
		bottom: "-" + fheight + "px"
	}, 500, function() {
		$('#module-footer-reveal').slideDown(500)
	});
}

function slideDown_footer() {
	$('#module-footer-reveal').slideUp();
	$('#module-footer').animate({
		bottom: "0px"
	}, 500, function() {});
}

function hide_all_overlays() {
	$('#module-info-content').slideUp(500);
	$('#module-alert').slideUp(250);
}
$(window).load(function() {
	if (is_phone_safari_or_uiwebview) {
		setTimeout(function() {
			window.scrollTo(0, 1)
		}, 0);
	}
});
$(window).unload(function() {
	scorm.terminate();
});
