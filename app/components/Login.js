import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { login } from '../modules/account';
import CreateWallet from './CreateWallet.js'
import { getWIFFromPrivateKey } from 'neon-js';

const logo = require('../images/neon-logo2.png');

const onWifChange = (dispatch, value) => {
  // TODO: changed back to only WIF login for now, getting weird errors with
	// private key hex login
  dispatch(login(value));
};

const showDeviceInfo = (dispatch, value) => {
	process.stdout.write("showDeviceInfo called\n");
	const comm_node = require('ledger-node-js-api');
	process.stdout.write("\t" + "comm_node" + "\t" + comm_node + "\n");
	comm_node.create_async()
		.then(function(comm) {
			var deviceInfo = comm.device.getDeviceInfo();
			process.stdout.write("Success:\n");
			process.stdout.write(deviceInfo + "\n");
			window.getElementById("ledger_detection").innerHTML = 'Success: ' +  deviceInfo;
		})
		.catch(function(reason) {
			process.stdout.write("An error occured:\n");
			process.stdout.write(reason + "\n");
			window.getElementById("ledger_detection").innerHTML = 'An error occured: ' +  reason;
		});
};

let Login = ({ dispatch, loggedIn, wif }) =>
  <div id="loginPage">
    <div className="login">
      <div className="logo"><img src={logo} width="60px"/></div>
      <input type="text" placeholder="Enter your private key here (WIF)" onChange={(e) => onWifChange(dispatch, e.target.value)} />
      <div className="loginButtons">
        {loggedIn ? <Link to="/dashboard"><button>Login</button></Link> : <button disabled="true">Login</button>}
        <Link to="/create"><button>New Wallet</button></Link>
        <button onClick={(e) => showDeviceInfo(dispatch, e.target.value)}>Use Ledger Nano S</button>
      </div>
      <div id="ledger_detection">Ledger Detection</div>
      <div id="footer">Created by Ethan Fast and COZ. Donations: Adr3XjZ5QDzVJrWvzmsTTchpLRRGSzgS5A</div>
    </div>
  </div>;

const mapStateToProps = (state) => ({
  loggedIn: state.account.loggedIn,
  wif: state.account.wif
});

Login = connect(mapStateToProps)(Login);

export default Login;
