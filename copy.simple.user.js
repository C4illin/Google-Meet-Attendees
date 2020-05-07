// ==UserScript==
// @name        Google Meet Attendees
// @namespace   Google Meet Attendees by Daniel & C4illin
// @include     https://meet.google.com/*
// @grant       none
// @version     0.0.1
// @author      Daniel & C4illin
// @description Get attendees at a google meet and do different things.
// @run-at      document-idle
// ==/UserScript==

// TODO (ordered by difficulty (easiest first))
/* 
Add better pop-up for random person
Add "20/28" attendees is here
English translation
Publish extension 
Get attendees in a better way
*/

const T = (untranslatedMsg) => {
  let languages = navigator.languages
  for(let i = 0; i < languages.length; i++){
    let result = translations[untranslatedMsg][languages[i]]
    if(result != null){
      return result
    }
  }
  return translations[untranslatedMsg]["en"]
}

const translations = {
  "hide list": {
    en: "⮝ hide list",
    Sv: "⮝ Göm lista"
  },
  "show list": {
    en: "⮟ Show list",
    sv: "⮟ Visa lista"
  },
  "include yourself": {
    en: "Include yourself",
    sv: "Inkludera dig själv"
  },
  "sort by last name": {
    en: "Sort by last name",
    sv: "Sortera efter efternamn"
  },
  "include not on list": {
    en: "Include people not on comparison list",
    sv: "Inkludera folk som inte är på jämförelselistan"
  },
  "maximize letters": {
    en: "Copy for chat maximizes letters",
    sv: "Kopiera för chatten maximerar antalet bokstäver"
  },
  "close": {
    en: "Close",
    sv: "Stäng"
  },
  "persons": {
    en: "persons",
    sv: "personer"
  },
  "update list": {
    en: "Update list",
    sv: "Uppdatera listan"
  },
  "copy list": {
    en: "Copy list",
    sv: "Kopiera lista"
  },
  "randomize person": {
    en: "Randomize person",
    sv: "Slumpa person"
  },
  "show comparison list": {
    en: "⮜ Show comparison list",
    sv: "⮜ Visa jämföringslista"
  },
  "hide comparison list": {
    en: "⮞ Hide comparison list",
    sv: "⮞ Göm jämföringslista"
  },
  "Insert comparison list": {
    en: "Insert comparison list",
    sv: "Kopiera in jämföringslista"
  },
  "clean comparison list": {
    en: "Clean comparison list",
    sv: "Städa jämföringslistan"
  },
  "class": {
    en: "Class",
    sv: "Klass"
  },
  "save list": {
    en: "Save list",
    sv: "Spara lista"
  },
  "load list": {
    en: "Load list",
    sv: "Ladda lista"
  },
  "remove class": {
    en: "Remove class",
    sv: "Ta bort klass"
  },
  "result:": {
    en: "Result:",
    sv: "Resultat:"
  },
  "click on compare": {
    en: "Click on compare",
    sv: "Klicka på jämför"
  },
  "copy for chat": {
    en: "Copy for chat",
    sv: "Kopiera för chatten"
  }
}

// Declare all global variables
let peopleList = null
let peopleCounter = null
let yourName = null
let savedClasses = null
if (localStorage.getItem("gma-class-options") && localStorage.getItem("gma-class-options") != "[object Object]") {
  savedClasses = JSON.parse(localStorage.getItem("gma-class-options"))
} else {
  savedClasses = JSON.parse("{}")
}
let pos1, pos2, pos3, pos4 = 0

const icon = "<path fill=\"currentColor\" d=\"M11.41 3.76c-.8.04-1.6.31-2.27.86-1.5 1.22-1.89 3.52-.59 5.06 1.06 1.24 3.02 1.55 4.3.4.98-.88 1.21-2.5.2-3.52a2.05 2.05 0 00-1.34-.6c-.5-.02-1.05.17-1.42.61-.23.29-.35.64-.33 1.01.01.38.23.82.65 1.01.32.14.52.1.78-.01a.7.7 0 00.39-.37.74.74 0 00-.07-.65l-.84.54a.41.41 0 01-.01-.3c.05-.11.12-.13.13-.14l.04.02c-.07-.03-.07-.04-.07-.14s.05-.27.1-.33a.67.67 0 01.6-.25c.24.02.51.13.69.3.56.57.41 1.55-.18 2.08-.82.74-2.14.53-2.85-.3-.92-1.09-.63-2.76.45-3.64 1.34-1.09 3.37-.73 4.42.6 1.25 1.6.82 3.98-.77 5.2l.61.79a4.73 4.73 0 00.94-6.6 4.31 4.31 0 00-3.56-1.63zm.44 9.55c-1.42 0-3.45.34-5.19 1.04-.87.35-1.67.79-2.28 1.35a2.9 2.9 0 00-1.03 2.11v3.5h17v-3.5a2.9 2.9 0 00-1.04-2.11c-.6-.56-1.4-1-2.27-1.35a15.08 15.08 0 00-5.2-1.04zm0 1c1.25 0 3.22.33 4.81.97.8.32 1.5.72 1.97 1.15.48.44.72.89.72 1.38v2.5h-15v-2.5c0-.5.24-.94.71-1.38a6.57 6.57 0 011.97-1.15c1.6-.64 3.57-.97 4.82-.97zm0 1c-1.43 0-2.92.34-4.11.77-.6.21-1.11.45-1.51.7-.4.25-.74.45-.86.9l-.02.08v1.55h13v-1.57l-.02-.06c-.13-.47-.46-.66-.87-.9-.4-.25-.91-.49-1.5-.7a12.56 12.56 0 00-4.11-.77zm0 1c1.27 0 2.68.31 3.77.7.54.2 1 .42 1.32.62.3.19.42.38.4.3v.38h-11v-.37c0 .07.1-.12.41-.3.32-.2.79-.42 1.33-.62 1.09-.4 2.5-.7 3.77-.7z\"></path>"

// Css for our project because we couldn't use a seperate css file.
const s = document.createElement("style")
s.innerText = `
.__gma-button:hover {
  z-index: 8;
  background-color: var(--gm-neutral-highlight-color)
}

.__gma-button {
  overflow: visible
}

.__gma-button:hover>#attendees-list {
  display: flex
}

#attendees-list label {
  display: block;
  line-height: 24px;
  color: #999
}

#attendees-list label:not(.disabled) {
  cursor: pointer;
  color: #000
}

#attendees-list label small {
  display: block;
  line-height: 12px;
  font-weight: 400
}

#attendees-list hr {
  border: 0;
  height: 1px;
  background: #f1f3f4
}

#attendees-list a {
  box-shadow: -3px -3px 3px 0 rgba(255, 255, 255, 0.384), 3px 3px 3px 0 rgba(0, 0, 0, .09);
  display: inline-block;
  border-radius: 2rem;
  color: var(--gm-body-text-color);
  cursor: pointer;
  background-color: gainsboro;
  padding: 0 9px;
  margin: 5px 2px;
  height: 34px
}

#attendees-list #update {
  display: inline-block;
  width: 34px;
  height: 34px;
  border-radius: 2rem 0 0 2rem;
  background-image: url('https://img.icons8.com/material/24/000000/update-left-rotation.png');
  background-repeat: no-repeat;
  background-position: center center;
  background-color: gainsboro
}

#attendees-list #update:hover, #attendees-list #show_list:hover, #attendees-list a:hover {
  background-color: #f1f3f4
}

#attendees-list textarea {
  width: calc(258px - 15px);
  resize: none;
  border: 3px gainsboro solid;
  border-radius: 6px
}

#classSave, #cleanCompareList {
  float: right;
}

#removeClass {
  position: absolute;
  right: 20px;
}

#chooseClass {
  height: 21px;
}

#classInput , #chooseClass{
  width: 50%;
  margin: 10px 0;
}

#attendees-list #show_list {
  display: inline-flex;
  border-radius: 0 2rem 2rem 0;
  height: 34px;
  position: absolute;
  background-color: gainsboro;
  padding: 0 9px;
  line-height: 34px
}

#attendees-list #settingsButton {
  display: inline-block;
  position: absolute;
  text-align: center;
  right: 0;
  padding: 5px;
  height: auto
}

#settingsButton svg {
  display: flex;
  justify-content: center;
  align-items: center
}

#attendees-list #settingsMenu {
  position: absolute;
  text-align: center;
  top: 100px;
  left: -100px;
  background-color: white;
  z-index: 3;
  border: 1px #2196F3 solid
}

#attendees-list #settingsHeader {
  padding: 5px;
  cursor: move;
  background-color: #2196F3;
  color: white
}

#attendees-list {
  box-sizing: border-box;
  display: none;
  padding: 15px 20px 20px 0;
  background: white;
  text-align: left;
  cursor: auto;
  line-height: 36px;
  flex-direction: row-reverse;
  position: absolute;
  right: -232px;
  border-radius: 0 0 8px 8px;
  z-index: 7;
  top: 48px
}

#attendees-div, #compare-div {
  position: relative;
  width: 258px
}

#compare-div {
  padding: 0 20px 5px 20px;
  border-right: 3px dashed gainsboro
}

#attendees-div {
  padding-left: 20px
}

h1, h2, #attendees-list p {
  margin: 0
}
.rKOYsc {
  z-index: 0 !important;
}
`
document.body.append(s)

setInterval(() => {
  let buttons = document.querySelector("[data-fps-request-screencast-cap]").parentElement.parentElement.parentElement
  if ((buttons) && (!buttons.__attendent_ran)) {
    buttons.__attendent_ran = true
    console.log("%c Initialized Attendees Script", "background: #FFFFFF; color: #242424")

    buttons.prepend(buttons.children[3].cloneNode())
    const toggleButton = document.createElement("div")
    toggleButton.classList = buttons.children[3].classList
    toggleButton.classList.add("__gma-button")
    toggleButton.style.display = "flex"
    toggleButton.onclick = () => {
      let elem = document.getElementById("attendees-list")
      if (elem.__pinned) {
        elem.style.display = null
        elem.__pinned = false
      } else {
        elem.style.display = "flex"
        elem.__pinned = true
      }
    }
    buttons.prepend(toggleButton)

    // Adds a icon to item bar 
    const toggleButtonSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    toggleButtonSVG.id = "icon"
    toggleButtonSVG.style.width = "24px"
    toggleButtonSVG.style.height = "24px"
    toggleButtonSVG.setAttribute("viewBox", "0 0 24 24")
    toggleButtonSVG.innerHTML = icon
    toggleButton.appendChild(toggleButtonSVG)

    // Creates the main div for every element
    const additionalOptions = addElement("div",toggleButton,"attendees-list",null)
    additionalOptions.onclick = e => e.stopPropagation()

    const seeAttendeesDiv = addElement("div",additionalOptions,"attendees-div",null)

    addElement("h1",seeAttendeesDiv,null,"Närvaro")

    const updateListI = addElement("a",seeAttendeesDiv,"update",null)
    updateListI.onclick = getAllAttendees
    
    const showListI = addElement("a",seeAttendeesDiv,"show_list",T("hide list"))
    showListI.onclick = (e) => {
      if (peopleList.style.display === "none") {
        peopleList.style.display = "flex"
        e.target.innerText = T("hide list")
      } else {
        peopleList.style.display = "none"
        e.target.innerText = T("show list")
      }
    }

    const settings = addElement("a",seeAttendeesDiv,"settingsButton",null)
    settings.onclick = () => {
      showElement(document.getElementById("settingsMenu"))
    }
    settings.innerHTML = "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" focusable=\"false\"><path d=\"M13.85 22.25h-3.7c-.74 0-1.36-.54-1.45-1.27l-.27-1.89c-.27-.14-.53-.29-.79-.46l-1.8.72c-.7.26-1.47-.03-1.81-.65L2.2 15.53c-.35-.66-.2-1.44.36-1.88l1.53-1.19c-.01-.15-.02-.3-.02-.46 0-.15.01-.31.02-.46l-1.52-1.19c-.59-.45-.74-1.26-.37-1.88l1.85-3.19c.34-.62 1.11-.9 1.79-.63l1.81.73c.26-.17.52-.32.78-.46l.27-1.91c.09-.7.71-1.25 1.44-1.25h3.7c.74 0 1.36.54 1.45 1.27l.27 1.89c.27.14.53.29.79.46l1.8-.72c.71-.26 1.48.03 1.82.65l1.84 3.18c.36.66.2 1.44-.36 1.88l-1.52 1.19c.01.15.02.3.02.46s-.01.31-.02.46l1.52 1.19c.56.45.72 1.23.37 1.86l-1.86 3.22c-.34.62-1.11.9-1.8.63l-1.8-.72c-.26.17-.52.32-.78.46l-.27 1.91c-.1.68-.72 1.22-1.46 1.22zm-3.23-2h2.76l.37-2.55.53-.22c.44-.18.88-.44 1.34-.78l.45-.34 2.38.96 1.38-2.4-2.03-1.58.07-.56c.03-.26.06-.51.06-.78s-.03-.53-.06-.78l-.07-.56 2.03-1.58-1.39-2.4-2.39.96-.45-.35c-.42-.32-.87-.58-1.33-.77l-.52-.22-.37-2.55h-2.76l-.37 2.55-.53.21c-.44.19-.88.44-1.34.79l-.45.33-2.38-.95-1.39 2.39 2.03 1.58-.07.56a7 7 0 0 0-.06.79c0 .26.02.53.06.78l.07.56-2.03 1.58 1.38 2.4 2.39-.96.45.35c.43.33.86.58 1.33.77l.53.22.38 2.55z\"></path><circle cx=\"12\" cy=\"12\" r=\"3.5\"></circle></svg>"

    const settingsMenu = addElement("div",seeAttendeesDiv,"settingsMenu",null)
    settingsMenu.style.display = "none"

    const settingsHeader = addElement("div",settingsMenu,"settingsHeader","Inställningar")
    
    settingsHeader.style.display = "block"
    settingsHeader.onmousedown = (even) => {
      movableDiv(even, "settingsMenu")
    }

    // Calls addSetting function
    addSetting("gma-include-yourself", T("include yourself"))
    addSetting("gma-sort-by-last-name",T("sort by last name"))
    addSetting("gma-add-not-on-list",T("include not on list"))
    addSetting("gma-more-letters",T("maximize letters"))

    const closeSettings = addElement("a",settingsMenu,null,T("close"))
    closeSettings.onclick = () => {
      showElement(document.getElementById("settingsMenu"))
    }

    peopleCounter = document.createElement("p")
    peopleList = document.createElement("textarea")
    peopleList.readOnly = true
    peopleList.rows = 20
    let attendees = localStorage.getItem("gmca-attendees-list")
    if (attendees) {
      peopleList.value = attendees.replace(/,/g, String.fromCharCode(13, 10))
      peopleCounter.innerText = (attendees.length - attendees.replace(/,/g, "").length + 1) + " " + T("persons")
    } else {
      peopleList.value = T("update list")
      peopleCounter.innerText = "0 " + T("persons")
      getAllAttendees()
    }
    peopleList.style.display = "block"
    seeAttendeesDiv.appendChild(peopleList)
    seeAttendeesDiv.appendChild(peopleCounter)

    const copyList = addElement("a",seeAttendeesDiv,null,T("copy list"))
    copyList.onclick = () => {
      navigator.clipboard.writeText(localStorage.getItem("gmca-attendees-list").replace(/,/g, "\n"))
    }

    const randomPerson = addElement("a",seeAttendeesDiv,null,T("randomize person"))
    randomPerson.onclick = () => {
      let attendees = localStorage.getItem("gmca-attendees-list").split(",")
      setTimeout(() => { // to make it async
        alert(attendees[Math.floor(Math.random() * attendees.length)])
      }, 1)
    }

    const showCompareList = addElement("a",seeAttendeesDiv,null,T("show comparison list"))
    showCompareList.onclick = (e) => {
      if (compare.style.display === "none") {
        compare.style.display = "block"
        e.target.innerText = T("hide comparison list")
        additionalOptions.style.borderRadius = "8px 0 8px 8px"
        document.getElementsByClassName("NzPR9b")[0].style.borderBottomLeftRadius = "0"
      } else {
        compare.style.display = "none"
        e.target.innerText = T("show comparison list")
        additionalOptions.style.borderRadius = "0 0 8px 8px"
        document.getElementsByClassName("NzPR9b")[0].style.borderBottomLeftRadius = "8px"
      }
    }

    const compare = addElement("div",additionalOptions,"compare-div",null)
    compare.style.display = "none"

    addElement("h2",compare,null,"Jämför deltagare")

    const compareList = addElement("textarea",compare,"compare-list",null)
    compareList.rows = 10
    compareList.placeholder = T("Insert comparison list")
    compareList.style.display = "block"

    const compareButton = addElement("a",compare,null,"Jämför")
    compareButton.onclick = compareLists

    const cleanCompare = addElement("a",compare,"cleanCompareList",T("clean comparison list"))
    cleanCompare.onclick = cleanCompareLists

    const classInput = addElement("input",compare,"classInput",null)
    classInput.attributes["type"] = "text"
    classInput.placeholder = T("class")
    classInput.autocomplete = "off"
    
    const saveButton = addElement("a",compare,"classSave",T("save list"))
    saveButton.onclick = saveClass

    const chooseClass = addElement("select",compare,"chooseClass",null)
    
    const defaultClassOption = addElement("option",chooseClass,null,T("load list"))
    
    chooseClass.onchange = (selectedClass) => {
      Object.entries(savedClasses).forEach(className => {
        if (className[0] == selectedClass.target.selectedOptions[0].value){
          document.getElementById("compare-list").value = className[1].join(String.fromCharCode(13, 10))
        }
        if (defaultClassOption.selected) {
          document.getElementById("compare-list").value = ""
        }
      })
    }

    if (savedClasses) {
      Object.keys(savedClasses).forEach(className => {
        let chooseClassOptions = document.createElement("option")
        chooseClassOptions.innerText = className
        chooseClass.appendChild(chooseClassOptions)
      })
    }

    const removeClass = addElement("a",compare,"removeClass",T("remove class"))
    removeClass.onclick = () => {
      let classElement = document.getElementById("chooseClass")
      let className = classElement.selectedOptions[0].value
      if (className != T("load list")) {
        classElement.removeChild(classElement.selectedOptions[0])
      }
      classElement.firstChild.selected = true
      document.getElementById("compare-list").value = null
      removeClassName(className)
    }
    
    addElement("label",compare,null,T("result:"))

    const compareResultList = addElement("textarea",compare,"compare-result-list",null)
    compareResultList.rows = 10
    compareResultList.readOnly = true
    compareResultList.value = T("click on compare")
    compareResultList.style.display = "block"

    const copyCompareList = addElement("a",compare,null,T("copy list"))
    copyCompareList.onclick = () => {
      navigator.clipboard.writeText(compare.children[compare.childElementCount-3].value)
    }

    const copyCompareListForChat = addElement("a",compare,null,T("copy for chat"))
    copyCompareListForChat.onclick = () => {
      let toCopy = compare.children[compare.childElementCount-3].value

      if (toCopy.length > 500) {
        if (localStorage.getItem("gma-more-letters") === "true") {
          while (toCopy.length > 500) {
            toCopy = toCopy.split("\n").map(elem => elem.split(" ").concat("").concat("").slice(0, 3).join(" ").slice(0, -1)).join("\n")
          }
        } else {
          toCopy = toCopy.split("\n").map(elem => elem.substring(0, elem.indexOf(" ",3)+2)).join("\n")
        }
  
        while (toCopy.length > 500) {
          toCopy = toCopy.split("\n").map(elem => elem.slice(0, -1)).join("\n")
        }
      }
      
      navigator.clipboard.writeText(toCopy)
    }
  }
}, 250)

const movableDiv = (even, moveID) => {
  let elmnt = document.getElementById(moveID)
  even = even || window.event
  even.preventDefault()
  pos3 = even.clientX
  pos4 = even.clientY

  document.onmouseup = () => {
    document.onmouseup = null
    document.onmousemove = null
  }

  document.onmousemove = (ev) => {
    ev = ev || window.event
    ev.preventDefault()
    pos1 = pos3 - ev.clientX
    pos2 = pos4 - ev.clientY
    pos3 = ev.clientX
    pos4 = ev.clientY
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px"
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px"
  }
}

// Removes double spaces, dots, numbers, numbers followed by a letter, empty new row and new row with space.
// This is used to clean input textarea from unnecessary signs.
const cleanCompareLists = () => {
  document.getElementById("compare-list").value = document.getElementById("compare-list").value.replace(/ {2,}/g, " ").replace(/\.|[0-9][a-zA-Z]|[0-9]|\n$/g, "").replace(/\n{2,}|\n{1,} {1,}/g, "\n")
}

// Takes an element for input and displays it if its not ready displayed.
const showElement = (elem) => {
  if (elem.style.display === "none") {
    elem.style.display = "block"
  } else {
    elem.style.display = "none"
  }
}

// This function compares the attendees to a class list and then outputs who is preset and who is not.
// Present people are marked by a green checkmark and not present people is marked by a red cross.
// People that was found in the meet but not in the class list is marked by an questionmark.   
const compareLists = () => {  
  let current = localStorage.getItem("gmca-attendees-list").split(",")
  let listToCompare = document.getElementById("compare-list").value.split("\n")

  let out = []
  if (listToCompare[0] != "") {
    listToCompare.forEach(listItem => {
      if (current.includes(listItem)) {
        out.push("✔️ " + listItem)
      } else {
        out.push("❌ " + listItem)
      }
    })
  }
  if (current[0] != "" && localStorage.getItem("gma-add-not-on-list") === "true") {
    current.forEach(listItem => {
      if (!listToCompare.includes(listItem)) {
        out.push("❔ " + listItem)
      }
    })
  }

  if (out.length > 0) {
    document.getElementById("compare-result-list").value = out.join(String.fromCharCode(13, 10))
  }
}

// Saves inputted class students in a array with the class name.
// Then stores it in localStorage to be accessed later.
const saveClass = () => {
  let className = document.getElementById("classInput").value
  let chooseClassOptions = document.createElement("option")
  chooseClassOptions.innerText = className
  document.getElementById("chooseClass").appendChild(chooseClassOptions)
  savedClasses[className] = document.getElementById("compare-list").value.split("\n")
  localStorage.setItem("gma-class-options", JSON.stringify(savedClasses))
  document.getElementById("chooseClass").lastChild.selected = true
}

// Removes a class that you selected in localStorage
const removeClassName = (className) => {
  savedClasses[className] = null
  delete savedClasses[className]
  localStorage.setItem("gma-class-options", JSON.stringify(savedClasses))
}

// The main function used to create elements.
// If there is no id or innertext supplied the function skips that.
const addElement = (element, parent, id, innertext) => {
  let elem = document.createElement(element)
  if (id) {
    elem.id = id
  }
  if (innertext) {
    elem.innerText = innertext
  }
  parent.appendChild(elem)
  return elem
}

// The main function for adding new options.
// It takes a path to localStorage as input and saves if the user has checked the box or not.
// "name" is a variable name.
const addSetting = (localStoragePath, name) => {
  let parent = addElement("label", settingsMenu, null, name)
  let elem = document.createElement("input")
  elem.type = "checkbox"
  elem.checked = localStorage.getItem(localStoragePath) === "true"
  elem.onchange = e => {
    localStorage.setItem(localStoragePath, e.target.checked)
  }
  parent.prepend(elem)
}

const getAllAttendees = () => {
  /*  This is the function that should be reworked
      currently it forces grid view and then take
      all the names which is really inefficent and
      stupid but I don't know how to do it in a 
      better way. :( 
  */
  //  Removes duplicate students in an Array
  function removeDups(names) {
    let unique = {}
    names.forEach(function(i) {
      if(!unique[i]) {
        unique[i] = true
      }
    })
    return Object.keys(unique)
  }
  // START This section turns on grid view for 2 seconds and grabs all the names. Then it turn itself off.
  let buttons = document.querySelector("[data-fps-request-screencast-cap]").parentElement.parentElement.parentElement
  
  let position = 2
  let checkboxes = buttons.children[2].lastElementChild.children
  if (checkboxes.length == 2) {
    position = 0
    checkboxes = buttons.children[0].lastElementChild.children
  }
  let showOnlyVideo = checkboxes[0].firstChild.checked

  let gridtoggle = false
  if (buttons.children[position].firstElementChild.innerHTML.substring(30, 31) == "1") {
    gridtoggle = true
  }
  
  let waitTime = 0
  let toChange = [false, false]

  if (!gridtoggle) {
    buttons.children[position].click()
    toChange[0] = true
    waitTime += 3000
  }
  if (showOnlyVideo) {
    checkboxes[0].firstChild.checked = false
    toChange[1] = true
    waitTime += 1000
  }
  // END

  setTimeout(() => {
    let nameSelector = "epqixc"

    let people = []
    let divList = document.getElementsByClassName(nameSelector)
    for (let item of divList) {
      people.push(item.innerText)
    }

    if (people.length == 1 && people[0] == buttons.lastChild.firstChild.children[2].innerText) {
      people = []
    }
    if (localStorage.getItem("gma-include-yourself") === "true") {
      if (yourName == null) {
        document.querySelectorAll("#yDmH0d > script").forEach( (elements) => { //Locked id may break later
          let text = elements.innerText
          if (text.includes('ds:7')) {
            people.push(text.split(",")[9].slice(1,-1))
          }
        })
      } else {
        people.push(yourName)
      }
    }

    let attendees = removeDups(people)
    if (localStorage.getItem("gma-sort-by-last-name") === "true") {
      attendees = attendees.sort((a, b) => a.split(" ").pop()[0] < b.split(" ").pop()[0] ? -1 : 1)
    } else {
      attendees = attendees.sort()
    }
    
    localStorage.setItem("gmca-attendees-list", attendees)

    peopleList.value = attendees.join(String.fromCharCode(13, 10))
    peopleCounter.innerText = attendees.length + " " + T("persons")
    setTimeout(() => {
      if (toChange[0]) {
        buttons.children[position].click()
      }
      if (toChange[1]) {
        checkboxes[0].firstChild.checked = true
      }
    }, 1000)
  }, waitTime)
}