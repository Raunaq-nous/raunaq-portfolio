import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700">
      <nav className="bg-black/30 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-white text-2xl font-bold">Raunaq</h1>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-white text-center mb-20">
          <h1 className="text-6xl font-bold mb-4">Hi, I'm Raunaq</h1>
          <p className="text-xl text-blue-100 mb-8">Full Stack Developer | Open Source Enthusiast</p>
          <div className="flex gap-4 justify-center">
            <a href="https://github.com/Raunaq-nous" className="bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-blue-100">
              GitHub
            </a>
            <a href="#projects" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
              Projects
            </a>
          </div>
        </div>

        {/* Projects Section */}
        <div id="projects" className="mb-20">
          <h2 className="text-4xl font-bold text-white mb-12">Featured Projects</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur p-8 rounded-lg text-white">
              <h3 className="text-2xl font-bold mb-4">Auto-Check</h3>
              <p className="text-blue-100 mb-4">Intelligent presentation deck analysis and auto-correction system</p>
              <a href="#" className="text-blue-300 hover:text-blue-100">View Project →</a>
            </div>
            <div className="bg-white/10 backdrop-blur p-8 rounded-lg text-white">
              <h3 className="text-2xl font-bold mb-4">Portfolio</h3>
              <p className="text-blue-100 mb-4">Personal portfolio showcasing my work and projects</p>
              <a href="#" className="text-blue-300 hover:text-blue-100">View Project →</a>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white/10 backdrop-blur p-8 rounded-lg text-white mb-20">
          <h2 className="text-3xl font-bold mb-4">About Me</h2>
          <p className="text-blue-100 leading-relaxed">
            I'm a passionate developer with experience in building full-stack applications. 
            I love working with React, TypeScript, and modern web technologies. 
            Currently exploring AI-powered tools and their applications.
          </p>
        </div>

        {/* Contact Section */}
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-8">Get In Touch</h2>
          <div className="flex gap-4 justify-center">
            <a href="https://github.com/Raunaq-nous" className="hover:text-blue-300">GitHub</a>
            <span className="text-blue-300">•</span>
            <a href="mailto:contact@example.com" className="hover:text-blue-300">Email</a>
            <span className="text-blue-300">•</span>
            <a href="#" className="hover:text-blue-300">LinkedIn</a>
          </div>
        </div>
      </main>

      <footer className="bg-black/50 text-center text-blue-200 py-8 mt-20">
        <p>© 2026 Raunaq. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
