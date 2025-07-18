import Index from '@/pages/Index'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import TopCandidate from '@/components/TopCandidates'

export default function Home() {
  return (
    <>
      <Header />
      <main className='bg-white'>
        <Index />
        <TopCandidate />
      </main>
      <Footer />
    </>
  )
}
