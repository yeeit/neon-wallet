import comm_node from 'ledger-node-js-api';

export var ledgerNanoS_PublicKey = undefined;

export var ledgerNanoS_DeviceInfo = undefined;

var allLedgerInfoPollIx = 0;


export const ledgerNanoS_AsynchGetInfo = function() {
    setAllLedgerInfoTimer();
}

const setAllLedgerInfoTimer = function() {
    setImmediate( getAllLedgerInfo );
}

const getAllLedgerInfo = function() {
    let endPollIndex = false;
    switch ( allLedgerInfoPollIx ) {
        case 0:
            getPublicKeyInfo();
            break;
        case 1:
            getLedgerDeviceInfo();
            break;
        default:
            allLedgerInfoPollIx = 0;
            endPollIndex = true;
    }
    if ( !endPollIndex ) {
        allLedgerInfoPollIx++;
    }
};

export const ledgerNanoS_Login = function() {
    return {
        type: LOGIN,
        ledgerNanoS : true,
        publicKey: ledgerNanoS_PublicKey
    }
};

const getLedgerDeviceInfo = function() {
    ledgerNanoS_DeviceInfo = undefined;
    comm_node.create_async().then( function( comm ) {
        ledgerNanoS_DeviceInfo = comm.device.getDeviceInfo();
        comm.device.close();
        setAllLedgerInfoTimer();
    } )
        .catch( function( reason ) {
            comm.device.close();
            process.stdout.write( "error reason " + reason + "\n" );
            setAllLedgerInfoTimer();
        } );
}

const getPublicKeyInfo = function() {
    ledgerNanoS_PublicKey = undefined;
    comm_node.create_async().then( function( comm ) {
        var message = Buffer.from( "8004000000", "hex" );
        var validStatus = [0x9000];
        comm.exchange( message.toString( "hex" ), validStatus ).then( function( response ) {
            comm.device.close();
            ledgerNanoS_PublicKey = response.substring( 0, 130 );
            setAllLedgerInfoTimer();
        } ).catch( function( reason ) {
            comm.device.close();
            process.stdout.write( "error reason " + reason + "\n" );
            setAllLedgerInfoTimer();
        } );
    } )
        .catch( function( reason ) {
            comm.device.close();
            process.stdout.write( "error reason " + reason + "\n" );
            setAllLedgerInfoTimer();
        } );
}

