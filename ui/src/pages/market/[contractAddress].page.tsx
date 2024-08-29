import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../../styles/Market.module.css';
import Header from '@/components/Header';
import { ethers } from 'ethers';
import { Pump_Z_Token_ABI, PUMP_Z_TOKEN_ADDRESS } from '@/constants/contracts';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { io, Socket } from 'socket.io-client';
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
  const [socket, setSocket] = useState<Socket | null>(null);


  interface CandlestickSeriesProps {
    x: number;
    y: number | undefined;
    width: number;
    height: number | undefined;
    low: number;
    high: number;
    open: number;
    close: number;
  }

  interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: ChartDataPoint;
    }>;
  }

  interface ChartDataPoint {
    date: string;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
    ma?: number;  // Make ma optional since it's calculated later
  }
  // Example data for top holders
  const topHolders = [
    { address: '0xabc...def', percentage: '15.5%' },
    { address: '0x123...456', percentage: '12.3%' },
    { address: '0x789...012', percentage: '8.7%' },
    { address: '0xdef...abc', percentage: '6.2%' },
    { address: '0x345...678', percentage: '4.9%' },
  ];

  const dummyChartData = [
    { date: '2023-01-01', open: 50, close: 80, high: 90, low: 40, volume: 5000000, ma : 0},
    { date: '2023-01-02', open: 80, close: 70, high: 85, low: 65, volume: 4000000, ma : 0 },
    { date: '2023-01-03', open: 70, close: 90, high: 95, low: 68, volume: 6000000, ma : 0 },
    { date: '2023-01-04', open: 90, close: 85, high: 92, low: 80, volume: 3000000, ma : 0 },
    { date: '2023-01-05', open: 85, close: 100, high: 105, low: 82, volume: 7000000, ma : 0 },
    { date: '2023-01-06', open: 100, close: 95, high: 108, low: 92, volume: 5500000, ma : 0 },
    { date: '2023-01-07', open: 95, close: 110, high: 115, low: 94, volume: 8000000, ma : 0 },
    { date: '2023-01-01', open: 50, close: 80, high: 90, low: 40, volume: 5000000, ma : 0},
    { date: '2023-01-02', open: 80, close: 70, high: 85, low: 65, volume: 4000000, ma : 0 },
    { date: '2023-01-03', open: 70, close: 90, high: 95, low: 68, volume: 6000000, ma : 0 },
    { date: '2023-01-04', open: 90, close: 85, high: 92, low: 80, volume: 3000000, ma : 0 },
    { date: '2023-01-05', open: 85, close: 100, high: 105, low: 82, volume: 7000000, ma : 0 },
    { date: '2023-01-06', open: 100, close: 95, high: 108, low: 92, volume: 5500000, ma : 0 },
    { date: '2023-01-07', open: 95, close: 110, high: 115, low: 94, volume: 8000000, ma : 0 },
    { date: '2023-01-01', open: 50, close: 80, high: 90, low: 40, volume: 5000000, ma : 0},
    { date: '2023-01-02', open: 80, close: 70, high: 85, low: 65, volume: 4000000, ma : 0 },
    { date: '2023-01-03', open: 70, close: 90, high: 95, low: 68, volume: 6000000, ma : 0 },
    { date: '2023-01-04', open: 90, close: 85, high: 92, low: 80, volume: 3000000, ma : 0 },
    { date: '2023-01-05', open: 85, close: 100, high: 105, low: 82, volume: 7000000, ma : 0 },
    { date: '2023-01-06', open: 100, close: 95, high: 108, low: 92, volume: 5500000, ma : 0 },
    { date: '2023-01-07', open: 95, close: 110, high: 115, low: 94, volume: 8000000, ma : 0 },
    { date: '2023-01-06', open: 100, close: 95, high: 108, low: 92, volume: 5500000, ma : 0 },
    { date: '2023-01-07', open: 95, close: 110, high: 115, low: 94, volume: 8000000, ma : 0 },
    { date: '2023-01-01', open: 50, close: 80, high: 90, low: 40, volume: 5000000, ma : 0},
    { date: '2023-01-02', open: 80, close: 70, high: 85, low: 65, volume: 4000000, ma : 0 },
    { date: '2023-01-03', open: 70, close: 90, high: 95, low: 68, volume: 6000000, ma : 0 },
    { date: '2023-01-04', open: 90, close: 85, high: 92, low: 80, volume: 3000000, ma : 0 },
    { date: '2023-01-05', open: 85, close: 100, high: 105, low: 82, volume: 7000000, ma : 0 },
    { date: '2023-01-06', open: 100, close: 95, high: 108, low: 92, volume: 5500000, ma : 0 },
    { date: '2023-01-07', open: 95, close: 110, high: 115, low: 94, volume: 8000000, ma : 0 },
    { date: '2023-01-01', open: 50, close: 80, high: 90, low: 40, volume: 5000000, ma : 0},
    { date: '2023-01-02', open: 80, close: 70, high: 85, low: 65, volume: 4000000, ma : 0 },
    { date: '2023-01-03', open: 70, close: 90, high: 95, low: 68, volume: 6000000, ma : 0 },
    { date: '2023-01-04', open: 90, close: 85, high: 92, low: 80, volume: 3000000, ma : 0 },
    { date: '2023-01-05', open: 85, close: 100, high: 105, low: 82, volume: 7000000, ma : 0 },
    { date: '2023-01-06', open: 100, close: 95, high: 108, low: 92, volume: 5500000, ma : 0 },
    { date: '2023-01-07', open: 95, close: 110, high: 115, low: 94, volume: 8000000, ma : 0 },
    { date: '2023-01-06', open: 100, close: 95, high: 108, low: 92, volume: 5500000, ma : 0 },
    { date: '2023-01-07', open: 95, close: 110, high: 115, low: 94, volume: 8000000, ma : 0 },
    { date: '2023-01-01', open: 50, close: 80, high: 90, low: 40, volume: 5000000, ma : 0},
    { date: '2023-01-02', open: 80, close: 70, high: 85, low: 65, volume: 4000000, ma : 0 },
    { date: '2023-01-03', open: 70, close: 90, high: 95, low: 68, volume: 6000000, ma : 0 },
    { date: '2023-01-04', open: 90, close: 85, high: 92, low: 80, volume: 3000000, ma : 0 },
    { date: '2023-01-05', open: 85, close: 100, high: 105, low: 82, volume: 7000000, ma : 0 },
    { date: '2023-01-06', open: 100, close: 95, high: 108, low: 92, volume: 5500000, ma : 0 },
    { date: '2023-01-07', open: 95, close: 110, high: 115, low: 94, volume: 8000000, ma : 0 },
    { date: '2023-01-01', open: 50, close: 80, high: 90, low: 40, volume: 5000000, ma : 0},
    { date: '2023-01-02', open: 80, close: 70, high: 85, low: 65, volume: 4000000, ma : 0 },
    { date: '2023-01-03', open: 70, close: 90, high: 95, low: 68, volume: 6000000, ma : 0 },
    { date: '2023-01-04', open: 90, close: 85, high: 92, low: 80, volume: 3000000, ma : 0 },
    { date: '2023-01-05', open: 85, close: 100, high: 105, low: 82, volume: 7000000, ma : 0 },
    { date: '2023-01-06', open: 100, close: 95, high: 108, low: 92, volume: 5500000, ma : 0 },
    { date: '2023-01-07', open: 95, close: 110, high: 115, low: 94, volume: 8000000, ma : 0 },
  ];
  const movingAverageWindow = 3;
  dummyChartData.forEach((item, index, array) => {
    if (index >= movingAverageWindow - 1) {
      const sum = array.slice(index - movingAverageWindow + 1, index + 1).reduce((acc, curr) => acc + curr.close, 0);
      item.ma = sum / movingAverageWindow;
    }
  });

  useEffect(() => {
    if (contractAddress) {
      fetchTokenData(contractAddress as string);

      // WebSocket 연결 설정
      const newSocket = io('http://15.164.62.35:3001');

      newSocket.on('connect', () => {
        console.log('Connected to WebSocket server');
        // 연결이 성공하면 tokenAddress 전송
        newSocket.emit('subscribeToPrice', { tokenAddress: contractAddress });
      });

      newSocket.on('priceUpdate', (data) => {
        console.log('Price update received:', data);
        // 여기에서 필요한 상태 업데이트를 수행할 수 있습니다.
        // 예: setTokenData(prevData => ({ ...prevData, price: data.price }));
      });

      newSocket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Disconnected from WebSocket server:', reason);
      });

      setSocket(newSocket);

      // 컴포넌트 언마운트 시 소켓 연결 해제
      return () => {
        newSocket.disconnect();
      };
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

  const CandlestickSeries: React.FC<CandlestickSeriesProps> = ({ x, y, width, height, low, high, open, close }) => {
    if (y === undefined || height === undefined) return null;
    
    return (
      <g stroke={close >= open ? "#00C853" : "#FF5252"} fill={close >= open ? "#00C853" : "#FF5252"}>
        <line x1={x + width / 2} y1={y} x2={x + width / 2} y2={y + height} />
        <rect x={x} y={close >= open ? y : y + height} width={width} height={Math.abs(open - close)} />
        <line x1={x + width / 2} y1={Math.min(open, close)} x2={x + width / 2} y2={low} />
        <line x1={x + width / 2} y1={Math.max(open, close)} x2={x + width / 2} y2={high} />
      </g>
    );
  };
  
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={styles.customTooltip}>
          <p>Date: {data.date}</p>
          <p>Open: {data.open}</p>
          <p>Close: {data.close}</p>
          <p>High: {data.high}</p>
          <p>Low: {data.low}</p>
          <p>Volume: {data.volume.toLocaleString()}</p>
          {data.ma !== undefined && <p>MA: {data.ma.toFixed(2)}</p>}
        </div>
      );
    }
    return null;
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
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={dummyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="price" domain={['dataMin', 'dataMax']} />
                  <YAxis yAxisId="volume" orientation="right" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="volume" yAxisId="volume" fill="#8884d8" opacity={0.3} />
                  <Line type="monotone" dataKey="ma" stroke="#ff7300" dot={false} yAxisId="price" />
                  {dummyChartData.map((entry, index) => (
                    <CandlestickSeries
                      key={`candle-${index}`}
                      x={(index * 40) + 20}  // Adjust these values as needed for proper spacing
                      y={entry.low}
                      width={20}
                      height={entry.high - entry.low}
                      low={entry.low}
                      high={entry.high}
                      open={entry.open}
                      close={entry.close}
                    />
                  ))}
                </ComposedChart>
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
