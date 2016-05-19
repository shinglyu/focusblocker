  // Saves options to chrome.storage
function save_options() {
  var default_prompt_time = document.getElementById('default_prompt_time').value;
  var block_time = document.getElementById('block_time').value;
  var blacklist = document.getElementById('blacklist').value;
  chrome.storage.sync.set({
    default_prompt_time: default_prompt_time,
    block_time: block_time,
    blacklist: blacklist
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Saved!';
    setTimeout(function() {
      status.textContent = '';
    }, 3000);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    default_prompt_time: 10,
    block_time: 50,
    blacklist: "*://*.facebook.com/*"
  }, function(items) {
    document.getElementById('default_prompt_time').value = items.default_prompt_time;
    document.getElementById('block_time').value = items.block_time;
    document.getElementById('blacklist').value = items.blacklist;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
                                                 save_options);
