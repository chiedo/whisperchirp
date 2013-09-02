jQuery(document).ready(function() {
  (function($) {
    /*
    GLOBAL VARIABLES
    */
    wc.variablename = ""; 

    /*
    IE10 styling
    */
    var ie_version = wc.getIEVersion();
    if (ie_version.major == 10) {
      $("body").wrapInner("<div class='ie10'>");
    }
    wc.autoVertPadding(".vp-auto",".content");
  })( jQuery ); // End scripts
});
