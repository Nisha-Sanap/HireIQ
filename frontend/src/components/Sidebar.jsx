import { NavLink } from 'react-router-dom'
import {
  HiOutlineHome,
  HiOutlineDocumentArrowUp,
  HiOutlineBriefcase,
  HiOutlineChartBar,
  HiOutlineDocumentText,
  HiOutlineSparkles,
} from 'react-icons/hi2'

const navItems = [
  { to: '/', icon: HiOutlineHome, label: 'Dashboard', end: true },
  { to: '/upload-resume', icon: HiOutlineDocumentArrowUp, label: 'Upload Resumes' },
  { to: '/upload-job', icon: HiOutlineBriefcase, label: 'Job Descriptions' },
  { to: '/analytics', icon: HiOutlineChartBar, label: 'Analytics' },
  { to: '/reports', icon: HiOutlineDocumentText, label: 'Reports' },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass border-r border-dark-700/50 flex flex-col z-50">
      {/* Brand */}
      <div className="p-6 border-b border-dark-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center animate-pulse-glow">
            <HiOutlineSparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">ResumeAI</h1>
            <p className="text-xs text-dark-400">Smart Screening</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-500/30'
                  : 'text-dark-300 hover:bg-dark-800/50 hover:text-dark-100'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-dark-700/50">
        <div className="glass-light rounded-xl p-3 text-center">
          <p className="text-xs text-dark-400">Powered by AI</p>
          <p className="text-xs text-dark-500 mt-1">v1.0.0</p>
        </div>
      </div>
    </aside>
  )
}
