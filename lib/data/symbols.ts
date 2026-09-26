export interface SymbolSuggestion {
  symbol: string;
  name: string;
  exchange: "NSE" | "BSE";
}

export const stockSuggestions: SymbolSuggestion[] = [
  { symbol: "RELIANCE.NS", name: "Reliance Industries", exchange: "NSE" },
  { symbol: "TCS.NS", name: "Tata Consultancy Services", exchange: "NSE" },
  { symbol: "INFY.NS", name: "Infosys", exchange: "NSE" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank", exchange: "NSE" },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank", exchange: "NSE" },
  { symbol: "SBIN.NS", name: "State Bank of India", exchange: "NSE" },
  { symbol: "LT.NS", name: "Larsen & Toubro", exchange: "NSE" },
  { symbol: "TATASTEEL.NS", name: "Tata Steel", exchange: "NSE" },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors", exchange: "NSE" },
  { symbol: "TATAPOWER.NS", name: "Tata Power", exchange: "NSE" },
  { symbol: "TITAN.NS", name: "Titan Company", exchange: "NSE" },
  { symbol: "ITC.NS", name: "ITC", exchange: "NSE" },
  { symbol: "HINDUNILVR.NS", name: "Hindustan Unilever", exchange: "NSE" },
  { symbol: "BHARTIARTL.NS", name: "Bharti Airtel", exchange: "NSE" },
  { symbol: "AXISBANK.NS", name: "Axis Bank", exchange: "NSE" },
  { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank", exchange: "NSE" },
  { symbol: "BAJFINANCE.NS", name: "Bajaj Finance", exchange: "NSE" },
  { symbol: "MARUTI.NS", name: "Maruti Suzuki", exchange: "NSE" },
  { symbol: "M&M.NS", name: "Mahindra & Mahindra", exchange: "NSE" },
  { symbol: "SUNPHARMA.NS", name: "Sun Pharma", exchange: "NSE" },
  { symbol: "CIPLA.NS", name: "Cipla", exchange: "NSE" },
  { symbol: "ADANIENT.NS", name: "Adani Enterprises", exchange: "NSE" },
  { symbol: "ADANIPORTS.NS", name: "Adani Ports", exchange: "NSE" },
  { symbol: "WIPRO.NS", name: "Wipro", exchange: "NSE" },
  { symbol: "HCLTECH.NS", name: "HCL Technologies", exchange: "NSE" },
  { symbol: "ULTRACEMCO.NS", name: "UltraTech Cement", exchange: "NSE" },
  { symbol: "ASIANPAINT.NS", name: "Asian Paints", exchange: "NSE" },
  { symbol: "NESTLEIND.NS", name: "Nestle India", exchange: "NSE" },
  { symbol: "POWERGRID.NS", name: "Power Grid", exchange: "NSE" },
  { symbol: "NTPC.NS", name: "NTPC", exchange: "NSE" },
  { symbol: "ONGC.NS", name: "ONGC", exchange: "NSE" },
  { symbol: "COALINDIA.NS", name: "Coal India", exchange: "NSE" },
  { symbol: "JSWSTEEL.NS", name: "JSW Steel", exchange: "NSE" },
  { symbol: "HINDALCO.NS", name: "Hindalco", exchange: "NSE" },
  { symbol: "GRASIM.NS", name: "Grasim Industries", exchange: "NSE" },
  { symbol: "TECHM.NS", name: "Tech Mahindra", exchange: "NSE" },
];
