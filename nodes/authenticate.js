module.exports = function(RED) {

  function authenticateNode(config) {
    RED.nodes.createNode(this,config);
    var node = this;
    // we get the properties
    node.url = config.url;
    node.baseDN = config.baseDN;
    node.on('input', function(msg) {
      node.status({fill:"blue", shape:"ring", text:"connecting"});
      // import activedirectory2
      var ActiveDirectory = require('activedirectory2');
      var adConfig = {
        url: node.url,
        baseDN: node.baseDN,
        usernameMaster: cUsername,
        passwordMaster: cPassword
      };
      // set attributes if defined
      if (msg.tlsOptions) {
        // Validates the Object format (required for IBMi platform)
        adConfig.tlsOptions = JSON.parse(JSON.stringify(msg.tlsOptions));
      }
      try {
        var ad = new ActiveDirectory(adConfig);
        node.status({fill:"green", shape:"dot", text:"connected"});
        let input = msg.payload;
        let username = null;
        let password = null;
        if(input.hasOwnProperty('username') && input.hasOwnProperty('password')) {
          username = input.username;
          password = input.password;
        } else {
          node.status({fill:"red", shape:"dot", text:"connection error"});
          node.error('Invalid username/password!');
        }

        node.status({fill:"blue",shape:"ring",text:"querying"});
        ad.authenticate(username, password, function(err, auth) {
          if (err) {
            node.status({fill:"red", shape:"dot", text:"error querying"});
            node.error('ERROR querying: ' + JSON.stringify(err));
            console.log('ERROR: ' + JSON.stringify(err));
            return;
          }
         
          if (auth) {
            node.status({fill:"green", shape:"dot", text:"authenticated!"});
            msg.payload = true;
            console.log(auth);
            node.send(msg);
            console.log('Authenticated!');
          }
          else {
            node.status({fill:"red", shape:"dot", text:"authentication failed!"});
            msg.payload = true;
            node.send(msg);
            console.log('Authentication failed!');
          }
        });
      } catch(e) {
        node.status({fill:"red", shape:"dot", text:"connection error"});
        node.error('ERROR connecting: ' + e.message);
      }
    });
  }

  RED.nodes.registerType("authenticate", authenticateNode,{
  });

}
