// Clear storage
chrome.storage.local.clear();

// Listen for user's commands
chrome.commands.onCommand.addListener(async command => {

    let msg = {};
    let tabID;

    // Get the current active tab, and save its ID
    await new Promise(resolve => {
        chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
            tabID = tabs[0].id.toString();
            resolve();
        });
    });

    //Toggle Edit Mode Keyboard Shortcut
    if (command == 'toggle-edit-mode'){

        msg.action = 'toggle';
    }

    // Dynamically set favicons
    else if (command == 'toggle-color'){

        let color;

        // Get tab's current favicon color
        await new Promise(resolve => {

            // Async fetch current tab's favicon color
            chrome.storage.local.get([tabID], result => {

                // Check if a color exists
                if (Object.keys(result).length != 0){

                    // Switch to the next color
                    result = result[tabID];
                    switch (result){
                        case 'red':
                            color = 'yellow';
                            break;
                        case 'yellow':
                            color = 'green';
                            break;
                        case 'green':
                            color = 'red';
                            break;
                    }
                }
    
                // If the favicon has no color, default to red
                else color = 'red';


                //console.log(color);
                resolve();
            });
        });

        // Set color in storage
        chrome.storage.local.set({[tabID]: color});

        // Communicate with content.js
        msg.action = 'favicon';

        // The chosen color
        msg.data = color;
    }

    // Sort by favicon color
    else if (command == 'sort-by-color'){

        // Retrieve all of the favicon colors from storage
        return chrome.storage.local.get(null, items => {

            // If there are no favicons set, return
            if (Object.keys(items).length == 0) return;

            // Get all tabs in the current window
            chrome.tabs.query({currentWindow: true}, tabs => {

                let index = 0;
                for (item of items){
                    
                }
            });
        });
    }

    // Send the message to content.js
    chrome.tabs.sendMessage(parseInt(tabID), msg);
 });