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

    if (!naming){
        return;
    }

    let title = document.title;

    //console.log(e.which);

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

    // Any ASCII key
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

    // In toggle mode, delete asterisk
    if (naming){
        document.title = document.title.slice(1);
    }

    // Start naming mode
    else{
        document.title = '*' + document.title;
    }

    naming = !naming;
}

//#endregion