chrome.webNavigation.onCommitted.addListener(function(e) {
  
  console.log("You are on Lou's List!");

  $("body").append("YoYoYo");

}, { url: [{ hostSuffix: "rabi.phys.virginia.edu" }, { pathPrefix: "/mySIS/CS2/" } ] });
