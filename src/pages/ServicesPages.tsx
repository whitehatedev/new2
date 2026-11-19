import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Upload,
  CheckCircle2,
  Printer,
  Cpu,
  Wrench,
  ChevronDown,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { usePlatform } from '../context/PlatformContext';
import { buildFaqSchema, buildServiceSchema } from '../lib/seo';

export const PRINTING_3D_CAPABILITIES: string[] = [
  'FDM 3D Printing',
  'Custom 3D Prototyping',
  'Functional Mechanical Parts',
  'Product Design & Development',
  'Engineering Models',
  'Customized Components',
  'Rapid Prototyping',
  'Mechanical Component Fabrication',
  'Prototype Testing & Iteration',
  'Small-Batch Manufacturing',
];

export const PRINTING_3D_DESCRIPTION =
  'Transform digital designs into physical products through professional 3D printing, rapid prototyping, custom component manufacturing, product development and precision fabrication.';

export const PRINTING_3D_WORKFLOW: string[] = [
  'Upload your 3D CAD file.',
  'Select material and printing parameters.',
  'Configure infill, layer height, supports and quantity.',
  'Receive an estimated quotation.',
  'Complete payment.',
  'Track your printing order.',
  'Download your invoice and receive the finished product.',
];

export const PROJECT_DEVELOPMENT_DESCRIPTION =
  'End-to-end engineering project development covering hardware prototyping, electronics integration, embedded programming, robotics, IoT, AI/ML, PCB design and customized academic and industrial engineering solutions.';

export const PROJECT_CAPABILITY_GROUPS: Array<{
  title: string;
  code: string;
  items: string[];
}> = [
  {
    title: 'Academic Engineering Projects',
    code: 'ACAD',
    items: [
      'Final-Year Engineering Projects',
      'Mini Projects',
      'Academic Demonstration Models',
      'Research & Innovation Projects',
    ],
  },
  {
    title: 'Artificial Intelligence & Software',
    code: 'AI/SW',
    items: [
      'Artificial Intelligence Projects',
      'Machine Learning Applications',
      'Computer Vision',
      'Intelligent Automation',
      'Software-Hardware Integration',
    ],
  },
  {
    title: 'Electronics & Embedded Systems',
    code: 'ELEC',
    items: [
      'Embedded Systems Development',
      'Microcontroller Programming',
      'PCB Design & Development',
      'ESP32, Arduino and Raspberry Pi Projects',
      'Sensor Integration',
    ],
  },
  {
    title: 'Robotics & Automation',
    code: 'ROBO',
    items: [
      'Robotics Development',
      'Autonomous Systems',
      'Industrial Automation',
      'Drone & UAV Development',
      'Custom Hardware Prototyping',
    ],
  },
];

export const PROJECT_DEVELOPMENT_CAPABILITIES: string[] = PROJECT_CAPABILITY_GROUPS.flatMap(
  (group) => group.items
);

export const PROJECT_DEVELOPMENT_PROCESS: Array<{
  step: string;
  title: string;
  detail: string;
}> = [
  {
    step: '01',
    title: 'Submit requirements',
    detail: 'Share technical problem statement, functional constraints, reference papers or hardware target specs.',
  },
  {
    step: '02',
    title: 'Technical consultation & feasibility',
    detail: 'Engineers evaluate architecture, bill of materials, sensor compatibility and fabrication tolerances.',
  },
  {
    step: '03',
    title: 'Quotation & timeline',
    detail: 'Receive an itemized engineering estimate, component schedule and 50% advance milestone plan.',
  },
  {
    step: '04',
    title: 'Design & engineering development',
    detail: 'CAD assembly, PCB layout, embedded firmware, AI/ML models and system integration are built in-house.',
  },
  {
    step: '05',
    title: 'Prototype manufacturing & testing',
    detail: 'Hardware fabrication, subsystem bench testing, calibration and iterative validation rounds.',
  },
  {
    step: '06',
    title: 'Final demonstration & handover',
    detail: 'Verified operational handover with source files, schematics, technical documentation and deployment support.',
  },
];

export const CUSTOM_ENGINEERING_CAPABILITIES = PROJECT_DEVELOPMENT_CAPABILITIES;
export const CUSTOM_ENGINEERING_DESCRIPTION = PROJECT_DEVELOPMENT_DESCRIPTION;

export const DRONE_REPAIR_DESCRIPTION =
  'Professional agricultural UAV maintenance and technical diagnostics through our Nagpur service centre and mobile field engineering support. We provide technical inspection, troubleshooting, component replacement, calibration and operational verification for agricultural and commercial drone platforms.';

export const DRONE_REPAIR_COVERAGE: string[] = [
  'Mobile Field Engineer Visits',
  'Nagpur Service Centre Drop-Offs',
  'Structural Airframe Inspection & Rebuilds',
  'Motor & ESC Replacement',
  'Flight Controller Configuration',
  'PID / IMU Calibration',
  'Compass Calibration',
  'Telemetry Configuration',
  'RTK GPS Integration',
  'Spray Pump Overhaul',
  'Carbon Boom Replacement',
  'Electrical & Wiring Diagnostics',
  'Pre-Repair Technical Inspection',
  'Verified Hover & Load Testing',
];

export const DRONE_REPAIR_WORKFLOW: Array<{
  step: string;
  title: string;
  detail: string;
}> = [
  {
    step: '01',
    title: 'Submit Repair or Inspection Request',
    detail: 'Select Nagpur Service Centre drop-off or on-site Mobile Field Engineer visit and log fault details.',
  },
  {
    step: '02',
    title: 'Media & Telemetry Intake',
    detail: 'Attach crash photos, diagnostic video, flight logs or ESC error notes for preliminary triage.',
  },
  {
    step: '03',
    title: 'Pre-Repair Technical Inspection',
    detail: 'Bench teardown or on-site frame, propulsion, wiring, pump and flight controller diagnostics.',
  },
  {
    step: '04',
    title: 'Itemized Repair Quotation',
    detail: 'Receive spare part requirements, labour breakdown and inspection report inside My Account.',
  },
  {
    step: '05',
    title: 'Customer Approval & Settlement',
    detail: 'Approve the verified quotation and complete secure payment to authorize component replacement.',
  },
  {
    step: '06',
    title: 'Precision Repair & Assembly',
    detail: 'Boom replacement, motor/ESC installation, solder harness rework and spray system overhaul.',
  },
  {
    step: '07',
    title: 'Sensor, Radio & Flight Calibration',
    detail: 'PID / IMU, compass, telemetry link and RTK GPS calibration tailored to payload weight.',
  },
  {
    step: '08',
    title: 'Verified Hover & Load Testing',
    detail: 'Controlled hover stability, failsafe checks and loaded spray test prior to customer handover.',
  },
];

interface FaqItem {
  q: string;
  a: string;
}

const FaqAccordion: React.FC<{ items: FaqItem[] }> = ({ items }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl bg-white">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
            >
              <span className="font-medium text-sm sm:text-base text-slate-950">{item.q}</span>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-[#1769AA]' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-5 text-sm text-slate-600 leading-relaxed">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const ServicesOverviewPage: React.FC = () => {
  const { navigate, setDynamicSeo } = usePlatform();

  useEffect(() => {
    setDynamicSeo({
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Engineering Services', url: '/services' },
      ],
      schemas: [
        buildServiceSchema({
          name: '3D Printing & Rapid Prototyping',
          serviceType: 'Additive Manufacturing & Product Fabrication',
          description: PRINTING_3D_DESCRIPTION,
          url: '/services/3d-printing',
        }),
        buildServiceSchema({
          name: 'Custom Engineering Project Development',
          serviceType: 'Engineering Research, Development & Prototyping',
          description: PROJECT_DEVELOPMENT_DESCRIPTION,
          url: '/services/custom-engineering',
        }),
        buildServiceSchema({
          name: 'Drone Repair & Diagnostics Service',
          serviceType: 'UAV Maintenance, Repair & Technical Support',
          description: DRONE_REPAIR_DESCRIPTION,
          url: '/services/drone-repair',
        }),
      ],
    });
    return () => setDynamicSeo(null);
  }, [setDynamicSeo]);

  return (
    <div className="bg-white">
      {/* Corporate Navy & White Header Band */}
      <section className="bg-gradient-to-br from-[#102A43] via-[#133452] to-[#0D2338] text-white border-b border-[#1E3A5F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-20 space-y-6">
          <div className="space-y-4 max-w-4xl">
            <div className="text-xs font-mono uppercase tracking-[0.18em] text-blue-300 font-semibold">
              NEXUSTEKFUSION ENGINEERING SERVICES
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.12]">
              Engineering, Manufacturing &amp; Technology Solutions
            </h1>
            <p className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed max-w-3xl">
              Professional engineering execution, precision manufacturing and end-to-end technical development for businesses, institutions, startups, researchers and industrial clients.
            </p>
            <p className="text-sm sm:text-base text-blue-100/85 leading-relaxed max-w-3xl">
              NexusTekFusion Private Limited delivers practical engineering solutions through advanced manufacturing, custom project development and agricultural drone maintenance. From digital designs to physical components and complete engineering systems, we help transform ideas into reliable products.
            </p>
          </div>

          <div className="pt-4 border-t border-white/15 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-blue-100 font-medium">
            <div className="inline-flex items-center gap-2">
              <Printer className="w-4 h-4 text-blue-300 shrink-0" />
              <span>Precision Manufacturing</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-300 shrink-0" />
              <span>End-to-End Project Development</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-300 shrink-0" />
              <span>UAV Maintenance &amp; Diagnostics</span>
            </div>
          </div>
        </div>
      </section>

      {/* Strictly 3 Primary Service Pillars — Zero Images */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-14 lg:py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {/* SERVICE 01: 3D PRINTING & RAPID PROTOTYPING */}
          <article className="rounded-2xl border border-slate-200 bg-white hover:border-[#1769AA]/60 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
            <div>
              <div className="bg-[#102A43] text-white px-6 py-5 border-b border-[#1E3A5F] flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-blue-300">
                    Additive Manufacturing &amp; Product Fabrication
                  </div>
                  <div className="font-mono text-2xl font-bold text-white tabular-nums">01</div>
                </div>
                <div className="w-10 h-10 rounded-lg border border-white/15 bg-white/10 flex items-center justify-center shrink-0">
                  <Printer className="w-5 h-5 text-blue-200" />
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <h2 className="font-display text-xl font-bold text-slate-950">
                    3D Printing &amp; Rapid Prototyping
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {PRINTING_3D_DESCRIPTION}
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                    Service Capabilities
                  </div>
                  <ul className="grid grid-cols-1 gap-1.5 text-xs text-slate-700">
                    {PRINTING_3D_CAPABILITIES.map((cap) => (
                      <li key={cap} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1769AA] shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-slate-200 bg-[#F3F6FA] px-3.5 py-2.5 space-y-1">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Supported File Formats
                  </div>
                  <div className="text-xs font-mono font-semibold text-slate-900">
                    STL · OBJ · 3MF · STEP/STP · IGES/IGS
                  </div>
                </div>

                <details className="group border border-slate-200 rounded-lg bg-[#F3F6FA]/70">
                  <summary className="px-3.5 py-2.5 text-xs font-semibold text-slate-800 cursor-pointer flex items-center justify-between list-none">
                    <span>Customer Workflow (7 Steps)</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <ol className="px-3.5 pb-3 pt-1 space-y-1.5 text-xs text-slate-600 border-t border-slate-200/80">
                    {PRINTING_3D_WORKFLOW.map((step, i) => (
                      <li key={step} className="flex items-start gap-2">
                        <span className="font-mono font-semibold text-[#1769AA] tabular-nums">
                          {String(i + 1).padStart(2, '0')}.
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </details>
              </div>
            </div>

            <div className="px-6 pb-6 pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => navigate('/services/3d-printing')}
                className="w-full py-2.5 px-4 bg-[#1769AA] hover:bg-[#125488] text-white text-sm font-semibold rounded-lg inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
              >
                <span>Explore 3D Printing</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/services/3d-printing#cad-upload')}
                  className="py-2 px-3 border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors"
                >
                  Upload 3D File
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/services/3d-printing#custom-quote-enquiry')}
                  className="py-2 px-3 border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors"
                >
                  Request Custom Quote
                </button>
              </div>
            </div>
          </article>

          {/* SERVICE 02: PROJECT DEVELOPMENT */}
          <article className="rounded-2xl border border-slate-200 bg-white hover:border-[#1769AA] hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
            <div>
              <div className="bg-[#102A43] text-white px-6 py-5 border-b border-[#1E3A5F] flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-blue-300">
                    Engineering Research, Development &amp; Prototyping
                  </div>
                  <div className="font-mono text-2xl font-bold text-white tabular-nums">02</div>
                </div>
                <div className="w-10 h-10 rounded-lg border border-white/15 bg-white/10 flex items-center justify-center shrink-0">
                  <Cpu className="w-5 h-5 text-blue-200" />
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <h2 className="font-display text-xl font-bold text-slate-950">
                    Project Development
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {PROJECT_DEVELOPMENT_DESCRIPTION}
                  </p>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                    Project Capabilities
                  </div>
                  <div className="space-y-3">
                    {PROJECT_CAPABILITY_GROUPS.map((group) => (
                      <div key={group.title} className="space-y-1">
                        <div className="text-xs font-semibold text-[#102A43]">{group.title}</div>
                        <ul className="space-y-1 text-xs text-slate-700">
                          {group.items.map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#1769AA] shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <details className="group border border-slate-200 rounded-lg bg-[#F3F6FA]/70">
                  <summary className="px-3.5 py-2.5 text-xs font-semibold text-slate-800 cursor-pointer flex items-center justify-between list-none">
                    <span>Development Process (6 Steps)</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <ol className="px-3.5 pb-3 pt-1 space-y-1.5 text-xs text-slate-600 border-t border-slate-200/80">
                    {PROJECT_DEVELOPMENT_PROCESS.map((p) => (
                      <li key={p.step} className="flex items-start gap-2">
                        <span className="font-mono font-semibold text-[#1769AA] tabular-nums">
                          {p.step}.
                        </span>
                        <span>{p.title}</span>
                      </li>
                    ))}
                  </ol>
                </details>
              </div>
            </div>

            <div className="px-6 pb-6 pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => navigate('/services/custom-engineering')}
                className="w-full py-2.5 px-4 bg-[#1769AA] hover:bg-[#125488] text-white text-sm font-semibold rounded-lg inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
              >
                <span>Explore Project Development</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/register-project')}
                  className="py-2 px-3 border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors"
                >
                  Register Your Project
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/services/custom-engineering#consultation-form')}
                  className="py-2 px-3 border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors"
                >
                  Request Consultation
                </button>
              </div>
            </div>
          </article>

          {/* SERVICE 03: DRONE REPAIR & DIAGNOSTICS SERVICE */}
          <article className="rounded-2xl border border-slate-200 bg-white hover:border-[#1769AA]/60 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden md:col-span-2 lg:col-span-1">
            <div>
              <div className="bg-[#102A43] text-white px-6 py-5 border-b border-[#1E3A5F] flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-blue-300">
                    UAV Maintenance, Repair &amp; Technical Support
                  </div>
                  <div className="font-mono text-2xl font-bold text-white tabular-nums">03</div>
                </div>
                <div className="w-10 h-10 rounded-lg border border-white/15 bg-white/10 flex items-center justify-center shrink-0">
                  <Wrench className="w-5 h-5 text-blue-200" />
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <h2 className="font-display text-xl font-bold text-slate-950">
                    Drone Repair &amp; Diagnostics Service
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {DRONE_REPAIR_DESCRIPTION}
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-800">
                    Diagnostics &amp; Repair Coverage
                  </div>
                  <ul className="grid grid-cols-1 gap-1.5 text-xs text-slate-700">
                    {DRONE_REPAIR_COVERAGE.map((cov) => (
                      <li key={cov} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1769AA] shrink-0 mt-0.5" />
                        <span>{cov}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <details className="group border border-slate-200 rounded-lg bg-[#F3F6FA]/70">
                  <summary className="px-3.5 py-2.5 text-xs font-semibold text-slate-800 cursor-pointer flex items-center justify-between list-none">
                    <span>Customer Service Workflow (8 Steps)</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <ol className="px-3.5 pb-3 pt-1 space-y-1.5 text-xs text-slate-600 border-t border-slate-200/80">
                    {DRONE_REPAIR_WORKFLOW.map((w) => (
                      <li key={w.step} className="flex items-start gap-2">
                        <span className="font-mono font-semibold text-[#1769AA] tabular-nums">
                          {w.step}.
                        </span>
                        <span>{w.title}</span>
                      </li>
                    ))}
                  </ol>
                </details>
              </div>
            </div>

            <div className="px-6 pb-6 pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => navigate('/services/drone-repair#repair-booking-form')}
                className="w-full py-2.5 px-4 bg-[#1769AA] hover:bg-[#125488] text-white text-sm font-semibold rounded-lg inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
              >
                <span>Book Drone Repair</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/services/drone-repair#service-desk')}
                  className="py-2 px-3 border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors"
                >
                  Contact Service Desk
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/services/drone-repair#repair-booking-form')}
                  className="py-2 px-3 border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors"
                >
                  Request Technical Inspection
                </button>
              </div>
            </div>
          </article>
        </div>

        {/* Corporate Execution Standards Strip — Zero Images */}
        <div className="rounded-2xl border border-slate-200 bg-[#F3F6FA] p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-wider text-[#1769AA] font-semibold">
              01 · Design &amp; CAD Verification
            </div>
            <h3 className="font-display font-bold text-[#102A43]">Engineering Review Before Production</h3>
            <p className="text-xs text-[#263238] leading-relaxed">
              Every CAD upload, PCB stackup or system architecture undergoes tolerance, strength and feasibility checks prior to execution.
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-wider text-[#1769AA] font-semibold">
              02 · Transparent Milestone Billing
            </div>
            <h3 className="font-display font-bold text-[#102A43]">Itemized Quotations &amp; GST Invoicing</h3>
            <p className="text-xs text-[#263238] leading-relaxed">
              Upfront slicing estimates for 3D prints, 50% + 50% project milestones and approved repair estimates managed cleanly in your account.
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-wider text-[#1769AA] font-semibold">
              03 · Nagpur Facility &amp; Field Dispatch
            </div>
            <h3 className="font-display font-bold text-[#102A43]">Workshop Precision &amp; Field Support</h3>
            <p className="text-xs text-[#263238] leading-relaxed">
              Dedicated additive manufacturing bays, electronics R&amp;D bench and agricultural UAV diagnostics hub serving pan-India clients.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export const CustomEngineeringServicePage: React.FC = () => {
  const { dbUser, apiFetch, notify, navigate, setDynamicSeo } = usePlatform();
  const [consultForm, setConsultForm] = useState({
    name: dbUser?.fullName || '',
    email: dbUser?.email || '',
    mobile: dbUser?.mobile || '',
    domain: 'Academic Engineering Projects',
    organization: dbUser?.companyOrCollege || '',
    brief: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [ticketRef, setTicketRef] = useState('');

  const projectFaqs: FaqItem[] = [
    {
      q: 'What deliverables are included upon project completion?',
      a: 'Depending on your quotation scope, handovers include the tested physical hardware prototype, 3D CAD enclosures/parts, circuit schematics or PCB Gerbers, commented source code/firmware, wiring documentation and functional demonstration walkthrough.',
    },
    {
      q: 'Do you support both college final-year engineering teams and commercial startups?',
      a: 'Yes. We maintain dedicated tracks for BE/B.Tech/M.Tech academic demonstration models as well as proprietary hardware prototypes, IoT sensor nodes and automation rigs for startups and industrial R&D clients.',
    },
    {
      q: 'How long does custom project development typically take?',
      a: 'Standard academic or embedded proof-of-concept systems take 2 to 4 weeks depending on component availability. Multi-layer custom PCBs, CNC/3D enclosures and autonomous robotics platforms are scheduled in your formal quotation.',
    },
    {
      q: 'Can you sign an NDA for proprietary industrial prototypes?',
      a: 'Yes. Industrial clients and startups can request mutual NDA protection before uploading schematics or confidential product briefs during consultation.',
    },
  ];

  useEffect(() => {
    setDynamicSeo({
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Services', url: '/services' },
        { name: 'Project Development', url: '/services/custom-engineering' },
      ],
      schemas: [
        buildServiceSchema({
          name: 'Custom Engineering Project Development & Prototyping',
          serviceType: 'Engineering Research, Development & Prototyping',
          description: PROJECT_DEVELOPMENT_DESCRIPTION,
          url: '/services/custom-engineering',
        }),
        buildFaqSchema(projectFaqs),
      ],
    });
    return () => setDynamicSeo(null);
  }, [setDynamicSeo]);

  const handleConsultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch<{ ticket: { ticketNumber: string } }>('/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: consultForm.name,
          email: consultForm.email,
          mobile: consultForm.mobile,
          subject: `Project Consultation: ${consultForm.domain}${
            consultForm.organization ? ` (${consultForm.organization})` : ''
          }`,
          serviceCategory: 'Project Development',
          message: `Domain: ${consultForm.domain}\nInstitution/Company: ${
            consultForm.organization || 'Individual / Independent'
          }\n\nRequirement Brief:\n${consultForm.brief}`,
        }),
      });
      setTicketRef(res.ticket.ticketNumber);
      notify(`Consultation ticket ${res.ticket.ticketNumber} submitted.`, 'success');
    } catch (err: any) {
      notify(err?.message || 'Unable to submit consultation request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Corporate Header — Zero Images */}
      <section className="bg-gradient-to-br from-[#102A43] via-[#133452] to-[#0D2338] text-white border-b border-[#1E3A5F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 lg:py-16 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs font-mono uppercase tracking-[0.18em] text-blue-300 font-semibold">
              02 · Engineering Research, Development &amp; Prototyping
            </div>
            <button
              type="button"
              onClick={() => navigate('/services')}
              className="text-xs font-medium text-blue-200 hover:text-white transition-colors whitespace-nowrap"
            >
              ← Back to All Services
            </button>
          </div>

          <div className="max-w-4xl space-y-4">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Project Development
            </h1>
            <p className="text-base text-slate-100 leading-relaxed max-w-3xl">
              {PROJECT_DEVELOPMENT_DESCRIPTION}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/register-project')}
              className="px-5 py-2.5 bg-white text-[#102A43] hover:bg-blue-50 text-sm font-semibold rounded-lg inline-flex items-center gap-2 whitespace-nowrap transition-colors"
            >
              <span>Register Your Project</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/services/custom-engineering#consultation-form')}
              className="px-5 py-2.5 border border-white/30 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-lg whitespace-nowrap transition-colors"
            >
              Request Consultation
            </button>
            <button
              type="button"
              onClick={() => navigate('/services/pcb-design')}
              className="px-5 py-2.5 border border-white/20 text-blue-100 hover:bg-white/10 text-sm font-semibold rounded-lg whitespace-nowrap transition-colors"
            >
              PCB Design &amp; Gerber Enquiry
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 space-y-14">
        {/* 4 Categorized Capability Groups */}
        <section className="space-y-6">
          <div className="space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-wider text-[#1769AA] font-semibold">
              Technical Domains
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#102A43]">
              Engineering Capabilities Across Four Disciplines
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROJECT_CAPABILITY_GROUPS.map((group) => (
              <div
                key={group.title}
                className="rounded-xl border border-slate-200 bg-white p-6 space-y-4 hover:border-[#1769AA]/50 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-display text-lg font-bold text-[#102A43]">{group.title}</h3>
                  <span className="font-mono text-xs font-semibold text-[#1769AA]">{group.code}</span>
                </div>
                <ul className="space-y-2 text-sm text-[#263238]">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#1769AA] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 6-Step Development Process */}
        <section className="space-y-6">
          <div className="space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-wider text-[#1769AA] font-semibold">
              Execution Methodology
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#102A43]">
              Six-Stage Development Workflow
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PROJECT_DEVELOPMENT_PROCESS.map((stage) => (
              <div key={stage.step} className="rounded-xl border border-slate-200 bg-[#F3F6FA] p-5 space-y-2">
                <div className="font-mono text-xl font-bold text-[#1769AA] tabular-nums">{stage.step}</div>
                <h3 className="font-display font-bold text-[#102A43]">{stage.title}</h3>
                <p className="text-xs text-[#263238] leading-relaxed">{stage.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quotation & Milestone Structure */}
        <section className="rounded-2xl border border-[#1E3A5F] bg-[#102A43] text-white p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-blue-300 font-semibold">
              Quotation &amp; Milestone Pricing
            </div>
            <h2 className="font-display text-2xl font-bold text-white">
              Transparent 50% Advance + 50% Final Handover Structure
            </h2>
            <p className="text-sm text-blue-100/85 leading-relaxed">
              Every project is quoted based on verified bill-of-materials cost, custom PCB/CAD fabrication hours, firmware/software complexity and testing deliverables. Development starts upon 50% advance clearance with weekly status logs inside My Account; final handover and source code release occur upon 100% completion.
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate('/register-project')}
              className="px-5 py-3 bg-white text-[#102A43] hover:bg-blue-50 text-sm font-semibold rounded-lg inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors"
            >
              <span>Submit Full Project Intake</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/services/3d-printing')}
              className="px-5 py-2.5 border border-white/25 text-white hover:bg-white/10 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors"
            >
              Explore 3D Prototyping Workbench
            </button>
          </div>
        </section>

        {/* Direct Technical Consultation Enquiry Form */}
        <section id="consultation-form" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-[#1769AA] font-semibold">
              Technical Advisory
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#102A43]">
              Request Project Consultation
            </h2>
            <p className="text-sm text-[#263238] leading-relaxed">
              Discuss component feasibility, academic project requirements, industrial automation scopes or embedded prototypes directly with our engineering desk.
            </p>
            <div className="rounded-xl border border-slate-200 bg-[#F3F6FA] p-5 space-y-3 text-xs text-[#263238]">
              <div className="font-semibold text-[#102A43]">Included in Technical Consultation:</div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1769AA] shrink-0 mt-0.5" />
                <span>Architecture &amp; controller selection (ESP32, STM32, Raspberry Pi, Jetson, Pixhawk)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1769AA] shrink-0 mt-0.5" />
                <span>Preliminary BOM cost range &amp; fabrication lead time</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1769AA] shrink-0 mt-0.5" />
                <span>Already have CAD, abstracts or synopsis PDFs? Use Full Project Registration instead.</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            {ticketRef ? (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-8 space-y-3">
                <div className="text-xs font-mono font-semibold text-[#1769AA]">CONSULTATION LOGGED</div>
                <h3 className="font-display text-xl font-bold text-[#102A43]">
                  Reference Number: {ticketRef}
                </h3>
                <p className="text-sm text-[#263238]">
                  Our engineering team has received your project consultation brief and will respond with feasibility notes and next steps.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/register-project')}
                    className="px-4 py-2 bg-[#1769AA] hover:bg-[#125488] text-white text-xs font-semibold rounded-lg whitespace-nowrap"
                  >
                    Register Full Project Specifications
                  </button>
                  <button
                    type="button"
                    onClick={() => setTicketRef('')}
                    className="px-4 py-2 border border-slate-300 bg-white text-slate-800 text-xs font-semibold rounded-lg whitespace-nowrap"
                  >
                    Submit Another Query
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConsultSubmit} className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Full Name *</label>
                    <input
                      required
                      value={consultForm.name}
                      onChange={(e) => setConsultForm({ ...consultForm, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Email Address *</label>
                    <input
                      required
                      type="email"
                      value={consultForm.email}
                      onChange={(e) => setConsultForm({ ...consultForm, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Mobile Number *</label>
                    <input
                      required
                      value={consultForm.mobile}
                      onChange={(e) => setConsultForm({ ...consultForm, mobile: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Project Domain</label>
                    <select
                      value={consultForm.domain}
                      onChange={(e) => setConsultForm({ ...consultForm, domain: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white"
                    >
                      {PROJECT_CAPABILITY_GROUPS.map((g) => (
                        <option key={g.title} value={g.title}>
                          {g.title}
                        </option>
                      ))}
                      <option value="Industrial R&D Prototype">Industrial R&amp;D Prototype</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Institution / Company Name</label>
                  <input
                    value={consultForm.organization}
                    onChange={(e) => setConsultForm({ ...consultForm, organization: e.target.value })}
                    placeholder="University, Startup, or Enterprise Name"
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Technical Requirement Brief *</label>
                  <textarea
                    required
                    rows={4}
                    value={consultForm.brief}
                    onChange={(e) => setConsultForm({ ...consultForm, brief: e.target.value })}
                    placeholder="Outline your project objective, required hardware/sensors, software or AI stack, and target deadline..."
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-[#1769AA] hover:bg-[#125488] text-white text-sm font-semibold rounded-lg inline-flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                >
                  <Send className="w-4 h-4 shrink-0" />
                  <span>{submitting ? 'Submitting Consultation...' : 'Submit Consultation Request'}</span>
                </button>
              </form>
            )}
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-5">
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-wider text-[#1769AA] font-semibold">FAQ</div>
            <h2 className="font-display text-2xl font-bold text-[#102A43]">Project Development Questions</h2>
          </div>
          <FaqAccordion items={projectFaqs} />
        </section>
      </div>
    </div>
  );
};

export const PcbServicePage: React.FC = () => {
  const { isSignedIn, dbUser, signInWithGoogle, apiFetch, notify, navigate, setDynamicSeo } = usePlatform();
  const [form, setForm] = useState({
    customerName: dbUser?.fullName || '',
    email: dbUser?.email || '',
    mobile: dbUser?.mobile || '',
    boardDimensionsMm: '',
    layerCount: 2,
    boardQuantity: 5,
    assemblyRequired: false,
    surfaceFinish: 'HASL Lead-Free',
    specialInstructions: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedCode, setSubmittedCode] = useState('');

  useEffect(() => {
    setDynamicSeo({
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Services', url: '/services' },
        { name: 'PCB Design & Fabrication', url: '/services/pcb-design' },
      ],
      schemas: [
        buildServiceSchema({
          name: 'Single & Double-Layer PCB Design, Gerber Review & Assembly',
          serviceType: 'Electronics Hardware & PCB Fabrication',
          description:
            'Custom PCB layout, Gerber DFM validation, BOM review and SMD/Through-Hole electronics assembly.',
          url: '/services/pcb-design',
        }),
      ],
    });
    return () => setDynamicSeo(null);
  }, [setDynamicSeo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      await signInWithGoogle();
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      files.forEach((f) => fd.append('attachments', f));

      const res = await apiFetch<{ enquiry: { enquiryNumber: string } }>('/api/pcb-enquiries', {
        method: 'POST',
        body: fd,
      });
      setSubmittedCode(res.enquiry.enquiryNumber);
      notify(`PCB enquiry ${res.enquiry.enquiryNumber} submitted for engineering quotation.`, 'success');
    } catch (err: any) {
      notify(err?.message || 'Failed to submit PCB enquiry.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      <section className="bg-gradient-to-br from-[#102A43] via-[#133452] to-[#0D2338] text-white border-b border-[#1E3A5F]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs font-mono uppercase tracking-[0.18em] text-blue-300 font-semibold">
              Electronics &amp; Embedded Hardware · PCB Fabrication
            </div>
            <button
              type="button"
              onClick={() => navigate('/services/custom-engineering')}
              className="text-xs font-medium text-blue-200 hover:text-white transition-colors whitespace-nowrap"
            >
              ← Back to Project Development
            </button>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white max-w-3xl">
            Custom PCB Design, Gerber Review &amp; Assembly
          </h1>
          <p className="text-blue-100/85 text-sm sm:text-base leading-relaxed max-w-3xl">
            Submit your circuit diagrams, schematics, Gerber archives and Bill of Materials (BOM). Our hardware engineers validate DFM tolerances and issue an itemized quotation and payment link directly in your account.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-10">
        {submittedCode ? (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-8 space-y-3">
            <h2 className="font-display text-xl font-bold text-[#102A43]">
              PCB Enquiry Submitted — {submittedCode}
            </h2>
            <p className="text-sm text-[#263238]">
              Our engineers are reviewing your files and specifications. Once quoted, you can pay directly from your Account Dashboard.
            </p>
            <button
              onClick={() => navigate('/my-account')}
              className="px-4 py-2 bg-[#1769AA] hover:bg-[#125488] text-white text-xs font-semibold rounded-lg whitespace-nowrap"
            >
              View in My Account
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-200 pb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-xl font-bold text-[#102A43]">Request PCB Quotation</h2>
                <p className="text-xs text-slate-500">Upload Gerber (.zip/.gbr), schematics (.pdf), or BOM (.csv/.xlsx)</p>
              </div>
              {!isSignedIn && (
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="px-4 py-2 bg-[#102A43] text-white text-xs font-semibold rounded-lg whitespace-nowrap"
                >
                  Sign In to Submit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <input
                required
                placeholder="Full Name *"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
              />
              <input
                required
                type="email"
                placeholder="Email Address *"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
              />
              <input
                required
                placeholder="Mobile Number *"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Board Dimensions (mm) *</label>
                <input
                  required
                  placeholder="e.g. 100 x 80"
                  value={form.boardDimensionsMm}
                  onChange={(e) => setForm({ ...form, boardDimensionsMm: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Layer Count</label>
                <select
                  value={form.layerCount}
                  onChange={(e) => setForm({ ...form, layerCount: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white"
                >
                  {[1, 2, 4, 6, 8].map((l) => (
                    <option key={l} value={l}>{l} Layers</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Board Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={form.boardQuantity}
                  onChange={(e) => setForm({ ...form, boardQuantity: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Surface Finish</label>
                <select
                  value={form.surfaceFinish}
                  onChange={(e) => setForm({ ...form, surfaceFinish: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white"
                >
                  <option value="HASL Lead-Free">HASL Lead-Free</option>
                  <option value="ENIG Gold">ENIG Gold</option>
                  <option value="OSP">OSP</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.assemblyRequired}
                onChange={(e) => setForm({ ...form, assemblyRequired: e.target.checked })}
                className="rounded border-slate-300"
              />
              Include SMD / Through-Hole Component Assembly (PCBA)
            </label>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Upload Gerber / Schematics / BOM / Diagrams
              </label>
              <label className="flex items-center justify-center gap-2 border border-dashed border-slate-300 rounded-lg p-5 cursor-pointer hover:bg-slate-50 text-sm text-slate-600">
                <Upload className="w-4 h-4 text-[#1769AA]" />
                <span>{files.length > 0 ? `${files.length} file(s) selected` : 'Select files (.zip, .gbr, .pdf, .csv, .xlsx)'}</span>
                <input
                  type="file"
                  multiple
                  accept=".zip,.rar,.gbr,.gerber,.pdf,.csv,.xlsx,.png,.jpg,.jpeg"
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              rows={4}
              placeholder="Special instructions, impedance requirements, copper weight, or design scope..."
              value={form.specialInstructions}
              onChange={(e) => setForm({ ...form, specialInstructions: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
            />

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-[#1769AA] hover:bg-[#125488] text-white text-sm font-semibold rounded-lg disabled:opacity-50 whitespace-nowrap"
            >
              {submitting ? 'Submitting...' : isSignedIn ? 'Submit PCB Quotation Request' : 'Sign In & Submit Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export const DroneRepairServicePage: React.FC = () => {
  const { isSignedIn, dbUser, signInWithGoogle, apiFetch, notify, navigate, setDynamicSeo } = usePlatform();
  const [form, setForm] = useState({
    serviceMode: 'service_centre' as 'service_centre' | 'field_visit',
    customerName: dbUser?.fullName || '',
    mobile: dbUser?.mobile || '',
    email: dbUser?.email || '',
    address: '',
    city: '',
    district: '',
    pinCode: '',
    droneBrandModel: '',
    droneType: 'Agriculture',
    problemDescription: '',
    preferredDate: '',
    preferredTime: 'Morning (10 AM - 1 PM)',
    additionalInfo: '',
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState('');

  // Quick Service Desk Enquiry state (works without file upload)
  const [deskForm, setDeskForm] = useState({
    name: dbUser?.fullName || '',
    email: dbUser?.email || '',
    mobile: dbUser?.mobile || '',
    message: '',
  });
  const [deskBusy, setDeskBusy] = useState(false);
  const [deskTicket, setDeskTicket] = useState('');

  const droneRepairFaqs: FaqItem[] = [
    {
      q: 'Do you repair agricultural drones from other manufacturers alongside KRASHIVANTRI platforms?',
      a: 'Yes. Our workshop services multirotor agricultural spraying platforms, survey/mapping UAVs and custom commercial airframes across carbon boom structural rebuilds, ESC/motor swaps, flight controller tuning, RTK GPS and spray pumps.',
    },
    {
      q: 'When is a Mobile Field Engineer Visit recommended versus Nagpur Service Centre drop-off?',
      a: 'Calibration issues, spray pump maintenance, telemetry linking and minor boom or motor swaps can often be resolved via Mobile Field Engineer visit. Severe crash rebuilds, full frame alignment and harness overhauls are best completed at our Nagpur Service Centre bench.',
    },
    {
      q: 'How are spare parts and repair charges approved?',
      a: 'Following pre-repair technical inspection, our team posts an itemized estimate to your My Account dashboard. No component replacement or repair billing proceeds until you review and approve the quotation.',
    },
    {
      q: 'Do repaired aircraft undergo test flights prior to return?',
      a: 'Yes. Every serviced UAV undergoes bench motor balance verification, radio failsafe testing, PID/IMU/compass calibration and controlled hover & load testing before handover.',
    },
  ];

  useEffect(() => {
    setDynamicSeo({
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: 'Services', url: '/services' },
        { name: 'Drone Repair & Diagnostics', url: '/services/drone-repair' },
      ],
      schemas: [
        buildServiceSchema({
          name: 'Agricultural & Commercial Drone Repair & Diagnostics Service',
          serviceType: 'UAV Maintenance, Repair & Technical Support',
          description: DRONE_REPAIR_DESCRIPTION,
          url: '/services/drone-repair',
        }),
        buildFaqSchema(droneRepairFaqs),
      ],
    });
    return () => setDynamicSeo(null);
  }, [setDynamicSeo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      await signInWithGoogle();
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      photos.forEach((f) => fd.append('photos', f));
      if (video) fd.append('video', video);

      const res = await apiFetch<{ booking: { referenceNumber: string } }>('/api/drone-repairs', {
        method: 'POST',
        body: fd,
      });
      setSubmittedRef(res.booking.referenceNumber);
      notify(`Drone repair booking ${res.booking.referenceNumber} logged.`, 'success');
    } catch (err: any) {
      notify(err?.message || 'Failed to submit drone repair booking.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeskBusy(true);
    try {
      const res = await apiFetch<{ ticket: { ticketNumber: string } }>('/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          name: deskForm.name,
          email: deskForm.email,
          mobile: deskForm.mobile,
          subject: 'UAV Service Desk Technical Enquiry',
          serviceCategory: 'Drone Repair & Diagnostics',
          message: deskForm.message,
        }),
      });
      setDeskTicket(res.ticket.ticketNumber);
      notify(`Service desk enquiry ${res.ticket.ticketNumber} submitted.`, 'success');
    } catch (err: any) {
      notify(err?.message || 'Unable to submit service desk enquiry.', 'error');
    } finally {
      setDeskBusy(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Corporate Header — Zero Images */}
      <section className="bg-gradient-to-br from-[#102A43] via-[#133452] to-[#0D2338] text-white border-b border-[#1E3A5F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 lg:py-16 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-xs font-mono uppercase tracking-[0.18em] text-blue-300 font-semibold">
              03 · UAV Maintenance, Repair &amp; Technical Support
            </div>
            <button
              type="button"
              onClick={() => navigate('/services')}
              className="text-xs font-medium text-blue-200 hover:text-white transition-colors whitespace-nowrap"
            >
              ← Back to All Services
            </button>
          </div>

          <div className="max-w-4xl space-y-4">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Drone Repair &amp; Diagnostics Service
            </h1>
            <p className="text-base text-slate-100 leading-relaxed max-w-3xl">
              {DRONE_REPAIR_DESCRIPTION}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('/services/drone-repair#repair-booking-form')}
              className="px-5 py-2.5 bg-white text-[#102A43] hover:bg-blue-50 text-sm font-semibold rounded-lg inline-flex items-center gap-2 whitespace-nowrap transition-colors"
            >
              <span>Book Drone Repair</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/services/drone-repair#service-desk')}
              className="px-5 py-2.5 border border-white/30 bg-white/10 hover:bg-white/15 text-white text-sm font-semibold rounded-lg whitespace-nowrap transition-colors"
            >
              Contact Service Desk
            </button>
            <button
              type="button"
              onClick={() => navigate('/services/drone-repair#repair-booking-form')}
              className="px-5 py-2.5 border border-white/20 text-blue-100 hover:bg-white/10 text-sm font-semibold rounded-lg whitespace-nowrap transition-colors"
            >
              Request Technical Inspection
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 space-y-14">
        {/* 14-Item Diagnostics & Repair Coverage */}
        <section className="space-y-6">
          <div className="space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-wider text-[#1769AA] font-semibold">
              Workshop &amp; Field Scope
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#102A43]">
              Complete UAV Maintenance &amp; Diagnostics Coverage
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {DRONE_REPAIR_COVERAGE.map((item) => (
              <div
                key={item}
                className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-[#F3F6FA] px-4 py-3 text-sm font-medium text-[#102A43]"
              >
                <CheckCircle2 className="w-4 h-4 text-[#1769AA] shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 8-Step Customer Service Workflow */}
        <section className="space-y-6">
          <div className="space-y-1.5">
            <div className="text-xs font-mono uppercase tracking-wider text-[#1769AA] font-semibold">
              Service Protocol
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#102A43]">
              Eight-Step Inspection, Repair &amp; Verification Workflow
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DRONE_REPAIR_WORKFLOW.map((step) => (
              <div key={step.step} className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
                <div className="font-mono text-lg font-bold text-[#1769AA] tabular-nums">{step.step}</div>
                <h3 className="font-display text-sm font-bold text-[#102A43]">{step.title}</h3>
                <p className="text-xs text-[#263238] leading-relaxed">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Inspection & Repair Quotation Info */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-2xl border border-slate-200 bg-[#F3F6FA] p-6 sm:p-8">
          <div className="space-y-1.5">
            <div className="text-xs font-mono font-semibold text-[#1769AA]">PRE-REPAIR INSPECTION</div>
            <h3 className="font-display font-bold text-[#102A43]">Bench or On-Site Triage</h3>
            <p className="text-xs text-[#263238] leading-relaxed">
              Standard workshop diagnostics check propulsion, ESC synchronization, flight controller IMU/compass health, wiring continuity and pump load prior to repair approval.
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="text-xs font-mono font-semibold text-[#1769AA]">ITEMIZED REPAIR ESTIMATE</div>
            <h3 className="font-display font-bold text-[#102A43]">Transparent Spares &amp; Labour</h3>
            <p className="text-xs text-[#263238] leading-relaxed">
              No unplanned replacements. Our engineers issue a clear component + labour quotation in My Account so you approve charges before work begins.
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="text-xs font-mono font-semibold text-[#1769AA]">POST-REPAIR VERIFICATION</div>
            <h3 className="font-display font-bold text-[#102A43]">Hover &amp; Load Sign-Off</h3>
            <p className="text-xs text-[#263238] leading-relaxed">
              Every agricultural or commercial UAV undergoes PID tuning verification, telemetry range test and loaded hover stabilization before release.
            </p>
          </div>
        </section>

        {/* Booking Form (#repair-booking-form) */}
        <section id="repair-booking-form" className="space-y-4">
          {submittedRef ? (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-8 space-y-3">
              <h2 className="font-display text-xl font-bold text-[#102A43]">
                Repair Booking Confirmed — {submittedRef}
              </h2>
              <p className="text-sm text-[#263238]">
                Your UAV diagnostics booking has been queued for our Nagpur engineering team. Track technician assignment and quotes from your account.
              </p>
              <button
                onClick={() => navigate('/my-account')}
                className="px-4 py-2 bg-[#1769AA] hover:bg-[#125488] text-white text-xs font-semibold rounded-lg whitespace-nowrap"
              >
                View Repair Status in My Account
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-200 pb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl font-bold text-[#102A43]">
                    Book Drone Repair or Technical Inspection
                  </h2>
                  <p className="text-xs text-slate-500">
                    Upload clear photos/video of structural damage, wiring faults or flight controller errors
                  </p>
                </div>
                {!isSignedIn && (
                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    className="px-4 py-2 bg-[#1769AA] hover:bg-[#125488] text-white text-xs font-semibold rounded-lg whitespace-nowrap"
                  >
                    Sign In to Book Repair
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  ['service_centre', 'Nagpur Service Centre Drop-off / Courier', 'Send or bring UAV to our Ganjipeth, Nagpur workshop'],
                  ['field_visit', 'Mobile Field Engineer Visit', 'Request engineer dispatch for farm or commercial fleet UAVs'],
                ].map(([mode, title, desc]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setForm({ ...form, serviceMode: mode as 'service_centre' | 'field_visit' })}
                    className={`text-left rounded-xl border p-4 transition-colors ${
                      form.serviceMode === mode ? 'border-[#1769AA] bg-blue-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-semibold text-sm text-[#102A43]">{title}</div>
                    <div className="text-xs text-slate-600 mt-0.5">{desc}</div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  required
                  placeholder="Customer Name *"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
                />
                <input
                  required
                  placeholder="Mobile Number *"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                  className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <input
                  required
                  placeholder="Drone Brand / Model *"
                  value={form.droneBrandModel}
                  onChange={(e) => setForm({ ...form, droneBrandModel: e.target.value })}
                  className="sm:col-span-2 rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
                />
                <select
                  value={form.droneType}
                  onChange={(e) => setForm({ ...form, droneType: e.target.value })}
                  className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm bg-white"
                >
                  <option value="Agriculture">Agricultural Spraying Drone</option>
                  <option value="Survey / Mapping">Mapping / Survey UAV</option>
                  <option value="FPV / Custom">Custom / FPV Multirotor</option>
                  <option value="Industrial">Industrial Inspection UAV</option>
                </select>
                <input
                  type="date"
                  value={form.preferredDate}
                  onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                  className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <input
                  placeholder="Address / Farm Location"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="sm:col-span-2 rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
                />
                <input
                  placeholder="City / District"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value, district: e.target.value })}
                  className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
                />
                <input
                  placeholder="PIN Code"
                  value={form.pinCode}
                  onChange={(e) => setForm({ ...form, pinCode: e.target.value })}
                  className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm font-mono"
                />
              </div>

              <textarea
                required
                rows={4}
                placeholder="Describe fault symptoms, crash damage, carbon boom cracks, flight controller errors, pump/nozzle or ESC issues *"
                value={form.problemDescription}
                onChange={(e) => setForm({ ...form, problemDescription: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center justify-center gap-2 border border-dashed border-slate-300 rounded-lg p-4 cursor-pointer hover:bg-slate-50 text-xs text-slate-600">
                  <Upload className="w-4 h-4 text-[#1769AA]" />
                  <span>{photos.length > 0 ? `${photos.length} photo(s) selected` : 'Upload Damage Photos (max 5)'}</span>
                  <input
                    type="file"
                    multiple
                    accept=".png,.jpg,.jpeg,.webp"
                    onChange={(e) => setPhotos(Array.from(e.target.files || []))}
                    className="hidden"
                  />
                </label>
                <label className="flex items-center justify-center gap-2 border border-dashed border-slate-300 rounded-lg p-4 cursor-pointer hover:bg-slate-50 text-xs text-slate-600">
                  <Upload className="w-4 h-4 text-[#1769AA]" />
                  <span>{video ? video.name : 'Upload Diagnostic Video (optional)'}</span>
                  <input
                    type="file"
                    accept=".mp4,.mov"
                    onChange={(e) => setVideo(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-[#1769AA] hover:bg-[#125488] text-white text-sm font-semibold rounded-lg disabled:opacity-50 whitespace-nowrap"
              >
                {submitting ? 'Submitting Booking...' : isSignedIn ? 'Submit Drone Repair Request' : 'Sign In & Submit Request'}
              </button>
            </form>
          )}
        </section>

        {/* Service Desk Direct Contact (#service-desk) */}
        <section id="service-desk" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-[#F3F6FA] p-6 space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-[#1769AA] font-semibold">
              Nagpur Service Centre Desk
            </div>
            <h2 className="font-display text-xl font-bold text-[#102A43]">
              Direct UAV Technical Desk
            </h2>
            <div className="space-y-3 text-sm text-[#263238]">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#1769AA] shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-[#102A43]">Workshop Address</div>
                  <div className="text-xs text-slate-600">
                    NexusTekFusion Private Limited, Ganjipeth, Nagpur, Maharashtra — 440018
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#1769AA] shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-[#102A43]">Diagnostics Hours</div>
                  <div className="text-xs text-slate-600">Monday – Saturday · 10:00 AM to 6:30 PM IST</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#1769AA] shrink-0 mt-1" />
                <div>
                  <div className="font-semibold text-[#102A43]">Fleet &amp; Field Dispatch</div>
                  <div className="text-xs text-slate-600">
                    Supporting Vidarbha &amp; pan-Maharashtra agricultural drone operators with mobile field technician visits.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            {deskTicket ? (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 space-y-2">
                <div className="text-xs font-mono font-semibold text-[#1769AA]">SERVICE DESK TICKET OPENED</div>
                <div className="font-display text-lg font-bold text-[#102A43]">Reference: {deskTicket}</div>
                <p className="text-xs text-[#263238]">
                  Our Nagpur UAV support desk has logged your query and will reach out promptly.
                </p>
                <button
                  type="button"
                  onClick={() => setDeskTicket('')}
                  className="px-4 py-2 border border-slate-300 bg-white text-xs font-semibold rounded-lg"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleDeskSubmit} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-[#102A43]">Contact Service Desk</h3>
                  <p className="text-xs text-slate-500">Need quick spare availability or diagnostics guidance before booking?</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    required
                    placeholder="Full Name *"
                    value={deskForm.name}
                    onChange={(e) => setDeskForm({ ...deskForm, name: e.target.value })}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Email Address *"
                    value={deskForm.email}
                    onChange={(e) => setDeskForm({ ...deskForm, email: e.target.value })}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                  <input
                    required
                    placeholder="Mobile Number *"
                    value={deskForm.mobile}
                    onChange={(e) => setDeskForm({ ...deskForm, mobile: e.target.value })}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <textarea
                  required
                  rows={3}
                  placeholder="Ask about component stock, calibration scheduling, or fleet AMC support..."
                  value={deskForm.message}
                  onChange={(e) => setDeskForm({ ...deskForm, message: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <button
                  type="submit"
                  disabled={deskBusy}
                  className="px-5 py-2.5 bg-[#102A43] hover:bg-[#0A1929] text-white text-xs font-semibold rounded-lg inline-flex items-center gap-2 disabled:opacity-50 whitespace-nowrap"
                >
                  <Send className="w-3.5 h-3.5 shrink-0" />
                  <span>{deskBusy ? 'Sending...' : 'Send to Service Desk'}</span>
                </button>
              </form>
            )}
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-5">
          <div className="space-y-1">
            <div className="text-xs font-mono uppercase tracking-wider text-[#1769AA] font-semibold">FAQ</div>
            <h2 className="font-display text-2xl font-bold text-[#102A43]">Drone Repair &amp; Diagnostics Questions</h2>
          </div>
          <FaqAccordion items={droneRepairFaqs} />
        </section>
      </div>
    </div>
  );
};
