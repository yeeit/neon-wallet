import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { setClaimRequest, disableClaim } from '../modules/claim'
import { sendEvent, clearTransactionEvent } from '../modules/transactions'
import ReactTooltip from 'react-tooltip'
import { log } from '../util/Logs'
import { ledgerNanoSGetdoClaimAllGas, ledgerNanoSGetdoSendAsset } from '../modules/ledgerNanoS'

// wrap claiming with notifications

const doClaimNotify = (dispatch, net, selfAddress, wif) => {
  log(net, 'CLAIM', selfAddress, {info: 'claim all gas'})
  ledgerNanoSGetdoClaimAllGas(net, wif).then((response) => {
    if (response.result === true) {
      dispatch(sendEvent(true, 'Claim was successful! Your balance will update once the blockchain has processed it.'))
      setTimeout(() => dispatch(disableClaim(false)), 300000)
    } else {
      dispatch(sendEvent(false, 'Claim failed'))
    }
    setTimeout(() => dispatch(clearTransactionEvent()), 5000)
  })
}

// To initiate claim, first send all Neo to own address, the set claimRequest state
// When new claims are available, this will trigger the claim
const doGasClaim = (dispatch, net, wif, selfAddress, ans) => {
  // if no neo in account, no need to send to self first
  if (ans === 0) {
    doClaimNotify(dispatch, net, selfAddress, wif)
  } else {
    dispatch(sendEvent(true, 'Sending Neo to Yourself...'))
    log(net, 'SEND', selfAddress, {to: selfAddress, amount: ans, asset: 'NEO'})
    ledgerNanoSGetdoSendAsset(net, selfAddress, wif, {'NEO': ans}).then((response) => {
      if (response.result === undefined || response.result === false) {
        dispatch(sendEvent(false, 'Transaction failed!'))
      } else {
        dispatch(sendEvent(true, 'Waiting for transaction to clear...'))
        dispatch(setClaimRequest(true))
        dispatch(disableClaim(true))
      }
    })
  }
}

let Claim = class Claim extends Component {
  componentDidUpdate () {
    const { claimRequest, claimWasUpdated, dispatch, net, address, wif } = this.props
    // if we requested a claim and new claims are available, do claim
    if (claimRequest === true && claimWasUpdated === true) {
      dispatch(setClaimRequest(false))
      doClaimNotify(dispatch, net, address, wif)
    }
  }

  doClaim = () => {
    const { dispatch, net, wif, address, neo } = this.props
    doGasClaim(dispatch, net, wif, address, neo)
  }

  render () {
    const { claimAmount, disableClaimButton } = this.props
    let renderButton
    if (disableClaimButton === false) {
      renderButton = <button onClick={this.doClaim}>Claim {claimAmount} GAS</button>
    } else {
      renderButton = (<div>
        <button data-tip data-for='claimTip' className='disabled'>Claim {claimAmount} GAS</button>
        <ReactTooltip class='solidTip' id='claimTip' place='bottom' type='dark' effect='solid'>
          <span>You can claim Gas once every 5 minutes</span>
        </ReactTooltip>
      </div>)
    }
    return <div id='claim'>{renderButton}</div>
  }
}

const mapStateToProps = (state) => ({
  claimAmount: state.claim.claimAmount,
  claimRequest: state.claim.claimRequest,
  claimWasUpdated: state.claim.claimWasUpdated,
  disableClaimButton: state.claim.disableClaimButton,
  wif: state.account.wif,
  address: state.account.address,
  net: state.metadata.network,
  neo: state.wallet.Neo
})

Claim.propTypes = {
  dispatch: PropTypes.func.isRequired,
  address: PropTypes.string,
  wif: PropTypes.string,
  neo: PropTypes.string,
  claimRequest: PropTypes.bool,
  disableClaimButton: PropTypes.bool,
  claimWasUpdated: PropTypes.bool,
  claimAmount: PropTypes.number,
  net: PropTypes.string
}

Claim = connect(mapStateToProps)(Claim)

export default Claim
