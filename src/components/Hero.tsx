'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaSearch, 
  FaRocket, 
  FaGithub, 
  FaLinkedin,
  FaCode,
  FaMapMarkerAlt,
  FaBriefcase,
  FaLightbulb
} from 'react-icons/fa'
import RegisterButton from './RegisterButton'
const Hero = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [currentExample, setCurrentExample] = useState(0)
  const router = useRouter()

  const exampleQueries = [
    'blockchain expert with RAG experience in Europe',
    'senior React developer with Web3 skills in Berlin',
    'ML engineer with computer vision background',
    'full stack developer with DeFi experience',
    'DevOps engineer with Kubernetes expertise'
  ]

  const stats = [
    { label: 'Profiles Indexed', value: '50K+', icon: FaCode },
    { label: 'Daily Updates', value: '1000+', icon: FaRocket },
    { label: 'Countries', value: '120+', icon: FaMapMarkerAlt },
    { label: 'Success Rate', value: '94%', icon: FaLightbulb }
  ]

  const filteredSuggestions = searchQuery
    ? exampleQueries.filter(q =>
        q.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExample((prev) => (prev + 1) % exampleQueries.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/results?query=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleExampleClick = (query: string) => {
    router.push(`/results?query=${encodeURIComponent(query)}`)
  }

  return (
    <section className="min-h-screen relative overflow-hidden">
     {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0" style={{ background: "#e0e2e4" }} />
        <motion.div
          className="absolute top-20 -left-20 w-96 h-96 rounded-full filter blur-3xl"
          style={{ backgroundColor: "rgba(101, 100, 105, 0.55)" }}
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 -right-20 w-96 h-96 rounded-full filter blur-3xl"
          style={{ backgroundColor: "rgba(101, 100, 105, 0.55)" }}
          animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity }}
        />
      </div>


      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Logo/Brand */}
          <motion.div 
            className="flex items-center justify-center gap-3 mb-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <FaSearch className="text-white text-xl" />
            </div>
            <h1 className="text-4xl font-bold">Hunt<span className="text-accent">Ly</span></h1>
          </motion.div>

          {/* Tagline */}
          <motion.h2 
            className="text-5xl md:text-6xl font-bold mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Find the <span className="gradient-text">Perfect Talent</span>
          </motion.h2>
          
          <motion.p 
            className="text-xl font-semibold text-[#242229]/70 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            AI-powered search engine to discover professionals by skills, experience, and location. 
            Built for recruiters, founders, and teams.
          </motion.p>

          {/* Search Bar */}
          <motion.form 
            onSubmit={handleSearch}
            className="relative max-w-4xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className={`relative group ${isSearchFocused ? 'scale-105' : ''} transition-transform duration-200`}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="Try: blockchain expert with RAG experience in Europe"
                className="search-input pl-14 pr-32 py-6 text-lg shadow-2xl"
              />
              <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-foreground/40 text-xl" />
              <button
                type="submit"
                className="absolute right-4 top-1/2 -translate-y-1/2 btn-primary rounded-full search-btn"
              >
                Search
                <FaRocket />
              </button>
            </div>

            {/* Dropdown Suggestions */}
{isSearchFocused && filteredSuggestions.length > 0 && (
  <ul className="absolute z-10 w-full mt-2 border rounded-md shadow-lg backdrop-blur-sm bg-[#242229]">
    {filteredSuggestions.map((suggestion, idx) => (
      <li
        key={idx}
        onMouseDown={() => handleExampleClick(suggestion)}
        className="px-4 py-2 cursor-pointer transition-colors duration-150 rounded-md text-white hover:bg-[#656469]"
      >
        {suggestion}
      </li>
    ))}
  </ul>
)}

            {/* Live search indicator */}
            <AnimatePresence>
              {isSearchFocused && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 text-sm text-accent"
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    AI-powered search across 50,000+ profiles
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>

          {/* Example queries */}
          <motion.div 
            className="max-w-4xl mx-auto mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p className="text-md text-secondary mb-4">Popular searches:</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {exampleQueries.map((query, index) => (
                <motion.button
                  key={query}
                  onClick={() => handleExampleClick(query)}
                  className="search-suggestion"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {query}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="glass-effect rounded-xl p-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 + index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <stat.icon className="text-secondary text-2xl mx-auto mb-2" />
                <div className="text-2xl font-bold text-secondary">{stat.value}</div>
                <div className="text-sm text-/60">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          
{/* CTA */}
<motion.div
  className="mt-16 flex flex-col items-center justify-center gap-8"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 2 }}
>
  {/* Catchy Banner */}
  <motion.div 
    className="glass-effect rounded-xl px-8 py-4 max-w-xl text-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 2.1 }}
    whileHover={{ scale: 1.03 }}
  >
    <h3 className="text-xl font-bold mb-1 gradient-text">List Your Profile Today!</h3>
    <p className="text-secondary">Showcase your skills and get discovered by top companies worldwide</p>
  </motion.div>

  {/* Register Button - Centered */}
  <div className="flex justify-center">
    <RegisterButton />
  </div>

  
  <div className="flex items-center justify-center gap-6 text-sm text-accent/60">
    <span>Powered by</span>
    <FaGithub className="text-xl" />
    <FaLinkedin className="text-xl" />
    <FaBriefcase className="text-xl" />
    <span>and more...</span>
  </div>
</motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default Hero
