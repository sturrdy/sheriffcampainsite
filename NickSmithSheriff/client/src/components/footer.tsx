import { Shield, Mail, Phone, Heart, Users, ClipboardList, Facebook, Twitter, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const newsletterSchema = z.object({
  email: z.string().email("Valid email is required"),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

export default function Footer() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
    },
  });

  const newsletterMutation = useMutation({
    mutationFn: (data: NewsletterFormData) => apiRequest("POST", "/api/newsletter", data),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Thank you for subscribing to our newsletter!",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/newsletter"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NewsletterFormData) => {
    newsletterMutation.mutate(data);
  };

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

  const quickLinks = [
    { label: "Home", id: "home" },
    { label: "About", id: "about" },
    { label: "Issues", id: "issues" },
    { label: "Endorsements", id: "endorsements" },
    { label: "Get Involved", id: "get-involved" },
    { label: "Voter Info", id: "voter-info" },
  ];

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Campaign Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-8 w-8 text-yellow-400" />
              <div>
                <div className="font-bold text-xl">Nick Smith</div>
                <div className="text-gray-400">for Walker County Sheriff</div>
              </div>
            </div>
            <p className="text-gray-300 mb-4 max-w-md leading-relaxed">
              Proven leadership for safer communities. Working together to build a better future for Walker County through innovative policing and community engagement.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-yellow-400" />
                <a href="mailto:info@nicksmithforsheriff.com" className="text-gray-300 hover:text-white transition-colors">
                  info@nicksmithforsheriff.com
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-yellow-400" />
                <a href="tel:205-555-1234" className="text-gray-300 hover:text-white transition-colors">
                  (205) 555-1234
                </a>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className="text-gray-300 hover:text-white transition-colors text-left"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Get Involved */}
          <div>
            <h3 className="font-bold text-lg mb-4">Get Involved</h3>
            <div className="space-y-3">
              <Button
                onClick={() => scrollToSection("get-involved")}
                className="w-full bg-crimson hover:bg-red-700 text-white justify-start"
              >
                <Heart className="mr-2 h-4 w-4" />
                Donate
              </Button>
              <Button
                onClick={() => scrollToSection("get-involved")}
                className="w-full bg-navy hover:bg-blue-800 text-white justify-start"
              >
                <Users className="mr-2 h-4 w-4" />
                Volunteer
              </Button>
              <Button
                onClick={() => scrollToSection("get-involved")}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 justify-start"
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                Yard Signs
              </Button>
            </div>
          </div>
        </div>
        
        {/* Newsletter Signup */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-4">Stay Updated</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Join our mailing list to receive campaign updates, event notifications, and volunteer opportunities.
            </p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          className="bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="bg-navy hover:bg-blue-800 text-white"
                  disabled={newsletterMutation.isPending}
                >
                  {newsletterMutation.isPending ? "Subscribing..." : "Subscribe"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
        
        {/* Legal and Copyright */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm mb-2">
                Paid for by the Committee to Re-elect Nick Smith for Walker County Sheriff
              </p>
              <p className="text-gray-500 text-sm">
                © 2025 Nick Smith for Walker County Sheriff. All Rights Reserved.
              </p>
            </div>
            
            {/* Social Media Links */}
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                <Instagram className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
