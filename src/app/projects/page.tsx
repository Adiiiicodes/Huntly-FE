'use client';

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BentoProjectCard from "@/components/ProjectCard";
import ParallaxBackground from "@/components/ParallaxBackground";
import "./bento.css";
import projects from "../data/projects.json";

const ProjectsPage = () => {
  const [category, setCategory] = useState("all");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  // Add animation effect after component mounts
  useEffect(() => {
    setIsLoaded(true);
    
    // Initialize scroll reveal animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    // Observe all project cards
    document.querySelectorAll('.project-card').forEach(card => {
      observer.observe(card);
    });
    
    return () => {
      document.querySelectorAll('.project-card').forEach(card => {
        if (observer) {
          observer.unobserve(card);
        }
      });
    };
  }, []);

  // Effect to handle category changes
  useEffect(() => {
    if (isLoaded) {
      setIsPageLoading(true);
      
      // Simulate loading delay when changing categories
      const timer = setTimeout(() => {
        setIsPageLoading(false);
      }, 300); // Reduced from 600ms to 300ms for better performance
      
      return () => clearTimeout(timer);
    }
  }, [category, isLoaded]);

  // Use the imported projects array everywhere you previously used the hardcoded one
  // Filter projects based on category
  const filteredProjects =
    category === "all"
      ? projects
      : projects.filter((project) => project.category.includes(category));

  // Animation variants - simplified for better performance
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  const fadeIn = {
    hidden: { opacity: 0 },
    show: { 
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  // Handle category filter click
  const handleCategoryChange = (newCategory: "all" | "Python" | "Web Development") => {
    if (newCategory === "all" || newCategory === "Python" || newCategory === "Web Development") {
      setCategory(newCategory);
    }
  };

  return (
    <div className={`${isPageLoading ? 'loading' : ''}`}>
      {/* Page transition loading bar */}
      <div className="page-transition-bar" />
      
      <main className="projects-page" ref={mainRef}>
        {/* Parallax background */}
        <ParallaxBackground />
        
        <div className="section-container">
          <motion.section 
            className="projects-introduction"
            initial="hidden"
            animate={isLoaded ? "show" : "hidden"}
            variants={fadeInUp}
          >
            <h1 className="page-title gradient-text">
              My Projects
            </h1>
            
            <p className="page-description">
              Here is a collection of projects I've worked on, showcasing my skills in Python and Web Development.
              Explore the bento grid below to discover my work.
            </p>
          </motion.section>

          <div className="projects-filters">
            <button 
              onClick={() => handleCategoryChange("all")} 
              className={`filter-button ${category === "all" ? "active" : ""}`}
            >
              All Projects
            </button>
            <button 
              onClick={() => handleCategoryChange("Python")} 
              className={`filter-button ${category === "Python" ? "active" : ""}`}
            >
              Python Projects
            </button>
            <button 
              onClick={() => handleCategoryChange("Web Development")} 
              className={`filter-button ${category === "Web Development" ? "active" : ""}`}
            >
              Web Development Projects
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.section 
              key={category}
              className="bento-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filteredProjects.map((project, index) => (
                <BentoProjectCard 
                  key={project.slug} 
                  project={{
                    ...project,
                    size: project.size as "small" | "medium" | "large"
                  }}
                  delay={Math.min(index * 0.03, 0.3)} // Cap the delay for better performance
                  index={index}
                />
              ))}
            </motion.section>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default ProjectsPage;