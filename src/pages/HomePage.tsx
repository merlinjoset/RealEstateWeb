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
