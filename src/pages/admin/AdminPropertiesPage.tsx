import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Edit2, Trash2, Eye, Star, StarOff } from 'lucide-react'
import type { Property } from '../../types'

function formatLakhs(amount: number) {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`
  return `₹${amount.toLocaleString('en-IN')}`
}

const MOCK: Property[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  title: ['15 Cents Prime Land - Nagercoil', '10 Cents + 3BHK - Marthandam', '50 Cents Farm - Thuckalay',
          '8 Cents Plot - Kanyakumari', '20 Cents Open Land - Colachel', '5 Cents Corner Plot - Padmanabhapuram',
          '30 Cents Agricultural - Boothapandi', '12 Cents Plot - Nagercoil', '25 Cents Land - Eraniel', '7 Cents Plot - Kanyakumari'][i],
  description: '', totalPrice: [2250000, 4500000, 3500000, 1600000, 2800000, 750000, 4200000, 1800000, 3750000, 1400000][i],
  pricePerCent: [150000, 450000, 70000, 200000, 140000, 150000, 140000, 150000, 150000, 200000][i],
  address: '', city: ['Nagercoil', 'Marthandam', 'Thuckalay', 'Kanyakumari', 'Colachel', 'Padmanabhapuram', 'Boothapandi', 'Nagercoil', 'Eraniel', 'Kanyakumari'][i],
  district: 'Kanyakumari', state: 'Tamil Nadu', pinCode: '629001',
  areaInCents: [15, 10, 50, 8, 20, 5, 30, 12, 25, 7][i],
  propertyType: (['open_land', 'land_with_building', 'agricultural', 'residential_plot', 'open_land', 'residential_plot', 'agricultural', 'open_land', 'open_land', 'residential_plot'] as Property['propertyType'][])[i],
  status: 'for_sale',
  images: [], features: [], agentId: 1,
  createdAt: '2024-01-01', updatedAt: '2024-01-01',
  isFeatured: i < 3, isVerified: i % 2 === 0, roadAccess: i % 3 !== 2,
}))

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState(MOCK)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  const toggleFeatured = (id: number) =>
    setProperties((prev) => prev.map((p) => p.id === id ? { ...p, isFeatured: !p.isFeatured } : p))

  const confirmDelete = (id: number) => {
    setProperties((prev) => prev.filter((p) => p.id !== id))
    setDeleteId(null)
  }

  const filtered = properties.filter(
    (p) => !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">All Properties</h2>
          <p className="text-sm text-gray-500 mt-0.5">{properties.length} total listings</p>
        </div>
        <Link
          to="/admin/add-property"
          className="flex items-center gap-2 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-colors"
          style={{ backgroundColor: '#6A9739' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#547a2d')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#6A9739')}
        >
          <Plus className="w-4 h-4" /> Add Property
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 max-w-sm">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search properties..."
              className="bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400 w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Property</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase hidden sm:table-cell">City</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase hidden md:table-cell">Area</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Price</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase hidden lg:table-cell">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-500 text-xs uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 line-clamp-1 max-w-xs">{p.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{p.propertyType.replace('_', ' ')}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{p.city}</td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{p.areaInCents} cents</td>
                  <td className="px-4 py-3 font-semibold" style={{ color: '#FF5A5F' }}>{formatLakhs(p.totalPrice)}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5">
                      {p.isVerified && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Verified</span>
                      )}
                      {p.isFeatured && (
                        <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full">Featured</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/properties/${p.id}`}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => toggleFeatured(p.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          p.isFeatured ? 'text-yellow-500 hover:bg-yellow-50' : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                        }`}
                        title={p.isFeatured ? 'Remove featured' : 'Mark as featured'}
                      >
                        {p.isFeatured ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
                      </button>
                      <Link
                        to={`/admin/edit-property/${p.id}`}
                        className="p-1.5 text-gray-400 hover:text-[#6A9739] hover:bg-[rgba(106,151,57,0.08)] rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-10 text-gray-400">No properties found.</div>
          )}
        </div>
      </div>

      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-900 text-lg mb-2">Delete Property?</h3>
            <p className="text-gray-500 text-sm mb-5">
              This action cannot be undone. The property will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 btn-ghost border border-gray-200">
                Cancel
              </button>
              <button
                onClick={() => confirmDelete(deleteId)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
