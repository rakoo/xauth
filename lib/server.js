var xmpp = require ('simple-xmpp'),
    JID = require('node-xmpp-core').JID
    crypto = require('crypto')
    events = require('events')
    util = require('util')


function AuthRequester(auth_user, auth_pass, site) {
  var self = this
  events.EventEmitter.call(this)

  this.site = site

  xmpp.connect({
    jid: auth_user,
    password: auth_pass,
  })

  xmpp.on('error', function(e) {
    console.error(e)
  })

  xmpp.on('chat', function(from, message) {
    remote = new JID(from)
    if (remote.bare().toString() != human.bare().toString()) {
      cb(new Error("Requested response from " + human.bare() + ", got response from " + remote.bare()))
      return
    }

    // Some chat message unexpected. Silently dismiss it.
    if (self.token == undefined) {
      return
    }

    // Some clients (such as Pidgin) send a lot of garbage. trim it.
    if (message.trim() != self.token) {
      cb(new Error("Requested token " + self.token + ", got " + JSON.stringify(message)))
      return
    }

    msg = "Thank you ! You are now authenticated on " + site + "."
    xmpp.send(human, msg, false)
    self.emit('auth', jid.bare().toString())
    return
  })

  xmpp.on('stanza', function(stanza) {
    // Manual detection of wrong remote jid. 
    if (stanza.is('message') && stanza.attrs.type == 'error') {
      from = stanza.attrs.from
      if (from == human.toString()) {
        self.emit('error', new Error("Couldn't connect to " + from))
      }
    }
  })
}

util.inherits(AuthRequester, events.EventEmitter)

AuthRequester.prototype.auth = function(jid) {

  human = new JID(jid)
  if (human.getLocal() == undefined 
  || human.getLocal().trim() == ""
  || human.getDomain() == undefined
  || human.getDomain().trim() == "") {
    this.emit('error', new Error('Not a valid user'))
    return
  }

  var token = crypto.randomBytes(3).toString('hex')
  this.token = token

  msg = "It looks like you requested authentication on " + this.site + ". If you agree, please reply with " + token + ". No more, no less."
  xmpp.send(human, msg, false)
}

exports.AuthRequester = AuthRequester
