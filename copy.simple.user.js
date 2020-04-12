// ==UserScript==
// @name        DGIT Copy all users on google meet
// @namespace   meet copy ok?
// @include     https://meet.google.com/*
// @grant       none
// @version     0.0.1
// @author      C4illin & Daniel
// @description No joke this is so bad
// @run-at      document-idle
// ==/UserScript==


//global variables
let toggleButtonSVG = null
let peopleList = null
let peopleCounter = null
let compare = null
let nameSelector = null

const icon =
  "<path fill=\"currentColor\" d=\"M11.41 3.76c-.8.04-1.6.31-2.27.86-1.5 1.22-1.89 3.52-.59 5.06 1.06 1.24 3.02 1.55 4.3.4.98-.88 1.21-2.5.2-3.52a2.05 2.05 0 00-1.34-.6c-.5-.02-1.05.17-1.42.61-.23.29-.35.64-.33 1.01.01.38.23.82.65 1.01.32.14.52.1.78-.01a.7.7 0 00.39-.37.74.74 0 00-.07-.65l-.84.54a.41.41 0 01-.01-.3c.05-.11.12-.13.13-.14l.04.02c-.07-.03-.07-.04-.07-.14s.05-.27.1-.33a.67.67 0 01.6-.25c.24.02.51.13.69.3.56.57.41 1.55-.18 2.08-.82.74-2.14.53-2.85-.3-.92-1.09-.63-2.76.45-3.64 1.34-1.09 3.37-.73 4.42.6 1.25 1.6.82 3.98-.77 5.2l.61.79a4.73 4.73 0 00.94-6.6 4.31 4.31 0 00-3.56-1.63zm.44 9.55c-1.42 0-3.45.34-5.19 1.04-.87.35-1.67.79-2.28 1.35a2.9 2.9 0 00-1.03 2.11v3.5h17v-3.5a2.9 2.9 0 00-1.04-2.11c-.6-.56-1.4-1-2.27-1.35a15.08 15.08 0 00-5.2-1.04zm0 1c1.25 0 3.22.33 4.81.97.8.32 1.5.72 1.97 1.15.48.44.72.89.72 1.38v2.5h-15v-2.5c0-.5.24-.94.71-1.38a6.57 6.57 0 011.97-1.15c1.6-.64 3.57-.97 4.82-.97zm0 1c-1.43 0-2.92.34-4.11.77-.6.21-1.11.45-1.51.7-.4.25-.74.45-.86.9l-.02.08v1.55h13v-1.57l-.02-.06c-.13-.47-.46-.66-.87-.9-.4-.25-.91-.49-1.5-.7a12.56 12.56 0 00-4.11-.77zm0 1c1.27 0 2.68.31 3.77.7.54.2 1 .42 1.32.62.3.19.42.38.4.3v.38h-11v-.37c0 .07.1-.12.41-.3.32-.2.79-.42 1.33-.62 1.09-.4 2.5-.7 3.77-.7z\"></path>"

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
    showListI.type = "button"
    showListI.innerText = "Visa/Göm Lista"
    showListI.onclick = () => {
      showElement(peopleList)
    }
    additionalOptions.appendChild(showListI)

    peopleCounter = document.createElement("p")
    peopleList = document.createElement("textarea")
    peopleList.rows = 10
    peopleList.cols = 35
    let attendees = localStorage.getItem("gmca-attendees-list")
    if (attendees) {
      peopleList.value = attendees.replace(/,/g, String.fromCharCode(13, 10))
      // peopleCounter.innerText = "hmm personer"
      peopleCounter.innerText = (attendees.length - attendees.replace(/,/g, "").length + 1) + " personer"
      // peopleCounter.innerText(attendees.split(",").length + " personer")
    } else {
      peopleList.value = "Uppdatera listan"
      peopleCounter.innerText = "0 personer"
      getAllAttendees()
    }
    peopleList.style.display = "block"
    additionalOptions.appendChild(peopleList)
    additionalOptions.appendChild(peopleCounter)

    const copyList = document.createElement("input")
    copyList.type = "button"
    copyList.value = "Kopiera lista"
    copyList.onclick = () => {
      navigator.clipboard.writeText(localStorage.getItem("gmca-attendees-list").replace(/,/g, "\n"))
    }
    additionalOptions.appendChild(copyList)

    const randomPerson = document.createElement("input")
    randomPerson.type = "button"
    randomPerson.value = "Slumpa person"
    randomPerson.onclick = () => {
      let attendees = localStorage.getItem("gmca-attendees-list").split(",")
      setTimeout(() => { // to make it async
        alert(attendees[Math.floor(Math.random() * attendees.length)])
      }, 1)
    }
    additionalOptions.appendChild(randomPerson)

    const showCompareList = document.createElement("input")
    showCompareList.type = "button"
    showCompareList.value = "Visa jämförings Lista"
    showCompareList.onclick = () => {
      showElement(compare)
    }
    additionalOptions.appendChild(showCompareList)

    compare = document.createElement("div")
    compare.style.display = "block"

    const compareList = document.createElement("textarea")
    compareList.rows = 10
    compareList.cols = 35
    compareList.value = "Kopiera in jämföringslista"
    compareList.style.display = "block"
    compare.appendChild(compareList)

    const compareButton = document.createElement("input")
    compareButton.type = "button"
    compareButton.value = "Jämför"
    compareButton.onclick = compareLists
    compare.appendChild(compareButton)

    const hereL = document.createElement("label")
    hereL.innerText = "Resultat:"
    compare.appendChild(hereL)

    const compareResultList = document.createElement("textarea")
    compareResultList.rows = 10
    compareResultList.cols = 35
    compareResultList.value = "Klicka På jämför"
    compareResultList.style.display = "block"
    compare.appendChild(compareResultList)

    const copyCompareList = document.createElement("input")
    copyCompareList.type = "button"
    copyCompareList.value = "Kopiera lista"
    copyCompareList.onclick = () => {
      navigator.clipboard.writeText(compare.children[compare.childElementCount-3].value)
    }
    compare.appendChild(copyCompareList)

    const copyCompareListForChat = document.createElement("input")
    copyCompareListForChat.type = "button"
    copyCompareListForChat.value = "Kopiera (max 500 tecken)"
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

    const s = document.createElement('style')
    s.innerText = `
    #update {
      display: inline-block;
      width: 34px;
      height: 34px;
      border-radius: 2rem 0 0 2rem;
      background-image: url('https://img.icons8.com/material/24/000000/update-left-rotation.png');
      background-repeat: no-repeat;
      background-position: center center;
      background-color: gainsboro;
    }
    
    #update:hover , #show_list:hover {
      background-color: dimgrey;
    }
    
    #show_list {
      display: inline-flex;
      border-radius: 0 2rem 2rem 0;
      height: 30px;
      position: absolute;
      background-color: gainsboro;
      padding: 0 9px 0 9px;
      margin-left: 2px;
    }
    `
    document.body.append(s)
  }
}, 250)

const showElement = (elem) => {
  if (elem.style.display === "none") {
    elem.style.display = "block"
  } else {
    elem.style.display = "none"
  }
}

const compareLists = () => {  
  let current = localStorage.getItem("gmca-attendees-list").split(",")
  let listToCompare = compare.firstChild.value.split("\n")

  let out = []
  listToCompare.forEach(listItem => {
    if (current.includes(listItem)) {
      out.push("✔️ " + listItem)
    } else {
      out.push("❌ " + listItem)
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
  if (checkboxes[2].type == "textarea") {
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