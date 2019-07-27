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

        msg.action = 'name-mode';
    }

    // Dynamically set favicons
    else if (command == 'toggle-color'){

        chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
            tabs[0].favIconUrl;
        });

        let color;
        let obj = {};

        // Get tab's current favicon color
        await new Promise(resolveouter => {

            // Async fetch current tab's favicon color
            chrome.storage.local.get([tabID], async result => {

                // Check if a color exists
                if (Object.keys(result).length != 0){

                    // Switch to the next color
                    result = result[tabID];
                    obj = result;
                    
                    switch (obj.color){
                        case 'original':
                            obj.color = 'red';
                        break;

                        case 'red':
                            obj.color = 'yellow';
                        break;

                        case 'yellow':
                            obj.color = 'green';
                        break;

                        case 'green':
                            obj.color = 'original';
                            msg.url = obj.originalFav;
                        break;
                    }
                }
    
                // If the favicon is not set, save the favicon and default to red
                else await new Promise(resolveinner => {
                    chrome.tabs.query({ currentWindow: true, active: true }, tabs => {
                        obj.originalFav = tabs[0].favIconUrl;
                        obj.color = 'red';
                        resolveinner();
                    });
                });

                resolveouter();
            });
        });

        // Set color in storage
        chrome.storage.local.set({[tabID]: obj});

        // Communicate with content.js
        msg.action = 'favicon';

        // The chosen color
        msg.data = obj.color;
    }

    // Sort by favicon color
    else if (command == 'sort-by-color'){

        // Only sort tabs in the current window
        let activeWindow;

        // Changes the tab's index
        async function move(id, index){

            // Return whether the tab has been moved
            return new Promise(async resolve => {

                // Syncronously move the tab
                let moved = await new Promise(resolve => {

                    // Get the item's tab object
                    chrome.tabs.get(id, tab => {

                        // Check whether the tab is in the current chrome window
                        if (tab.windowId == activeWindow){
                            let moveProperties = {
                                windowId: undefined,
                                index
                            };
                            
                            // Tab moved, return true
                            chrome.tabs.move(id, moveProperties, () => {
                                resolve(true);
                            });
                        }

                        // Tab is not in the current window, return false
                        else resolve(false);
                    });
                });

                resolve(moved);
            });
            
        }

        // Retrieve all marked tabs from local storage
        return chrome.storage.local.get(null, async items => {

            // If there are no favicons set, return
            if (Object.keys(items).length == 0) return;

            // Get the current active window's ID
            await new Promise(resolve => {
                chrome.windows.getCurrent(null, window => {
                    resolve(activeWindow = window.id);
                });
            });

            // Keep track of number of marked tabs, by color
            let count = { r: 0, y: 0, g: 0 };
            let pinCount = 0;

            // Account for pinned tabs, as they preceed all other tabs - regardless of importance
            await new Promise(resolve => {
                chrome.tabs.query({ currentWindow: true }, tabs => {
                    for (let tab of tabs){
                        if (tab.pinned){
                            pinCount++;
                        }
                    }
                    count.r = pinCount;
                    count.y = pinCount;
                    count.g = pinCount;
                    resolve();
                });
            });

            // Iterate through all items
            for (let i = 0; i < Object.keys(items).length; i++){
                let id = parseInt(Object.keys(items)[i]);
                let color = items[id].color;
                let moved;
                
                // Sort by color
                switch(color){

                    // Red tabs
                    case 'red':
                        // Move to rcount, always ignore other colors
                        moved = await move(id, count.r);
                        if (moved) count.r++;
                    break;

                    // Yellow tabs
                    case 'yellow':
                        // Move to rcount+ycount (deduct pinned tabs, if they exist)
                        moved = await move(id, (count.r + count.y) - pinCount);
                        if (moved) count.y++;
                    break;

                    // Green tabs
                    case 'green':
                        //Move to rcount+ycount+gcount (deduct pinned tabs twice, if they exist)
                        moved = await move(id, (count.r + count.y + count.g) - pinCount * 2);
                        if (moved) count.g++;
                    break;
                }
            }
        });
    }

    // Send the message to content.js
    chrome.tabs.sendMessage(parseInt(tabID), msg);
 });