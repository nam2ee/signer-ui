import { Field, PublicKey, Signature } from 'o1js';
import { useEffect, useState } from 'react';
import { ethers , Log} from 'ethers';
import GradientBG from '../components/GradientBG.js';
import styles from '../styles/Home.module.css';
import './reactCOIServiceWorker';
import ZkappWorkerClient from './zkappWorkerClient';
import Header from '@/components/Header';
import { PUMP_Z_TOKEN_ADDRESS, Pump_Z_Token_ABI } from '../constants/contracts';

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
  const [pumpZBalance, setPumpZBalance] = useState('0');
  const [showConditions, setShowConditions] = useState(false);

  const [setupStage, setSetupStage] = useState({
    workerLoaded: false,
    walletChecked: false,
    accountChecked: false,
    zkAppInitialized: false
  });

  // New state for popup
  useEffect(() => {
    
  
  }, []);

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

  const handleVerifyKakaoTalk = () => {
    // Kakao SDK가 초기화되었다고 가정합니다.
    // 실제 사용 시에는 Kakao SDK 초기화 여부를 확인해야 합니다.
  
    const CLIENT_ID = "c3065cf2faf06f8a125effaa3a0ce722"; // 실제 클라이언트 ID로 교체해야 합니다.
    const REDIRECT_URI = "http://localhost:3000"; // 실제 리다이렉트 URI로 교체해야 합니다.
  
    // state 파라미터 생성 (CSRF 공격 방지)
    const state = Math.random().toString(36).substr(2, 11);
  
    // 인증 URL 생성
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&state=${state}`;
  
    // state를 로컬 스토리지에 저장 (나중에 검증을 위해)
    localStorage.setItem('kakao_auth_state', state);
  
    // 콘솔에 로그 출력
    console.log("Verifying with KakaoTalk");
  
    // 사용자를 카카오 인증 페이지로 리다이렉트
    window.location.href = KAKAO_AUTH_URL;
  };
  
  const handleVerifyX = () => {
    // Implement X (Twitter) verification logic here
    console.log("Verifying with X");
    // You can add your verification logic or API calls here
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
      
      <Header ethAddress={ethAddress} connectWallet={connectWallet}pumpZBalance={pumpZBalance}
        buyPumpZToken={buyPumpZToken}  />

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
