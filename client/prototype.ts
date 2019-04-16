
// API METHODS
export function getVersion(cb) {
  fetch("/api/v3/version", { method: "GET", headers: { "Accept": "application/json", "Content-Type": "application/json" } }).then(response => response.json()).then(version => {
    cb(version);
  }).catch(err => console.error(err.toString()));
}

export function getAccount(cb) {
  fetch("/api/v3/account", { method: "GET", headers: { "Accept": "application/json", "Content-Type": "application/json" } }).then(response => response.json()).then(account => {

    cb(account);
  }).catch(err => console.error(err.toString()));
}

export function getStates(cb) {
  fetch("/api/v3/states", { method: "GET", headers: { "Accept": "application/json", "Content-Type": "application/json" } }).then(response => response.json()).then(states => {
    cb(states);
  }).catch(err => console.error(err.toString()));
}

export function getState(id, cb) {
  fetch("/api/v3/state", {
    method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ id: id })
  }).then(response => response.json()).then(state => { cb(state); })
    .catch(err => console.error(err.toString()));
}


export function publicStates(cb) {
  fetch("/api/v3/publicStates", {
    method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
  }).then(response => response.json()).then(states => {
    cb(states);
  })
    .catch(err => console.error(err.toString()));
}

export function statesByUsername(username, cb) {
  fetch("/api/v3/states", {
    method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ username: username })
  }).then(response => response.json()).then(states => { cb(states); })
    .catch(err => console.error(err.toString()));
}


export function getView(id, cb) {
  fetch("/api/v3/view", {
    method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ id: id })
  }).then(response => response.json()).then(view => { cb(view); })
    .catch(err => console.error(err.toString()));
}

export function postData(data, cb) {
  fetch("/api/v3/data/post", {
    method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(response => response.json()).then(view => { cb(view); })
    .catch(err => console.error(err.toString()));
}