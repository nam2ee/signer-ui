import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/Market.module.css';
import Header from '@/components/Header';
import { ethers } from 'ethers';
import { Pump_Z_Token_ABI, PUMP_Z_TOKEN_ADDRESS } from '@/constants/contracts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
  const [pumpZBalance, setPumpZBalance] = useState('0');
  const [approveAmount, setApproveAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');


  // Example data for top holders
  const topHolders = [
    { address: '0xabc...def', percentage: '15.5%' },
    { address: '0x123...456', percentage: '12.3%' },
    { address: '0x789...012', percentage: '8.7%' },
    { address: '0xdef...abc', percentage: '6.2%' },
    { address: '0x345...678', percentage: '4.9%' },
  ];

  const dummyChartData = [
    { name: 'Jan', price: 4000 },
    { name: 'Feb', price: 3000 },
    { name: 'Mar', price: 5000 },
    { name: 'Apr', price: 2780 },
    { name: 'May', price: 1890 },
    { name: 'Jun', price: 2390 },
    { name: 'Jul', price: 3490 },
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

  const handleBuy = async () => {
    if (!approveAmount) {
      alert("Please enter an amount to approve.");
      return;
    }

    try {
      console.log("Creating BrowserProvider");
      const provider = new ethers.BrowserProvider(window.ethereum);
      console.log("Provider created:", provider);

      console.log("provider: " + JSON.stringify(await provider.getNetwork()));

      const signer = await provider.getSigner();
      console.log("signer: " + JSON.stringify(signer));

      const Pump_Z_Token_Contract = new ethers.Contract(PUMP_Z_TOKEN_ADDRESS, Pump_Z_Token_ABI, signer);

      // Convert the approveAmount to wei
      const approveAmountWei = ethers.parseEther(approveAmount);

      const tx = await Pump_Z_Token_Contract.approve(PUMP_Z_TOKEN_ADDRESS, approveAmountWei);
      console.log("Transaction sent:", tx.hash);

      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log("Transaction confirmed:", receipt);

      console.log("Approve token purchase successful!");

      const buyTx = await Pump_Z_Token_Contract.buy({ value: approveAmountWei });
      console.log("Buy transaction sent:", buyTx.hash);
  
      // Wait for the Buy transaction to be mined
      const buyReceipt = await buyTx.wait();
      console.log("Buy transaction confirmed:", buyReceipt);

      setShowBuyModal(false);
      setApproveAmount('');
    } catch (error) {
      console.error("Error in handleBuy:", error);
      alert("Failed to approve tokens. Please check the console for more details.");
    }
  }

  const handleSell = async () => {
    if (!sellAmount) {
      alert("Please enter an amount to sell.");
      return;
    }
  
    try {
      console.log("Creating BrowserProvider");
      const provider = new ethers.BrowserProvider(window.ethereum);
      console.log("Provider created:", provider);
  
      console.log("provider: " + JSON.stringify(await provider.getNetwork()));
  
      const signer = await provider.getSigner();
      console.log("signer: " + JSON.stringify(signer));
  
      const Pump_Z_Token_Contract = new ethers.Contract(PUMP_Z_TOKEN_ADDRESS, Pump_Z_Token_ABI, signer);
  
      // Convert the sellAmount to wei
      const sellAmountWei = ethers.parseEther(sellAmount);
  
      // First, approve the contract to spend the tokens
      console.log("Approving tokens for sale...");
      const approveTx = await Pump_Z_Token_Contract.approve(PUMP_Z_TOKEN_ADDRESS, sellAmountWei);
      console.log("Approval transaction sent:", approveTx.hash);
  
      // Wait for the approval transaction to be mined
      const approveReceipt = await approveTx.wait();
      console.log("Approval transaction confirmed:", approveReceipt);
  
      // Now, call the sell function
      console.log("Selling tokens...");
      const sellTx = await Pump_Z_Token_Contract.sell(sellAmountWei);
      console.log("Sell transaction sent:", sellTx.hash);
  
      // Wait for the sell transaction to be mined
      const sellReceipt = await sellTx.wait();
      console.log("Sell transaction confirmed:", sellReceipt);
  
      console.log("Token sale successful!");
  
      setShowSellModal(false);
      setSellAmount('');
  
      // You might want to update the user's balance or other UI elements here
      // For example, you could call a function to refresh the user's balance:
      // await updateUserBalance();
  
    } catch (error) {
      console.error("Error in handleSell:", error);
      alert("Failed to sell tokens. Please check the console for more details.");
    }
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
      <Header ethAddress={ethAddress} connectWallet={connectWallet} pumpZBalance={pumpZBalance}
        buyPumpZToken={buyPumpZToken}/>
      <main className={styles.main}>
        <div className={styles.contentContainer}>
          <section className={styles.chartSection}>
            <h2 className={styles.sectionTitle}>Price Chart</h2>
            <p className={styles.contractAddress}>Contract Address: {contractAddress}</p>
            <div className={styles.chart}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dummyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="price" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
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
            <h2 className={styles.modalTitle}>Approve Tokens</h2>
            <input
              type="number"
              value={approveAmount}
              onChange={(e) => setApproveAmount(e.target.value)}
              placeholder="Amount to approve"
            />
            <button onClick={handleBuy}>Confirm Approve</button>
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
                value={sellAmount}
                onChange={(e) => setSellAmount(e.target.value)}
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
