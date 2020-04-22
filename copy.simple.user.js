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
When copying to chat make it ex Name L. With name and first letter of lastname. 
Add better pop-up for random person
Fix volume controls above menu https://i.imgur.com/IQ8BbYk.png
Use more google colors var(--gm-...)
Publish extension 
Get attendees in a better way
*/

//global variables
let toggleButtonSVG = null
let peopleList = null
let peopleCounter = null
let yourName = null
let includeYourself = localStorage.getItem("gma-include-yourself") === "true"
let sortByLastName = localStorage.getItem("gma-sort-by-last-name") === "true"
let notOnList = localStorage.getItem("gma-add-not-on-list") === "true"
let savedClasses = null
if (localStorage.getItem("gma-class-options") && localStorage.getItem("gma-class-options") != "[object Object]") {
  savedClasses = JSON.parse(localStorage.getItem("gma-class-options"))
} else {
  savedClasses = JSON.parse("{}")
}
let pos1, pos2, pos3, pos4 = 0

const icon = "<path fill=\"currentColor\" d=\"M11.41 3.76c-.8.04-1.6.31-2.27.86-1.5 1.22-1.89 3.52-.59 5.06 1.06 1.24 3.02 1.55 4.3.4.98-.88 1.21-2.5.2-3.52a2.05 2.05 0 00-1.34-.6c-.5-.02-1.05.17-1.42.61-.23.29-.35.64-.33 1.01.01.38.23.82.65 1.01.32.14.52.1.78-.01a.7.7 0 00.39-.37.74.74 0 00-.07-.65l-.84.54a.41.41 0 01-.01-.3c.05-.11.12-.13.13-.14l.04.02c-.07-.03-.07-.04-.07-.14s.05-.27.1-.33a.67.67 0 01.6-.25c.24.02.51.13.69.3.56.57.41 1.55-.18 2.08-.82.74-2.14.53-2.85-.3-.92-1.09-.63-2.76.45-3.64 1.34-1.09 3.37-.73 4.42.6 1.25 1.6.82 3.98-.77 5.2l.61.79a4.73 4.73 0 00.94-6.6 4.31 4.31 0 00-3.56-1.63zm.44 9.55c-1.42 0-3.45.34-5.19 1.04-.87.35-1.67.79-2.28 1.35a2.9 2.9 0 00-1.03 2.11v3.5h17v-3.5a2.9 2.9 0 00-1.04-2.11c-.6-.56-1.4-1-2.27-1.35a15.08 15.08 0 00-5.2-1.04zm0 1c1.25 0 3.22.33 4.81.97.8.32 1.5.72 1.97 1.15.48.44.72.89.72 1.38v2.5h-15v-2.5c0-.5.24-.94.71-1.38a6.57 6.57 0 011.97-1.15c1.6-.64 3.57-.97 4.82-.97zm0 1c-1.43 0-2.92.34-4.11.77-.6.21-1.11.45-1.51.7-.4.25-.74.45-.86.9l-.02.08v1.55h13v-1.57l-.02-.06c-.13-.47-.46-.66-.87-.9-.4-.25-.91-.49-1.5-.7a12.56 12.56 0 00-4.11-.77zm0 1c1.27 0 2.68.31 3.77.7.54.2 1 .42 1.32.62.3.19.42.38.4.3v.38h-11v-.37c0 .07.1-.12.41-.3.32-.2.79-.42 1.33-.62 1.09-.4 2.5-.7 3.77-.7z\"></path>"

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
  width: 90%;
  resize: none;
  border: 3px gainsboro solid;
  border-radius: 6px
}

#classInput {
  width: 40%
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
  right: 15px;
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
  padding: 15px;
  background: white;
  text-align: left;
  cursor: auto;
  line-height: 36px;
  flex-direction: row-reverse;
  position: absolute;
  right: -232px;
  border-radius: 8px 0 8px 8px;
  z-index: 7;
  top: 48px
}

#attendees-div, #compare-div {
  position: relative;
  width: 263px
}

#compare-div {
  padding: 0 5px 10px 10px;
  border-right: 3px dashed gainsboro
}

#attendees-div {
  padding-left: 15px
}

h1, h2, #attendees-list p {
  margin: 0
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

    toggleButtonSVG = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    toggleButtonSVG.style.width = "24px"
    toggleButtonSVG.style.height = "24px"
    toggleButtonSVG.setAttribute("viewBox", "0 0 24 24")
    toggleButtonSVG.innerHTML = icon
    toggleButton.appendChild(toggleButtonSVG)

    const additionalOptions = addElement("div",toggleButton,"attendees-list",null)
    additionalOptions.onclick = e => e.stopPropagation()

    const seeAttendeesDiv = addElement("div",additionalOptions,"attendees-div",null)

    addElement("h1",seeAttendeesDiv,null,"Närvaro")

    const updateListI = addElement("a",seeAttendeesDiv,"update",null)
    updateListI.onclick = getAllAttendees
    
    const showListI = addElement("a",seeAttendeesDiv,"show_list","Göm lista ↑")
    showListI.onclick = (e) => {
      if (peopleList.style.display === "none") {
        peopleList.style.display = "flex"
        e.target.innerText = "Göm lista ↑"
      } else {
        peopleList.style.display = "none"
        e.target.innerText = "Visa lista ↓"
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

    // includeYourself
    // Kanske göra till en funktion för att göra fler inställningar
    const includeYourselfLabel = addElement("label",settingsMenu,null,"Inkludera dig själv")
    const includeYourselfCheck = document.createElement("input")
    includeYourselfCheck.type = "checkbox"
    includeYourselfCheck.checked = includeYourself
    includeYourselfCheck.onchange = e => {
      includeYourself = e.target.checked
      localStorage.setItem("gma-include-yourself", includeYourself)
    }
    includeYourselfLabel.prepend(includeYourselfCheck)

    const sortByLastNameLabel = addElement("label",settingsMenu,null,"Sortera efter efternamn")
    const sortByLastNameCheck = document.createElement("input")
    sortByLastNameCheck.type = "checkbox"
    sortByLastNameCheck.checked = sortByLastName
    sortByLastNameCheck.onchange = e => {
      sortByLastName = e.target.checked
      localStorage.setItem("gma-sort-by-last-name", sortByLastName)
    }
    sortByLastNameLabel.prepend(sortByLastNameCheck)

    const notOnListLabel = addElement("label",settingsMenu,null,"Inkludera folk som inte är på jämförelselistan")
    const notOnListCheck = document.createElement("input")
    notOnListCheck.type = "checkbox"
    notOnListCheck.checked = notOnList
    notOnListCheck.onchange = e => {
      notOnList = e.target.checked
      localStorage.setItem("gma-add-not-on-list", notOnList)
    }
    notOnListLabel.prepend(notOnListCheck)

    const closeSettings = addElement("a",settingsMenu,null,"Stäng")
    closeSettings.position = "absolute"
    closeSettings.top = 0
    closeSettings.right = 0
    closeSettings.onclick = () => {
      showElement(document.getElementById("settingsMenu"))
    }

    peopleCounter = document.createElement("p")
    peopleList = document.createElement("textarea")
    peopleList.readOnly = true
    peopleList.rows = 20
    peopleList.cols = 35
    let attendees = localStorage.getItem("gmca-attendees-list")
    if (attendees) {
      peopleList.value = attendees.replace(/,/g, String.fromCharCode(13, 10))
      peopleCounter.innerText = (attendees.length - attendees.replace(/,/g, "").length + 1) + " personer"
    } else {
      peopleList.value = "Uppdatera listan"
      peopleCounter.innerText = "0 personer"
      getAllAttendees()
    }
    peopleList.style.display = "block"
    seeAttendeesDiv.appendChild(peopleList)
    seeAttendeesDiv.appendChild(peopleCounter)

    const copyList = addElement("a",seeAttendeesDiv,null,"Kopiera lista")
    copyList.onclick = () => {
      navigator.clipboard.writeText(localStorage.getItem("gmca-attendees-list").replace(/,/g, "\n"))
    }

    const randomPerson = addElement("a",seeAttendeesDiv,null,"Slumpa person")
    randomPerson.onclick = () => {
      let attendees = localStorage.getItem("gmca-attendees-list").split(",")
      setTimeout(() => { // to make it async
        alert(attendees[Math.floor(Math.random() * attendees.length)])
      }, 1)
    }

    const showCompareList = addElement("a",seeAttendeesDiv,null,"Visa jämförings Lista ↓")
    showCompareList.onclick = (e) => {
      if (compare.style.display === "none") {
        compare.style.display = "block"
        e.target.innerText = "Göm jämförings lista ↑"
      } else {
        compare.style.display = "none"
        e.target.innerText = "Visa jämförings lista ↓"
      }
    }

    const compare = addElement("div",additionalOptions,"compare-div",null)
    compare.style.display = "none"

    addElement("h2",compare,null,"Jämför deltagare")

    const compareList = addElement("textarea",compare,"compare-list",null)
    compareList.rows = 10
    compareList.cols = 35
    compareList.placeholder = "Kopiera in jämföringslista"
    compareList.style.display = "block"

    const compareButton = addElement("a",compare,null,"Jämför")
    compareButton.onclick = compareLists

    const cleanCompare = addElement("a",compare,null,"Städa jämföringslista")
    cleanCompare.onclick = cleanCompareLists

    const classInput = addElement("input",compare,"classInput",null)
    classInput.attributes["type"] = "text"
    classInput.placeholder = "Klass"
    classInput.autocomplete = "off"
    
    const saveButton = addElement("a",compare,null,"Spara lista")
    saveButton.onclick = () => {
      console.log("bacon")
      let className = document.getElementById("classInput").value
      console.log(className)
      saveClass(className)
      let chooseClassOptions = document.createElement("option")
      chooseClassOptions.innerText = className
      document.getElementById("chooseClass").appendChild(chooseClassOptions)
    } 

    const chooseClass = addElement("select",compare,"chooseClass",null)
    
    const defaultClassOption = addElement("option",chooseClass,null,"Ladda lista")
    
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
      console.log(savedClasses)
      Object.keys(savedClasses).forEach(className => {
        let chooseClassOptions = document.createElement("option")
        chooseClassOptions.innerText = className
        chooseClass.appendChild(chooseClassOptions)
      })
    }

    const removeClass = addElement("a",compare,null,"Ta bort klass")
    removeClass.onclick = () => {
      let classElement = document.getElementById("chooseClass")
      let className = classElement.selectedOptions[0].value
      classElement.removeChild(classElement.selectedOptions[0])
      removeClassName(className)
    }
    
    addElement("label",compare,null,"Resultat:")

    const compareResultList = addElement("textarea",compare,"compare-result-list",null)
    compareResultList.rows = 10
    compareResultList.cols = 35
    compareResultList.readOnly = true
    compareResultList.value = "Klicka På jämför"
    compareResultList.style.display = "block"

    const copyCompareList = addElement("a",compare,null,"Kopiera lista")
    copyCompareList.onclick = () => {
      navigator.clipboard.writeText(compare.children[compare.childElementCount-3].value)
    }

    const copyCompareListForChat = addElement("a",compare,null,"Kopiera för chatten")
    copyCompareListForChat.onclick = () => {
      let toCopy = compare.children[compare.childElementCount-3].value
      while (toCopy.length > 500) {
        let toCopyArr = toCopy.split("\n")
        toCopy = toCopyArr.map(elem => elem.slice(0, -1)).join("\n")
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

const cleanCompareLists = () => {
  // removes double spaces, dots, numbers, numbers followed by a letter, empty new row and new row with space.
  document.getElementById("compare-list").value = document.getElementById("compare-list").value.replace(/ {2,}/g, " ").replace(/\.|[0-9][a-zA-Z]|[0-9]|\n$/g, "").replace(/\n{2,}|\n{1,} {1,}/g, "\n")
}

const showElement = (elem) => {
  if (elem.style.display === "none") {
    elem.style.display = "block"
  } else {
    elem.style.display = "none"
  }
}

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
  if (current[0] != "" && notOnList) {
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

const saveClass = (className) => {
  savedClasses[className] = document.getElementById("compare-list").value.split("\n")
  localStorage.setItem("gma-class-options", JSON.stringify(savedClasses))
  document.getElementById("chooseClass").lastChild.selected = true
}

const removeClassName = (className) => {
  savedClasses[className] = null
  delete savedClasses[className]
  localStorage.setItem("gma-class-options", JSON.stringify(savedClasses))
}

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

const getAllAttendees = () => {
  /*  This is the function that should be reworked
      currently it forces grid view and then take
      all the names which is really inefficent and
      stupid but I don't know how to do it in a 
      better way. :( 
  */
  function removeDups(names) {
    let unique = {}
    names.forEach(function(i) {
      if(!unique[i]) {
        unique[i] = true
      }
    })
    return Object.keys(unique)
  }

  let buttons = document.querySelector("[data-fps-request-screencast-cap]").parentElement.parentElement.parentElement
  
  let position = 2
  let checkboxes = buttons.children[2].lastChild.children
  if (checkboxes.length > 9) {
    position = 0
    checkboxes = buttons.children[0].lastChild.children
  }
  let showOnlyVideo = checkboxes[0].firstChild.checked

  let gridtoggle = false
  if (buttons.children[position].firstChild.innerHTML.substring(30, 31) == "1") {
    gridtoggle = true
  }
  
  let waitTime = 0
  let toChange = [false, false]

  if (!gridtoggle) {
    buttons.children[position].click()
    toChange[0] = true
    waitTime += 2000
  }
  if (showOnlyVideo) {
    checkboxes[0].firstChild.checked = false
    toChange[1] = true
    waitTime += 800
  }

  setTimeout(() => {
    
    let nameSelector = "epqixc"

    // what it should "epqixc" but it doesn't sometimes, which defeats the purpose
    // if (document.querySelector(".__gmgv-vid-container")) {
    //   // nameSelector = document.querySelector(".__gmgv-vid-container").firstChild.lastChild.lastChild.classList[0]
    //   nameSelector = document.querySelector(".__gmgv-vid-container").firstChild.children[1].lastChild.classList[0]
    // } else {
    //   nameSelector = document.querySelector("[data-allocation-index]").children[1].lastChild.classList[0]
    // }

    let people = []
    let divList = document.getElementsByClassName(nameSelector)
    for (let item of divList) {
      people.push(item.innerText)
    }

    if (people.length == 1 && people[0] == buttons.lastChild.firstChild.children[2].innerText) {
      people = []
    }
    if (includeYourself) {
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
    if (sortByLastName) {
      attendees = attendees.sort((a, b) => a.split(" ").pop()[0] < b.split(" ").pop()[0] ? -1 : 1)
    } else {
      attendees = attendees.sort()
    }
    
    localStorage.setItem("gmca-attendees-list", attendees)

    peopleList.value = attendees.join(String.fromCharCode(13, 10))
    peopleCounter.innerText = attendees.length + " personer"
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