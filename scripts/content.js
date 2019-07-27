const tab = {
    title: document.title,
    naming: false,
    space: false
};

// Communicate with Background.js
chrome.runtime.onMessage.addListener(msg => {

    // Enter and leave naming mode
    if (msg.action == 'name-mode'){
        toggleNamingMode();
    }

    // Change the favicon
    else if (msg.action == 'favicon'){
        changeFavicon(msg.data, msg.url);
    }

    // Update the tab
    else if (msg.action == 'update'){
        if (tab.naming) return;
        if (msg.title) document.title = msg.title;
        if (msg.color) changeFavicon(msg.color);
    }
});

// Listen for the client's keystrokes
document.addEventListener('keydown', e => {

    // If not in edit mode, do nothing
    if (!tab.naming){
        return;
    }

    // Prevent browser's default behavior while editing
    e.preventDefault();

    let title = document.title;

    // Escape to acncel
    if (e.which == 27){
        tab.naming = !tab.naming;
        document.title = tab.title;
    }

    // Enter to save
    if (e.which == 13){
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
        tab.space = true;
    }

    // Write the key to the title
    else if (e.key.length == 1){

        // Add Spaces
        if (tab.space){
            title += ' ';
            tab.space = false;
        }

        document.title = title + e.key;
    }
});

//#region Helper Functions

// Toggle the naming mode
function toggleNamingMode(){

    // Confirm name change
    if (tab.naming){

        // Change title
        document.title = document.title.slice(1);
        tab.title = document.title;

        // Send new title to background.js
        let msg = {action: "title", data: tab.title};
        chrome.runtime.sendMessage(msg);
    }

    // Start naming mode
    else document.title = '*';

    tab.naming = !tab.naming;
}

// Dynamically set the tab's favicon
function changeFavicon(color, url) {

    // If a URL was specified, use it as the favicon's source
    if (url){
        color = url;
    }

    // Grab the appropriate favicon color image
    else switch (color){
        case 'red':
            color = 'https://raw.githubusercontent.com/vaknin/name-your-tabs/master/images/red-circle.png';
        break;
        case 'yellow':
            color = 'https://raw.githubusercontent.com/vaknin/name-your-tabs/master/images/yellow-circle.png';
        break;
        case 'green':
            color = 'https://raw.githubusercontent.com/vaknin/name-your-tabs/master/images/green-circle.png';
        break;
    }

    // Get all webpage's icons
    let icons = document.querySelectorAll("link[rel*='icon']");

    // There are already favicons, change the existing ones
    if (icons.length > 0){
        for (let icon of icons){

            // Set new icon
            icon.href = color;
        }
    }

    // Create a new favicon element
    else{
        let link = document.createElement('link');

        // Set favicon properties
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = color;

        // Add to document's head
        document.getElementsByTagName('head')[0].appendChild(link);
    }
}

//#endregion
