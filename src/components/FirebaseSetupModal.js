"use client";

import { X, ExternalLink, Key, Database, ShieldCheck, CheckCircle2, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function FirebaseSetupModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sampleEnvText = `NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:...`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleEnvText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/50 via-white to-indigo-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Firebase Setup Guide</h2>
              <p className="text-xs text-slate-500">Connect Google Auth and Firestore to your app</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-600">
          {/* Step 1 */}
          <div className="flex items-start space-x-3.5">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
              1
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900 flex items-center gap-1.5">
                Create a Firebase Project
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-0.5 ml-1 font-normal underline"
                >
                  Firebase Console <ExternalLink className="w-3 h-3" />
                </a>
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Go to the Firebase Console and click <strong>&quot;Add project&quot;</strong>. Follow the prompts to create your new project (Google Analytics is optional).
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start space-x-3.5">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
              2
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900 flex items-center gap-1.5">
                Register a Web App & Get API Keys
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                In project overview, click the <strong>Web icon (&lt;/&gt;)</strong> to register your app.
                Once registered, copy the <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">firebaseConfig</code> values.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start space-x-3.5">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
              3
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Enable Google Authentication
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Navigate to <strong>Build &gt; Authentication</strong> in the sidebar.
                Click <strong>Get Started</strong>, select <strong>Google</strong> under Additional providers, toggle <strong>Enable</strong>, enter your project support email, and click <strong>Save</strong>.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start space-x-3.5">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
              4
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-amber-600" />
                Enable Firestore Database
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                Navigate to <strong>Build &gt; Firestore Database</strong>.
                Click <strong>Create database</strong>, pick a nearby location, and start in <strong>Test mode</strong> (or production mode with user-scoped rules).
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex items-start space-x-3.5">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
              5
            </div>
            <div className="space-y-2 w-full">
              <h3 className="font-semibold text-slate-900">
                Add keys to <code className="text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">.env.local</code>
              </h3>
              <p className="text-xs text-slate-600">
                Paste your configuration keys into the project&apos;s <code className="font-mono text-xs">.env.local</code> file:
              </p>

              <div className="relative bg-slate-900 text-slate-200 p-3.5 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
                <button
                  onClick={handleCopy}
                  className="absolute top-2.5 right-2.5 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 text-[11px] transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Template
                    </>
                  )}
                </button>
                <pre>{sampleEnvText}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Tip: You can use <strong>Guest Demo Mode</strong> immediately without Firebase keys!
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl shadow-sm transition-colors"
          >
            Got it, close guide
          </button>
        </div>
      </div>
    </div>
  );
}
