'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mic, FileAudio, Brain, Clock, CheckCircle } from 'lucide-react'

export default function Home() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-blue-900 text-white">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Mic className="w-8 h-8 text-blue-400" />
          <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">MeetingMind</span>
        </div>
        <nav>
          <Link href="/dashboard" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-full transition duration-300">
            Try It Now
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4">
        <section className="py-20 text-center">
          <motion.h1
            className="text-5xl md:text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600"
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
          >
            Transform Your Meetings with AI
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl mb-12 text-blue-200"
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Capture, analyze, and act on your meeting insights effortlessly
          </motion.p>
          <motion.div
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/dashboard" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300">
              Get Started
            </Link>
          </motion.div>
        </section>

        <section className="py-20">
          <h2 className="text-3xl font-bold mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: FileAudio, title: "Upload Audio", description: "Simply upload your meeting recording" },
              { icon: Brain, title: "AI Analysis", description: "Our AI processes and extracts key information" },
              { icon: CheckCircle, title: "Get Insights", description: "Review tasks, decisions, and action items" }
            ].map((step, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-black to-blue-800 p-6 rounded-lg text-center border border-blue-500"
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.2 * index }}
              >
                <step.icon className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                <h3 className="text-xl font-semibold mb-2 text-blue-200">{step.title}</h3>
                <p className="text-blue-300">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="py-20">
          <h2 className="text-3xl font-bold mb-12 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Benefits</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { title: "Save Time", description: "Automatically extract key information from your meetings" },
              { title: "Increase Productivity", description: "Focus on action items and decisions, not note-taking" },
              { title: "Never Miss a Detail", description: "Capture every important point with AI-powered analysis" },
              { title: "Easy Collaboration", description: "Share meeting insights with your team effortlessly" }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-gradient-to-br from-black to-blue-800 p-6 rounded-lg border border-blue-500"
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.2 * index }}
              >
                <h3 className="text-xl font-semibold mb-2 text-blue-200">{benefit.title}</h3>
                <p className="text-blue-300">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="bg-black py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-blue-300">
          <p>&copy; 2024 MeetingMind. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}