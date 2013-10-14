var user_id;
var username;
var defaultuserphoto = "http://www.gravatar.com/avatar/none";
var userphoto = defaultuserphoto;

jQuery(document).ready(function() {
  (function($) {

    // Check if the user has an id. If so assign it otherwise create it.
    if(wc.getCookie("user_id")) {
      user_id = wc.getCookie("user_id");
    }
    else {
      user_id = Math.floor((Math.random()*100000000000000000000000000000)+1);
      wc.setCookie("user_id",user_id,365);
    }

    // Check if the user has a photo for this room. If so assign it otherwise create it.
    if(wc.getCookie("userphoto")) {
      userphoto = wc.getCookie("userphoto");
      $("#settings-userphoto").val(userphoto);
    }
    wc.updateChatPhoto(userphoto,user_id);

    // Set the username or prompt for it if its needed
    if(wc.getCookie("username") === null || typeof wc.getCookie("username") === "undefined" || wc.getCookie("username") === "Guest") {
      username = 'Guest';
    } else {
      username = wc.getCookie("username");
      $("#settings-username").val(username);
    }

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
    else if($("#settings-username").val() === "") {
      $("#settings-icon").click();
    }
  })( jQuery ); // End scripts
});
