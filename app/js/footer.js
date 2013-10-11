/*
GLOBAL VARIABLES
*/
wc.variablename = ""; 


$("#settings-icon").click(function(){
  if($(this).hasClass("open")) {
    $("#settings-panel").animate({ right: "-350px"},500);
    $("#settings-icon").animate({ right: "10px" },500, function(){
      $(this).removeClass("open");
    });
  }
  else {
    $("#settings-panel").animate({ right: 0},500);
    $("#settings-icon").animate({ right: $("#settings-panel").width() +10 + "px" },500,function(){
      $(this).addClass("open");
    });
  }
});


$("#see-disclaimer").click(function(){
  $("#disclaimer").toggleClass("hidden");
});

$("#settings-update").click(function(){
  $("#settings-icon").click();
  wc.changeName();
  wc.changePhoto();
});

/*
IE10 styling
*/
var ie_version = wc.getIEVersion();
if (ie_version.major == 10) {
  $("body").wrapInner("<div class='ie10'>");
}
wc.autoVertPadding(".vp-auto",".content");

// First time whisper chirp users
if(wc.getCookie("visited_before") != "true") {
  wc.setCookie("visited_before","true",365);
  $("#see-disclaimer").click();
  $("#settings-icon").click();
}
