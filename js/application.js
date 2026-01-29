// js/application.js (classic script)

function start2048Game() {

  new GameManager(4, KeyboardInputManager, HTMLActuator, LocalStorageManager);
}

window.start2048Game = start2048Game;