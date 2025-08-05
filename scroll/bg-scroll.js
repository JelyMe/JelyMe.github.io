function generateBoxShadow(blur, size) {
  var x = Math.random() * 100;
  var y = Math.random() * 125;
  var size = size / 10;
  return x+"vw "+y+"vh "+size+"vmin "+(size*blur)+"vmin #fff, "+x+"vw "+(y-125)+"vh "+size+"vmin "+(size*blur)+"vmin #fff";
  // ISTG I had a good reason for changing it to the following but then I tried it and it broke?
  // I should have documented it, but oh well, I'll probably delete this if
  // it isn't needed to show that it was attemtped and doesn't work.
  //return x+"vw "+y+"vh "+(size*blur)+"px "+size+"px #fff, "+x+"vw "+(y-125)+"vh "+(size*blur)+"px "+size+"px #fff";
  // Note: after more testing, I can safely say, WTAF Firefox ISTG.
}

function generateAllShadows(closeness, size, bright_blur, dim_blur) {
  var output = generateBoxShadow(bright_blur, size) + ", " + generateBoxShadow(dim_blur, size);

  for (var i = Math.floor(120 / (closeness * closeness)); i > 0; i--) {
    output += ", " + generateBoxShadow(bright_blur, size);
    output += ", " + generateBoxShadow(dim_blur, size);
  }
  return output;
}

function createStar(size) {
  var star = document.createElement("div");
  star.classList.add("star");
  star.style.setProperty("--shadow", generateAllShadows(size / 2, size / 4, 1, 1.25));
  star.style.animationDuration = 60 / size + "s";
  return star;
}

runOnDocumentLoad(function addStarShadows() {
  var bg = document.querySelector("#bg-scroll-effect");
  for (var i = 5; i > 0; i--) bg.appendChild(createStar(i));
  var overlay = document.createElement("div");
  overlay.classList.add("bg-overlay");
  bg.appendChild(overlay);
});
