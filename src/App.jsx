import React, { useState, useMemo, useEffect } from 'react';
import { ArrowUpDown, DollarSign, X, Filter, Heart, Clock, ExternalLink } from 'lucide-react';
import itemsData from './items.json';

const ShopAnalysis = () => {
  const [sortConfig, setSortConfig] = useState({ key: 'shellCost', direction: 'asc' });
  const [budget, setBudget] = useState(1800);
  const [excludedItems, setExcludedItems] = useState(new Set());
  const [wishlistItems, setWishlistItems] = useState(new Set());
  const [showExcluded, setShowExcluded] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [recommendationMetric, setRecommendationMetric] = useState('valueScore');
  const [timeRemaining, setTimeRemaining] = useState('');

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('wishlistItems');
    if (saved) {
      setWishlistItems(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('wishlistItems', JSON.stringify([...wishlistItems]));
  }, [wishlistItems]);

  // Countdown timer to October 7th, 12am ET
  useEffect(() => {
    const updateTimer = () => {
      const targetDate = new Date('2025-10-07T00:00:00-04:00'); // ET timezone
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        setTimeRemaining('Shop Closed');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load items from JSON file
  const allItems = itemsData;

  // Get all unique categories
  const allCategories = useMemo(() => {
    const cats = new Set();
    allItems.forEach(item => {
      item.categories?.forEach(cat => cats.add(cat));
    });
    return Array.from(cats).sort();
  }, []);

  const calculateRatios = (item) => {
    const shellToRetail = item.retailPrice > 0 ? (item.shellCost / item.retailPrice).toFixed(2) : 'N/A';
    const shellToResale = item.resalePrice > 0 ? (item.shellCost / item.resalePrice).toFixed(2) : 'N/A';
    const valueScore = item.retailPrice > 0 ? ((item.retailPrice / item.shellCost) * 100).toFixed(0) : 0;
    return { ...item, shellToRetail, shellToResale, valueScore };
  };

  const processedItems = useMemo(() => {
    return allItems.map(calculateRatios);
  }, []);

  const filteredItems = useMemo(() => {
    return processedItems.filter(item => {
      const withinBudget = item.shellCost <= budget;
      const notExcluded = !excludedItems.has(item.name);
      const matchesCategory = selectedCategories.size === 0 || 
        item.categories?.some(cat => selectedCategories.has(cat));
      return withinBudget && notExcluded && matchesCategory;
    });
  }, [processedItems, budget, excludedItems, selectedCategories]);

  const sortedItems = useMemo(() => {
    let sortableItems = showExcluded 
      ? processedItems.filter(item => excludedItems.has(item.name))
      : filteredItems;
    
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aVal = parseFloat(a[sortConfig.key]) || a[sortConfig.key];
        const bVal = parseFloat(b[sortConfig.key]) || b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredItems, processedItems, sortConfig, showExcluded, excludedItems]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const toggleExclude = (itemName) => {
    const newExcluded = new Set(excludedItems);
    if (newExcluded.has(itemName)) {
      newExcluded.delete(itemName);
    } else {
      newExcluded.add(itemName);
    }
    setExcludedItems(newExcluded);
  };

  const toggleWishlist = (itemName) => {
    const newWishlist = new Set(wishlistItems);
    if (newWishlist.has(itemName)) {
      newWishlist.delete(itemName);
    } else {
      newWishlist.add(itemName);
    }
    setWishlistItems(newWishlist);
  };

  const toggleCategory = (category) => {
    const newCategories = new Set(selectedCategories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    setSelectedCategories(newCategories);
  };

  const getBestValue = () => {
    return filteredItems
      .filter(item => item.retailPrice > 0)
      .sort((a, b) => b.valueScore - a.valueScore)
      .slice(0, 8);
  };

  const getWorstValue = () => {
    return filteredItems
      .filter(item => item.retailPrice > 0)
      .sort((a, b) => a.valueScore - b.valueScore)
      .slice(0, 8);
  };

  // Wishlist recommendation algorithm
  const getWishlistRecommendations = () => {
    const wishlist = processedItems.filter(item => wishlistItems.has(item.name));
    
    if (wishlist.length === 0) return [];

    // Sort wishlist items by selected metric
    const sorted = [...wishlist].sort((a, b) => {
      if (recommendationMetric === 'valueScore') {
        return b.valueScore - a.valueScore;
      } else if (recommendationMetric === 'shellCost') {
        return a.shellCost - b.shellCost; // Ascending for cost
      } else if (recommendationMetric === 'retailPrice') {
        return b.retailPrice - a.retailPrice;
      }
      return 0;
    });

    // Greedy knapsack approach to fit items within budget
    let totalCost = 0;
    const recommendations = [];

    for (const item of sorted) {
      if (totalCost + item.shellCost <= budget) {
        recommendations.push(item);
        totalCost += item.shellCost;
      }
    }

    return recommendations;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Countdown Timer */}
        <div className="bg-gradient-to-r from-orange-600/80 to-red-600/80 backdrop-blur-sm border border-orange-500/30 px-6 py-3 mb-6 shadow-lg">
          <div className="flex items-center justify-center gap-3 text-white">
            <Clock size={20} />
            <span className="text-lg font-semibold">Shop Closes In:</span>
            <span className="text-2xl font-mono font-bold">{timeRemaining}</span>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
            <DollarSign className="text-green-400" />
            Hack Club Shop Analysis
          </h1>
          
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="text-gray-300 text-sm mb-2 block font-medium">Your Shell Budget</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-white/10 border border-white/20 px-4 py-2 text-white text-lg font-semibold focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                placeholder="Enter your shell budget"
              />
            </div>
            <div className="bg-blue-600/20 border border-blue-500/30 px-5 py-2">
              <div className="text-blue-200 text-xs font-medium uppercase tracking-wide">Items in Budget</div>
              <div className="text-white text-xl font-bold">{filteredItems.length}</div>
            </div>
            <div className="bg-red-600/20 border border-red-500/30 px-5 py-2">
              <div className="text-red-200 text-xs font-medium uppercase tracking-wide">Excluded</div>
              <div className="text-white text-xl font-bold">{excludedItems.size}</div>
            </div>
            <div className="bg-pink-600/20 border border-pink-500/30 px-5 py-2">
              <div className="text-pink-200 text-xs font-medium uppercase tracking-wide">Wishlist</div>
              <div className="text-white text-xl font-bold">{wishlistItems.size}</div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="mt-4">
            <label className="text-gray-300 text-sm mb-2 block font-medium">Filter by Categories:</label>
            <div className="flex flex-wrap gap-2">
              {allCategories.map(category => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-1 text-xs font-medium border transition-colors ${
                    selectedCategories.has(category)
                      ? 'bg-blue-600/40 border-blue-400/60 text-blue-100'
                      : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {category}
                </button>
              ))}
              {selectedCategories.size > 0 && (
                <button
                  onClick={() => setSelectedCategories(new Set())}
                  className="px-3 py-1 text-xs font-medium bg-red-600/40 border border-red-400/60 text-red-100 hover:bg-red-600/50"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {excludedItems.size > 0 && (
            <button
              onClick={() => setShowExcluded(!showExcluded)}
              className="mt-4 bg-orange-600/20 hover:bg-orange-600/30 px-4 py-2 border border-orange-500/40 text-orange-200 transition-colors flex items-center gap-2"
            >
              <Filter size={16} />
              {showExcluded ? 'Show Available Items' : 'Show Excluded Items'}
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-600/10 backdrop-blur-sm border border-green-500/20 p-5 shadow">
            <h2 className="text-xl font-bold text-green-300 mb-3">🏆 Best Value Items</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {getBestValue().map((item, idx) => (
                <div key={idx} className="bg-black/20 p-2 border-l-2 border-green-400/50">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm font-medium">{item.name}</span>
                    <span className="text-green-300 font-bold text-sm">{item.valueScore}%</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {item.shellCost} shells → ${item.retailPrice} retail
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-red-600/10 backdrop-blur-sm border border-red-500/20 p-5 shadow">
            <h2 className="text-xl font-bold text-red-300 mb-3">⚠️ Worst Value Items</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {getWorstValue().map((item, idx) => (
                <div key={idx} className="bg-black/20 p-2 border-l-2 border-red-400/50">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm font-medium">{item.name}</span>
                    <span className="text-red-300 font-bold text-sm">{item.valueScore}%</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {item.shellCost} shells → ${item.retailPrice} retail
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-pink-600/10 backdrop-blur-sm border border-pink-500/20 p-5 shadow">
            <h2 className="text-xl font-bold text-pink-300 mb-3">💖 Wishlist Recommendations</h2>
            <div className="mb-3">
              <label className="text-gray-300 text-xs mb-1 block">Optimize by:</label>
              <select
                value={recommendationMetric}
                onChange={(e) => setRecommendationMetric(e.target.value)}
                className="w-full bg-white/10 border border-white/20 px-2 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-pink-400"
              >
                <option value="valueScore">Best Value %</option>
                <option value="shellCost">Lowest Cost</option>
                <option value="retailPrice">Highest Retail Value</option>
              </select>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {wishlistItems.size === 0 ? (
                <p className="text-gray-400 text-xs">Add items to wishlist to see recommendations</p>
              ) : (
                getWishlistRecommendations().map((item, idx) => (
                  <div key={idx} className="bg-black/20 p-2 border-l-2 border-pink-400/50">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm font-medium">{item.name}</span>
                      <span className="text-pink-300 font-bold text-sm">{item.shellCost}🐚</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Value: {item.valueScore}% | ${item.retailPrice}
                    </div>
                  </div>
                ))
              )}
              {wishlistItems.size > 0 && (
                <div className="mt-2 pt-2 border-t border-pink-500/30 text-xs text-pink-200">
                  Total: {getWishlistRecommendations().reduce((sum, item) => sum + item.shellCost, 0)} shells
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-700/50 text-gray-200 border-b border-white/10">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide">Actions</th>
                  <th className="px-3 py-2 text-left cursor-pointer hover:bg-slate-600/50 text-xs font-semibold uppercase tracking-wide" onClick={() => requestSort('name')}>
                    <div className="flex items-center gap-1">
                      Item Name <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide">Categories</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide">Links</th>
                  <th className="px-3 py-2 text-right cursor-pointer hover:bg-slate-600/50 text-xs font-semibold uppercase tracking-wide" onClick={() => requestSort('shellCost')}>
                    <div className="flex items-center justify-end gap-1">
                      Shells <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="px-3 py-2 text-right cursor-pointer hover:bg-slate-600/50 text-xs font-semibold uppercase tracking-wide" onClick={() => requestSort('retailPrice')}>
                    <div className="flex items-center justify-end gap-1">
                      Retail $ <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="px-3 py-2 text-right cursor-pointer hover:bg-slate-600/50 text-xs font-semibold uppercase tracking-wide" onClick={() => requestSort('resalePrice')}>
                    <div className="flex items-center justify-end gap-1">
                      Resale $ <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="px-3 py-2 text-right cursor-pointer hover:bg-slate-600/50 text-xs font-semibold uppercase tracking-wide" onClick={() => requestSort('shellToRetail')}>
                    <div className="flex items-center justify-end gap-1">
                      Shell:Retail <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="px-3 py-2 text-right cursor-pointer hover:bg-slate-600/50 text-xs font-semibold uppercase tracking-wide" onClick={() => requestSort('valueScore')}>
                    <div className="flex items-center justify-end gap-1">
                      Value % <ArrowUpDown size={12} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-white">
                {sortedItems.map((item, idx) => (
                  <tr key={idx} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${excludedItems.has(item.name) ? 'opacity-40' : ''}`}>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        <button
                          onClick={() => toggleExclude(item.name)}
                          className={`p-1 transition-colors ${
                            excludedItems.has(item.name)
                              ? 'bg-green-600/30 hover:bg-green-600/40 text-green-300'
                              : 'bg-red-600/30 hover:bg-red-600/40 text-red-300'
                          }`}
                          title={excludedItems.has(item.name) ? 'Include' : 'Exclude'}
                        >
                          <X size={14} />
                        </button>
                        <button
                          onClick={() => toggleWishlist(item.name)}
                          className={`p-1 transition-colors ${
                            wishlistItems.has(item.name)
                              ? 'bg-pink-600/40 text-pink-300'
                              : 'bg-gray-600/30 hover:bg-pink-600/20 text-gray-400 hover:text-pink-300'
                          }`}
                          title={wishlistItems.has(item.name) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        >
                          <Heart size={14} fill={wishlistItems.has(item.name) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 font-medium">{item.name}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {item.categories?.map((cat, i) => (
                          <span key={i} className="text-xs bg-blue-600/20 text-blue-300 px-1 py-0.5 border border-blue-500/30">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1">
                        {item.links?.amazon && (
                          <a href={item.links.amazon} target="_blank" rel="noopener noreferrer" 
                             className="text-orange-400 hover:text-orange-300" title="Amazon">
                            <ExternalLink size={14} />
                          </a>
                        )}
                        {item.links?.ebay && (
                          <a href={item.links.ebay} target="_blank" rel="noopener noreferrer" 
                             className="text-yellow-400 hover:text-yellow-300" title="eBay">
                            <ExternalLink size={14} />
                          </a>
                        )}
                        {item.links?.manufacturer && (
                          <a href={item.links.manufacturer} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-400 hover:text-blue-300" title="Manufacturer">
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right text-blue-300 font-semibold">{item.shellCost}</td>
                    <td className="px-3 py-2 text-right">${item.retailPrice > 0 ? item.retailPrice.toFixed(2) : 'N/A'}</td>
                    <td className="px-3 py-2 text-right">${item.resalePrice > 0 ? item.resalePrice.toFixed(2) : 'N/A'}</td>
                    <td className="px-3 py-2 text-right font-mono text-xs">{item.shellToRetail}</td>
                    <td className={`px-3 py-2 text-right font-bold ${
                      item.valueScore >= 50 ? 'text-green-400' : 
                      item.valueScore >= 30 ? 'text-yellow-400' : 
                      item.valueScore > 0 ? 'text-red-400' : 'text-gray-500'
                    }`}>
                      {item.valueScore > 0 ? `${item.valueScore}%` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-blue-600/10 backdrop-blur-sm border border-blue-500/20 p-5 shadow">
          <h3 className="text-lg font-bold text-blue-300 mb-3">📊 How to Use This Tool</h3>
          <ul className="text-gray-300 space-y-1.5 text-sm">
            <li><strong>Budget:</strong> Enter your shell count to filter items within your range</li>
            <li><strong>Exclude Items:</strong> Click the X button to exclude items you're not interested in</li>
            <li><strong>Wishlist:</strong> Click the ❤️ button to add items to your wishlist and get optimized recommendations</li>
            <li><strong>Categories:</strong> Filter items by category tags (hardware, games, tools, etc.)</li>
            <li><strong>Retail Links:</strong> Click link icons to view items on Amazon, eBay, or manufacturer sites</li>
            <li><strong>Shell:Retail Ratio:</strong> Lower is better - means fewer shells per dollar of retail value</li>
            <li><strong>Value %:</strong> Higher is better - shows retail value as % of shell cost</li>
            <li><strong>Color Coding:</strong> Green (50%+) = Great value | Yellow (30-49%) = Fair | Red (&lt;30%) = Poor value</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ShopAnalysis;
