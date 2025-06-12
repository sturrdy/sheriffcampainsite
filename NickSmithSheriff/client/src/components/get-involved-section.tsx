import { Heart, Users, ClipboardList, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DonationForm from "./donation-form";

const volunteerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  interests: z.array(z.string()).min(1, "Please select at least one interest"),
});

const yardSignSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  quantity: z.number().min(1).default(1),
});

type VolunteerFormData = z.infer<typeof volunteerSchema>;
type YardSignFormData = z.infer<typeof yardSignSchema>;

export default function GetInvolvedSection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const volunteerForm = useForm<VolunteerFormData>({
    resolver: zodResolver(volunteerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      interests: [],
    },
  });

  const yardSignForm = useForm<YardSignFormData>({
    resolver: zodResolver(yardSignSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      quantity: 1,
    },
  });

  const volunteerMutation = useMutation({
    mutationFn: (data: VolunteerFormData) => apiRequest("POST", "/api/volunteers", data),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Thank you for volunteering! We'll contact you soon.",
      });
      volunteerForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/volunteers"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const yardSignMutation = useMutation({
    mutationFn: (data: YardSignFormData) => apiRequest("POST", "/api/yard-sign-requests", data),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your yard sign request has been submitted! We'll contact you to arrange delivery.",
      });
      yardSignForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/yard-sign-requests"] });
    },
    onError: (error: any) => {
      console.error("Yard sign submission error:", error);
      toast({
        title: "Error",
        description: error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onVolunteerSubmit = (data: VolunteerFormData) => {
    volunteerMutation.mutate(data);
  };

  const onYardSignSubmit = (data: YardSignFormData) => {
    yardSignMutation.mutate(data);
  };

  const volunteerInterests = [
    "Phone Banking",
    "Door-to-Door Canvassing", 
    "Event Support",
    "Social Media",
    "Data Entry",
  ];

  return (
    <section id="get-involved" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Get Involved
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            There are many ways to support Sheriff Nick Smith's campaign for re-election. Join our team and help keep Walker County safe!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Donate */}
          <div className="bg-light-gray rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
            <div className="bg-crimson rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Heart className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Donate</h3>
            <p className="text-gray-700 mb-6">
              Your financial support helps fund our campaign operations, advertising, and community events.
            </p>
            <DonationForm />
          </div>

          {/* Volunteer */}
          <div className="bg-light-gray rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
            <div className="bg-navy rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Volunteer</h3>
            <p className="text-gray-700 mb-6">
              Join our team by phone banking, canvassing neighborhoods, or helping at campaign events.
            </p>

            <Form {...volunteerForm}>
              <form onSubmit={volunteerForm.handleSubmit(onVolunteerSubmit)} className="space-y-4 text-left">
                <FormField
                  control={volunteerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Full Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={volunteerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="email" placeholder="Email Address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={volunteerForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="tel" placeholder="Phone Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={volunteerForm.control}
                  name="interests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How would you like to help?</FormLabel>
                      <div className="space-y-2">
                        {volunteerInterests.map((interest) => (
                          <label key={interest} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={field.value?.includes(interest)}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                const currentInterests = field.value || [];
                                if (checked) {
                                  field.onChange([...currentInterests, interest]);
                                } else {
                                  field.onChange(currentInterests.filter((item) => item !== interest));
                                }
                              }}
                              className="rounded border-gray-300 text-navy focus:ring-navy"
                            />
                            <span className="text-sm text-gray-700">{interest}</span>
                          </label>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-navy hover:bg-blue-800 text-white"
                  disabled={volunteerMutation.isPending}
                >
                  {volunteerMutation.isPending ? "Submitting..." : "Sign Up to Volunteer"}
                </Button>
              </form>
            </Form>
          </div>

          {/* Yard Sign */}
          <div className="bg-light-gray rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
            <div className="bg-green-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <ClipboardList className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Request a Yard Sign</h3>
            <p className="text-gray-700 mb-6">
              Show your support with a yard sign for your home or business in Walker County.
            </p>

            <Form {...yardSignForm}>
              <form onSubmit={yardSignForm.handleSubmit(onYardSignSubmit)} className="space-y-4 text-left">
                <FormField
                  control={yardSignForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Full Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={yardSignForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="email" placeholder="Email Address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={yardSignForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="tel" placeholder="Phone Number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={yardSignForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea placeholder="Installation Address" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={yardSignForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of signs needed</FormLabel>
                      <Select value={field.value?.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 sign</SelectItem>
                          <SelectItem value="2">2 signs</SelectItem>
                          <SelectItem value="3">3 signs</SelectItem>
                          <SelectItem value="4">4+ signs</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={yardSignMutation.isPending}
                >
                  {yardSignMutation.isPending ? "Submitting..." : "Request Yard Sign"}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        {/* Contact Campaign Section */}
        <div className="bg-navy rounded-xl p-8 mt-12 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Have Questions About Getting Involved?</h3>
          <p className="text-blue-200 mb-6">Our campaign team is here to help you find the best way to support Sheriff Nick Smith.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" className="bg-white text-navy hover:bg-gray-100">
              <Mail className="mr-2 h-5 w-5" />
              info@nicksmithforsheriff.com
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-navy">
              <Phone className="mr-2 h-5 w-5" />
              (205) 555-1234
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}