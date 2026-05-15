import SEO from '../components/common/SEO'
import HeroSection from '../components/home/HeroSection'
import StatsSection from '../components/home/StatsSection'
import BuyerLineBanner from '../components/home/BuyerLineBanner'
import FeaturedProperties from '../components/home/FeaturedProperties'
import LocationSection from '../components/home/LocationSection'
import WhyChooseUs from '../components/home/WhyChooseUs'
import VideoTestimonials from '../components/home/VideoTestimonials'
import CallToAction from '../components/home/CallToAction'

export default function HomePage() {
  return (
    <main>
      <SEO
        path="/"
        description="Buy or sell land in Kanyakumari district — Nagercoil, Marthandam, Thuckalay, Colachel. Verified plots, free doorstep consultation, zero brokerage for buyers."
      />
      <HeroSection />
      <StatsSection />
      <BuyerLineBanner />
      <FeaturedProperties />
      <LocationSection />
      <WhyChooseUs />
      <VideoTestimonials />
      <CallToAction />
    </main>
  )
}
