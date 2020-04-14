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
Add options menu
Add better pop-up for random person
Save function for classes and such
Use more google colors var(--gm-...)
Publish extension 
Make the UI easier
Get attendees in a better way
*/

//global variables
let toggleButtonSVG = null
let peopleList = null
let peopleCounter = null
let compare = null
let nameSelector = null
let includeYourself = localStorage.getItem("gma-include-yourself") === "true"
let pos1, pos2, pos3, pos4 = 0

const icon =
  "<path fill=\"currentColor\" d=\"M11.41 3.76c-.8.04-1.6.31-2.27.86-1.5 1.22-1.89 3.52-.59 5.06 1.06 1.24 3.02 1.55 4.3.4.98-.88 1.21-2.5.2-3.52a2.05 2.05 0 00-1.34-.6c-.5-.02-1.05.17-1.42.61-.23.29-.35.64-.33 1.01.01.38.23.82.65 1.01.32.14.52.1.78-.01a.7.7 0 00.39-.37.74.74 0 00-.07-.65l-.84.54a.41.41 0 01-.01-.3c.05-.11.12-.13.13-.14l.04.02c-.07-.03-.07-.04-.07-.14s.05-.27.1-.33a.67.67 0 01.6-.25c.24.02.51.13.69.3.56.57.41 1.55-.18 2.08-.82.74-2.14.53-2.85-.3-.92-1.09-.63-2.76.45-3.64 1.34-1.09 3.37-.73 4.42.6 1.25 1.6.82 3.98-.77 5.2l.61.79a4.73 4.73 0 00.94-6.6 4.31 4.31 0 00-3.56-1.63zm.44 9.55c-1.42 0-3.45.34-5.19 1.04-.87.35-1.67.79-2.28 1.35a2.9 2.9 0 00-1.03 2.11v3.5h17v-3.5a2.9 2.9 0 00-1.04-2.11c-.6-.56-1.4-1-2.27-1.35a15.08 15.08 0 00-5.2-1.04zm0 1c1.25 0 3.22.33 4.81.97.8.32 1.5.72 1.97 1.15.48.44.72.89.72 1.38v2.5h-15v-2.5c0-.5.24-.94.71-1.38a6.57 6.57 0 011.97-1.15c1.6-.64 3.57-.97 4.82-.97zm0 1c-1.43 0-2.92.34-4.11.77-.6.21-1.11.45-1.51.7-.4.25-.74.45-.86.9l-.02.08v1.55h13v-1.57l-.02-.06c-.13-.47-.46-.66-.87-.9-.4-.25-.91-.49-1.5-.7a12.56 12.56 0 00-4.11-.77zm0 1c1.27 0 2.68.31 3.77.7.54.2 1 .42 1.32.62.3.19.42.38.4.3v.38h-11v-.37c0 .07.1-.12.41-.3.32-.2.79-.42 1.33-.62 1.09-.4 2.5-.7 3.77-.7z\"></path>"

const s = document.createElement("style")
s.innerText = `
#attendees-list a {
  display: inline-block;
  margin: 0 2px;
  padding: 0 5px;
  border-radius: 2rem;
  color: var(--gm-body-text-color);
  cursor: pointer;
  background-color: gainsboro;
  padding: 0 9px 0 9px;
  margin: 2px;
  height: 34px;
}

#attendees-list p {
  margin: 0;
}

#attendees-list #update {
  display: inline-block;
  width: 34px;
  height: 34px;
  border-radius: 2rem 0 0 2rem;
  background-image: url('https://img.icons8.com/material/24/000000/update-left-rotation.png');
  background-repeat: no-repeat;
  background-position: center center;
  background-color: gainsboro;
}

#attendees-list #update:hover, #attendees-list #show_list:hover, #attendees-list a:hover {
  background-color: dimgrey;
}

#attendees-list #show_list {
  display: inline-flex;
  border-radius: 0 2rem 2rem 0;
  height: 34px;
  position: absolute;
  background-color: gainsboro;
  padding: 0 9px 0 9px;
  line-height: 34px;
}

#attendees-list #settingsButton {
  display: inline-block;
  position: absolute;
  text-align: center;
  right: 5px;
  padding: 5px;
  height: auto;
}

#settingsButton svg {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* TO DO: */
#attendees-list div#settingsMenu {
  position: absolute;
  text-align: center;
  top: 100px;
  left: -100px;
  background-color: white;
  z-index: 3;
}

#attendees-list div#settingsHeader {
  padding: 5px;
  cursor: move;
  background-color: #2196F3;
  color: white;
}

/* Overrides some gmgv styles */
.__gmgv-button > div {
  border-radius: 0 0 8px 8px !important;
  z-index: 1;
  top: 41px;
}

.__gmgv-button:hover {
  z-index: 2;
  background-color: var(--gm-neutral-highlight-color);
}
`
document.body.append(s)

setInterval(() => {
  let buttons = document.querySelector("[data-fps-request-screencast-cap]").parentElement.parentElement.parentElement
  if ((buttons) && (!buttons.__attendent_ran)) {
    buttons.__attendent_ran = true
    console.log("%c Initialized Attendees Script", "background: #FFFFFF; color: #242424")

    buttons.prepend(buttons.children[1].cloneNode())
    const toggleButton = document.createElement("div")
    toggleButton.classList = buttons.children[1].classList
    toggleButton.classList.add("__gmgv-button")
    toggleButton.style.display = "flex"
    toggleButton.onclick = () => {
      let elem = document.getElementById("attendees-list")
      if (elem.__pinned) {
        elem.style.display = null
        elem.__pinned = false
      } else {
        elem.style.display = "block"
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

    // Add checkboxes for all our additional options
    const additionalOptions = document.createElement("div")
    additionalOptions.onclick = e => e.stopPropagation()
    toggleButton.appendChild(additionalOptions)
    additionalOptions.id = "attendees-list"

    const updateListI = document.createElement("a")
    updateListI.id = "update"
    updateListI.onclick = getAllAttendees
    additionalOptions.appendChild(updateListI)
    
    const showListI = document.createElement("a")
    showListI.id = "show_list"
    showListI.innerText = "Göm lista"
    showListI.onclick = (e) => {
      if (peopleList.style.display === "none") {
        peopleList.style.display = "block"
        e.target.innerText = "Göm lista"
      } else {
        peopleList.style.display = "none"
        e.target.innerText = "Visa lista"
      }
    }

    additionalOptions.appendChild(showListI)

    const settings = document.createElement("a")
    settings.id = "settingsButton"
    settings.onclick = () => {
      showElement(document.getElementById("settingsMenu"))
    }
    settings.innerHTML = "<svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" focusable=\"false\"><path d=\"M13.85 22.25h-3.7c-.74 0-1.36-.54-1.45-1.27l-.27-1.89c-.27-.14-.53-.29-.79-.46l-1.8.72c-.7.26-1.47-.03-1.81-.65L2.2 15.53c-.35-.66-.2-1.44.36-1.88l1.53-1.19c-.01-.15-.02-.3-.02-.46 0-.15.01-.31.02-.46l-1.52-1.19c-.59-.45-.74-1.26-.37-1.88l1.85-3.19c.34-.62 1.11-.9 1.79-.63l1.81.73c.26-.17.52-.32.78-.46l.27-1.91c.09-.7.71-1.25 1.44-1.25h3.7c.74 0 1.36.54 1.45 1.27l.27 1.89c.27.14.53.29.79.46l1.8-.72c.71-.26 1.48.03 1.82.65l1.84 3.18c.36.66.2 1.44-.36 1.88l-1.52 1.19c.01.15.02.3.02.46s-.01.31-.02.46l1.52 1.19c.56.45.72 1.23.37 1.86l-1.86 3.22c-.34.62-1.11.9-1.8.63l-1.8-.72c-.26.17-.52.32-.78.46l-.27 1.91c-.1.68-.72 1.22-1.46 1.22zm-3.23-2h2.76l.37-2.55.53-.22c.44-.18.88-.44 1.34-.78l.45-.34 2.38.96 1.38-2.4-2.03-1.58.07-.56c.03-.26.06-.51.06-.78s-.03-.53-.06-.78l-.07-.56 2.03-1.58-1.39-2.4-2.39.96-.45-.35c-.42-.32-.87-.58-1.33-.77l-.52-.22-.37-2.55h-2.76l-.37 2.55-.53.21c-.44.19-.88.44-1.34.79l-.45.33-2.38-.95-1.39 2.39 2.03 1.58-.07.56a7 7 0 0 0-.06.79c0 .26.02.53.06.78l.07.56-2.03 1.58 1.38 2.4 2.39-.96.45.35c.43.33.86.58 1.33.77l.53.22.38 2.55z\"></path><circle cx=\"12\" cy=\"12\" r=\"3.5\"></circle></svg>"
    additionalOptions.appendChild(settings)

    const settingsMenu = document.createElement("div")
    settingsMenu.style.display = "none"
    settingsMenu.id = "settingsMenu"

    const settingsHeader = document.createElement("div")
    settingsHeader.style.display = "block"
    settingsHeader.innerText = "Inställningar"
    settingsHeader.id = "settingsHeader"
    settingsHeader.onmousedown = (even) => {
      let elmnt = document.getElementById("settingsMenu")

      even = even || window.event
      even.preventDefault()
      // get the mouse cursor position at startup:
      pos3 = even.clientX
      pos4 = even.clientY

      document.onmouseup = () => {
        // stop moving when mouse button is released:
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
        // console.log([pos1, pos2, pos3, pos4])
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px"
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px"
      }
    }

    settingsMenu.appendChild(settingsHeader)

    const includeYourselfLabel = document.createElement("label")
    const includeYourselfCheck = document.createElement("input")
    includeYourselfCheck.type = "checkbox"
    includeYourselfCheck.checked = includeYourself
    includeYourselfCheck.onchange = e => {
      includeYourself = e.target.checked
      localStorage.setItem("gma-include-yourself", includeYourself)
    }
    includeYourselfLabel.innerText = "Inkludera dig själv"
    includeYourselfLabel.prepend(includeYourselfCheck)
    settingsMenu.appendChild(includeYourselfLabel)

    // Should be placed somewhere else
    additionalOptions.append(settingsMenu)

    peopleCounter = document.createElement("p")
    peopleList = document.createElement("textarea")
    peopleList.readOnly = true
    peopleList.rows = 10
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
    additionalOptions.appendChild(peopleList)
    additionalOptions.appendChild(peopleCounter)

    const copyList = document.createElement("a")
    copyList.innerText = "Kopiera lista"
    copyList.onclick = () => {
      navigator.clipboard.writeText(localStorage.getItem("gmca-attendees-list").replace(/,/g, "\n"))
    }
    additionalOptions.appendChild(copyList)

    const randomPerson = document.createElement("a")
    randomPerson.innerText = "Slumpa person"
    randomPerson.onclick = () => {
      let attendees = localStorage.getItem("gmca-attendees-list").split(",")
      setTimeout(() => { // to make it async
        alert(attendees[Math.floor(Math.random() * attendees.length)])
      }, 1)
    }
    additionalOptions.appendChild(randomPerson)

    const showCompareList = document.createElement("a")
    showCompareList.innerText = "Visa jämförings Lista"
    showCompareList.onclick = (e) => {
      if (compare.style.display === "none") {
        compare.style.display = "block"
        e.target.innerText = "Göm jämförings lista"
      } else {
        compare.style.display = "none"
        e.target.innerText = "Visa jämförings lista"
      }
    }
    additionalOptions.appendChild(showCompareList)

    compare = document.createElement("div")
    compare.style.display = "none"

    const compareList = document.createElement("textarea")
    compareList.rows = 10
    compareList.cols = 35
    compareList.placeholder = "Kopiera in jämföringslista"
    compareList.style.display = "block"
    compare.appendChild(compareList)

    const compareButton = document.createElement("a")
    compareButton.innerText = "Jämför"
    compareButton.onclick = compareLists
    compare.appendChild(compareButton)

    const cleanCompare = document.createElement("a")
    cleanCompare.innerText = "Städa jämföringslista"
    cleanCompare.onclick = cleanCompareLists
    compare.appendChild(cleanCompare)

    const hereL = document.createElement("label")
    hereL.innerText = "Resultat:"
    compare.appendChild(hereL)

    const compareResultList = document.createElement("textarea")
    compareResultList.rows = 10
    compareResultList.cols = 35
    compareResultList.value = "Klicka På jämför"
    compareResultList.style.display = "block"
    compare.appendChild(compareResultList)

    const copyCompareList = document.createElement("a")
    copyCompareList.innerText = "Kopiera lista"
    copyCompareList.onclick = () => {
      navigator.clipboard.writeText(compare.children[compare.childElementCount-3].value)
    }
    compare.appendChild(copyCompareList)

    const copyCompareListForChat = document.createElement("a")
    copyCompareListForChat.innerText = "Kopiera för chatten"
    copyCompareListForChat.onclick = () => {
      let toCopy = compare.children[compare.childElementCount-3].value
      while (toCopy.length > 500) {
        let toCopyArr = toCopy.split("\n")
        toCopy = toCopyArr.map(elem => elem.slice(0, -1)).join("\n")
      }
      navigator.clipboard.writeText(toCopy)
    }
    compare.appendChild(copyCompareListForChat)

    additionalOptions.appendChild(compare)
  }
}, 250)

const cleanCompareLists = () => {
  compare.firstChild.value = compare.firstChild.value.replace(/ {2,}/g, " ").replace(/\.|[0-9]/g, "").replace(/\n{2,}|\n{1,} {1,}/g, "\n")
}

const showElement = (elem) => {
  if (elem.style.display === "none") {
    elem.style.display = "block"
  } else {
    elem.style.display = "none"
  }
}

// Add: If the input list is empty don't return a X
const compareLists = () => {  
  let current = localStorage.getItem("gmca-attendees-list").split(",")
  let listToCompare = compare.firstChild.value.split("\n")
  
  if (current.length == 0) {
    return
  }

  let out = []
  listToCompare.forEach(listItem => {
    if (current.includes(listItem)) {
      out.push("✔️ " + listItem)
    } else {
      out.push("❌ " + listItem)
    }
  })
  current.forEach(listItem => {
    if (!listToCompare.includes(listItem)) {
      out.push("❔ " + listItem)
    }
  })

  compare.children[compare.childElementCount-3].value = out.join(String.fromCharCode(13, 10))
}

const getAllAttendees = () => {
  /* This is the function that should be reworked
     currently it forces grid view and then take
     all the names which is really inefficent and
     stupid but I don't know how to do it in a 
     better way. :( */
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

  let gridtoggle
  if (buttons.children[2].firstChild.innerHTML.substring(30, 31) == "1") {
    gridtoggle = true
  }  
  else {
    gridtoggle = false
  }
  let position = 2
  let checkboxes = buttons.children[2].lastChild.children
  if (checkboxes.length > 6) {
    position = 0
    checkboxes = buttons.children[0].lastChild.children
  }
  let showOnlyVideo = checkboxes[0].firstChild.checked
  // let includeOwnVideo = checkboxes[2].firstChild.checked
  // console.log(gridtoggle,showOnlyVideo,includeOwnVideo)
  
  let waitTime = 0
  let toChange = [false, false]
  // let toChange = [false, false, false]
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
  // doesn't matter really
  // if (!includeOwnVideo) {
  //   checkboxes[2].firstChild.checked = true
  //   toChange[2] = true
  //   waitTime += 1000
  // }

  // let attendees = []
  setTimeout(() => {
    if (!nameSelector || nameSelector == null) {
      nameSelector = document.querySelector("[data-allocation-index]").children[1].lastChild.classList[0]
    }
    let people = []
    let divList = document.getElementsByClassName(nameSelector)
    for (let item of divList) {
      people.push(item.innerText)
    }
    // console.log(people)
    let attendees = removeDups(people).sort((a, b) => a.split(" ")[1] < b.split(" ")[1] ? -1 : 1) // Sorted by lastname (maybe add option?)
    localStorage.setItem("gmca-attendees-list", attendees)
    // console.log(attendees)
    peopleList.value = attendees.join(String.fromCharCode(13, 10))
    peopleCounter.innerText = attendees.length + " personer"
    // return(attendees)
    setTimeout(() => {
      // console.log(toChange)
      if (toChange[0]) {
        buttons.children[position].click()
      }
      if (toChange[1]) {
        checkboxes[0].firstChild.checked = true
      }
    }, 1000)
  }, waitTime)
  

  // console.log(toChange)
}