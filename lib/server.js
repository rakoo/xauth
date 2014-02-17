var xmpp = require ('simple-xmpp'),
    JID = require('node-xmpp-core').JID
    crypto = require('crypto')

exports.request_auth = function(auth_user, auth_pass, site, jid, cb) {

  token = crypto.randomBytes(3).toString('hex')

  human = new JID(jid)
  if (human.getLocal() == undefined 
      || human.getLocal().trim() == ""
      || human.getDomain() == undefined
      || human.getDomain().trim() == "") {
    cb(new Error("Not a valid user"))
    return
  }

  xmpp.connect({
    jid: auth_user,
    password: auth_pass,
  })

  xmpp.on('chat', function(from, message) {
    remote = new JID(from)
    if (remote.bare().toString() != human.bare().toString()) {
      cb(new Error("Requested response from " + human.bare() + ", got response from " + remote.bare()))
      return
    }

    // Some clients (such as Pidgin) send a lot of garbage. trim it.
    if (message.trim() != token) {
      cb(new Error("Requested token " + token + ", got " + JSON.stringify(message)))
      return
    }

    msg = "Thank you ! You are now authenticated on " + site + "."
    xmpp.send(human, msg, false)
    cb()
    return
  })

  xmpp.on('stanza', function(stanza) {
    // Manual detection of wrong remote jid. 
    if (stanza.is('message') && stanza.attrs.type == 'error') {
      from = stanza.attrs.from
      if (from == human.toString()) {
        cb(new Error("Couldn't connect to " + from))
      }
    }
  })

  msg = "It looks like you requested authentication on " + site + ". If you agree, please reply with " + token + ". No more, no less."
  xmpp.send(human, msg, false)
}

