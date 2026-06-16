import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import { HiOutlineArrowLeft, HiOutlineDocumentText } from 'react-icons/hi2'

export default function CandidateDetailsPage() {
  const { resumeId } = useParams()
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchResume() }, [resumeId])

  const fetchResume = async () => {
    try {
      const res = await api.get(`/api/resumes/${resumeId}`)
      setResume(res.data)
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
  }

  if (!resume) {
    return <div className="glass rounded-2xl p-12 text-center"><p className="text-dark-400">Resume not found</p></div>
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-4">
        <Link to="/" className="p-2 rounded-xl bg-dark-800 text-dark-300 hover:text-dark-100 hover:bg-dark-700 transition-all">
          <HiOutlineArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-dark-100">{resume.candidate_name || 'Unknown Candidate'}</h1>
          <p className="text-dark-400 mt-1">{resume.filename}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Info */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-dark-100 mb-4">Profile</h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-dark-400">Name</p>
              <p className="text-sm text-dark-100">{resume.candidate_name || 'Unknown'}</p>
            </div>
            {resume.candidate_email && (
              <div>
                <p className="text-xs text-dark-400">Email</p>
                <p className="text-sm text-dark-100">{resume.candidate_email}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-dark-400">Category</p>
              <span className="inline-block mt-1 text-xs bg-primary-600/20 text-primary-400 px-2.5 py-1 rounded-lg">{resume.category || 'Uncategorized'}</span>
            </div>
            <div>
              <p className="text-xs text-dark-400">File Size</p>
              <p className="text-sm text-dark-100">{(resume.file_size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <h3 className="font-semibold text-dark-100 mb-4">Extracted Skills ({resume.extracted_skills?.length || 0})</h3>
          {resume.skill_categories && Object.keys(resume.skill_categories).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(resume.skill_categories).map(([category, skills]) => (
                <div key={category}>
                  <p className="text-xs font-medium text-dark-400 uppercase tracking-wider mb-2">
                    {category.replace(/_/g, ' ')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map(s => (
                      <span key={s} className="px-2.5 py-1 bg-primary-600/15 text-primary-300 text-xs rounded-lg border border-primary-500/15">{s}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(resume.extracted_skills || []).map(s => (
                <span key={s} className="px-2.5 py-1 bg-primary-600/15 text-primary-300 text-xs rounded-lg">{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Resume Text */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <HiOutlineDocumentText className="w-5 h-5 text-primary-400" />
          <h3 className="font-semibold text-dark-100">Extracted Text</h3>
        </div>
        <div className="glass-light rounded-xl p-4 max-h-96 overflow-y-auto">
          <pre className="text-sm text-dark-300 whitespace-pre-wrap font-sans leading-relaxed">
            {resume.raw_text || 'No text extracted'}
          </pre>
        </div>
      </div>
    </div>
  )
}
