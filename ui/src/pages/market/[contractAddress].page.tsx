import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/Market.module.css';
import Header from '@/components/Header';
import { ethers } from 'ethers';

interface TokenData {
  name: string;
  symbol: string;
  totalSupply: string;
  price: string;
  marketCap: string;
  change24h: string;
}

const MarketPage: React.FC = () => {
  const router = useRouter();
  const { contractAddress } = router.query;
  const [ethAddress, setEthAddress] = useState('');
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [amount, setAmount] = useState('');

  // Example data for top holders
  const topHolders = [
    { address: '0xabc...def', percentage: '15.5%' },
    { address: '0x123...456', percentage: '12.3%' },
    { address: '0x789...012', percentage: '8.7%' },
    { address: '0xdef...abc', percentage: '6.2%' },
    { address: '0x345...678', percentage: '4.9%' },
  ];

  useEffect(() => {
    if (contractAddress) {
      fetchTokenData(contractAddress as string);
    }
  }, [contractAddress]);

  const fetchTokenData = async (address: string) => {
    // TODO: Implement actual API call to fetch token data
    setTokenData({
      name: "Sample Token",
      symbol: "SMPL",
      totalSupply: "1,000,000",
      price: "$1.00",
      marketCap: "$1,000,000",
      change24h: "+5%",
    });
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

  const handleBuy = () => {
    console.log('Buying:', amount);
    setShowBuyModal(false);
    setAmount('');
  };

  const handleSell = () => {
    console.log('Selling:', amount);
    setShowSellModal(false);
    setAmount('');
  };

  const openBuyModal = () => {
    setShowBuyModal(true);
  };

  const openSellModal = () => {
    setShowSellModal(true);
  };

  const handleProfileClick = () => {
    if (ethAddress) {
      router.push(`/${ethAddress}`);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Header ethAddress={ethAddress} connectWallet={connectWallet} />
      <main className={styles.main}>
        <div className={styles.contentContainer}>
          <section className={styles.chartSection}>
            <h2 className={styles.sectionTitle}>Price Chart</h2>
            <p className={styles.contractAddress}>Contract Address: {contractAddress}</p>
            <div className={styles.chart}>
              {/* Implement your chart component here */}
              <p>Chart placeholder</p>
            </div>
          </section>

          <section className={styles.tradingSection}>
            <h2 className={styles.sectionTitle}>Trade {tokenData?.symbol || 'Token'}</h2>
            {tokenData && (
              <div className={styles.tokenInfo}>
                <p>Current Price: {tokenData.price}</p>
                <p>24h Change: {tokenData.change24h}</p>
              </div>
            )}
            <div className={styles.tradeButtons}>
              <button onClick={openBuyModal}>Buy</button>
              <button onClick={openSellModal}>Sell</button>
            </div>

            <h3 className={styles.sectionTitle}>Top Holders</h3>
            <div className={styles.holdersTable}>
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Address</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {topHolders.map((holder, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{holder.address}</td>
                      <td>{holder.percentage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {showBuyModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>Buy Tokens</h2>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount to buy"
              />
              <button onClick={handleBuy}>Confirm Buy</button>
              <button onClick={() => setShowBuyModal(false)}>Cancel</button>
            </div>
          </div>
        )}

        {showSellModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h2 className={styles.modalTitle}>Sell Tokens</h2>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount to sell"
              />
              <button onClick={handleSell}>Confirm Sell</button>
              <button onClick={() => setShowSellModal(false)}>Cancel</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MarketPage;
