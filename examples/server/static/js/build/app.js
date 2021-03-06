/**
 * @jsx React.DOM
 */
var RandButton = React.createClass({displayName: 'RandButton',
  getInitialState: function() {
    return {randvalue: ""}
  },

  handleClick: function(event) {
    $.ajax({
      type: "GET",
      url: '//localhost:8000/rand',
      complete: this.update_rand
    })
  },

  update_rand: function(data) {
    this.state.randvalue = data.responseText
    this.setState(this.state)
    console.log("Got randvalue: " + this.state.randvalue)
  },

  render: function() {
    return (
      React.DOM.p(null, 
        React.DOM.input( {type:"text", value:this.state.randvalue} ),
        React.DOM.input( {type:"button", onClick:this.handleClick, value:"Get random value"})
      )
    )
  }
})

var XAuthApp = React.createClass({displayName: 'XAuthApp',
  getInitialState: function() {
    return {
      jid: "", 
      authenticated: false,
      message: "You are not authenticated",
      loginButton: "Login"
    };
  },

  handleChange: function(event) {
    this.state.jid = event.target.value
    this.state.message = "You are not authenticated"
    this.setState(this.state);
  },

  handleClick: function(event) {
    if (this.state.loginButton == "Login") {
      this.state.authenticated = false
      this.state.message = "Authentication in progress..."
      this.setState(this.state)

      jid = this.state.jid
      console.log("Authenticating " + jid)

      $.ajax({
        type: "POST",
        url: '//localhost:8000/_session',
        data: JSON.stringify({jid: this.state.jid}),
        contentType: 'application/json',
        complete: this.authenticated
      })
    } else if (this.state.loginButton == "Logout") {
      $.ajax({
        type: "DELETE",
        url: '//localhost:8000/_session',
        complete: this.deauthenticated
      })
    }
  },

  authenticated: function(data) {
    if (data.status == 200) {
      this.state.authenticated = true
      this.state.message = "You are now authenticated!"
      this.state.loginButton = "Logout"
    } else {
      this.state.message = "You are not authenticated (Maybe a wrong jid ? Maybe too many requests ? Try waiting 1 min)"
    }
    this.setState(this.state)
  },

  deauthenticated: function(data) {
    this.state.authenticated = false
    this.state.message = "You are now deauthenticated."
    this.state.loginButton = "Login"
    this.setState(this.state)
  },

  render: function() {
    return (
      React.DOM.div(null, 
        React.DOM.p(null, "Please enter your XMPP Jid: " ),
        React.DOM.p(null, 
          React.DOM.input( {type:"text", onChange:this.handleChange, value:this.state.jid} ),
          React.DOM.input( {type:"button", onClick:this.handleClick, value:this.state.loginButton})
        ),
        React.DOM.p(null, this.state.message),
        React.DOM.p(null, 
          RandButton(null )
        )
     )
    );
  }
});

React.renderComponent(
  XAuthApp(null ),
  document.getElementById('container')
);
