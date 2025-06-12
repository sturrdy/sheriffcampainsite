import { Users, Ban, GraduationCap, UserPlus, Heart, Brain, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function IssuesSection() {
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

  const issues = [
    {
      icon: Users,
      title: "Community Policing",
      description: "Building trust between law enforcement and residents through neighborhood engagement, transparency, and accessible deputies.",
      color: "bg-navy",
    },
    {
      icon: Ban,
      title: "Fighting Drug Crime",
      description: "Targeting dealers while connecting users with treatment options, utilizing specialized task forces and community partnerships.",
      color: "bg-crimson",
    },
    {
      icon: GraduationCap,
      title: "Deputy Training & Equipment",
      description: "Ensuring officers have the best training and resources to respond effectively while maintaining the highest standards of conduct.",
      color: "bg-green-600",
    },
    {
      icon: UserPlus,
      title: "Youth Outreach",
      description: "Preventing crime through school programs, mentorship initiatives, and building positive relationships with young people.",
      color: "bg-yellow-500",
    },
    {
      icon: Heart,
      title: "Victim Support",
      description: "Providing compassionate assistance to crime victims with dedicated advocates and improved follow-up services.",
      color: "bg-purple-600",
    },
    {
      icon: Brain,
      title: "Mental Health Response",
      description: "Specialized crisis intervention teams trained to handle mental health emergencies with compassion and professionalism.",
      color: "bg-blue-600",
    },
  ];

  return (
    <section id="issues" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Key Issues & Vision
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sheriff Nick Smith is committed to addressing the most pressing public safety challenges in Walker County with proven strategies and innovative approaches.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {issues.map((issue, index) => {
            const IconComponent = issue.icon;
            return (
              <div key={index} className="bg-light-gray rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="text-center mb-4">
                  <div className={`${issue.color} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{issue.title}</h3>
                </div>
                <p className="text-gray-700 text-center leading-relaxed">
                  {issue.description}
                </p>
              </div>
            );
          })}
        </div>
        
        <div className="text-center mt-12">
          <Button
            onClick={() => scrollToSection("get-involved")}
            className="bg-navy hover:bg-blue-800 text-white px-8 py-4 text-lg font-semibold"
          >
            Get Involved
          </Button>
        </div>
      </div>
    </section>
  );
}
