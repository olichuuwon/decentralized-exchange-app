import { useEffect } from 'react';
import { UnsupportedChainIdError, useWeb3React } from "@web3-react/core";
import { InjectedConnector } from '@web3-react/injected-connector';

export const injected = new InjectedConnector({ //instantiate connector
  supportedChainIds: [1, 2, 3, 4, 42, 1337, 43114], // multi chain injector
});

// PERSISTANT CONNECTION

function useWeb3() {

  let { active, account, library, activate, deactivate } = useWeb3React();

  // ----- web3 react hooks ------
  // active is boolean(connected or not), 
  // account holds current user account
  // library is provider: library.getBalance(), library.getBlockNumber()
  // activate connects to Web3 and deactivate, disconnects Web3

  function connectOn() {
    activate(injected, undefined, true).then(() => {
      localStorage.setItem("provider", true); // once it activates; it sets provider to true to local storage
    })
      .catch((error) => {
        if (error instanceof UnsupportedChainIdError) {
          activate(injected.connector);
          localStorage.setItem("provider", true)
        } else {
          disconnect();
          localStorage.removeItem("provider");
        }
      });
  };

  const disconnect = () => {
    try {
      deactivate()
      localStorage.removeItem("provider")
    } catch (err) {
      console.error(err)
    }
  }

  // use network polling intervals to warn user their offline
  const connectOnLoad = () => {
    var provider = localStorage.getItem("provider")
    if (provider == null) return
    activate(injected, undefined, true).catch((error) => {
      if (error instanceof UnsupportedChainIdError) {
        activate(injected)
      } else {
        disconnect()
        localStorage.setItem("provider", true)
      }
    });

  };


  useEffect(() => {
    if (!library) {// will run when library is defined
      connectOnLoad() // it will need a provider to connect
    }
    // eslint-disable-next-line
  }, [library, account, active]);


  return { connectOnLoad, disconnect, connectOn }
};

export default useWeb3;