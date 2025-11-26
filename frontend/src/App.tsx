import { useState } from 'react'
import './index.css'
import RoutesTab from './adapters/ui/components/RoutesTab'
import CompareTab from './adapters/ui/components/CompareTab'
import BankingTab from './adapters/ui/components/BankingTab'
import PoolingTab from './adapters/ui/components/PoolingTab'

type TabType = 'routes' | 'compare' | 'banking' | 'pooling'

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('routes')

  const handleExportReport = () => {
    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `fuel-eu-${activeTab}-report-${timestamp}.json`

    // Create a simple report structure
    const report = {
      reportType: activeTab,
      generatedAt: new Date().toISOString(),
      dashboard: 'Fuel EU Compliance',
      note: 'This is a sample export. In production, this would contain actual data from the current tab.'
    }

    // Convert to JSON and create download
    const dataStr = JSON.stringify(report, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)

    // Create temporary link and trigger download
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    // Show success message
    alert(`Report exported successfully as ${filename}`)
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-gray-800/50 backdrop-blur-xl bg-gray-900/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-neon p-0.5">
                <div className="w-full h-full bg-gray-950 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold neon-text">Fuel EU Compliance</h1>
                <p className="text-sm text-gray-400">Maritime Dashboard</p>
              </div>
            </div>
            <button onClick={handleExportReport} className="btn-neon">
              Export Report
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="glass-card p-2 inline-flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('routes')}
            className={`tab-button ${activeTab === 'routes' ? 'active' : ''}`}
          >
            🚢 Routes
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`tab-button ${activeTab === 'compare' ? 'active' : ''}`}
          >
            📊 Compare
          </button>
          <button
            onClick={() => setActiveTab('banking')}
            className={`tab-button ${activeTab === 'banking' ? 'active' : ''}`}
          >
            🏦 Banking
          </button>
          <button
            onClick={() => setActiveTab('pooling')}
            className={`tab-button ${activeTab === 'pooling' ? 'active' : ''}`}
          >
            💧 Pooling
          </button>
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {activeTab === 'routes' && <RoutesTab />}
          {activeTab === 'compare' && <CompareTab />}
          {activeTab === 'banking' && <BankingTab />}
          {activeTab === 'pooling' && <PoolingTab />}
        </div>
      </div>
    </div>
  )
}

export default App
