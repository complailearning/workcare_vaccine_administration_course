function bootstrap_video_slide(slide, callback) {
	section_id = bookmark.current.section_id;
	slide_id = bookmark.current.slide_id;
	// Get Current Slide Count
	current_slide_count = 0;
	for ($i = 0; $i < section_id; $i++) {
		if ((section_id - 1) == $i) {
			current_slide_count += slide_id;
		}
		else {
			current_slide_count += module_config.sections[$i].slides.length;
		}
	}
	// Get Total Slide Count
	total_slides = 0;
	for ($i = 0; $i < module_config.sections.length; $i++) {
		total_slides += module_config.sections[$i].slides.length;
	}
	$('#module-content').html(
		Mustache.to_html($('#module-video-content-template').html(), {}));
	video_src = "<video id='video-current' class='' width='100%' height='auto' autoplay='autplay' webkit-playsinline>";
	switch (slide.location) {
		case "external":
			var external_src = "";
			var current_format = "";
			var ext_sorted = slide.external.sort(function(a, b) {
				if (a.format < b.format) {
					return -1;
				}
				else if (a.format > b.format) {
					return 1;
				}
				else if (a.min_size < b.min_size) {
					return -1;
				}
				else if (a.min_size > b.min_size) {
					return 1;
				}
				else {
					return 0;
				}
			});
			var format_srcs = {};
			$.each(ext_sorted, function(i, item) {
				if ($('#module-video-content').width() >= item.min_size) {
					format_srcs[item.format] = '<source src="' + item.link + '" type="video/' + item.format + '"></source>';
				}
			});
			$.each(format_srcs, function(i, item) {
				video_src += item;
			});
			break;
		default:
			$.each(slide.formats, function(i, item) {
				video_src += '<source src="' + module_config.content_path + 'sections/' + section_id + '/slides/' + slide_id + '/video.' + item + '" type="video/' + item + '"></source>';
			});
	}
	video_src += "</video>";
	$('#module-video-content').html(video_src);
	// Render Footer
	$('#module-footer').html(
		Mustache.to_html($('#module-video-footer-template').html(), {
			title: slide.title,
			object_str: "Slide",
			object_current: current_slide_count,
			object_total: total_slides,
		}));
	ctrls_hidden = false;
	$('#video-btn-fs-open').bind('click', function() {
		slideUp_toolbars();
	});
	if (slide.info != "") {
		var infoHtmlNav = "";
		var infoHtml = "";
		var i = 1;
		for (var k in slide.info) {
			if (slide.info.hasOwnProperty(k)) {
				infoHtmlNav += "<h3 class='infoLink' onClick=\"gotoInfo('#infoSection" + i + "')\">" + k + "</h3>"
				infoHtml += "<a id='infoSection" + i + "'/>";
				infoHtml += "<h3>" + k + "</h3>";
				infoHtml += slide.info[k];
				i++;
			}
		}
		infoHtmlNav = "<h3>Transcript:</h3>" + infoHtmlNav
		
		infoHtmlNav = "<h2></h2>"
		
		$('#module-info-content-wrapper').html(infoHtmlNav + infoHtml);
		$('#video-btn-info').removeClass('disabled');
		$('#video-btn-info').attr("disabled", false);
		$('#video-btn-info').bind('click', function() {
			$('#module-info-content').slideToggle(500);
			if (is_phone_safari_or_uiwebview) {
				$('#video-current').slideToggle(500);
			}
		});
	}
	$(document).on('mousemove', '#module-video-content', function() {
		if (ctrls_hidden) {
			slideDown_toolbars();
			clearTimeout(autohide_timeout);
			autohide_timeout = setTimeout(slideUp_toolbars, module_config.autohide_time * 2);
		}
	});
	if (!is_phone_safari_or_uiwebview) {
		setTimeout(slideUp_toolbars, module_config.autohide_time);
	}
	video_resize();
	config_style();
	_V_("video-current", {
		preload: "none",
		height: $('#module-content').css('height'),
		width: $('#module-content').css('width')
	}, function() {});
	_V_('video-current').ready(function() {
		//$player = this;
		$current_video = this;
		bind_video_events($current_video);
	});
	//$current_video = $('video-current');
	//bind_video_events($current_video);
	return callback();
}

function gotoInfo(anchor) {
	var offset = $('#module-info-content-wrapper').find(anchor).offset().top;
	var speed = 500;
	$('#module-info-content').animate({
		scrollTop: $('#module-info-content-wrapper').find(anchor).offset().top
	}, speed);
}

function bootstrap_knowledge_check_slide(slide, callback) {
	if (bookmark.current.question_id == undefined) {
		bookmark.current.question_id = 1;
	}
	slideDown_toolbars();
	$('#module-content').addClass('scroll');
	$('#module-content').scrollTop(0);
	section_id = bookmark.current.section_id;
	slide_id = bookmark.current.slide_id;
	total_questions = slide.questions.length;
	$('#module-content').html(
		Mustache.to_html($('#module-knowledge-check-template').html(), {
			title: slide.questions[bookmark.current.question_id - 1].title,
			answer: slide.questions[bookmark.current.question_id - 1].answers[slide.questions[bookmark.current.question_id - 1].answer].text,
			answers: slide.questions[bookmark.current.question_id - 1].answers,
			current_question_id: bookmark.current.question_id,
			section_id: section_id,
			slide_id: slide_id
		}));
	$('#module-footer').html(
		Mustache.to_html($('#module-progress-footer-template').html(), {
			title: slide.title,
			object_str: "Question",
			object_current: bookmark.current.question_id,
			object_total: total_questions,
		}));
	audio_src = "<audio id='audio-current' autoplay='autplay'>";
	if (slide.questions[bookmark.current.question_id - 1].audio.length != 0) {
		$.each(slide.questions[bookmark.current.question_id - 1].audio, function(i, item) {
			audio_src += '<source src="' + module_config.content_path + 'sections/' + section_id + '/slides/' + slide_id + '/' + item.file + '" type="audio/' + item.format + '">';
		});
	}
	audio_src += "</audio>";
	$('#module-audio-content').html(audio_src);
	return callback();
}

function scenario_goto(goto) {
	bookmark.current.scenario_pos = goto;
	current_slide = get_current_slide();
	if (goto != -1) {
		bootstrap_slide(current_slide, function() {});
	}
	else {
		next_slide = get_next_slide();
		if (!next_slide) {
			return false;
		}
		bootstrap_slide(next_slide, function() {});
	}
}

function bootstrap_scenario_slide(slide, callback) {
	if (bookmark.current.scenario_pos == undefined || bookmark.current.scenario_pos == -1) {
		bookmark.current.scenario_pos = 1;
	}
	var scenario_content = slide.slides[bookmark.current.scenario_pos - 1];
	if (scenario_content.type == "scenario-video") {
		section_id = bookmark.current.section_id;
		slide_id = bookmark.current.slide_id;
		$('#module-content').html(Mustache.to_html($('#module-video-content-template').html(), {}));
		video_src = "<video id='video-current' class='box-center' width='100%' height='auto' autoplay='autplay' webkit-playsinline>";
		switch (scenario_content.location) {
			case "external":
				var external_src = "";
				var current_format = "";
				var ext_sorted = slide.external.sort(function(a, b) {
					if (a.format < b.format) {
						return -1;
					}
					else if (a.format > b.format) {
						return 1;
					}
					else if (a.min_size < b.min_size) {
						return -1;
					}
					else if (a.min_size > b.min_size) {
						return 1;
					}
					else {
						return 0;
					}
				});
				var format_srcs = {};
				$.each(ext_sorted, function(i, item) {
					if ($('#module-video-content').width() >= item.min_size) {
						format_srcs[item.format] = '<source src="' + item.link + '" type="video/' + item.format + '"></source>';
					}
				});
				$.each(format_srcs, function(i, item) {
					video_src += item;
				});
				break;
			default:
				$.each(scenario_content.formats, function(i, item) {
					video_src += '<source src="' + module_config.content_path + 'sections/' + section_id + '/slides/' + slide_id + '/scenario/' + bookmark.current.scenario_pos + '/video.' + item + '" type="video/' + item + '"></source>';
				});
		}
		video_src += "</video>";
		$('#module-video-content').html(video_src);
		// Render Footer
		$('#module-footer').html(
			Mustache.to_html($('#module-scenario-video-footer-template').html(), {
				title: scenario_content.title,
				object_str: "Slide",
				goto: scenario_content.goto,
			}));
		ctrls_hidden = false;
		$('#video-btn-fs-open').bind('click', function() {
			slideUp_toolbars();
		});
		if (scenario_content.info != "") {
			var infoHtmlNav = "";
			var infoHtml = "";
			var i = 1;
			for (var k in scenario_content.info) {
				if (scenario_content.info.hasOwnProperty(k)) {
					infoHtmlNav += "<h3 class='infoLink' onClick=\"gotoInfo('#infoSection" + i + "')\">" + k + "</h3>"
					infoHtml += "<a id='infoSection" + i + "'/>";
					infoHtml += "<h3>" + k + "</h3>";
					infoHtml += scenario_content.info[k];
					i++;
				}
			}
			infoHtmlNav = "<h2>Additional information:</h2>" + infoHtmlNav
			infoHtmlNav += "<br>"
			$('#module-info-content-wrapper').html(infoHtmlNav + infoHtml);
			$('#video-btn-info').removeClass('disabled');
			$('#video-btn-info').attr("disabled", false);
			$('#video-btn-info').bind('click', function() {
				$('#module-info-content').slideToggle(500);
				if (is_phone_safari_or_uiwebview) {
					$('#video-current').slideToggle(500);
				}
			});
		}
		$(document).on('mousemove', '#module-video-content', function() {
			if (ctrls_hidden) {
				slideDown_toolbars();
				clearTimeout(autohide_timeout);
				autohide_timeout = setTimeout(slideUp_toolbars, module_config.autohide_time * 2);
			}
		});
		if (!is_phone_safari_or_uiwebview) {
			setTimeout(slideUp_toolbars, module_config.autohide_time);
		}
		video_resize();
		config_style();
		_V_("video-current", {
			preload: "none",
			height: $('#module-content').css('height'),
			width: $('#module-content').css('width')
		}, function() {});
		_V_('video-current').ready(function() {
			//$player = this;
			$current_video = this;
			bind_video_events($current_video);
		});
		//$current_video = $('video-current');
		//bind_video_events($current_video);
	}
	else if (scenario_content.type == "scenario-option") {
		slideDown_toolbars();
		$('#module-content').addClass('scroll');
		$('#module-content').scrollTop(0);
		section_id = bookmark.current.section_id;
		slide_id = bookmark.current.slide_id;
		$('#module-content').html(
			Mustache.to_html($('#module-scenario-options-template').html(), {
				title: scenario_content.title,
				prompt: scenario_content.prompt,
				answers: scenario_content.options,
				scenario_pos: bookmark.current.scenario_pos,
				section_id: section_id,
				slide_id: slide_id
			}));
		$('#module-footer').html(
			Mustache.to_html($('#module-scenario-options-footer-template').html(), {
				title: scenario_content.title,
			}));
		audio_src = "<audio id='audio-current' autoplay='autplay'>";
		if (scenario_content.audio.length != 0) {
			$.each(scenario_content.audio, function(i, item) {
				audio_src += '<source src="' + module_config.content_path + 'sections/' + section_id + '/slides/' + slide_id + '/scenario/' + bookmark.current.scenario_pos + '/' + item.file + '" type="audio/' + item.format + '">';
			});
		}
		audio_src += "</audio>";
		if (scenario_content.background != "" && scenario_content.background != undefined) {
			$('#module-content').css("background-image", "url(" + module_config.content_path + 'sections/' + section_id + '/slides/' + slide_id + '/scenario/' + bookmark.current.scenario_pos + '/' + scenario_content.background + ")");
			$('#module-content').css("background-size", "cover");
		}
		$('#module-audio-content').html(audio_src);
	}
	else if (scenario_content.type == "scenario-outcome") {
		slideDown_toolbars();
		$('#module-content').addClass('scroll');
		$('#module-content').scrollTop(0);
		// Render Knowledge Check Content Area
		$('#module-content').html(
			Mustache.to_html($('#module-scenario-outcome-template').html(), {
				title: scenario_content.title,
				text: scenario_content.text,
				button_text: scenario_content.button_text,
				goto: scenario_content.goto,
				goback: scenario_content.goback,
			}));
		if (scenario_content.goback != -1) {
			$('#module-scenario-outcome-back-btn').removeClass('hidden');
		}
		// Render Footer Status Template
		$('#module-footer').html(
			Mustache.to_html($('#module-outcome-footer-template').html(), {
				title: scenario_content.title,
			}));
		audio_src = "<audio id='audio-current' autoplay='autplay'>";
		if (scenario_content.audio.length != 0) {
			$.each(scenario_content.audio, function(i, item) {
				audio_src += '<source src="' + module_config.content_path + 'sections/' + section_id + '/slides/' + slide_id + '/scenario/' + bookmark.current.scenario_pos + '/' + item.file + '" type="audio/' + item.format + '">';
			});
		}
		audio_src += "</audio>";
		if (scenario_content.background != "" && scenario_content.background != undefined) {
			$('#module-content').css("background-image", "url(" + module_config.content_path + 'sections/' + section_id + '/slides/' + slide_id + '/scenario/' + bookmark.current.scenario_pos + '/' + scenario_content.background + ")");
			$('#module-content').css("background-size", "cover");
		}
		$('#module-audio-content').html(audio_src);
	}
	return callback();
}

function bootstrap_assessment_slide(slide, callback) {
	if (slide.questions.length < module_config.assess_max) {
		total_questions = slide.questions.length;
	}
	else {
		total_questions = module_config.assess_max;
	}
	if (assess_ordered == false) {
		//randomise and crop questions 
		for (var n = 0; n < slide.questions.length - 1; n++) {
			var k = n + Math.floor(Math.random() * (slide.questions.length - n));
			var temp = slide.questions[k];
			slide.questions[k] = slide.questions[n];
			slide.questions[n] = temp;
		}
		slide.questions = slide.questions.slice(0, total_questions);
		assess_ordered = true;
	}
	if (bookmark.current.question_id == undefined) {
		bookmark.current.question_id = 1;
	}
	slideDown_toolbars();
	section_id = bookmark.current.section_id;
	slide_id = bookmark.current.slide_id;
	$('#module-content').addClass('scroll');
	$('#module-content').scrollTop(0);
	if (slide.questions[bookmark.current.question_id - 1].type == undefined || slide.questions[bookmark.current.question_id - 1] == "default") {
		var oid = 0;
		// Render Knowledge Check Content Area
		$('#module-content').html(
			Mustache.to_html($('#module-assessment-template').html(), {
				title: slide.questions[bookmark.current.question_id - 1].title,
				oid: function() {
					return oid++;
				},
				//answer : slide.questions[bookmark.current.question_id  - 1].answers[slide.questions[bookmark.current.question_id  - 1].answer].text,
				answers: slide.questions[bookmark.current.question_id - 1].answers,
				current_question_id: bookmark.current.question_id,
				section_id: section_id,
				slide_id: slide_id
			}));
		audio_src = "<audio id='audio-current' autoplay='autplay'>";
		if (slide.questions[bookmark.current.question_id - 1].audio.length != 0) {
			$.each(slide.questions[bookmark.current.question_id - 1].audio, function(i, item) {
				audio_src += '<source src="' + module_config.content_path + 'sections/' + section_id + '/slides/' + slide_id + '/' + item.file + '" type="audio/' + item.format + '">';
			});
		}
		audio_src += "</audio>";
		$('#module-audio-content').html(audio_src);
	}
	else if (slide.questions[bookmark.current.question_id - 1].type == "drag-drop-targets") {
		bootstrap_drag_drop_target_slide(slide.questions[bookmark.current.question_id - 1], function() {
			return callback();
		}, true);
	}
	else if (slide.questions[bookmark.current.question_id - 1].type == "drag-drop-list") {
		bootstrap_drag_drop_list_slide(slide.questions[bookmark.current.question_id - 1], function() {
			return callback();
		}, true);
	}
	else if (slide.questions[bookmark.current.question_id - 1].type == "drag-drop-puzzle") {
		bootstrap_drag_drop_puzzle_slide(slide.questions[bookmark.current.question_id - 1], function() {
			return callback();
		}, true);
	}
	else if (slide.questions[bookmark.current.question_id - 1].type == "checkboxes") {
		bootstrap_checkboxes_slide(slide.questions[bookmark.current.question_id - 1], function() {
			return callback();
		}, true);
	}
	// Render Footer Status Template
	$('#module-footer').html(
		Mustache.to_html($('#module-progress-footer-template').html(), {
			title: slide.title,
			object_str: "Question",
			object_current: bookmark.current.question_id,
			object_total: total_questions,
		}));
	return callback();
}

function bootstrap_outcome_slide(slide, callback) {
	slideDown_toolbars();
	$('#module-content').addClass('scroll');
	$('#module-content').scrollTop(0);
	// Render Knowledge Check Content Area
	$('#module-content').html(
		Mustache.to_html($('#module-outcome-template').html(), {
			title: slide.title,
			text: slide.text,
			button_text: slide.button_text,
			outward_url: slide.outward_url,
		}));
	// Render Footer Status Template
	$('#module-footer').html(
		Mustache.to_html($('#module-outcome-footer-template').html(), {
			title: slide.title,
		}));
	audio_src = "<audio id='audio-current' autoplay='autplay'>";
	if (slide.audio.length != 0) {
		$.each(slide.audio, function(i, item) {
			audio_src += '<source src="' + module_config.content_path + 'sections/outcome/' + item.file + '" type="audio/' + item.format + '">';
		});
	}
	audio_src += "</audio>";
	$('#module-audio-content').html(audio_src);
	return callback();
}

function bootstrap_fill_in_the_blanks_slide(slide, callback) {
	slideDown_toolbars();
	$('#module-content').addClass('scroll');
	$('#module-content').scrollTop(0);
	// Render Knowledge Check Content Area
	$('#module-content').html(
		Mustache.to_html($('#fill-in-the-blanks-template').html(), {
			title: slide.title,
			text: slide.text,
			button_text: slide.button_text,
			outward_url: slide.outward_url,
		}));
	// Render Footer Status Template
	$('#module-footer').html(
		Mustache.to_html($('#module-outcome-footer-template').html(), {
			title: slide.title,
		}));
	audio_src = "<audio id='audio-current' autoplay='autplay'>";
	if (slide.audio.length != 0) {
		$.each(slide.audio, function(i, item) {
			audio_src += '<source src="' + module_config.content_path + 'sections/outcome/' + item.file + '" type="audio/' + item.format + '">';
		});
	}
	audio_src += "</audio>";
	$('#module-audio-content').html(audio_src);
	return callback();
}
function bootstrap_click_target(slide, callback) {
	slideDown_toolbars();
	$('#module-content').addClass('scroll');
	$('#module-content').scrollTop(0);
	// Render Knowledge Check Content Area
	$('#module-content').html(
		Mustache.to_html($('#click-target-template').html(), {
			title: slide.title,
			text: slide.text,
			img: slide.img,
			button_text: slide.button_text,
			outward_url: slide.outward_url,
		}));
	// Render Footer Status Template
	$('#module-footer').html(
		Mustache.to_html($('#module-outcome-footer-template').html(), {
			title: slide.title,
		}));
	audio_src = "<audio id='audio-current' autoplay='autplay'>";
	if (slide.audio.length != 0) {
		$.each(slide.audio, function(i, item) {
			audio_src += '<source src="' + module_config.content_path + 'sections/outcome/' + item.file + '" type="audio/' + item.format + '">';
		});
	}
	audio_src += "</audio>";
	$('#module-audio-content').html(audio_src);
	return callback();
}

function bootstrap_drag_drop_target_slide(slide, callback, in_assess) {
	var in_assessment = false;
	if (in_assess != undefined) {
		in_assessment = in_assess;
	}
	slideDown_toolbars();
	$('#module-content').addClass('scroll');
	$('#module-content').scrollTop(0);
	section_id = bookmark.current.section_id;
	slide_id = bookmark.current.slide_id;
	/*total_questions = slide.questions.length;*/
	var buildgroups = [];
	var col_w = Math.floor(12 / slide.groups.length);
	item_height = Math.floor($(document).height() / 100 * slide.item_height) + "px	";
	$.each(slide.groups, function(index, item) {
		item.targets = [];
		item.drags = [];
		item.col_w = col_w;
		item.padding_layout = "";
		item.height_layout = item_height;
		if (item.layout.length == 4) {
			$.each(item.layout, function(index_inner, item_inner) {
				item.padding_layout += item_inner + "% ";
			});
		}
		else {
			item.padding_layout = "0% 0% 0% 0%";
		}
		//item.padding_layout  = item.padding_layout.substring(0, item.padding_layout.length - 1);
		buildgroups.push(item);
	});
	$.each(slide.drags, function(index, item) {
		item.margin_layout = "";
		item.height_layout = item_height;
		item.drag_id = index;
		if (item.layout.length == 4) {
			$.each(item.layout, function(index_inner, item_inner) {
				item.margin_layout += item_inner + "% ";
			});
		}
		else {
			item.margin_layout = "0% 0% 0% 0%";
		}
		buildgroups[item.group - 1].drags.push(item);
		buildgroups[item.group - 1].zindex_layout = 10;
	});
	$.each(slide.targets, function(index, item) {
		item.margin_layout = "";
		item.label_margin_layout = "";
		item.height_layout = item_height;
		item.drop_id = index;
		item.label_layout = item.layout.slice();
		if (item.layout.length == 4) {
			if (item.text != "") {
				item.label_layout[0] = 0;
				item.layout[2] = 0;
			}
			$.each(item.layout, function(index_inner, item_inner) {
				item.margin_layout += item_inner + "% ";
			});
			$.each(item.label_layout, function(index_inner, item_inner) {
				item.label_margin_layout += item_inner + "% ";
			});
		}
		else {
			item.label_margin_layout = "0% 0% 0% 0%";
			item.margin_layout = "0% 0% 0% 0%";
		}
		buildgroups[item.group - 1].targets.push(item);
		buildgroups[item.group - 1].zindex_layout = 1;
	});
	$('#module-content').html(
		Mustache.to_html($('#module-drag-drop-targets-template').html(), {
			question_text: slide.question_text,
			instruction_text: slide.instruction_text,
			groups: buildgroups,
			correct: slide.correct_text,
			incorrect: slide.incorrect_text,
			section_id: section_id,
			slide_id: slide_id
		}));
	item_height = Math.floor($('#module-drag-drop-targets-selection').height() / 100 * slide.item_height) + "px";
	$.each(slide.groups, function(index, item) {
		if (item.background != "" && item.background != undefined) {
			$('#' + item.id).css("background-image", "url(" + module_config.content_path + 'sections/' + section_id + '/slides/' + slide_id + '/dragdroptargets/' + item.background + ")");
			$('#' + item.id).css("background-size", "contain");
			$('#' + item.id).css("background-repeat", "no-repeat");
			$('#' + item.id).css("background-position", "center, top");
		}
	});
	$(".dragable").css('min-height', item_height);
	var dragableHeight = 0;
	$.each($(".dragable"), function(index, item) {
		if ($(item).height() > dragableHeight) {
			dragableHeight = Math.floor($(item).height());
		}
	});
	$(".dragable").css('height', dragableHeight);
	$(".dropable").css('height', dragableHeight);
	
	if (in_assessment == false) {
		$('#module-footer').html(
			Mustache.to_html($('#module-scenario-options-footer-template').html(), {
				title: slide.title,
			}));
	}
	else {
		$('#module-drag-drop-targets-submit-btn').addClass('hidden');
		$('#module-drag-drop-targets-submit-assessment-btn').removeClass('hidden');
	}
	
	audio_src = "<audio id='audio-current' autoplay='autplay'>";
	if (slide.audio.length != 0) {
		$.each(slide.audio, function(i, item) {
			audio_src += '<source src="' + module_config.content_path + 'sections/' + section_id + '/slides/' + slide_id + '/' + item.file + '" type="audio/' + item.format + '">';
		});
	}
	audio_src += "</audio>";
	$('#module-audio-content').html(audio_src);
	$(".dragable").draggable({
		snap: ".dropable",
		snapMode: "inner",
		revert: "invalid",
		scroll: true
	});
	$(".dropable").droppable({
		tolerance: "fit",
		drop: function(event, ui) {
			$(ui.draggable[0]).draggable("option", "revert", false);
			$(this).attr("data-draggable", $(ui.draggable[0]).attr("data-id"));
		},
		out: function(event, ui) {
			$(this).attr("data-draggable", "");
		}
	});
	return callback();
}

function bootstrap_drag_drop_list_slide(slide, callback, in_assess) {
	var in_assessment = false;
	if (in_assess != undefined) {
		in_assessment = in_assess;
	}
	slideDown_toolbars();
	$('#module-content').addClass('scroll');
	$('#module-content').scrollTop(0);
	section_id = bookmark.current.section_id;
	slide_id = bookmark.current.slide_id;
	/*total_questions = slide.questions.length;*/
	item_height = Math.floor($(document).height() / 100 * slide.item_height) + "px	";
	
	slide.start.zindex_layout = 10;
	
	slide.start.drags = [];
	
	$.each(slide.drags, function(index, item) {
		item.margin_layout = "";
		item.width_layout = Math.floor((100/Number(slide.start.columns))-(Number(item.layout[1])+Number(item.layout[3])+1))+"%";
		item.height_layout = item_height;
		item.drag_id = index;		
		if (item.layout.length == 4) {
			$.each(item.layout, function(index_inner, item_inner) {
				item.margin_layout += item_inner + "% ";
			});
		}
		else {
			item.margin_layout = "0% 0% 0% 0%";
		}
		slide.start.drags.push(item);
	});
	
		slide.start.padding_layout = "";
		
		if (slide.start.layout.length == 4) {
			$.each(slide.start.layout, function(index_inner, pad_inner) {
				slide.start.padding_layout += pad_inner + "% ";
			});
		}
		else {
			slide.start.padding_layout = "0% 0% 0% 0%";
		}
		
		slide.target.padding_layout = "";
		
		if (slide.target.layout.length == 4) {
			$.each(slide.start.layout, function(index_inner, pad_inner) {
				slide.target.padding_layout += pad_inner + "% ";
			});
		}
		else {
			slide.target.padding_layout = "0% 0% 0% 0%";
		}
		
		$('#module-content').html(
		Mustache.to_html($('#module-drag-drop-lists-template').html(), {
			question_text: slide.question_text,
			instruction_text: slide.instruction_text,
			start: slide.start,
			target : slide.target,
			correct: slide.correct_text,
			incorrect: slide.incorrect_text,
			incorrect_desc: slide.incorrect_text_desc,
			section_id: section_id,
			slide_id: slide_id
		}));
			
	item_height = Math.floor($('#module-drag-drop-lists-selection').height() / 100 * slide.item_height) + "px";
	
		if (slide.target.bgcolour != "") {
		
		$('#drag-target').css("background-color", slide.target.bgcolour);
		}
		
		if (slide.start.bgcolour != "") {
		
		$('#drag-start').css("background-color", slide.start.bgcolour);
		}
		
		if (slide.target.img != "") {
			$('#drag-target').css("background-image", "url(" + module_config.content_path + 'sections/' + section_id + '/slides/' + slide_id + '/dragdroplists/' + slide.target.img + ")");
			$('#drag-target').css("background-size", "cover");
			$('#drag-target').css("background-repeat", "no-repeat");
			$('#drag-target').css("background-position", "center, top");
		}
		if (slide.start.img) {
			$('#drag-start').css("background-image", "url(" + module_config.content_path + 'sections/' + section_id + '/slides/' + slide_id + '/dragdroplists/' + slide.start.img + ")");
			$('#drag-start').css("background-size", "contain");
			$('#drag-start').css("background-repeat", "no-repeat");
			$('#drag-start').css("background-position", "center, top");
		}

	$(".dragable").css('min-height', item_height);
	var dragableHeight = 0;
	var dragableWidth = 0;
	var otherWidth =0;
	$.each($(".dragable"), function(index, item) {
		
		var height = parseInt($(item).css("height"), 10);
	
		if (height > dragableHeight) {
			dragableHeight = Math.floor(height);
		}
		
	});
	
	$(".dragable").css('height', dragableHeight);
	
	$.each($(".dragable"), function(index, item) {
	
		var width = parseInt($(item).css("width"), 10);
	
		if (width > dragableWidth) {
			dragableWidth = Math.floor(width);
		}
		
		
	});
	
	$(".dragable").css('width', dragableWidth);	
		
	$('.dropable').css("height", parseInt($(".dragable").css("height"), 10)*slide.target.rows+(2*2)+"px");
	$('.dropable').css("width", parseInt($(".dragable").css("width"), 10)*slide.target.cols+(2*2)+"px");
	
	
	$('#drag-start').css("height", $("#drag-start").outerHeight());

	if (in_assessment == false) {
		$('#module-footer').html(
			Mustache.to_html($('#module-scenario-options-footer-template').html(), {
				title: slide.title,
		}));
	}
	else {
		$('#module-drag-drop-lists-submit-btn').addClass('hidden');
		$('#module-drag-drop-lists-submit-assessment-btn').removeClass('hidden');
	}
	
	audio_src = "<audio id='audio-current' autoplay='autplay'>";
	if (slide.audio.length != 0) {
		$.each(slide.audio, function(i, item) {
			audio_src += '<source src="' + module_config.content_path + 'sections/' + section_id + '/slides/' + slide_id + '/' + item.file + '" type="audio/' + item.format + '">';
		});
	}
	audio_src += "</audio>";
	$('#module-audio-content').html(audio_src);
	
		$("<style type='text/css' id='drag_list_sizes'>" +
		".drag_list_item_placeholder { width:10px; height:0.5em;} " +
		"</style>").appendTo("head");
	
	$( "#drag-start, #drag-target" ).sortable({
      connectWith: ".connected_drag",
      placeholder:"drag_list_item_placeholder",
      start: function(event, ui) {
      
      }
    }).disableSelection();
    
    $( "#drag-target" ).on( "sortreceive", function(event, ui) {
        if($("#drag-target li").length > slide.target.max_answers){
            $(ui.sender).sortable('cancel');
        } else { 
        	$(ui.item).css('margin', 0);

        }
    });
    
    $( "#drag-start" ).on( "sortreceive", function(event, ui) {
    	
    	var id = $(ui.item).attr("data-id");    	
        $(ui.item).css('margin', slide.start.drags[id].margin_layout);
    });
	
	return callback();
}

function bootstrap_drag_drop_puzzle_slide(slide, callback, in_assess) {
	var in_assessment = false;
	if (in_assess != undefined) {
		in_assessment = in_assess;
	}
	slideDown_toolbars();
	$('#module-content').addClass('scroll');
	$('#module-content').scrollTop(0);
	section_id = bookmark.current.section_id;
	slide_id = bookmark.current.slide_id;
	/*total_questions = slide.questions.length;*/
			
	$.each(slide.drags, function(index, item) {
		item.margin_layout = "";
		item.margin_left = "";
		item.drag_id = index;		
		if (slide.layout.length == 2) {
			$.each(slide.layout, function(index_inner, item_inner) {
				item.margin_layout += item_inner + "% 0%";
			});
		}
		else {
			item.margin_layout = "0% 0%";
		}
				
	});
	
	$.each(slide.left, function(index, item) {
		item.margin_layout = "";
		item.drag_id = index;		
		if (slide.layout.length == 2) {
			$.each(slide.layout, function(index_inner, item_inner) {
				item.margin_layout += item_inner + "% 0%";
			});
		}
		else {
			item.margin_layout = "0% 0%";
		}
	});
		
		$('#module-content').html(
		Mustache.to_html($('#module-drag-drop-puzzle-template').html(), {
			question_text: slide.question_text,
			instruction_text: slide.instruction_text,
			drags: slide.drags,
			left : slide.left,
			correct: slide.correct_text,
			incorrect: slide.incorrect_text,
			section_id: section_id,
			slide_id: slide_id
		}));
			
	item_height = Math.floor($('#module-drag-drop-puzzle-selection').height() / 100 * slide.item_height) + "px";
	

	$(".puzzle_m_height").css('min-height', item_height);
	var dragableHeight = 0;
	var dragableWidth = 0;
	var otherWidth =0;
	$.each($(".puzzle_m_height"), function(index, item) {
		
		var height = parseInt($(item).css("height"), 10);
		
	
		//console.log($(item).text()+" / "+height+" / "+dragableHeight);
		
		if (height > dragableHeight) {
			dragableHeight = Math.floor(height);
		}
		
	});
	
	$(".puzzle_m_height").css('min-height', dragableHeight);
	
	var plwp = $('.puzzle_left').eq(0).outerWidth()/100;
	var plhp = Math.round($('.puzzle_left').eq(0).height()/plwp);
	
	$('.puzzle_left .puzzle_left_bg_color').css("width", 100-plhp+"%");
	
	$('.puzzle_left').css("padding-right", (plhp+1)+"%");

	
	var plwp = $('.drag_puzzle_item').eq(0).outerWidth()/100;
	var plhp = Math.round($('.drag_puzzle_item').eq(0).height()/plwp)+1;
	var plop = Math.floor($('.drag_puzzle_item').eq(0).height()/plwp)-1;

	$('.drag_puzzle_item .drag_puzzle_item_bg_color').css("width", 100-(plop)+"%");
	$('.drag_puzzle_item .drag_puzzle_item_bg_color').css("left", (plop)+"%");
	
	$('.drag_puzzle_item').css("padding-left", (plhp+1)+"%");
	
	$("#drag_puzzle_holder").css('height', $('#drag_puzzle_left').outerHeight());
	
	if (in_assessment == false) {
		$('#module-footer').html(
			Mustache.to_html($('#module-scenario-options-footer-template').html(), {
				title: slide.title,
		}));
	}
	else {
		$('#module-drag-drop-puzzle-submit-btn').addClass('hidden');
		$('#module-drag-drop-puzzle-submit-assessment-btn').removeClass('hidden');
	}
	
	audio_src = "<audio id='audio-current' autoplay='autplay'>";
	if (slide.audio.length != 0) {
		$.each(slide.audio, function(i, item) {
			audio_src += '<source src="' + module_config.content_path + 'sections/' + section_id + '/slides/' + slide_id + '/' + item.file + '" type="audio/' + item.format + '">';
		});
	}
	audio_src += "</audio>";
	$('#module-audio-content').html(audio_src);
	
	var placeholder_margin = "";
	
	if (slide.layout.length == 2) {
			$.each(slide.layout, function(index_inner, item_inner) {
				placeholder_margin += item_inner + "% 0%";
			});
		}
		else {
			placeholder_margin = "0% 0%";
		}
	
	$("<style type='text/css' id='drag_puzzle_sizes'>" +
		".drag_puzzle_item_placeholder { width:10px; height:" + dragableHeight+ "px; margin:"+placeholder_margin+";} " +
		"</style>").appendTo("head");
	
	var start_pos;
	var tolerence = Math.round(Number(($(document).width()/100*plop)/4));
	
	var lhp = $('.drag_puzzle_item').eq(0).css("height");
	
	//console.log("lhp = "+lhp);
	
	$( "#drag_puzzle" ).sortable({
	 axis: "y",
	 placeholder: "drag_puzzle_item_placeholder",
	 revert: 250,
	 distance: dragableHeight,
	 tolerance: "pointer",
      start: function(event, ui) {
      	start_pos = Number(event.pageX);
      },
      sort: function(event, ui) {
          	//console.log(Number(event.pageX)+" / "+Number(start_pos-tolerence)); 
        if($(ui.item).attr("data-locked") == "0") {	
      		if(event.pageX < Number(start_pos-tolerence) ) {
      			$(ui.item).attr("data-locked", "1");
      			$(ui.item).css("margin-left", "-"+lhp );
      			      		//$(ui.item).css("margin-right", ""+(lhp)+"%" );

      		}
      	} else { 
      		$(ui.item).css("margin-left", "-"+lhp );
      		      		//$(ui.item).css("margin-right", ""+(lhp)+"%" );

      	}
      },
      update: function(event, ui) {
      	if($(ui.item).attr("data-locked") == "0") {
      		$(ui.item).css("margin-left", "-"+lhp );
      		//$(ui.item).css("margin-right", ""+(lhp)+"%" );
      	}
      }

    }).disableSelection();
		
	return callback();
}
function bootstrap_checkboxes_slide(slide, callback, in_assess) {
	var in_assessment = false;
	if (in_assess != undefined) {
		in_assessment = in_assess;
	}
	slideDown_toolbars();
	$('#module-content').addClass('scroll');
	$('#module-content').scrollTop(0);
	section_id = bookmark.current.section_id;
	slide_id = bookmark.current.slide_id;
	//total_questions = slide.questions.length;
	
	var item_height = Math.floor($(document).height() / 100 * slide.item_height) + "px	";

	
	$.each(slide.answers, function(index, item) { 
	
		item.margin_layout = "";
		item.id = index;
		item.width_layout = slide.input_size+"%";
		item.width_container = Math.floor((100/Number(slide.columns))-(Number(slide.layout[1])+Number(slide.layout[3])+1))+"%";
		if (slide.layout.length == 4) {
			$.each(slide.layout, function(index_inner, item_inner) {
				item.margin_layout += item_inner + "% ";
			});
		} else {
			item.margin_layout = "0% 0% 0% 0%";
		}	
	
	});

	$('#module-content').html(
		Mustache.to_html($('#module-checkboxes-template').html(), {
			title: slide.title,
			answers: slide.answers,
			instruction_text: slide.instruction_text,
			question_text: slide.question_text,
			correct: slide.correct_text,
			incorrect: slide.incorrect_text,
			section_id: section_id,
			slide_id: slide_id
		}));	
		
	var input_size = 0;
	$.each($(".input_size"), function(index, item) {
		
		var width = parseInt($(item).css("width"), 10);
		
		if (width > input_size) {
			input_size = Math.floor(width);
		}
		
		$(item).css("height", width+"px");
		
	});
	
	$(".input_chk_size").css("width", $('.input_line').eq(0).width()+"px");
	$(".input_chk_size").css("height", input_size+"px");
	
	$(".input_size").css("width", input_size+"px");
	$(".input_size").css("height", input_size+"px");
	
		
	if (in_assessment == false) {
		$('#module-footer').html(
			Mustache.to_html($('#module-scenario-options-footer-template').html(), {
				title: slide.title,
		}));
	}
	else {
		$('#module-checkboxes-submit-btn').addClass('hidden');
		$('#module-checkboxes-submit-assessment-btn').removeClass('hidden');
	}
	
	audio_src = "<audio id='audio-current' autoplay='autplay'>";
	if (slide.audio.length != 0) {
		$.each(slide.audio, function(i, item) {
			audio_src += '<source src="' + module_config.content_path + 'sections/' + section_id + '/slides/' + slide_id + '/' + item.file + '" type="audio/' + item.format + '">';
		});
	}
	audio_src += "</audio>";
	$('#module-audio-content').html(audio_src);  
	
	return callback();
}
function bootstrap_image_highlight_slide(slide, callback) {
	slideDown_toolbars();
	setTimeout(slideUp_toolbars, 2000);
	$('#module-content').addClass('scroll');
	$('#module-content').scrollTop(0);
	section_id = bookmark.current.section_id;
	slide_id = bookmark.current.slide_id;
	//total_questions = slide.questions.length;
	
	
	$.each(slide.highlights, function(index, item) { 
	
		item.id = index;
		item.top = item.layout[0][0]+"%";
		item.left = item.layout[0][1]+"%";
		item.width = item.layout[1][0]+"%";
		item.height = item.layout[1][1]+"%";
		
		if(item.dir == "") {
			item.dir = "right";
		}
		
	
	});

	$('#module-content').html(
		Mustache.to_html($('#module-image-highlights-template').html(), {
			title: slide.title,
			highlights: slide.highlights,
			section_id: section_id,
			slide_id: slide_id
		}));	
		
		$('#module-image-highlights').css("background-color", slide.backgroundColour);
		$('#highlight_background').css("background-image", "url(" + module_config.content_path + 'sections/' + section_id + '/slides/' + slide_id + '/' + slide.background + ")");
		$('#highlight_background').css("background-size", "cover");
		$('#highlight_background').css("background-repeat", "no-repeat");
		$('#highlight_background').css("background-position", "center, center");
		
		var height = slide.backgroundSize[1];
		var width = slide.backgroundSize[0];
		var aspect = width / height;

		if($(window).height() < $(window).width()) {
    		var resizedHeight = $(window).height();
    		var resizedWidth = resizedHeight * aspect;
		} else { // screen width is smaller than height (mobile, etc)
   			var resizedWidth = $(window).width();
    		var resizedHeight = resizedWidth / aspect;      
		}
		
		$('#highlight_background').css("width", resizedWidth+"px");
		$('#highlight_background').css("height", resizedHeight+"px");
		
		if(slide.debug == 1) { 
		
			$('.highlight').css("background-color", "cyan");
		
		}
		
		$('#module-footer').html(
			Mustache.to_html($('#module-image-highlights-footer-template').html(), {
				title: slide.title,
				instruction_text: slide.instruction_text,
		}));
		
		$(".highlight").popover({
		html : true,
		content: function () {
   			var id = $(this).attr("data-id");
		    return slide.highlights[id].text;
		}});
		$('.highlight').click(function(){
   			$('.highlight').not(this).popover('hide'); //all but this
		});
		
		var next_animate = function() {
			
			var nextBtn = $('#image-highlight-btn-next')
		
    		nextBtn.animate( {opacity: 0.5}, {duration :500, start : function () {nextBtn.css('background-color', '#66ff66')}} )
        	    .animate( {opacity: 1}, {duration :500, complete : function () {nextBtn.css('background-color', 'none'); next_animate();}})
  		}

 	 	next_animate();
			
	audio_src = "<audio id='audio-current' autoplay='autplay'>";
	if (slide.audio.length != 0) {
		$.each(slide.audio, function(i, item) {
			audio_src += '<source src="' + module_config.content_path + 'sections/' + section_id + '/slides/' + slide_id + '/' + item.file + '" type="audio/' + item.format + '">';
		});
	}
	audio_src += "</audio>";
	$('#module-audio-content').html(audio_src);  
	
	return callback();
}
