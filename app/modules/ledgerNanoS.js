import comm_node from 'ledger-node-js-api';

export var ledgerNanoS_PublicKey = undefined;

export var ledgerNanoS_PublicKeyInfo = undefined;

export var ledgerNanoS_DeviceInfo = undefined;

export const ledgerNanoS_AsynchGetInfo = function() {
    ledgerNanoS_DeviceInfo = "Initialising Device Info";
    ledgerNanoS_PublicKeyInfo = "Initialising App Info";

    process.stdout.write( "started ledgerNanoS_AsynchGetInfo  \n" );
    var promiseLedgerDevice = new Promise( getLedgerDeviceInfo );
    process.stdout.write( "success ledgerNanoS_AsynchGetInfo  \n" );


    var catchFn = function( reason ) {
        process.stdout.write( "ledgerNanoS_AsynchGetInfo error reason " + reason + "\n" );
    };

    return promiseLedgerDevice.then( function() {
        var promisePublicKey = new Promise( getPublicKeyInfo );
        return promisePublicKey;
    } ).catch( catchFn );
};

const LOGIN = 'LOGIN';

export const ledgerNanoS_Login = function() {
    return {
        type: LOGIN,
        ledgerNanoS: true,
        publicKey: ledgerNanoS_PublicKey
    }
};

const getLedgerDeviceInfo = function( resolve, reject ) {
    process.stdout.write( "started getLedgerDeviceInfo  \n" );
    ledgerNanoS_DeviceInfo = "Looking for USB Devices";
    comm_node.list_async().then( function( result ) {
        if ( result.length == 0 ) {
            process.stdout.write( "getLedgerDeviceInfo \"No device found\"\n" );
            ledgerNanoS_DeviceInfo = "USB Failure : No device found";
            resolve( ledgerNanoS_DeviceInfo );
        } else {
            comm_node.create_async().then( function( comm ) {
                var deviceInfo = comm.device.getDeviceInfo();
                ledgerNanoS_DeviceInfo = "Found USB " + deviceInfo.manufacturer + " " + deviceInfo.product;
                process.stdout.write( "getLedgerDeviceInfo success  \"" + ledgerNanoS_DeviceInfo + "\"\n" );
                comm.device.close();
                resolve( ledgerNanoS_DeviceInfo );
            } )
                .catch( function( reason ) {
                    comm.device.close();
                    ledgerNanoS_DeviceInfo = "Finding USB Error :" + reason;
                    process.stdout.write( "getLedgerDeviceInfo error reason \"" + reason + "\"\n" );
                    resolve( ledgerNanoS_DeviceInfo );
                } );
        }
    } );
    process.stdout.write( "success getLedgerDeviceInfo  \n" );
};

const getPublicKeyInfo = function( resolve, reject ) {
    process.stdout.write( "started getPublicKeyInfo  \n" );
    ledgerNanoS_PublicKey = undefined;
    ledgerNanoS_PublicKeyInfo = undefined;
    comm_node.list_async().then( function( result ) {
        if ( result.length == 0 ) {
            process.stdout.write( "getPublicKeyInfo \"No device found\"\n" );
            ledgerNanoS_PublicKeyInfo = "App Failure : No device found";
            resolve( ledgerNanoS_DeviceInfo );
        } else {
            comm_node.create_async().then( function( comm ) {
                var message = Buffer.from( "8004000000", "hex" );
                var validStatus = [0x9000];
                comm.exchange( message.toString( "hex" ), validStatus ).then( function( response ) {
                    comm.device.close();
                    ledgerNanoS_PublicKey = response.substring( 0, 130 );
                    ledgerNanoS_PublicKeyInfo = "App Found, Public Key Available";
                    process.stdout.write( "getPublicKeyInfo success  \"" + ledgerNanoS_PublicKeyInfo + "\"\n" );
                    resolve( ledgerNanoS_PublicKeyInfo );
                } ).catch( function( reason ) {
                    comm.device.close();
                    process.stdout.write( "getPublicKeyInfo comm.exchange error reason " + reason + "\n" );
                    if ( reason == "Invalid status 28160" ) {
                        ledgerNanoS_PublicKeyInfo = "NEO App does not appear to be open, request for private key returned error 28160.";
                    } else {
                        ledgerNanoS_PublicKeyInfo = "Public Key Comm Messaging Error :" + reason;
                    }
                    resolve( ledgerNanoS_PublicKeyInfo );
                } );
            } )
                .catch( function( reason ) {
                    comm.device.close();
                    process.stdout.write( "getPublicKeyInfo comm_node.create_async error reason " + reason + "\n" );
                    ledgerNanoS_PublicKeyInfo = "Public Key Comm Init Error :" + reason;
                    resolve( ledgerNanoS_PublicKeyInfo );
                } );

        }
    } );
    process.stdout.write( "success getPublicKeyInfo  \n" );
};

