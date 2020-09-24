import { fileReference } from "../base.js";

// Restores input state using the preferences stored in chrome.storage
chrome.storage.sync.get(
  {
    acronym_files: [],
  },
  function (items) {
    var select = document.getElementById("addl_files");
    for (var index in fileReference) {
      let highlight = fileReference[index].default;
      if (items.acronym_files.indexOf(fileReference[index].ref) > -1) {
        highlight = true;
      }

      // populate the select box based on the file array defined in the base file
      select.options[select.options.length] = new Option(
        fileReference[index].name,
        fileReference[index].ref,
        fileReference[index].default,
        highlight
      );
    }
  }
);

// Saves options to chrome.storage
function save_options() {
  let selectedOptions = document.getElementById("addl_files").selectedOptions;
  let selectedValues = [];

  for (let i = 0; i < selectedOptions.length; i++) {
    if (selectedOptions[i].value === "default") {
      selectedValues = [selectedOptions[i].value];
      break;
    }
    selectedValues.push(selectedOptions[i].value);
  }

  chrome.storage.sync.set(
    {
      acronym_files: selectedValues,
    },
    function () {
      // Update status to let user know options were saved.
      var status = document.getElementById("status");
      status.textContent = "preferences updated";
      setTimeout(function () {
        status.textContent = "";
      }, 1500);
    }
  );
}

document.getElementById("save").addEventListener("click", save_options);
