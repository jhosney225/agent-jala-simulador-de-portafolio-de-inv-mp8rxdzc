
```javascript
import Anthropic from "@anthropic-ai/sdk";
import * as readline from "readline";

const client = new Anthropic();

// Portfolio data structure
const portfolio = {
  stocks: {},
  bonds: {},
  cryptoassets: {},
  totalValue: 0,
};

// Helper function to create a simple text-based chart
function createChart(data, title, maxWidth = 50) {
  const maxValue = Math.max(...data.map((d) => d.value));
  let chart = `\n${title}\n${"=".repeat(title.length)}\n`;

  for (const item of data) {
    const barLength = Math.round((item.value / maxValue) * maxWidth);
    const bar = "█".repeat(barLength);
    const percentage = ((item.value / maxValue) * 100).toFixed(1);
    chart += `${item.name.padEnd(15)} ${bar} $${item.value.toFixed(2)} (${percentage}%)\n`;
  }

  return chart;
}

// Helper function to update portfolio value
function updatePortfolioValue() {
  let total = 0;

  for (const stock in portfolio.stocks) {
    total += portfolio.stocks[stock].quantity * portfolio.stocks[stock].price;
  }
  for (const bond in portfolio.bonds) {
    total += portfolio.bonds[bond].quantity * portfolio.bonds[bond].price;
  }
  for (const crypto in portfolio.cryptoassets) {
    total += portfolio.cryptoassets[crypto].quantity *
      portfolio.cryptoassets[crypto].price;
  }

  portfolio.totalValue = total;
}

// Get portfolio data for display
function getPortfolioData() {
  const data = {
    stocks: {},
    bonds: {},
    cryptoassets: {},
    allocation: [],
  };

  for (const stock in portfolio.stocks) {
    const value = portfolio.stocks[stock].quantity *
      portfolio.stocks[stock].price;
    data.stocks[stock] = {
      ...portfolio.stocks[stock],
      value: value,
    };
    data.allocation.push({ name: stock, value: value });
  }

  for (const bond in portfolio.bonds) {
    const value = portfolio.bonds[bond].quantity * portfolio.bonds[bond].price;
    data.bonds[bond] = {
      ...portfolio.bonds[bond],
      value: value,
    };
    data.allocation.push({ name: bond, value: value });
  }

  for (const crypto in portfolio.cryptoassets) {
    const value = portfolio.cryptoassets[crypto].quantity *
      portfolio.cryptoassets[crypto].price;
    data.cryptoassets[crypto] = {
      ...portfolio.cryptoassets[crypto],
      value: value,
    };
    data.allocation.push({ name: crypto, value: value });
  }

  return data;
}

// Process tool calls from Claude
function processToolCall(toolName, toolInput) {
  if (toolName === "add_investment") {
    const { type, symbol, quantity, price } = toolInput;
    if (type === "stock") {
      portfolio.stocks[symbol] = { quantity, price };
    } else if (type === "bond") {
      portfolio.bonds[symbol] = { quantity, price };
    } else if (type === "crypto") {
      portfolio.cryptoassets[symbol] = { quantity, price };
    }
    updatePortfolioValue();
    return `Added ${quantity} units of ${symbol} (${type}) at $${price}`;
  }

  if (toolName === "update_price") {
    const { type, symbol, newPrice } = toolInput;
    if (type === "stock" && portfolio.stocks[symbol]) {
      portfolio.stocks[symbol].price = newPrice;
    } else if (type === "bond" && portfolio.bonds[symbol]) {
      portfolio.bonds[symbol].price = newPrice;
    } else if (type === "crypto" && portfolio.cryptoassets[symbol]) {
      portfolio.cryptoassets[symbol].price = newPrice;
    }
    updatePortfolioValue();
    return `Updated price of ${symbol} to $${newPrice}`;
  }

  if (toolName === "get_portfolio_summary") {
    const data = getPortfolioData();
    let summary =
      `\nPortfolio Summary\n================\nTotal Value: $${portfolio.totalValue.toFixed(2)}\n\n`;

    if (Object.keys(data.stocks).length > 0) {
      summary += "STOCKS:\n";
      for (const stock in data.stocks) {
        summary += `  ${stock}: ${data.stocks[stock].quantity} @ $${data.stocks[stock].price.toFixed(2)} = $${data.stocks[stock].value.toFixed(2)}\n`;
      }
    }

    if (Object.keys(data.bonds).length > 0) {
      summary += "\nBONDS:\n";
      for (const bond in data.bonds) {
        summary += `  ${bond}: ${data.bonds[bond].quantity} @ $${data.bonds[bond].price.toFixed(2)} = $${data.bonds[bond].value.toFixed(2)}\n`;
      }
    }

    if (Object.keys(data.cryptoassets).length > 0) {
      summary += "\nCRYPTOASSETS:\n";
      for (const crypto in data.cryptoassets) {
        summary += `  ${crypto}: ${data.cryptoassets[crypto].quantity} @ $${data.cryptoassets[crypto].price.toFixed(2)} = $${data.cryptoassets[crypto].value.toFixed(2)}\n`;
      }
    }

    if (data.allocation.length > 0) {
      summary += createChart(data.allocation, "Portfolio Allocation", 30);
    }

    return summary;
  }

  if (toolName === "calculate_metrics") {
    const