import React from 'react';
import Link from 'next/link';
import styles from '../styles/Header.module.css';

interface HeaderProps {
  ethAddress: string;
  connectWallet: () => void;
  pumpZBalance: string;
  buyPumpZToken: () => void;
}

const Header: React.FC<HeaderProps> = ({ ethAddress, connectWallet, pumpZBalance, buyPumpZToken }) => {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <h1>Pump.Z</h1>
      </div>
      <nav className={styles.nav}>
        <Link href="/" className={styles.navLink}>Home</Link>

        <div className={styles.walletInfo}>
          {ethAddress ? (
            <>
              <span className={styles.pumpZBalance}>PumpZ: {pumpZBalance}</span>
              <button className={styles.buyPumpZButton} onClick={buyPumpZToken}>
                Buy PumpZ
              </button>
              <button className={styles.connectWalletButton}>
                {`${ethAddress.slice(0, 6)}...${ethAddress.slice(-4)}`}
              </button>
            </>
          ) : (
            <button className={styles.connectWalletButton} onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </div>
        {ethAddress && (
          <Link href={`/${ethAddress}`}>
            <button className={styles.profileButton}>
              View Profile
            </button>
          </Link>
        )}
      </nav>
    </header>
  );
};



export default Header;
