import React from 'react';
import { Layers } from 'lucide-react';

export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="flex min-h-screen w-full">
      {/* Left side - Form */}
      <div className="flex w-full flex-col justify-center px-8 lg:w-1/2 lg:px-12 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-[400px]">
          <div className="mb-10 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm shadow-brand-200">
              <Layers size={18} strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">AdaptLearn AI</span>
          </div>
          
          <div className="mb-8 space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>

          {children}
          
          <div className="mt-auto pt-10 text-xs text-slate-400">
            &copy; {new Date().getFullYear()} AdaptLearn AI. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden w-1/2 bg-slate-50 lg:flex border-l border-slate-200 flex-col justify-between p-12">
        <div className="flex justify-end">
          <div className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-slate-600 shadow-sm border border-slate-200">
            Enterprise Edition
          </div>
        </div>
        
        <div className="relative max-w-lg mx-auto w-full">
           {/* Abstract Visual Elements */}
           <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-brand-100/50 blur-3xl mix-blend-multiply filter"></div>
           <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-purple-100/50 blur-3xl mix-blend-multiply filter"></div>
           
           <div className="relative z-10">
              <blockquote className="space-y-6">
                <div className="text-2xl font-medium leading-tight tracking-tight text-slate-900">
                  "The most refined learning experience we've ever used. The attention to detail and performance is unmatched in the industry."
                </div>
                <footer className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-500 font-bold text-xs">AC</div>
                  <div>
                    <div className="font-semibold text-slate-900">Alex Chen</div>
                    <div className="text-sm text-slate-500">CTO at TechFlow</div>
                  </div>
                </footer>
              </blockquote>
           </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
           <div className="h-1 w-1 rounded-full bg-slate-400"></div>
           <span>Secure & Encrypted</span>
        </div>
      </div>
    </div>
  );
};
