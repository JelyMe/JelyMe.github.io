function addStar(bg_effect, brightness, size) {
    var elem = document.createElement('div');
    elem.classList.add("star");
    elem.classList.add(brightness);
    elem.classList.add("size-" + size);
    elem.style.left = Math.random() * 100 + "%";
    elem.style.top = Math.random() * 125 + "%";
    bg_effect.appendChild(elem);
}
function addStars() {
    var bg_effect = document.getElementById('bg-scroll-effect');
    // 349 stars.
    for (var i = 5; i > 0; i--) {
        var count = Math.floor(60 / (i * i)) * 2;
        for (var j = count; j > 0; j--) addStar(bg_effect, "bright", i);
        for (var j = count; j > 0; j--) addStar(bg_effect, "dim", i);
    }
}
window.addEventListener('load', addStars);
