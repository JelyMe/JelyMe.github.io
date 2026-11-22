"use strict";

var screen;
var current_screen;
var previous_screen;
var window_listener = false;

runOnDocumentLoad(function() {
  // Ah, "enums", how useful.
  // Don't edit this manually. Please.
  screen = {
    loading: document.querySelector(".loader-container.flex-c-c"),
    welcome: document.querySelector(".github-contribute-screen.flex-c-c.flex-column"),
    credits: document.querySelector(".contributors-screen.flex-c-c.flex-column"),
    rswheel: document.querySelector(".loading-wheel.flex-c-c"),
    results: document.querySelector("#search-results"),
    snfound: document.querySelector(".subject-not-found-block.flex-c-c.flex-column"),
    subject: document.querySelector("#subject-select"),

    // Null Object pattern, does nothing and makes it so nothing is on screen.
    nothing: { style: { display: "none" } }
  };

  screen.credits.style.display = "none";
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
