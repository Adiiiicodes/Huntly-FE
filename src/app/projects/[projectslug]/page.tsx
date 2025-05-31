'use client';

import { notFound, useRouter } from "next/navigation";
import { FaGithub, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { use } from "react";
import projects from "../../data/projects.json";
import "./project-detail-page.css";

interface Project {
  name: string;
  category: string[];
  description: string;
  fullDescription?: string;
  repoLink: string;
  thumbnail: string;
  technologies: string[];
  slug: string;
}

interface Section {
  title: string;
  content: string[];
}

export default function ProjectDetailPage({ params }: { params: Promise<{ projectslug: string }> }) {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Properly unwrap params with React.use()
  const { projectslug } = use(params);
  
  // Find the project with matching slug
  const project = projects.find((proj: Project) => proj.slug === projectslug);

  // If project not found, return 404
  if (!project) {
    notFound();
  }

  // Set loaded state after component mounts
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Split the full description into paragraphs for better rendering
  const descriptionParagraphs = project.fullDescription 
    ? project.fullDescription.split('\n\n') 
    : [project.description];

  // Extract section titles and content from description
  const sections: Section[] = [];
  let currentSection: Section = { title: 'Overview', content: [] };
  
  descriptionParagraphs.forEach((paragraph: string) => {
    if (paragraph.startsWith('### ')) {
      // Save previous section if it has content
      if (currentSection.content.length > 0) {
        sections.push({ ...currentSection });
      }
      // Start new section
      currentSection = { 
        title: paragraph.substring(4).trim(), 
        content: [] 
      };
    } else {
      currentSection.content.push(paragraph);
    }
  });
  
  // Add the last section
  if (currentSection.content.length > 0) {
    sections.push(currentSection);
  }

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  return (
    <main className="project-detail-page min-h-screen py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <motion.button
          className="back-button mb-8 flex items-center text-primary hover:text-accent transition-colors"
          onClick={() => router.push('/projects')}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0, transition: { duration: 0.4 } }}
        >
          <FaArrowLeft className="mr-2" /> Back to Projects
        </motion.button>

        <div className="project-container">
          <motion.div
            className="project-header"
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            variants={fadeIn}
          >
            {/* Project thumbnail */}
            <div className="project-thumbnail-container">
              <div className="project-thumbnail-bg"></div>
              <img
                src={project.thumbnail !== './pdfu.jpg' ? project.thumbnail : '/placeholder-project.jpg'}
                alt={project.name}
                className="project-thumbnail"
              />
            </div>

            {/* Project title and basic info */}
            <div className="project-intro">
              <h1 className="project-title">{project.name}</h1>
              
              <div className="project-categories">
                {project.category.map((cat, index) => (
                  <span key={index} className="project-category">
                    {cat}
                  </span>
                ))}
              </div>

              <p className="project-brief">
                {project.description}
              </p>

              <div className="project-links">
                <a
                  href={project.repoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="github-button"
                >
                  <FaGithub className="mr-2" /> View on GitHub
                </a>
              </div>
            </div>
          </motion.div>

          {/* Technologies section */}
          <motion.div 
            className="project-techs"
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.6 } } : {}}
          >
            <h2 className="section-title">Technologies Used</h2>
            <div className="tech-tags">
              {project.technologies.map((tech, index) => (
                <motion.span
                  key={index}
                  className="tech-tag"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isLoaded ? { 
                    opacity: 1, 
                    scale: 1,
                    transition: { delay: 0.4 + (index * 0.05), duration: 0.4 } 
                  } : {}}
                >
                  {tech}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Project content sections */}
          <motion.div
            className="project-content"
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            {sections.map((section, sectionIndex) => (
              <motion.div
                key={sectionIndex}
                className="content-section"
                variants={fadeIn}
                custom={sectionIndex}
              >
                <h2 className="section-title">{section.title}</h2>
                {section.content.map((paragraph, paraIndex) => (
                  <p key={paraIndex} className="section-paragraph">
                    {paragraph}
                  </p>
                ))}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </main>
  );
}