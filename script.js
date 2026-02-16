var drops = 0;
var incorrectCountFill = 0;
function fillInTheBlanks(){
$(document).ready(function() {
  // var leftCompensation = (1880 - screen.width)/4;
  // var left = parseInt($("#draggable1").css("left"));
  // $("#draggable1").css("left", left - leftCompensation + "px")
  $(".draggable").draggable({
    // revert: true
    snap: ".ui-droppable",
    snapMode: "inner",
    containment: "parent"  
  });
  $(".droppable").droppable({
    // the activeClass option specifies the class to add to
    // the droppable when it is a possible candidate for
    // a draggable element
    activeClass: "active",

    // here we specify the function to be run when the drop event
    // is triggered.
    drop: function (event, ui) {
      // blink($(this));
      $(this).html(ui.draggable.text());
      $(this).attr('itemText', ui.draggable.text());
      drops++;

    }
  });
});
}

function fillInTheBlanksCheckAnswers(){
  // if(
  //   $("#droppable1").attr('itemText') === "customer" && $("#droppable2").attr('itemText') === "impression" && $("#droppable3").attr('itemText') === "judge"
  //   ){
  //   $("#fill-in-the-blanks-correct-message").removeClass("hidden");
  //   $("#fill-in-the-blanks-submit-btn").removeClass("hidden");

  // } else {
  //   $("#fill-in-the-blanks-incorrect-message").removeClass("hidden");
  //   $("#module-assessment-retry-btn").removeClass("hidden");
  // }
  // $("#fill-in-the-blanks-check-answer").hide();

  if(drops >= 4){
    $("#fill-in-the-blanks-correct-message").removeClass("hidden");
    $("#fill-in-the-blanks-submit-btn").removeClass("hidden");
    incorrectCountFill = 0;
  } else {
  	if(incorrectCountFill == 0){
		$("#fill-in-the-blanks-incorrect-message").removeClass("hidden");
		$("#module-assessment-retry-btn").removeClass("hidden");
		incorrectCountFill++;
  	} else {
		$("#fill-in-the-blanks-incorrect-message-desc").removeClass("hidden");
	    $("#fill-in-the-blanks-submit-btn").removeClass("hidden");
	    incorrectCountFill = 0;
  	}
  }
  $("#fill-in-the-blanks-check-answer").hide();
  drops = 0;
}

var incorrectCount = 0;
function clickTarget(){
$(document).ready(function() {

});
}

function correctClickTarget(){
  $("#click-target-incorrect-message").addClass("hidden");
  $("#module-assessment-retry-btn").addClass("hidden");
  $("#click-target-incorrect-message-desc").addClass("hidden");
	$("#click-img").removeAttr("onclick");

  $("#click-target-correct-message").removeClass("hidden");
  $("#click-target-submit-btn").removeClass("hidden");
  $("#click-img").attr("src", "assets/imgs/img1.png");
  incorrectCount = 0;
}

function incorrectClickTarget(){
  $("#click-target-correct-message").addClass("hidden");
  $("#click-target-submit-btn").addClass("hidden");
	$("#click-target-incorrect-message-desc").addClass("hidden");
	$("#click-img").removeAttr("onclick");

  if(incorrectCount == 0){
	  $("#click-target-incorrect-message").removeClass("hidden");
	  $("#module-assessment-retry-btn").removeClass("hidden");
	    incorrectCount++;
  } else {
  	  $("#click-target-incorrect-message-desc").removeClass("hidden");
	  $("#click-target-submit-btn").removeClass("hidden");
	  $("#click-img").attr("src", "assets/imgs/img1.png");
	  incorrectCount = 0;	
  }

}





// FILL IN THE CHARACTERS
function fillInTheCharacters(){
  $(document).ready(function() {
    $(".draggable-character").draggable({
      // revert: true
      snap: ".ui-droppable",
      snapMode: "inner"
    });
    $(".droppable-character").droppable({
      activeClass: "active",
  
      drop: function (event, ui) {
        // $(this).html(ui.draggable.text());
        $(this).attr('itemText', ui.draggable.text());
      }
    });
  });
  }

  function fillInTheCharactersCheckAnswers(){
    if(
      $("#droppable1").attr('itemText') === "E" 
      && $("#droppable2").attr('itemText') === "R"
      && $("#droppable3").attr('itemText') === "A"
      && $("#droppable4").attr('itemText') === "R"
      && $("#droppable5").attr('itemText') === "T"
      && $("#droppable6").attr('itemText') === "E"
      && $("#droppable7").attr('itemText') === "O"
      && $("#droppable8").attr('itemText') === "D"
      && $("#droppable9").attr('itemText') === "A"
      && $("#droppable10").attr('itemText') === "N"
      && $("#droppable11").attr('itemText') === "A"
      && $("#droppable12").attr('itemText') === "G"
      ){
        $("#fill-in-the-blanks-correct-message").removeClass("hidden");
    } else {
        $("#fill-in-the-blanks-incorrect-message").removeClass("hidden");
        $("#module-assessment-retry-btn").removeClass("hidden");
    }
    $("#fill-in-the-characters-check-answer").hide();
    $("#fill-in-the-characters-submit-btn").removeClass("hidden");
  }