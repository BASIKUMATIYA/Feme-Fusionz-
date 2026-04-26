/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Instagram, 
  Facebook, 
  MessageCircle, 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  Star, 
  Heart, 
  Users, 
  MessageSquare, 
  Shield, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { cn } from './lib/utils';

// --- Types ---

type Category = 'selfReflection' | 'selfAuthentic' | 'conflict' | 'friendship' | 'relationship' | 'spouse';

interface ScoreResult {
  total: number;
  percent: number;
  label: 'Excellent' | 'Good' | 'Fair';
}

interface Question {
  id: string;
  category: Category;
  text: string;
}

// --- Constants ---

const CATEGORIES: Record<Category, { title: string; subtitle: string }> = {
  selfReflection: { title: 'Self Reflection Awareness', subtitle: 'Dealing with Guilt and Resentment' },
  selfAuthentic: { title: 'Self Authentic Awareness', subtitle: 'Living Your Truth' },
  conflict: { title: 'Conflict Awareness', subtitle: 'Transforming Disagreements' },
  friendship: { title: 'Friendship Awareness', subtitle: 'Nurturing Meaningful Connections' },
  relationship: { title: 'Relationship Awareness', subtitle: 'Self-Expression and Intimacy' },
  spouse: { title: 'Relationship with Spouse/Partner', subtitle: 'Deepening Your Partnership' },
};

const QUESTIONS: Question[] = [
  // Self Reflection
  { id: 'guilt-process', category: 'selfReflection', text: 'I can identify and process feelings of guilt in a constructive way.' },
  { id: 'release-resentment', category: 'selfReflection', text: 'I actively work towards releasing resentment towards others.' },
  { id: 'root-causes', category: 'selfReflection', text: 'I seek to understand the root causes of my guilt and resentment.' },
  { id: 'practice-forgiveness', category: 'selfReflection', text: 'I practice forgiveness towards myself to heal from past hurts.' },
  { id: 'letting-go', category: 'selfReflection', text: 'I believe letting go of guilt and resentment improves my emotional well-being.' },
  { id: 'share-feelings', category: 'selfReflection', text: 'I allow myself to share my true feelings with those I\'m close to.' },
  { id: 'emotional-support', category: 'selfReflection', text: 'I believe in the healing power of emotional support and empathy.' },
  { id: 'mutual-respect', category: 'selfReflection', text: 'I recognize the role of mutual respect in fostering intimacy.' },
  { id: 'learning-growing', category: 'selfReflection', text: 'I am open to learning and growing through my intimate relationships.' },
  { id: 'building-trust', category: 'selfReflection', text: 'I prioritize building trust as the foundation of intimate relationships.' },
  
  // Self Authentic
  { id: 'relationships-enrich', category: 'selfAuthentic', text: 'I feel my relationships with others enrich and positively impact my life.' },
  { id: 'healthy-boundaries', category: 'selfAuthentic', text: 'I find it easy to set healthy boundaries in my relationships.' },
  { id: 'feel-understood', category: 'selfAuthentic', text: 'I often feel understood and appreciated by the people close to me.' },
  { id: 'express-gratitude', category: 'selfAuthentic', text: 'I regularly express appreciation and gratitude towards my friends and family.' },
  { id: 'authentic-self', category: 'selfAuthentic', text: 'I am comfortable being my authentic self around others.' },
  { id: 'know-authentic', category: 'selfAuthentic', text: 'I know my authentic self.' },
  
  // Conflict
  { id: 'conflicts-opportunity', category: 'conflict', text: 'I approach conflicts in my relationships as opportunities for deeper understanding.' },
  { id: 'navigate-disagreements', category: 'conflict', text: 'I feel confident in my ability to navigate disagreements with compassion and empathy.' },
  { id: 'understand-perspective', category: 'conflict', text: 'I make an effort to understand the other person\'s perspective in a conflict.' },
  { id: 'maintain-relationship', category: 'conflict', text: 'I prioritize maintaining the relationship over "winning" an argument.' },
  { id: 'repair-relationship', category: 'conflict', text: 'After a conflict, I take steps to repair and strengthen the relationship.' },
  { id: 'willing-effort', category: 'conflict', text: 'I am willing to take effort to resolve conflicts because relationships matter.' },
  
  // Friendship
  { id: 'mutual-support', category: 'friendship', text: 'I have friendships that provide mutual support and understanding.' },
  { id: 'trust-friends', category: 'friendship', text: 'I trust my friends and feel trusted in return.' },
  { id: 'encourage-best', category: 'friendship', text: 'My friends encourage me to be my best self.' },
  { id: 'sense-belonging', category: 'friendship', text: 'I feel a sense of belonging and inclusion within my circle of friends.' },
  { id: 'discuss-vulnerabilities', category: 'friendship', text: 'I am comfortable discussing my vulnerabilities with my friends.' },
  
  // Relationship
  { id: 'explore-sexuality', category: 'relationship', text: 'I feel empowered to explore and understand my own sexuality.' },
  { id: 'discuss-wellbeing', category: 'relationship', text: 'I believe it\'s important to openly discuss sexual well-being and health.' },
  { id: 'respect-body', category: 'relationship', text: 'I respect my body\'s needs and signals, making choices that honor them.' },
  { id: 'embrace-desires', category: 'relationship', text: 'I am learning to embrace my desires without guilt or shame.' },
  { id: 'consent-priority', category: 'relationship', text: 'Conversations about consent are a priority in my relationships.' },
  
  // Spouse
  { id: 'emotional-connected', category: 'spouse', text: 'I feel emotionally connected and intimate with my spouse/partner.' },
  { id: 'communicate-needs', category: 'spouse', text: 'My spouse/partner and I effectively communicate our needs and feelings.' },
  { id: 'physical-intimacy', category: 'spouse', text: 'I am satisfied with the level of physical intimacy in my relationship.' },
  { id: 'supported-goals', category: 'spouse', text: 'I feel supported by my spouse/partner in pursuing my personal goals.' },
  { id: 'resolve-conflicts', category: 'spouse', text: 'My spouse/partner and I can resolve conflicts in a healthy and constructive way.' },
];

const IDEAS: Record<Category, string[]> = {
  selfReflection: [
    "Write a letter to your younger self with compassion",
    "Practice the 5-minute journaling technique daily",
    "Create a 'release ritual' for letting go of resentment",
    "Read a book on emotional intelligence",
    "Try a guided meditation for forgiveness",
    "Join a women's circle for shared experiences",
    "Practice self-compassion phrases daily",
    "Identify one guilt trigger and reframe it",
    "Set a boundary with someone who drains your energy",
    "Create a vision board for emotional freedom",
    "Practice saying 'no' without guilt",
    "Write down 3 things you appreciate about yourself daily",
    "Try a digital detox to reconnect with yourself",
    "Practice active listening in your next conversation",
    "Create a self-care menu for tough days",
    "Write a forgiveness letter (you don't have to send it)",
    "Practice the 'pause' before reacting emotionally",
    "Identify your emotional triggers and plan responses",
    "Create a personal mantra for challenging moments",
    "Schedule a monthly self-reflection retreat"
  ],
  selfAuthentic: [
    "Wear something that expresses your personality today",
    "Share one true feeling with a trusted friend",
    "Create a playlist that reflects your authentic mood",
    "Practice saying what you really think (kindly)",
    "Identify one area where you compromise your values",
    "Write down 5 words that describe your authentic self",
    "Try a new hobby that excites your true self",
    "Declutter your space to reflect your authentic style",
    "Practice setting one small boundary today",
    "Share a personal story that matters to you",
    "Create a morning ritual that honors your true self",
    "Notice when you're performing vs. being authentic",
    "Write a letter to your authentic self",
    "Practice receiving compliments without deflection",
    "Identify your core values and live by one today",
    "Try a new way of expressing yourself creatively",
    "Notice your self-talk and reframe with authenticity",
    "Share your opinion in a group setting",
    "Create a vision of your most authentic life",
    "Practice being present without editing yourself"
  ],
  conflict: [
    "Practice the 10-second pause before responding",
    "Write down the other person's perspective first",
    "Use 'and' instead of 'but' in difficult conversations",
    "Identify your conflict style and its impact",
    "Practice validating feelings before problem-solving",
    "Create a 'conflict toolkit' of calming techniques",
    "Role-play difficult conversations with a friend",
    "Focus on needs instead of positions in disagreements",
    "Practice apologizing sincerely when appropriate",
    "Learn to recognize your conflict triggers",
    "Use humor appropriately to diffuse tension",
    "Practice asking clarifying questions in conflicts",
    "Create a personal mantra for staying calm",
    "Practice repairing relationships after conflicts",
    "Identify win-win solutions in disagreements",
    "Practice expressing appreciation after a conflict",
    "Learn about attachment styles and conflict",
    "Practice setting intentions before difficult talks",
    "Create a post-conflict reflection ritual",
    "Celebrate small wins in conflict resolution"
  ],
  friendship: [
    "Send a thoughtful text to a friend today",
    "Schedule a coffee date with someone you admire",
    "Practice active listening in your next conversation",
    "Share a memory that made you smile with a friend",
    "Try a new activity with a friend",
    "Write a gratitude note to a friend",
    "Practice asking deeper questions in conversations",
    "Create a friendship ritual (monthly calls, etc.)",
    "Be the first to reach out when you feel disconnected",
    "Practice receiving support without guilt",
    "Celebrate a friend's win as if it were your own",
    "Practice setting boundaries to protect friendships",
    "Share a vulnerability to deepen a connection",
    "Create a shared playlist with a friend",
    "Practice forgiveness in a strained friendship",
    "Try a new way of showing appreciation to friends",
    "Notice when you're giving vs. receiving in friendships",
    "Create a friendship vision for the year ahead",
    "Practice being fully present with friends (no phones!)",
    "Celebrate the unique gifts each friend brings"
  ],
  relationship: [
    "Practice a body scan meditation with kindness",
    "Write down 3 things you appreciate about your body",
    "Read a reputable book on sexual wellness",
    "Practice saying your desires out loud (to yourself)",
    "Create a self-care ritual that honors your body",
    "Practice setting a boundary around your comfort",
    "Explore what consent means to you in relationships",
    "Practice receiving touch with awareness",
    "Journal about your relationship with your body",
    "Try a new form of movement that feels good",
    "Practice open communication about needs with a partner",
    "Create a list of your relationship values",
    "Practice self-pleasure as self-care",
    "Learn about the connection between emotions and intimacy",
    "Practice being present during intimate moments",
    "Create a vision of your ideal intimate connection",
    "Practice asking for what you want (in small ways first)",
    "Explore what makes you feel most alive and connected",
    "Practice gratitude for your capacity to connect",
    "Celebrate your journey of self-discovery"
  ],
  spouse: [
    "Share one appreciation with your partner today",
    "Schedule a device-free dinner together",
    "Try a new activity together to create memories",
    "Practice the 'high-low' sharing ritual daily",
    "Write a love note and leave it where they'll find it",
    "Practice asking 'How can I support you today?'",
    "Create a shared vision board for your relationship",
    "Practice repairing quickly after disagreements",
    "Schedule regular date nights (even at home!)",
    "Practice being fully present during conversations",
    "Try a new form of physical connection (dance, massage, etc.)",
    "Practice expressing needs without blame",
    "Create a relationship gratitude journal together",
    "Practice celebrating small wins as a team",
    "Try a relationship-building app or quiz together",
    "Practice forgiveness for small irritations",
    "Create a shared playlist of meaningful songs",
    "Practice asking deeper questions about dreams and fears",
    "Create a ritual for reconnecting after time apart",
    "Celebrate your unique partnership journey"
  ]
};

// --- Components ---

const ProgressBar = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  const progress = (currentStep / totalSteps) * 100;
  return (
    <div className="w-full bg-pink-50 rounded-full h-4 mb-12 border border-pink-100 p-0.5">
      <motion.div 
        className="h-full bg-pink-600 rounded-full shadow-sm"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5 }}
      />
      <div className="flex justify-between mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <span>Phase {currentStep} of {totalSteps}</span>
        <span>{Math.round(progress)}% Journey Complete</span>
      </div>
    </div>
  );
};

const Header = () => (
  <header className="bg-white border-b-4 border-pink-500 py-6 px-12 shadow-sm text-center shrink-0 w-full z-20">
    <div className="max-w-4xl mx-auto flex flex-col items-center">
      <h1 className="text-2xl md:text-3xl font-black tracking-tight text-pink-600 uppercase">
        THE POWER LEADER SELF ASSESSMENT RESULT
      </h1>
    </div>
  </header>
);

const Footer = () => (
  <footer className="bg-slate-900 text-white py-12 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8 shrink-0 w-full mt-auto">
    <div className="text-center md:text-left flex flex-col gap-1">
      <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
        <img 
          src="https://i.ibb.co/VcZ1Ftqs/femefusionz-logo.png" 
          alt="Feme'Fusionz Logo" 
          className="w-10 h-10 object-contain bg-white rounded-full p-1 border-2 border-pink-500"
        />
        <p className="text-2xl font-bold tracking-tighter italic text-white">Feme'Fusionz</p>
      </div>
      <p className="text-[12px] text-slate-400 uppercase tracking-widest font-bold">
        ©2026 All Rights Reserved 
      </p>
    </div>

    <div className="flex flex-wrap justify-center gap-6 items-center">
      <a 
        href="https://chat.whatsapp.com/BrcS9yrX9dw5M2GWcE703p?mode=gi_t" 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
      >
        <MessageCircle size={32} stroke="white" strokeWidth={2.5} />
      </a>
      <a 
        href="https://www.facebook.com/share/18fprSxwnq/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
      >
        <Facebook size={32} fill="white" stroke="none" />
      </a>
      <a 
        href="https://www.instagram.com/femefusionz?utm_source=qr&igsh=MXdiY201ajJzM3N6Ng==" 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-14 h-14 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
      >
        <Instagram size={32} stroke="white" strokeWidth={2.5} />
      </a>
    </div>
  </footer>
);


export default function App() {
  const [step, setStep] = useState(1);
  const [isReportVisible, setIsReportVisible] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Form State
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    mobile: '',
    email: '',
    city: '',
    maritalStatus: '',
    description: '',
    membershipDuration: '',
  });

  const [motivationState, setMotivationState] = useState({
    motivation: '',
    goals: '',
    challenges: [] as string[],
    otherChallenge: '',
    learningPreferences: [] as string[],
    otherLearning: '',
  });

  const [communityState, setCommunityState] = useState({
    confidenceLevel: '',
    communityPreference: '',
    feedback: '',
    interestAdvanced: '',
  });

  const [answers, setAnswers] = useState<Record<string, number>>({});

  // --- Handlers ---

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPersonalInfo({ ...personalInfo, [e.target.name]: e.target.value });
  };

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const validateStep = () => {
    if (step === 1) {
      return personalInfo.fullName && personalInfo.mobile && personalInfo.email && personalInfo.maritalStatus && personalInfo.description && personalInfo.membershipDuration;
    }
    if (step === 2) {
      return motivationState.motivation && motivationState.goals && (motivationState.challenges.length > 0 || motivationState.otherChallenge) && (motivationState.learningPreferences.length > 0 || motivationState.otherLearning);
    }
    if (step === 3) {
      return communityState.confidenceLevel && communityState.communityPreference && communityState.interestAdvanced;
    }
    // Questions logic verification could be more thorough, but for simplicity:
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      alert("Please fill in all required fields.");
    }
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = () => {
    setIsGenerating(true);
    // Simulate some logic delay
    setTimeout(() => {
      setIsReportVisible(true);
      setIsGenerating(false);
      window.scrollTo(0, 0);
    }, 1500);
  };

  const exportPDF = async () => {
    if (!reportRef.current) return;
    
    setIsGenerating(true);
    try {
      const element = reportRef.current;
      if (!element) return;
      
      // html2canvas 1.4.1 struggles with Tailwind 4's oklch/oklab colors.
      // We use a highly isolated onclone callback to ensure No oklch/oklab values reach the parser.
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: false,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: element.offsetWidth,
        height: element.offsetHeight,
        onclone: (clonedDoc) => {
          // 1. Remove all external and internal stylesheets completely
          const styles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
          styles.forEach(s => s.remove());

          const reportEl = clonedDoc.getElementById('report-section');
          if (!reportEl) return;

          // 2. Recursively strip inline styles that might contain oklch/oklab
          const allElements = reportEl.getElementsByTagName('*');
          for (let i = 0; i < allElements.length; i++) {
            const el = allElements[i] as HTMLElement;
            if (el.style && el.style.cssText) {
              // If inline style has oklch or oklab, we clear it to let inherited hex safely take over
              if (el.style.cssText.includes('okl')) {
                el.style.cssText = ''; 
              }
            }
          }

          // 3. Inject a completely standalone, legacy-compatible CSS
          const style = clonedDoc.createElement('style');
          style.innerHTML = `
            * {
              margin: 0; padding: 0; box-sizing: border-box !important;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            #report-section {
              background: white !important;
              color: #1e293b !important;
              padding: 50px !important;
              width: 800px !important;
            }
            .text-pink-600 { color: #db2777 !important; }
            .bg-pink-600 { background-color: #db2777 !important; }
            .bg-pink-50 { background-color: #fdf2f8 !important; }
            .text-slate-900 { color: #0f172a !important; }
            .text-slate-700 { color: #334155 !important; }
            .bg-slate-900 { background-color: #0f172a !important; }
            .border-pink-500 { border-color: #db2777 !important; }
            .border-pink-100 { border-color: #fce7f3 !important; }
            
            /* Structural Helpers */
            .grid { display: block !important; }
            .flex { display: flex !important; }
            .items-center { align-items: center !important; }
            .justify-between { justify-content: space-between !important; }
            .gap-4 { gap: 16px !important; }
            .rounded-3xl { border-radius: 24px !important; }
            .p-8 { padding: 32px !important; }
            
            /* Indicators & Numbers */
            .w-16.h-16 { 
              width: 50px !important; 
              height: 50px !important; 
              background: #db2777 !important; 
              color: white !important; 
              display: flex !important; 
              align-items: center !important; 
              justify-content: center !important; 
              font-weight: 900 !important; 
              border-radius: 50% !important;
            }

            /* Animations and Shadows cleanup */
            .animate-fade-in { animation: none !important; opacity: 1 !important; }
            .shadow-lg, .shadow-xl, .shadow-2xl { border: 1px solid #fce7f3 !important; box-shadow: none !important; }
          `;
          clonedDoc.head.appendChild(style);

          // 4. Branding Header
          const header = clonedDoc.createElement('div');
          header.style.cssText = 'padding-bottom: 30px; border-bottom: 4px solid #db2777; margin-bottom: 40px;';
          header.innerHTML = `
            <h1 style="font-size: 32px; font-weight: 900; color: #db2777; margin: 0;">FEME'FUSIONZ</h1>
            <p style="font-size: 12px; color: #64748b; font-weight: 700; margin: 0; text-transform: uppercase;">Confidence • Empathy • Performance Assessment</p>
          `;
          reportEl.insertBefore(header, reportEl.firstChild);
          
          // 5. Cleanup
          clonedReport.querySelectorAll('button').forEach(b => b.remove());
        }
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgWidth = 210; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [imgWidth, imgHeight]
      });
      
      pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight, undefined, 'FAST');
      pdf.save(`FemeFusionz_Report_${personalInfo.fullName.replace(/\s+/g, '_') || 'User'}.pdf`);
    } catch (error: any) {
      console.error("PDF Export failed:", error);
      alert("Note: PDF Generation encountered a browser restriction. For the best result, please use 'Print to PDF' or take a screenshot of your report!");
    } finally {
      setIsGenerating(false);
    }
  };

  // Scoring Calculation
  const calculateResult = () => {
    const categoryScores: Record<Category, ScoreResult> = {} as any;
    
    Object.keys(CATEGORIES).forEach((catId) => {
      const catQuestions = QUESTIONS.filter(q => q.category === catId);
      const points = catQuestions.reduce((sum: number, q: Question) => sum + (answers[q.id] || 0), 0);
      const percent = Math.round((points / catQuestions.length) * 100);
      const label = percent >= 80 ? 'Excellent' : percent >= 50 ? 'Good' : 'Fair';
      
      categoryScores[catId as Category] = { total: points, percent, label };
    });

    const totalPossible: number = QUESTIONS.length;
    const totalActual: number = Object.values(answers).reduce((a: number, b: number) => a + b, 0);
    const overallPercent = Math.round((totalActual / totalPossible) * 100);
    const overallLabel = overallPercent >= 80 ? 'Excellent' : overallPercent >= 50 ? 'Good' : 'Fair';

    return { categoryScores, overallPercent, overallLabel };
  };

  const results = isReportVisible ? calculateResult() : null;

  if (isReportVisible && results) {
    return (
      <div className="min-h-screen bg-pink-50 flex flex-col">
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-12 flex-grow w-full">
          <div id="report-section" ref={reportRef} className="bg-white rounded-[40px] shadow-2xl border-2 border-pink-100 flex flex-col items-center justify-between p-8 md:p-14 relative overflow-hidden h-auto min-h-[800px]">
            
            {/* Decorative Background Elements */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-pink-200 rounded-full opacity-30 pointer-events-none"></div>
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-yellow-200 rounded-full opacity-40 pointer-events-none"></div>

            <div className="w-full text-center z-10 mb-10">
              <div className="flex items-center justify-center gap-4 mb-6">
                <img 
                  src="https://i.ibb.co/VcZ1Ftqs/femefusionz-logo.png" 
                  alt="Feme'Fusionz Logo" 
                  className="w-16 h-16 object-contain bg-white rounded-full p-1 border-2 border-pink-500"
                />
                <h1 className="text-4xl font-black text-pink-600 tracking-tight">Feme'Fusionz</h1>
              </div>
              <span className="px-6 py-2 bg-pink-600 text-white rounded-full text-sm font-black uppercase tracking-widest mb-6 inline-block shadow-lg">
                Your Assessment Journey
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Growth & Awareness Report</h2>
              <p className="text-slate-500 font-bold italic text-lg decoration-pink-500/30 underline underline-offset-4 decoration-4">Confidence. Empathy. Unstoppable Momentum.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 w-full px-4 md:px-8 z-10 mb-12">
              <div className="flex-1 bg-pink-50 rounded-[2.5rem] p-8 border-b-8 border-pink-200 flex flex-col items-center justify-center transform hover:scale-102 transition-transform shadow-sm">
                <span className="text-5xl font-black text-pink-600">{results.overallPercent}%</span>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Overall Score</span>
              </div>
              <div className="flex-1 bg-yellow-50 rounded-[2.5rem] p-8 border-b-8 border-yellow-200 flex flex-col items-center justify-center transform hover:scale-102 transition-transform shadow-sm">
                <span className="text-5xl font-black text-yellow-600">{results.overallLabel}</span>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Final Archetype</span>
              </div>
              <div className="flex-1 bg-blue-50 rounded-[2.5rem] p-8 border-b-8 border-blue-200 flex flex-col items-center justify-center transform hover:scale-102 transition-transform shadow-sm">
                <span className="text-5xl font-black text-blue-600">{Object.keys(answers).length}/{QUESTIONS.length}</span>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Focus Areas</span>
              </div>
            </div>

            <div className="w-full z-10 space-y-20 px-4 md:px-8">
              {/* Report content */}
              <div className="mb-12 animate-fade-in text-center max-w-3xl mx-auto">
                <h3 className="text-3xl font-black text-slate-800 mb-6 uppercase tracking-tight">Personalized Analysis for {personalInfo.fullName}</h3>
                <p className="text-slate-600 leading-relaxed text-xl font-medium mb-8">
                  As your Feme'Fusionz coach, I've analyzed your responses based on our core values: 
                  <span className="text-pink-600 font-black px-2">Growth</span>, 
                  <span className="text-yellow-600 font-black px-2">Connection</span>, and 
                  <span className="text-blue-600 font-black px-2">Authenticity</span>.
                </p>
              </div>

              {/* Render each category results */}
              <div className="space-y-20">
                {Object.entries(CATEGORIES).map(([catId, { title, subtitle }]) => {
                  const score = results.categoryScores[catId as Category];
                  const colors = {
                    selfReflection: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600' },
                    selfAuthentic: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-600' },
                    conflict: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
                    friendship: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' },
                    relationship: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-600' },
                    spouse: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600' },
                  }[catId as Category];

                  return (
                    <section key={catId} className={cn("p-10 rounded-[3rem] border-b-8 shadow-sm transition-all hover:shadow-md", colors.bg, colors.border)}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                          <h4 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{title}</h4>
                          <p className="text-slate-500 font-bold italic tracking-tight">{subtitle}</p>
                        </div>
                        <div className={cn("px-8 py-3 rounded-2xl font-black text-xl shadow-lg border-2 border-white", 
                          score.label === 'Excellent' ? 'bg-green-500 text-white' : 
                          score.label === 'Good' ? 'bg-amber-500 text-white' : 'bg-rose-500 text-white'
                        )}>
                          {score.label} • {score.percent}%
                        </div>
                      </div>

                      <div className="space-y-10">
                        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-inner border border-white/50">
                          <h5 className={cn("text-lg font-black uppercase tracking-widest mb-4 flex items-center gap-3", colors.text)}>
                            Analysis Insight
                          </h5>
                          <p className="text-slate-700 leading-relaxed text-lg font-medium">
                            {score.label === 'Excellent' 
                              ? `Incredible mastery! You've built a bulletproof internal system for ${title.toLowerCase()}. Your ability to remain centered while growing is exactly what a Power Leader embodies.`
                              : score.label === 'Good'
                              ? `You possess strong instincts in this domain. Minor pivots in your daily rituals will turn these solid habits into a formidable foundation for the next level of your journey.`
                              : `This is a high-priority pivot zone. Investing intentional focus here will unlock massive leverage in your overall life balance and relational harmony.`
                            }
                          </p>
                        </div>

                        <div>
                          <h5 className={cn("text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-3", colors.text)}>
                            20 Radical Growth Actions
                          </h5>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
                            {IDEAS[catId as Category].map((idea, idx) => (
                              <div key={idx} className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 group hover:border-pink-300 transition-all hover:translate-x-1">
                                <span className={cn("flex-shrink-0 w-8 h-8 rounded-full text-white text-xs flex items-center justify-center font-black", 
                                  idx < 5 ? colors.text.replace('text-', 'bg-') : 'bg-slate-300'
                                )}>
                                  {idx + 1}
                                </span>
                                <span className="text-[13px] text-slate-700 font-bold leading-snug">{idea}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>
                  );
                })}
              </div>

              <div className="mt-20 p-12 bg-slate-900 rounded-[3rem] text-center shadow-2xl relative overflow-hidden border-t-8 border-pink-500">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Sparkles size={100} className="text-pink-500" />
                </div>
                <h3 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter">Your Authentic Peak Awaits</h3>
                <p className="text-slate-300 text-xl leading-relaxed mb-10 max-w-2xl mx-auto font-medium">
                  "This report isn't a final grade, {personalInfo.fullName}; it's a launchpad. 
                  You now have the exact data required to move from where you are to the version 
                  of yourself that inspired you to start this assessment today."
                </p>
                <div className="flex flex-col items-center gap-4">
                  <p className="text-pink-400 font-black text-lg uppercase tracking-widest">Connect with our community of Power Leaders</p>
                  <p className="text-slate-400 font-bold italic">Growth. Connection. Authenticity.</p>
                </div>
              </div>

              <div className="py-12 border-t-2 border-slate-100 flex flex-col items-center justify-center text-center">
                <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-4">Export format: Single continuous page</p>
                <div className="flex items-center gap-3">
                  <img src="https://i.ibb.co/VcZ1Ftqs/femefusionz-logo.png" alt="FF" className="w-8 h-8 opacity-50 grayscale" />
                  <p className="text-slate-300 text-[10px] font-black uppercase">Feme'Fusionz Official Assessment 2026</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 flex flex-col items-center gap-4">
            <button 
              onClick={exportPDF}
              disabled={isGenerating}
              className="group bg-pink-600 hover:bg-pink-700 text-white font-black py-5 px-14 rounded-3xl shadow-xl transform active:scale-95 flex items-center gap-4 transition-all text-xl uppercase tracking-tighter"
            >
              <Download size={28} strokeWidth={3} />
              {isGenerating ? "GENERATING PDF..." : "DOWNLOAD ASSESSMENT REPORT (PDF)"}
            </button>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Single continuous page format</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Render Form Steps
  return (
    <div className="min-h-screen bg-[#faf5ff] flex flex-col">
      <Header />
      
      <main id="assessment-main-content" className="flex-grow max-w-5xl mx-auto w-full px-4 py-12">
        <div id="assessment-card" className="bg-white rounded-[40px] shadow-2xl border-2 border-pink-100 flex flex-col items-center justify-between p-10 relative overflow-hidden min-h-[70vh]">
          {/* Decorative Background Elements */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-pink-200 rounded-full opacity-30 pointer-events-none"></div>
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-yellow-200 rounded-full opacity-40 pointer-events-none"></div>

          <div className="w-full relative z-10">
            <ProgressBar currentStep={step} totalSteps={7} />
          </div>
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="border-b-4 border-pink-500/20 pb-4 mb-8">
                  <h3 className="text-3xl font-black text-slate-900 flex items-center gap-4 uppercase tracking-tighter">
                    <Users className="text-pink-600" size={32} /> Personal Intelligence
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name *</label>
                    <input 
                      type="text" 
                      name="fullName"
                      value={personalInfo.fullName}
                      onChange={handlePersonalChange}
                      className="w-full px-6 py-5 bg-pink-50/50 border-2 border-pink-100 rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-bold"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number *</label>
                    <input 
                      type="tel" 
                      name="mobile"
                      value={personalInfo.mobile}
                      onChange={handlePersonalChange}
                      className="w-full px-6 py-5 bg-pink-50/50 border-2 border-pink-100 rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-bold"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address *</label>
                    <input 
                      type="email" 
                      name="email"
                      value={personalInfo.email}
                      onChange={handlePersonalChange}
                      className="w-full px-6 py-5 bg-pink-50/50 border-2 border-pink-100 rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-bold"
                      placeholder="jane@example.com"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                    <input 
                      type="text" 
                      name="city"
                      value={personalInfo.city}
                      onChange={handlePersonalChange}
                      className="w-full px-6 py-5 bg-pink-50/50 border-2 border-pink-100 rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 font-bold"
                      placeholder="Mumbai"
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-1">Marital Status *</label>
                  <div className="flex flex-wrap gap-4">
                    {['Single', 'Married', 'Divorced', 'Other'].map(status => (
                      <button
                        key={status}
                        onClick={() => setPersonalInfo({ ...personalInfo, maritalStatus: status })}
                        className={cn(
                          "px-8 py-4 rounded-2xl font-black uppercase tracking-tighter border-2 transition-all shadow-sm",
                          personalInfo.maritalStatus === status 
                            ? "bg-pink-600 text-white border-pink-600 shadow-pink-200 transform scale-105" 
                            : "bg-white text-slate-400 border-slate-100 hover:border-pink-300"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-semibold text-slate-600 block ml-1">Which of the following best describes you? *</label>
                  <div className="flex flex-wrap gap-3">
                    {['Homemaker', 'Homepreneur', 'Entrepreneur', 'Studying', 'Women Professional', 'Other'].map(desc => (
                      <button
                        key={desc}
                        onClick={() => setPersonalInfo({ ...personalInfo, description: desc })}
                        className={cn(
                          "px-6 py-3 rounded-xl font-medium border-2 transition-all",
                          personalInfo.description === desc 
                            ? "bg-primary text-white border-primary shadow-lg scale-105" 
                            : "bg-white text-slate-500 border-slate-200 hover:border-primary/50"
                        )}
                      >
                        {desc}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-semibold text-slate-600 block ml-1">Feme'Fusionz Membership Duration *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {['Less than 1 Month', 'Less than 7 Month', 'Less than 1 Year', 'Less than 3 Years', 'Less than 5 Years'].map(dur => (
                      <button
                        key={dur}
                        onClick={() => setPersonalInfo({ ...personalInfo, membershipDuration: dur })}
                        className={cn(
                          "px-6 py-3 rounded-xl font-medium border-2 transition-all text-left",
                          personalInfo.membershipDuration === dur 
                            ? "bg-primary text-white border-primary shadow-lg translate-x-2" 
                            : "bg-white text-slate-500 border-slate-200 hover:border-primary/50"
                        )}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="border-b-4 border-pink-500/20 pb-4 mb-8">
                  <h3 className="text-3xl font-black text-slate-900 flex items-center gap-4 uppercase tracking-tighter">
                    <Sparkles className="text-pink-600" size={32} /> Strategic Intent
                  </h3>
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Motivation Catalyst *</label>
                  <textarea 
                    value={motivationState.motivation}
                    onChange={(e) => setMotivationState({ ...motivationState, motivation: e.target.value })}
                    className="w-full px-6 py-5 bg-pink-50/50 border-2 border-pink-100 rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all h-32 resize-none font-bold placeholder:text-slate-300"
                    placeholder="What drives your growth today?"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Top 3 Annual Targets *</label>
                  <textarea 
                    value={motivationState.goals}
                    onChange={(e) => setMotivationState({ ...motivationState, goals: e.target.value })}
                    className="w-full px-6 py-5 bg-pink-50/50 border-2 border-pink-100 rounded-2xl focus:border-pink-500 focus:bg-white outline-none transition-all h-40 resize-none font-bold placeholder:text-slate-300"
                    placeholder="List your high-impact goals..."
                  />
                </div>

                <div className="space-y-6">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-1">Critical Roadblocks *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      'Work-Life Balance', 'Self-Doubt/Fear', 'Stress/Burnout', 'Communication gaps', 'Health/Wellness', 'Relationships', 'Financial goals', 'Confidence', 'Time Management'
                    ].map(challenge => (
                      <label key={challenge} className="flex items-center gap-4 p-5 bg-white border-2 border-slate-100 rounded-2xl cursor-pointer hover:border-pink-300 transition-all group shadow-sm">
                        <input 
                          type="checkbox"
                          checked={motivationState.challenges.includes(challenge)}
                          onChange={(e) => {
                            const newChallenges = e.target.checked 
                              ? [...motivationState.challenges, challenge]
                              : motivationState.challenges.filter(c => c !== challenge);
                            setMotivationState({ ...motivationState, challenges: newChallenges });
                          }}
                          className="w-6 h-6 accent-pink-600 rounded"
                        />
                        <span className="text-sm font-black text-slate-600 uppercase tracking-tight group-hover:text-pink-600 transition-colors">{challenge}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-semibold text-slate-600 block ml-1">Learning Preference? *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      'Videos', 'Articles', 'Webinars', 'Live sessions', 'Workshops', 'E-books', 'Podcasts', 'Interactive courses'
                    ].map(pref => (
                      <label key={pref} className="flex items-center gap-3 p-4 bg-white border-2 border-slate-100 rounded-xl cursor-pointer hover:border-primary/20 transition-all">
                        <input 
                          type="checkbox"
                          checked={motivationState.learningPreferences.includes(pref)}
                          onChange={(e) => {
                            const newPrefs = e.target.checked 
                              ? [...motivationState.learningPreferences, pref]
                              : motivationState.learningPreferences.filter(p => p !== pref);
                            setMotivationState({ ...motivationState, learningPreferences: newPrefs });
                          }}
                          className="w-5 h-5 accent-secondary"
                        />
                        <span className="text-sm font-medium text-slate-600">{pref}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="border-b-4 border-pink-500/20 pb-4 mb-8">
                  <h3 className="text-3xl font-black text-slate-900 flex items-center gap-4 uppercase tracking-tighter">
                    <MessageSquare className="text-pink-600" size={32} /> Influence & Presence
                  </h3>
                </div>

                <div className="space-y-10">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block text-center">Unassisted Capacity for Achievement? *</label>
                  <div className="flex justify-center gap-6">
                    {[1, 2, 3, 4, 5].map(val => (
                      <button
                        key={val}
                        onClick={() => setCommunityState({ ...communityState, confidenceLevel: val.toString() })}
                        className={cn(
                          "w-16 h-16 rounded-3xl font-black text-2xl border-4 transition-all flex items-center justify-center shadow-md",
                          communityState.confidenceLevel === val.toString()
                            ? "bg-pink-600 text-white border-pink-200 shadow-pink-200 transform scale-110 -rotate-3"
                            : "bg-white text-slate-300 border-slate-50 hover:border-pink-200"
                        )}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between max-w-sm mx-auto text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                    <span>Minimum</span>
                    <span>Absolute</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block ml-1">Ideal Interaction Frequency? *</label>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never'].map(freq => (
                      <button
                        key={freq}
                        onClick={() => setCommunityState({ ...communityState, communityPreference: freq })}
                        className={cn(
                          "px-6 py-5 rounded-2xl font-black uppercase tracking-widest border-2 transition-all shadow-sm",
                          communityState.communityPreference === freq 
                            ? "bg-yellow-500 text-white border-yellow-500 shadow-yellow-100" 
                            : "bg-white text-slate-400 border-slate-50 hover:border-yellow-200"
                        )}
                      >
                        {freq}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 ml-1">Would you be interested in advanced courses or programs? *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Yes', 'Maybe', 'No'].map(ans => (
                      <button
                        key={ans}
                        onClick={() => setCommunityState({ ...communityState, interestAdvanced: ans })}
                        className={cn(
                          "px-6 py-4 rounded-xl font-medium border-2 transition-all",
                          communityState.interestAdvanced === ans 
                            ? "bg-primary text-white border-primary shadow-lg" 
                            : "bg-white text-slate-500 border-slate-200 hover:border-primary/50"
                        )}
                      >
                        {ans}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-600 ml-1">Additional Feedback?</label>
                  <textarea 
                    value={communityState.feedback}
                    onChange={(e) => setCommunityState({ ...communityState, feedback: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all h-24 resize-none"
                    placeholder="We'd love to hear from you..."
                  />
                </div>
              </motion.div>
            )}

            {step >= 4 && step <= 7 && (
              <motion.div 
                key={`step${step}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Dynamically render relevant category questions */}
                {(() => {
                  let catsToRender: Category[] = [];
                  if (step === 4) catsToRender = ['selfReflection'];
                  if (step === 5) catsToRender = ['selfAuthentic', 'conflict'];
                  if (step === 6) catsToRender = ['friendship', 'relationship'];
                  if (step === 7) catsToRender = ['spouse'];

                  return catsToRender.map(cat => (
                    <div key={cat} className="space-y-8 animate-fade-in">
                      <div className="border-b-4 border-pink-500/20 pb-6 mb-8">
                        <h4 className="text-3xl font-black text-slate-900 flex items-center gap-4 uppercase tracking-tighter">
                          {cat === 'selfReflection' && <Sparkles className="text-pink-600" size={32} />}
                          {cat === 'selfAuthentic' && <Sparkles className="text-yellow-600" size={32} />}
                          {cat === 'conflict' && <MessageSquare className="text-blue-600" size={32} />}
                          {cat === 'friendship' && <Users className="text-purple-600" size={32} />}
                          {cat === 'relationship' && <Heart className="text-rose-600" size={32} />}
                          {cat === 'spouse' && <Heart className="text-orange-600 fill-current" size={32} />}
                          {CATEGORIES[cat].title}
                        </h4>
                        <p className="text-slate-400 font-bold italic tracking-tight">{CATEGORIES[cat].subtitle}</p>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        {QUESTIONS.filter(q => q.category === cat).map((q, idx) => (
                          <div key={q.id} className="p-8 bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-sm hover:border-pink-200 transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none"></div>
                            <p className="text-slate-800 font-black text-lg mb-6 flex gap-4 uppercase tracking-tight">
                              <span className="text-pink-600/30 font-black">{idx + 1}</span>
                              {q.text}
                            </p>
                            <div className="flex gap-4 relative z-10">
                              <button
                                onClick={() => handleAnswer(q.id, 1)}
                                className={cn(
                                  "flex-1 py-4 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 border-2 shadow-sm",
                                  answers[q.id] === 1
                                    ? "bg-pink-600 text-white border-pink-600 shadow-pink-100 transform -rotate-1"
                                    : "bg-white text-slate-400 border-slate-50 hover:border-pink-300"
                                )}
                              >
                                {answers[q.id] === 1 && <CheckCircle2 size={24} strokeWidth={3} />} Affirmative
                              </button>
                              <button
                                onClick={() => handleAnswer(q.id, 0)}
                                className={cn(
                                  "flex-1 py-4 rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center border-2 shadow-sm",
                                  answers[q.id] === 0
                                    ? "bg-slate-800 text-white border-slate-800 shadow-slate-100 transform rotate-1"
                                    : "bg-white text-slate-400 border-slate-50 hover:border-slate-800"
                                )}
                              >
                                Negative
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </motion.div>
            )}
          </AnimatePresence>

          <nav className="mt-16 flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 w-full">
            {step > 1 && (
              <button 
                onClick={prevStep}
                className="flex items-center gap-2 px-10 py-5 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all w-full md:w-auto"
              >
                <ChevronLeft size={24} strokeWidth={3} /> Return
              </button>
            )}
            <div className="flex-grow" />
            {step < 7 ? (
              <button 
                onClick={nextStep}
                className="group bg-pink-600 hover:bg-pink-700 text-white font-black py-5 px-14 rounded-2xl shadow-xl transform active:scale-95 flex items-center justify-center gap-4 transition-all w-full md:w-auto text-lg uppercase tracking-widest"
              >
                Advance Process <ChevronRight size={24} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={isGenerating}
                className="group bg-pink-600 hover:bg-pink-700 text-white font-black py-6 px-16 rounded-[2rem] shadow-2xl transform active:scale-95 flex items-center justify-center gap-4 transition-all w-full md:w-auto text-xl uppercase tracking-widest"
              >
                {isGenerating ? "PROCESSING..." : <>SYNTHESIZE RESULTS <Sparkles size={24} /></>}
              </button>
            )}
          </nav>
        </div>
      </main>

      <Footer />
      
      {/* Loading Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-slate-100 border-t-primary rounded-full mb-6"
          />
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Synthesizing Your Results...
          </h2>
          <p className="text-slate-400 mt-2">Crafting your personalized self-awareness roadmap.</p>
        </div>
      )}
    </div>
  );
}
