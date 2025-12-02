"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icons";

const footerLinks = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Modules", href: "#modules" },
    { label: "Pricing", href: "#pricing" },
    { label: "Roadmap", href: "#roadmap" },
  ],
  resources: [
    { label: "Documentation", href: "#docs" },
    { label: "API Reference", href: "#api" },
    { label: "Case Studies", href: "#cases" },
    { label: "Blog", href: "#blog" },
  ],
  company: [
    { label: "About", href: "#about" },
    { label: "Careers", href: "#careers" },
    { label: "Contact", href: "#contact" },
    { label: "Press", href: "#press" },
  ],
  legal: [
    { label: "Privacy", href: "#privacy" },
    { label: "Terms", href: "#terms" },
    { label: "Security", href: "#security" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[var(--foreground)] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-light)] to-[var(--accent)] flex items-center justify-center">
                <Icon name="globe" className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold">Impact Atlas</span>
            </Link>
            <p className="text-sm text-gray-400 mb-6">
              AI-powered climate intelligence for cities and regions.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Impact Atlas. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
