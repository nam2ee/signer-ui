import React, { useState } from 'react';
import styles from '../styles/Market.module.css';

const MarketPage: React.FC = () => {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [amount, setAmount] = useState('');

  const tokenAddress = '0x1234567890123456789012345678901234567890'; // Example address

  // Example data for top holders
  const topHolders = [
    { address: '0xabc...def', percentage: '15.5%' },
    { address: '0x123...456', percentage: '12.3%' },
    { address: '0x789...012', percentage: '8.7%' },
    { address: '0xdef...abc', percentage: '6.2%' },
    { address: '0x345...678', percentage: '4.9%' },
  ];

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
    console.log('Opening Buy Modal');
    setShowBuyModal(true);
  };

  const openSellModal = () => {
    console.log('Opening Sell Modal');
    setShowSellModal(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.chartSection}>
        
        <h2>Price Chart</h2>
        <div className={styles.tokenAddress}>
          <span>Token Address:</span>
          <span>{tokenAddress}</span>
        </div>
        <div className={styles.chart}>
          {/* Placeholder for chart */}
          Chart goes here
        </div>
        
      </div>
      <div className={styles.tradingSection}>
        <h2 className={styles.sectionTitle}>Trade Tokens</h2>
        <div className={styles.tokenInfo}>
          <p>Current Price: $1.00</p>
          <p>24h Change: +5%</p>
        </div>
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
    </div>
  );
};

export default MarketPage;
