var xauth = require('../../lib/server'),
      express = require('express')
      cors = require('cors')
      JID = require('node-xmpp-core').JID
      crypto = require('crypto')

var app = express()
app.use(cors())
app.use(express.static("static"))
app.use(express.json())
app.use(express.cookieParser())

app.post("/_session", handle_auth)
app.get("/rand", handle_rand)

function handle_rand(req, res) {
  console.log(req.cookies)
  console.log(logged_in)
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

function handle_auth(req, res) {
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
    res.send(202, "Auth in process")
    return
  }
  auths_in_flight[jidStr] = true

  setTimeout(function() {
    if (logged_in[jidStr] == undefined) {
      auths_in_flight[jid.toString()] = false
      console.log("Couldn't auth " + jidStr + " after 1 min")
      res.send(401, "Not Authenticated!")
    }
  }, 60000)

  console.log("Authenticating " + jidStr);

  // The credentials of your authentication bot. This account must exist
  // on your XMPP server.
  bot_jid = "someusername"
  bot_pass = "somepassword"

  xauth.request_auth(bot_jid, bot_pass, "Demo site", jidStr, function(err) {
    if (err) {
      res.send(401, "Not Authenticated!")
    } else {
      rand = crypto.randomBytes(10).toString('hex')

      logged_in[jidStr] = { cookie: rand }

      res.cookie('rand', rand, { expires: new Date(Date.now() + 900000), httpOnly: true})
      res.cookie('jid', jidStr, { expires: new Date(Date.now() + 900000), httpOnly: true})
      res.send(200)
    }
  })
}

app.listen(8000)
