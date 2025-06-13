'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import {
  Form,
  FormControl ,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  FileText,
  Github,
  Linkedin,
  Globe,
  DollarSign,
} from 'lucide-react';

import { supabase } from '@/lib/supabase'; 
import type { NextPage } from 'next';

const candidateSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  age: z.string().min(1),
  location: z.string().min(2),
  title: z.string().min(2),
  experience: z.string().min(1),
  skills: z.string().min(2),
  availability: z.string().min(1),
  salary: z.string().min(1),
  education: z.string().min(2),
  summary: z.string().min(50),
  linkedin: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  portfolio: z.string().url().optional().or(z.literal('')),
  resume: z.string().min(1),
  remoteWork: z.boolean().default(false),
  relocation: z.boolean().default(false),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

type CandidateFormData = z.infer<typeof candidateSchema>;

const RegisterCandidate: NextPage = () => {
  const form = useForm<CandidateFormData>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      age: '',
      location: '',
      title: '',
      experience: '',
      skills: '',
      availability: 'Full-time',
      salary: '',
      education: '',
      summary: '',
      linkedin: '',
      github: '',
      portfolio: '',
      resume: '',
      remoteWork: false,
      relocation: false,
      terms: false,
    },
  });

  const onSubmit = async (data: CandidateFormData) => {
    console.log('Form Data:', data);

    try {
      const skillsArray = data.skills.split(',').map((s) => s.trim());

      const payload = {
        first_name: data.firstName,
        last_name: data.lastName,
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        age: parseInt(data.age),
        location: data.location,
        title: data.title,
        experience: data.experience,
        skills: skillsArray,
        availability: data.availability,
        salary: data.salary,
        education: data.education,
        summary: data.summary,
        linkedin: data.linkedin || null,
        github: data.github || null,
        portfolio: data.portfolio || null,
        resume: data.resume,
        remote_work: data.remoteWork,
        relocation: data.relocation,
        match_score: 0,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          `${data.firstName} ${data.lastName}`
        )}&background=random`,
        created_at: new Date().toISOString(),
      };

      const { data: insertedData, error } = await supabase
        .from('candidates')
        .insert([payload])
        .select();

      if (error) {
        console.error(error);
        alert(`Error: ${error.message}`);
        return;
      }

      alert('Successfully registered!');
      form.reset();
    } catch (err) {
      console.error(err);
      alert('Something went wrong!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Talent Network</h1>
          <p className="text-xl text-gray-600">
            Register as a candidate and get matched with your dream opportunities
          </p>
        </div>

        {!supabase && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-8 text-sm text-yellow-800">
            <strong>Notice:</strong> Supabase is not configured. Please check environment variables.
          </div>
        )}

       <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription>Tell us about yourself</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl  className='bg-white'>
                        <Input placeholder="John" {...field} />
                      </FormControl >
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl  className='bg-white'>
                        <Input placeholder="Doe" {...field} />
                      </FormControl >
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        <span>Email</span>
                      </FormLabel>
                      <FormControl  className='bg-white'>
                        <Input type="email" placeholder="john@example.com" {...field} />
                      </FormControl >
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-1">
                        <Phone className="w-4 h-4" />
                        <span>Phone</span>
                      </FormLabel>
                      <FormControl  className='bg-white'>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl >
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Age</span>
                      </FormLabel>
                      <FormControl className='bg-white'>
                        <Input type="number" placeholder="25" {...field} />
                      </FormControl >
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>Location</span>
                      </FormLabel>
                      <FormControl className='bg-white'>
                        <Input placeholder="Berlin, Germany" {...field} />
                      </FormControl >
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Professional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5" />
                  <span>Professional Information</span>
                </CardTitle>
                <CardDescription>Your professional background and expertise</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl className='bg-white'>
                          <Input placeholder="Senior Software Engineer" {...field} />
                        </FormControl >
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <FormControl className='bg-white' >
                          <Input placeholder="5 years" {...field} />
                        </FormControl >
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="availability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Availability</FormLabel>
                        <FormControl className='bg-white' >
                          <select {...field} className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md">
                            <option value="Full-time">Full-time</option>
                            <option value="Part-time">Part-time</option>
                            <option value="Contract">Contract</option>
                            <option value="Freelance">Freelance</option>
                          </select>
                        </FormControl >
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>Expected Salary</span>
                        </FormLabel>
                        <FormControl className='bg-white'>
                          <Input placeholder="€70,000 - €90,000" {...field} />
                        </FormControl >
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills (comma-separated)</FormLabel>
                      <FormControl className='bg-white' >
                        <Input placeholder="React, TypeScript, Node.js, Python, AWS" {...field} />
                      </FormControl >
                      <FormDescription>List your key technical and professional skills</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education</FormLabel>
                      <FormControl className='bg-white' >
                        <Input placeholder="MSc Computer Science, University of Berlin" {...field} />
                      </FormControl >
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Summary</FormLabel>
                      <FormControl className='bg-white'>
                        <textarea
                          className="w-full min-h-32 px-3 py-2 border border-input bg-background rounded-md resize-vertical"
                          placeholder="Tell us about your professional experience, achievements, and what makes you unique..."
                          {...field}
                        />
                      </FormControl >
                      <FormDescription>Minimum 50 characters</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Links & Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Links & Documents</span>
                </CardTitle>
                <CardDescription>Share your professional profiles and resume</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-1">
                          <Linkedin className="w-4 h-4" />
                          <span>LinkedIn Profile</span>
                        </FormLabel>
                        <FormControl className='bg-white'>
                          <Input placeholder="https://linkedin.com/in/johndoe" {...field} />
                        </FormControl >
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="github"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-1">
                          <Github className="w-4 h-4" />
                          <span>GitHub Profile</span>
                        </FormLabel>
                        <FormControl className='bg-white'>
                          <Input placeholder="https://github.com/johndoe" {...field} />
                        </FormControl >
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="portfolio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-1">
                          <Globe className="w-4 h-4" />
                          <span>Portfolio Website</span>
                        </FormLabel>
                        <FormControl className='bg-white'>
                          <Input placeholder="https://johndoe.dev" {...field} />
                        </FormControl >
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="resume"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resume/CV</FormLabel>
                        <FormControl className='bg-white'>
                          <Input type="file" accept=".pdf,.doc,.docx" {...field} />
                        </FormControl >
                        <FormDescription>Upload your resume (PDF, DOC, or DOCX)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Work Preferences</CardTitle>
                <CardDescription>Let us know your work preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="remoteWork"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl className='bg-white'>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl >
                      <div className="space-y-1 leading-none">
                        <FormLabel>Open to remote work</FormLabel>
                        <FormDescription>
                          I am interested in remote work opportunities
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="relocation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl className='bg-white'>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl >
                      <div className="space-y-1 leading-none">
                        <FormLabel>Open to relocation</FormLabel>
                        <FormDescription>
                          I am willing to relocate for the right opportunity
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl className='bg-white'>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl >
                      <div className="space-y-1 leading-none">
                        <FormLabel>Accept Terms & Conditions</FormLabel>
                        <FormDescription>
                          I agree to the terms and conditions and privacy policy
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" size="lg" className="px-8" disabled={!supabase}>
                Register as Candidate
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default RegisterCandidate;
