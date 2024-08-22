import { Field, PublicKey, Signature } from 'o1js';
import { useEffect, useState } from 'react';
import { ethers , Log} from 'ethers';
import GradientBG from '../components/GradientBG.js';
import styles from '../styles/Home.module.css';
import './reactCOIServiceWorker';
import ZkappWorkerClient from './zkappWorkerClient';

let transactionFee = 0.1;
const ZKAPP_ADDRESS = 'B62qjiQ3CsBGHZw9YQPvLdJ93Awzf9giKTELhYT4BU68kqGJvhWgauK';
const TOKEN_FACTORY_ADDRESS = '0x4896e6d340027E2471Bf854d8B10770024Af0e04'; // Replace with your deployed ERC20 contract address
const TokenFactoryABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "TokenCreated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      }
    ],
    "name": "createToken",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

const CustomTokenABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "initialOwner",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "allowance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "ERC20InsufficientAllowance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "balance",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "needed",
        "type": "uint256"
      }
    ],
    "name": "ERC20InsufficientBalance",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "approver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidApprover",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidReceiver",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "ERC20InvalidSpender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      }
    ],
    "name": "allowance",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]


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
  

  const createNewToken = async (tokenName: string, tokenSymbol: string, initialSupply: string) => {
    if (typeof window.ethereum !== 'undefined' && isVerified) {
      try {
        console.log("Creating new token...");
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
  
        const factory = new ethers.Contract(TOKEN_FACTORY_ADDRESS, TokenFactoryABI, signer);
        console.log("Factory contract initialized");
  
        // Convert initialSupply to wei (assuming 18 decimals)
        const initialSupplyWei = ethers.parseEther(initialSupply);
  
        // Create a new token
        const tx = await factory.createToken(tokenName, tokenSymbol);
        console.log("Token creation transaction sent:", tx.hash);
        const receipt = await tx.wait();
        console.log("Token creation transaction confirmed:", receipt.transactionHash);
  
        // Get the new token address from the event logs
        const event = receipt.logs.find((log: Log) => 
          log.topics[0] === ethers.id("TokenCreated(address,string,string,address)")
        );
  
        if (!event) {
          throw new Error("TokenCreated event not found in transaction logs");
        }
  
        const [newTokenAddress, , , owner] = ethers.AbiCoder.defaultAbiCoder().decode(
          ['address', 'string', 'string', 'address'], 
          event.data
        );
  
        console.log('New token created at:', newTokenAddress);
        console.log('Token owner:', owner);
  
        // Now, let's mint the initial supply
        const newToken = new ethers.Contract(newTokenAddress, CustomTokenABI, signer);
        console.log("Minting initial supply...");
        const mintTx = await newToken.mint(await signer.getAddress(), initialSupplyWei);
        console.log("Mint transaction sent:", mintTx.hash);
        const mintReceipt = await mintTx.wait();
        console.log("Mint transaction confirmed:", mintReceipt.transactionHash);
  
        setCustom_TOKEN_ADDRESS(newTokenAddress);
        
        setDisplayText(`New token "${tokenName}" (${tokenSymbol}) created successfully at ${newTokenAddress}. Initial supply of ${initialSupply} tokens minted to your address.`);
      } catch (error) {
        console.error('Error creating or minting token', error);
        setDisplayText('Error creating or minting token. Check console for details.');
      }
    } else {
      setDisplayText('Please connect your wallet and verify your signature first.');
    }
  };
  
  // Add this useEffect to load the Solidity compiler
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://solc-bin.ethereum.org/bin/soljson-v0.8.20+commit.a1b79de6.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);
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
              <button onClick={() => createNewToken(tokenName, tokenSymbol, initialSupply)}>
                Create Token
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
