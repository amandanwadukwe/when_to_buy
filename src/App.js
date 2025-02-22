import StockTradeCalculator from "./components/StockTradeCalculator";
import TrendingTickers from "./components/TrendingTickers";
import "./App.css";
function App() {
  return (
    <div className="App">
      <StockTradeCalculator />
      <TrendingTickers />
    </div>
  );
}

export default App;
