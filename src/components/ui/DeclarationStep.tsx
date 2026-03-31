"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";

const DEFAULT_DECLARATION_INTRO =
  'Please read these terms and conditions ("terms and conditions", "terms") carefully before using [website URL] website ("website", "service") operated by [company name] ("us", "we", "our").';

const DEFAULT_DECLARATION_SECTIONS = [
  {
    heading: "Conditions of use",
    body: "By using this website, you certify that you have read and reviewed this Agreement and that you agree to comply with its terms. If you do not want to be bound by the terms of this Agreement, you are advised to stop using the website accordingly. [company name] only grants use and access of this website, its products, and its services to those who have accepted its terms.",
  },
  {
    heading: "Privacy policy",
    body: "Before you continue using our website, we advise you to read our privacy policy [link to privacy policy] regarding our user data collection. It will help you better understand our practices.",
  },
  {
    heading: "Age restriction",
    body: "You must be at least 18 (eighteen) years of age before you can use this website. By using this website, you warrant that you are at least 18 years of age and you may legally adhere to this Agreement. [company name] assumes no responsibility for liabilities related to age misrepresentation.",
  },
  {
    heading: "Intellectual property",
    body: "You agree that all materials, products, and services provided on this website are the property of [company name], its affiliates, directors, officers, employees, agents, suppliers, or licensors including all copyrights, trade secrets, trademarks, patents, and other intellectual property. You also agree that you will not reproduce or redistribute the [company name]'s intellectual property in any way, including electronic, digital, or new trademark registrations.",
  },
  {
    heading: "Applicable law",
    body: "By using this website, you agree that the laws of the [your location], without regard to principles of conflict laws, will govern these terms and conditions, or any dispute of any sort that might come between [company name] and you, or its business partners and associates.",
  },
  {
    heading: "Disputes",
    body: "Any dispute related in any way to your use of this website or to products you purchase from us shall be arbitrated by state or federal court [your location] and you consent to exclusive jurisdiction and venue of such courts.",
  },
  {
    heading: "Indemnification",
    body: "You agree to indemnify [company name] and its affiliates and hold [company name] harmless against legal claims and demands that may arise from your use or misuse of our services. We reserve the right to select our own legal counsel.",
  },
  {
    heading: "Limitation on liability",
    body: "[company name] is not liable for any damages that may occur to you as a result of your misuse of our website. [company name] reserves the right to edit, modify, and change this Agreement at any time. We shall let our users know of these changes through electronic mail. This Agreement is an understanding between [company name] and the user, and this supersedes and replaces all prior agreements regarding the use of this website.",
  },
] as const;

type DeclarationStepProps = {
  title?: string;
  documentTitle?: string;
  checkboxLabel?: string;
  introText?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
  hasScrolledToBottom?: boolean;
  onScrolledToBottom?: () => void;
  requireScroll?: boolean;
  framed?: boolean;
  animated?: boolean;
};

export function DeclarationStep({
  title = "Review",
  documentTitle = "Sample Terms and Conditions",
  checkboxLabel = "I have read and accepted the terms and conditions.",
  introText = DEFAULT_DECLARATION_INTRO,
  checked,
  onCheckedChange,
  error,
  hasScrolledToBottom,
  onScrolledToBottom,
  requireScroll = true,
  framed = true,
  animated = true,
}: DeclarationStepProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [localHasScrolledToBottom, setLocalHasScrolledToBottom] = React.useState(false);

  const effectiveHasScrolledToBottom = hasScrolledToBottom ?? localHasScrolledToBottom;

  const markScrolledToBottom = React.useCallback(() => {
    setLocalHasScrolledToBottom(true);
    onScrolledToBottom?.();
  }, [onScrolledToBottom]);

  const handleScroll = React.useCallback(() => {
    if (!requireScroll || effectiveHasScrolledToBottom) {
      return;
    }

    const element = scrollRef.current;
    if (!element) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = element;
    if (Math.abs(scrollHeight - clientHeight - scrollTop) < 10) {
      markScrolledToBottom();
    }
  }, [effectiveHasScrolledToBottom, markScrolledToBottom, requireScroll]);

  const content = (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-hsbc-black mb-2">{title}</h2>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="bg-gray-50 p-6 rounded-lg h-96 overflow-y-auto text-[11px] text-gray-700 leading-relaxed border border-gray-200"
          >
            <div className="text-center font-medium text-gray-500 mb-6 border-b border-gray-200 pb-2">--- Start of content ---</div>

            <h3 className="font-bold text-lg mb-4">{documentTitle}</h3>
            <p className="mb-4 text-xs text-gray-500">{introText}</p>

            {DEFAULT_DECLARATION_SECTIONS.map((section) => (
              <div key={section.heading}>
                <h4 className="font-bold mb-2 mt-6">{section.heading}</h4>
                <p className="mb-4">{section.body}</p>
              </div>
            ))}

            <div className="text-center font-medium text-gray-500 mt-10 pt-4 border-t border-gray-200">
              --- End of content ---
            </div>
          </div>
        </div>

        <div className={`transition-opacity duration-300 ${effectiveHasScrolledToBottom || !requireScroll ? "opacity-100" : "opacity-50"}`}>
          <Checkbox
            checked={checked}
            onChange={(event) => onCheckedChange(event.target.checked)}
            disabled={requireScroll && !effectiveHasScrolledToBottom}
            label={checkboxLabel}
            error={Boolean(error)}
            id="agree"
          />
          {requireScroll && !effectiveHasScrolledToBottom && (
            <div className="text-xs text-hsbc-red font-medium mt-2 animate-pulse">
              Scroll to the bottom of the terms to continue
            </div>
          )}
          {error && <p className="text-hsbc-red text-sm mt-1 ml-9">{error}</p>}
        </div>
      </div>
    </>
  );

  if (!framed) {
    return animated ? <div className="animate-in fade-in slide-in-from-right-4 duration-300">{content}</div> : content;
  }

  return animated ? (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <Card>{content}</Card>
    </div>
  ) : (
    <Card>{content}</Card>
  );
}