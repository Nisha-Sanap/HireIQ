import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import {
  HiOutlineDocumentArrowDown, HiOutlineBriefcase,
  HiOutlineChartBar, HiOutlineTrophy, HiOutlineEye,
} from 'react-icons/hi2'

export default function ReportsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(null)

  useEffect(() => { fetchJobs() }, [])

  const fetchJobs = async () => {
    try {
      const res = await api.get('/api/jobs')
      setJobs(res.data.jobs || [])
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  const downloadReport = async (jobId, jobTitle) => {
    setGenerating(jobId)
    try {
      const res = await api.get(`/api/reports/ranking/${jobId}`)
      const report = res.data.report

      if (!report.rankings || report.rankings.length === 0) {
        toast.error('No rankings found. Calculate rankings first.')
        setGenerating(null)
        return
      }

      // Generate CSV content
      const headers = ['Rank', 'Candidate Name', 'Email', 'ATS Score', 'Skill Match %', 'Category', 'Matched Skills', 'Missing Skills']
      const rows = report.rankings.map(r => [
        r.rank,
        r.candidate_name || 'Unknown',
        r.candidate_email || 'N/A',
        r.ats_score,
        r.skill_match_score,
        r.resume_category || 'N/A',
        `"${(r.matched_skills || []).join(', ')}"`,
        `"${(r.missing_skills || []).join(', ')}"`,
      ])

      const csvContent = [
        `Resume Screening Report - ${report.job_title}`,
        `Company: ${report.company || 'N/A'}`,
        `Total Candidates: ${report.total_candidates}`,
        `Average Score: ${report.average_score}%`,
        `Generated: ${new Date().toLocaleString()}`,
        '',
        headers.join(','),
        ...rows.map(r => r.join(',')),
      ].join('\n')

      // Download as CSV
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ranking-report-${jobTitle.replace(/\s+/g, '-').toLowerCase()}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Report downloaded successfully!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to generate report')
    } finally { setGenerating(null) }
  }

  const downloadJSONReport = async (jobId, jobTitle) => {
    setGenerating(jobId)
    try {
      const res = await api.get(`/api/reports/ranking/${jobId}`)
      const report = res.data.report

      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ranking-report-${jobTitle.replace(/\s+/g, '-').toLowerCase()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('JSON report downloaded!')
    } catch (err) {
      toast.error('Failed to generate report')
    } finally { setGenerating(null) }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-dark-100">Reports</h1>
        <p className="text-dark-400 mt-1">Download ranking reports and analytics for your job postings</p>
      </div>

      {jobs.length === 0 ? (
        <div className="glass rounded-2xl p-16 text-center">
          <HiOutlineBriefcase className="w-16 h-16 mx-auto text-dark-600 mb-4" />
          <h2 className="text-xl font-semibold text-dark-300">No Jobs Found</h2>
          <p className="text-dark-500 mt-2">Create job descriptions and calculate rankings first.</p>
          <Link to="/upload-job" className="inline-block mt-6 px-6 py-2.5 gradient-primary rounded-xl text-white font-medium text-sm hover:opacity-90 transition-all">
            Create Job Description
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job, i) => (
            <div
              key={job.id}
              className="glass rounded-2xl p-6 hover:border-primary-500/20 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <HiOutlineBriefcase className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-dark-100">{job.title}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        {job.company && <span className="text-xs text-dark-400">{job.company}</span>}
                        <span className="text-xs bg-dark-700 text-dark-300 px-2 py-0.5 rounded">{job.experience_level}</span>
                        <span className="text-xs bg-dark-700 text-dark-300 px-2 py-0.5 rounded">{job.job_type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <HiOutlineTrophy className="w-4 h-4 text-amber-400" />
                      <span className="text-sm text-dark-300">{job.total_candidates} candidates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiOutlineChartBar className="w-4 h-4 text-primary-400" />
                      <span className="text-sm text-dark-300">{job.required_skills?.length || 0} required skills</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {job.total_candidates > 0 && (
                    <Link
                      to={`/rankings/${job.id}`}
                      className="flex items-center gap-1.5 px-4 py-2 glass-light rounded-xl text-dark-300 hover:text-primary-400 text-sm font-medium transition-all"
                    >
                      <HiOutlineEye className="w-4 h-4" />
                      View Rankings
                    </Link>
                  )}

                  <button
                    onClick={() => downloadReport(job.id, job.title)}
                    disabled={generating === job.id || job.total_candidates === 0}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600/20 text-emerald-400 rounded-xl text-sm font-medium hover:bg-emerald-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    id={`download-csv-${job.id}`}
                  >
                    <HiOutlineDocumentArrowDown className="w-4 h-4" />
                    {generating === job.id ? 'Generating...' : 'CSV Report'}
                  </button>

                  <button
                    onClick={() => downloadJSONReport(job.id, job.title)}
                    disabled={generating === job.id || job.total_candidates === 0}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary-600/20 text-primary-400 rounded-xl text-sm font-medium hover:bg-primary-600/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    id={`download-json-${job.id}`}
                  >
                    <HiOutlineDocumentArrowDown className="w-4 h-4" />
                    {generating === job.id ? 'Generating...' : 'JSON Report'}
                  </button>
                </div>
              </div>

              {job.total_candidates === 0 && (
                <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                  <p className="text-sm text-amber-400">
                    ⚠ No rankings calculated yet. Go to <Link to="/upload-job" className="underline hover:text-amber-300">Job Descriptions</Link> and click "Rank Candidates" first.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Info Card */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-dark-100 mb-3">📋 Report Formats</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-light rounded-xl p-4">
            <h4 className="text-sm font-semibold text-emerald-400 mb-2">CSV Report</h4>
            <p className="text-xs text-dark-400">
              Tabular format with candidate rankings, ATS scores, matched & missing skills.
              Can be opened in Excel, Google Sheets, or any spreadsheet tool.
            </p>
          </div>
          <div className="glass-light rounded-xl p-4">
            <h4 className="text-sm font-semibold text-primary-400 mb-2">JSON Report</h4>
            <p className="text-xs text-dark-400">
              Structured data format with complete ranking details including score breakdowns,
              keyword frequencies, and skill analysis. Ideal for integration with other tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
