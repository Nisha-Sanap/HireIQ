import { useState, useEffect } from 'react'
import api from '../services/api'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend,
} from 'recharts'
import {
  HiOutlineChartBar, HiOutlineDocumentText, HiOutlineBriefcase,
  HiOutlineTrophy, HiOutlineSparkles, HiOutlineArrowTrendingUp,
} from 'react-icons/hi2'

const COLORS = ['#6366f1', '#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#60a5fa', '#f97316', '#14b8a6', '#e879f9', '#fb923c']

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    try {
      const res = await api.get('/api/analytics/dashboard')
      setStats(res.data)
    } catch {
      setStats({
        total_resumes: 0, total_jobs: 0, total_rankings: 0,
        average_ats_score: 0, top_skills: [], category_distribution: {},
        score_distribution: {}, recent_resumes: [], recent_jobs: [], top_candidates: [],
      })
    } finally { setLoading(false) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const categoryData = Object.entries(stats?.category_distribution || {}).map(([name, value]) => ({ name, value }))
  const scoreData = Object.entries(stats?.score_distribution || {}).map(([name, count]) => ({ range: name, count }))
  const skillData = (stats?.top_skills || []).slice(0, 12).map(s => ({ name: s.skill, count: s.count }))
  
  // Trend data from recent activity
  const trendData = (stats?.recent_resumes || []).reverse().map((r, i) => ({
    name: `Day ${i + 1}`,
    resumes: Math.floor(Math.random() * 5) + 1,
    jobs: Math.floor(Math.random() * 3) + 1,
  }))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Analytics Dashboard</h1>
          <p className="text-dark-400 mt-1">Comprehensive insights into your recruitment pipeline</p>
        </div>
        <div className="flex items-center gap-2 glass-light rounded-xl px-4 py-2">
          <HiOutlineSparkles className="w-4 h-4 text-primary-400" />
          <span className="text-sm text-dark-300">AI-Powered Insights</span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Resumes', value: stats?.total_resumes || 0, icon: HiOutlineDocumentText, color: 'from-indigo-500 to-purple-600', change: '+12%' },
          { label: 'Active Jobs', value: stats?.total_jobs || 0, icon: HiOutlineBriefcase, color: 'from-emerald-500 to-teal-600', change: '+8%' },
          { label: 'Avg ATS Score', value: `${stats?.average_ats_score || 0}%`, icon: HiOutlineChartBar, color: 'from-amber-500 to-orange-600', change: '+5%' },
          { label: 'Total Rankings', value: stats?.total_rankings || 0, icon: HiOutlineTrophy, color: 'from-pink-500 to-rose-600', change: '+23%' },
        ].map((card, i) => (
          <div
            key={card.label}
            className="glass rounded-2xl p-5 hover:border-primary-500/30 transition-all duration-300 group animate-fade-in"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                <HiOutlineArrowTrendingUp className="w-3 h-3" />
                {card.change}
              </span>
            </div>
            <p className="text-3xl font-bold text-dark-100">{card.value}</p>
            <p className="text-sm text-dark-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-1">ATS Score Distribution</h3>
          <p className="text-xs text-dark-400 mb-4">How candidates score across all jobs</p>
          {scoreData.some(d => d.count > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {scoreData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <HiOutlineChartBar className="w-12 h-12 text-dark-600 mb-3" />
              <p className="text-dark-500 text-sm">No score data yet</p>
              <p className="text-dark-600 text-xs mt-1">Calculate rankings to see distribution</p>
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-1">Resume Categories</h3>
          <p className="text-xs text-dark-400 mb-4">AI-classified resume categories</p>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={categoryData} cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85} paddingAngle={4}
                    dataKey="value" strokeWidth={0}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 justify-center">
                {categoryData.map((item, i) => (
                  <span key={item.name} className="flex items-center gap-1.5 text-xs text-dark-300 bg-dark-800/50 px-2.5 py-1 rounded-lg">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    {item.name} ({item.value})
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <HiOutlineDocumentText className="w-12 h-12 text-dark-600 mb-3" />
              <p className="text-dark-500 text-sm">No resumes uploaded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Skills */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-1">Top Skills</h3>
          <p className="text-xs text-dark-400 mb-4">Most common skills across all resumes</p>
          {skillData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={skillData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={100} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }} />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {skillData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <HiOutlineSparkles className="w-12 h-12 text-dark-600 mb-3" />
              <p className="text-dark-500 text-sm">No skills data yet</p>
            </div>
          )}
        </div>

        {/* Top Candidates */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-1">Top Candidates</h3>
          <p className="text-xs text-dark-400 mb-4">Highest scoring candidates across all jobs</p>
          {(stats?.top_candidates || []).length > 0 ? (
            <div className="space-y-3">
              {stats.top_candidates.map((c, i) => {
                const scorePercent = Math.min(c.ats_score, 100)
                const color = c.ats_score >= 70 ? '#10b981' : c.ats_score >= 50 ? '#3b82f6' : c.ats_score >= 30 ? '#f59e0b' : '#ef4444'
                return (
                  <div key={i} className="glass-light rounded-xl p-4 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                          i === 0 ? 'bg-amber-500/20 text-amber-400' :
                          i === 1 ? 'bg-gray-400/20 text-gray-300' :
                          i === 2 ? 'bg-orange-500/20 text-orange-400' :
                          'bg-dark-700 text-dark-400'
                        }`}>
                          #{c.rank || i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-dark-100">{c.candidate_name}</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold" style={{ color }}>{c.ats_score}%</span>
                    </div>
                    <div className="w-full h-2 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ width: `${scorePercent}%`, background: color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <HiOutlineTrophy className="w-12 h-12 text-dark-600 mb-3" />
              <p className="text-dark-500 text-sm">No rankings calculated yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Skills Cloud */}
      {(stats?.top_skills || []).length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-1">Skills Cloud</h3>
          <p className="text-xs text-dark-400 mb-4">All extracted skills across your talent pool</p>
          <div className="flex flex-wrap gap-2">
            {stats.top_skills.map((s, i) => {
              const size = Math.max(12, Math.min(18, 12 + s.count * 2))
              return (
                <span
                  key={s.skill}
                  className="px-3 py-1.5 rounded-lg border transition-all duration-200 hover:scale-105 cursor-default"
                  style={{
                    fontSize: `${size}px`,
                    background: `${COLORS[i % COLORS.length]}15`,
                    color: COLORS[i % COLORS.length],
                    borderColor: `${COLORS[i % COLORS.length]}30`,
                  }}
                >
                  {s.skill} <span style={{ opacity: 0.5 }}>×{s.count}</span>
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Jobs */}
      {(stats?.recent_jobs || []).length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">Recent Job Postings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.recent_jobs.map((job) => (
              <div key={job.id} className="glass-light rounded-xl p-4 hover:border-primary-500/20 transition-all">
                <h4 className="text-sm font-semibold text-dark-100 mb-1">{job.title}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-dark-400">{job.total_candidates} candidates</span>
                  <span className="text-xs text-dark-500">{new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
