import React, { useEffect, useState } from "react";
import axios from "axios";

const TrendingTickers = () => {
  const [tickers, setTickers] = useState([]);
  const [companyOutlook, setCompanyOutlook] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  
  const fetchTrendingTickers = async () => {
    try {
      const response = await axios.get("https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/get-trending-tickers", {
        headers: {
          "X-RapidAPI-Key": "e08062e87cmshe7acca229f4f105p1c36a8jsncd3e01357067",
          "X-RapidAPI-Host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
        },
      });
      setTickers(response.data.finance.result[0].quotes);
    } catch (error) {
      console.error("Error fetching trending tickers", error);
    }
  };

  const fetchCompanyOutlook = async (symbol) => {
    try {
      const response = await axios.get(`https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/get-company-outlook?symbol=${symbol}&region=US`, {
        headers: {
          "X-RapidAPI-Key": "e08062e87cmshe7acca229f4f105p1c36a8jsncd3e01357067",
          "X-RapidAPI-Host": "apidojo-yahoo-finance-v1.p.rapidapi.com",
        },
      });
      setCompanyOutlook(response.data.finance.result);
      setSelectedSymbol(symbol);
    } catch (error) {
      console.error("Error fetching company outlook", error);
    }
  };

  useEffect(() => {
    fetchTrendingTickers();
    const interval = setInterval(fetchTrendingTickers, 8 * 60 * 60 * 1000); // Refresh 3 times a day
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="tickers-container">
        <button onClick={() => fetchCompanyOutlook('NVDA')} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                View NVDA Outlook
              </button>
        {companyOutlook && selectedSymbol && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-100">
          <h3 className="text-xl font-bold mb-2">Company Outlook: {selectedSymbol}</h3>
          <p><strong>Innovation Performance:</strong> {companyOutlook.companyOutlookSummary?.innovationPerformance || "N/A"}</p>
          <p><strong>Innovation Score:</strong> {companyOutlook.companyOutlookSummary?.innovationScore || "N/A"}</p>
          <p><strong>Trend:</strong> {companyOutlook.companyOutlookSummary?.innovationTrend || "N/A"}</p>
          <h4 className="font-semibold mt-4">Significant Developments:</h4>
          <ul className="list-disc pl-5">
            {companyOutlook.significantDevelopments?.length > 0 ? (
              companyOutlook.significantDevelopments.map((dev, idx) => (
                <li key={idx}>{dev.date}: {dev.headline}</li>
              ))
            ) : (
              <li>No significant developments available.</li>
            )}
          </ul>
        </div>
      )}
      <h2 className="text-xl font-bold mb-4">Trending Tickers</h2>
      <div className="tickers">
        {tickers.map((ticker, index) => (
          <div key={index} className="ticker">
            <div className="p-4">
              <h3 className="font-semibold text-lg">{ticker.shortName || ticker.symbol}</h3>
              <p className="text-gray-600">{ticker.typeDisp}</p>
              <p className="text-blue-500 font-bold">${ticker.regularMarketPrice}</p>
              <p className={`text-sm ${ticker.regularMarketChange > 0 ? "text-green-500" : "text-red-500"}`}>
                {ticker.regularMarketChange.toFixed(2)} ({ticker.regularMarketChangePercent.toFixed(2)}%)
              </p>
              <button onClick={() => fetchCompanyOutlook(ticker.symbol)} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                View Company Outlook
              </button>
            </div>
          </div>
        ))}
      </div>


      
    </div>
  );
};

export default TrendingTickers;
