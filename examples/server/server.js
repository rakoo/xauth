var xauth = require('../../lib/server'),
      express = require('express')
      cors = require('cors')
      JID = require('node-xmpp-core').JID
      crypto = require('crypto')
      program = require('commander')


var app = express()
app.use(cors())
app.use(express.static("static"))
app.use(express.json())
app.use(express.cookieParser())

app.post("/_session", handle_login)
app.delete("/_session", handle_logout)
app.get("/rand", handle_rand)

function handle_rand(req, res) {
  if (logged_in[req.cookies.jid] != undefined) {
    expected = logged_in[req.cookies.jid]["cookie"]
    if (expected == req.cookies.rand) {
      rand = crypto.randomBytes(10).toString('hex')
      res.send(200, rand)
    }
  }
  res.send(404)
}

var auths_in_flight = {}
var logged_in = {}

function handle_logout(req, res) {
  if (logged_in[req.cookies.jid] != undefined) {
    expected = logged_in[req.cookies.jid]["cookie"]
    if (expected == req.cookies.rand) {
      delete(logged_in[req.cookies.jid])
      delete(auths_in_flight[req.cookies.jid])
      res.send(200)
    }
  }
  res.send(404)
}

function handle_login(req, res) {
  if (!req.is("application/json")) {
    res.send(400, "Unsupported content type. Must be application/json")
    return
  }

  if (!("jid" in req.body) || req.body["jid"] == "") {
    res.send(400, "Missing jid in json")
    return
  }

  jid = new JID(req.body["jid"])
  jidStr = jid.toString()

  // TODO consider the base jid, 
  if (auths_in_flight[jidStr] == true) {
    res.send(202, "Auth in progress")
    return
  }
  auths_in_flight[jidStr] = true

  setTimeout(function() {
    if (logged_in[jidStr] == undefined) {
      delete(auths_in_flight[jid.toString()])
      console.log("Couldn't auth " + jidStr + " after 1 min")
      res.send(401, "Not Authenticated!")
    }
  }, 60000)

  console.log("Authenticating " + jidStr);

  var errHandler = function (err) {
    res.send(401, "Not Authenticated!")
    removeListeners()
  }
  var authHandler = function(jid) {
    if (jid != jidStr) {
      return
    }
    rand = crypto.randomBytes(10).toString('hex')

    logged_in[jid] = { cookie: rand }
    delete(auths_in_flight[jid])

    res.cookie('rand', rand, { expires: new Date(Date.now() + 900000), httpOnly: true})
    res.cookie('jid', jid, { expires: new Date(Date.now() + 900000), httpOnly: true})
    res.send(200)
    removeListeners()
  }

  auther.on('error', errHandler)
  auther.on('auth', authHandler)

  var removeListeners = function() {
    auther.removeListener('error', errHandler)
    auther.removeListener('auth', authHandler)
  }

  auther.auth(jidStr)
}

program
  .option('-u, --bot-user <username>', 'The bot username')
  .option('-p, --bot-password <password>', 'The bot password')
  .parse(process.argv)

if (program.botUser == undefined || program.botPassword == undefined) {
  console.error("You need a bot!")
  return
}

var auther = new xauth.AuthRequester(program.botUser, program.botPassword, "Demo site")

app.listen(8000)
