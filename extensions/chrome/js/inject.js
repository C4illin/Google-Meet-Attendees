function injectScript(file_path) {
  const node = document.getElementsByTagName("html")[0]
  const script = document.createElement("script")
  script.setAttribute("type", "text/javascript")
  script.setAttribute("src", file_path)
  node.appendChild(script)
}

injectScript(chrome.runtime.getURL("js/copy.simple.user.js"))