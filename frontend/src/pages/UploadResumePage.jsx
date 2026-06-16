import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import api from '../services/api'
import toast from 'react-hot-toast'
import { HiOutlineCloudArrowUp, HiOutlineDocumentText, HiOutlineXMark, HiOutlineCheckCircle } from 'react-icons/hi2'

export default function UploadResumePage() {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState([])

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      name: file.name,
      size: (file.size / 1024).toFixed(1),
      status: 'pending',
    }))
    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxSize: 10 * 1024 * 1024,
  })

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadAll = async () => {
    if (files.length === 0) return
    setUploading(true)
    const uploadResults = []

    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      if (f.status === 'done') continue

      setFiles((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: 'uploading' } : item))
      )

      try {
        const formData = new FormData()
        formData.append('file', f.file)
        const res = await api.post('/api/resumes/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        setFiles((prev) =>
          prev.map((item, idx) => (idx === i ? { ...item, status: 'done' } : item))
        )
        uploadResults.push(res.data.resume)
      } catch (err) {
        setFiles((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: 'error', error: err.response?.data?.detail || 'Failed' } : item
          )
        )
      }
    }

    setResults(uploadResults)
    setUploading(false)
    if (uploadResults.length > 0) {
      toast.success(`${uploadResults.length} resume(s) processed successfully!`)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-dark-100">Upload Resumes</h1>
        <p className="text-dark-400 mt-1">Upload PDF or DOCX resumes for AI-powered analysis</p>
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`glass rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 border-2 border-dashed ${
          isDragActive
            ? 'border-primary-500 bg-primary-600/10'
            : 'border-dark-600 hover:border-primary-500/50 hover:bg-dark-800/30'
        }`}
        id="resume-dropzone"
      >
        <input {...getInputProps()} />
        <HiOutlineCloudArrowUp className={`w-16 h-16 mx-auto mb-4 ${isDragActive ? 'text-primary-400' : 'text-dark-500'}`} />
        {isDragActive ? (
          <p className="text-lg font-medium text-primary-400">Drop resumes here...</p>
        ) : (
          <>
            <p className="text-lg font-medium text-dark-200">Drag & drop resumes here</p>
            <p className="text-sm text-dark-400 mt-2">or click to browse • PDF, DOCX up to 10MB</p>
          </>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-dark-100">{files.length} file(s) selected</h3>
            <button
              onClick={uploadAll}
              disabled={uploading}
              className="px-5 py-2 gradient-primary rounded-xl text-white font-medium text-sm hover:opacity-90 transition-all disabled:opacity-50"
              id="upload-button"
            >
              {uploading ? 'Processing...' : 'Upload & Analyze All'}
            </button>
          </div>

          <div className="space-y-2">
            {files.map((f, i) => (
              <div key={i} className="flex items-center justify-between glass-light rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <HiOutlineDocumentText className="w-5 h-5 text-primary-400" />
                  <div>
                    <p className="text-sm font-medium text-dark-100">{f.name}</p>
                    <p className="text-xs text-dark-400">{f.size} KB</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {f.status === 'uploading' && (
                    <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  )}
                  {f.status === 'done' && <HiOutlineCheckCircle className="w-5 h-5 text-success" />}
                  {f.status === 'error' && (
                    <span className="text-xs text-danger">{f.error}</span>
                  )}
                  {f.status === 'pending' && (
                    <button onClick={() => removeFile(i)} className="text-dark-400 hover:text-danger transition-colors">
                      <HiOutlineXMark className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-dark-100 mb-4">Processed Resumes</h3>
          <div className="space-y-4">
            {results.map((r) => (
              <div key={r.id} className="glass-light rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-dark-100">{r.candidate_name || 'Unknown'}</p>
                    <p className="text-xs text-dark-400">{r.original_filename}</p>
                  </div>
                  {r.category && (
                    <span className="text-xs bg-primary-600/20 text-primary-400 px-2.5 py-1 rounded-lg">
                      {r.category}
                    </span>
                  )}
                </div>
                {r.extracted_skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {r.extracted_skills.slice(0, 15).map((skill) => (
                      <span key={skill} className="px-2 py-0.5 bg-dark-700/50 text-dark-300 text-xs rounded-md">
                        {skill}
                      </span>
                    ))}
                    {r.extracted_skills.length > 15 && (
                      <span className="text-xs text-dark-400">+{r.extracted_skills.length - 15} more</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
