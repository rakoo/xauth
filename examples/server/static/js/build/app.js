/**
 * @jsx React.DOM
 */
var XAuthApp = React.createClass({displayName: 'XAuthApp',
  getInitialState: function() {
    return {
      jid: "", 
      authenticated: false,
      message: "You are not authenticated"
    };
  },

  handleChange: function(event) {
    this.state.jid = event.target.value
    this.state.message = "You are not authenticated"
    this.setState(this.state);
  },

  handleClick: function(event) {
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
  },

  authenticated: function(data) {
    if (data.status == 200) {
      this.state.authenticated = true
      this.state.message = "You are now authenticated!"
    } else {
      this.state.message = "You are not authenticated (maybe a wrong jid ?)"
    }
    this.setState(this.state)
  },

  render: function() {
    return (
      React.DOM.div(null, 
        React.DOM.p(null, "Please enter your XMPP Jid: " ),
        React.DOM.p(null, 
          React.DOM.input( {type:"text", onChange:this.handleChange, value:this.state.jid} ),
          React.DOM.input( {type:"button", onClick:this.handleClick, value:"Login"})
        ),
        React.DOM.p(null, this.state.message)
     )
    );
  }
});

React.renderComponent(
  XAuthApp(null ),
  document.getElementById('container')
);
