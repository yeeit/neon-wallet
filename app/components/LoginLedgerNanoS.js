import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { login } from '../modules/account';
import { sendEvent, clearTransactionEvent } from '../modules/transactions';

import {ledgerNanoS_AsynchGetInfo,ledgerNanoS_PublicKey,ledgerNanoS_DeviceInfo,ledgerNanoS_Login} from '../modules/ledgerNanoS';


const logo = require('../images/neon-logo2.png');

const onLedgerNanoSChange = ( dispatch ) => {
    if ( ledgerNanoS_PublicKey != undefined ) {
        dispatch( ledgerNanoS_Login() );
    }
}

let LoginLedgerNanoS = ({ dispatch }) =>
  <div id="loginPage">
    <div className="login">
      <div className="loginForm">
        <div className="logo"><img src={logo} width="60px"/></div>
      </div>
      <div className="loginButtons">
         <button onClick={(e) => onLedgerNanoSChange(dispatch)}>Use Ledger Nano S</button>
        <Link to="/"><button className="altButton">Home</button></Link>
      </div>
      <div id="ledger_detection">{ledgerNanoS_DeviceInfo}</div>
      <div id="footer">Created by Ethan Fast and COZ. Donations: Adr3XjZ5QDzVJrWvzmsTTchpLRRGSzgS5A</div>
    </div>
  </div>;

const mapStateToProps = (state) => ({
});

ledgerNanoS_AsynchGetInfo();

LoginLedgerNanoS = connect(mapStateToProps)(LoginLedgerNanoS);

export default LoginLedgerNanoS;
