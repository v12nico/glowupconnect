import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import SaleBanner from '../components/SaleBanner'
import ResultsBar from '../components/ResultsBar'
import TiersSection from '../components/TiersSection'
import TestimonialsSection from '../components/TestimonialsSection'
import InPersonSection from '../components/InPersonSection'
import ProductsSection from '../components/ProductsSection'
import FAQSection from '../components/FAQSection'
import ContactSection from '../components/ContactSection'
import Footer from '../components/Footer'

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <SaleBanner />
      <ResultsBar />
      <TiersSection />
      <TestimonialsSection />
      <InPersonSection />
      <ProductsSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </div>
  )
}
