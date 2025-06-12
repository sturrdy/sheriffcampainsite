import { Heart, Users, Vote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import heroImagePath from "@assets/image_1748553455740.png";

export default function HeroSection() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <section id="home" className="relative bg-navy text-white pt-16">
      {/* Background overlay */}
      <div className="absolute inset-0 hero-overlay"></div>
      
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: `url('${heroImagePath}')`
        }}
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center lg:text-left lg:flex lg:items-center lg:justify-between">
          <div className="lg:w-2/3">
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">
              <span className="block">Nick Smith for</span>
              <span className="block text-yellow-400">Walker County Sheriff</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-6 text-blue-100 font-semibold">
              Proven Leadership. Safer Communities.
            </p>
            <p className="text-lg mb-8 text-blue-200 max-w-2xl leading-relaxed">
              As your Sheriff since 2018, I've worked tirelessly to make Walker County safer through community policing, innovative programs, and dedicated service. Together, we can continue building a better future.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                onClick={() => scrollToSection("get-involved")}
                className="bg-crimson hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all"
              >
                <Heart className="mr-2 h-5 w-5" />
                Donate
              </Button>
              <Button
                onClick={() => scrollToSection("get-involved")}
                variant="secondary"
                className="bg-white hover:bg-gray-100 text-navy px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all"
              >
                <Users className="mr-2 h-5 w-5" />
                Volunteer
              </Button>
              <Button
                onClick={() => scrollToSection("voter-info")}
                variant="secondary"
                className="bg-white hover:bg-gray-100 text-navy px-8 py-4 text-lg font-semibold transform hover:scale-105 transition-all"
              >
                <Vote className="mr-2 h-5 w-5" />
                Election Info
              </Button>
            </div>
          </div>
          
          <div className="lg:w-1/3 mt-12 lg:mt-0 flex justify-center">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 text-center">
              <Shield className="h-24 w-24 text-yellow-400 mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-2">Election Day</h3>
              <p className="text-2xl font-bold text-yellow-400">November 4, 2025</p>
              <p className="text-sm text-blue-200 mt-2">7:00 AM - 7:00 PM</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
