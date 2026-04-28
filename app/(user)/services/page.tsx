import { Metadata } from 'next';
import ServiceGrid from '@/components/ServiceGrid';

export const metadata: Metadata = {
  title: 'Services | Ruthies Africa',
  description: 'Explore our professional styling and consultation services',
};

export default function ServicesPage() {

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
      <ServiceGrid />

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
