import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineLightBulb } from 'react-icons/hi2'

export default function ATSAnalysisPage() {
  const { jobId, resumeId } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchReport() }, [jobId, resumeId])

  const fetchReport = async () => {
    try {
      const res = await api.get(`/api/reports/ats/${jobId}/${resumeId}`)
      setReport(res.data.report)
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  if (!report) {
    return <div className="glass rounded-2xl p-12 text-center"><p className="text-dark-400">Report not found</p></div>
  }

  const radarData = [
    { metric: 'Skills', value: report.skill_match_score || 0 },
    { metric: 'Similarity', value: report.similarity_score || 0 },
    { metric: 'Experience', value: report.experience_score || 0 },
    { metric: 'Keywords', value: report.keyword_score || 0 },
  ]

  const breakdownData = Object.entries(report.score_breakdown || {}).map(([key, value]) => ({
    name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    score: value,
  }))

  const keywordData = Object.entries(report.keyword_frequency || {}).filter(([_, v]) => v > 0).map(([k, v]) => ({ keyword: k, count: v })).sort((a, b) => b.count - a.count).slice(0, 10)

  const getScoreStyle = (score) => {
    if (score >= 70) return { color: '#10b981', bg: 'bg-emerald-500/20', label: 'Excellent' }
    if (score >= 50) return { color: '#3b82f6', bg: 'bg-blue-500/20', label: 'Good' }
    if (score >= 30) return { color: '#f59e0b', bg: 'bg-amber-500/20', label: 'Fair' }
    return { color: '#ef4444', bg: 'bg-red-500/20', label: 'Poor' }
  }

  const scoreStyle = getScoreStyle(report.ats_score)

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="flex items-center gap-4">
        <Link to={`/rankings/${jobId}`} className="p-2 rounded-xl bg-dark-800 text-dark-300 hover:text-dark-100 hover:bg-dark-700 transition-all">
          <HiOutlineArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-dark-100">ATS Analysis</h1>
          <p className="text-dark-400 mt-1">{report.candidate_name} — {report.job_title}</p>
        </div>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-8 text-center col-span-1">
          <div className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center ${scoreStyle.bg} border-4`} style={{ borderColor: scoreStyle.color }}>
            <div>
              <p className="text-3xl font-bold" style={{ color: scoreStyle.color }}>{report.ats_score}%</p>
              <p className="text-xs mt-1" style={{ color: scoreStyle.color }}>{report.grade} — {report.grade_label}</p>
            </div>
          </div>
          <p className="text-dark-300 mt-4 text-sm font-medium">Overall ATS Score</p>
          {report.resume_category && (
            <span className="inline-block mt-2 text-xs bg-primary-600/20 text-primary-400 px-3 py-1 rounded-lg">{report.resume_category}</span>
          )}
        </div>

        {/* Radar Chart */}
        <div className="glass rounded-2xl p-6 col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">Score Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Component Scores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {breakdownData.map(item => (
          <div key={item.name} className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-primary-400">{item.score}</p>
            <p className="text-xs text-dark-400 mt-1">{item.name}</p>
            <p className="text-xs text-dark-500">/ {item.name.includes('Skill') ? '40' : item.name.includes('Text') ? '30' : '15'}</p>
          </div>
        ))}
      </div>

      {/* Skills Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineCheckCircle className="w-5 h-5 text-success" />
            <h3 className="font-semibold text-dark-100">Matched Skills ({report.matched_skills?.length || 0})</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {(report.matched_skills || []).map(s => (
              <span key={s} className="px-3 py-1 bg-emerald-500/15 text-emerald-400 text-sm rounded-lg border border-emerald-500/20">{s}</span>
            ))}
            {(!report.matched_skills || report.matched_skills.length === 0) && <p className="text-dark-500 text-sm">No matching skills found</p>}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineXCircle className="w-5 h-5 text-danger" />
            <h3 className="font-semibold text-dark-100">Missing Skills ({report.missing_skills?.length || 0})</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {(report.missing_skills || []).map(s => (
              <span key={s} className="px-3 py-1 bg-red-500/15 text-red-400 text-sm rounded-lg border border-red-500/20">{s}</span>
            ))}
            {(!report.missing_skills || report.missing_skills.length === 0) && <p className="text-dark-500 text-sm">No missing skills — perfect match!</p>}
          </div>
        </div>
      </div>

      {/* Keyword Frequency */}
      {keywordData.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-dark-100 mb-4">Keyword Frequency in Resume</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={keywordData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis dataKey="keyword" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={120} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9' }} />
              <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recommendations */}
      {report.recommendations?.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineLightBulb className="w-5 h-5 text-warning" />
            <h3 className="font-semibold text-dark-100">Recommendations</h3>
          </div>
          <div className="space-y-3">
            {report.recommendations.map((rec, i) => (
              <div key={i} className={`glass-light rounded-xl p-4 border-l-4 ${
                rec.priority === 'high' ? 'border-red-500' : rec.priority === 'medium' ? 'border-amber-500' : 'border-primary-500'
              }`}>
                <p className="text-sm text-dark-200">{rec.message}</p>
                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${
                  rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                  rec.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-primary-500/20 text-primary-400'
                }`}>{rec.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
