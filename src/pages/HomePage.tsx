import SEO from '../components/common/SEO'
import HeroSection from '../components/home/HeroSection'
import StatsSection from '../components/home/StatsSection'
import BuyerLineBanner from '../components/home/BuyerLineBanner'
import RentalBanner from '../components/home/RentalBanner'
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
        keywords="Land for sale in Kanyakumari, Real estate agency Kanyakumari, Top 10 Real Estate Companies in Kanyakumari, Best Real Estate Company in Kanyakumari, Real Estate Agency in Kanyakumari, plots for sale Nagercoil, buy land Marthandam, land in Tamil Nadu, Kanyakumari real estate"
        description="Buy or sell land in Kanyakumari district — Nagercoil, Marthandam, Thuckalay, Colachel. Verified plots, free doorstep consultation, zero brokerage for buyers."
      />
      <HeroSection />
      <StatsSection />
      <BuyerLineBanner />
      <FeaturedProperties />
      <RentalBanner />
      <LocationSection />
      <WhyChooseUs />
      <VideoTestimonials />
      <CallToAction />
    </main>
  )
}
