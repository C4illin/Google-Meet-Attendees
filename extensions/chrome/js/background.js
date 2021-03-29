// Need to have the following permissions enabled
// - storage
// - tabs
// - alarms
import { getChromeStorage, setChromeStorage } from "./storage"

const log = (obj) => console.log("mutesync-integration", obj)

// You can host the json in github pages
const JSON_URL = 'https://gmattendees.github.io/google-meet-abr/assets/rollout.json'
// should look like: {upperBound: 0.05} means rolled out to only 5% of the userbase

const launchUrl = "https://gmattendees.github.io/google-meet-abr"

const ALARM = "Rollout"

const getOrSetRolloutValue = async () => {
  let { rolloutValue } = await getChromeStorage(["rolloutValue"])

  if (rolloutValue === undefined) {
    const rolloutValue = Math.random()
    await setChromeStorage({ rolloutValue })
  }

  return rolloutValue
}

const launchRolloutTabIfNeeded = async () => {
  chrome.alarms.clearAll()

  const { hasOpenedRollout } = await getChromeStorage(["hasOpenedRollout"])
  if (hasOpenedRollout) {
    return
  }
  try {
    const results = await fetch(JSON_URL)
    const { upperBound } = await results.json()
    const rolloutValue = await getOrSetRolloutValue()
    log({ rolloutValue, upperBound, launchUrl })
    if (rolloutValue <= upperBound) {
      await setChromeStorage({ hasOpenedRollout: true })
      chrome.tabs.create({ url: launchUrl })
      return
    }

    chrome.alarms.create(ALARM, { delayInMinutes: 1 })
  } catch (e) {
    log({ e })
  }
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM) {
    log("Rollout Alarm")
    launchRolloutTabIfNeeded()
  }
})

chrome.runtime.onInstalled.addListener(function () {
  log("Updated")
  launchRolloutTabIfNeeded()
})

chrome.runtime.onStartup.addListener(() => {
  log("Startup")
  launchRolloutTabIfNeeded()
})