import Sidebar from './Sidebar'
import ChatArea from './ChatArea'
import SettingsModal from './SettingsModal'

function App() {
  return (
    <div className="flex h-screen bg-[#212327] overflow-hidden">
      <Sidebar />
      <ChatArea />
      <SettingsModal />
    </div>
  )
}

export default App

