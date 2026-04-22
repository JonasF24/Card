import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Search, Grid, List, Eye, EyeOff, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CardTrackerDashboard = () => {
  const [selectedMarket, setSelectedMarket] = useState('pokemon');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeframe, setTimeframe] = useState('30d');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Markets configuration
  const markets = {
    sports: [
      { id: 'mlb', name: 'MLB Baseball', icon: '⚾', color: '#EF4444', trend: 5.2 },
      { id: 'nba', name: 'NBA Basketball', icon: '🏀', color: '#3B82F6', trend: -2.1 },
      { id: 'nfl', name: 'NFL Football', icon: '🏈', color: '#1F2937', trend: 8.3 },
      { id: 'nhl', name: 'NHL Hockey', icon: '🏒', color: '#06B6D4', trend: 3.7 }
    ],
    tcg: [
      { id: 'pokemon', name: 'Pokémon', icon: '🟡', color: '#FBBF24', trend: 12.4 },
      { id: 'yugioh', name: 'Yu-Gi-Oh!', icon: '🔷', color: '#A78BFA', trend: -1.3 },
      { id: 'onepiece', name: 'One Piece', icon: '🔴', color: '#F87171', trend: 15.8 },
      { id: 'mtg', name: 'Magic: The Gathering', icon: '🎴', color: '#10B981', trend: 6.9 }
    ]
  };

  // Mock data for charts - simulates daily updates
  const generateChartData = (market) => {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const data = [];
    const basePrice = { pokemon: 450, yugioh: 320, onepiece: 280, mtg: 380, mlb: 520, nba: 480, nfl: 650, nhl: 410 };
    const base = basePrice[market] || 400;
    
    for (let i = -days; i <= 0; i++) {
      const volatility = Math.sin(i / 10) * 20 + (Math.random() - 0.5) * 40;
      data.push({
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: Math.round(base + volatility),
        volume: Math.floor(1200 + Math.random() * 2800),
        graded: Math.floor(300 + Math.random() * 800)
      });
    }
    return data;
  };

  // Mock portfolio data
  const portfolioData = [
    { market: 'pokemon', cards: 145, value: 68420, change: 12.4, topCard: 'Charizard PSA 9' },
    { market: 'mtg', cards: 89, value: 45230, change: 6.9, topCard: 'Black Lotus Alpha' },
    { market: 'nba', cards: 234, value: 52100, change: -2.1, topCard: 'LeBron Rookie RC' },
    { market: 'onepiece', cards: 67, value: 22340, change: 15.8, topCard: 'Luffy Boa SR' }
  ];

  const totalPortfolioValue = portfolioData.reduce((sum, item) => sum + item.value, 0);
  const portfolioChange = ((portfolioData.reduce((sum, item) => sum + (item.value * item.change / 100), 0)) / totalPortfolioValue * 100).toFixed(1);

  const marketData = selectedMarket.startsWith('mlb') || selectedMarket.startsWith('nba') || selectedMarket.startsWith('nfl') || selectedMarket.startsWith('nhl') 
    ? markets.sports.find(m => m.id === selectedMarket)
    : markets.tcg.find(m => m.id === selectedMarket);

  const chartData = generateChartData(selectedMarket);
  const marketMetrics = {
    avgPrice: Math.round(chartData.reduce((sum, d) => sum + d.price, 0) / chartData.length),
    highPrice: Math.max(...chartData.map(d => d.price)),
    lowPrice: Math.min(...chartData.map(d => d.price)),
    totalVolume: chartData.reduce((sum, d) => sum + d.volume, 0),
    gradedCards: chartData[chartData.length - 1].graded
  };

  // Market category breakdown
  const marketBreakdown = [
    { name: 'Sports Cards', value: 117000, pct: 45 },
    { name: 'Pokémon', value: 68420, pct: 26 },
    { name: 'MTG', value: 45230, pct: 17 },
    { name: 'Other TCG', value: 28640, pct: 12 }
  ];

  const colors = ['#EF4444', '#FBBF24', '#10B981', '#3B82F6'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src="cardcapital-icon.png"
                alt="Card Capital Icon"
                className="w-10 h-10 rounded-lg object-contain sm:hidden"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
              <img
                src="cardcapital-logo.png"
                alt="Card Capital - Trading Card Investing"
                className="hidden sm:block h-12 w-auto object-contain"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
              <div className="flex flex-col sm:hidden">
                <h1 className="text-2xl font-bold text-white leading-tight">Card Capital</h1>
                <span className="text-blue-300 text-xs font-semibold tracking-wide">Trading Card Investing</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <RefreshCw size={14} className="animate-spin" />
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search cards, sets, graders..."
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                <Grid size={18} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600 hover:border-blue-500/50 transition">
            <h3 className="text-slate-400 text-sm font-semibold mb-2">Total Portfolio Value</h3>
            <p className="text-4xl font-bold text-white mb-1">${(totalPortfolioValue / 1000).toFixed(0)}K</p>
            <p className={`text-sm font-semibold flex items-center gap-1 ${portfolioChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {portfolioChange > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {portfolioChange > 0 ? '+' : ''}{portfolioChange}% this month
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600">
            <h3 className="text-slate-400 text-sm font-semibold mb-2">Cards in Collection</h3>
            <p className="text-3xl font-bold text-white">{portfolioData.reduce((sum, item) => sum + item.cards, 0)}</p>
            <p className="text-xs text-slate-400 mt-1">across 4 markets</p>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 border border-slate-600">
            <h3 className="text-slate-400 text-sm font-semibold mb-2">Market Volatility</h3>
            <p className="text-3xl font-bold text-white">7.2%</p>
            <p className="text-xs text-slate-400 mt-1">30-day average</p>
          </div>
        </div>

        {/* Market Selection Tabs */}
        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            <span className="text-sm font-semibold text-slate-300">Sports Cards</span>
            <div className="flex gap-2 flex-wrap">
              {markets.sports.map(market => (
                <button
                  key={market.id}
                  onClick={() => setSelectedMarket(market.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    selectedMarket === market.id
                      ? `bg-${market.color} text-white`
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                  style={selectedMarket === market.id ? { backgroundColor: market.color } : {}}
                >
                  {market.icon} {market.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <span className="text-sm font-semibold text-slate-300">Trading Card Games</span>
            <div className="flex gap-2 flex-wrap">
              {markets.tcg.map(market => (
                <button
                  key={market.id}
                  onClick={() => setSelectedMarket(market.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    selectedMarket === market.id
                      ? `bg-${market.color} text-white`
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                  style={selectedMarket === market.id ? { backgroundColor: market.color } : {}}
                >
                  {market.icon} {market.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Market Detail View */}
        {marketData && (
          <div className="bg-slate-800 rounded-xl border border-slate-600 p-6 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{marketData.name} Market</h2>
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-slate-400">Avg Price: </span>
                    <span className="text-white font-semibold">${marketMetrics.avgPrice}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Range: </span>
                    <span className="text-white font-semibold">${marketMetrics.lowPrice} - ${marketMetrics.highPrice}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Graded Cards: </span>
                    <span className="text-white font-semibold">{marketMetrics.gradedCards.toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <div className={`flex items-center gap-1 text-xl font-bold ${marketData.trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {marketData.trend > 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                {marketData.trend > 0 ? '+' : ''}{marketData.trend}%
              </div>
            </div>

            {/* Timeframe Toggle */}
            <div className="flex gap-2 mb-6">
              {['7d', '30d', '90d'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    timeframe === tf
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {tf === '7d' ? '7 Days' : tf === '30d' ? '30 Days' : '90 Days'}
                </button>
              ))}
            </div>

            {/* Price Chart */}
            <div className="bg-slate-900 rounded-lg p-4 mb-6">
              <h3 className="text-white font-semibold mb-4">Price Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id={`gradient-${selectedMarket}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={marketData.color} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={marketData.color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="date" stroke="#94A3B8" style={{fontSize: '12px'}} />
                  <YAxis stroke="#94A3B8" style={{fontSize: '12px'}} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#1E293B', border: '1px solid #475569', borderRadius: '8px'}}
                    labelStyle={{color: '#E2E8F0'}}
                    formatter={(value) => `$${value}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke={marketData.color} 
                    strokeWidth={2}
                    fill={`url(#gradient-${selectedMarket})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Volume and Graded Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-4">Trading Volume</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94A3B8" style={{fontSize: '11px'}} />
                    <YAxis stroke="#94A3B8" style={{fontSize: '11px'}} />
                    <Tooltip 
                      contentStyle={{backgroundColor: '#1E293B', border: '1px solid #475569', borderRadius: '8px'}}
                      labelStyle={{color: '#E2E8F0'}}
                    />
                    <Bar dataKey="volume" fill={marketData.color} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-900 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-4">Graded Cards Listed</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94A3B8" style={{fontSize: '11px'}} />
                    <YAxis stroke="#94A3B8" style={{fontSize: '11px'}} />
                    <Tooltip 
                      contentStyle={{backgroundColor: '#1E293B', border: '1px solid #475569', borderRadius: '8px'}}
                      labelStyle={{color: '#E2E8F0'}}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="graded" 
                      stroke={marketData.color} 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Portfolio Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 rounded-xl border border-slate-600 p-6">
            <h3 className="text-lg font-bold text-white mb-6">Portfolio by Market</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={marketBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, pct}) => `${name} (${pct}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {colors.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{backgroundColor: '#1E293B', border: '1px solid #475569', borderRadius: '8px'}}
                  labelStyle={{color: '#E2E8F0'}}
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-600 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Holdings by Market</h3>
            <div className="space-y-3">
              {portfolioData.map((item, idx) => (
                <div key={idx} className="bg-slate-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-white font-semibold capitalize">{item.market}</p>
                      <p className="text-sm text-slate-400">{item.cards} cards</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">${item.value.toLocaleString()}</p>
                      <p className={`text-sm font-semibold ${item.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {item.change > 0 ? '+' : ''}{item.change}%
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">Top: {item.topCard}</p>
                  <div className="w-full bg-slate-600 rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
                      style={{width: `${(item.value / totalPortfolioValue) * 100}%`}}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Market Alerts */}
        <div className="bg-slate-800 rounded-xl border border-slate-600 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={20} className="text-amber-400" />
            <h3 className="text-lg font-bold text-white">Market Alerts & Insights</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-4">
              <p className="text-amber-200 text-sm font-semibold mb-1">⚡ High Volatility Detected</p>
              <p className="text-amber-100 text-xs">One Piece market showing 15.8% growth - monitor for pullback.</p>
            </div>
            <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4">
              <p className="text-green-200 text-sm font-semibold mb-1">✓ Strong Performer</p>
              <p className="text-green-100 text-xs">NFL Football cards trending +8.3% with stable graded volume.</p>
            </div>
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
              <p className="text-blue-200 text-sm font-semibold mb-1">ℹ Data Update</p>
              <p className="text-blue-100 text-xs">Daily feeds updated 15 min ago. Next update: 4:00 PM EST.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardTrackerDashboard;
