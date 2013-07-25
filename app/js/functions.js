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
      })(jQuery);
    }

};
