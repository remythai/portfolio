'use client'
import { JSX, useState } from "react";

export const ContactFormSection = (): JSX.Element => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error' | '', message: string }>({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', message: 'Message envoyé avec succès! Je vous répondrai bientôt.' });
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        setStatus({ type: 'error', message: data.error || 'Erreur lors de l\'envoi du message.' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Erreur réseau. Veuillez réessayer.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section 
      id="contact"
      className="relative w-full min-h-screen py-12 md:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      style={{
        background: 'radial-gradient(50% 50% at 50% 50%, rgba(26, 21, 21, 0.00) 0%, rgba(1, 1, 1, 0.16) 100%), #FFF'
      }}
    >
      <div className="w-full flex justify-center mb-12 md:mb-16">
        <div className="relative border-4 md:border-8 border-solid border-black px-8 md:px-12 py-4 md:py-6">
          <h2 className="font-montserrat font-bold text-black text-2xl sm:text-3xl md:text-4xl text-center tracking-[8px] md:tracking-[10.66px]">
            CONTACT
          </h2>
        </div>
      </div>

      <p className="max-w-2xl mx-auto font-open-sans font-normal text-black text-sm sm:text-base md:text-[15px] text-center leading-relaxed px-4 mb-12 md:mb-16">
        Le plaisir serait pour moi de pouvoir échanger avec vous !
      </p>

      {status.message && (
        <div className={`max-w-2xl mx-auto mb-6 p-4 rounded ${status.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 md:space-y-12">
        <div className="relative">
          <div className="flex items-start border-l-4 border-b-4 border-black pl-4 pb-2">
            <label htmlFor="name" className="sr-only">Entrez votre nom</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="ENTREZ VOTRE NOM*"
              className="w-full bg-transparent border-none outline-none font-montserrat font-bold text-gray-500 text-xs sm:text-sm tracking-[0.56px] placeholder:text-gray-400 focus:text-black transition-colors py-2"
            />
          </div>
        </div>

        <div className="relative">
          <div className="flex items-start border-l-4 border-b-4 border-black pl-4 pb-2">
            <label htmlFor="email" className="sr-only">Entrez votre email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="ENTREZ VOTRE EMAIL*"
              className="w-full bg-transparent border-none outline-none font-montserrat font-bold text-gray-500 text-xs sm:text-sm tracking-[0.56px] placeholder:text-gray-400 focus:text-black transition-colors py-2"
            />
          </div>
        </div>

        <div className="relative">
          <div className="flex items-start border-l-4 border-b-4 border-black pl-4 pb-2">
            <label htmlFor="phone" className="sr-only">Numéro de téléphone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="NUMERO DE TELEPHONE"
              className="w-full bg-transparent border-none outline-none font-montserrat font-bold text-gray-500 text-xs sm:text-sm tracking-[0.56px] placeholder:text-gray-400 focus:text-black transition-colors py-2"
            />
          </div>
        </div>

        <div className="relative">
          <div className="flex items-start border-l-4 border-b-4 border-black pl-4 pb-2">
            <label htmlFor="message" className="sr-only">Votre message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              placeholder="VOTRE MESSAGE*"
              rows={6}
              className="w-full bg-transparent border-none outline-none resize-none font-montserrat font-bold text-gray-500 text-xs sm:text-sm tracking-[0.56px] placeholder:text-gray-400 focus:text-black transition-colors py-2"
            />
          </div>
        </div>

        <div className="relative flex justify-center md:justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto min-w-[200px] px-8 py-3 border-l-2 border-r-2 border-black font-montserrat font-bold text-black text-sm sm:text-base text-center tracking-[1.60px] bg-transparent hover:bg-black hover:text-white transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'ENVOI...' : 'SOUMETTRE'}
          </button>
        </div>
      </form>
    </section>
  );
};
