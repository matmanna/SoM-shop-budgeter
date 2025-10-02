# 🏝️ SoM Shop Budgeter

A comprehensive budgeting tool for the Hack Club Summer of Making shop, helping participants maximize the value of their hard-earned shells.

<p align="center">
  <img src=".github/images/hero-screenshot.png" alt="SoM Shop Budgeter Interface" width="800"/>
</p>

> **Note:** The Summer of Making has ended! Use this tool to make informed decisions about what to purchase with your remaining shells.

## ✨ Features

### 🎯 Smart Filtering & Sorting
- **Budget-Based Filtering**: Instantly see which items fit your shell budget
- **Category System**: Filter by hardware, games, tools, peripherals, security, grants, merch, and more
- **Include/Exclude Modes**: Toggle between showing only selected categories or hiding them
- **Status Filters**: Quick access to items in budget, excluded items, wishlist, and unaffordable items
- **Multi-Column Sorting**: Sort by shells, retail price, resale value, value score, and more

### 💝 Wishlist & Recommendations
- **Smart Wishlist**: Add items to your wishlist with custom quantities (perfect for grants/credits)
- **Optimization Engine**: Get recommendations based on best value, lowest cost, or highest retail value
- **Greedy Knapsack Algorithm**: Automatically calculates the best combination of wishlist items within your budget
- **Persistent Storage**: Your wishlist and quantities are saved in localStorage

### 📊 Value Analysis
- **Value Score**: See retail value as a percentage of shell cost (higher is better)
- **Shell:Retail Ratio**: Compare shells per dollar of retail value (lower is better)
- **Resale Values**: View estimated resale prices for each item
- **Color Coding**: Visual indicators for great value (green), fair value (amber), and items to consider carefully (orange)
- **Best/Worst Value Lists**: Quick reference for the top and bottom value items

### 🎨 User Experience
- **Playful Island Aesthetic**: Beige/blue color scheme inspired by summer vibes
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-Time Countdown**: See exactly when the shop closes
- **External Links**: Quick access to Amazon, eBay, and manufacturer websites
- **Item Images**: Visual previews of each item in the shop
- **Collapsible Help Section**: Easy access to usage instructions without cluttering the interface

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/matmanna/SoM-shop-budgeter.git
cd SoM-shop-budgeter
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Configure analytics:
```bash
# Create a .env file
echo "VITE_POSTHOG_KEY=your_posthog_project_key" > .env
echo "VITE_POSTHOG_HOST=https://us.i.posthog.com" >> .env
```

4. Start the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_POSTHOG_KEY` | PostHog project API key for analytics | No |
| `VITE_POSTHOG_HOST` | PostHog API host (defaults to US cloud) | No |

### Deployment

The app is optimized for deployment on Netlify, Vercel, or any static hosting platform. A `netlify.toml` configuration is included.

## 📸 Screenshots

<details>
<summary>View Screenshots</summary>

### Main Interface
<img src=".github/images/main-interface.png" alt="Main Interface" width="600"/>

### Wishlist Recommendations
<img src=".github/images/wishlist.png" alt="Wishlist Feature" width="600"/>

### Category Filtering
<img src=".github/images/filtering.png" alt="Category Filtering" width="600"/>

</details>

## 🛠️ Technology Stack

- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Analytics**: PostHog (optional)
- **State Management**: React Hooks with localStorage persistence

## 📝 Development Notes

This project was developed using AI-assisted coding with GitHub Copilot Agents and Claude. While the codebase has been iteratively improved and tested, users should verify item data accuracy independently.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for your own purposes!

## 🙏 Acknowledgments

- Built for the [Hack Club](https://hackclub.com/) community
- Summer of Making program and participants
- Item data sourced from the official SoM shop

## 📬 Contact

**Matt Manna** - [@matmanna](https://github.com/matmanna)

Project Link: [https://github.com/matmanna/SoM-shop-budgeter](https://github.com/matmanna/SoM-shop-budgeter)
