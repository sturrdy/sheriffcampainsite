import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import familyPhotoPath from "@assets/tab-and-nick-family-pics213_orig.jpg";

export default function AboutSection() {
  const achievements = [
    "12% reduction in violent crime since 2018",
    "Established Youth Outreach Program",
    "Modernized department technology",
    "Increased deputy training by 40%",
    "Launched mental health response unit",
  ];

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
    <section id="about" className="py-20 bg-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            About Sheriff Nick Smith
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Dedicated to public service and protecting the citizens of Walker County with over 20 years in law enforcement.
          </p>
        </div>
        
        <div className="lg:flex lg:items-center lg:space-x-12">
          <div className="lg:w-1/2 mb-8 lg:mb-0">
            <img 
              src={familyPhotoPath}
              alt="Sheriff Nick Smith with his family" 
              className="rounded-xl shadow-lg w-full h-auto"
            />
          </div>
          
          <div className="lg:w-1/2">
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Sheriff Nick Smith has dedicated his life to public service and protecting the citizens of Walker County. With over 20 years in law enforcement and as your Sheriff since 2018, Nick has implemented innovative programs and modern policing techniques that have significantly reduced crime while building stronger community relationships.
            </p>
            
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Born and raised in Walker County, Nick is deeply committed to the community he serves. He lives in Jasper with his wife and four children, and understands firsthand the importance of keeping our neighborhoods safe.
            </p>
            
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-xl font-bold text-navy mb-4">Key Achievements:</h3>
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6">
              <Button
                onClick={() => scrollToSection("issues")}
                variant="ghost"
                className="text-navy hover:text-blue-800 p-0 h-auto"
              >
                Learn More About Nick's Vision
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
