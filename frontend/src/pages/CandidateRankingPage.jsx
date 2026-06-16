import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import { HiOutlineTrophy, HiOutlineEye, HiOutlineMagnifyingGlass } from 'react-icons/hi2'

export default function CandidateRankingPage() {
  const { jobId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('rank')

  useEffect(() => { fetchRankings() }, [jobId])

  const fetchRankings = async () => {
    try {
      const res = await api.get(`/api/ranking/${jobId}`)
      setData(res.data)
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  if (!data || !data.rankings?.length) {
    return (
      <div className="glass rounded-2xl p-12 text-center animate-fade-in">
        <HiOutlineTrophy className="w-16 h-16 mx-auto text-dark-500 mb-4" />
        <h2 className="text-xl font-semibold text-dark-200">No Rankings Found</h2>
        <p className="text-dark-400 mt-2">Calculate rankings from the Job Descriptions page first.</p>
        <Link to="/upload-job" className="inline-block mt-4 px-6 py-2.5 gradient-primary rounded-xl text-white font-medium text-sm">Go to Jobs</Link>
      </div>
    )
  }

  const filtered = data.rankings
    .filter(r => r.candidate_name?.toLowerCase().includes(search.toLowerCase()) || r.filename?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'rank') return a.rank - b.rank
      if (sortBy === 'score') return b.ats_score - a.ats_score
      if (sortBy === 'name') return (a.candidate_name || '').localeCompare(b.candidate_name || '')
      return 0
    })

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-emerald-400 bg-emerald-500/20'
    if (score >= 50) return 'text-blue-400 bg-blue-500/20'
    if (score >= 30) return 'text-amber-400 bg-amber-500/20'
    return 'text-red-400 bg-red-500/20'
  }

  const getGrade = (score) => {
    if (score >= 80) return 'A'
    if (score >= 60) return 'B'
    if (score >= 40) return 'C'
    if (score >= 20) return 'D'
    return 'F'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Candidate Rankings</h1>
          <p className="text-dark-400 mt-1">{data.job_title} — {data.total_candidates} candidates, avg score: {data.average_score}%</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-dark-800/50 border border-dark-700/50 rounded-xl text-dark-100 text-sm placeholder-dark-500 focus:outline-none focus:border-primary-500/50 w-60"
              placeholder="Search candidates..." id="search-candidates"
            />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-4 py-2 bg-dark-800/50 border border-dark-700/50 rounded-xl text-dark-100 text-sm focus:outline-none focus:border-primary-500/50">
            <option value="rank">Sort by Rank</option>
            <option value="score">Sort by Score</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Rankings Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">Rank</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">Candidate</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">ATS Score</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">Grade</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">Skills Match</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">Category</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-dark-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} className="border-b border-dark-800/50 hover:bg-dark-800/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                  <td className="px-6 py-4">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      r.rank === 1 ? 'bg-amber-500/20 text-amber-400' :
                      r.rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                      r.rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-dark-700 text-dark-400'
                    }`}>
                      {r.rank}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-dark-100">{r.candidate_name}</p>
                    <p className="text-xs text-dark-400">{r.filename}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-sm font-semibold ${getScoreColor(r.ats_score)}`}>
                      {r.ats_score}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-lg font-bold ${getScoreColor(r.ats_score).split(' ')[0]}`}>
                      {getGrade(r.ats_score)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-dark-700 rounded-full overflow-hidden">
                        <div className="h-full gradient-primary rounded-full" style={{ width: `${r.skill_match_score * 100}%` }} />
                      </div>
                      <span className="text-xs text-dark-400">{Math.round(r.skill_match_score * 100)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {r.resume_category && (
                      <span className="text-xs bg-primary-600/15 text-primary-400 px-2.5 py-1 rounded-lg">{r.resume_category}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/ats/${jobId}/${r.resume_id}`}
                      className="flex items-center gap-1 text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
                    >
                      <HiOutlineEye className="w-4 h-4" /> Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
