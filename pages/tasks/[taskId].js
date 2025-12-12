import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head'

export default function TaskView() {
  const router = useRouter()
  const { taskId } = router.query
  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState(null)
  const [taskDisplayName, setTaskDisplayName] = useState('')

  useEffect(() => {
    if (!taskId) return

    // Fetch models for this task
    fetch(`/api/tasks/${taskId}`)
      .then(res => res.json())
      .then(data => {
        setModels(data.models || [])
        setTaskDisplayName(data.displayName || taskId)
        if (data.models && data.models.length > 0) {
          setSelectedModel(data.models[0])
        }
      })
      .catch(err => console.error('Error loading models:', err))
  }, [taskId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>{taskDisplayName} - Model Benchmark</title>
      </Head>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
            ← Back to Tasks
          </Link>
        </div>

        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {taskDisplayName}
          </h1>
          <p className="text-gray-600">
            Compare results from {models.length} model(s)
          </p>
        </header>

        {models.length === 0 ? (
          <div className="bg-white rounded-lg shadow-xl p-12 text-center">
            <p className="text-gray-500 text-lg">No models have submitted results yet.</p>
            <p className="text-gray-400 mt-2">
              Add your results to{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">
                public/tasks/{taskId}/[your-model-name]
              </code>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Model Selector Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-xl p-6 sticky top-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Models</h2>
                <div className="space-y-2">
                  {models.map((model) => (
                    <button
                      key={model}
                      onClick={() => setSelectedModel(model)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                        selectedModel === model
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Model Output Display */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="bg-indigo-600 text-white px-6 py-4">
                  <h2 className="text-2xl font-semibold">{selectedModel}</h2>
                </div>
                <div className="p-6">
                  {selectedModel ? (
                    <iframe
                      src={`/tasks/${taskId}/${selectedModel}/index.html`}
                      className="w-full border-2 border-gray-200 rounded-lg"
                      style={{ minHeight: '600px', height: '80vh' }}
                      title={`${selectedModel} results`}
                      onError={(e) => {
                        // If iframe fails, show a fallback
                        e.target.style.display = 'none'
                      }}
                    />
                  ) : null}
                  <div className="mt-4 text-sm text-gray-500">
                    <p>
                      <strong>Path:</strong>{' '}
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        /tasks/{taskId}/{selectedModel}/index.html
                      </code>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
