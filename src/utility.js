/*
 * Code taken from http://stackoverflow.com/a/3855394
 * Indexes current URL's query string
 */
(function($) {
  $.QueryString = (function(a) {
    if(a == "") {
      return { };
    }
    var b = { };
    for(var i = 0; i < a.length; i++) {
      var p = a[i].split('=');
      if(p.length != 2) {
        continue;
      }
      b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
  })(window.location.search.substr(1).split('&'))
})(jQuery);

/*
 * Append a Section object to the
 * GUI class list
 */ 
function appendToClassList(section) {
  $("#lousList_extension_savedClassList ul").append("" +
    "<li class='lousList_extension_class " + section.nbr + "' id='" + section.semester + "-" + section.nbr + "'>" +
      "<p>" + 
        section.course.nbr + " " + section.course.name + "<br />" +
        section.nbr + " - " + section.type + "<br />" +
        section.instructor + " - " + section.place + "<br />" + 
        section.time.raw +
      "</p>" + 
      "<p>" +
        "<a href='" + section.source + "'>Source</a> - " + 
        "<a href='#' class='lousList_extension_class_remove' id='remove-" + section.semester + "-" + section.nbr+ "'>" +
          "Remove" +
        "</a>" +
      "</p>" +
    "</li>" +
  "");  
}

