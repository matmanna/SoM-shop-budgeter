import React, { useState, useMemo } from 'react';
import { ArrowUpDown, DollarSign, X, Filter } from 'lucide-react';

const ShopAnalysis = () => {
  const [sortConfig, setSortConfig] = useState({ key: 'shellCost', direction: 'asc' });
  const [budget, setBudget] = useState(1800);
  const [excludedItems, setExcludedItems] = useState(new Set());
  const [showExcluded, setShowExcluded] = useState(false);

  // Complete data for ALL items from the store
  const allItems = [
    // Trivial items (stickers, etc.)
    { name: 'Pile of Stickers', shellCost: 23, retailPrice: 5, resalePrice: 1, category: 'trivial' },
    { name: '64GB USB Drive', shellCost: 35, retailPrice: 8, resalePrice: 5, category: 'trivial' },
    { name: 'Rubber duck', shellCost: 75, retailPrice: 10, resalePrice: 5, category: 'trivial' },
    { name: '128GB USB Drive', shellCost: 65, retailPrice: 12, resalePrice: 8, category: 'trivial' },
    { name: '256GB USB Drive', shellCost: 125, retailPrice: 25, resalePrice: 18, category: 'trivial' },
    { name: 'GitHub Branded Notebook', shellCost: 200, retailPrice: 15, resalePrice: 5, category: 'trivial' },
    { name: '256GB microSD + adapter', shellCost: 110, retailPrice: 20, resalePrice: 15, category: 'trivial' },
    { name: '512GB microSD card', shellCost: 200, retailPrice: 40, resalePrice: 30, category: 'trivial' },
    
    // Digital/Credits
    { name: 'AI Usage Credits', shellCost: 35, retailPrice: 10, resalePrice: 10, category: 'credits' },
    { name: 'Cloudflare credits', shellCost: 35, retailPrice: 10, resalePrice: 10, category: 'credits' },
    { name: 'JLCPCB Grant', shellCost: 35, retailPrice: 10, resalePrice: 10, category: 'credits' },
    { name: 'Domain grant', shellCost: 40, retailPrice: 10, resalePrice: 10, category: 'credits' },
    { name: 'Nebula.tv 1 Month', shellCost: 40, retailPrice: 5, resalePrice: 5, category: 'subscription' },
    { name: 'iFixit Credits', shellCost: 47, retailPrice: 15, resalePrice: 15, category: 'credits' },
    { name: 'Server hosting credits', shellCost: 50, retailPrice: 15, resalePrice: 15, category: 'credits' },
    { name: '10$ to Signal', shellCost: 50, retailPrice: 10, resalePrice: 10, category: 'credits' },
    { name: 'Purelymail credits', shellCost: 60, retailPrice: 10, resalePrice: 10, category: 'credits' },
    { name: 'Bambu Lab Credits', shellCost: 85, retailPrice: 25, resalePrice: 25, category: 'credits' },
    { name: 'DigiKey/LCSC Credit', shellCost: 85, retailPrice: 25, resalePrice: 25, category: 'credits' },
    { name: '$20 Framework Credit', shellCost: 103, retailPrice: 20, resalePrice: 20, category: 'credits' },
    { name: 'dbrand credits', shellCost: 125, retailPrice: 35, resalePrice: 35, category: 'credits' },
    { name: '$25 IKEA Credit', shellCost: 170, retailPrice: 25, resalePrice: 25, category: 'credits' },
    { name: 'Keychron Credits', shellCost: 225, retailPrice: 65, resalePrice: 65, category: 'credits' },
    { name: '$500 Amp Credit', shellCost: 1750, retailPrice: 500, resalePrice: 500, category: 'credits' },
    
    // Games
    { name: 'TIS-100', shellCost: 32, retailPrice: 6.99, resalePrice: 3.50, category: 'games' },
    { name: 'Geometry Dash', shellCost: 33, retailPrice: 3.99, resalePrice: 2.00, category: 'games' },
    { name: 'shapez 2', shellCost: 137, retailPrice: 14.99, resalePrice: 8, category: 'games' },
    { name: 'Factorio', shellCost: 175, retailPrice: 35, resalePrice: 20, category: 'games' },
    
    // Hardware/Electronics
    { name: 'Logic Analyzer', shellCost: 50, retailPrice: 15, resalePrice: 8, category: 'hardware' },
    { name: 'Hot Glue Gun', shellCost: 66, retailPrice: 12, resalePrice: 5, category: 'hardware' },
    { name: 'Orpheus Pico', shellCost: 75, retailPrice: 8, resalePrice: 5, category: 'hardware' },
    { name: 'E-Fidget', shellCost: 79, retailPrice: 20, resalePrice: 12, category: 'hardware' },
    { name: 'Allen Wrench', shellCost: 92, retailPrice: 8, resalePrice: 4, category: 'hardware' },
    { name: 'CH341A Programmer', shellCost: 97, retailPrice: 15, resalePrice: 8, category: 'hardware' },
    { name: 'SMD Hotplate', shellCost: 99, retailPrice: 35, resalePrice: 20, category: 'hardware' },
    { name: 'Raspberry Pi Zero 2 W', shellCost: 100, retailPrice: 15, resalePrice: 12, category: 'hardware' },
    { name: 'Digital Calipers', shellCost: 102, retailPrice: 20, resalePrice: 12, category: 'hardware' },
    { name: 'Yubikey USB-C', shellCost: 110, retailPrice: 55, resalePrice: 35, category: 'hardware' },
    { name: 'ESP32 Kit', shellCost: 125, retailPrice: 30, resalePrice: 18, category: 'hardware' },
    { name: 'Proxmark 3 Easy', shellCost: 140, retailPrice: 70, resalePrice: 50, category: 'hardware' },
    { name: 'Pinecil', shellCost: 144, retailPrice: 26, resalePrice: 18, category: 'hardware' },
    { name: 'USB C Cable + Adapter', shellCost: 145, retailPrice: 15, resalePrice: 8, category: 'hardware' },
    { name: 'HackDucky', shellCost: 150, retailPrice: 50, resalePrice: 30, category: 'hardware' },
    { name: 'Brother Label Maker', shellCost: 180, retailPrice: 40, resalePrice: 25, category: 'hardware' },
    { name: 'Dupont Crimping Tool', shellCost: 237, retailPrice: 35, resalePrice: 20, category: 'hardware' },
    { name: 'GL.iNet Router', shellCost: 250, retailPrice: 40, resalePrice: 25, category: 'hardware' },
    { name: 'Icepi Zero', shellCost: 294, retailPrice: 45, resalePrice: 30, category: 'hardware' },
    { name: 'Yubikey USB-A', shellCost: 300, retailPrice: 50, resalePrice: 32, category: 'hardware' },
    { name: 'Baofeng UV-5R (2pk)', shellCost: 323, retailPrice: 50, resalePrice: 30, category: 'hardware' },
    { name: 'CMF Buds Pro 2', shellCost: 360, retailPrice: 59, resalePrice: 40, category: 'hardware' },
    { name: 'Creality Filament Dryer', shellCost: 400, retailPrice: 60, resalePrice: 35, category: 'hardware' },
    { name: '7.5" E-Ink Display', shellCost: 427, retailPrice: 75, resalePrice: 45, category: 'hardware' },
    { name: 'LTT Screwdriver', shellCost: 450, retailPrice: 70, resalePrice: 55, category: 'hardware' },
    { name: 'Raspberry Pi 500', shellCost: 450, retailPrice: 90, resalePrice: 75, category: 'hardware' },
    { name: 'min(amame) Parts Kit', shellCost: 460, retailPrice: 80, resalePrice: 50, category: 'hardware' },
    { name: 'Seagate 2TB HDD', shellCost: 542, retailPrice: 60, resalePrice: 40, category: 'hardware' },
    { name: 'Logitech MX Master 3S', shellCost: 570, retailPrice: 100, resalePrice: 70, category: 'hardware' },
    { name: '1TB Portable SSD', shellCost: 599, retailPrice: 80, resalePrice: 55, category: 'hardware' },
    { name: 'Thermal Imager', shellCost: 630, retailPrice: 150, resalePrice: 100, category: 'hardware' },
    { name: 'Raspberry Pi 5', shellCost: 632, retailPrice: 80, resalePrice: 65, category: 'hardware' },
    { name: 'K4 Laser Engraver', shellCost: 690, retailPrice: 200, resalePrice: 130, category: 'hardware' },
    { name: 'Polaroid Go Gen 2', shellCost: 720, retailPrice: 100, resalePrice: 70, category: 'hardware' },
    { name: 'Logi G Pro X SL', shellCost: 750, retailPrice: 130, resalePrice: 90, category: 'hardware' },
    { name: 'Glasgow Interface', shellCost: 762, retailPrice: 120, resalePrice: 90, category: 'hardware' },
    { name: 'XPPen Deco Pro MW', shellCost: 770, retailPrice: 130, resalePrice: 85, category: 'hardware' },
    { name: 'head(amame) Parts', shellCost: 775, retailPrice: 120, resalePrice: 75, category: 'hardware' },
    { name: 'SlimeVR DIY Kit', shellCost: 899, retailPrice: 250, resalePrice: 175, category: 'hardware' },
    { name: 'Raspberry Pi 500+', shellCost: 945, retailPrice: 120, resalePrice: 95, category: 'hardware' },
    { name: 'Flipper Zero', shellCost: 950, retailPrice: 169, resalePrice: 140, category: 'hardware' },
    { name: 'Bose QC 45', shellCost: 1020, retailPrice: 329, resalePrice: 200, category: 'hardware' },
    { name: 'Cricut Explore 3', shellCost: 1135, retailPrice: 250, resalePrice: 160, category: 'hardware' },
    { name: 'Bambu A1 Mini', shellCost: 1150, retailPrice: 199, resalePrice: 160, category: 'hardware' },
    { name: 'Playdate', shellCost: 1390, retailPrice: 199, resalePrice: 150, category: 'hardware' },
    { name: '100MHz Oscilloscope', shellCost: 1632, retailPrice: 400, resalePrice: 280, category: 'hardware' },
    { name: 'Bambu A1', shellCost: 1775, retailPrice: 329, resalePrice: 270, category: 'hardware' },
    
    // Subscriptions/Services
    { name: 'Mullvad VPN 6mo', shellCost: 216, retailPrice: 30, resalePrice: 25, category: 'subscription' },
    { name: 'Clip Studio Paint PRO', shellCost: 255, retailPrice: 50, resalePrice: 35, category: 'subscription' },
    { name: 'TryHackMe Premium 1y', shellCost: 413, retailPrice: 80, resalePrice: 60, category: 'subscription' },
    { name: 'Nebula.tv Lifetime', shellCost: 1800, retailPrice: 300, resalePrice: 200, category: 'subscription' },
    
    // Toys/Misc
    { name: 'Speedcube', shellCost: 182, retailPrice: 20, resalePrice: 12, category: 'misc' },
    { name: 'Smolhaj', shellCost: 136, retailPrice: 25, resalePrice: 20, category: 'misc' },
    { name: 'Squishmallow', shellCost: 220, retailPrice: 25, resalePrice: 15, category: 'misc' },
    
    // High-end items
    { name: 'iPad + Apple Pencil', shellCost: 2035, retailPrice: 450, resalePrice: 350, category: 'high-end' },
    { name: 'Nintendo Switch 2', shellCost: 2587, retailPrice: 400, resalePrice: 350, category: 'high-end' },
    { name: 'reMarkable 2', shellCost: 2625, retailPrice: 399, resalePrice: 300, category: 'high-end' },
    { name: 'M4 Mac Mini', shellCost: 4050, retailPrice: 599, resalePrice: 500, category: 'high-end' },
    { name: 'DJI Mini 4 Pro', shellCost: 4370, retailPrice: 759, resalePrice: 600, category: 'high-end' },
    { name: 'Framework Laptop 12', shellCost: 4499, retailPrice: 1049, resalePrice: 850, category: 'high-end' },
    { name: 'Prusa Core One', shellCost: 4500, retailPrice: 1199, resalePrice: 950, category: 'high-end' },
    { name: '13" M4 MacBook Air', shellCost: 4512, retailPrice: 1099, resalePrice: 900, category: 'high-end' },
    { name: 'Prusa MK4S', shellCost: 5500, retailPrice: 1099, resalePrice: 900, category: 'high-end' },
    { name: 'MacBook Pro M4', shellCost: 7196, retailPrice: 1999, resalePrice: 1650, category: 'high-end' },
    
    // Badges (digital items)
    { name: 'Spider Badge', shellCost: 5, retailPrice: 0, resalePrice: 0, category: 'badge' },
    { name: 'Custom CSS Badge', shellCost: 10, retailPrice: 0, resalePrice: 0, category: 'badge' },
    { name: 'Summer of Making Blue', shellCost: 40, retailPrice: 0, resalePrice: 0, category: 'badge' },
    { name: 'Sunglasses Badge', shellCost: 100, retailPrice: 0, resalePrice: 0, category: 'badge' },
    { name: 'Pocket Watcher Badge', shellCost: 100, retailPrice: 0, resalePrice: 0, category: 'badge' },
    { name: 'Offshore Bank Account', shellCost: 150, retailPrice: 0, resalePrice: 0, category: 'badge' },
    { name: 'Gold Verified', shellCost: 160, retailPrice: 0, resalePrice: 0, category: 'badge' },
    { name: 'I am Rich Badge', shellCost: 1000, retailPrice: 0, resalePrice: 0, category: 'badge' },
  ];

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
    return processedItems.filter(item => 
      item.shellCost <= budget && !excludedItems.has(item.name)
    );
  }, [processedItems, budget, excludedItems]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 mb-8 border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
            <DollarSign className="text-green-400" />
            Hack Club Shop Analysis
          </h1>
          
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-purple-200 text-sm mb-2 block">Your Shell Budget</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-3 text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Enter your shell budget"
              />
            </div>
            <div className="bg-purple-500/30 rounded-lg px-6 py-3 border border-purple-400/40">
              <div className="text-purple-200 text-sm">Items in Budget</div>
              <div className="text-white text-2xl font-bold">{filteredItems.length}</div>
            </div>
            <div className="bg-red-500/30 rounded-lg px-6 py-3 border border-red-400/40">
              <div className="text-red-200 text-sm">Excluded</div>
              <div className="text-white text-2xl font-bold">{excludedItems.size}</div>
            </div>
          </div>

          {excludedItems.size > 0 && (
            <button
              onClick={() => setShowExcluded(!showExcluded)}
              className="mt-4 bg-orange-500/30 hover:bg-orange-500/40 px-4 py-2 rounded-lg text-orange-200 border border-orange-400/40 transition-colors flex items-center gap-2"
            >
              <Filter size={16} />
              {showExcluded ? 'Show Available Items' : 'Show Excluded Items'}
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-lg rounded-xl p-6 border border-green-400/30">
            <h2 className="text-2xl font-bold text-green-300 mb-4">🏆 Best Value Items</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {getBestValue().map((item, idx) => (
                <div key={idx} className="bg-black/30 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">{item.name}</span>
                    <span className="text-green-300 font-bold">{item.valueScore}%</span>
                  </div>
                  <div className="text-sm text-gray-300">
                    {item.shellCost} shells → ${item.retailPrice} retail
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-lg rounded-xl p-6 border border-red-400/30">
            <h2 className="text-2xl font-bold text-red-300 mb-4">⚠️ Worst Value Items</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {getWorstValue().map((item, idx) => (
                <div key={idx} className="bg-black/30 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-medium">{item.name}</span>
                    <span className="text-red-300 font-bold">{item.valueScore}%</span>
                  </div>
                  <div className="text-sm text-gray-300">
                    {item.shellCost} shells → ${item.retailPrice} retail
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-purple-600/30 text-purple-100">
                <tr>
                  <th className="px-4 py-3 text-left">Action</th>
                  <th className="px-4 py-3 text-left cursor-pointer hover:bg-purple-600/40" onClick={() => requestSort('name')}>
                    <div className="flex items-center gap-2">
                      Item Name <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left cursor-pointer hover:bg-purple-600/40" onClick={() => requestSort('category')}>
                    <div className="flex items-center gap-2">
                      Category <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right cursor-pointer hover:bg-purple-600/40" onClick={() => requestSort('shellCost')}>
                    <div className="flex items-center justify-end gap-2">
                      Shells <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right cursor-pointer hover:bg-purple-600/40" onClick={() => requestSort('retailPrice')}>
                    <div className="flex items-center justify-end gap-2">
                      Retail $ <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right cursor-pointer hover:bg-purple-600/40" onClick={() => requestSort('resalePrice')}>
                    <div className="flex items-center justify-end gap-2">
                      Resale $ <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right cursor-pointer hover:bg-purple-600/40" onClick={() => requestSort('shellToRetail')}>
                    <div className="flex items-center justify-end gap-2">
                      Shell:Retail <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right cursor-pointer hover:bg-purple-600/40" onClick={() => requestSort('shellToResale')}>
                    <div className="flex items-center justify-end gap-2">
                      Shell:Resale <ArrowUpDown size={14} />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-right cursor-pointer hover:bg-purple-600/40" onClick={() => requestSort('valueScore')}>
                    <div className="flex items-center justify-end gap-2">
                      Value % <ArrowUpDown size={14} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="text-white">
                {sortedItems.map((item, idx) => (
                  <tr key={idx} className={`border-b border-white/10 hover:bg-white/5 transition-colors ${excludedItems.has(item.name) ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleExclude(item.name)}
                        className={`p-1 rounded transition-colors ${
                          excludedItems.has(item.name)
                            ? 'bg-green-500/20 hover:bg-green-500/30 text-green-300'
                            : 'bg-red-500/20 hover:bg-red-500/30 text-red-300'
                        }`}
                        title={excludedItems.has(item.name) ? 'Include' : 'Exclude'}
                      >
                        <X size={16} />
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-purple-300 text-xs uppercase">{item.category}</td>
                    <td className="px-4 py-3 text-right text-purple-300">{item.shellCost}</td>
                    <td className="px-4 py-3 text-right">${item.retailPrice > 0 ? item.retailPrice.toFixed(2) : 'N/A'}</td>
                    <td className="px-4 py-3 text-right">${item.resalePrice > 0 ? item.resalePrice.toFixed(2) : 'N/A'}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm">{item.shellToRetail}</td>
                    <td className="px-4 py-3 text-right font-mono text-sm">{item.shellToResale}</td>
                    <td className={`px-4 py-3 text-right font-bold ${
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

        <div className="mt-6 bg-blue-500/20 backdrop-blur-lg rounded-xl p-6 border border-blue-400/30">
          <h3 className="text-xl font-bold text-blue-300 mb-3">📊 How to Use This Tool</h3>
          <ul className="text-blue-100 space-y-2 text-sm">
            <li><strong>Budget:</strong> Enter your shell count to filter items within your range</li>
            <li><strong>Exclude Items:</strong> Click the X button to exclude items you're not interested in - this updates recommendations</li>
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
