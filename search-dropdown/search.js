import { fileReference } from "../base.js";

(() => {
  // urls for user selection options
  let urls = [];
  // list of available TLAs based on user selections
  let acronyms = [];

  // Search input box functionality
  // display the results of the search in the extension dropdown
  function display_results() {
    let numResults = 0;
    event.preventDefault();
    var resultsElem = document.getElementById("fearless_tla_results");
    resultsElem.innerHTML = "";
    var searchTerm = document.getElementById("fearless_tla_input").value;
    if (searchTerm && searchTerm.length > 1) {
      searchTerm = searchTerm.toUpperCase();

      for (var i = 0; i < acronyms.length; i++) {
        let a = acronyms[i].abbreviation;
        if (a.toUpperCase().includes(searchTerm)) {
          var node = document.createElement("li");
          var style = document.createElement("strong");
          var styleTextNode = document.createTextNode(acronyms[i].abbreviation);
          var textnode = document.createTextNode(`: ${acronyms[i].title}`);
          style.appendChild(styleTextNode);
          node.appendChild(style);
          node.appendChild(textnode);
          resultsElem.appendChild(node);
          numResults++;
        }
      }
    } else {
      var node = document.createElement("li");
      var textnode = document.createTextNode(
        "Please enter 2 or more characters"
      );
      node.appendChild(textnode);
      resultsElem.appendChild(node);
      numResults++;
    }

    if (numResults < 1) {
      var node = document.createElement("li");
      var textnode = document.createTextNode("No Matches Found");
      node.appendChild(textnode);
      resultsElem.appendChild(node);
    }
  }

  document
    .getElementById("fearless_tla_submit")
    .addEventListener("click", display_results);

  // Get user settings
  chrome.storage.sync.get(
    {
      acronym_files: [],
    },
    function (items) {
      for (var index in items.acronym_files) {
        const result = fileReference.find(
          ({ ref }) => ref === items.acronym_files[index]
        );
        if (result && result.ref !== "default") {
          urls.push(result.url);
        }
      }

      let defaults = fileReference.filter(function (el) {
        return el.default === true;
      });
      for (var index in defaults) {
        console.log(defaults[index].url);
        if (
          defaults[index].ref !== "default" &&
          urls.indexOf(defaults[index].url) < 0
        ) {
          urls.push(defaults[index].url);
        }
      }
    }
  );

  /*FETCH ACRONYM*/
  const getAcronyms = async () => {
    acronyms = await (
      await fetch(fileReference.find(({ ref }) => ref === "default").url)
    ).json();

    for (var i = 0; i < urls.length; i++) {
      var tmpData = await (await fetch(urls[i])).json();
      acronyms = acronyms.concat(tmpData);
    }
    return acronyms;
  };

  getAcronyms();
})();
