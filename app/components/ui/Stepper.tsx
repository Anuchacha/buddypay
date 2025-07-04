import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ฟังก์ชันช่วยสำหรับการรวม class names
function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export interface StepProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  isCompleted?: boolean;
}

interface StepperProps {
  steps: StepProps[];
  activeStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export function Stepper({ steps, activeStep, onStepClick, className }: StepperProps) {
  return (
    <div className={cn("w-full py-4", className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;
          const isLast = index === steps.length - 1;
          
          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center">
                <div 
                  onClick={() => onStepClick && onStepClick(index)}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium border-2 transition-colors duration-200",
                    isActive 
                      ? "border-primary bg-primary text-white" 
                      : isCompleted 
                      ? "border-primary bg-primary/10 text-primary cursor-pointer"
                      : "border-gray-300 bg-white text-gray-500",
                    onStepClick && "cursor-pointer"
                  )}
                >
                  {step.icon || (isCompleted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  ))}
                </div>
                <div className="text-center mt-2">
                  <p className={cn(
                    "text-sm font-medium",
                    isActive ? "text-primary" : isCompleted ? "text-primary/80" : "text-gray-500"
                  )}>
                    {step.title}
                  </p>
                  {step.description && (
                    <p className="text-xs text-gray-500 mt-1 max-w-[120px] hidden sm:block">{step.description}</p>
                  )}
                </div>
              </div>
              
              {!isLast && (
                <div className={cn(
                  "flex-1 h-0.5 mx-2",
                  isCompleted ? "bg-primary" : "bg-gray-200"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
} 