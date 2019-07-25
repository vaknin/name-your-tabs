//#region Variables

let naming = false;
let space = false;

//#endregion

// Communicate with Background.js
chrome.runtime.onMessage.addListener(msg => {
    if (msg == 'toggle'){
        toggleNamingMode();
    }
});

// Listen for the client's keystrokes
document.addEventListener('keydown', e => {

    // If not in edit mode, do nothing
    if (!naming){
        return;
    }

    // Prevent browser's default behavior while editing
    e.preventDefault();

    let title = document.title;

    // Escape/Enter to confirm
    if (e.which == 27 || e.which == 13){
        toggleNamingMode();
    }

    // Delete
    else if (e.which == 8){

        // Make sure the asterisk is not removed
        if (title.length > 1){
            document.title = document.title.substring(0, title.length - 1);
        }
    }

    // Space
    else if (e.which == 32){
        space = true;
    }

    // Write the key to the title
    else if (e.key.length == 1){

        // Add Spaces
        if (space){
            title += ' ';
            space = false;
        }

        document.title = title + e.key;
    }
});

//#region Helper Functions

// Toggle the naming mode
function toggleNamingMode(){

    function changeFavicon(src) {
        var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Ski_trail_rating_symbol-green_circle.svg/1024px-Ski_trail_rating_symbol-green_circle.svg.png';
        document.getElementsByTagName('head')[0].appendChild(link);
    }

    changeFavicon('/images/red-circle.png');

    // In toggle mode, delete asterisk
    if (naming){
        document.title = document.title.slice(1);
    }

    // Start naming mode
    else{
        document.title = '*';
    }

    naming = !naming;
}

//#endregion