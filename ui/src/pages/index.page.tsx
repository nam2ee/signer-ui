import { Field, PublicKey, Signature } from 'o1js';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import GradientBG from '../components/GradientBG.js';
import styles from '../styles/Home.module.css';
import './reactCOIServiceWorker';
import ZkappWorkerClient from './zkappWorkerClient';
import YUMITokenABI from './abi.json'; // Assume you've created this ABI file

let transactionFee = 0.1;
const ZKAPP_ADDRESS = 'B62qjiQ3CsBGHZw9YQPvLdJ93Awzf9giKTELhYT4BU68kqGJvhWgauK';
const YUMI_TOKEN_ADDRESS = '0x19DC7fB41Cc753E2156e10Eb3E94d96b36251EEb'; // Replace with your deployed ERC20 contract address

export default function Home() {
  const [state, setState] = useState({
    zkappWorkerClient: null as null | ZkappWorkerClient,
    hasWallet: null as null | boolean,
    hasBeenSetup: false,
    accountExists: false,
    publicKey: null as null | PublicKey,
    zkappPublicKey: null as null | PublicKey,
    creatingTransaction: false,
  });

  const [displayText, setDisplayText] = useState('');
  const [transactionlink, setTransactionLink] = useState('');
  const [ethAddress, setEthAddress] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [tokenAmount, setTokenAmount] = useState('');

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setEthAddress(address);
  
        // Switch to Arbitrum Sepolia
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x66eee' }], // Chain ID for Arbitrum Sepolia
          });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0x66eee',
                    chainName: 'Arbitrum Sepolia',
                    nativeCurrency: {
                      name: 'Ethereum',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'],
                    blockExplorerUrls: ['https://sepolia.arbiscan.io/'],
                  },
                ],
              });
            } catch (addError) {
              console.error('Failed to add the Arbitrum Sepolia network', addError);
            }
          } else {
            console.error('Failed to switch to the Arbitrum Sepolia network', switchError);
          }
        }
      } catch (error) {
        console.error('Failed to connect wallet', error);
      }
    } else {
      console.log('Please install MetaMask!');
    }
  };
  

    const mintTokens = async () => {
      if (typeof window.ethereum !== 'undefined' && isVerified) {

        console.log("metamask detected")

        const provider = new ethers.BrowserProvider(window.ethereum);
        console.log(provider)
        const signer = await provider.getSigner();
        console.log(signer)

        
        const contract = new ethers.Contract(YUMI_TOKEN_ADDRESS, YUMITokenABI, signer);
    
        try {
          const tx = await contract.mint(ethAddress, ethers.parseEther(tokenAmount));
          await tx.wait();
          console.log('Tokens minted successfully');
        } catch (error) {
          console.error('Error minting tokens', error);
        }
      }
    };

  // -------------------------------------------------------
  // Mina Setup

  useEffect(() => {
    (async () => {
      if (!state.hasBeenSetup) {
        setDisplayText('Loading web worker...');
        const zkappWorkerClient = new ZkappWorkerClient();
        await new Promise((resolve) => setTimeout(resolve, 5000));

        setDisplayText('Done loading web worker');

        await zkappWorkerClient.setActiveInstanceToDevnet();

        const mina = (window as any).mina;

        if (mina == null) {
          setState({ ...state, hasWallet: false });
          return;
        }

        const publicKeyBase58: string = (await mina.requestAccounts())[0];
        const publicKey = PublicKey.fromBase58(publicKeyBase58);

        setDisplayText(`Using key:${publicKey.toBase58()}`);

        setDisplayText('Checking if fee payer account exists...');

        const res = await zkappWorkerClient.fetchAccount({
          publicKey: publicKey!,
        });

        const accountExists = res.error == null;

        await zkappWorkerClient.loadContract();

        setDisplayText('Compiling zkApp...');
        await zkappWorkerClient.compileContract();
        setDisplayText('zkApp compiled...');

        const zkappPublicKey = PublicKey.fromBase58(ZKAPP_ADDRESS);

        await zkappWorkerClient.initZkappInstance(zkappPublicKey);

        setDisplayText('Getting zkApp state...');
        await zkappWorkerClient.fetchAccount({ publicKey: zkappPublicKey });
        setDisplayText('');

        setState({
          ...state,
          zkappWorkerClient,
          hasWallet: true,
          hasBeenSetup: true,
          publicKey,
          zkappPublicKey,
          accountExists,
        });
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (state.hasBeenSetup && !state.accountExists) {
        for (;;) {
          setDisplayText('Checking if fee payer account exists...');
          const res = await state.zkappWorkerClient!.fetchAccount({
            publicKey: state.publicKey!,
          });
          const accountExists = res.error == null;
          if (accountExists) {
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
        setState({ ...state, accountExists: true });
      }
    })();
  }, [state.hasBeenSetup]);

  // -------------------------------------------------------
  // Send a transaction

  const onVerifySignature = async () => {
    setState({ ...state, creatingTransaction: true });

    setDisplayText('Creating a transaction...');

    await state.zkappWorkerClient!.fetchAccount({
      publicKey: state.publicKey!,
    });

    let result = await window.mina?.signFields({ message: [1234] }).catch((err: any) => err);

      console.log( result);

      if (!result || !result.publicKey || !result.signature || !result.data || result.data.length === 0) {
        throw new Error('Invalid result from signFields');
      }
      

      const publickey = result.publicKey; 
      const signature = result.signature;
      const messageField = result.data[0];

    try {
      // TODO: Implement code for tossing arguments
      // You should generate a public key, signature, and message field here
      // const publicKey = ...
      // const signature = ...
      // const messageField = ...
      
      await state.zkappWorkerClient!.createVerifySignatureTransaction(
        publickey,
        signature,
        messageField
      );

      setDisplayText('Creating proof...');
      await state.zkappWorkerClient!.proveTransaction();

      setDisplayText('Requesting send transaction...');
      const transactionJSON = await state.zkappWorkerClient!.getTransactionJSON();

      setDisplayText('Getting transaction JSON...');
      const { hash } = await (window as any).mina.sendTransaction({
        transaction: transactionJSON,
        feePayer: {
          fee: transactionFee,
          memo: '',
        },
      });

      const transactionLink = `https://minascan.io/devnet/tx/${hash}`;
      console.log(`View transaction at ${transactionLink}`);

      setTransactionLink(transactionLink);
      setDisplayText(transactionLink);

      setState({ ...state, creatingTransaction: false });

      // Set verification status to true if the transaction is successful
      setIsVerified(true);
    } catch (error) {
      console.error('Error in transaction process:', error);
      
      if (error instanceof Error) {
        switch(true) {
          case error.message.includes('createVerifySignatureTransaction'):
            setDisplayText('Error creating verify signature transaction. Please try again.');
            break;
          case error.message.includes('proveTransaction'):
            setDisplayText('Error creating proof. This may take longer than expected.');
            break;
          case error.message.includes('getTransactionJSON'):
            setDisplayText('Error getting transaction data. Please check your connection.');
            break;
          case error.message.includes('sendTransaction'):
            setDisplayText('Error sending transaction. Please check your Mina wallet connection.');
            break;
          default:
            setDisplayText('An unexpected error occurred. Please try again later.');
        }
      } else {
        setDisplayText('An unknown error occurred. Please try again later.');
      }
    }
  };


  let hasWallet;
  if (state.hasWallet != null && !state.hasWallet) {
    const auroLink = 'https://www.aurowallet.com/';
    const auroLinkElem = (
      <a href={auroLink} target="_blank" rel="noreferrer">
        Install Auro wallet here
      </a>
    );
    hasWallet = <div>Could not find a wallet. {auroLinkElem}</div>;
  }

  const stepDisplay = transactionlink ? (
    <a
      href={transactionlink}
      target="_blank"
      rel="noreferrer"
      style={{ textDecoration: 'underline' }}
    >
      View transaction
    </a>
  ) : (
    displayText
  );

  let setup = (
    <div
      className={styles.start}
      style={{ fontWeight: 'bold', fontSize: '1.5rem', paddingBottom: '5rem' }}
    >
      {stepDisplay}
      {hasWallet}
    </div>
  );

  let accountDoesNotExist;
  if (state.hasBeenSetup && !state.accountExists) {
    const faucetLink =
      'https://faucet.minaprotocol.com/?address=' + state.publicKey!.toBase58();
    accountDoesNotExist = (
      <div>
        <span style={{ paddingRight: '1rem' }}>Account does not exist.</span>
        <a href={faucetLink} target="_blank" rel="noreferrer">
          Visit the faucet to fund this fee payer account
        </a>
      </div>
    );
  }


  let mainContent;
  if (state.hasBeenSetup && state.accountExists) {
    mainContent = (
      <div style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className={styles.center} style={{ padding: 0 }}>
          Verify Signature
        </div>
        <button
          className={styles.card}
          onClick={onVerifySignature}
          disabled={state.creatingTransaction}
        >
          Verify Signature
        </button>
        <button className={styles.card} onClick={connectWallet}>
          Connect Ethereum Wallet
        </button>
        {ethAddress && <p>Connected Ethereum Address: {ethAddress}</p>}
        {isVerified && (
          <div>
            <input
              type="number"
              value={tokenAmount}
              onChange={(e) => setTokenAmount(e.target.value)}
              placeholder="Enter token amount"
            />
            <button className={styles.card} onClick={mintTokens}>
              Mint Tokens
            </button>
          </div>
        )}
      </div>
    );
  }


  return (
    <GradientBG>
      <div className={styles.main} style={{ padding: 0 }}>
        <div className={styles.center} style={{ padding: 0 }}>
          {setup}
          {accountDoesNotExist}
          {mainContent}
        </div>
      </div>
    </GradientBG>
  );

  // ... (keep the return statement unchanged)
}
