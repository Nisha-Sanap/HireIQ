import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'
import { HiOutlinePlus, HiOutlineTrash, HiOutlineChartBar, HiOutlineXMark } from 'react-icons/hi2'

export default function UploadJobPage() {
  const [jobs, setJobs] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '', company: '', description: '',
    required_skills: [], preferred_skills: [],
    experience_level: 'mid', location: '', job_type: 'full-time',
  })
  const [skillInput, setSkillInput] = useState('')
  const [prefSkillInput, setPrefSkillInput] = useState('')
  const navigate = useNavigate()

  useEffect(() => { fetchJobs() }, [])

  const fetchJobs = async () => {
    try {
      const res = await api.get('/api/jobs')
      setJobs(res.data.jobs || [])
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  const addSkill = (e, type) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      e.preventDefault()
      const skill = e.target.value.trim().toLowerCase()
      if (type === 'required' && !form.required_skills.includes(skill)) {
        setForm(p => ({ ...p, required_skills: [...p.required_skills, skill] }))
        setSkillInput('')
      } else if (type === 'preferred' && !form.preferred_skills.includes(skill)) {
        setForm(p => ({ ...p, preferred_skills: [...p.preferred_skills, skill] }))
        setPrefSkillInput('')
      }
    }
  }

  const removeSkill = (skill, type) => {
    if (type === 'required') {
      setForm(p => ({ ...p, required_skills: p.required_skills.filter(s => s !== skill) }))
    } else {
      setForm(p => ({ ...p, preferred_skills: p.preferred_skills.filter(s => s !== skill) }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/api/jobs', form)
      toast.success('Job created successfully!')
      setShowForm(false)
      setForm({ title: '', company: '', description: '', required_skills: [], preferred_skills: [], experience_level: 'mid', location: '', job_type: 'full-time' })
      fetchJobs()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create job')
    } finally { setSubmitting(false) }
  }

  const deleteJob = async (id) => {
    try {
      await api.delete(`/api/jobs/${id}`)
      toast.success('Job deleted')
      fetchJobs()
    } catch { toast.error('Failed to delete') }
  }

  const calculateRankings = async (jobId) => {
    try {
      toast.loading('Calculating rankings...', { id: 'ranking' })
      await api.post(`/api/ranking/calculate/${jobId}`)
      toast.success('Rankings calculated!', { id: 'ranking' })
      navigate(`/rankings/${jobId}`)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'No resumes found', { id: 'ranking' })
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Job Descriptions</h1>
          <p className="text-dark-400 mt-1">Create job postings and rank candidates</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-5 py-2.5 gradient-primary rounded-xl text-white font-medium text-sm hover:opacity-90 transition-all" id="add-job-button">
          <HiOutlinePlus className="w-4 h-4" /> New Job
        </button>
      </div>

      {/* Job Form */}
      {showForm && (
        <div className="glass rounded-2xl p-6 animate-fade-in">
          <h3 className="text-lg font-semibold text-dark-100 mb-4">Create Job Description</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Job Title *</label>
                <input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-dark-100 placeholder-dark-500 focus:outline-none focus:border-primary-500/50 transition-all" placeholder="Senior Python Developer" required id="job-title" />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Company</label>
                <input value={form.company} onChange={e => setForm(p => ({...p, company: e.target.value}))} className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-dark-100 placeholder-dark-500 focus:outline-none focus:border-primary-500/50 transition-all" placeholder="Acme Inc" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Description *</label>
              <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} rows={5} className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-dark-100 placeholder-dark-500 focus:outline-none focus:border-primary-500/50 transition-all resize-none" placeholder="Describe the role, responsibilities, and requirements..." required id="job-description" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Experience Level</label>
                <select value={form.experience_level} onChange={e => setForm(p => ({...p, experience_level: e.target.value}))} className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-dark-100 focus:outline-none focus:border-primary-500/50 transition-all">
                  <option value="junior">Junior</option>
                  <option value="mid">Mid-Level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Job Type</label>
                <select value={form.job_type} onChange={e => setForm(p => ({...p, job_type: e.target.value}))} className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-dark-100 focus:outline-none focus:border-primary-500/50 transition-all">
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="remote">Remote</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Location</label>
                <input value={form.location} onChange={e => setForm(p => ({...p, location: e.target.value}))} className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-dark-100 placeholder-dark-500 focus:outline-none focus:border-primary-500/50 transition-all" placeholder="Remote / City" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Required Skills (press Enter to add)</label>
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => addSkill(e, 'required')} className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-dark-100 placeholder-dark-500 focus:outline-none focus:border-primary-500/50 transition-all" placeholder="Type a skill and press Enter" />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.required_skills.map(s => (
                  <span key={s} className="flex items-center gap-1 px-2.5 py-1 bg-primary-600/20 text-primary-300 text-xs rounded-lg">
                    {s} <button type="button" onClick={() => removeSkill(s, 'required')}><HiOutlineXMark className="w-3.5 h-3.5" /></button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-1">Preferred Skills (press Enter to add)</label>
              <input value={prefSkillInput} onChange={e => setPrefSkillInput(e.target.value)} onKeyDown={e => addSkill(e, 'preferred')} className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-dark-100 placeholder-dark-500 focus:outline-none focus:border-primary-500/50 transition-all" placeholder="Type a skill and press Enter" />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.preferred_skills.map(s => (
                  <span key={s} className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600/20 text-emerald-300 text-xs rounded-lg">
                    {s} <button type="button" onClick={() => removeSkill(s, 'preferred')}><HiOutlineXMark className="w-3.5 h-3.5" /></button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting} className="px-6 py-2.5 gradient-primary rounded-xl text-white font-medium text-sm hover:opacity-90 transition-all disabled:opacity-50" id="submit-job">
                {submitting ? 'Creating...' : 'Create Job'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-dark-700 rounded-xl text-dark-300 font-medium text-sm hover:bg-dark-600 transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <HiOutlinePlus className="w-12 h-12 mx-auto text-dark-500 mb-3" />
            <p className="text-dark-400">No job descriptions yet. Create your first one!</p>
          </div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="glass rounded-2xl p-6 hover:border-primary-500/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-dark-100">{job.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    {job.company && <span className="text-sm text-dark-400">{job.company}</span>}
                    <span className="text-xs bg-dark-700 text-dark-300 px-2 py-0.5 rounded">{job.experience_level}</span>
                    <span className="text-xs bg-dark-700 text-dark-300 px-2 py-0.5 rounded">{job.job_type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => calculateRankings(job.id)} className="flex items-center gap-1.5 px-4 py-2 bg-primary-600/20 text-primary-400 rounded-xl text-sm font-medium hover:bg-primary-600/30 transition-all" id={`rank-job-${job.id}`}>
                    <HiOutlineChartBar className="w-4 h-4" /> Rank Candidates
                  </button>
                  <button onClick={() => deleteJob(job.id)} className="p-2 text-dark-400 hover:text-danger hover:bg-danger/10 rounded-xl transition-all">
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-dark-400 line-clamp-2 mb-3">{job.description}</p>
              {job.required_skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {job.required_skills.slice(0, 10).map(s => (
                    <span key={s} className="px-2 py-0.5 bg-primary-600/10 text-primary-400/80 text-xs rounded-md">{s}</span>
                  ))}
                  {job.required_skills.length > 10 && <span className="text-xs text-dark-500">+{job.required_skills.length - 10}</span>}
                </div>
              )}
              {job.total_candidates > 0 && (
                <p className="text-xs text-dark-500 mt-3">{job.total_candidates} candidates ranked</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
