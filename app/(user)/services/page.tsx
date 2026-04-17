import { Metadata } from 'next';
import connectToDatabase from '@/lib/mongoose';
import { Service } from '@/models/Service';

export const metadata: Metadata = {
  title: 'Services | Ruthies Africa',
  description: 'Explore our professional styling and consultation services',
};

export default async function ServicesPage() {
  await connectToDatabase();
  const services = await Service.find({ isDeleted: { $ne: true } })
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="min-h-screen bg-light-bg">
      {/* Hero Section */}
      <section className="bg-linear-to-r from-primary to-secondary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold mb-6">
            Our Services
          </h1>
          <p className="text-xl text-neutral-100">
            Professional styling, consultation, and fashion designing services
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {services && services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(services as any[]).map((service) => (
                <div
                  key={service._id}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
                >
                  {/* Service Image */}
                  {service.image && (
                    <div className="h-48 bg-neutral-200 overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )}

                  {/* Service Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-primary mb-2">
                      {service.name}
                    </h3>

                    <p className="text-neutral-600 text-sm mb-4">
                      {service.shortDescription}
                    </p>

                    {/* Service Type Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                        {service.type}
                      </span>
                      {service.isAvailable ? (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          Available
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                          Unavailable
                        </span>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="mb-4 pb-4 border-b border-neutral-200">
                      <p className="text-sm text-neutral-600 mb-2">Starting from:</p>
                      <p className="text-2xl font-bold text-secondary">
                        ₦{service.prices?.NGN?.toLocaleString() || 'N/A'}
                      </p>
                    </div>

                    {/* Duration */}
                    <div className="mb-6">
                      <p className="text-sm text-neutral-600">
                        Duration: <span className="font-semibold">{service.duration} mins</span>
                      </p>
                    </div>

                    {/* Book Button */}
                    <button className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!service.isAvailable}>
                      {service.isAvailable ? 'Book Service' : 'Currently Unavailable'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-neutral-600 text-lg">No services available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Styled?</h2>
          <p className="text-lg mb-8 text-neutral-100 max-w-2xl mx-auto">
            Contact us to book a consultation or service. Our team of experts is ready to help you look and feel your best.
          </p>
          <button className="bg-secondary text-primary px-8 py-3 rounded-lg font-bold hover:bg-secondary/90 transition-colors">
            Contact Us
          </button>
        </div>
      </section>
    </div>
  );
}
