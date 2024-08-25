import React from 'react';
import Link from 'next/link';
import styles from '../styles/Header.module.css';

interface HeaderProps {
  ethAddress: string;
  connectWallet: () => void;
}

const Header: React.FC<HeaderProps> = ({ ethAddress, connectWallet }) => {
  return (
    <header className={styles.header}>
        <div className={styles.logo}>
          <h1>Pump.Z</h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/" className={styles.navLink}>Home</Link>
          <Link href="/about" className={styles.navLink}>About</Link>
          <Link href="/contact" className={styles.navLink}>Contact</Link>
          <button className={styles.connectWalletButton} onClick={connectWallet}>
            {ethAddress ? `${ethAddress.slice(0, 6)}...${ethAddress.slice(-4)}` : 'Connect Wallet'}
          </button>
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