/*
 * FUNCTIONS
 */
var wc = {
    isSubstring: function(outer, inner) {
      return (function($) {
        outer = outer.toLowerCase();
        inner = inner.toLowerCase();

        if(outer.indexOf(inner) !== -1) return true;
        else return false;
      })( jQuery );
    },
    getCookie: function(c_name) {
      return (function($) {
        var c_value = document.cookie;
        var c_start = c_value.indexOf(" " + c_name + "=");
        if (c_start == -1) c_start = c_value.indexOf(c_name + "=");
        if (c_start == -1) c_value = null;
        else {
          c_start = c_value.indexOf("=", c_start) + 1;
          var c_end = c_value.indexOf(";", c_start);
          if (c_end == -1) c_end = c_value.length;
          c_value = unescape(c_value.substring(c_start,c_end));
        }
        return c_value;
      })( jQuery );
    },
    setCookie: function(c_name,value,exdays) {
      (function($) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
        document.cookie=c_name + "=" + c_value;
      })( jQuery );
    },
    deleteCookie: function(c_name) {
      (function($) {
        document.cookie=c_name + "=;expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      })( jQuery );
    },
    setMobileMenuVars: function(x) {
      return (function($) {
        var link, text;
        if(x.find("a").length > 0) {
          link = x.find("a").first().attr("href");
          text = x.find("a").first().text();
        }
        else {
          link = "none";
          text = x.text();
        }
        return new Array(link,text);
      })( jQuery );
    },
    resetRange: function(x) {
      (function($) {
       if (x.setSelectionRange) { 
              x.focus(); 
              x.setSelectionRange(0, 0); 
          } else if (x.createTextRange) { 
              var range = x.createTextRange();  
              range.moveStart('character', 0); 
              range.select(); 
          } 
      })( jQuery );
    },
    randomHex: function() {
      return (function($) {
        var x = '#'+(Math.random()*0xFFFFFF<<0).toString(16);
        // Checks to make sure the user hex value wasnt selected
        if (x.indexOf("1464") !== -1) return '#'+(Math.random()*0xFFFFFF<<0).toString(16);
        else return x;
      })(jQuery);
    },
    setUserColors: function(x,y) {
      (function($) {
        $('#dynamic-style').append(".u"+x+" .chat-message-picture img { border-color: "+y+"; }");
        $('#dynamic-style').append(".users-online-pane .u"+x+" .chat-online-block { background-color: "+y+"; }");
      })(jQuery);
    },
    newUser: function(user_id,username) {
      (function($) {
        users_online.push(user_id);
        $("#users-online-pane").append("<div class='chat-user-online u"+user_id+"'><div class='chat-online-block'></div><div class='chat-username'>"+username +"</div></div>");

        if(chat_colors.length > 0) {
          wc.setUserColors(user_id,chat_colors[0]);
          chat_colors.splice(0,1);
        }
        else {
          wc.setUserColors(user_id,wc.randomHex());
        }
      })(jQuery);
    },
    changeName: function() {
      (function($) {
        username = prompt("Please enter your name (15 characters or less):"); 
        if(username === null || typeof username === "undefined") { 
          username = wc.getCookie(chatroom+"&username");
        } 
        else {
          username = jQuery.trim(username).substring(0,15);
        }
        if(username === null || typeof username === "undefined" || username === "") { 
          username = "Guest";
        }
        wc.setCookie(chatroom+"&username",username,365);
        $(".u"+user_id+" .chat-username").text(username);

        socket.emit('name change',{username: username, user_id: user_id, chatroom: chatroom});
      })(jQuery);
    },
    changePhoto: function() {
      (function($) {
        useremail = prompt("Please enter your email address (gravatar account required)."); 
        useremail = jQuery.trim(useremail);
        userphoto = "http://www.gravatar.com/avatar/"+md5(useremail); 

        wc.setCookie(chatroom+"&userphoto",userphoto,365);
        wc.updateChatPhoto(userphoto,user_id);
        socket.emit('send photo change',{userphoto: userphoto, user_id: user_id, chatroom: chatroom});
      })(jQuery);
    },
    updateChatPhoto: function(path,user_id) {
      (function($) {
        $(".u"+user_id+" .chat-userphoto").attr("src",path);
      })(jQuery);
    },
    updateUsersInChatroom: function(x) {
      (function($) {
        $(".users-in-chatroom").text(x);
      })(jQuery);
    }

};
