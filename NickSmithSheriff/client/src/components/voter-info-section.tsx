import { Calendar, MapPin, UserCheck, Book, Clock, HelpCircle, Phone, Globe, Mail, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VoterInfoSection() {
  const importantDates = [
    {
      label: "Last day to register to vote",
      description: "Make sure you're registered",
      date: "October 21, 2025",
      color: "border-l-primary",
    },
    {
      label: "Early voting begins",
      description: "Vote before Election Day",
      date: "October 27, 2025",
      color: "border-l-blue-500",
    },
    {
      label: "ELECTION DAY",
      description: "Polls: 7am - 7pm",
      date: "November 4, 2025",
      color: "border-l-crimson bg-crimson text-white",
    },
  ];

  const voterResources = [
    {
      icon: MapPin,
      title: "Find Your Polling Place",
      description: "Not sure where to vote? Check your assigned polling location.",
      buttonText: "Find Polling Place",
      color: "bg-crimson",
    },
    {
      icon: UserCheck,
      title: "Check Registration",
      description: "Verify you're registered to vote and your information is current.",
      buttonText: "Check Status",
      color: "bg-navy",
    },
    {
      icon: Book,
      title: "Complete Voter Guide",
      description: "Get detailed information on registration, ID requirements, and more.",
      buttonText: "Download Guide",
      color: "bg-green-600",
    },
    {
      icon: Calendar,
      title: "Important Dates",
      description: "Mark your calendar with key voting deadlines and dates.",
      buttonText: "Add to Calendar",
      color: "bg-yellow-500",
    },
  ];

  const electionDayTips = [
    {
      icon: Clock,
      title: "Voting Hours:",
      content: ["November 4, 2025", "7:00 AM - 7:00 PM", "If you're in line by 7:00 PM, you can still vote!"],
    },
    {
      icon: UserCheck,
      title: "Bring to the Polls:",
      content: ["Valid photo ID", "Voter registration card (if available)", "Patience (lines may be long)"],
    },
    {
      icon: HelpCircle,
      title: "Need Help?",
      content: ["Walker County Elections Office", "Alabama Voter Information", "Contact Our Campaign"],
    },
  ];

  return (
    <section id="voter-info" className="py-20 bg-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Voter Information
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know to participate in the Walker County Sheriff election.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {voterResources.map((resource, index) => {
            const IconComponent = resource.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md text-center">
                <div className={`${resource.color} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                  <IconComponent className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">{resource.title}</h3>
                <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                  {resource.description}
                </p>
                <Button className={`${resource.color} hover:opacity-90 text-white text-sm`}>
                  {resource.buttonText}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Important Dates */}
        <div className="bg-white rounded-xl p-8 shadow-md mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Calendar className="h-8 w-8 text-primary mr-3" />
            Important Dates
          </h3>
          <div className="space-y-6">
            {importantDates.map((date, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg border-l-4 ${
                  date.color.includes("crimson") 
                    ? "bg-crimson text-white border-l-red-700" 
                    : `bg-gray-50 ${date.color}`
                }`}
              >
                <div>
                  <p className={`font-semibold ${date.color.includes("crimson") ? "text-white" : "text-gray-900"}`}>
                    {date.label}
                  </p>
                  <p className={`text-sm ${date.color.includes("crimson") ? "text-red-100" : "text-gray-600"}`}>
                    {date.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${
                    date.color.includes("crimson") ? "text-white" : 
                    date.color.includes("primary") ? "text-primary" : "text-blue-500"
                  }`}>
                    {date.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Election Day Preparation */}
        <div className="bg-white rounded-xl p-8 shadow-md">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Vote?</h3>
            <p className="text-gray-600">
              Make sure you're prepared for Election Day with our complete checklist.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {electionDayTips.map((tip, index) => {
              const IconComponent = tip.icon;
              return (
                <div key={index}>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                    <IconComponent className="h-5 w-5 text-navy mr-2" />
                    {tip.title}
                  </h4>
                  <ul className="space-y-2">
                    {tip.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="text-gray-700 text-sm">
                        {itemIndex === 0 && tip.title.includes("Voting Hours") ? (
                          <div>
                            <div className="font-medium">{item}</div>
                            {itemIndex === 0 && (
                              <div className="text-2xl font-bold text-crimson">7:00 AM - 7:00 PM</div>
                            )}
                          </div>
                        ) : tip.title.includes("Bring to the Polls") ? (
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            {item}
                          </div>
                        ) : (
                          <div className="text-navy hover:text-blue-800 cursor-pointer transition-colors">
                            {item}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          
          <div className="text-center mt-8">
            <Button className="bg-navy hover:bg-blue-800 text-white px-8 py-4 text-lg">
              <Book className="mr-2 h-5 w-5" />
              Complete Voter Guide
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
