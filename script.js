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

  // Convert the interpolated RGB values back t o a hex color
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

var idx;

var fullData;

var subjectList;

//open("https://raw.githubusercontent.com/JelyMe/NCEAPapers/main/exams/90837-2021.pdf")

fetch("subjects.json").then((res) =>{return res.json()}).then((data)=>{
  subjectList = data;
});

fetch("searchIndex.json").then((res) => { return res.json()}).then((data) => {  
  idx = lunr(function () {
    this.ref('id');
    this.field('title');
    this.field('subject');
    this.field('number');
      
    data.forEach(function (doc) {
      this.add(doc)
    }, this)
  })
    
  fullData = data;
});

const contributorsScreen = document.querySelector(".contributors-screen");
const examsNotFound = document.querySelector(".subject-not-found-block");
const loadingWheel = document.querySelector(".loading-wheel");

//Stupid tab button, it has to be done on the keydown event
document.querySelector('#search-text').addEventListener('keydown', (event) => {  
  const searchText = document.querySelector('#search-text');
  const autocomplete = document.querySelector('#autocomplete');
  if(event.keyCode == 9){
    event.preventDefault();
    if (searchText.value == autocomplete.innerHTML) {
      examsNotFound.style.display = "none";
      searchResults.style.display = "none";
      loadingWheel.style.display = "flex";
      contributorsScreen.style.display = "none";

      new Promise(
        (resolve, reject) => {
          setTimeout(() => {
            searchResults.innerHTML = "";
            console.log(searchText.value.replace(/(?<![+-])\b([A-Z][^+\s]+)\b/g, "+$1"))
            let subjectExams = idx.search(searchText.value.replace(/(?<![+-])\b([A-Z][^+\s]+)\b/g, "+$1"));


            if (subjectExams.length > 0) {
              subjectExams.forEach((result) => {
                searchResults.innerHTML += 
                `<div class="search-results-card flex-c-c">
                  <div class="standard-info flex-c-s flex-column">
                    <div class="standard-info-numbers flex-se-c">
                      <h1 class="standard-info-id inter-light">
                        `+fullData[result.ref]["number"]+`
                      </h1>
                      <h4 class="standard-info-time-period inter-light">
                      `+fullData[result.ref]["year-range"]+`
                      </h4>
                    </div>
                    <div class="standard-info-description inconsolata">
                      <p>`+fullData[result.ref]["title"]+` | Credits: `+fullData[result.ref]["credits"]+`</p>
                    </div>
                  </div>
            
                  <div class="split-bar"></div>
            
                  <div class="standard-level">
                    <h1 class="standard-level-text inter-light">
                      `+fullData[result.ref]["level"]+`
                    </h1>
                  <p>Lvl</p>
                  </div>
            
                  <button class="download-plus" onclick="window.open('https://raw.githubusercontent.com/JelyMe/NCEAPapers/main/zipped/` + fullData[result.ref]["number"] + `.zip')">
                  <img src="Images/DownloadIcon.png"></button>
          
                </div>`
              });
              
              resolve();
            }
            else if (subjectExams.length === 0) {
              examsNotFound.style.display = "flex";
              searchResults.style.display = "none";
              loadingWheel.style.display = "none";
              contributorsScreen.style.display = "none";
            }

          }, 5);
        }
      ).then(
        () => {
          examsNotFound.style.display = "none";
          loadingWheel.style.display = "none";
          searchResults.style.display = "flex";
          contributorsScreen.style.display = "none";
        }
      );
    }
    else {
      searchText.value = autocomplete.innerHTML;
    }
}});

document.querySelector('#search-text').addEventListener('keyup', (event) => {
  const searchText = document.querySelector('#search-text');
  const autocomplete = document.querySelector('#autocomplete');
  if (event.keyCode == 13 && autocomplete.innerHTML != "Search for an external paper") { //Enter key
    examsNotFound.style.display = "none";
    searchResults.style.display = "none";
    loadingWheel.style.display = "flex";
    contributorsScreen.style.display = "none";

    new Promise(
      (resolve, reject) => {
        setTimeout(() => {
          searchResults.innerHTML = "";
          console.log(searchText.value.replace(/(?<![+-])\b([A-Z][^+\s]+)\b/g, "+$1"))
          let subjectExams = idx.search(searchText.value.replace(/(?<![+-])\b([A-Z][^+\s]+)\b/g, "+$1"));


          if (subjectExams.length > 0) {
            subjectExams.forEach((result) => {
              searchResults.innerHTML += 
              `<div class="search-results-card flex-c-c">
                <div class="standard-info flex-c-s flex-column">
                  <div class="standard-info-numbers flex-se-c">
                    <h1 class="standard-info-id inter-light">
                      `+fullData[result.ref]["number"]+`
                    </h1>
                    <h4 class="standard-info-time-period inter-light">
                    `+fullData[result.ref]["year-range"]+`
                    </h4>
                  </div>
                  <div class="standard-info-description inconsolata">
                    <p>`+fullData[result.ref]["title"]+` | Credits: `+fullData[result.ref]["credits"]+`</p>
                  </div>
                </div>
          
                <div class="split-bar"></div>
          
                <div class="standard-level">
                  <h1 class="standard-level-text inter-light">
                    `+fullData[result.ref]["level"]+`
                  </h1>
                <p>Lvl</p>
                </div>
          
                <button class="download-plus" onclick="window.open('https://raw.githubusercontent.com/JelyMe/NCEAPapers/main/zipped/` + fullData[result.ref]["number"] + `.zip')"><img src="Images/DownloadIcon.png"></button>
        
              </div>`
            });
            
            resolve();
          }
          else if (subjectExams.length === 0) {
            examsNotFound.style.display = "flex";
            searchResults.style.display = "none";
            loadingWheel.style.display = "none";
            contributorsScreen.style.display = "none";
          }

        }, 15);
      }
    ).then(
      () => {
        examsNotFound.style.display = "none";
        loadingWheel.style.display = "none";
        searchResults.style.display = "flex";
        contributorsScreen.style.display = "none";
      }
    );
  }

  autocomplete.innerHTML = searchText.value;

  if (searchText.value.length != 0)
  {
    for (let index = 0; index < subjectList.length; index++) {
      const subject = subjectList[index];

      if (subject.toLowerCase().substr(0,searchText.value.length) == searchText.value.toLowerCase()) {
        autocomplete.innerHTML = subject;
        searchText.value = subject.substr(0,searchText.value.length);

        break;
      }
    }
  }
  else {
    autocomplete.innerHTML = "Search for an external paper";
  }
});

const contributorsButton = document.querySelector(".contributors-button");

contributorsButton.addEventListener("click", (e) => {
  if (contributorsScreen.style.display === "flex") {
    contributorsScreen.style.display = "none";
    searchResults.style.display = "flex"; // Display search results
  } else {
    e.stopPropagation()
    examsNotFound.style.display = "none";
    searchResults.style.display = "none";
    loadingWheel.style.display = "none";
    contributorsScreen.style.display = "flex";
  }
});

document.body.addEventListener("click",()=>{
  if (contributorsScreen.style.display === "flex") {
    contributorsScreen.style.display = "none";
    searchResults.style.display = "flex"; // Display search results
  }
})

var showingSubjects = false;

document.querySelector("#subject-button").addEventListener("click", ()=>{
  if (!showingSubjects){
    searchResults.innerHTML = "";
    examsNotFound.style.display = "none";
    loadingWheel.style.display = "none";
    searchResults.style.display = "flex";
    contributorsScreen.style.display = "none";
    console.log("yep")
    for (let index = 0; index < subjectList.length; index++) {
      const subject = subjectList[index];
      searchResults.innerHTML += `<button class="subject-card inter-light flex-c-c" onclick="search('`+subject+`')">`+subject+'</button>\n';
    }
    showingSubjects = true;
  }
  else{
    searchResults.innerHTML = "";
    showingSubjects = false;
  }
})

function search(term){
  const searchText = document.querySelector('#search-text');
  const autocomplete = document.querySelector('#autocomplete');
  autocomplete.innerHTML = term;
  searchText.value = term;
  examsNotFound.style.display = "none";
  searchResults.style.display = "none";
  loadingWheel.style.display = "flex";
  contributorsScreen.style.display = "none";

  new Promise(
    (resolve, reject) => {
      setTimeout(() => {
        searchResults.innerHTML = "";
        console.log(searchText.value.replace(/(?<![+-])\b([A-Z][^+\s]+)\b/g, "+$1"))
        let subjectExams = idx.search(searchText.value.replace(/(?<![+-])\b([A-Z][^+\s]+)\b/g, "+$1"));


        if (subjectExams.length > 0) {
          subjectExams.forEach((result) => {
            searchResults.innerHTML += 
            `<div class="search-results-card flex-c-c">
              <div class="standard-info flex-c-s flex-column">
                <div class="standard-info-numbers flex-se-c">
                  <h1 class="standard-info-id inter-light">
                    `+fullData[result.ref]["number"]+`
                  </h1>
                  <h4 class="standard-info-time-period inter-light">
                  `+fullData[result.ref]["year-range"]+`
                  </h4>
                </div>
                <div class="standard-info-description inconsolata">
                  <p>`+fullData[result.ref]["title"]+` | Credits: `+fullData[result.ref]["credits"]+`</p>
                </div>
              </div>
        
              <div class="split-bar"></div>
        
              <div class="standard-level">
                <h1 class="standard-level-text inter-light">
                  `+fullData[result.ref]["level"]+`
                </h1>
              <p>Lvl</p>
              </div>
        
              <button class="download-plus" onclick="window.open('https://raw.githubusercontent.com/JelyMe/NCEAPapers/main/zipped/` + fullData[result.ref]["number"] + `.zip')"><img src="Images/DownloadIcon.png"></button>
      
            </div>`
          });
          
          resolve();
        }
        else if (subjectExams.length === 0) {
          examsNotFound.style.display = "flex";
          searchResults.style.display = "none";
          loadingWheel.style.display = "none";
          contributorsScreen.style.display = "none";
        }

      }, 15);
    }
  ).then(
    () => {
      examsNotFound.style.display = "none";
      loadingWheel.style.display = "none";
      searchResults.style.display = "flex";
      contributorsScreen.style.display = "none";
    }
  );
}