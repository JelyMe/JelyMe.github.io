//BORROWED CODE FOR SOME COOL CUSTOM SCROLL EFFECTS
function interpolate(color1, color2, percent) {
  // Convert the hex colors to RGB values
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);

  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);

  // Interpolate the RGB values
  const r = Math.round(r1 + (r2 - r1) * percent);
  const g = Math.round(g1 + (g2 - g1) * percent);
  const b = Math.round(b1 + (b2 - b1) * percent);

  // Convert the interpolated RGB values back to a hex color
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

const debounce = (fn) => {
  let frame;
  return (...params) => {
    if (frame) { 
      cancelAnimationFrame(frame);
    }
    frame = requestAnimationFrame(() => {
      fn(...params);
    });

  } 
};
//MODIFIED BORROWED CODE
const searchResults = document.querySelector('.search-results')

const storeScroll = () => {
  var scrollamount = (searchResults.scrollTop/searchResults.scrollHeight);
  searchResults.style.setProperty("--scroll-amount", interpolate("#4287f5","#460c85", scrollamount));
}
searchResults.addEventListener('scroll', debounce(storeScroll), { passive: true });
storeScroll();
//END BORROWED CODE

var idx = null

var fullData = null

fetch("searchIndex.json").then((res) => {return res.json()}).then((data) => {
  fullData = data
  idx = lunr(function () {
    this.ref('id')
    this.field('title')
    this.field('subject')
    this.field('number')
    
    data.forEach(function (doc) {
      this.add(doc)
    }, this)
  })
})

document.querySelector('.search-input').addEventListener('keydown', (event) => {
  if(event.keyCode == 13){
  const searchTerm = document.querySelector('.search-input').value.toLowerCase();
  const downloadButton = document.querySelector('.download-button');
  if(idx != null){
    searchResults.innerHTML = ""
    idx.search(searchTerm).forEach((result) =>{
      searchResults.innerHTML += "<h3 href=''>" + fullData[result.ref]["title"] + " - " + fullData[result.ref]["number"] + " - " + fullData[result.ref]["credits"] + "</h3>"
    })
  }
  if (searchTerm.includes('spin')) {
    downloadButton.classList.add('spinning');
  } else {
    downloadButton.classList.remove('spinning');
  }
}
});

