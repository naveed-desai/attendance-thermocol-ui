import React from 'react';
import { Phone, Mail, ShieldCheck } from 'lucide-react';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer
      className={`border-t border-slate-200 bg-white/90 backdrop-blur-xs py-3.5 px-4 text-xs text-slate-500 transition-colors ${className}`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        {/* System Branding / Copyright */}
        <div className="flex items-center space-x-2 text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="font-semibold text-slate-700">WorkTime & Salary</span>
          <span className="text-slate-300">•</span>
          <span>© {new Date().getFullYear()} All rights reserved</span>
        </div>

        {/* Developer & Contact Details */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1.5 text-slate-600">
          <span className="text-slate-500 font-medium">Developed & Managed by</span>
          <a
            href="tel:9008888569"
            className="inline-flex items-center space-x-1.5 font-semibold text-slate-700 hover:text-indigo-600 transition-colors py-0.5 px-1.5 rounded-md hover:bg-indigo-50/60"
            title="Call 9008888569"
          >
            <Phone className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>9008888569</span>
          </a>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <a
            href="mailto:naveed.desai.69@gmail.com"
            className="inline-flex items-center space-x-1.5 font-semibold text-slate-700 hover:text-indigo-600 transition-colors py-0.5 px-1.5 rounded-md hover:bg-indigo-50/60"
            title="Email naveed.desai.69@gmail.com"
          >
            <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>naveed.desai.69@gmail.com</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
