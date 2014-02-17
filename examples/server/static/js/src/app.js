/**
 * @jsx React.DOM
 */
var XAuthApp = React.createClass({
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
      <div>
        <p>Please enter your XMPP Jid: </p>
        <p>
          <input type="text" onChange={this.handleChange} value={this.state.jid} />
          <input type="button" onClick={this.handleClick} value="Login"/>
        </p>
        <p>{this.state.message}</p>
     </div>
    );
  }
});

React.renderComponent(
  <XAuthApp />,
  document.getElementById('container')
);
