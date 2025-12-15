import { Hand, ScanLine, Brain, FileCheck, LucideIcon } from "lucide-react";
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Step {
  icon: LucideIcon;
  number: string;
  title: string;
  description: string;
  color: string;
}

const HowItWorks: React.FC = () => {
  const { t } = useLanguage();

  const steps: Step[] = [
    {
      icon: Hand,
      number: "01",
      title: t("howItWorks.collectSamples.title"),
      description: t("howItWorks.collectSamples.description"),
      color: "bg-primary",
    },
    {
      icon: ScanLine,
      number: "02",
      title: t("howItWorks.sensorAnalysis.title"),
      description: t("howItWorks.sensorAnalysis.description"),
      color: "bg-blue-500",
    },
    {
      icon: Brain,
      number: "03",
      title: t("howItWorks.aiProcessing.title"),
      description: t("howItWorks.aiProcessing.description"),
      color: "bg-accent",
    },
    {
      icon: FileCheck,
      number: "04",
      title: t("howItWorks.fertilizerPlan.title"),
      description: t("howItWorks.fertilizerPlan.description"),
      color: "bg-purple-500",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="py-12 md:py-20 bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-bold text-2xl md:text-3xl lg:text-4xl text-gray-900 mb-4 animate-fade-in">
            {t("howItWorks.title")}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in">
            {t("howItWorks.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Connection line - hidden on mobile, visible on large screens */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full transform translate-x-4 z-0">
                  {/* Layered line with depth */}
                  <div className="relative h-2 flex items-center">
                    {/* Outer glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-grass-200 to-transparent blur-md opacity-40"></div>
                    {/* Main gradient line */}
                    <div className="absolute inset-0 h-0.5 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-gray-300 via-grass-500 to-gray-300"></div>
                  </div>

                  {/* Animated arrow dot */}
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                    {/* Glow effect */}
                    <div className="absolute -inset-2 bg-grass-400 rounded-full blur-sm opacity-50 animate-pulse"></div>
                    {/* Dot with gradient */}
                    <div className="relative w-2 h-2 bg-gradient-to-br from-grass-400 to-grass-600 rounded-full shadow-md"></div>
                    {/* Ping animation */}
                    <div className="absolute -inset-1 bg-grass-400 rounded-full opacity-30 animate-ping"></div>
                    {/* Small arrow */}
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-0.5">
                      <div className="w-0 h-0 border-t-2 border-t-transparent border-b-2 border-b-transparent border-l-3 border-l-grass-500"></div>
                    </div>
                  </div>
                </div>
              )}

              <div
                className="relative z-10 text-center group-hover:scale-105 transition-transform duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.3}s` }}
              >
                {/* Icon */}
                <div
                  className={`inline-flex p-4 md:p-6 rounded-2xl ${step.color} text-white mb-4 md:mb-6 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                >
                  {React.createElement(step.icon, {
                    className: "h-6 w-6 md:h-8 md:w-8",
                  })}
                </div>

                {/* Step number */}
                <div className="text-sm font-bold text-gray-400 mb-2">
                  {t("howItWorks.step")} {step.number}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-lg md:text-xl text-gray-900 mb-3 md:mb-4">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
