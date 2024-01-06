workspace.clientMaximizeSet.connect(function(client, h, v) {
  if (h && v) {
    console.log("zozobra: " + client.caption + " is fully maximized");
  } else {
    console.log("zozobra: " + client.caption + " is not maximized");
  }
});
