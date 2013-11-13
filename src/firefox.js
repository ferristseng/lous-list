var pageMod = require('sdk/page-mod'),
    data = require('sdk/self').data;

pageMod.PageMod({
  include: [
    "http://rabi.phys.virginia.edu/mySIS/CS2/page.php*",
    "http://rabi.phys.virginia.edu/mySIS/CS2/index.php*",
    "http://rabi.phys.virginia.edu/mySIS/CC2/*",
    "http://rabi.phys.virginia.edu/mySIS/CS2/search.php*"
  ],
  contentStyleFile: [
    data.url("style.css")
  ], 
  contentScriptFile: [
    data.url("jquery-1.9.1.min.js"),
    data.url("utility.js"),
    data.url("objects.js"),
    data.url("page.js"),
    data.url("event.js") 
  ],
  contentScriptWhen: "start"
});
