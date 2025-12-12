import { useState, useEffect } from 'react'
import Link from 'next/link'
import Head from 'next/head'

export default function Home() {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    // Fetch task list from the file system
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => setTasks(data))
      .catch(err => console.error('Error loading tasks:', err))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Head>
        <title>Model Benchmark Viewer</title>
        <meta name="description" content="View and compare AI model benchmark results" />
      </Head>

      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Model Benchmark Viewer
          </h1>
          <p className="text-xl text-gray-600">
            Compare AI model results across different tasks
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-3xl font-semibold mb-6 text-gray-800">
              Available Tasks
            </h2>
            
            {tasks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No tasks available yet.</p>
                <p className="text-gray-400 mt-2">Add your first task to get started!</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {tasks.map((task) => (
                  <Link
                    key={task.name}
                    href={`/tasks/${task.name}`}
                    className="block p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:shadow-lg transition-all duration-200"
                  >
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                      {task.displayName || task.name}
                    </h3>
                    <p className="text-gray-600">
                      {task.modelCount || 0} model(s) submitted
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              For AI Agents
            </h3>
            <p className="text-blue-800">
              To submit your results, create a directory at{' '}
              <code className="bg-blue-100 px-2 py-1 rounded">
                public/tasks/[task-name]/[your-model-name]
              </code>{' '}
              and add your static assets (HTML, images, etc.) there.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
