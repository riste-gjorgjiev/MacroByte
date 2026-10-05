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
  backHref?: string;
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
  backHref = '/onboarding',
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-2xl px-4 py-4">
          <div className="flex items-center justify-between">
            {showBack ? (
              <Link href={backHref} className="text-gray-700 hover:text-gray-900">
                <ArrowLeft className="h-6 w-6" />
              </Link>
            ) : (
              <div className="w-6" />
            )}
            <Link href="/" className="text-2xl font-bold text-gray-900">
              MacroByte
            </Link>
            <div className="w-6" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="text-center text-sm text-gray-500 mb-2">
            STEP {currentStep}
          </div>
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i < currentStep ? 'bg-gray-900' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 mx-auto max-w-2xl px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-gray-500 text-lg">{subtitle}</p>
          )}
        </div>

        <div className="mb-8">
          {children}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="mx-auto max-w-2xl space-y-2">
          {onNext && (
            <button
              onClick={onNext}
              disabled={nextDisabled}
              className={`w-full py-4 rounded-full font-semibold text-lg transition-colors ${
                nextDisabled
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {nextLabel}
            </button>
          )}
          {showSkip && onSkip && (
            <button
              onClick={onSkip}
              className="w-full py-3 text-gray-700 font-medium hover:text-gray-900"
            >
              SKIP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
