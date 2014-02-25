/**
 * @jsx React.DOM
 */
var RandButton = React.createClass({
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
      <p>
        <input type="text" value={this.state.randvalue} />
        <input type="button" onClick={this.handleClick} value="Get random value"/>
      </p>
    )
  }
})

var XAuthApp = React.createClass({
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
      <div>
        <p>Please enter your XMPP Jid: </p>
        <p>
          <input type="text" onChange={this.handleChange} value={this.state.jid} />
          <input type="button" onClick={this.handleClick} value={this.state.loginButton}/>
        </p>
        <p>{this.state.message}</p>
        <p>
          <RandButton />
        </p>
     </div>
    );
  }
});

React.renderComponent(
  <XAuthApp />,
  document.getElementById('container')
);
