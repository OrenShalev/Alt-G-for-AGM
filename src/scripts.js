var typesMap = {
    'defects/default':          { name: 'defect',     url: 'defects/default/shared.update;entityTypeName=defect;productGroupId=1000;entityId=' },
    'product/backlog_items':    { name: 'user story', url: 'product/backlog_items/shared.update;entityTypeName=requirement;productGroupId=1000;entityId=' },
    'product/features':         { name: 'feature',    url: 'product/features/shared.update;entityTypeName=requirement;productGroupId=1000;entityId=' },
    'product/themes':           { name: 'theme',      url: 'product/themes/shared.update;entityTypeName=requirement;productGroupId=1000;entityId='},
    'release/release_backlog':  { name: 'user story',      url: 'release/release_backlog/shared.update;entityTypeName=requirement;productGroupId=1000;entityId='}
};

function analyzeUrl(url) {
    var parts = url.split('#'),
        base = parts[0],
        hash = parts[1],
        hashParts = hash.split('/'),
        key = hashParts[0] + '/' + hashParts[1],
        value = typesMap[key] || typesMap['defects/default']; // Default to defect.

    return {
        name: value.name,
        url: base + '#' + value.url
    };
}

function handler(currentTabUrl) {
    var onAgm = currentTabUrl.includes('agm/webui/alm');    
    if (!onAgm) return; // Not on AGM, ignore.

    var obj = analyzeUrl(currentTabUrl); // Figure out what type of entity we want and what is the appropriate URL.
    var input = prompt('Enter a ' + obj.name + ' ID');

    if (input) {
        chrome.tabs.update({ // Navigate.
            url: obj.url+input
        });
    }
}

chrome.commands.onCommand.addListener(function (command) {
    getCurrentTabUrl(handler); // Get the URL of the current tab and handle.
});

function getCurrentTabUrl(callback) {
    // Query filter to be passed to chrome.tabs.query - see
    // https://developer.chrome.com/extensions/tabs#method-query
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, function (tabs) {
        // chrome.tabs.query invokes the callback with a list of tabs that match the
        // query. When the popup is opened, there is certainly a window and at least
        // one tab, so we can safely assume that |tabs| is a non-empty array.
        // A window can only have one active tab at a time, so the array consists of
        // exactly one tab.
        var tab = tabs[0];

        // A tab is a plain object that provides information about the tab.
        // See https://developer.chrome.com/extensions/tabs#type-Tab
        var url = tab.url;

        // tab.url is only available if the "activeTab" permission is declared.
        // If you want to see the URL of other tabs (e.g. after removing active:true
        // from |queryInfo|), then the "tabs" permission is required to see their
        // "url" properties.
        console.assert(typeof url == 'string', 'tab.url should be a string');

        callback(url);
    });

    // Most methods of the Chrome extension APIs are asynchronous. This means that
    // you CANNOT do something like this:
    //
    // var url;
    // chrome.tabs.query(queryInfo, function(tabs) {
    //   url = tabs[0].url;
    // });
    // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}
