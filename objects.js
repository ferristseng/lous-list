/*
 * ======================
 * Course
 * ----------------------
 * nbr
 * name
 * ======================
 */

function Course(nbr, name) {

  this.nbr = nbr;
  this.name = name;

}

/*
 * ======================
 * Section 
 * ----------------------
 * course
 * nbr
 * type
 * instructor
 * time
 * place
 * semester
 * id
 * source
 * ======================
 */
function Section(course, nbr, type, instructor, time, place, semester, source) {
  
  this.course = course;
  this.nbr = nbr;
  this.type = type;
  this.instructor = instructor;
  this.time = new SectionTime(time);
  this.place = place;
  this.semester = semester;
  this.id = this.semester + "-" + this.nbr;
  this.source = source;

}

/*
 * Determines whether the current section overlaps
 * with another section
 */
Section.prototype.isOverlap = function(section) {

  if(section.time.times === "TBA" || this.time.times === "TBA") {
    return false;
  }

  if(section.semester !== this.semeseter) {
    return false;
  }

  var convertTimeToScore = function(timestr) {
    var re = new RegExp("^(\\d{1,2}):(\\d{2})([A-Z]{2})$", "g"),
        parts = re.exec(timestr);
    if(parts[3] === "PM" && parts[1] !== "12") {
      parts[1] = parseInt(parts[1]) + 12;
    }
    return parseInt(parts[1] + "" + parts[2]);   
  },
  overlappingDays = false,
  overlappingTimes = false;

  for(var day in this.time.days) {
    if(section.time.days[day] && this.time.days[day]) {
      overlappingDays = true;
      break;
    }  
  }

  if(!overlappingDays) {
    return false;
  }
 
  var section1Start = convertTimeToScore(this.time.times.start),
      section1End = convertTimeToScore(this.time.times.end),
      section2Start = convertTimeToScore(section.time.times.start),
      section2End = convertTimeToScore(section.time.times.end);

  if(section1Start < section2Start) {
    if(section2Start <= section1End) {
      overlappingTimes = true;
    }
  } else if(section2Start < section1Start) {
    if(section1Start <= section2End) {
      overlappingTimes = true;
    }    
  } else {
    overlappingTimes = true;
  }

  if(!overlappingTimes) {
    return false;
  }

  return true; 

}

function parseSectionTime(str) {
  var re = new RegExp("([A-Z][a-z]+)", "g"),
      days = {
        "Mo": false,
        "Tu": false,
        "We": false,
        "Th": false,
        "Fr": false
      },
      times = {
        "start": "0:00AM",
        "end": "0:00AM"
      };
  if(str === "TBA") {
    return {
      "days": "TBA",
      "times": "TBA"
    } 
  } else {
    var parts = str.split(" "),
        matches = parts[0].match(re);
    // set which days you have class on
    for(var i = 0; i < matches.length; i++) {
      days[matches[i]] = true;
    }
    times['start'] = parts[1];
    times['end'] = parts[3];
  }
  return {
    "days": days,
    "times": times
  }
}

/*
 * ======================
 * SectionTime
 * ----------------------
 * raw
 * days
 * times
 * ======================
 */
function SectionTime(str) {

  var parsed = parseSectionTime(str);

  this.raw = str;
  this.days = parsed.days;
  this.times = parsed.times;

}

/*
 * loadSectionList
 * Returns a new SectionList object
 * loads from localStorage
 */

function loadSectionList() {
  var storedList = localStorage["sectionList"],
      convertedList = [];
  if(storedList) {
    storedList = JSON.parse(storedList);
    for(var key in storedList) {
      convertedList.push(new Section(storedList[key].course, storedList[key].nbr, storedList[key].type,
        storedList[key].instructor, storedList[key].time.raw, storedList[key].place, storedList[key].semester,
        storedList[key].source));
    }
  }
  return new SectionList(convertedList);
}

/*
 * ======================
 * SectionList
 * ----------------------
 * list 
 * ======================
 */
function SectionList(list) {

  if(list) {
    this.list = list;
  } else {
    this.list = [];
  }  

}

SectionList.prototype.save = function() {

  localStorage["sectionList"] = JSON.stringify(this.list);

}

SectionList.prototype.add = function(section) {
  
  for(var i = 0; i < this.list.length; i++) {
    if(this.list[i].id == section.id) {
      return false;
    }
  }

  this.list.push(section);
  this.save();

  return true;

}

SectionList.prototype.remove = function(section_nbr, semester) {

  var removed = null;

  for(var i = 0; i < this.list.length; i++) {
    if(this.list[i].id == semester + "-" + section_nbr) {
      removed = this.list.splice(i, 1)[0];
    }
  }

  this.save();

  return removed;

}

SectionList.prototype.find = function(id) {

  for(var i = 0; i < this.list.length; i++) {
    console.log(this.list[i].id);
    if(this.list[i].id == id) {
      return this.list[i]; 
    }
  }

  return null;

}

/*
 * ======================
 * ConflictList 
 * ----------------------
 * conflicts
 * active
 * ======================
 */
function ConflictList(obj) {

  if(!obj) {
    this.conflicts  = {};
    this.active     = {};
  } else {
    this.conflicts  = obj.conflicts;
    this.active     = {};
    for(var s in obj.active) {
      this.active[s] = new Section(obj.active[s].course, obj.active[s].nbr,
        obj.active[s].type, obj.active[s].instructor, obj.active[s].time.raw,
        obj.active[s].place, obj.active[s].semester, obj.active[s].source);
    }
  }

}

/*
 * Adds a section to the conflict list
 * Returns the conflicts
 */
ConflictList.prototype.add = function(section) {

  if(!(section.id in this.conflicts)) {
    this.conflicts[section.id] = {
      "size": 0,
      "key": section.id
    }
  }

  for(var s in this.active) {
    if(this.active[s].isOverlap(section)) {
      this.conflict = true;
      this.conflicts[this.active[s].id].size++;
      this.conflicts[this.active[s].id][section.id] = true;
      this.conflicts[section.id].size++;
      this.conflicts[section.id][this.active[s].id] = true;
    }
  }

  this.active[section.id] = section;

  this.save();

  return this.conflicts[section.id];

}

ConflictList.prototype.remove = function(section, noConflicts) {

  var unflagged = [];

  if(!noConflicts) {
    for(c in this.conflicts[section.id]) {
      if(c !== "size" && c !== "key") {
        if(section.id in this.conflicts[c]) {
          delete this.conflicts[c][section.id];
          this.conflicts[c].size--;
          if(this.conflicts[c].size === 0) {
            unflagged.push(this.conflicts[c].key);
          }
        }
      }
    }
  }

  delete this.conflicts[section.id];
  delete this.active[section.id];

  this.save();

  return unflagged;

}

ConflictList.prototype.reset = function() {
  
  this.active = {};
  this.conflicts = {};

  this.save();

}

ConflictList.prototype.save = function() {

  localStorage["conflictList"] = JSON.stringify(this);

}

/*
 * Load ConflictList from localStorage
 */

function loadConflictList() {

  var stored = localStorage["conflictList"];

  if(stored) {
    stored = JSON.parse(stored);
    return new ConflictList(stored);
  } else {
    return new ConflictList();
  }

}
