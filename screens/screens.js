"use strict";

var screen;
var current_screen;
var previous_screen;
var window_listener = false;

runOnDocumentLoad(function() {
  // Ah, "enums", how useful.
  // Don't edit this manually. Please.
  screen = {
    loading: document.getElementById("loading-wheel"),
    welcome: document.getElementById("welcome"),
    credits: document.getElementById("credits"),
    rswheel: document.getElementById("results-wheel"),
    results: document.getElementById("search-results"),
    snfound: document.getElementById("subject-not-found"),
    // Not sure about this one, should filters have their own page?
    filters: document.getElementById("filters"),
    subject: document.getElementById("subject-select"),

    // Fake object, does nothing and makes it so nothing is on screen.
    // What it *does* do is slot nicely with the screen functions, allowing to
    // use it as a value without a special "clearScreen" function, handling, etc..
    nothing: { style: { display: "none" } },
  };

  current_screen = screen.loading;
  previous_screen = screen.welcome;
});

function selectScreen(screen_selector) {
  current_screen.style.display = "none";
  screen_selector.style.display = "flex";
  previous_screen = current_screen;
  current_screen = screen_selector;
}

function swapScreens() {
  selectScreen(previous_screen);
}

function isShowing(screen_selector) {
  return current_screen == screen_selector;
}

function toggleScreen(screen_selector) {
  if (isShowing(screen_selector)) swapScreens();
  else selectScreen(screen_selector);
}
