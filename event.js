/*
 * Attach event listeners
 */
$(function() {

  var hovered = null;

  $(".lousList_extension").scroll(function() {
    if(hovered) {
      positionPopup(hovered);
    }
  });

  $(".lousList_extension_savedClassList_clear").on("click", function(e) {
    e.preventDefault();
    // Remove GUI components
    $("#lousList_extension_savedClassList ul").html("");
    removePopups();

    // Reset conflictList and sectionList
    conflictList.reset();
    sectionList = new SectionList([]);
    sectionList.save();
  });

  $(".lousList_extension_savedClassList_clear_selected").on("click", function(e) {
    e.preventDefault();
    // Reset conflict List
    conflictList.reset();

    // GUI reset of conflict classes
    $("#lousList_extension_savedClassList ul li").each(function() {
      if($(this).hasClass("conflict")) {
        $(this).removeClass("conflict");
      } else if($(this).hasClass("no-conflict")) {
        $(this).removeClass("no-conflict");
      }
    });
  });

  $(".lousList_extension_saveSection").on("click", function(e) {
    e.stopPropagation();
    e.preventDefault();
    // Parse row
    var selectedRow = $(e.target).parents(".S");
    var sectionRowData = parseSectionRow(selectedRow),
        courseRowData = parseCourseRow(selectedRow.prevAll(".CourseInfo:first"));
        course = new Course(courseRowData.courseNbr, courseRowData.courseName),
        section = new Section(course, sectionRowData.sectionNbr, sectionRowData.sectionType,
          sectionRowData.sectionInstructor, sectionRowData.sectionTime, sectionRowData.sectionPlace,
          semester, document.URL);
    // Add class to sectionList
    if(sectionList.add(section)) {
      appendToClassList(section);
    }
  });

  $("body").on("click", ".lousList_extension_class_remove", function(e) {
    e.stopPropagation();
    e.preventDefault();
    // Remove from conflictList and sectionList
    var sectionIdentifier = $(this).attr("id").split("-"),
        removedSection = sectionList.remove(sectionIdentifier[2], sectionIdentifier[1]),
        el = $(this).parent().parent(),
        removedConflicts = conflictList.remove(removedSection, el.hasClass("no-conflict"));
    // Alter GUI components
    for(s in removedConflicts) {
      $("#" + removedConflicts[s])
        .removeClass("conflict").addClass("no-conflict");
    }
    removePopups();
    el.remove();
  });

  $("body").on("click", ".lousList_extension_class", function(e) {
    // Find info about the GUI element clicked
    var el = $(this),
        index = $(".lousList_extension_class").index($(this)),
        section = sectionList.list[index],
        id = el.attr("id");
    // Determine conflicts
    if(el.hasClass("no-conflict")) {
      el.removeClass("no-conflict");
      conflictList.remove(section, true);
    } else if(el.hasClass("conflict")) {
      el.removeClass("conflict");
      var removedConflicts = conflictList.remove(section, false);
      for(s in removedConflicts) {
        $("#" + removedConflicts[s])
          .removeClass("conflict").addClass("no-conflict");
      }
    } else {
      var sectionConflicts = conflictList.add(section); 
      for(var s in sectionConflicts) {
        if(s !== "size" && s !== "key") {
          $("#" + s)
            .removeClass("no-conflict").removeClass("conflict")
            .addClass("conflict");  
        }
      }
      if(sectionConflicts.size > 0) {
        $(this).addClass("conflict");
      } else {
        $(this).addClass("no-conflict");
      }
    }
  });

  var interval;

  $("body").on({
    "mouseenter": function() {
      var el = $(this), 
          index = $(".lousList_extension_class").index(el),
          section = sectionList.list[index];
      interval = setInterval(function() {
        $.ajax({
          url: urls.sectiontip,
          data: { "Semester": section.semester, "ClassNumber": section.nbr },
          dataType: "html",
          success: function(html) {
            var tableBody = $("table:last", $.parseHTML(html));

            // Sanitize TD header
            tableBody.find("tr:first td:first").html("Enrollment:");

            $(".louList_extension_class_popup").remove();
            $("body").prepend("" +
              "<div class='lousList_extension_class_popup'>" +
                "<div class='lousList_extension_class_popup_arrow'></div>" +
                "<div class='lousList_extension_class_popup_inner'>" +
                  "<table>" +
                    tableBody.html() + 
                  "</table>" +
                "</div>" + 
              "</div>");
            positionPopup(el);
            clearInterval(interval);
          }
        });
      }, 1050);
      hovered = el;
    },
    "mouseleave": function() {
      clearInterval(interval);
      $(".lousList_extension_class_popup").remove();
      hovered = null;
    }
  }, ".lousList_extension_class");

  function parseSectionRow(row) {
    var tableCells = row.find("td"),
        data = {
          "sectionNbr":         $.trim(tableCells[0].innerText),
          "sectionType":        $.trim(tableCells[2].innerText),
          "sectionInstructor":  $.trim(tableCells[5].innerText),
          "sectionPlace":       $.trim(tableCells[7].innerText),
          "sectionTime":        $.trim(tableCells[6].innerText)
        }
    return data;
  }

  function parseCourseRow(row) {
    var tableCells = row.find("td"),
        data = {
          "courseNbr":          $.trim(tableCells[0].innerText),
          "courseName":         $.trim(tableCells[1].innerText)
        }
    return data;
  }

  /*
   * Position a popup relative to el
   */
  function positionPopup(el) { 
    var offsetTop = el.offset().top - $(window).scrollTop(),
        popup = $(".lousList_extension_class_popup"),
        popupTop = 8,
        arrowTop = 0;
    // Popup positioning
    if(offsetTop + (popup.outerHeight() / 2) + (el.outerHeight() / 2) > $(window).height()) {
      // Treat the case if the popup overflows the window from the bottom
      popupTop = offsetTop - popup.outerHeight() + el.outerHeight() - 1;
      arrowTop = popup.outerHeight() - (el.outerHeight() / 2) - 12
    } else if(offsetTop - (popup.outerHeight() / 2) + (el.outerHeight() / 2) < 0) {
      // Treat the case if the popup overflows past the top      
      arrowTop = offsetTop + (el.outerHeight() / 2) - 18
    } else {
      popupTop = offsetTop - (popup.outerHeight() / 2) + (el.outerHeight() / 2);
      arrowTop = (popup.outerHeight() / 2) - 12;
    }
    popup.css({
      "top": popupTop
    });
    $(".lousList_extension_class_popup_arrow").css({
      "top": arrowTop
    });
  }
  
  function removePopups() {
    $(".lousList_extension_class_popup").remove();
  }

});
