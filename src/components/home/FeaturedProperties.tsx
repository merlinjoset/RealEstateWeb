import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import PropertyCard from '../properties/PropertyCard'
import type { Property } from '../../types'

const MOCK_PROPERTIES: Property[] = [
  {
    id: 1, title: '15 Cents Prime Land - Nagercoil', description: 'Prime location near main road',
    totalPrice: 2250000, pricePerCent: 150000, address: 'Kottar', city: 'Nagercoil',
    district: 'Kanyakumari', state: 'Tamil Nadu', pinCode: '629001',
    areaInCents: 15, propertyType: 'open_land', status: 'for_sale',
    images: [], features: [], agentId: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01',
    isFeatured: true, isVerified: true, roadAccess: true,
  },
  {
    id: 2, title: '10 Cents Land with 3BHK House - Marthandam', description: 'Ready to occupy',
    totalPrice: 4500000, pricePerCent: 450000, address: 'Town Area', city: 'Marthandam',
    district: 'Kanyakumari', state: 'Tamil Nadu', pinCode: '629165',
    areaInCents: 10, bedrooms: 3, bathrooms: 2, propertyType: 'land_with_building', status: 'for_sale',
    images: [], features: [], agentId: 1, createdAt: '2024-01-02', updatedAt: '2024-01-02',
    isFeatured: true, isVerified: true, roadAccess: true,
  },
  {
    id: 3, title: '50 Cents Agricultural Land - Thuckalay', description: 'Fertile land with water source',
    totalPrice: 3500000, pricePerCent: 70000, address: 'Pechipparai Road', city: 'Thuckalay',
    district: 'Kanyakumari', state: 'Tamil Nadu', pinCode: '629175',
    areaInCents: 50, propertyType: 'agricultural', status: 'for_sale',
    images: [], features: [], agentId: 1, createdAt: '2024-01-03', updatedAt: '2024-01-03',
    isFeatured: false, isVerified: true, roadAccess: false,
  },
  {
    id: 4, title: '8 Cents Residential Plot - Kanyakumari', description: 'Sea-view plot near beach',
    totalPrice: 1600000, pricePerCent: 200000, address: 'Beach Road', city: 'Kanyakumari',
    district: 'Kanyakumari', state: 'Tamil Nadu', pinCode: '629702',
    areaInCents: 8, propertyType: 'residential_plot', status: 'for_sale',
    images: [], features: [], agentId: 1, createdAt: '2024-01-04', updatedAt: '2024-01-04',
    isFeatured: true, isVerified: false, roadAccess: true,
  },
]

export default function FeaturedProperties() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
            <p className="text-gray-500 mt-1">Hand-picked land listings in Kanyakumari district</p>
          </div>
          <Link
            to="/properties"
            className="hidden sm:flex items-center gap-1 font-semibold hover:gap-2 transition-all"
            style={{ color: '#FF5A5F' }}
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_PROPERTIES.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>

        <div className="sm:hidden mt-6 text-center">
          <Link to="/properties" className="btn-primary inline-flex">
            View all properties <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
