import { aboutChurch, aboutChurch2 } from '../assets/images'
import { ObjectivesAccordion } from '../components/ObjectivesAccordion';
import TakeNextStepSection from '../components/TakeNextStepSection';
import Footer from '../components/Footer';
import OptimizedImage from '../components/OptimizedImage';
import { RESPONSIVE_SIZES } from '../config/imageConfig';

const About = () => {
  return (
    <>
      <section className="w-full bg-white py-12 md:py-20">
        <div className="max-w-6xl mx-auto pt-8 md:pt-12 px-2 sm:px-4 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: Text */}
          <div className="space-y-6 md:space-y-8 text-center md:text-left">
            {/* Main Heading */}
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-black leading-tight">
              About Us
            </h2>
            {/* Description */}
            <p className="text-base sm:text-lg md:text-xl text-black leading-relaxed max-w-2xl mx-auto md:mx-0">
              New Creature in Christ Church (NCCC) was established in 1998 in obedience to God's leading under the visionary leadership of Reverend Roseline Adeyinka Obaaro (1948 – 2011) with the aim of propagating the gospel of our Lord and Saviour, Jesus Christ. Having a Vision to reconcile the world to Christ, our Mission is to build a people with a consciousness of their new nature in Christ and reach out to people in need.
            </p>
          </div>
          {/* Right: Image */}
          <div className="flex justify-center md:justify-end">
            <div className="w-full max-w-xs sm:max-w-md aspect-[4/5] rounded-2xl shadow-xl overflow-hidden">
              <OptimizedImage
                src={aboutChurch}
                alt="About New Creature in Christ Church"
                className="w-full h-full object-cover"
                sizes={RESPONSIVE_SIZES.card}
                priority={true}
              />
            </div>
          </div>
        </div>
      </section>
      {/* Narrative Section (Inverted) */}
      <section className="w-full bg-white py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left: Image */}
          <div className="flex justify-center md:justify-start order-2 md:order-1">
            <div className="w-full max-w-xs sm:max-w-md aspect-[5/4] rounded-2xl shadow-xl overflow-hidden">
              <OptimizedImage
                src={aboutChurch2}
                alt="About New Creature in Christ Church"
                className="w-full h-full object-cover"
                sizes={RESPONSIVE_SIZES.card}
              />
            </div>
          </div>
          {/* Right: Text */}
          <div className="space-y-6 md:space-y-8 text-center md:text-left order-1 md:order-2">
            <h3 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-black leading-tight">
              Our Story
            </h3>
            <p className="text-base sm:text-lg md:text-xl text-black leading-relaxed max-w-2xl mx-auto md:mx-0">
              From humble beginnings in 1998, our church has grown into a vibrant community of believers dedicated to spreading the love of Christ. We continue to build on the foundation laid by our visionary leader, reaching out to families and individuals in our community and beyond.
            </p>
          </div>
        </div>
      </section>
      {/* Objectives Section */}
      <section className="w-full bg-gray-50 py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
          <div className="text-center space-y-8 mb-12">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-black leading-tight">
              Our Objectives
            </h2>
            <p className="text-base md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              We are committed to fulfilling our mission through these core objectives.
            </p>
          </div>
          <ObjectivesAccordion />
        </div>
      </section>
      <TakeNextStepSection />
      <Footer />
    </>
  );
};

export default About;