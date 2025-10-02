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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Countdown Timer */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 px-6 py-3 mb-6 shadow-sm">
          <div className="flex items-center justify-center gap-3 text-gray-800">
            <Clock size={20} className="text-orange-600" />
            <span className="text-base font-semibold">Shop Closes In:</span>
            <span className="text-xl font-mono font-bold text-orange-600">{timeRemaining}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <DollarSign className="text-green-600" size={32} />
            SoM Shop Budgeter
          </h1>
          
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="text-gray-700 text-sm mb-2 block font-medium">Your Shell Budget</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-white border border-gray-300 px-4 py-2 text-gray-900 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your shell budget"
              />
            </div>
            <div className="bg-blue-50 border border-blue-200 px-5 py-2">
              <div className="text-blue-700 text-xs font-medium uppercase tracking-wide">Items in Budget</div>
              <div className="text-gray-900 text-xl font-bold">{filteredItems.length}</div>
            </div>
            <div className="bg-red-50 border border-red-200 px-5 py-2">
              <div className="text-red-700 text-xs font-medium uppercase tracking-wide">Excluded</div>
              <div className="text-gray-900 text-xl font-bold">{excludedItems.size}</div>
            </div>
            <div className="bg-pink-50 border border-pink-200 px-5 py-2">
              <div className="text-pink-700 text-xs font-medium uppercase tracking-wide">Wishlist</div>
              <div className="text-gray-900 text-xl font-bold">{wishlistItems.size}</div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="mt-6">
            <label className="text-gray-700 text-sm mb-2 block font-medium">Filter by Categories:</label>
            <div className="flex flex-wrap gap-2">
              {allCategories.map(category => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                    selectedCategories.has(category)
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
              {selectedCategories.size > 0 && (
                <button
                  onClick={() => setSelectedCategories(new Set())}
                  className="px-3 py-1.5 text-xs font-medium bg-red-600 border border-red-600 text-white hover:bg-red-700"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {excludedItems.size > 0 && (
            <button
              onClick={() => setShowExcluded(!showExcluded)}
              className="mt-6 bg-orange-50 hover:bg-orange-100 px-4 py-2 border border-orange-200 text-orange-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Filter size={16} />
              {showExcluded ? 'Show Available Items' : 'Show Excluded Items'}
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-green-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
              🏆 Best Value Items
            </h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {getBestValue().map((item, idx) => (
                <div key={idx} className="bg-green-50 p-3 border-l-4 border-green-500">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 text-sm font-medium">{item.name}</span>
                    <span className="text-green-700 font-bold text-sm">{item.valueScore}%</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {item.shellCost} shells → ${item.retailPrice} retail
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-red-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
              ⚠️ Worst Value Items
            </h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {getWorstValue().map((item, idx) => (
                <div key={idx} className="bg-red-50 p-3 border-l-4 border-red-500">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 text-sm font-medium">{item.name}</span>
                    <span className="text-red-700 font-bold text-sm">{item.valueScore}%</span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {item.shellCost} shells → ${item.retailPrice} retail
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-pink-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-pink-700 mb-4 flex items-center gap-2">
              💖 Wishlist Recommendations
            </h2>
            <div className="mb-4">
              <label className="text-gray-700 text-xs mb-1 block font-medium">Optimize by:</label>
              <select
                value={recommendationMetric}
                onChange={(e) => setRecommendationMetric(e.target.value)}
                className="w-full bg-white border border-gray-300 px-3 py-1.5 text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="valueScore">Best Value %</option>
                <option value="shellCost">Lowest Cost</option>
                <option value="retailPrice">Highest Retail Value</option>
              </select>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {wishlistItems.size === 0 ? (
                <p className="text-gray-500 text-sm">Add items to wishlist to see recommendations</p>
              ) : (
                getWishlistRecommendations().map((item, idx) => (
                  <div key={idx} className="bg-pink-50 p-3 border-l-4 border-pink-500">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 text-sm font-medium">{item.name}</span>
                      <span className="text-pink-700 font-bold text-sm">{item.shellCost}🐚</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      Value: {item.valueScore}% | ${item.retailPrice}
                    </div>
                  </div>
                ))
              )}
              {wishlistItems.size > 0 && (
                <div className="mt-3 pt-3 border-t border-pink-200 text-xs text-gray-700 font-medium">
                  Total: {getWishlistRecommendations().reduce((sum, item) => sum + item.shellCost, 0)} shells
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-gray-700 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Actions</th>
                  <th className="px-4 py-3 text-left cursor-pointer hover:bg-gray-200 text-xs font-semibold uppercase tracking-wide" onClick={() => requestSort('name')}>
                    <div className="flex items-center gap-1">
                      Item Name <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Categories</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">Links</th>
                  <th className="px-4 py-3 text-right cursor-pointer hover:bg-gray-200 text-xs font-semibold uppercase tracking-wide" onClick={() => requestSort('shellCost')}>
                    <div className="flex items-center justify-end gap-1">
                      Shells <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right cursor-pointer hover:bg-gray-200 text-xs font-semibold uppercase tracking-wide" onClick={() => requestSort('retailPrice')}>
                    <div className="flex items-center justify-end gap-1">
                      Retail $ <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right cursor-pointer hover:bg-gray-200 text-xs font-semibold uppercase tracking-wide" onClick={() => requestSort('resalePrice')}>
                    <div className="flex items-center justify-end gap-1">
                      Resale $ <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right cursor-pointer hover:bg-gray-200 text-xs font-semibold uppercase tracking-wide" onClick={() => requestSort('shellToRetail')}>
                    <div className="flex items-center justify-end gap-1">
                      Shell:Retail <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right cursor-pointer hover:bg-gray-200 text-xs font-semibold uppercase tracking-wide" onClick={() => requestSort('valueScore')}>
                    <div className="flex items-center justify-end gap-1">
                      Value % <ArrowUpDown size={12} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-900">
                {sortedItems.map((item, idx) => (
                  <tr key={idx} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${excludedItems.has(item.name) ? 'opacity-40' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => toggleExclude(item.name)}
                          className={`p-1.5 transition-colors border ${
                            excludedItems.has(item.name)
                              ? 'bg-green-50 hover:bg-green-100 text-green-700 border-green-300'
                              : 'bg-red-50 hover:bg-red-100 text-red-700 border-red-300'
                          }`}
                          title={excludedItems.has(item.name) ? 'Include' : 'Exclude'}
                        >
                          <X size={14} />
                        </button>
                        <button
                          onClick={() => toggleWishlist(item.name)}
                          className={`p-1.5 transition-colors border ${
                            wishlistItems.has(item.name)
                              ? 'bg-pink-50 text-pink-700 border-pink-300'
                              : 'bg-gray-50 hover:bg-pink-50 text-gray-500 hover:text-pink-700 border-gray-300 hover:border-pink-300'
                          }`}
                          title={wishlistItems.has(item.name) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        >
                          <Heart size={14} fill={wishlistItems.has(item.name) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {item.categories?.map((cat, i) => (
                          <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 border border-blue-200">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {item.links?.amazon && (
                          <a href={item.links.amazon} target="_blank" rel="noopener noreferrer" 
                             className="text-orange-600 hover:text-orange-700" title="Amazon">
                            <ExternalLink size={14} />
                          </a>
                        )}
                        {item.links?.ebay && (
                          <a href={item.links.ebay} target="_blank" rel="noopener noreferrer" 
                             className="text-yellow-600 hover:text-yellow-700" title="eBay">
                            <ExternalLink size={14} />
                          </a>
                        )}
                        {item.links?.manufacturer && (
                          <a href={item.links.manufacturer} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:text-blue-700" title="Manufacturer">
                            <ExternalLink size={14} />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-blue-700 font-semibold">{item.shellCost}</td>
                    <td className="px-4 py-3 text-right text-gray-700">${item.retailPrice > 0 ? item.retailPrice.toFixed(2) : 'N/A'}</td>
                    <td className="px-4 py-3 text-right text-gray-700">${item.resalePrice > 0 ? item.resalePrice.toFixed(2) : 'N/A'}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs text-gray-600">{item.shellToRetail}</td>
                    <td className={`px-4 py-3 text-right font-bold ${
                      item.valueScore >= 50 ? 'text-green-600' : 
                      item.valueScore >= 30 ? 'text-yellow-600' : 
                      item.valueScore > 0 ? 'text-red-600' : 'text-gray-400'
                    }`}>
                      {item.valueScore > 0 ? `${item.valueScore}%` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-blue-800 mb-4">📊 How to Use This Tool</h3>
          <ul className="text-gray-700 space-y-2 text-sm leading-relaxed">
            <li><strong className="text-gray-900">Budget:</strong> Enter your shell count to filter items within your range</li>
            <li><strong className="text-gray-900">Exclude Items:</strong> Click the X button to exclude items you're not interested in</li>
            <li><strong className="text-gray-900">Wishlist:</strong> Click the ❤️ button to add items to your wishlist and get optimized recommendations</li>
            <li><strong className="text-gray-900">Categories:</strong> Filter items by category tags (hardware, games, tools, etc.)</li>
            <li><strong className="text-gray-900">Retail Links:</strong> Click link icons to view items on Amazon, eBay, or manufacturer sites</li>
            <li><strong className="text-gray-900">Shell:Retail Ratio:</strong> Lower is better - means fewer shells per dollar of retail value</li>
            <li><strong className="text-gray-900">Value %:</strong> Higher is better - shows retail value as % of shell cost</li>
            <li><strong className="text-gray-900">Color Coding:</strong> Green (50%+) = Great value | Yellow (30-49%) = Fair | Red (&lt;30%) = Poor value</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ShopAnalysis;
