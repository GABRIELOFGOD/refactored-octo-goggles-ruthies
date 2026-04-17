import { Metadata } from 'next';
import connectToDatabase from '@/lib/mongoose';
import { SizeGuide } from '@/models/SizeGuide';

export const metadata: Metadata = {
  title: 'Size Guide | Ruthies Africa',
  description: 'Find your perfect fit with our detailed size guide',
};

export default async function SizeGuidePage() {
  await connectToDatabase();
  const guides = await SizeGuide.find({ isDeleted: { $ne: true } })
    .sort({ category: 1 })
    .lean();

  return (
    <div className="min-h-screen bg-light-bg">
      {/* Hero Section */}
      <section className="bg-linear-to-r from-primary to-secondary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-6">
            Size Guide
          </h1>
          <p className="text-xl text-neutral-100">
            Find your perfect fit with our comprehensive size guide
          </p>
        </div>
      </section>

      {/* Size Guide Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {guides && guides.length > 0 ? (
            <div className="space-y-12">
              {(guides as any[]).map((guide) => (
                <div key={guide._id} className="bg-white rounded-lg shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-primary mb-6 capitalize">
                    {guide.category} Size Guide
                  </h2>

                  {/* Size Chart */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-neutral-100 border-b-2 border-primary">
                          {guide.chart &&
                            Object.keys(guide.chart[0] || {}).map((key) => (
                              <th
                                key={key}
                                className="px-4 py-3 text-left font-semibold text-primary capitalize"
                              >
                                {key}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {guide.chart &&
                          (guide.chart as any[]).map((row, idx) => (
                            <tr
                              key={idx}
                              className={`border-b border-neutral-200 ${
                                idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50'
                              }`}
                            >
                              {Object.values(row).map((value, colIdx) => (
                                <td key={colIdx} className="px-4 py-3 text-neutral-700">
                                  {String(value)}
                                </td>
                              ))}
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Instructions */}
                  {guide.instructions && (
                    <div className="mt-8 p-6 bg-blue-50 border-l-4 border-blue-500 rounded">
                      <h3 className="font-bold text-blue-900 mb-2">How to Measure:</h3>
                      <p className="text-blue-800">{guide.instructions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-neutral-600 text-lg">Size guides coming soon!</p>
            </div>
          )}

          {/* General Tips */}
          <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-primary mb-6">General Sizing Tips</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <span className="shrink-0 w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center font-bold">
                  1
                </span>
                <p className="text-neutral-700">
                  Always measure yourself or the garment lying flat for accurate results
                </p>
              </li>
              <li className="flex items-start gap-4">
                <span className="shrink-0 w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center font-bold">
                  2
                </span>
                <p className="text-neutral-700">
                  Refer to our size guide before placing your order to ensure the best fit
                </p>
              </li>
              <li className="flex items-start gap-4">
                <span className="shrink-0 w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center font-bold">
                  3
                </span>
                <p className="text-neutral-700">
                  Different designers may have different sizing standards
                </p>
              </li>
              <li className="flex items-start gap-4">
                <span className="shrink-0 w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center font-bold">
                  4
                </span>
                <p className="text-neutral-700">
                  Contact our customer service for any sizing questions or concerns
                </p>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
