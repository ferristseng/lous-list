urls = {
  "sectiontip": "sectiontip.php"
},
sectionList = loadSectionList(),
selectedList = {},
conflicts = {},
semester = 0;

/*
 * Init of vars
 */
$(function() {
 
  semester = $.QueryString["Semester"];

});

/*
 * Setup new DOM elements
 */
$(function() {
  
  $("body").prepend("" +
    "<div class='lousList_extension'>" +
      "<div id='lousList_extension_savedClassList'>" +
        "<h3>Saved Classes</h3>" +
        "<div class='lousList_extension_actions'>" + 
          "<a href='#' class='lousList_extension_savedClassList_clear'>Remove All</a> - " +
          "<a href='#' class='lousList_extension_savedClassList_clear_selected'>Clear Selected</a>" +
        "</div>" +
        "<ul></ul>" +
      "</div>" +
    "</div>" +
  "");

  for(var i = 0; i < sectionList.list.length; i++) {
    appendToClassList(sectionList.list[i]);
  }

  $("table .UnitName").attr("colspan", 9);

  $("table .CourseName").attr("colspan", 8);

  $("table .S").each(function() {
    if($(this).attr("onclick")) {
      $(this).append("" +
        "<td>" +
          "<a href='#' class='lousList_extension_saveSection'>Save</a>" +
        "</td>" +
      "");
    }
  });

  $("table .CourseName").each(function() {
    $(this).parents("tr").addClass("CourseInfo");
  });

});

/*
 * GUI related
 */

$(function() {

  resizeList();

  $(window).resize(function() {
    resizeList();
  });

  function resizeList() {
    $(".lousList_extension").height($(window).height() - 32);
  }

});
