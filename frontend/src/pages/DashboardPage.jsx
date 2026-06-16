import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import {
  HiOutlineDocumentText,
  HiOutlineBriefcase,
  HiOutlineChartBar,
  HiOutlineTrophy,
  HiOutlineArrowRight,
} from 'react-icons/hi2'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#6366f1', '#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#60a5fa', '#f97316', '#14b8a6']

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

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
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Dashboard</h1>
          <p className="text-dark-400 mt-1">Overview of your recruitment pipeline</p>
        </div>
        <Link
          to="/upload-resume"
          className="flex items-center gap-2 px-5 py-2.5 gradient-primary rounded-xl text-white font-medium text-sm hover:opacity-90 transition-all"
        >
          Upload Resumes <HiOutlineArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Resumes', value: stats?.total_resumes || 0, icon: HiOutlineDocumentText, color: 'from-indigo-500 to-purple-500' },
          { label: 'Active Jobs', value: stats?.total_jobs || 0, icon: HiOutlineBriefcase, color: 'from-emerald-500 to-teal-500' },
          { label: 'Avg ATS Score', value: `${stats?.average_ats_score || 0}%`, icon: HiOutlineChartBar, color: 'from-amber-500 to-orange-500' },
          { label: 'Rankings Done', value: stats?.total_rankings || 0, icon: HiOutlineTrophy, color: 'from-pink-500 to-rose-500' },
        ].map((card, i) => (
          <div
            key={card.label}
            className="glass rounded-2xl p-5 hover:border-primary-500/30 transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-dark-100">{card.value}</p>
            <p className="text-sm text-dark-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">Score Distribution</h3>
          {scoreData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={scoreData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-dark-500 text-center py-12">No ranking data yet. Calculate rankings to see distribution.</p>
          )}
        </div>

        {/* Category Distribution */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">Resume Categories</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-dark-500 text-center py-12">Upload resumes to see category breakdown.</p>
          )}
          {categoryData.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {categoryData.map((item, i) => (
                <span key={item.name} className="flex items-center gap-1.5 text-xs text-dark-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {item.name} ({item.value})
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Resumes */}
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dark-100">Recent Resumes</h3>
            <Link to="/upload-resume" className="text-sm text-primary-400 hover:text-primary-300">View all →</Link>
          </div>
          {(stats?.recent_resumes || []).length > 0 ? (
            <div className="space-y-3">
              {stats.recent_resumes.map((r) => (
                <div key={r.id} className="flex items-center justify-between glass-light rounded-xl p-3">
                  <div>
                    <p className="text-sm font-medium text-dark-100">{r.candidate_name}</p>
                    <p className="text-xs text-dark-400">{r.filename}</p>
                  </div>
                  {r.category && (
                    <span className="text-xs bg-primary-600/20 text-primary-400 px-2.5 py-1 rounded-lg">{r.category}</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-dark-500 text-sm text-center py-8">No resumes uploaded yet</p>
          )}
        </div>

        {/* Top Candidates */}
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">Top Candidates</h3>
          {(stats?.top_candidates || []).length > 0 ? (
            <div className="space-y-3">
              {stats.top_candidates.map((c, i) => (
                <div key={i} className="flex items-center justify-between glass-light rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-dark-700 text-dark-300'
                    }`}>
                      #{c.rank}
                    </span>
                    <p className="text-sm font-medium text-dark-100">{c.candidate_name}</p>
                  </div>
                  <span className={`text-sm font-semibold ${
                    c.ats_score >= 70 ? 'score-excellent' : c.ats_score >= 50 ? 'score-good' : 'score-fair'
                  }`}>
                    {c.ats_score}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-dark-500 text-sm text-center py-8">Calculate rankings to see top candidates</p>
          )}
        </div>
      </div>

      {/* Top Skills */}
      {(stats?.top_skills || []).length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">Most Common Skills</h3>
          <div className="flex flex-wrap gap-2">
            {stats.top_skills.map((s) => (
              <span
                key={s.skill}
                className="px-3 py-1.5 bg-primary-600/15 text-primary-300 text-sm rounded-lg border border-primary-500/20"
              >
                {s.skill} <span className="text-primary-500/60 ml-1">×{s.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
