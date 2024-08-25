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

  useEffect(() => {
    if (walletAddress && typeof walletAddress === 'string') {
      fetchProfileData(walletAddress);
    }
  }, [walletAddress]);

  const fetchProfileData = async (address: string) => {
    // TODO: Implement actual API calls to fetch data
    setBalance('1000 ETH');
    setCoinsHeld([
      { id: 1, name: 'PUMPZ', amount: '500', value: '$1000', contractAddress: '0x2itiSZ9eeUdh2FJF3PKq7dZVpkEH8bBC5xzxMDBhpump' },
      { id: 2, name: 'DOGE', amount: '1000', value: '$100', contractAddress: '0x1abcdef1234567890abcdef1234567890abcdef12' },
    ]);
    setCoinsCreated([
      { id: 1, name: 'MyCoin', symbol: 'MYC', totalSupply: '1000000', contractAddress: '0x3abcdef1234567890abcdef1234567890abcdef12' },
      { id: 2, name: 'AwesomeCoin', symbol: 'AWE', totalSupply: '500000', contractAddress: '0x4abcdef1234567890abcdef1234567890abcdef12' },
    ]);
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


  return (
    <div className={styles.pageContainer}>
      <Header ethAddress={walletAddress as string} connectWallet={connectWallet} />
    
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
