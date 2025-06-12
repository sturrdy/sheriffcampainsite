import { Star, Shield, Building, Flame, Flag, HandHeart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EndorsementsSection() {
  const testimonials = [
    {
      quote: "Sheriff Smith has transformed our department with innovative approaches to community policing and crime prevention.",
      author: "Chief Deputy John Williams",
      title: "Walker County Sheriff's Office",
    },
    {
      quote: "As a local business owner, I've seen firsthand how Sheriff Smith's leadership has made our downtown safer for customers and residents.",
      author: "Sarah Johnson",
      title: "Jasper Business Association President",
    },
    {
      quote: "Nick Smith understands that preventing crime starts with reaching our youth. His school programs have made a real difference.",
      author: "Dr. Michael Thomas",
      title: "Walker County School Superintendent",
    },
  ];

  const endorsements = [
    { icon: Shield, name: "Walker County Deputies Association", color: "text-navy" },
    { icon: Star, name: "Alabama Sheriff's Association", color: "text-navy" },
    { icon: Flame, name: "Walker County Firefighters", color: "text-crimson" },
    { icon: Building, name: "Jasper Business Alliance", color: "text-navy" },
    { icon: Flag, name: "Walker County Republican Committee", color: "text-crimson" },
    { icon: HandHeart, name: "Community Safety Coalition", color: "text-navy" },
  ];

  return (
    <section id="endorsements" className="py-20 bg-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Endorsements & Support
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Trusted by community leaders, law enforcement professionals, and organizations across Walker County.
          </p>
        </div>
        
        {/* Testimonials */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400 text-xl">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-4 italic leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div className="border-t pt-4">
                <div className="font-semibold text-gray-900">{testimonial.author}</div>
                <div className="text-sm text-gray-600">{testimonial.title}</div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Organizational Endorsements */}
        <div className="bg-white rounded-xl p-8 shadow-md">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Proudly Endorsed By:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {endorsements.map((endorsement, index) => {
              const IconComponent = endorsement.icon;
              return (
                <div key={index} className="flex items-center space-x-3">
                  <IconComponent className={`h-6 w-6 ${endorsement.color}`} />
                  <span className="text-gray-700 font-medium">{endorsement.name}</span>
                </div>
              );
            })}
          </div>
          
          <div className="text-center mt-8">
            <Button variant="ghost" className="text-navy hover:text-blue-800 p-0">
              View All Endorsements
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
