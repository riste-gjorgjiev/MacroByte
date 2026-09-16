'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface OnboardingLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showSkip?: boolean;
  onNext?: () => void;
  onSkip?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
}

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  title,
  subtitle,
  showBack = true,
  showSkip = false,
  onNext,
  onSkip,
  nextDisabled = false,
  nextLabel = 'NEXT',
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center justify-between">
            {showBack ? (
              <Link href="/onboarding" className="text-foreground hover:opacity-70">
                <ArrowLeft className="h-6 w-6" />
              </Link>
            ) : (
              <div className="w-6" />
            )}
            <Link href="/" className="text-2xl font-bold text-foreground">
              MacroByte
            </Link>
            <div className="w-6" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-card border-b">
        <div className="container mx-auto max-w-2xl px-4 py-3">
          <div className="text-center text-sm text-muted-foreground mb-2">
            STEP {currentStep}
          </div>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i < currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto max-w-2xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground text-lg">{subtitle}</p>
          )}
        </div>

        <div className="mb-8">
          {children}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="border-t bg-card p-4">
        <div className="container mx-auto max-w-2xl space-y-2">
          {onNext && (
            <button
              onClick={onNext}
              disabled={nextDisabled}
              className={`w-full py-4 rounded-full font-semibold text-lg transition-colors ${
                nextDisabled
                  ? 'bg-muted text-muted-foreground cursor-not-allowed'
                  : 'bg-foreground text-background hover:opacity-90'
              }`}
            >
              {nextLabel}
            </button>
          )}
          {showSkip && onSkip && (
            <button
              onClick={onSkip}
              className="w-full py-3 text-foreground font-medium hover:opacity-70"
            >
              SKIP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
