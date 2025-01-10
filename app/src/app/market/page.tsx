'use client'

import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'StableBond Market Trends',
    },
  },
}

export default function MarketPage() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'StableBond Price',
        data: [],
        borderColor: '#e6ff00',
        backgroundColor: 'rgba(230, 255, 0, 0.5)',
      },
    ],
  })

  useEffect(() => {
    // Simulating data fetching
    const fetchData = () => {
      const labels = Array.from({length: 7}, (_, i) => `Day ${i + 1}`)
      const data = Array.from({length: 7}, () => Math.random() * 100 + 900)
      setChartData({
        labels,
        datasets: [
          {
            label: 'StableBond Price',
            data,
            borderColor: '#e6ff00',
            backgroundColor: 'rgba(230, 255, 0, 0.5)',
          },
        ],
      })
    }

    fetchData()
    const interval = setInterval(fetchData, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-[#e6ff00] glitch-text">StableBond Market</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-gray-900 border-[#e6ff00]/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#e6ff00]">Market Overview</CardTitle>
              <CardDescription className="text-gray-400">Live StableBond market data</CardDescription>
            </CardHeader>
            <CardContent>
              <Line options={options} data={chartData} />
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-[#e6ff00]/20">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-[#e6ff00]">Market Stats</CardTitle>
              <CardDescription className="text-gray-400">Key market indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400">Current Price</p>
                  <p className="text-2xl font-bold text-white">$978.45</p>
                </div>
                <div>
                  <p className="text-gray-400">24h Change</p>
                  <p className="text-2xl font-bold text-green-500">+2.34%</p>
                </div>
                <div>
                  <p className="text-gray-400">Market Cap</p>
                  <p className="text-2xl font-bold text-white">$1.23B</p>
                </div>
                <div>
                  <p className="text-gray-400">Total Supply</p>
                  <p className="text-2xl font-bold text-white">1,000,000</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

