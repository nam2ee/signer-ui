import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/Profile.module.css';
import Header from '@/components/Header';
import { ethers } from 'ethers';

interface Coin {
  id: number;
  name: string;
  amount?: string;
  value?: string;
  symbol?: string;
  totalSupply?: string;
  contractAddress: string;
}


const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { walletAddress } = router.query;
  const [balance, setBalance] = useState<string>('');
  const [coinsHeld, setCoinsHeld] = useState<any[]>([]);
  const [coinsCreated, setCoinsCreated] = useState<any[]>([]);
  const [ethAddress, setEthAddress] = useState('');
  const [pumpZBalance, setPumpZBalance] = useState('0');
  useEffect(() => {
    if (walletAddress && typeof walletAddress === 'string') {
      fetchProfileData(walletAddress);
    }
  }, [walletAddress]);

  const fetchProfileData = async (address: string) => {
    try {
      // Fetch tokens created by the address
      const response = await fetch('http://localhost:3001/pump/created', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({ creator: address }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch tokens created');
      }
  
      const data = await response.json();
  
      // Transform the data to match the expected format
      const transformedCoinsCreated = data.tokens.map((token: any, index: number) => ({
        id: index + 1,
        name: token.name,
        symbol: token.symbol,
        totalSupply: 'N/A', // The total supply is not provided by our current API
        contractAddress: token.tokenAddress,
      }));
  
      setCoinsCreated(transformedCoinsCreated);
  
      // TODO: Implement actual API calls to fetch balance and coins held
      setBalance('1000 ETH');
      setCoinsHeld([
        { id: 1, name: 'PUMPZ', amount: '500', value: '$1000', contractAddress: '0x2itiSZ9eeUdh2FJF3PKq7dZVpkEH8bBC5xzxMDBhpump' },
        { id: 2, name: 'DOGE', amount: '1000', value: '$100', contractAddress: '0x1abcdef1234567890abcdef1234567890abcdef12' },
      ]);
  
    } catch (error) {
      console.error('Error fetching profile data:', error);
      // Handle the error appropriately (e.g., show an error message to the user)
    }
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
    try {
      // Implement the logic to buy PumpZ tokens
      // This might involve calling a smart contract function
      // Update the balance after successful purchase
      // For example:
      // const result = await contractInstance.buyPumpZTokens(amount);
      // if (result.success) {
      //   const newBalance = await contractInstance.balanceOf(ethAddress);
      //   setPumpZBalance(newBalance.toString());
      // }
      console.log('Buying PumpZ tokens...');
    } catch (error) {
      console.error('Error buying PumpZ tokens:', error);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Header ethAddress={walletAddress as string} connectWallet={connectWallet} pumpZBalance={pumpZBalance}
        buyPumpZToken={buyPumpZToken}/>
    
      <main className={styles.main}>
        <section className={styles.profileHeader}>
          <h2>Profile</h2>
          <p className={styles.walletAddress}>{walletAddress}</p>
          <p className={styles.balance}>Balance: {balance}</p>
        </section>

        <div className={styles.profileContent}>
          <section className={styles.coinsSection}>
            <h3>Coins Held</h3>
            <table className={styles.coinsTable}>
              <thead>
                <tr>
                  <th>Coin</th>
                  <th>Amount</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {coinsHeld.map((coin) => (
                  <tr key={coin.id} className={styles.clickableRow}>
                    <td>
                      <Link href={`/market/${coin.contractAddress}`} className={styles.coinLink}>
                        {coin.name}
                      </Link>
                    </td>
                    <td>{coin.amount}</td>
                    <td>{coin.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className={styles.coinsSection}>
            <h3>Coins Created</h3>
            <table className={styles.coinsTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Symbol</th>
                  <th>Total Supply</th>
                </tr>
              </thead>
              <tbody>
                {coinsCreated.map((coin) => (
                  <tr key={coin.id} className={styles.clickableRow}>
                    <td>
                      <Link href={`/market/${coin.contractAddress}`} className={styles.coinLink}>
                        {coin.name}
                      </Link>
                    </td>
                    <td>{coin.symbol}</td>
                    <td>{coin.totalSupply}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
