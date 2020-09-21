(() => {
  const fileReference = [
    {
      ref: "default",
      url:
        "https://raw.githubusercontent.com/FearlessSolutions/acronym_plugin/master/acronyms/fearless.json",
    },
    {
      ref: "cms",
      url:
        "https://raw.githubusercontent.com/FearlessSolutions/acronym_plugin/master/acronyms/cms.json",
    },
    {
      ref: "software",
      url:
        "https://raw.githubusercontent.com/FearlessSolutions/acronym_plugin/master/acronyms/software.json",
    },
  ];

  // urls for user selection options
  let urls = [];
  // list of available TLAs based on user selections
  let acronyms = [];

  /*GLOBAL FUNCTIONS*/
  /******************************/
  //HANDLE ADDING EVENTS IN OLDER BROWSERS (IE)
  const addEvent = (element, evnt, funct) => {
    if (element.attachEvent) return element.attachEvent("on" + evnt, funct);
    else return element.addEventListener(evnt, funct, false);
  };

  //HANDLE REMOVING EVENTS IN OLDER BROWSERS (IE)
  const removeEvent = (element, evnt, funct) => {
    if (element.detachEvent) return element.detachEvent("on" + evnt, funct);
    else return element.removeEventListener(evnt, funct, false);
  };

  // Search input box functionality
  // display the results of the search in the extension dropdown
  function display_results() {
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
        }
      }
    } else {
      var node = document.createElement("li");
      var textnode = document.createTextNode("No Matches");
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
      for (var i = 0; i < items.acronym_files.length; i++) {
        const result = fileReference.find(
          ({ ref }) => ref === items.acronym_files[i]
        );
        if (result && result.ref !== "default") {
          urls.push(result.url);
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

  /*BUILD TOOLTIPS*/
  let newTip = null;

  const tooltip = document.createElement("div");
  tooltip.id = "fearless_tooltip";

  class ToolTip {
    constructor(text, defs, x, y, h, w) {
      this.text = text;
      this.defs = defs;
      this.length = this.defs.length;
      this.x = x;
      this.y = y;
      this.h = h;
      this.w = w;
    }

    create() {
      const header = document.createElement("span");
      const headerText = document.createTextNode(`Fearless (${this.length})`);
      header.appendChild(headerText);
      //tooltip.appendChild(header);

      const listWrap = document.createElement("ul");
      listWrap.id = "def-list";

      for (var def of this.defs) {
        const listElem = document.createElement("li");
        const listTitle = document.createElement("p");
        const titleText = document.createTextNode(`${def.title}`);
        const listAction = document.createElement("a");
        const actionText = document.createTextNode("more");

        listTitle.appendChild(titleText);
        //listAction.appendChild(actionText);
        //listTitle.appendChild(listAction);
        listElem.appendChild(listTitle);

        if (def.priority == 1 || this.defs.length == 1) {
          listElem.classList.add("top");
          listWrap.prepend(listElem);

          if (def.description) {
            //TODO: this isn't dislaying where there is more than one result
            const listDesc = document.createElement("p");
            listDesc.classList.add("desc");
            const descText = document.createTextNode(def.description);
            listDesc.appendChild(descText);
            listElem.appendChild(listDesc);
          }
        } else {
          listWrap.appendChild(listElem);
        }
        tooltip.appendChild(listWrap);
      }

      document.body.append(tooltip);
      tooltip.classList.add("active");
      tooltip.style.top = `${this.y}px`;
      tooltip.style.left = `${this.x}px`;
    }

    remove() {
      tooltip.classList.remove("active");
      tooltip.innerHTML = "";
    }
  }

  const handleHighlightedText = (e) => {
    if (newTip) newTip.remove();

    const selectionObject = window.getSelection();
    const selectedText = selectionObject.toString().trim().replace(/\./g, "");

    let inner = "",
      x = 0,
      y = 0,
      h = 0,
      w = 0,
      range = {},
      rect = {},
      scroll = 0;

    if (!selectedText) return;

    const matches = acronyms.filter(function (tla) {
      return tla.abbreviation.toLowerCase() === selectedText.toLowerCase();
    });

    if (matches.length > 0) {
      inner = selectionObject.anchorNode.innerHTML;
      scroll = window.scrollY;
      if (inner) {
        if (inner.includes("input") || inner.includes("textarea")) {
          x = e.clientX;
          y = e.clientY + 10 + scroll;
          h = 1;
          w = 1;
        }
      } else {
        range = selectionObject.getRangeAt(0);
        rect = range.getBoundingClientRect();
        h = rect.height;
        w = rect.width;
        x = rect.left;
        y = rect.top + h + scroll;
      }
      newTip = new ToolTip(selectedText, matches, x, y, h, w);
      newTip.create();
    }
  };

  addEvent(document, "mouseup", function (event) {
    handleHighlightedText(event);
  });
})();
