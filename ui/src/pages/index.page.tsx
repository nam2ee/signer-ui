import { Field, PublicKey, Signature } from 'o1js';
import { useEffect, useState } from 'react';
import { ethers , Log} from 'ethers';
import GradientBG from '../components/GradientBG.js';
import styles from '../styles/Home.module.css';
import './reactCOIServiceWorker';
import ZkappWorkerClient from './zkappWorkerClient';

let transactionFee = 0.1;
const ZKAPP_ADDRESS = 'B62qjiQ3CsBGHZw9YQPvLdJ93Awzf9giKTELhYT4BU68kqGJvhWgauK';

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
  const [tokenName, setTokenName] = useState('');
  const [Custom_Token_Address, setCustom_TOKEN_ADDRESS] = useState('');
  const [initialSupply, setInitialSupply] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenAddress, setTokenAddress] = useState('');
  const [mintedAmount, setMintedAmount] = useState('');
  const [showBuyPopup, setShowBuyPopup] = useState(false);
  const [buyAmount, setBuyAmount] = useState('');
  const [showCreatePopup, setShowCreatePopup] = useState(false);

  const [setupStage, setSetupStage] = useState({
    workerLoaded: false,
    walletChecked: false,
    accountChecked: false,
    zkAppInitialized: false
  });

  // New state for popup


  const loadWorker = async () => {
    setDisplayText('Loading web worker...');
    const zkappWorkerClient = new ZkappWorkerClient();
    await new Promise((resolve) => setTimeout(resolve, 5000));
    setDisplayText('Done loading web worker');
    setState({ ...state, zkappWorkerClient });
    setSetupStage({ ...setupStage, workerLoaded: true });
  };

  const checkWallet = async () => {
    const mina = (window as any).mina;
    if (mina == null) {
      setState({ ...state, hasWallet: false });
      setDisplayText('No wallet found. Please install Auro wallet.');
    } else {
      const publicKeyBase58: string = (await mina.requestAccounts())[0];
      const publicKey = PublicKey.fromBase58(publicKeyBase58);
      setDisplayText(`Using key:${publicKey.toBase58()}`);
      setState({ ...state, hasWallet: true, publicKey });
    }
    setSetupStage({ ...setupStage, walletChecked: true });
  };

  const checkAccount = async () => {
    if (!state.zkappWorkerClient) return;
    setDisplayText('Checking if fee payer account exists...');
    const res = await state.zkappWorkerClient.fetchAccount({
      publicKey: state.publicKey!,
    });
    const accountExists = res.error == null;
    setState({ ...state, accountExists });
    setSetupStage({ ...setupStage, accountChecked: true });
  };

  const initializeZkApp = async () => {
    if (!state.zkappWorkerClient) return;
    await state.zkappWorkerClient.loadContract();
    setDisplayText('Compiling zkApp...');
    await state.zkappWorkerClient.compileContract();
    setDisplayText('zkApp compiled');

    const zkappPublicKey = PublicKey.fromBase58(ZKAPP_ADDRESS);
    await state.zkappWorkerClient.initZkappInstance(zkappPublicKey);

    setDisplayText('Getting zkApp state...');
    await state.zkappWorkerClient.fetchAccount({ publicKey: zkappPublicKey });
    setDisplayText('zkApp initialized');

    setState({ ...state, zkappPublicKey, hasBeenSetup: true });
    setSetupStage({ ...setupStage, zkAppInitialized: true });
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setEthAddress(address);
  
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x66eee' }],
          });
        } catch (switchError: any) {
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

  const createNewToken = async (tokenName: string, tokenSymbol: string) => {
    try {
      setIsLoading(true);
      setDisplayText('Creating token...');
  
      const formData = new URLSearchParams();
      formData.append('tokenName', tokenName);
      formData.append('tokenSymbol', tokenSymbol);
  
      const response = await fetch('http://localhost:3001/pump/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
  
      if (!response.ok) {
        throw new Error('Failed to create token');
      }
  
      setDisplayText('Token created. Waiting for confirmation...');
  
      const data = await response.json();
  
      console.log('Token created:', data);
      setTokenAddress(data.tokenAddress);
      setMintedAmount(data.mintedAmount);
  
      setDisplayText(`Token created successfully! Address: ${data.tokenAddress}`);
      alert(`Token created successfully! Address: ${data.tokenAddress}`);
    } catch (error) {
      console.error('Error creating token:', error);
      setDisplayText('Failed to create token. Please try again.');
      alert('Failed to create token. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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

  // New functions for handling the popup
  const handleCreateMemeToken = () => {
    setShowCreatePopup(true);
  };

  const handleSubmitToken = async () => {
    console.log(`Creating token: ${tokenName} (${tokenSymbol})`);
    await createNewToken(tokenName, tokenSymbol);
    await setShowCreatePopup(false)
    setShowBuyPopup(true);
  };

  const activateMina = async () => {
    setShowCreatePopup(false);
    await loadWorker();
  };

  const handleBuyToken = async () => {

    setDisplayText(`Buying ${buyAmount} tokens, please wait...`);
    
    try {
      
      connectWallet()
      


      await new Promise(resolve => setTimeout(resolve, 2000));
      setDisplayText(`Successfully bought ${buyAmount} tokens!`);
      setShowBuyPopup(false);
    } catch (error) {
      setDisplayText(`Error buying tokens: ${error}`);
    }
  };


  let mainContent;
  if (!setupStage.workerLoaded) {
    mainContent = (
      <button className={styles.card} onClick={handleCreateMemeToken}>
        Create Meme Token!
      </button>
    );
  } else if (!setupStage.walletChecked) {
    mainContent = (
      <button className={styles.card} onClick={checkWallet}>
        Check Wallet
      </button>
    );
  } else if (!setupStage.accountChecked) {
    mainContent = (
      <button className={styles.card} onClick={checkAccount}>
        Check Account
      </button>
    );
  } else if (!setupStage.zkAppInitialized) {
    mainContent = (
      <button className={styles.card} onClick={initializeZkApp}>
        Initialize zkApp
      </button>
    );
  } else if (state.hasBeenSetup && state.accountExists) {
    // ... (keep your existing content for when setup is complete)
  }

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.backgroundGradients}></div>
      </div>
      
      <header className={styles.header}>
        <div className={styles.logo}>
          <img src="/pump-z-logo.png" alt="Pump.Z Logo" />
          <h1>Pump.Z</h1>
        </div>
        <nav className={styles.nav}>
          <a href="#" className={styles.navLink}>Home</a>
          <a href="#" className={styles.navLink}>About</a>
          <a href="#" className={styles.navLink}>Contact</a>
        </nav>
      </header>
  
      <main className={styles.main}>
        <h1 className={styles.title}>Pump.Z</h1>
        <p className={styles.description}>
          The ultimate meme coin pump station!
        </p>
  
        <div className={styles.buttonContainer}>
          <button className={styles.button} onClick={handleCreateMemeToken}>
            Create Meme Token!
          </button>
        </div>
  
        {/* ... (keep your existing conditional rendering for wallet checks, etc.) */}
  
        {displayText && <div className={styles.status}>{displayText}</div>}
  
        {showCreatePopup && (
          <div className={styles.popup}>
            <div className={styles.popupContent}>
              <h2>Create Your Meme Token</h2>
              <input
                type="text"
                placeholder="Token Name"
                value={tokenName}
                onChange={(e) => setTokenName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Token Symbol"
                value={tokenSymbol}
                onChange={(e) => setTokenSymbol(e.target.value)}
              />
              <input
                type="text"
                placeholder="Initial Supply"
                value={initialSupply}
                onChange={(e) => setInitialSupply(e.target.value)}
              />
              <button onClick={handleSubmitToken}>Create Token</button>
              <button onClick={activateMina}>Activate Mina</button>
              <button onClick={() => setShowCreatePopup(false)}>Cancel</button>
            </div>
          </div>
        )}
  
        {showBuyPopup && (
          <div className={styles.popup}>
            <div className={styles.popupContent}>
              <h2>Buy Tokens</h2>
              <p>Token Address: {tokenAddress}</p>
              <input
                type="number"
                placeholder="Amount to buy"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
              />
              <button onClick={handleBuyToken}>Buy Tokens</button>
              <button onClick={() => setShowBuyPopup(false)}>Cancel</button>
            </div>
          </div>
        )}
      </main>
  
      <footer className={styles.footer}>
        <p>&copy; 2023 Pump.Z. All rights reserved.</p>
      </footer>
    </div>
  );


}
