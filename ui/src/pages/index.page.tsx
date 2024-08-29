import { Field, PublicKey, Signature, JsonProof } from 'o1js';
import { useEffect, useState } from 'react';
import { ethers , Log} from 'ethers';
import GradientBG from '../components/GradientBG.js';
import styles from '../styles/Home.module.css';
import './reactCOIServiceWorker';
import ZkappWorkerClient from './zkappWorkerClient';
import Header from '@/components/Header';
import { PUMP_Z_TOKEN_ADDRESS, Pump_Z_Token_ABI } from '../constants/contracts';
import {Check, Image as ImageIcon } from 'lucide-react';
import { create } from '@web3-storage/w3up-client';


let transactionFee = 0.1;
const ZKAPP_ADDRESS = 'B62qjiQ3CsBGHZw9YQPvLdJ93Awzf9giKTELhYT4BU68kqGJvhWgauK';
const ZKAPP_ADDRESS2 = 'B62qm5rowBR5PP8YFdwGhLiUPfrdPKtrz6eQHwBGYQEKybS2RFPvVxG';


let currentState = {
  zkappWorkerClient: null as null | ZkappWorkerClient,
  hasWallet: null as null | boolean,
  hasBeenSetup: false,
  accountExists: false,
  publicKey: null as null | PublicKey,
  zkappPublicKey: null as null | PublicKey,
  creatingTransaction: false,
}


const handleMessage = async (event: MessageEvent) => {
  if (event.source !== window) return;
  console.log("메세지가 도착했습니다", event.data.action);

  if (event.data.action == "x_proof") {
    console.log('x_proof');
      if (currentState.zkappWorkerClient != null) {
        console.log('x_proof');
        await VerifyProof(event.data.proof); 
      }
    } 
    else if (event.data.action == "isdev_proof") {
      console.log('isdev_proof');
      if (currentState.zkappWorkerClient != null) {
        await VerifyProof(event.data.proof);
        
      }
    }
    else if (event.data.action == "kakao_proof") {
      if (currentState.zkappWorkerClient != null) {
        console.log('kakao_proof');
        await VerifyProof(event.data.proof);
        
      }
    }
  else if (event.data.action == "instagram_name_proof"){
    if (currentState.zkappWorkerClient != null) {
      console.log('instagram_proof');
      await VerifyInstagramProof(event.data.proof);
      
    }
      
    }
};

const VerifyProof = async ( proof:JsonProof) => {


  if (!currentState.zkappWorkerClient) {
    console.error('zkappWorkerClient is not initialized');
    return;
  }



  try {

  await currentState.zkappWorkerClient!.Verificationproof('', '', proof);
  await currentState.zkappWorkerClient!.proveTransaction();

  console.log('prooved tx');

  const transactionJSON = await currentState.zkappWorkerClient!.getTransactionJSON();

  const { hash } = await (window as any).mina.sendTransaction({
    transaction: transactionJSON,
    feePayer: {
      fee: transactionFee,
      memo: '',
    },
  });

  const transactionLink = `https://minascan.io/devnet/tx/${hash}`;
  console.log(`View transaction at ${transactionLink}`);

  // Set verification status to true if the transaction is successful
  
} catch (error) {
  console.error('Error in transaction process:', error);
  
  if (error instanceof Error) {
    switch(true) {
      case error.message.includes('createVerifySignatureTransaction'):
        break;
      case error.message.includes('proveTransaction'):
        break;
      case error.message.includes('getTransactionJSON'):
        break;
      case error.message.includes('sendTransaction'):
        break;
      default:
    }
  } else {
  }
  }
}

const VerifyInstagramProof = async ( proof:JsonProof) => {


  if (!currentState.zkappWorkerClient) {
    console.error('zkappWorkerClient is not initialized');
    return;
  }



  try {

  await currentState.zkappWorkerClient!.VerificationInstagramProof('', '', proof);
  await currentState.zkappWorkerClient!.proveTransaction();

  console.log('prooved tx');

  const transactionJSON = await currentState.zkappWorkerClient!.getTransactionJSON();

  const { hash } = await (window as any).mina.sendTransaction({
    transaction: transactionJSON,
    feePayer: {
      fee: transactionFee,
      memo: '',
    },
  });

  const transactionLink = `https://minascan.io/devnet/tx/${hash}`;
  console.log(`View transaction at ${transactionLink}`);

  // Set verification status to true if the transaction is successful
  
} catch (error) {
  console.error('Error in transaction process:', error);
  
  if (error instanceof Error) {
    switch(true) {
      case error.message.includes('createVerifySignatureTransaction'):
        break;
      case error.message.includes('proveTransaction'):
        break;
      case error.message.includes('getTransactionJSON'):
        break;
      case error.message.includes('sendTransaction'):
        break;
      default:
    }
  } else {
  }
  }
}

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
  const [pumpZBalance, setPumpZBalance] = useState('0');
  const [showConditions, setShowConditions] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [isVerificationComplete, setIsVerificationComplete] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [client, setClient] = useState<any>(null);
  const [newPost, setNewPost] = useState({ title: '', content: '', image: '' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);




  const [setupStage, setSetupStage] = useState({
    workerLoaded: false,
    walletChecked: false,
    accountChecked: false,
    zkAppInitialized: false
  });

  // New state for popup


  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && client) {
      setSelectedFile(file);
      setImageLoading(true);
      try {
        await client.login("nam2ee7957@naver.com");
        console.log("성공입니다")
        setIsVerificationSent(true);
      } catch (error) {
        console.error('Error during login: ', error);
        setImageLoading(false);
      }
    }
  };

  const sendFile = async () => {
    if (!selectedFile) {
      console.error('No file selected');
      setImageLoading(false);
      return;
    }
    try {
      await client.setCurrentSpace('did:key:z6Mko3AXsdDmhpg149Cuf2qbKDuHixCgqumtdJf7b95tUWmE');
      let currfile = selectedFile;
      setSelectedFile(null);
      const cid = await client.uploadFile(selectedFile);
      setNewPost({ ...newPost, image: `https://${cid}.ipfs.w3s.link` });
      setImageLoading(false);
      setIsVerificationComplete(true);
      setIsVerificationSent(false);
      console.log('File uploaded successfully:', cid);
      
    } catch (error) {
      console.error('Error uploading file: ', error);
      setImageLoading(false);
    }
  };


  useEffect(() => {
    currentState = state;
  }, [state]);


  const [isSetupComplete, setIsSetupComplete] = useState(false);


  useEffect(() => {
    (async () => {
      if (!state.hasBeenSetup) {

        const clientInstance = await create();
        setClient(clientInstance);

        window.addEventListener("message", handleMessage);

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
        await zkappWorkerClient.compileContract2();
        setDisplayText('zkApp compiled...');

        const zkappPublicKey = PublicKey.fromBase58(ZKAPP_ADDRESS);

        await zkappWorkerClient.initZkappInstance(zkappPublicKey);

        const zkappPublicKey2 = PublicKey.fromBase58(ZKAPP_ADDRESS2);

        await zkappWorkerClient.initZkappInstance2(zkappPublicKey2);

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

        setIsSetupComplete(true);
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
    setDisplayText('zkApp1 compiled');
    await state.zkappWorkerClient.compileContract2();
    setDisplayText('zkApp2 compiled');

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

  const buyPumpZToken = async () => {
    setShowBuyPopup(true);
  };
  
  const handleBuyPumpZ = async () => {
    try {

      if (typeof window.ethereum === 'undefined') {
        throw new Error("No ethereum object found. Please install MetaMask.");
      }

      console.log("Creating BrowserProvider");
      const provider = new ethers.BrowserProvider(window.ethereum);
      console.log("Provider created:", provider);

      console.log("provider: " + JSON.stringify(provider.getNetwork()));

      const signer = await provider.getSigner();
      console.log("signer: " + JSON.stringify(signer))

      const Pump_Z_Token_Contract = new ethers.Contract(PUMP_Z_TOKEN_ADDRESS, Pump_Z_Token_ABI, signer);

      const ethAmountInWei = ethers.parseEther(buyAmount);

      setDisplayText("Buying PUMP_Z tokens, please wait...");

      // Call the buy function of the contract
      const tx = await Pump_Z_Token_Contract.buy({value: ethers.parseEther(buyAmount) , gasLimit: 300000});
      console.log("Transaction sent:", tx.hash);
  
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);
  
      console.log("PumpZ token purchase successful!");
      alert(`Successfully purchased PUMP_Z tokens for ${buyAmount} ETH`);
      
      // Update the user's token balance here
      // For example: updateUserBalance();
  
      setShowBuyPopup(false);
    } catch (error) {
      console.error("Error during PumpZ token purchase:", error);
      alert('Failed to purchase PUMP_Z tokens. Please try again.');
    }
  };
  

  const createNewToken = async (tokenName: string, tokenSymbol: string) => {
    try {
      setIsLoading(true);
      setDisplayText('Creating token...');
  
      const formData = new URLSearchParams();
      formData.append('tokenName', tokenName);
      formData.append('tokenSymbol', tokenSymbol);
  
      const response = await fetch('http://15.164.62.35:3001/pump/deploy', {
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

  const handleVerifyKakaoTalk = () => {
    const CLIENT_ID = "YOUR_KAKAO_CLIENT_ID"; // Replace with your actual Kakao Client ID
    const REDIRECT_URI = encodeURIComponent("YOUR_REDIRECT_URI"); // Replace with your actual redirect URI
    const KAKAO_QR_LOGIN_URL = 'https://accounts.kakao.com/qr_login/?append_stay_signed_in=false&continue=https%3A%2F%2Fkauth.kakao.com%2Foauth%2Fauthorize%3Fresponse_type%3Dcode%26redirect_uri%3DYOUR_REDIRECT_URI%26extra.app_type%3Dweb%26through_account%3Dtrue%26client_id%3DYOUR_KAKAO_CLIENT_ID&lang=ko&stay_signed_in=false#main';
    
    // Open the Kakao QR login page in a new tab
    window.open(KAKAO_QR_LOGIN_URL, '_blank');
  };

  
  const handleVerifyX = () => {
    window.open('https://x.com', '_blank');
  };
  
  const handleVerifyTelegram = () => {
    // Implement Telegram verification logic here
    console.log("Verifying with Telegram");
    // You can add your verification logic or API calls here
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

/*
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
    */

  return (
    <div className={styles.container}>
      <div className={styles.background}>
        <div className={styles.backgroundGradients}></div>
      </div>

      {isSetupComplete ? (
        <>
          <Header 
            ethAddress={ethAddress} 
            connectWallet={connectWallet}
            pumpZBalance={pumpZBalance}
            buyPumpZToken={buyPumpZToken}
          />

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
                  <button onClick={() => setShowConditions(!showConditions)}>
                    {showConditions ? 'Hide Conditions' : 'Assign Conditions'}
                  </button>
                  {showConditions && (
                    <div className={styles.conditionsButtons}>
                      <button onClick={handleVerifyKakaoTalk}>Verify with KakaoTalk</button>
                      <button onClick={handleVerifyX}>Verify with X</button>
                      <button onClick={handleVerifyTelegram}>Verify with Telegram</button>
                    </div>
                  )}
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
                  <button onClick={handleBuyPumpZ}>Buy Tokens</button>
                  <button onClick={() => setShowBuyPopup(false)}>Cancel</button>
                  <div className="custom-file mb-2">
                  <input 
                    type="file" 
                    className="custom-file-input" 
                    id="customFile" 
                    onChange={handleImageUpload}
                    style={{display: 'none'}}
                  />
                  <label className="btn btn-outline-primary" htmlFor="customFile">
                    <ImageIcon size={20} className="mr-2" />
                    Choose Image
                  </label>
                  {newPost.image && <span className="ml-2">Image selected</span>}
                </div>
                <div></div>
                {imageLoading ? <p>Uploading image </p> : null}
      {isVerificationSent && !isVerificationComplete && selectedFile && (
        <div>
          <p>For sending file, click the button below:</p>
          <button className="btn btn-secondary mb-2" onClick={sendFile}>
            <Check size={20} className="mr-2" />
            Send File
          </button>
        </div>
      )}
                </div>
              </div>
            )}
          </main>

          <footer className={styles.footer}>
            <p>&copy; 2023 Pump.Z. All rights reserved.</p>
          </footer>
        </>
      ) : (
        <div className={styles.loadingContainer}>
          <h1 className={styles.loadingTitle}>Pump.Z</h1>
          <div className={styles.status}>{displayText}</div>
        </div>
      )}
    </div>
  );
}