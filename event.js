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
    $("#lousList_extension_savedClassList ul").html("");
    sectionList = new SectionList([]);
    sectionList.save();
  });

  $(".lousList_extension_savedClassList_clear_selected").on("click", function(e) {
    e.preventDefault();
    selectedList = {};
    conflicts = {};
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
    var selectedRow = $(e.target).parents(".S");
    var sectionRowData = parseSectionRow(selectedRow),
        courseRowData = parseCourseRow(selectedRow.prevAll(".CourseInfo:first"));
        course = new Course(courseRowData.courseNbr, courseRowData.courseName),
        section = new Section(course, sectionRowData.sectionNbr, sectionRowData.sectionType,
          sectionRowData.sectionInstructor, sectionRowData.sectionTime, sectionRowData.sectionPlace,
          semester, document.URL);
    if(sectionList.add(section)) {
      appendToClassList(section);
    }
  });

  $("body").on("click", ".lousList_extension_class_remove", function(e) {
    e.stopPropagation();
    e.preventDefault();
    var sectionIdentifier = $(this).attr("id").split("-"),
        el = $(this).parent().parent();
    sectionList.remove(sectionIdentifier[2], sectionIdentifier[1]);
    if(el.hasClass("conflict") || el.hasClass("no-conflict")) {
      delete selectedList[sectionIdentifier[1] + "-" + sectionIdentifier[2]];
    }
    // Resolve conflicts
    el.remove();
  });

  $("body").on("click", ".lousList_extension_class", function(e) {
    var el = $(this),
        index = $(".lousList_extension_class").index($(this)),
        section = sectionList.list[index],
        id = el.attr("id");
    if(el.hasClass("no-conflict")) {
      el.removeClass("no-conflict");
      delete conflicts[section.id];
      delete selectedList[id];
    } else if(el.hasClass("conflict")) {
      el.removeClass("conflict");
      for(c in conflicts[section.id]) {
        if(c !== "size") {
          console.log(c);
          if(section.id in conflicts[c]) {
            delete conflicts[c][section.id];
            conflicts[c].size--;
            if(conflicts[c].size === 0) {
              $("#" + c).removeClass("conflict").addClass("no-conflict");
            }
          }
        }
      }
      delete conflicts[section.id];
      delete selectedList[id];
    } else {
      var conflict = false;
      if(!(section.id in conflicts)) {
        conflicts[section.id] = {
          "size": 0
        }
      }
      for(var s in selectedList) {
        if(selectedList[s].isOverlap(section)) {
          $("#" + selectedList[s].id)
            .removeClass("no-conflict").removeClass("conflict")
            .addClass("conflict");
          conflict = true;
          conflicts[selectedList[s].id].size++;
          conflicts[selectedList[s].id][section.id] = true;
          conflicts[section.id].size++;
          conflicts[section.id][selectedList[s].id] = true;
        }
      }
      selectedList[id] = section;
      if(conflict) {
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
            var tableBody = $(html).find("table:last").html();
            $(".louList_extension_class_popup").remove();
            $("body").prepend("" +
              "<div class='lousList_extension_class_popup'>" +
                "<div class='lousList_extension_class_popup_arrow'></div>" +
                "<div class='lousList_extension_class_popup_inner'>" +
                  "<table>" +
                    tableBody + 
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

});
