"use client";

import { useService } from "@/hooks/use-service";
import { useEffect, useState } from "react";
import { ServiceBookingModal } from "./ServiceBookingModal";
import { IService } from "@/types";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatPrice, t } from "@/lib/i18n";

const ServiceGrid = ({ length }: { length?: number }) => {
  const [services, setServices] = useState<IService[]>([]);
  const [selectedService, setSelectedService] = useState<IService | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { getServices, loading } = useService();
  const { language } = useLanguage();
  const { currency } = useCurrency();

  useEffect(() => {
    const fetchServices = async () => {
      const data = await getServices();
      setServices(data || []);
    };

    fetchServices();
  }, []);
  
  const handleBookClick = (service: IService) => {
    setSelectedService(service);
    setIsBookingModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsBookingModalOpen(false);
    setSelectedService(null);
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-neutral-600 text-lg">{t(language, 'common.loading')}</p>
      </div>
    );
  }

  return (
    <>
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {services && services.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.slice(0, length).map((service) => (
                <div
                  key={service._id}
                  className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden flex flex-col"
                >
                  {/* Service Image */}
                  {service.image && (
                    <div className="h-48 bg-neutral-200 overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  {/* Service Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold text-primary mb-2">
                      {service.name}
                    </h3>

                    <p className="text-neutral-600 text-sm mb-4 flex-1">
                      {service.shortDescription}
                    </p>

                    {/* Service Type Badge */}
                    <div className="flex items-center gap-2 mb-4 flex-wrap">
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full capitalize">
                        {service.type}
                      </span>
                      {service.isAvailable ? (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          ✓ {t(language, 'services.available')}
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                          ✗ {t(language, 'services.unavailable')}
                        </span>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="mb-4 pb-4 border-b border-neutral-200">
                      <p className="text-sm text-neutral-600 mb-2">
                        {service.prices.NGN > 0 || service.prices.USD > 0
                          ? t(language, 'common.search') + ':'
                          : t(language, 'shop.inStock')}
                      </p>
                      {service.prices.NGN > 0 || service.prices.USD > 0 ? (
                        <p className="text-2xl font-bold text-secondary">
                          {formatPrice(service.prices[currency as keyof typeof service.prices], currency) || 'Free'}
                        </p>
                      ) : (
                        <p className="text-2xl font-bold text-green-600">
                          {t(language, 'account.profile')}
                        </p>
                      )}
                    </div>

                    {/* Duration */}
                    <div className="mb-6">
                      <p className="text-sm text-neutral-600">
                        {t(language, 'services.duration')}: <span className="font-semibold">{service.duration} {t(language, 'services.minutes')}</span>
                      </p>
                    </div>

                    {/* Book Button */}
                    <button
                      onClick={() => handleBookClick(service)}
                      disabled={!service.isAvailable}
                      className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {service.isAvailable
                        ? t(language, 'services.bookService')
                        : t(language, 'shop.outOfStock')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-neutral-600 text-lg">{t(language, 'common.noResults')}</p>
            </div>
          )}
        </div>
      </section>

      {/* Booking Modal */}
      <ServiceBookingModal
        isOpen={isBookingModalOpen}
        service={selectedService}
        onClose={handleCloseModal}
        onSuccess={() => {
          // Optionally refresh services or show confirmation
          setIsBookingModalOpen(false);
        }}
      />
    </>
  );
};

export default ServiceGrid;