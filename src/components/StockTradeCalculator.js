import React, { useState, useEffect } from "react";
import axios from "axios";

const StockTradeCalculator = () => {
  // State for stock price and user input
  const [currentPrice, setCurrentPrice] = useState(null);
  const [referencePrice, setReferencePrice] = useState(150.00);
  const [tradeAmount, setTradeAmount] = useState(1000); // Default trade amount in £
  const [loading, setLoading] = useState(true);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [error, setError] = useState("");
  const [netTotal, setNetTotal] = useState(0); // Dynamic net total

  // API Keys
  const RAPIDAPI_KEY = "e08062e87cmshe7acca229f4f105p1c36a8jsncd3e01357067"; // Replace with your Yahoo Finance API Key
  const ALPHA_VANTAGE_KEY = "YOUR_ALPHA_VANTAGE_KEY"; // Replace with your Alpha Vantage API Key

  // Exchange rates and fees
  const fxSpotRate = 1.2332;
  const fxClientRate = 1.2388;
  const finraFeeRate = 0.000119; // 0.0119% of trade amount
  const secFeeRate = 0.000008; // 0.0008% of trade amount
  const fxFeePercentage = 0.0045; // 0.45% FX conversion fee

  // Fetch stock price from Yahoo Finance API
  const fetchYahooStockPrice = async () => {
    try {
      const now = Date.now();
      if (now - lastFetchTime < 60000) return; // Prevent excessive API calls

      const response = await axios.get(
        "https://yahoo-finance15.p.rapidapi.com/api/v1/markets/quote?ticker=NVDA&type=STOCKS",
        {
          headers: {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": "yahoo-finance15.p.rapidapi.com",
          },
        }
      );

      setCurrentPrice(parseFloat(response.data.body.primaryData.lastSalePrice.replace("$", "")));
      setLastFetchTime(now);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching stock price:", error);
      setError("Failed to fetch stock price.");
      setLoading(false);
    }
  };

   // Fetch stock price from Yahoo Finance API
   const fetchRecommendation = async () => {
    try {
      const now = Date.now();
      if (now - lastFetchTime < 60000) return; // Prevent excessive API calls

      const response = await axios.get(
        // "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-recommendations?symbol=NVDA",
        // "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v4/get-statistics?symbol=NVDA&region=US&lang=en-US",
        // "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v3/get-chart?interval=1mo&region=US&symbol=NVDA&range=5y&includePrePost=false&useYfid=true&includeAdjustedClose=true&events=capitalGain%2Cdiv%2Csplit",
        // "https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/get-trending-tickers?region=US",
        "https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/get-company-outlook?symbol=NVDA&region=US&lang=en-US",
        {
          headers: {
            "X-RapidAPI-Key": "e08062e87cmshe7acca229f4f105p1c36a8jsncd3e01357067",
            "X-RapidAPI-Host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
          },
        }
      );

      console.log(response.data)
    } catch (error) {
      console.error("Error fetching recommendation:", error);
      setError("Failed to fetch recommendation");
    }
  };

  fetchRecommendation();

  // Fetch stock price on component mount
  useEffect(() => {
    fetchYahooStockPrice();
    const interval = setInterval(fetchYahooStockPrice, 60000); // Fetch every 60s
    return () => clearInterval(interval);
  }, []);

  // Calculate number of shares based on trade amount
  const shares = currentPrice ? tradeAmount / currentPrice : 0;

  // Calculate profit/loss
  const calculatePnL = (direction) => {
    if (!currentPrice) return 0;
    const priceDifference =
      direction !== "sell" ? referencePrice - currentPrice : currentPrice - referencePrice;
    const profitLossUSD = priceDifference * shares;
    return profitLossUSD / fxClientRate;
  };

  // Calculate fees
  const calculateFees = (amount) => ({
    finraFee: amount * finraFeeRate,
    secFee: amount * secFeeRate,
    fxFee: amount * fxFeePercentage,
  });

  // Handle Sell and Buy Button Clicks
  const handleTrade = (direction) => {
    if (!currentPrice) return;

    // Calculate profit/loss
    const profitLossGBP = calculatePnL(direction);
    const newTradeAmount = tradeAmount + profitLossGBP;

    // Calculate fees based on new trade amount
    const fees = calculateFees(newTradeAmount);
    const totalFees = fees.finraFee + fees.secFee + fees.fxFee;

    // Calculate new net total
    const newNetTotal = newTradeAmount - totalFees;
    setNetTotal(newNetTotal);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>NVIDIA (NVDA) Stock Tracker</h2>

      {loading ? (
        <p>Loading stock price...</p>
      ) : error ? (
        <p style={styles.error}>{error}</p>
      ) : (
        <div style={styles.priceContainer}>
          <p style={styles.currentPrice}>Current Price: ${currentPrice.toFixed(2)}</p>
          <p style={styles.diff}>
            Difference from Reference Price (${referencePrice.toFixed(2)}):{" "}
            {(currentPrice - referencePrice).toFixed(2)} USD
          </p>
        </div>
      )}

      <div style={styles.inputContainer}>
        <label style={styles.label}>Enter Trade Amount (£):</label>
        <input
          type="number"
          value={tradeAmount}
          onChange={(e) => setTradeAmount(parseFloat(e.target.value) || 0)}
          style={styles.input}
        />
      </div>

      <div style={styles.buttonContainer}>
        <button style={styles.sellButton} onClick={() => handleTrade("sell")}>
          Sell: £{calculatePnL("sell").toFixed(2)}
        </button>

        <button style={styles.buyButton} onClick={() => handleTrade("buy")}>
          Buy: £{calculatePnL("buy").toFixed(2)}
        </button>
      </div>

      <div style={styles.feeBreakdown}>
        <h3>Fee Breakdown</h3>
        <p>Trade Amount: £{tradeAmount.toFixed(2)}</p>
        <p>FINRA Fee: £{(tradeAmount * finraFeeRate).toFixed(2)}</p>
        <p>SEC Fee: £{(tradeAmount * secFeeRate).toFixed(2)}</p>
        <p>FX Fee: £{(tradeAmount * fxFeePercentage).toFixed(2)}</p>
        <p>FX Spot Rate: 1£ = ${fxSpotRate}</p>
        <p>FX Client Rate: 1£ = ${fxClientRate}</p>
        <h3 style={styles.totalNet}>Total Net: £{netTotal.toFixed(2)}</h3>
      </div>
    </div>
  );
};

// Styles remain the same
const styles = {
  container: { textAlign: "center", maxWidth: "500px", margin: "20px auto", padding: "20px" },
  heading: { fontSize: "22px", fontWeight: "bold" },
  error: { color: "red" },
  sellButton: { backgroundColor: "#FF4D4D", padding: "10px", cursor: "pointer" },
  buyButton: { backgroundColor: "#4CAF50", padding: "10px", cursor: "pointer" },
  feeBreakdown: { textAlign: "left", marginTop: "20px", padding: "10px", backgroundColor: "#f8f8f8" },
  totalNet: { fontSize: "18px", fontWeight: "bold", color: "#333" },
};

export default StockTradeCalculator;
